// Sidebar = ActivityBar (icons, leftmost rail) + Panel (file tree / search /
// outline / source control / profile). Activity icon toggles which panel is
// shown. File rows are clickable and feed openFile() up.

const { useContext, useState, useRef, useEffect } = React;

function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  explorer: 'M3 5h7l2 2h9v12H3z',
  search:   'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm5 11.5l4.5 4.5',
  scm:      'M6 3v18 M18 3v6a6 6 0 0 1-6 6h-6',
  ext:      'M4 4h7v7H4z M13 13h7v7h-7z M13 4h7v7h-7z M4 13h7v7H4z',
  outline:  'M4 6h16 M4 12h10 M4 18h7',
};

function ActivityBar({ active, setActive, onSettings, settingsBtnRef, settingsActive }) {
  const T = useContext(window.ThemeCtx);
  const platform = useContext(window.PlatformCtx);
  const mod = window.modKey(platform);
  const sh  = window.shiftKey(platform);
  const sep = platform === 'mac' ? '' : '+';
  const items = [
    ['explorer', 'Explorer · '       + mod + sep + sh + sep + 'E'],
    ['search',   'Search · '         + mod + sep + sh + sep + 'F'],
    ['scm',      'Source Control · ' + mod + sep + sh + sep + 'G'],
    ['outline',  'Outline'],
    ['ext',      'Extensions · '     + mod + sep + sh + sep + 'X'],
  ];
  return (
    <div style={{
      gridArea:'activity', background: T.chrome.activityBar,
      borderRight: '1px solid ' + T.chrome.border,
      display:'flex', flexDirection:'column', alignItems:'center', paddingTop:6, gap:2,
    }}>
      {items.map(([k, title]) => (
        <button key={k} title={title}
          onClick={() => setActive(k)}
          style={{
            position:'relative', width:44, height:42, background:'transparent', border:0, padding:0,
            color: active === k ? T.chrome.fg : T.chrome.fgFainter, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition: 'color .15s',
          }}
        >
          {active === k && <span style={{position:'absolute', left:0, top:8, bottom:8, width:2, background:T.accent, borderRadius:2}}/>}
          <Icon d={ICONS[k]} />
        </button>
      ))}
      <div style={{flex:1}}/>
      <button
        ref={settingsBtnRef}
        title="Settings · themes & chrome"
        onClick={onSettings}
        style={{
          position:'relative', width:44, height:42, background:'transparent', border:0, padding:0,
          color: settingsActive ? T.chrome.fg : T.chrome.fgFainter, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'color .15s',
        }}
      >
        {settingsActive && <span style={{position:'absolute', left:0, top:8, bottom:8, width:2, background:T.accent, borderRadius:2}}/>}
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>
  );
}

// Recursive file tree row.
function TreeRow({ node, depth, openFile, activePath, expanded, toggleExpand }) {
  const T = useContext(window.ThemeCtx);
  const sel = node.type === 'file' && activePath === node.path;
  const isOpen = expanded[node.path];
  const name = node.path.split('/').pop();
  const padLeft = 6 + depth * 14;

  const iconFor = (n) => {
    if (n.type === 'dir') return isOpen ? '▾' : '▸';
    if (n.path.endsWith('.md'))   return 'M';
    if (n.path.endsWith('.json')) return '{}';
    if (n.path.endsWith('.yaml')) return 'Y';
    if (n.path.endsWith('.gitconfig')) return '⎇';
    return '·';
  };
  const iconColor = (n) => {
    if (n.type === 'dir') return T.chrome.fgDim;
    if (n.path.endsWith('.md'))   return T.syntax.hdr1;
    if (n.path.endsWith('.json')) return T.syntax.jsonNum;
    if (n.path.endsWith('.yaml')) return T.syntax.yamlKey;
    if (n.path.endsWith('.gitconfig')) return T.syntax.iniSection;
    return T.chrome.fgDim;
  };

  return (
    <>
      <div
        onClick={() => node.type === 'dir' ? toggleExpand(node.path) : openFile(node.path)}
        style={{
          display:'flex', alignItems:'center', gap:6,
          padding: '3px 0 3px ' + padLeft + 'px',
          color: sel ? T.chrome.fg : T.chrome.fgDim,
          background: sel ? T.chrome.selBg : 'transparent',
          fontSize: 12.5, cursor:'pointer', position:'relative',
          animation: 'sj-row-in .2s ease-out',
        }}
        onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = T.chrome.hoverBg; }}
        onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
      >
        {sel && <span style={{position:'absolute', left:0, top:0, bottom:0, width:2, background:T.accent}}/>}
        <span style={{
          width:14, textAlign:'center',
          color: iconColor(node), fontFamily:'"Geist Mono",monospace', fontSize:10.5, fontWeight:600,
        }}>{iconFor(node)}</span>
        <span style={{fontFamily:'"IBM Plex Mono",monospace'}}>{name}</span>
      </div>
      {node.type === 'dir' && isOpen && node.children?.map(c => (
        <TreeRow key={c.path} node={c} depth={depth+1}
          openFile={openFile} activePath={activePath}
          expanded={expanded} toggleExpand={toggleExpand}/>
      ))}
    </>
  );
}

function SidebarHeader({ children }) {
  const T = useContext(window.ThemeCtx);
  return <div style={{fontSize:10.5, letterSpacing:'0.18em', textTransform:'uppercase', color:T.chrome.fgFainter, padding:'10px 14px 6px', fontFamily:'"Geist Mono",monospace'}}>{children}</div>;
}

function ExplorerPanel({ openFile, activePath }) {
  const T = useContext(window.ThemeCtx);
  const [expanded, setExpanded] = useState({ projects: true, writing: true });
  const toggleExpand = (p) => setExpanded(s => ({...s, [p]: !s[p]}));

  return (
    <>
      <SidebarHeader>Portfolio</SidebarHeader>
      <div onClick={() => toggleExpand(window.PORTFOLIO_FS.root)}
        style={{display:'flex', gap:6, padding:'3px 8px', color: T.chrome.fg, fontSize:12.5, cursor:'pointer', fontFamily:'"IBM Plex Mono",monospace'}}>
        <span style={{color:T.chrome.fgDim, width:14, textAlign:'center'}}>▾</span>
        <span style={{fontWeight:500}}>{window.PORTFOLIO_FS.root}/</span>
      </div>
      {window.PORTFOLIO_FS.tree.map(n => (
        <TreeRow key={n.path} node={n} depth={1}
          openFile={openFile} activePath={activePath}
          expanded={expanded} toggleExpand={toggleExpand}/>
      ))}
    </>
  );
}

function OutlinePanel({ activePath, jumpTo }) {
  const T = useContext(window.ThemeCtx);
  const [activeHeading, setActiveHeading] = useState(-1);

  // Listen for editor scroll-spy events so the active heading lights up
  // as the user scrolls through the file.
  useEffect(() => {
    const h = (e) => { if (e.detail.path === activePath) setActiveHeading(e.detail.line); };
    window.addEventListener('sj-active-heading', h);
    return () => window.removeEventListener('sj-active-heading', h);
  }, [activePath]);

  if (!activePath) return <div style={{padding:14, color:T.chrome.fgFainter, fontSize:12}}>No active file.</div>;
  const body = window.PORTFOLIO_FS.files[activePath] || '';
  const outline = window.extractOutline(body);
  return (
    <>
      <SidebarHeader>Outline · {activePath}</SidebarHeader>
      {outline.length === 0 && <div style={{padding:'4px 14px', color:T.chrome.fgFainter, fontSize:12}}>no headings</div>}
      {outline.map((h, i) => {
        const isActive = h.line === activeHeading;
        return (
          <div key={i}
            onClick={() => window.IDE_JUMP_TO?.(h.line)}
            style={{
              display:'flex', gap:8, padding:'3px 0 3px ' + (6 + h.depth*14) + 'px',
              color: isActive ? T.chrome.fg : T.chrome.fgDim,
              background: isActive ? T.chrome.selBg : 'transparent',
              fontSize:12.5, cursor:'pointer', position:'relative',
              fontFamily:'"IBM Plex Mono",monospace',
              transition:'background .15s, color .15s',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = T.chrome.hoverBg; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {isActive && <span style={{position:'absolute', left:0, top:0, bottom:0, width:2, background:T.accent}}/>}
            <span style={{width:14, textAlign:'center', color: h.depth === 1 ? T.syntax.hdr1 : T.chrome.fgFainter, fontWeight:600, fontSize:10.5}}>#</span>
            <span>{h.text}</span>
          </div>
        );
      })}
    </>
  );
}

function SearchPanel() {
  const T = useContext(window.ThemeCtx);
  return (
    <>
      <SidebarHeader>Search</SidebarHeader>
      <div style={{padding:'0 12px 10px'}}>
        <input placeholder="Search portfolio" style={{
          width:'100%', padding:'6px 10px', borderRadius:6, border:'1px solid '+T.chrome.borderStrong,
          background:T.chrome.editor, color:T.chrome.fg, fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
        }}/>
      </div>
      <div style={{padding:'6px 14px', color:T.chrome.fgFainter, fontSize:12}}>type to search file contents</div>
    </>
  );
}

function ScmPanel() {
  const T = useContext(window.ThemeCtx);
  const commits = [
    { hash: 'a3f8c2d', msg: 'docs: refresh /now for week of May 19',  age: '2h' },
    { hash: '4e1b9f0', msg: 'feat: ship Foxtrot beta to TestFlight',  age: '3d' },
    { hash: '7c2d815', msg: 'chore: update experience.json',          age: '1w' },
    { hash: '2a90f7c', msg: 'docs: write up Alpha case study',        age: '2w' },
    { hash: 'b18e3d4', msg: 'feat: add /writing section',             age: '1mo' },
  ];
  return (
    <>
      <SidebarHeader>Source Control · main</SidebarHeader>
      <div style={{padding:'6px 14px', color:T.chrome.fgDim, fontSize:12}}>
        <span style={{color:'#7be39a'}}>✓</span> working tree clean
      </div>
      <SidebarHeader>Recent commits</SidebarHeader>
      {commits.map(c => (
        <div key={c.hash} style={{padding:'4px 14px', fontFamily:'"IBM Plex Mono",monospace', fontSize:12}}>
          <div style={{color:T.chrome.fg}}>{c.msg}</div>
          <div style={{color:T.chrome.fgFainter, fontSize:11}}>{c.hash} · {c.age} ago</div>
        </div>
      ))}
    </>
  );
}

function ExtPanel() {
  const T = useContext(window.ThemeCtx);
  const exts = [
    ['Curiosity',    'Built-in', '★★★★★'],
    ['Boring Tech',  'Built-in', '★★★★★'],
    ['Async Mode',   'Enabled',  '★★★★☆'],
    ['Crypto Bro',   'Disabled', '☆☆☆☆☆'],
  ];
  return (
    <>
      <SidebarHeader>Extensions</SidebarHeader>
      {exts.map(([n, st, r], i) => (
        <div key={i} style={{padding:'8px 14px', borderBottom:'1px solid '+T.chrome.border, fontFamily:'"IBM Plex Mono",monospace'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span style={{color:T.chrome.fg, fontSize:13}}>{n}</span>
            <span style={{color:T.chrome.fgFainter, fontSize:11}}>{st}</span>
          </div>
          <div style={{color:T.syntax.code, fontSize:11, marginTop:2}}>{r}</div>
        </div>
      ))}
    </>
  );
}

function SettingsPopover({ anchorRef, onClose, tweaks, setTweak }) {
  const T = useContext(window.ThemeCtx);
  const [pos, setPos] = useState({ left: 50, bottom: 36 });

  // Anchor to the gear button: pop opens to its right, aligned to the
  // button's bottom edge so the menu rises upward.
  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ left: r.right + 6, bottom: window.innerHeight - r.bottom });
  }, [anchorRef]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const themes = window.IDE_THEMES;
  return (
    <>
      <div onClick={onClose} style={{position:'fixed', inset:0, zIndex: 2000}}/>
      <div style={{
        position:'fixed', left: pos.left, bottom: pos.bottom,
        width: 280, zIndex: 2001,
        background: T.chrome.editor,
        borderRadius: 12,
        boxShadow: '0 18px 50px rgba(0,0,0,0.45), 0 0 0 1px '+T.chrome.borderStrong,
        padding: 6,
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        animation: 'sj-pop-in .14s ease-out',
      }}>
        <PopHeader T={T}>Theme</PopHeader>
        {Object.entries(themes).map(([k, th]) => (
          <ThemeRow key={k} themeDef={th}
            active={tweaks.theme === k}
            onClick={() => setTweak('theme', k)} T={T}/>
        ))}

        <div style={{height:1, background:T.chrome.border, margin:'6px 4px'}}/>

        <PopHeader T={T}>Window chrome</PopHeader>
        <Segmented
          value={tweaks.chrome}
          options={[
            { value:'auto',    label:'auto' },
            { value:'mac',     label:'macOS' },
            { value:'windows', label:'Windows' },
            { value:'linux',   label:'Linux' },
          ]}
          onChange={(v) => setTweak('chrome', v)} T={T}
        />

        <div style={{height:1, background:T.chrome.border, margin:'8px 4px'}}/>

        <button
          onClick={() => { onClose(); window.parent?.postMessage({type:'__activate_edit_mode'}, '*'); }}
          style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            width:'100%', padding:'8px 10px', border:0, borderRadius:6,
            background:'transparent', color: T.chrome.fgDim, cursor:'pointer',
            fontFamily:'inherit', fontSize:12.5, textAlign:'left',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span>More tweaks…</span>
          <span style={{color: T.chrome.fgFainter, fontFamily:'"Geist Mono",monospace', fontSize:11}}>↗</span>
        </button>
      </div>
      <style>{`
        @keyframes sj-pop-in {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

function PopHeader({ T, children }) {
  return <div style={{
    fontFamily:'"Geist Mono",monospace', fontSize:10,
    letterSpacing:'0.18em', textTransform:'uppercase',
    color: T.chrome.fgFainter, padding:'8px 10px 6px',
  }}>{children}</div>;
}

function ThemeRow({ themeDef, active, onClick, T }) {
  const swatch = [
    themeDef.chrome.editor,
    themeDef.accent,
    themeDef.syntax.hdr1,
    themeDef.syntax.code,
  ];
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', padding:'8px 10px', border:0, borderRadius:6,
      background: active ? T.chrome.selBg : 'transparent',
      color: T.chrome.fg, cursor:'pointer', textAlign:'left',
      fontFamily:'inherit', transition:'background .12s',
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.chrome.hoverBg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{display:'flex', alignItems:'center', gap:10}}>
        <span style={{display:'inline-flex', borderRadius:4, overflow:'hidden', boxShadow:'0 0 0 1px '+T.chrome.borderStrong}}>
          {swatch.map((c, i) => <span key={i} style={{width:10, height:18, background:c}}/>)}
        </span>
        <span style={{fontSize:12.5}}>{themeDef.name}</span>
      </span>
      {active && <span style={{color:T.accent, fontFamily:'"Geist Mono",monospace'}}>✓</span>}
    </button>
  );
}

function Segmented({ value, options, onChange, T }) {
  return (
    <div style={{display:'flex', background: T.chrome.hoverBg, borderRadius:7, padding:2, margin:'0 6px'}}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              flex:1, padding:'6px 4px', border:0, borderRadius:5,
              background: active ? T.chrome.tabActive : 'transparent',
              color: active ? T.chrome.fg : T.chrome.fgDim,
              cursor:'pointer', fontSize:11.5,
              fontFamily:'"Geist Mono",monospace',
              transition:'background .12s, color .12s',
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}

function Sidebar({ activePanel, setActivePanel, openFile, activePath, jumpTo, visible = true, tweaks, setTweak }) {
  const T = useContext(window.ThemeCtx);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef(null);
  let panel = null;
  if (activePanel === 'explorer') panel = <ExplorerPanel openFile={openFile} activePath={activePath}/>;
  else if (activePanel === 'search') panel = <SearchPanel/>;
  else if (activePanel === 'scm') panel = <ScmPanel/>;
  else if (activePanel === 'outline') panel = <OutlinePanel activePath={activePath} jumpTo={jumpTo}/>;
  else if (activePanel === 'ext') panel = <ExtPanel/>;
  return (
    <>
      <ActivityBar
        active={activePanel} setActive={setActivePanel}
        onSettings={() => setSettingsOpen(o => !o)}
        settingsBtnRef={settingsBtnRef}
        settingsActive={settingsOpen}
      />
      {visible && <div style={{
        gridArea:'sidebar', background: T.chrome.sidebar,
        borderRight:'1px solid '+T.chrome.border,
        overflow:'auto', paddingBottom:8,
      }}>
        {panel}
      </div>}
      {settingsOpen && tweaks && setTweak && (
        <SettingsPopover
          anchorRef={settingsBtnRef}
          onClose={() => setSettingsOpen(false)}
          tweaks={tweaks} setTweak={setTweak}
        />
      )}
    </>
  );
}

window.IDESidebar = Sidebar;

// Inject the row-mount keyframe once. Used by TreeRow to animate children
// sliding in when a folder is expanded.
if (typeof document !== 'undefined' && !document.getElementById('sj-sidebar-anim')) {
  const s = document.createElement('style');
  s.id = 'sj-sidebar-anim';
  s.textContent = '@keyframes sj-row-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }';
  document.head.appendChild(s);
}
