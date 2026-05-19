// Top title bar + bottom status bar.
// The title bar adapts to platform — Mac shows traffic lights on the left;
// Windows/Linux show minimize/maximize/close controls on the right.
// Layout-toggle buttons live in the right cluster (a la VS Code).

const { useContext: useCtxS, useState: useStateS, useEffect: useEffectS } = React;

// Mac "traffic lights" — three colored circles, no actual close action.
function MacWindowControls() {
  return (
    <div style={{display:'flex', gap:6, marginRight:14}}>
      <div style={{width:11, height:11, borderRadius:'50%', background:'#ff5f57'}}/>
      <div style={{width:11, height:11, borderRadius:'50%', background:'#febc2e'}}/>
      <div style={{width:11, height:11, borderRadius:'50%', background:'#28c840'}}/>
    </div>
  );
}

// Windows 11 controls — minimize / maximize / close at the right edge.
// Each button is a flat hit area that fills the full title-bar height.
function WindowsWindowControls() {
  const T = useCtxS(window.ThemeCtx);
  const btn = {
    height: 30, width: 46, background:'transparent', border:0,
    display:'flex', alignItems:'center', justifyContent:'center',
    cursor:'default', color: T.chrome.fg, transition:'background .12s',
  };
  return (
    <div style={{display:'flex', marginLeft:14}}>
      <button title="Minimize"
        style={btn}
        onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1"/></svg>
      </button>
      <button title="Maximize"
        style={btn}
        onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
      </button>
      <button title="Close"
        style={btn}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#e81123'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.chrome.fg; }}>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1"/>
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </button>
    </div>
  );
}

// Linux/GNOME-flavored: close-only at the right, soft round.
function LinuxWindowControls() {
  return (
    <div style={{display:'flex', marginLeft:14, alignItems:'center'}}>
      <button title="Close" style={{
        width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,0.08)',
        border:0, color:'#cdd6df', display:'flex', alignItems:'center', justifyContent:'center', cursor:'default',
      }}>
        <svg width="8" height="8" viewBox="0 0 10 10">
          <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </button>
    </div>
  );
}

function LayoutControls({ tweaks, setTweak }) {
  const T = useCtxS(window.ThemeCtx);
  function Btn({ active, onClick, title, children }) {
    return (
      <button title={title} onClick={onClick} style={{
        width:28, height:22, padding:0, border:0, borderRadius:4, cursor:'pointer',
        background:'transparent', color: active ? T.chrome.fg : T.chrome.fgFainter,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'background .12s, color .12s',
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >{children}</button>
    );
  }
  const stroke = { fill:'none', stroke:'currentColor', strokeWidth: 1.2 };
  return (
    <div style={{display:'flex', gap:2, marginRight:6}}>
      <Btn
        active={tweaks.sidebar !== false}
        onClick={() => setTweak('sidebar', tweaks.sidebar === false)}
        title={(tweaks.sidebar !== false ? 'Hide' : 'Show') + ' Primary Sidebar'}
      >
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" {...stroke}/>
          {tweaks.sidebar !== false && <rect x="1.5" y="2.5" width="4" height="11" fill="currentColor"/>}
        </svg>
      </Btn>
      <Btn
        active={tweaks.terminal}
        onClick={() => setTweak('terminal', !tweaks.terminal)}
        title={(tweaks.terminal ? 'Hide' : 'Show') + ' Panel'}
      >
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" {...stroke}/>
          {tweaks.terminal && <rect x="1.5" y="9.5" width="13" height="4" fill="currentColor"/>}
        </svg>
      </Btn>
      <Btn
        active={tweaks.assistant}
        onClick={() => setTweak('assistant', !tweaks.assistant)}
        title={(tweaks.assistant ? 'Hide' : 'Show') + ' Secondary Sidebar'}
      >
        <svg width="15" height="15" viewBox="0 0 16 16">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" {...stroke}/>
          {tweaks.assistant && <rect x="10.5" y="2.5" width="4" height="11" fill="currentColor"/>}
        </svg>
      </Btn>
    </div>
  );
}

function TitleBar({ activeFile, dirty, tweaks, setTweak }) {
  const T = useCtxS(window.ThemeCtx);
  const platform = useCtxS(window.PlatformCtx);

  const leftControls  = platform === 'mac' ? <MacWindowControls/> : null;
  const rightControls = platform === 'windows' ? <WindowsWindowControls/>
                      : platform === 'linux'   ? <LinuxWindowControls/>
                      : null;

  return (
    <div style={{
      gridArea:'titlebar', background: T.chrome.titlebar,
      borderBottom:'1px solid '+T.chrome.border,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      paddingLeft: 14,
      paddingRight: platform === 'mac' ? 14 : 0, // Windows controls are flush
      fontSize:11.5, color: T.chrome.fgDim, fontFamily:'"Geist Mono",monospace',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:14}}>
        {leftControls}
        <span style={{color:T.chrome.fgFainter}}>~/saurabhjalendra</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        {activeFile && <span>{activeFile.split('/').pop()}{dirty ? ' ●' : ''} — Editor</span>}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:14, color:T.chrome.fgFainter}}>
        {tweaks && <LayoutControls tweaks={tweaks} setTweak={setTweak}/>}
        <span style={{display:'flex', gap:14, alignItems:'center', paddingRight: platform === 'mac' ? 0 : 6}}>
          <span>main</span>
          <span>↻</span>
          <span>⚙</span>
        </span>
        {rightControls}
      </div>
    </div>
  );
}

function StatusBar({ activeFile, line, col, motion, themeName }) {
  const T = useCtxS(window.ThemeCtx);
  const platform = useCtxS(window.PlatformCtx);
  const ext = activeFile?.split('.').pop() || '';
  const langLabel = ext === 'md' ? 'Markdown' : ext === 'json' ? 'JSON' : ext === 'yaml' ? 'YAML' : ext === 'gitconfig' ? 'INI' : '—';

  // One rotating ticker that alternates between a recent commit and a
  // keyboard tip — keeps the bar lively without piling content.
  const mod = window.modKey(platform);
  const ticks = [
    { kind:'commit', text:'docs: refresh /now for week of May 19' },
    { kind:'tip',    text:'press ' + mod + 'P to open any file' },
    { kind:'commit', text:'feat: ship Foxtrot beta to TestFlight' },
    { kind:'tip',    text:'press ' + mod + 'K to run a command' },
    { kind:'commit', text:'docs: write up Alpha case study' },
    { kind:'tip',    text:'click ↗ chips in the assistant to fly into a tab' },
  ];
  const [tIdx, setTIdx] = useStateS(0);
  useEffectS(() => { const id = setInterval(() => setTIdx(i => (i + 1) % ticks.length), 6000); return () => clearInterval(id); }, []);
  const tick = ticks[tIdx];
  const tickIcon = tick.kind === 'commit' ? '⎇' : 'tip ·';

  return (
    <div style={{
      gridArea:'statusbar', background: T.chrome.statusBar,
      color: T.chrome.statusBarFg, fontWeight: 500, fontSize: 11.5,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 12px', gap: 12,
      fontFamily:'"Geist Mono",monospace',
    }}>
      <div style={{display:'flex', gap:18, alignItems:'center', minWidth: 0}}>
        <span title="branch">⎇ main</span>
        <span>✓ 0 errors</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
          <span style={{position:'relative', width:8, height:8}}>
            <span style={{position:'absolute', inset:0, borderRadius:'50%', background:T.chrome.statusBarFg, opacity:0.85}}/>
            <span style={{position:'absolute', inset:-3, borderRadius:'50%', background:T.chrome.statusBarFg, opacity:0.18, animation:'sj-halo 2.4s ease-in-out infinite'}}/>
          </span>
          Available — Q3 2026
        </span>
        <span key={tIdx} style={{
          opacity: 0.78, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          animation:'sj-tick-in .26s ease-out',
        }} title={tick.kind === 'commit' ? 'recent commit' : 'shortcut hint'}>
          {tickIcon} {tick.text}
        </span>
      </div>
      <div style={{display:'flex', gap:18, flex:'0 0 auto'}}>
        <span>Ln {line}, Col {col}</span>
        <span>{langLabel}</span>
        <span>{themeName}</span>
        <span>saurabhjalendra.com</span>
      </div>
      <style>{`
        @keyframes sj-halo { 0%,100%{ transform:scale(1); opacity:0.18 } 50%{ transform:scale(1.6); opacity:0 } }
        @keyframes sj-tick-in { from { opacity:0; transform:translateY(2px); } to { opacity:0.78; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

window.IDETitleBar = TitleBar;
window.IDEStatusBar = StatusBar;
