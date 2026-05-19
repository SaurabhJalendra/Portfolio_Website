// Main app: branches between MobileApp (<900px) and DesktopShell (everything
// else). The split into two components keeps each function's hook set
// stable across renders — switching between mobile and desktop unmounts
// one and mounts the other, which is the correct way to vary hook count.

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

function App() {
  // Tweaks state — persisted to disk via the host editor protocol.
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "midnight",
    "chrome": "auto",
    "motion": true,
    "scanlines": false,
    "sidebar": true,
    "minimap": false,
    "assistant": true,
    "terminal": true,
    "avatar": ">_"
  }/*EDITMODE-END*/);

  const theme = window.IDE_THEMES[tweaks.theme] || window.IDE_THEMES.midnight;
  const platform = tweaks.chrome === 'auto' ? window.detectPlatform() : tweaks.chrome;
  const isMobile = window.useIsMobile ? window.useIsMobile(900) : false;

  return (
    <window.ThemeCtx.Provider value={theme}>
    <window.PlatformCtx.Provider value={platform}>
      {isMobile && window.MobileApp
        ? <window.MobileApp tweaks={tweaks} setTweak={setTweak}/>
        : <DesktopShell tweaks={tweaks} setTweak={setTweak} theme={theme}/>}
      {window.IDEToasts && <window.IDEToasts/>}
      <window.IDETweaks tweaks={tweaks} setTweak={setTweak}/>
    </window.PlatformCtx.Provider>
    </window.ThemeCtx.Provider>
  );
}

function DesktopShell({ tweaks, setTweak, theme }) {
  // IDE runtime state (ephemeral)
  const [tabs, setTabs] = useStateA(['README.md', 'about.md', 'projects/alpha.md']);
  const [activeTab, setActiveTab] = useStateA('README.md');
  const [sidebarPanel, setSidebarPanel] = useStateA('explorer');
  const [paletteMode, setPaletteMode] = useStateA(null);

  // Narrow desktop: between 900-1100px we auto-hide assistant + minimap so
  // the editor stays usable. User tweaks are preserved.
  const [narrow, setNarrow] = useStateA(() => typeof window !== 'undefined' && window.innerWidth < 1100);
  useEffectA(() => {
    const h = () => setNarrow(window.innerWidth < 1100);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const showAssistant = tweaks.assistant && !narrow;
  const showMinimap   = tweaks.minimap   && !narrow;

  function openFile(path) {
    setTabs(t => t.includes(path) ? t : [...t, path]);
    setActiveTab(path);
  }
  function closeTab(path) {
    setTabs(t => {
      const i = t.indexOf(path);
      const next = t.filter(x => x !== path);
      if (path === activeTab) {
        const fallback = next[i] || next[i - 1] || next[0] || null;
        setActiveTab(fallback);
      }
      return next;
    });
  }
  function moveTab(fromPath, toPath) {
    if (fromPath === toPath) return;
    setTabs(t => {
      const from = t.indexOf(fromPath);
      const to   = t.indexOf(toPath);
      if (from === -1 || to === -1) return t;
      const next = t.slice();
      next.splice(from, 1);
      next.splice(to, 0, fromPath);
      return next;
    });
  }

  // Global hotkeys
  useEffectA(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape' && paletteMode) { e.preventDefault(); setPaletteMode(null); return; }
      if (!mod) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setPaletteMode('quickopen'); }
      else if (e.key === 'k' || e.key === 'K') { e.preventDefault(); setPaletteMode('commands'); }
      else if (e.key === 'j' || e.key === 'J') { e.preventDefault(); setTweak('terminal', !tweaks.terminal); }
      else if (e.key === 'w' || e.key === 'W') {
        if (activeTab) { e.preventDefault(); closeTab(activeTab); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteMode, activeTab, tweaks.terminal, setTweak]);

  // Toast on theme change — small confirmation that the swap landed.
  const prevThemeRef = React.useRef(tweaks.theme);
  useEffectA(() => {
    if (prevThemeRef.current !== tweaks.theme) {
      const name = window.IDE_THEMES[tweaks.theme]?.name || tweaks.theme;
      window.IDE_TOAST?.('Theme → ' + name, 'ok');
      prevThemeRef.current = tweaks.theme;
    }
  }, [tweaks.theme]);

  // Layout grid.
  const grid = useMemoA(() => {
    const sidebarCol   = tweaks.sidebar   ? '240px' : '0';
    const minimapCol   = showMinimap     ? '76px'  : '0';
    const assistantCol = showAssistant   ? '360px' : '0';
    const panelRow     = tweaks.terminal  ? '230px' : '0';
    return {
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: `46px ${sidebarCol} 1fr ${assistantCol} ${minimapCol}`,
      gridTemplateRows: `30px 1fr ${panelRow} 24px`,
      gridTemplateAreas: `
        "titlebar  titlebar  titlebar  titlebar  titlebar"
        "activity  sidebar   editor    assist    minimap"
        "panel     panel     panel     panel     panel"
        "statusbar statusbar statusbar statusbar statusbar"
      `,
      background: theme.chrome.editor,
      color: theme.chrome.fg,
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      position: 'relative',
      transition: 'grid-template-columns .22s ease, grid-template-rows .22s ease',
    };
  }, [tweaks.minimap, tweaks.terminal, tweaks.assistant, tweaks.sidebar, theme, showAssistant, showMinimap]);

  return (
    <div style={grid} data-screen-label="01 IDE Portfolio">
      <window.IDETitleBar activeFile={activeTab} dirty={false} tweaks={tweaks} setTweak={setTweak}/>
      <window.IDESidebar
        activePanel={sidebarPanel}
        setActivePanel={setSidebarPanel}
        openFile={openFile}
        activePath={activeTab}
        visible={tweaks.sidebar}
        tweaks={tweaks}
        setTweak={setTweak}
      />
      <window.IDEEditor
        tabs={tabs}
        active={activeTab}
        setActive={setActiveTab}
        closeTab={closeTab}
        moveTab={moveTab}
        motion={tweaks.motion}
        showMinimap={showMinimap}
      />
      <window.IDEAssistant
        openFile={openFile}
        onClose={() => setTweak('assistant', false)}
        visible={showAssistant}
        avatar={tweaks.avatar}
      />
      <window.IDETerminal
        openFile={openFile}
        setTheme={(name) => setTweak('theme', name)}
        themeName={tweaks.theme}
        visible={tweaks.terminal}
        onClose={() => setTweak('terminal', false)}
      />
      <window.IDEStatusBar
        activeFile={activeTab}
        line={1}
        col={1}
        motion={tweaks.motion}
        themeName={tweaks.theme}
      />

      <window.IDEPalette
        kind={paletteMode}
        onClose={() => setPaletteMode(null)}
        openFile={openFile}
        setTheme={(name) => setTweak('theme', name)}
        themeName={tweaks.theme}
        setTerminalVisible={(fn) => setTweak('terminal', typeof fn === 'function' ? fn(tweaks.terminal) : fn)}
        terminalVisible={tweaks.terminal}
        setMotion={(fn) => setTweak('motion', typeof fn === 'function' ? fn(tweaks.motion) : fn)}
        motion={tweaks.motion}
        setShowMinimap={(fn) => setTweak('minimap', typeof fn === 'function' ? fn(tweaks.minimap) : fn)}
        showMinimap={tweaks.minimap}
        setAssistantVisible={(fn) => setTweak('assistant', typeof fn === 'function' ? fn(tweaks.assistant) : fn)}
        assistantVisible={tweaks.assistant}
      />

      {tweaks.scanlines && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
          mixBlendMode:'multiply', zIndex: 1500,
        }}/>
      )}

      {window.IDESplash && <window.IDESplash/>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('ide-root'));
root.render(<App/>);
