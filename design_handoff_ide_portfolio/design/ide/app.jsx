// Main app: assembles all panels, owns state (open tabs, active file, active
// sidebar panel, theme, motion, terminal visibility, palette mode) and binds
// global keyboard shortcuts.

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

function App() {
  // Tweaks state — persisted to disk via the host editor protocol.
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "midnight",
    "chrome": "auto",
    "motion": true,
    "scanlines": false,
    "minimap": false,
    "assistant": true,
    "terminal": true
  }/*EDITMODE-END*/);

  const theme = window.IDE_THEMES[tweaks.theme] || window.IDE_THEMES.midnight;
  const platform = tweaks.chrome === 'auto' ? window.detectPlatform() : tweaks.chrome;

  // IDE runtime state (ephemeral)
  const [tabs, setTabs] = useStateA(['README.md', 'about.md', 'projects/alpha.md']);
  const [activeTab, setActiveTab] = useStateA('README.md');
  const [sidebarPanel, setSidebarPanel] = useStateA('explorer');
  const [paletteMode, setPaletteMode] = useStateA(null); // 'quickopen' | 'commands' | null

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

  // Global hotkeys
  useEffectA(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      // Escape closes palette
      if (e.key === 'Escape' && paletteMode) { e.preventDefault(); setPaletteMode(null); return; }
      if (!mod) return;
      // ⌘P quick open
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setPaletteMode('quickopen'); }
      // ⌘K commands
      else if (e.key === 'k' || e.key === 'K') { e.preventDefault(); setPaletteMode('commands'); }
      // ⌘J toggle terminal
      else if (e.key === 'j' || e.key === 'J') { e.preventDefault(); setTweak('terminal', !tweaks.terminal); }
      // ⌘W close tab
      else if (e.key === 'w' || e.key === 'W') {
        if (activeTab) { e.preventDefault(); closeTab(activeTab); }
      }
      // ⌘B toggle sidebar would go here; skipping for now to keep layout stable
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteMode, activeTab, tweaks.terminal, setTweak]);

  // Layout grid — depends on whether minimap/terminal/assistant are shown.
  const grid = useMemoA(() => {
    const minimapCol   = tweaks.minimap   ? '76px'  : '0';
    const assistantCol = tweaks.assistant ? '360px' : '0';
    const panelRow     = tweaks.terminal  ? '230px' : '0';
    return {
      width: '100vw', height: '100vh', overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: `46px 240px 1fr ${assistantCol} ${minimapCol}`,
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
    };
  }, [tweaks.minimap, tweaks.terminal, tweaks.assistant, theme]);

  return (
    <window.ThemeCtx.Provider value={theme}>
    <window.PlatformCtx.Provider value={platform}>
      <div style={grid} data-screen-label="01 IDE Portfolio">
        <window.IDETitleBar activeFile={activeTab} dirty={false}/>
        <window.IDESidebar
          activePanel={sidebarPanel}
          setActivePanel={setSidebarPanel}
          openFile={openFile}
          activePath={activeTab}
        />
        <window.IDEEditor
          tabs={tabs}
          active={activeTab}
          setActive={setActiveTab}
          closeTab={closeTab}
          motion={tweaks.motion}
          showMinimap={tweaks.minimap}
        />
        <window.IDEAssistant
          openFile={openFile}
          onClose={() => setTweak('assistant', false)}
          visible={tweaks.assistant}
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

        <window.IDETweaks tweaks={tweaks} setTweak={setTweak}/>
      </div>
    </window.PlatformCtx.Provider>
    </window.ThemeCtx.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('ide-root'));
root.render(<App/>);
