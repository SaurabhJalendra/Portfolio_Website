// Top title bar + bottom status bar.
// The title bar adapts to platform — Mac shows traffic lights on the left;
// Windows/Linux show minimize/maximize/close controls on the right.

const { useContext: useCtxS } = React;

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

function TitleBar({ activeFile, dirty }) {
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
  return (
    <div style={{
      gridArea:'statusbar', background: T.chrome.statusBar,
      color: T.chrome.statusBarFg, fontWeight: 500, fontSize: 11.5,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 12px',
      fontFamily:'"Geist Mono",monospace',
    }}>
      <div style={{display:'flex', gap:18}}>
        <span title="branch">⎇ main</span>
        <span title="sync">↑0 ↓0</span>
        <span>✓ 0 errors · 0 warnings</span>
        <span>● Available — Q3 2026</span>
      </div>
      <div style={{display:'flex', gap:18}}>
        <span>Ln {line}, Col {col}</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>{langLabel}</span>
        <span>{themeName}</span>
        <span>{platform}</span>
        <span>saurabhjalendra.com</span>
      </div>
    </div>
  );
}

window.IDETitleBar = TitleBar;
window.IDEStatusBar = StatusBar;
