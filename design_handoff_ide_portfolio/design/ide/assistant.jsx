// Assistant panel — Copilot Chat–style. Lives in its own column on the right
// of the editor pane. Streams answers with citations to the repo's "files".
//
// The mock backend is the function `mockChat` near the bottom — it's
// keyword-routed canned answers so the panel feels alive in this design
// prototype. Replace `chat()` with a real fetch to your OpenRouter-backed
// API route when wiring this up; the rest of the component doesn't change.

const { useState: useStateAs, useEffect: useEffectAs, useRef: useRefAs, useContext: useCtxAs } = React;

// ── Public component ────────────────────────────────────────────────
function AssistantPanel({ openFile, onClose, visible }) {
  const T = useCtxAs(window.ThemeCtx);
  const [messages, setMessages] = useStateAs(() => [INTRO_MESSAGE]);
  const [input, setInput] = useStateAs('');
  const [streaming, setStreaming] = useStateAs(false);
  const cancelRef = useRefAs(null);
  const scrollRef = useRefAs(null);
  const inputRef = useRefAs(null);

  // Auto-scroll to bottom whenever the conversation grows or streams.
  useEffectAs(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffectAs(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    setInput('');
    setMessages(m => [...m, { role:'user', content: q }]);
    setStreaming(true);

    // Append a placeholder assistant message that we'll mutate as the
    // stream emits chunks.
    let placeholderIndex;
    setMessages(m => {
      placeholderIndex = m.length;
      return [...m, { role:'assistant', content:'', citations:[], streaming:true }];
    });

    const cancel = await chat(q, messages, {
      onChunk: (chunk) => {
        setMessages(m => {
          const copy = m.slice();
          const i = copy.length - 1;
          copy[i] = { ...copy[i], content: copy[i].content + chunk };
          return copy;
        });
      },
      onDone: (citations) => {
        setMessages(m => {
          const copy = m.slice();
          const i = copy.length - 1;
          copy[i] = { ...copy[i], citations: citations || [], streaming: false };
          return copy;
        });
        setStreaming(false);
        cancelRef.current = null;
      },
    });
    cancelRef.current = cancel;
  }

  function stop() {
    if (cancelRef.current) cancelRef.current();
    setStreaming(false);
    setMessages(m => {
      const copy = m.slice();
      const i = copy.length - 1;
      if (i >= 0 && copy[i].role === 'assistant') copy[i] = { ...copy[i], streaming: false };
      return copy;
    });
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!visible) return null;

  return (
    <div style={{
      gridArea:'assist', background: T.chrome.sidebar,
      borderLeft:'1px solid '+T.chrome.border,
      display:'flex', flexDirection:'column', overflow:'hidden',
      fontFamily:'"IBM Plex Sans", system-ui, sans-serif',
    }}>
      <Header T={T} count={messages.filter(m => m.role !== 'system').length} onClose={onClose}/>

      <div ref={scrollRef} style={{
        flex:1, overflow:'auto', padding:'14px 14px 8px',
        display:'flex', flexDirection:'column', gap: 16,
      }}>
        {messages.map((m, i) => (
          <Message key={i} m={m} T={T} openFile={openFile}/>
        ))}
        {/* Starter chips — only while the conversation is fresh */}
        {messages.length <= 1 && (
          <Starters T={T} disabled={streaming} onPick={(q) => send(q)}/>
        )}
      </div>

      <InputBar
        T={T}
        value={input}
        onChange={setInput}
        onKeyDown={onKeyDown}
        onSend={() => send()}
        onStop={stop}
        streaming={streaming}
        inputRef={inputRef}
      />
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────
function Header({ T, count, onClose }) {
  return (
    <div style={{
      padding:'10px 14px', borderBottom:'1px solid '+T.chrome.border,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div>
        <div style={{
          fontFamily:'"Geist Mono",monospace', fontSize:11,
          letterSpacing:'0.18em', textTransform:'uppercase',
          color: T.chrome.fgFainter,
        }}>Assistant</div>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:2, fontSize:12, color:T.chrome.fg}}>
          <span style={{
            width: 7, height: 7, borderRadius:'50%', background: T.accent, boxShadow:'0 0 6px '+T.accent,
            display:'inline-block',
          }}/>
          <span>grounded in this repo</span>
        </div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6, color:T.chrome.fgFainter, fontFamily:'"Geist Mono",monospace', fontSize:11}}>
        <span>{count} msg</span>
        <button onClick={onClose} title="Hide assistant" style={{
          background:'transparent', border:0, color:T.chrome.fgFainter, cursor:'pointer',
          width:22, height:22, borderRadius:4, padding:0, fontSize:14, lineHeight:1,
        }}>×</button>
      </div>
    </div>
  );
}

function Message({ m, T, openFile }) {
  if (m.role === 'user') {
    return (
      <div style={{
        alignSelf:'flex-end', maxWidth:'92%',
        background: T.chrome.selBg,
        border:'1px solid '+T.chrome.border,
        borderRadius:10, padding:'9px 12px',
        fontSize:13, color:T.chrome.fg, lineHeight:1.55, whiteSpace:'pre-wrap',
      }}>
        {m.content}
      </div>
    );
  }
  // Assistant
  return (
    <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
      <div style={{
        width:24, height:24, borderRadius:6, flex:'0 0 auto',
        background: T.accent, color: T.chrome.statusBarFg,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'"Geist Mono",monospace', fontSize:10.5, fontWeight:700,
        boxShadow:'0 0 12px '+T.accent+'33',
      }}>AI</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          fontSize:13, color:T.chrome.fg, lineHeight:1.6, whiteSpace:'pre-wrap',
        }}>
          {m.content}
          {m.streaming && (
            <span style={{
              display:'inline-block', width:7, height:'1em', verticalAlign:'-2px',
              background: T.accent, marginLeft:1,
            }}/>
          )}
        </div>
        {m.citations && m.citations.length > 0 && !m.streaming && (
          <div style={{
            display:'flex', flexWrap:'wrap', gap:6, marginTop:8,
          }}>
            <span style={{
              fontFamily:'"Geist Mono",monospace', fontSize:10.5,
              letterSpacing:'0.16em', textTransform:'uppercase',
              color: T.chrome.fgFainter, alignSelf:'center', marginRight:2,
            }}>sources</span>
            {m.citations.map(c => (
              <button key={c}
                onClick={() => openFile?.(c)}
                title={'Open ' + c}
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'4px 8px', borderRadius:6, cursor:'pointer',
                  background: T.chrome.hoverBg, color: T.chrome.fg,
                  border:'1px solid '+T.chrome.border,
                  fontFamily:'"Geist Mono",monospace', fontSize:11,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.chrome.selBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = T.chrome.hoverBg; }}
              >
                <span style={{color: T.accent}}>↗</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Starters({ T, onPick, disabled }) {
  const items = [
    "What's Saurabh's stack?",
    "Is he available for work?",
    "Show me his strongest project",
    "What's he working on now?",
    "How do I reach him?",
  ];
  return (
    <div style={{marginTop:4}}>
      <div style={{
        fontFamily:'"Geist Mono",monospace', fontSize:10.5,
        letterSpacing:'0.16em', textTransform:'uppercase',
        color: T.chrome.fgFainter, marginBottom:8,
      }}>Suggested</div>
      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
        {items.map(q => (
          <button key={q}
            onClick={() => !disabled && onPick(q)}
            disabled={disabled}
            style={{
              padding:'7px 11px', borderRadius:8,
              background: T.chrome.hoverBg, color: T.chrome.fg,
              border:'1px solid '+T.chrome.border,
              fontFamily:'inherit', fontSize:12, lineHeight:1.3,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              textAlign:'left',
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = T.chrome.selBg; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = T.chrome.hoverBg; }}
          >{q}</button>
        ))}
      </div>
    </div>
  );
}

function InputBar({ T, value, onChange, onKeyDown, onSend, onStop, streaming, inputRef }) {
  return (
    <div style={{
      borderTop:'1px solid '+T.chrome.border,
      padding:'10px 12px', background: T.chrome.sidebar,
    }}>
      <div style={{
        display:'flex', alignItems:'flex-end', gap:8,
        background: T.chrome.editor,
        borderRadius:10,
        border:'1px solid '+T.chrome.border,
        padding:'8px 10px',
      }}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={streaming ? 'streaming…' : 'Ask anything about this repo…'}
          rows={1}
          spellCheck={false}
          style={{
            flex:1, resize:'none', border:0, outline:'none', background:'transparent',
            color: T.chrome.fg, fontFamily:'inherit', fontSize:13, lineHeight:1.45,
            minHeight: 22, maxHeight: 120,
          }}
        />
        <button
          onClick={streaming ? onStop : onSend}
          title={streaming ? 'Stop generating' : 'Send · ↵'}
          style={{
            width:30, height:30, borderRadius:7, border:0, cursor:'pointer',
            background: streaming ? T.chrome.hoverBg : T.accent,
            color: streaming ? T.chrome.fg : T.chrome.statusBarFg,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'background .12s',
          }}
        >
          {streaming ? (
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V3 M3 7l4-4 4 4"/></svg>
          )}
        </button>
      </div>
      <div style={{
        marginTop:6, display:'flex', justifyContent:'space-between',
        fontFamily:'"Geist Mono",monospace', fontSize:10.5, color:T.chrome.fgFainter,
      }}>
        <span>↵ send · ⇧↵ newline</span>
        <span>mock · replace with /api/chat</span>
      </div>
    </div>
  );
}

// ── Intro + canned routing ──────────────────────────────────────────
const INTRO_MESSAGE = {
  role: 'assistant',
  streaming: false,
  citations: [],
  content:
`Hi — I'm grounded in this repo's files. Ask about Saurabh's work, stack, availability, or any specific project.

I cite the files I pulled from. Click a source chip to open it in the editor.`,
};

// ── Backend boundary ────────────────────────────────────────────────
//
// Replace this `chat` function with a fetch to your /api/chat route. The
// rest of the component already expects an async streaming interface:
//
//   chat(prompt, history, { onChunk(text), onDone(citations) })
//     → returns a cancel function the caller may call to abort
//
// A production implementation should:
//   1. Build context by reading the MDX files under /content
//   2. POST { question, history, context } to your Next.js API route
//   3. Route the call through OpenRouter (Claude Haiku, Llama 3.1 8B, etc.)
//      with a strict system prompt: "Only answer from the provided files;
//      if the answer isn't there, say so. Cite filenames inline."
//   4. Stream tokens back as SSE; emit final citations in the trailer.
//
// The mock below uses keyword routing into the same content the rest of
// the prototype displays.

async function chat(question, history, { onChunk, onDone }) {
  const { text, citations } = mockReply(question);

  let i = 0;
  // Variable burst so it doesn't feel mechanical
  const burst = () => 1 + Math.floor(Math.random() * 3);
  let cancelled = false;

  function step() {
    if (cancelled) return;
    const next = Math.min(text.length, i + burst());
    onChunk(text.slice(i, next));
    i = next;
    if (i < text.length) setTimeout(step, 14 + Math.random() * 18);
    else onDone(citations);
  }
  setTimeout(step, 240); // brief "thinking" pause before first chunk

  return () => {
    cancelled = true;
    onDone(citations);
  };
}

function mockReply(question) {
  const q = question.toLowerCase();

  const has = (...words) => words.some(w => q.includes(w));

  if (has('stack', 'tech', 'language', 'tools', 'framework'))
    return {
      text:
`TypeScript, Rust, Postgres, React — that's the love list.
Fluent in Go, Python, GCP, Redis, and WebGL.
Currently learning Swift and OCaml.`,
      citations: ['experience.json', 'about.md'],
    };

  if (has('available', 'hire', 'hiring', 'contract', 'freelance', 'open to'))
    return {
      text:
`Available from Q3 2026 — open to contract, full-time, or advisory.
Won't do: crypto, anything with an NDA on the NDA.
Best path is email: hello@saurabhjalendra.com (median reply 24h).`,
      citations: ['contact.yaml'],
    };

  if (has('best', 'strongest', 'top', 'favorite', 'favourite', 'proudest'))
    return {
      text:
`Alpha — the realtime collaboration layer that survives flaky networks.
Edits-lost-per-session went 14% → 0.2% in 11 weeks.
Cited in a customer RFP as the reason they signed.`,
      citations: ['projects/alpha.md'],
    };

  if (has('ci', 'bazel', 'pipeline', 'build', 'bravo'))
    return {
      text:
`Bravo: turned a 14-minute CI into 90 seconds.
Mostly remote-cached Bazel for the hot 6% of targets plus a diff-aware test runner.`,
      citations: ['projects/bravo.md'],
    };

  if (has('design system', 'design-system', 'delta', 'tokens'))
    return {
      text:
`Delta: a design system adopted across 7 product teams in 4 months.
Token pipeline: Figma → JSON → CSS vars → typed React props.
Onboarding a new product surface dropped from weeks to an afternoon.`,
      citations: ['projects/delta.md'],
    };

  if (has('graph', 'webgl', 'charlie', 'visualiz', 'open source', 'oss'))
    return {
      text:
`Charlie: a WebGL playground for graph databases.
Rust/WASM force-directed layout handles 50k nodes at 60fps.
Open source, ~2.1k stars.`,
      citations: ['projects/charlie.md'],
    };

  if (has('cli', 'rust', 'echo', 'migration'))
    return {
      text:
`Echo: a Rust CLI for legacy data migrations.
Dry-run + rollback are the killer features — they made it the team's default tool.`,
      citations: ['projects/echo.md'],
    };

  if (has('ios', 'swift', 'foxtrot', 'app store', 'mobile'))
    return {
      text:
`Foxtrot: a small iOS tool, in beta.
Email if you want a TestFlight invite.`,
      citations: ['projects/foxtrot.md'],
    };

  if (has('now', 'this week', 'working on', 'current', 'today'))
    return {
      text:
`This week: closing the last 11 TestFlight bugs on Foxtrot.
Shipping a small library next week.
See /now for the full version, refreshed weekly.`,
      citations: ['now.md'],
    };

  if (has('about', 'who', 'background', 'bio', 'experience', 'history'))
    return {
      text:
`Engineer / product builder, 6+ years shipping.
Cares about boring foundations that make ambitious work possible — observability, design systems, internal tools.
Comfortable owning a feature end to end: design, frontend, backend, infra.`,
      citations: ['about.md', 'experience.json'],
    };

  if (has('contact', 'email', 'reach', 'message', 'phone', 'linkedin', 'github'))
    return {
      text:
`Email is the surest path: hello@saurabhjalendra.com
GitHub: @saurabhjalendra · LinkedIn: in/saurabhjalendra
Median response 24h, worst-case 72h.`,
      citations: ['contact.yaml'],
    };

  if (has('writing', 'blog', 'essay', 'talk', 'speak', 'wrote', 'article'))
    return {
      text:
`Three pieces are up: a recent essay on the boring middle of projects, a shorter note, and a conference talk from late 2025.
Each is in /writing.`,
      citations: [
        'writing/2026-04-12-essay-one.md',
        'writing/2025-11-22-talk.md',
      ],
    };

  if (has('readme', 'site', 'this site', 'portfolio'))
    return {
      text:
`The whole site is laid out as a codebase.
README.md is the landing page; about.md, projects/*, writing/* are the rest.
Try ⌘P to quick-open any file, or ⌘K for commands.`,
      citations: ['README.md'],
    };

  if (has('hello', 'hi', 'hey', 'sup'))
    return {
      text:
`Hi! Try one of the suggested questions on the right, or ask about a specific file (e.g. projects/alpha.md).`,
      citations: [],
    };

  // Fallback — honest about being a mock
  return {
    text:
`This is a mock backend — keyword routing rather than a real LLM.
In production, this calls /api/chat which routes through OpenRouter with the repo files as grounding.

Try one of the suggestions, or ask about: stack, availability, projects (alpha / bravo / charlie / delta / echo / foxtrot), now, writing, contact.`,
    citations: [],
  };
}

window.IDEAssistant = AssistantPanel;
