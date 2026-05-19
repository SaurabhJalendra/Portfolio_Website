// Sidebar = ActivityBar (icons, leftmost rail) + Panel (file tree / search /
// outline / source control / profile). Activity icon toggles which panel is
// shown. File rows are clickable and feed openFile() up.

const { useContext, useState } = React;

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

function ActivityBar({ active, setActive }) {
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
      <button title="Profile" style={{
        width:44, height:42, background:'transparent', border:0, padding:0,
        color: T.chrome.fgFainter, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1-5 5-7 8-7s7 2 8 7"/>
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
  if (!activePath) return <div style={{padding:14, color:T.chrome.fgFainter, fontSize:12}}>No active file.</div>;
  const body = window.PORTFOLIO_FS.files[activePath] || '';
  const outline = window.extractOutline(body);
  return (
    <>
      <SidebarHeader>Outline · {activePath}</SidebarHeader>
      {outline.length === 0 && <div style={{padding:'4px 14px', color:T.chrome.fgFainter, fontSize:12}}>no headings</div>}
      {outline.map((h, i) => (
        <div key={i}
          onClick={() => jumpTo?.(h.line)}
          style={{
            display:'flex', gap:8, padding:'3px 0 3px ' + (6 + h.depth*14) + 'px',
            color: T.chrome.fgDim, fontSize:12.5, cursor:'pointer',
            fontFamily:'"IBM Plex Mono",monospace',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = T.chrome.hoverBg}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{width:14, textAlign:'center', color: h.depth === 1 ? T.syntax.hdr1 : T.chrome.fgFainter, fontWeight:600, fontSize:10.5}}>#</span>
          <span>{h.text}</span>
        </div>
      ))}
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

function Sidebar({ activePanel, setActivePanel, openFile, activePath, jumpTo }) {
  const T = useContext(window.ThemeCtx);
  let panel = null;
  if (activePanel === 'explorer') panel = <ExplorerPanel openFile={openFile} activePath={activePath}/>;
  else if (activePanel === 'search') panel = <SearchPanel/>;
  else if (activePanel === 'scm') panel = <ScmPanel/>;
  else if (activePanel === 'outline') panel = <OutlinePanel activePath={activePath} jumpTo={jumpTo}/>;
  else if (activePanel === 'ext') panel = <ExtPanel/>;
  return (
    <>
      <ActivityBar active={activePanel} setActive={setActivePanel}/>
      <div style={{
        gridArea:'sidebar', background: T.chrome.sidebar,
        borderRight:'1px solid '+T.chrome.border,
        overflow:'auto', paddingBottom:8,
      }}>
        {panel}
      </div>
    </>
  );
}

window.IDESidebar = Sidebar;
