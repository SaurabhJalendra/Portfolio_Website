// Assistant panel — Copilot Chat–style. Lives in its own column on the right
// of the editor pane. Streams answers with citations to the repo's "files".
//
// The mock backend is the function `mockChat` near the bottom — it's
// keyword-routed canned answers so the panel feels alive in this design
// prototype. Replace `chat()` with a real fetch to your OpenRouter-backed
// API route when wiring this up; the rest of the component doesn't change.

const { useState: useStateAs, useEffect: useEffectAs, useRef: useRefAs, useContext: useCtxAs } = React;

// ── Public component ────────────────────────────────────────────────
function AssistantPanel({ openFile, onClose, visible, avatar = '>_' }) {
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
      onDone: (extras) => {
        setMessages(m => {
          const copy = m.slice();
          const i = copy.length - 1;
          copy[i] = {
            ...copy[i],
            citations: extras.citations || [],
            followups: extras.followups || [],
            stack:     extras.stack     || null,
            table:     extras.table     || null,
            actions:   extras.actions   || null,
            streaming: false,
          };
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
          <Message key={i} m={m} T={T} openFile={openFile} avatar={avatar} onFollowup={send}/>
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

function Message({ m, T, openFile, avatar = '>_', onFollowup }) {
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
  const isThinking = m.streaming && !m.content;
  const avatarIsDot = avatar === 'dot' || avatar === '●';
  const avatarText = avatarIsDot ? '' : avatar;
  const avatarSize = avatarIsDot ? 8 : 24;
  return (
    <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
      {avatarIsDot ? (
        <div style={{
          width:8, height:8, borderRadius:'50%', marginTop:8,
          background: T.accent, flex:'0 0 auto',
          boxShadow:'0 0 10px '+T.accent,
        }}/>
      ) : (
        <div style={{
          width:24, height:24, borderRadius:6, flex:'0 0 auto',
          background: T.accent, color: T.chrome.statusBarFg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'"Geist Mono",monospace',
          fontSize: avatarText.length >= 3 ? 9.5 : 10.5,
          fontWeight: 700,
          letterSpacing: avatarText === '>_' ? '-0.5px' : 0,
          boxShadow:'0 0 12px '+T.accent+'33',
        }}>{avatarText}</div>
      )}
      <div style={{flex:1, minWidth:0}}>
        {isThinking ? (
          <div style={{display:'flex', alignItems:'center', gap:5, padding:'4px 0'}}>
            <span style={{width:5, height:5, borderRadius:'50%', background:T.accent, animation:'sj-bounce 1.2s -.24s ease-in-out infinite'}}/>
            <span style={{width:5, height:5, borderRadius:'50%', background:T.accent, animation:'sj-bounce 1.2s -.12s ease-in-out infinite'}}/>
            <span style={{width:5, height:5, borderRadius:'50%', background:T.accent, animation:'sj-bounce 1.2s 0s    ease-in-out infinite'}}/>
          </div>
        ) : (
          <ChatMarkdown body={m.content} citations={m.citations || []} openFile={openFile} streaming={m.streaming} T={T}/>
        )}
        {m.stack && m.stack.length > 0 && !m.streaming && (
          <StackPills items={m.stack} T={T}/>
        )}
        {m.table && !m.streaming && (
          <ComparisonTable table={m.table} T={T}/>
        )}
        {m.actions && m.actions.length > 0 && !m.streaming && (
          <ActionButtons actions={m.actions} T={T}/>
        )}
        {m.citations && m.citations.length > 0 && !m.streaming && (
          <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:10}}>
            <span style={{
              fontFamily:'"Geist Mono",monospace', fontSize:10.5,
              letterSpacing:'0.16em', textTransform:'uppercase',
              color: T.chrome.fgFainter, marginBottom:2,
            }}>sources</span>
            {m.citations.map((c, i) => (
              <div key={c} style={{
                animation:'sj-chip-in .3s ease-out both',
                animationDelay: (i * 70) + 'ms',
              }}>
                <FilePreviewCard path={c} T={T} onOpen={openFile}/>
              </div>
            ))}
          </div>
        )}
        {m.followups && m.followups.length > 0 && !m.streaming && (
          <div style={{marginTop: 10, display:'flex', flexWrap:'wrap', gap:6}}>
            {m.followups.map((q, i) => (
              <button key={i}
                onClick={() => onFollowup?.(q)}
                style={{
                  padding:'6px 10px', borderRadius:6, cursor:'pointer',
                  background: 'transparent', color: T.chrome.fg,
                  border:'1px solid '+T.chrome.border,
                  fontFamily:'inherit', fontSize:12, lineHeight:1.3, textAlign:'left',
                  animation:'sj-chip-in .26s ease-out both',
                  animationDelay: (60 + i * 60) + 'ms',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.chrome.selBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >{q}</button>
            ))}
          </div>
        )}
        <style>{`
          @keyframes sj-bounce { 0%,80%,100%{ transform: translateY(0); opacity: 0.35 } 40%{ transform: translateY(-4px); opacity: 1 } }
          @keyframes sj-chip-in { from { opacity: 0; transform: translateY(4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
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

// ── Chat content rendering ───────────────────────────────────────────
// Replies are richer than plain text: markdown (bold / italic / `code` /
// ```code blocks```) renders inline; tokens like `[1]` `[2]` resolve to
// the matching citation file and render as tappable badges. Tap a badge —
// the file flies into a new editor tab like the chip row already does.

function ChatMarkdown({ body, citations, openFile, streaming, T }) {
  const blocks = splitCodeFences(body);
  return (
    <div style={{fontSize:13, color:T.chrome.fg, lineHeight:1.6}}>
      {blocks.map((b, i) => b.kind === 'code'
        ? <ChatCodeBlock key={i} body={b.text} lang={b.lang} T={T}/>
        : <ChatPara key={i} text={b.text} citations={citations} openFile={openFile}
            isLast={i === blocks.length - 1} streaming={streaming} T={T}/>)}
    </div>
  );
}

window.ChatMarkdown = ChatMarkdown;
window.__mobileMockReply = (q) => mockReply(q);

function splitCodeFences(body) {
  const out = [];
  const lines = body.split('\n');
  let buf = [], code = [], inCode = false, lang = '';
  for (const ln of lines) {
    if (ln.startsWith('```')) {
      if (inCode) { out.push({ kind:'code', lang, text: code.join('\n') }); code = []; inCode = false; lang = ''; }
      else { if (buf.length) out.push({ kind:'text', text: buf.join('\n') }); buf = []; inCode = true; lang = ln.slice(3).trim(); }
    } else if (inCode) { code.push(ln); }
    else { buf.push(ln); }
  }
  if (buf.length)  out.push({ kind:'text', text: buf.join('\n') });
  if (code.length) out.push({ kind:'code', lang, text: code.join('\n') });
  return out;
}

function ChatPara({ text, citations, openFile, isLast, streaming, T }) {
  const tokens = renderChatInline(text, citations, openFile, T);
  return (
    <div style={{whiteSpace:'pre-wrap'}}>
      {tokens}
      {streaming && isLast && (
        <span style={{
          display:'inline-block', width:7, height:'1em', verticalAlign:'-2px',
          background: T.accent, marginLeft: 1,
        }}/>
      )}
    </div>
  );
}

function renderChatInline(text, citations, openFile, T) {
  const out = [];
  let i = 0, key = 0;
  while (i < text.length) {
    const rest = text.slice(i);
    let m;
    if ((m = rest.match(/^\*\*([^*]+)\*\*/))) {
      out.push(<strong key={key++} style={{fontWeight:700, color: T.chrome.fg}}>{m[1]}</strong>);
      i += m[0].length; continue;
    }
    if ((m = rest.match(/^`([^`]+)`/))) {
      out.push(<code key={key++} style={{
        background: T.chrome.hoverBg, color: T.syntax.code,
        padding:'1px 5px', borderRadius:4, fontSize:'0.92em',
        fontFamily:'"Geist Mono",monospace',
      }}>{m[1]}</code>);
      i += m[0].length; continue;
    }
    // Inline citation marker [N] — only if N maps to a real source.
    if ((m = rest.match(/^\[(\d+)\]/))) {
      const n = parseInt(m[1], 10);
      const file = citations[n - 1];
      if (file) {
        out.push(
          <button key={key++}
            onClick={(e) => {
              if (window.IDE_FLY_TO_TAB) window.IDE_FLY_TO_TAB(e.currentTarget, file, openFile);
              else openFile?.(file);
            }}
            title={file}
            style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              minWidth: 16, height: 16, padding:'0 5px',
              border:0, borderRadius: 8, marginLeft: 1,
              background: T.accent, color: T.chrome.statusBarFg,
              fontFamily:'"Geist Mono",monospace', fontSize: 10, fontWeight: 700,
              cursor:'pointer', verticalAlign:'1px',
            }}
          >{m[1]}</button>
        );
        i += m[0].length; continue;
      }
    }
    if ((m = rest.match(/^\*([^*\s][^*]*?)\*/))) {
      out.push(<em key={key++} style={{color: T.syntax.emItalic, fontStyle:'italic'}}>{m[1]}</em>);
      i += m[0].length; continue;
    }
    const last = out[out.length - 1];
    if (typeof last === 'string') out[out.length - 1] = last + text[i];
    else out.push(text[i]);
    i++;
  }
  return out;
}

function ChatCodeBlock({ body, lang, T }) {
  const tokens = window.highlight(lang || 'md', body);
  return (
    <pre style={{
      margin: '10px 0', padding: '10px 12px',
      background: T.chrome.titlebar,
      border: '1px solid ' + T.chrome.border,
      borderRadius: 8,
      fontFamily: '"Geist Mono","JetBrains Mono",monospace',
      fontSize: 11.5, lineHeight: 1.55, overflow: 'auto',
    }}>
      {tokens.map((toks, i) => (
        <div key={i}>
          {toks.length === 0 && <span>{' '}</span>}
          {toks.map((tok, j) => (
            <span key={j} style={{ color: T.syntax[tok.t] || T.syntax.text, fontWeight: tok.t === 'bold' ? 700 : 400, fontStyle: tok.t === 'emItalic' ? 'italic' : 'normal' }}>{tok.v}</span>
          ))}
        </div>
      ))}
    </pre>
  );
}

// ── Rich content widgets ──────────────────────────────────────────
// Replies can carry structured extras that render below the prose: a stack
// row, a comparison table, action buttons, and file-preview cards (richer
// than the old chip row).

function FilePreviewCard({ path, T, onOpen }) {
  const body = window.PORTFOLIO_FS.files[path] || '';
  const lines = body.split('\n');
  const firstHeading = (lines.find(l => l.startsWith('# ')) || '').replace(/^#\s*/, '');
  let snippet = '';
  for (const ln of lines.slice(1)) {
    if (!ln.trim()) continue;
    if (ln.startsWith('#') || ln.startsWith('**') || ln.startsWith('<!--') || ln.startsWith('>')) continue;
    snippet = ln.replace(/[*`\[\]]/g, '').slice(0, 100);
    break;
  }
  return (
    <button
      onClick={(e) => {
        if (window.IDE_FLY_TO_TAB) window.IDE_FLY_TO_TAB(e.currentTarget, path, onOpen);
        else onOpen?.(path);
      }}
      style={{
        display:'block', width:'100%', textAlign:'left',
        padding:'10px 12px', borderRadius:8,
        background: T.chrome.hoverBg,
        border:'1px solid ' + T.chrome.border,
        color: T.chrome.fg, cursor:'pointer',
        fontFamily: 'inherit',
        transition: 'background .12s, border-color .12s, transform .12s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.chrome.selBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = T.chrome.hoverBg; }}
    >
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom: 3}}>
        <span style={{fontFamily:'"Geist Mono",monospace', fontSize:11, color: T.accent}}>↗ {path}</span>
        <span style={{fontFamily:'"Geist Mono",monospace', fontSize:10, color: T.chrome.fgFainter, letterSpacing:'0.10em', textTransform:'uppercase'}}>open</span>
      </div>
      {firstHeading && <div style={{fontSize:13, fontWeight:600, color:T.chrome.fg, marginBottom:2}}>{firstHeading}</div>}
      {snippet && <div style={{fontSize:11.5, color:T.chrome.fgDim, lineHeight:1.45}}>{snippet}{snippet.length >= 100 ? '…' : ''}</div>}
    </button>
  );
}

const STACK_COLORS = {
  TypeScript:'#7ec8ff', JavaScript:'#ffd07a', Rust:'#f29ea8', Go:'#7ec8ff',
  Python:'#ffd07a', Swift:'#ffa86b', OCaml:'#c8a4ff',
  React:'#a8e9f3', Postgres:'#7be39a', Redis:'#ff8a8a',
  WebGL:'#c8a4ff', WASM:'#f29ea8', GCP:'#7be39a', Bazel:'#a8e9b8',
  Figma:'#f29ea8', tRPC:'#a8e9f3', CRDTs:'#c8a4ff', iOS:'#a8e9f3',
};

function StackPills({ items, T }) {
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:5, marginTop:10}}>
      {items.map((s, i) => (
        <span key={i} style={{
          padding:'3px 9px', borderRadius:5,
          background: T.chrome.hoverBg,
          color: STACK_COLORS[s] || T.chrome.fg,
          border: '1px solid ' + T.chrome.border,
          fontFamily:'"Geist Mono",monospace', fontSize:11,
          fontWeight: 500,
          animation: 'sj-chip-in .26s ease-out both',
          animationDelay: (i * 40) + 'ms',
        }}>{s}</span>
      ))}
    </div>
  );
}

function ComparisonTable({ table, T }) {
  return (
    <div style={{
      marginTop: 10, overflow:'hidden',
      borderRadius: 8, border: '1px solid ' + T.chrome.border,
      animation:'sj-chip-in .3s ease-out',
    }}>
      <div style={{
        display:'grid',
        gridTemplateColumns: 'repeat(' + table.headers.length + ', 1fr)',
        fontFamily:'"Geist Mono",monospace', fontSize:10,
        letterSpacing:'0.12em', textTransform:'uppercase',
        color: T.chrome.fgFainter, background: T.chrome.titlebar,
      }}>
        {table.headers.map((h, i) => (
          <div key={i} style={{padding:'6px 10px', borderRight: i < table.headers.length - 1 ? '1px solid ' + T.chrome.border : 0}}>{h}</div>
        ))}
      </div>
      {table.rows.map((row, r) => (
        <div key={r} style={{
          display:'grid',
          gridTemplateColumns: 'repeat(' + table.headers.length + ', 1fr)',
          borderTop: '1px solid ' + T.chrome.border,
        }}>
          {row.map((cell, c) => (
            <div key={c} style={{
              padding:'8px 10px',
              borderRight: c < row.length - 1 ? '1px solid ' + T.chrome.border : 0,
              color: c === 0 ? T.accent : T.chrome.fg,
              fontFamily: c === 0 ? '"Geist Mono",monospace' : 'inherit',
              fontSize: c === 0 ? 11 : 12,
              fontWeight: c === 0 ? 600 : 400,
            }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ActionButtons({ actions, T }) {
  return (
    <div style={{marginTop: 10, display:'flex', flexWrap:'wrap', gap:6}}>
      {actions.map((a, i) => (
        <a key={i} href={a.do} target={a.do && a.do.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
          style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'6px 12px', borderRadius:7,
            background: a.kind === 'secondary' ? T.chrome.hoverBg : T.accent,
            color: a.kind === 'secondary' ? T.chrome.fg : T.chrome.statusBarFg,
            border: a.kind === 'secondary' ? '1px solid ' + T.chrome.border : '0',
            fontFamily:'inherit', fontSize:12, fontWeight:600,
            textDecoration:'none', cursor:'pointer',
            animation:'sj-chip-in .26s ease-out both',
            animationDelay: (i * 60) + 'ms',
          }}
        >
          {a.icon && <span style={{fontFamily:'"Geist Mono",monospace', fontSize:11}}>{a.icon}</span>}
          {a.label}
        </a>
      ))}
    </div>
  );
}

window.FilePreviewCard = FilePreviewCard;
window.StackPills = StackPills;
window.ComparisonTable = ComparisonTable;
window.ActionButtons = ActionButtons;

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
  const reply = mockReply(question);
  const { text } = reply;

  let i = 0;
  const burst = () => 1 + Math.floor(Math.random() * 3);
  let cancelled = false;

  function step() {
    if (cancelled) return;
    const next = Math.min(text.length, i + burst());
    onChunk(text.slice(i, next));
    i = next;
    if (i < text.length) setTimeout(step, 14 + Math.random() * 18);
    else onDone(reply);
  }
  setTimeout(step, 240);

  return () => {
    cancelled = true;
    onDone(reply);
  };
}

function mockReply(question) {
  const q = question.toLowerCase();

  const has = (...words) => words.some(w => q.includes(w));

  if (has('stack', 'tech', 'language', 'tools', 'framework'))
    return {
      text:
`TypeScript, Rust, Postgres, React — the love list.[1]
Fluent in Go, Python, GCP, Redis, and WebGL.[1]
Currently learning Swift and OCaml.[2]`,
      citations: ['experience.json', 'about.md'],
      followups: ['What\'s his strongest project?', 'How does he pick tech?'],
      stack: ['TypeScript', 'Rust', 'Postgres', 'React', 'Go', 'Python', 'GCP', 'Redis', 'WebGL', 'Swift', 'OCaml'],
    };

  if (has('compare', 'alpha vs', 'alpha and bravo', 'alpha bravo', 'difference between'))
    return {
      text:
`Alpha and Bravo are very different beasts.[1][2]
Alpha is a product feature — realtime sync visible to end users.
Bravo is infra — the CI rewrite that nobody sees but everybody feels.`,
      citations: ['projects/alpha.md', 'projects/bravo.md'],
      followups: ['Tell me more about Alpha', 'What about Bravo?', 'Show all projects'],
      table: {
        headers: ['', 'Alpha', 'Bravo'],
        rows: [
          ['kind',     'product feature', 'infrastructure'],
          ['stack',    'TypeScript / tRPC', 'Go / Bazel'],
          ['role',     'lead engineer',   'infra'],
          ['year',     '2026',            '2025'],
          ['outcome',  'edits-lost 14%→0.2%', 'CI 14m→90s'],
        ],
      },
    };

  if (has('available', 'hire', 'hiring', 'contract', 'freelance', 'open to'))
    return {
      text:
`Available from **Q3 2026** — open to contract, full-time, or advisory.[1]
Not doing: crypto, anything with an NDA on the NDA.[1]
Best path is email: \`hello@saurabhjalendra.com\` (median reply 24h).[1]`,
      citations: ['contact.yaml'],
      followups: ['What kind of work fits best?', 'What\'s his rate?'],
      actions: [
        { label: 'Email Saurabh', do: 'mailto:hello@saurabhjalendra.com', icon: '↗' },
        { label: 'Book a call',   do: 'https://cal.com/saurabhjalendra', kind: 'secondary', icon: '✎' },
      ],
    };

  if (has('best', 'strongest', 'top', 'favorite', 'favourite', 'proudest'))
    return {
      text:
`**Alpha** — the realtime collaboration layer that survives flaky networks.[1]
Edits-lost-per-session went 14% → 0.2% in 11 weeks.[1]
Cited in a customer RFP as the reason they signed.[1]`,
      citations: ['projects/alpha.md'],
      followups: ['What was the technical bet?', 'Show me other projects'],
    };

  if (has('ci', 'bazel', 'pipeline', 'build', 'bravo'))
    return {
      text:
`**Bravo**: a 14-minute CI rebuilt to 90 seconds.[1]
Mostly remote-cached Bazel for the hot 6% of targets plus a diff-aware test runner.[1]`,
      citations: ['projects/bravo.md'],
      followups: ['Did the migration cause issues?', 'What\'s next on his infra list?'],
    };

  if (has('design system', 'design-system', 'delta', 'tokens'))
    return {
      text:
`**Delta**: a design system adopted across 7 product teams in 4 months.[1]
Token pipeline: Figma → JSON → CSS vars → typed React props.[1]
Onboarding a new product surface dropped from weeks to an afternoon.[1]`,
      citations: ['projects/delta.md'],
      followups: ['Did teams resist adoption?', 'How did he measure success?'],
    };

  if (has('graph', 'webgl', 'charlie', 'visualiz', 'open source', 'oss'))
    return {
      text:
`**Charlie**: a WebGL playground for graph databases.[1]
Rust/WASM force-directed layout handles 50k nodes at 60fps.[1]
Open source, ~2.1k stars.[1]`,
      citations: ['projects/charlie.md'],
      followups: ['How does the layout algorithm work?', 'Show me more OSS work'],
    };

  if (has('cli', 'rust', 'echo', 'migration'))
    return {
      text:
`**Echo**: a Rust CLI for legacy data migrations.[1]
Dry-run + rollback are the killer features — they made it the team's default tool.[1]`,
      citations: ['projects/echo.md'],
      followups: ['What languages does he use most?', 'Walk me through a project'],
    };

  if (has('ios', 'swift', 'foxtrot', 'app store', 'mobile'))
    return {
      text:
`**Foxtrot**: a small iOS tool, in beta.[1]
Email if you want a TestFlight invite.[1]`,
      citations: ['projects/foxtrot.md'],
      followups: ['How do I get the TestFlight invite?', 'What does it actually do?'],
    };

  if (has('now', 'this week', 'working on', 'current', 'today'))
    return {
      text:
`This week: closing the last 11 TestFlight bugs on Foxtrot.[1]
Shipping a small library next week.[1]
See \`/now\` for the full version, refreshed weekly.[1]`,
      citations: ['now.md'],
      followups: ['What\'s Foxtrot?', 'What\'s he reading?'],
    };

  if (has('about', 'who', 'background', 'bio', 'experience', 'history'))
    return {
      text:
`Engineer / product builder, **6+ years** shipping.[2]
Cares about boring foundations that make ambitious work possible — observability, design systems, internal tools.[1]
Comfortable owning a feature end to end: design, frontend, backend, infra.[1]`,
      citations: ['about.md', 'experience.json'],
      followups: ['What companies has he worked at?', 'What\'s his strongest project?'],
    };

  if (has('contact', 'email', 'reach', 'message', 'phone', 'linkedin', 'github'))
    return {
      text:
`Email is the surest path: \`hello@saurabhjalendra.com\`[1]
GitHub: @saurabhjalendra · LinkedIn: in/saurabhjalendra[1]
Median response 24h, worst-case 72h.[1]`,
      citations: ['contact.yaml'],
      followups: ['Is he available right now?', 'Where is he based?'],
      actions: [
        { label: 'Email',    do: 'mailto:hello@saurabhjalendra.com', icon: '@' },
        { label: 'GitHub',   do: 'https://github.com/saurabhjalendra', kind: 'secondary', icon: 'G' },
        { label: 'LinkedIn', do: 'https://linkedin.com/in/saurabhjalendra', kind: 'secondary', icon: 'in' },
      ],
    };

  if (has('writing', 'blog', 'essay', 'talk', 'speak', 'wrote', 'article'))
    return {
      text:
`Three pieces are up: a recent essay on the boring middle of projects[1], a shorter note[1], and a conference talk from late 2025[2].
Each is in \`/writing\`.`,
      citations: [
        'writing/2026-04-12-essay-one.md',
        'writing/2025-11-22-talk.md',
      ],
      followups: ['What\'s the essay about?', 'Where is he speaking next?'],
    };

  if (has('readme', 'site', 'this site', 'portfolio'))
    return {
      text:
`The whole site is laid out as a codebase.[1]
\`README.md\` is the landing page; \`about.md\`, \`projects/*\`, \`writing/*\` are the rest.
Try ⌘P to quick-open any file, or ⌘K for commands.`,
      citations: ['README.md'],
      followups: ['Who built this site?', 'What\'s the keyboard shortcut for the terminal?'],
    };

  if (has('hello', 'hi', 'hey', 'sup'))
    return {
      text:
`Hi! Try one of the suggested questions, or ask about a specific project (alpha / bravo / charlie / delta / echo / foxtrot).`,
      citations: [],
      followups: ['What\'s Saurabh\'s stack?', 'Show me his strongest project', 'Is he available?'],
    };

  // Fallback — honest about being a mock
  return {
    text:
`This is a mock backend — keyword routing rather than a real LLM.
In production, this calls \`/api/chat\` which routes through OpenRouter with the repo files as grounding.

Try one of the suggestions, or ask about: stack, availability, projects (alpha / bravo / charlie / delta / echo / foxtrot), now, writing, contact.`,
    citations: [],
    followups: ['What\'s his stack?', 'Show me his strongest project', 'Is he available?'],
  };
}

window.IDEAssistant = AssistantPanel;
