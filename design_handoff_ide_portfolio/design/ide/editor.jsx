// Editor pane = breadcrumb row + tab strip + code area + minimap.
// Typing animation: when a tab is opened for the first time and motion is on,
// the body streams in char-by-char (~1.5ms each, cancelable).

const { useEffect: useEffectE, useRef: useRefE, useState: useStateE, useMemo, useContext: useCtxE } = React;

function Breadcrumb({ path }) {
  const T = useCtxE(window.ThemeCtx);
  const parts = path ? path.split('/') : [];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:6, padding:'4px 14px',
      borderBottom:'1px solid '+T.chrome.border,
      fontSize:11.5, color:T.chrome.fgFainter, fontFamily:'"Geist Mono",monospace',
      height:24, boxSizing:'border-box',
    }}>
      <span>{window.PORTFOLIO_FS.root}</span>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <span style={{color:T.chrome.fgFainter}}>›</span>
          <span style={{color: i === parts.length - 1 ? T.chrome.fg : T.chrome.fgFainter}}>{p}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function TabStrip({ tabs, active, setActive, closeTab }) {
  const T = useCtxE(window.ThemeCtx);
  return (
    <div style={{
      display:'flex', background: T.chrome.titlebar,
      borderBottom:'1px solid '+T.chrome.border,
      height: 34, minHeight: 34, flex:'0 0 auto',
      overflowX:'auto', overflowY:'hidden',
    }}>
      {tabs.map(p => {
        const isActive = p === active;
        const name = p.split('/').pop();
        const lang = window.PORTFOLIO_FS.tree.find?.(n => n.path === p)?.lang || 'md';
        const iconColor = lang === 'json' ? T.syntax.jsonNum : lang === 'yaml' ? T.syntax.yamlKey : T.syntax.hdr1;
        return (
          <div key={p}
            onClick={() => setActive(p)}
            style={{
              display:'flex', alignItems:'center', gap:8,
              flex:'0 0 auto', whiteSpace:'nowrap',
              padding:'8px 12px 8px 14px',
              background: isActive ? T.chrome.tabActive : 'transparent',
              color: isActive ? T.chrome.fg : T.chrome.fgDim,
              fontSize:12.5, cursor:'pointer',
              borderRight:'1px solid '+T.chrome.border,
              borderTop: '2px solid ' + (isActive ? T.accent : 'transparent'),
              marginTop:-1, position:'relative',
              fontFamily:'"IBM Plex Mono",monospace',
              transition:'background .12s, color .12s',
              maxWidth: 180,
            }}
          >
            <span style={{color: iconColor, fontFamily:'"Geist Mono",monospace', fontSize:10, fontWeight:700, flex:'0 0 auto'}}>
              {lang === 'json' ? '{}' : lang === 'yaml' ? 'Y' : 'M'}
            </span>
            <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(p); }}
              style={{
                background:'transparent', border:0, color:T.chrome.fgFainter,
                width:18, height:18, borderRadius:4, padding:0, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                marginLeft:4, fontSize:14, lineHeight:1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              title="Close · ⌘W"
            >×</button>
          </div>
        );
      })}
      <div style={{flex:1, borderBottom:'1px solid '+T.chrome.border, minWidth: 12}}/>
    </div>
  );
}

// Typed renderer. Given a body, returns the slice currently revealed plus
// a "done" flag. ~600 chars per second by default; finishing is instant if
// motion is disabled or if the same tab was previously fully typed.
function useTypewriter(body, key, motion, completedRef) {
  const [shown, setShown] = useStateE(motion && !completedRef.current[key] ? 0 : body.length);
  useEffectE(() => {
    if (!motion || completedRef.current[key]) {
      setShown(body.length);
      return;
    }
    setShown(0);
    let i = 0;
    const total = body.length;
    let cancelled = false;
    function step() {
      if (cancelled) return;
      // Burst per frame keeps it responsive and feels like fast typing.
      const burst = Math.max(8, Math.floor(total / 240));
      i = Math.min(total, i + burst);
      setShown(i);
      if (i < total) requestAnimationFrame(step);
      else completedRef.current[key] = true;
    }
    requestAnimationFrame(step);
    return () => { cancelled = true; };
  }, [body, key, motion]);
  return shown;
}

function CodeBody({ body, lang, motion, tabKey, completedRef, caretLine, scrollKey }) {
  const T = useCtxE(window.ThemeCtx);
  const shown = useTypewriter(body, tabKey, motion, completedRef);
  const partial = body.slice(0, shown);
  const lines = useMemo(() => window.highlight(lang, partial), [partial, lang]);
  const totalLines = body.split('\n').length;

  const scrollRef = useRefE(null);
  useEffectE(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollKey]);

  // Blink the cursor on the last line.
  const [caretOn, setCaretOn] = useStateE(true);
  useEffectE(() => {
    const id = setInterval(() => setCaretOn(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <div ref={scrollRef} style={{
      flex:1, overflow:'auto',
      padding:'14px 0 80px', position:'relative',
      fontFamily:'"Geist Mono","JetBrains Mono","IBM Plex Mono",ui-monospace,monospace',
      fontSize: 13, lineHeight: 1.7,
    }}>
      {lines.map((toks, i) => (
        <div key={i} style={{display:'flex', padding:'0 14px'}}>
          <span style={{
            display:'inline-block', width:48, textAlign:'right', paddingRight:18,
            color: i === lines.length - 1 ? T.chrome.fg : T.chrome.gutter,
            userSelect:'none', fontVariantNumeric:'tabular-nums',
          }}>{i + 1}</span>
          <span style={{flex:1, color:T.syntax.text, whiteSpace:'pre-wrap'}}>
            {toks.map((tok, j) => (
              <span key={j} style={tokenStyle(tok.t, T)}>{tok.v}</span>
            ))}
            {i === lines.length - 1 && shown < body.length && (
              <span style={{
                display:'inline-block', width:7, height:'1em', verticalAlign:'-2px',
                background: T.accent, marginLeft: 1,
              }}/>
            )}
            {i === lines.length - 1 && shown >= body.length && (
              <span style={{
                display:'inline-block', width:7, height:'1em', verticalAlign:'-2px',
                background: caretOn ? T.accent : 'transparent', marginLeft: 1,
              }}/>
            )}
          </span>
        </div>
      ))}
      {/* Phantom lines to keep gutter visible even when content is short */}
      {Array.from({length: Math.max(0, 6)}).map((_, i) => (
        <div key={'p'+i} style={{display:'flex', padding:'0 14px'}}>
          <span style={{display:'inline-block', width:48, textAlign:'right', paddingRight:18,
            color: T.chrome.gutter, opacity: 0.4, userSelect:'none', fontVariantNumeric:'tabular-nums',
          }}>{lines.length + i + 1}</span>
          <span/>
        </div>
      ))}
    </div>
  );
}

function tokenStyle(t, T) {
  const c = T.syntax[t] || T.syntax.text;
  const base = { color: c };
  if (t === 'hdr1') return { ...base, fontWeight: 700, fontSize: '1.05em', letterSpacing:'-0.005em' };
  if (t === 'hdr2') return { ...base, fontWeight: 700 };
  if (t === 'hdr3') return { ...base, fontWeight: 600 };
  if (t === 'bold') return { ...base, fontWeight: 700 };
  if (t === 'emItalic') return { ...base, fontStyle: 'italic' };
  if (t === 'comment') return { ...base, fontStyle: 'italic' };
  if (t === 'placeholder') return { ...base, background: 'rgba(255,170,107,0.12)', padding:'0 2px', borderRadius:2 };
  if (t === 'code') return { ...base, background: 'rgba(255,208,122,0.10)', padding:'0 4px', borderRadius:3 };
  if (t === 'linkText') return { ...base, textDecoration:'underline', textUnderlineOffset:3 };
  return base;
}

// Minimap — block representation of all lines, drawn directly off the
// non-typed body so the visual scale doesn't change mid-typing.
function Minimap({ body, lang, scrollKey }) {
  const T = useCtxE(window.ThemeCtx);
  const lines = useMemo(() => window.highlight(lang, body), [body, lang]);
  return (
    <div style={{
      gridArea:'minimap', background: T.chrome.sidebar,
      borderLeft:'1px solid '+T.chrome.border,
      padding:'8px 6px', overflow:'hidden', position:'relative',
    }}>
      <div style={{display:'flex', flexDirection:'column', gap:1}}>
        {lines.map((toks, i) => {
          const len = toks.reduce((s, t) => s + t.v.length, 0);
          const isHdr = toks[0] && (toks[0].t === 'hdrHash' || toks[0].t === 'iniSection');
          return (
            <div key={i} style={{
              height: 3, borderRadius: 1,
              width: Math.min(60, 4 + len * 0.9),
              background: isHdr ? T.accent : T.chrome.fgFainter,
              opacity: isHdr ? 0.85 : 0.45,
            }}/>
          );
        })}
      </div>
      {/* viewport rectangle */}
      <div style={{
        position:'absolute', left:0, right:0, top: 8, height: 80,
        background: 'rgba(255,255,255,0.05)',
        borderTop:'1px solid '+T.chrome.borderStrong,
        borderBottom:'1px solid '+T.chrome.borderStrong,
        pointerEvents:'none',
      }}/>
    </div>
  );
}

function EditorPane({ tabs, active, setActive, closeTab, motion, showMinimap }) {
  const T = useCtxE(window.ThemeCtx);
  const completedRef = useRefE({}); // remembers which tabs have finished typing

  if (!active) {
    const platform = React.useContext(window.PlatformCtx);
    const mod = window.modKey(platform);
    return (
      <>
        <div style={{ gridArea:'editor', background: T.chrome.editor, display:'flex', alignItems:'center', justifyContent:'center', color:T.chrome.fgFainter, fontFamily:'"Geist Mono",monospace' }}>
          <div style={{textAlign:'center', maxWidth: 420}}>
            <div style={{fontSize: 28, color: T.chrome.fg, marginBottom: 6, fontWeight:600}}>No file open</div>
            <div style={{fontSize: 13, lineHeight:1.6}}>
              press <Kbd>{mod}</Kbd> <Kbd>P</Kbd> to open a file<br/>
              press <Kbd>{mod}</Kbd> <Kbd>K</Kbd> to run a command<br/>
              press <Kbd>{mod}</Kbd> <Kbd>J</Kbd> to toggle the terminal
            </div>
          </div>
        </div>
        {showMinimap && <div style={{gridArea:'minimap', background: T.chrome.sidebar, borderLeft:'1px solid '+T.chrome.border}}/>}
      </>
    );
  }

  const body = window.PORTFOLIO_FS.files[active] || '(file not found)';
  const lang = (window.PORTFOLIO_FS.tree.find?.(n => n.path === active) || {}).lang
             || flattenLang(active);

  return (
    <>
      <div style={{
        gridArea:'editor', background: T.chrome.editor,
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <TabStrip tabs={tabs} active={active} setActive={setActive} closeTab={closeTab}/>
        <Breadcrumb path={active}/>
        <CodeBody body={body} lang={lang} motion={motion} tabKey={active} completedRef={completedRef} scrollKey={active}/>
      </div>
      {showMinimap && <Minimap body={body} lang={lang} scrollKey={active}/>}
    </>
  );
}

// Walk the tree for path's lang (handles nested paths the flat .find missed)
function flattenLang(path) {
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.path === path) return n.lang;
      if (n.children) {
        const r = walk(n.children);
        if (r) return r;
      }
    }
  };
  return walk(window.PORTFOLIO_FS.tree) || 'md';
}

function Kbd({ children }) {
  const T = useCtxE(window.ThemeCtx);
  return <span style={{
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    minWidth: 22, height: 22, padding:'0 6px', borderRadius:5,
    background: T.chrome.hoverBg, color: T.chrome.fg,
    fontFamily:'"Geist Mono",monospace', fontSize:11.5,
    border:'1px solid '+T.chrome.border, margin:'0 2px',
  }}>{children}</span>;
}

window.IDEEditor = EditorPane;
window.IDEKbd = Kbd;
window.flattenLang = flattenLang;
