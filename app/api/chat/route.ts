// POST /api/chat — the portfolio AI assistant ("SaurabhBot").
//
// Approach: "wiki LLM". The entire knowledge corpus (~20K tokens, built
// from content/assistant-wiki/*.md by scripts/build-corpus.mjs) is passed
// in the system prompt every query. No embeddings, no vector DB, no
// retrieval — the corpus is small enough that this is simpler and, with
// Anthropic prompt caching, cheap (the corpus block is cached; repeat
// queries pay ~10% of the input cost on it).
//
// Backend: OpenRouter → anthropic/claude-haiku-4-5, streamed via SSE.
//
// Runtime: Edge. The only server-side import is the generated corpus
// string + this file's logic — no Node built-ins, no fs at request time
// (the corpus is baked into the bundle at build). Edge gives lower cold
// start and global distribution. If a future change needs a Node-only
// dependency here, switch `runtime` to 'nodejs'.

import { ASSISTANT_CORPUS, CORPUS_FILE_LIST } from '@/lib/corpus.generated';

export const runtime = 'edge';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-haiku-4-5';

// ── System prompt ────────────────────────────────────────────────────
// Note: the corpus is NOT concatenated into this string. It's sent as a
// separate content block on the system message so `cache_control` can be
// applied to just the (large, stable) corpus block.
const SYSTEM_PROMPT = `You are SaurabhBot, an AI assistant on Saurabh Jalendra's portfolio website.
You answer visitor questions about Saurabh based ONLY on the knowledge base provided below.

Rules:
1. Answer ONLY from the provided knowledge base. If the answer is not in it, say:
   "I don't have specifics on that — best to ask Saurabh directly at saurabhjalendra@gmail.com."
   Do NOT speculate, generalize, or invent facts, numbers, dates, or projects.
2. Cite source files when relevant using [^filename] format — e.g. [^24-project-klares.md].
   Cite at most 3 files per answer. Only cite files that actually exist in the knowledge base.
3. Keep answers SHORT: 2-4 sentences for factual questions, one short paragraph max for "explain X".
   Visitors are scanning, not reading essays.
4. Speak in third person about Saurabh ("Saurabh built...", "His dissertation...").
5. NEVER invent metrics, dates, or claims. If a specific number isn't in the knowledge base, say so.
6. For salary/equity specifics, NDA-protected work details, or personal/family topics, deflect politely:
   "That's best discussed with Saurabh directly."
7. Be warm and concise. You represent Saurabh — professional, honest, a little dry-humored is fine.

KNOWLEDGE BASE:`;

// ── Rate limiting ────────────────────────────────────────────────────
// In-memory sliding-window limiter, keyed by client IP.
//
// CAVEAT: this Map lives in the Edge isolate's memory. It resets on every
// cold start, and Edge may run multiple isolates per region — so the
// effective limit is "soft" (a determined caller across cold starts could
// exceed it). This is acceptable for v1: the HARD backstop is the $10
// spending cap configured on the OpenRouter key. The in-memory limiter
// exists to stop casual abuse and accidental loops, not as a security
// boundary. A durable limiter (Upstash/KV) is the upgrade path if needed.
const RATE_LIMIT_PER_MIN = 20;
const RATE_LIMIT_PER_DAY = 100;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

interface IpRecord {
  minute: number[]; // request timestamps within the trailing minute
  day: number[]; // request timestamps within the trailing day
}
const rateMap = new Map<string, IpRecord>();

/**
 * Records a request for `ip` and reports whether it is within limits.
 * Returns { ok } on success, or { ok: false, retryAfter } when limited.
 */
function checkRateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  let rec = rateMap.get(ip);
  if (!rec) {
    rec = { minute: [], day: [] };
    rateMap.set(ip, rec);
  }
  // Drop timestamps outside their windows.
  rec.minute = rec.minute.filter((t) => now - t < MINUTE_MS);
  rec.day = rec.day.filter((t) => now - t < DAY_MS);

  if (rec.day.length >= RATE_LIMIT_PER_DAY) {
    const oldest = rec.day[0];
    return { ok: false, retryAfter: Math.ceil((DAY_MS - (now - oldest)) / 1000) };
  }
  if (rec.minute.length >= RATE_LIMIT_PER_MIN) {
    const oldest = rec.minute[0];
    return { ok: false, retryAfter: Math.ceil((MINUTE_MS - (now - oldest)) / 1000) };
  }

  rec.minute.push(now);
  rec.day.push(now);

  // Opportunistic cleanup so the Map doesn't grow unbounded across an
  // isolate's lifetime.
  if (rateMap.size > 5000) {
    for (const [k, v] of rateMap) {
      if (v.day.every((t) => now - t >= DAY_MS)) rateMap.delete(k);
    }
  }
  return { ok: true };
}

function clientIp(req: Request): string {
  // Vercel sets x-forwarded-for; first hop is the real client.
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

// ── Response helpers ─────────────────────────────────────────────────
function jsonError(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// ── POST handler ─────────────────────────────────────────────────────
export async function POST(req: Request): Promise<Response> {
  // 1. Config check — fail clearly if the key is missing.
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError(500, { error: 'config', message: 'Assistant not configured' });
  }

  // 2. Rate limit.
  const ip = clientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: 'rate_limited', retryAfter: rl.retryAfter }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': String(rl.retryAfter),
        },
      }
    );
  }

  // 3. Parse + validate the request body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, { error: 'bad_request', message: 'Invalid JSON body' });
  }
  const { question, history } = (body || {}) as {
    question?: unknown;
    history?: unknown;
  };
  if (typeof question !== 'string' || question.trim().length === 0) {
    return jsonError(400, { error: 'bad_request', message: 'Missing "question"' });
  }
  if (question.length > 2000) {
    return jsonError(400, { error: 'bad_request', message: 'Question too long' });
  }

  // Sanitize history: keep only well-formed {role, content} turns, cap to
  // the last 10 to bound the prompt size.
  const safeHistory: { role: 'user' | 'assistant'; content: string }[] = [];
  if (Array.isArray(history)) {
    for (const turn of history.slice(-10)) {
      if (
        turn &&
        typeof turn === 'object' &&
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.content === 'string' &&
        turn.content.trim().length > 0
      ) {
        safeHistory.push({ role: turn.role, content: turn.content.slice(0, 4000) });
      }
    }
  }

  // 4. Build the messages array.
  //
  // The system message carries two content blocks:
  //   [0] the instructions (small, changes never — but not worth caching)
  //   [1] the corpus (large, stable) — marked cacheable. OpenRouter passes
  //       `cache_control` straight through to Anthropic, so repeat queries
  //       hit the prompt cache and pay ~10% on the corpus input tokens.
  const messages = [
    {
      role: 'system',
      content: [
        { type: 'text', text: SYSTEM_PROMPT },
        {
          type: 'text',
          text: ASSISTANT_CORPUS,
          cache_control: { type: 'ephemeral' },
        },
      ],
    },
    ...safeHistory,
    { role: 'user', content: question },
  ];

  // 5. Call OpenRouter (streaming).
  let upstream: Response;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://saurabhjalendra.com',
        'X-Title': 'SaurabhBot',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        temperature: 0.3, // grounded, low-creativity
        max_tokens: 800,
      }),
    });
  } catch {
    return jsonError(502, {
      error: 'upstream',
      message: 'Assistant backend temporarily unavailable',
    });
  }

  if (!upstream.ok || !upstream.body) {
    return jsonError(502, {
      error: 'upstream',
      message: 'Assistant backend temporarily unavailable',
    });
  }

  // 6. Transform OpenRouter's SSE stream into a clean token stream.
  //
  // OpenRouter emits OpenAI-style SSE: lines like
  //   data: {"choices":[{"delta":{"content":"..."}}]}
  //   data: [DONE]
  // plus occasional `: OPENROUTER PROCESSING` keep-alive comments.
  //
  // We re-emit our own simple SSE the client consumes:
  //   data: {"token":"..."}     — one per content delta
  //   data: {"done":true}       — terminal
  //   data: {"error":"..."}     — if the upstream stream breaks mid-flight
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = '';

      const emit = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by a blank line; process complete
          // events and keep any partial tail in the buffer.
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const evt of events) {
            for (const rawLine of evt.split('\n')) {
              const line = rawLine.trimEnd();
              if (!line.startsWith('data:')) continue; // skip `:` comments
              const data = line.slice(5).trim();
              if (data === '[DONE]') {
                emit({ done: true });
                controller.close();
                return;
              }
              if (!data) continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed?.choices?.[0]?.delta?.content;
                if (typeof delta === 'string' && delta.length > 0) {
                  emit({ token: delta });
                }
                // A finish_reason without [DONE] also ends the stream.
                const finish = parsed?.choices?.[0]?.finish_reason;
                if (finish) {
                  emit({ done: true });
                  controller.close();
                  return;
                }
              } catch {
                // Ignore unparseable data lines (keep-alives, partials).
              }
            }
          }
        }
        // Stream ended without an explicit [DONE].
        emit({ done: true });
        controller.close();
      } catch {
        emit({ error: 'stream_interrupted' });
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  void CORPUS_FILE_LIST; // imported for type/citation parity; not used here.

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
