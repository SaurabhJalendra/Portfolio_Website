// Assistant client — the SSE consumer that talks to /api/chat.
//
// Both the desktop assistant (components/ide/Assistant.tsx) and the mobile
// AskSheet (components/ide/Mobile.tsx) call `chat()` here, so the wire
// protocol + citation handling live in exactly one place.
//
// Wire protocol (set by app/api/chat/route.ts):
//   data: {"token":"..."}   — one per content delta, append to the answer
//   data: {"done":true}     — stream finished cleanly
//   data: {"error":"..."}   — stream broke mid-flight
//
// The model is told to cite corpus files as [^filename] (see SYSTEM_PROMPT
// in the route). Corpus files live in content/assistant-wiki/ and are NOT
// part of the IDE file tree — so a citation chip can't always "open" a
// file. CORPUS_TO_TREE below maps each corpus file that has a real tree
// counterpart to that tree path; chips for mapped files open the project
// tab, chips for unmapped files render as plain styled references.

// ── Corpus-file → IDE-tree-file mapping ──────────────────────────────
// Keys: filenames in content/assistant-wiki/ (24 total).
// Values: the path in the IDE file tree (lib/data.ts) to open when the
//         citation chip is clicked, or null when no tree file maps.
export const CORPUS_TO_TREE: Record<string, string | null> = {
  // Identity / context files — no single tree file; surface about.md.
  '00-bio.md': 'about.md',
  '01-availability.md': 'contact.yaml',
  '02-tagline.md': 'about.md',
  '03-current-focus.md': 'now.md',
  '04-philosophy.md': 'about.md',
  // Experience / roles — closest tree file is experience.json.
  '10-sky-ai-cofounder.md': 'experience.json',
  '11-family-business-director.md': 'experience.json',
  '12-isro-project-intern.md': 'experience.json',
  '13-education.md': 'about.md',
  // Primary projects — map to the matching projects/* tab.
  '20-project-quantum-rl.md': 'projects/quantum-enhanced-simulation-learning.md',
  '21-project-simulating-anything.md': 'projects/simulating-anything.md',
  '22-project-trading-agent.md': 'projects/ai-trading-agent.md',
  '23-project-haze.md': 'projects/haze-benchmark.md',
  '24-project-klares.md': 'projects/klares-fila.md',
  '25-project-international-citizen.md': 'projects/klares-fila.md',
  '26-project-prism-skindb.md': 'projects/prism-skindb.md',
  '27-project-quant-agent.md': 'projects/quant-agent.md',
  '28-project-personal-agents.md': 'projects/personal-agents.md',
  '29-projects-side.md': 'projects/side/multimodal-gravitational-lensing.md',
  // Misc — no clean tree counterpart.
  '30-collaborators.md': null,
  '31-personal-interests.md': null,
  '32-target-roles.md': 'contact.yaml',
  '90-ask-saurabh-directly.md': 'contact.yaml',
  '91-honesty-stance.md': 'about.md',
};

/** Resolve a corpus filename to the IDE tree path to open, or null if the
 *  chip should be a non-clickable styled reference. Unknown filenames
 *  (model hallucinated a citation) also return null. */
export function corpusFileToTreePath(filename: string): string | null {
  return CORPUS_TO_TREE[filename] ?? null;
}

// ── Chat call ────────────────────────────────────────────────────────
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatExtras {
  /** Tree paths to render as source chips, de-duplicated, in first-seen
   *  order. Only corpus files that map to a real tree file appear here. */
  citations: string[];
}

export interface ChatHandlers {
  /** Called for every token delta. `chunk` is raw model text (may contain
   *  [^filename] markers — the UI strips/renders them). */
  onChunk: (chunk: string) => void;
  /** Called once when the stream ends (cleanly, on error, or on cancel). */
  onDone: (extras: ChatExtras) => void;
  /** Optional — called with a user-facing message when the request fails
   *  before/instead of streaming any tokens. */
  onError?: (message: string) => void;
}

/** Extract [^filename] citation markers from a finished answer and resolve
 *  them to IDE tree paths. Returns de-duplicated tree paths in first-seen
 *  order, capped at 3 (matching the system-prompt instruction). */
export function extractCitations(answer: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\[\^([^\]]+?)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) {
    const tree = corpusFileToTreePath(m[1].trim());
    if (tree && !seen.has(tree)) {
      seen.add(tree);
      out.push(tree);
      if (out.length >= 3) break;
    }
  }
  return out;
}

/**
 * Stream an answer from /api/chat.
 *
 * Mirrors the interface the mock `chat()` already exposed:
 *   chat(question, history, { onChunk, onDone, onError }) → cancel fn
 *
 * The returned function aborts the in-flight request; `onDone` still fires
 * so the UI can settle the streaming message.
 */
export function chat(
  question: string,
  history: ChatTurn[],
  handlers: ChatHandlers
): () => void {
  const { onChunk, onDone, onError } = handlers;
  const controller = new AbortController();
  let answer = ''; // accumulated, for citation extraction
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    onDone({ citations: extractCitations(answer) });
  };

  (async () => {
    let res: Response;
    try {
      res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, history }),
        signal: controller.signal,
      });
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return finish();
      onError?.('Could not reach the assistant. Check your connection and try again.');
      return finish();
    }

    // Non-2xx → surface a friendly, status-specific message.
    if (!res.ok) {
      let msg = 'The assistant ran into a problem. Please try again.';
      try {
        const body = await res.json();
        if (body?.error === 'rate_limited') {
          const secs = Number(body.retryAfter) || 60;
          const wait = secs >= 120 ? `${Math.ceil(secs / 60)} minutes` : `${secs} seconds`;
          msg = `You've sent a lot of questions — give it about ${wait} and try again.`;
        } else if (body?.error === 'config') {
          msg = 'The assistant isn’t configured yet. Try again later, or email Saurabh directly.';
        } else if (body?.error === 'upstream') {
          msg = 'The assistant backend is temporarily unavailable. Please try again in a moment.';
        } else if (body?.message) {
          msg = String(body.message);
        }
      } catch {
        /* keep the generic message */
      }
      onError?.(msg);
      return finish();
    }

    if (!res.body) {
      onError?.('The assistant returned an empty response.');
      return finish();
    }

    // Consume our SSE: data: {token|done|error} events, blank-line framed.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const evt of events) {
          for (const line of evt.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (!data) continue;
            let obj: { token?: string; done?: boolean; error?: string };
            try {
              obj = JSON.parse(data);
            } catch {
              continue;
            }
            if (typeof obj.token === 'string') {
              answer += obj.token;
              onChunk(obj.token);
            } else if (obj.error) {
              // Mid-stream break — if nothing streamed yet, surface it.
              if (answer.length === 0) {
                onError?.('The assistant was interrupted. Please try again.');
              }
              return finish();
            } else if (obj.done) {
              return finish();
            }
          }
        }
      }
      finish();
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return finish();
      if (answer.length === 0) {
        onError?.('The assistant connection dropped. Please try again.');
      }
      finish();
    }
  })();

  return () => {
    controller.abort();
    finish();
  };
}
