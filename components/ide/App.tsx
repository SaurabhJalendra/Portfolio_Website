"use client";

// Main app: branches between MobileApp (<900px) and DesktopShell (everything
// else). The split into two components keeps each function's hook set
// stable across renders — switching between mobile and desktop unmounts
// one and mounts the other, which is the correct way to vary hook count.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IDE_THEMES, ThemeCtx } from '@/lib/theme';
import { PlatformCtx, detectPlatform } from '@/lib/platform';
import { installFlyToTab } from '@/lib/fly';
import type { Tweaks, SetTweak, Platform, ThemeName } from '@/types/ide';

import { TitleBar, StatusBar } from './Chrome';
import Sidebar, { type ActivePanel } from './Sidebar';
import EditorPane from './Editor';
import Terminal from './Terminal';
import AssistantPanel from './Assistant';
import PaletteOverlay, { type PaletteKind } from './Palette';
import Toasts from './Toasts';
import Splash from './Splash';
import MobileApp, { useIsMobile } from './Mobile';
import { Resizer, LAYOUT_DIMS, LAYOUT_STORAGE_KEYS } from './Resizer';

const INITIAL_TWEAKS: Tweaks = {
  theme: 'midnight',
  chrome: 'auto',
  motion: true,
  scanlines: false,
  sidebar: true,
  minimap: false,
  assistant: true,
  terminal: true,
  avatar: '>_',
};

declare global {
  interface Window {
    IDE_TOAST?: (text: string, kind?: 'info' | 'ok' | 'warn' | 'err', opts?: { ttl?: number }) => void;
  }
}

export default function App() {
  // Tweaks state — replaces the design's useTweaks hook.
  const [tweaks, setTweaks] = useState<Tweaks>(INITIAL_TWEAKS);
  const setTweak: SetTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks((prev) => ({ ...prev, [key]: value }));
  }, []);

  const theme = IDE_THEMES[tweaks.theme] || IDE_THEMES.midnight;
  const platform: Platform =
    tweaks.chrome === 'auto' ? detectPlatform() : (tweaks.chrome as Platform);
  const isMobile = useIsMobile(900);

  // Install the fly-to-tab CSS + window hook once on mount.
  useEffect(() => {
    installFlyToTab();
  }, []);

  return (
    <ThemeCtx.Provider value={theme}>
      <PlatformCtx.Provider value={platform}>
        {isMobile ? (
          <MobileApp tweaks={tweaks} setTweak={setTweak} />
        ) : (
          <DesktopShell tweaks={tweaks} setTweak={setTweak} />
        )}
        <Toasts />
      </PlatformCtx.Provider>
    </ThemeCtx.Provider>
  );
}

interface DesktopShellProps {
  tweaks: Tweaks;
  setTweak: SetTweak;
}

function DesktopShell({ tweaks, setTweak }: DesktopShellProps) {
  const theme = IDE_THEMES[tweaks.theme] || IDE_THEMES.midnight;

  // IDE runtime state (ephemeral)
  const [tabs, setTabs] = useState<string[]>(['README.md', 'about.md', 'projects/haze-benchmark.md']);
  const [activeTab, setActiveTab] = useState<string | null>('README.md');
  const [sidebarPanel, setSidebarPanel] = useState<ActivePanel>('explorer');
  const [paletteMode, setPaletteMode] = useState<PaletteKind>(null);

  // Narrow desktop: between 900-1180px we auto-hide assistant + minimap so
  // the editor stays usable. User tweaks are preserved.
  // Bumped from 1100 → 1180 to account for the wider assistant panel (440px).
  const [narrow, setNarrow] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1180
  );
  useEffect(() => {
    const h = () => setNarrow(window.innerWidth < 1180);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // Resizable panel dimensions. Defaults from LAYOUT_DIMS; hydrated from
  // localStorage on mount; persisted on every drag.
  const [sidebarWidth, setSidebarWidth] = useState<number>(LAYOUT_DIMS.sidebar.default);
  const [assistantWidth, setAssistantWidth] = useState<number>(LAYOUT_DIMS.assistant.default);
  const [terminalHeight, setTerminalHeight] = useState<number>(LAYOUT_DIMS.terminal.default);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sw = Number(localStorage.getItem(LAYOUT_STORAGE_KEYS.sidebar));
    const aw = Number(localStorage.getItem(LAYOUT_STORAGE_KEYS.assistant));
    const th = Number(localStorage.getItem(LAYOUT_STORAGE_KEYS.terminal));
    if (sw >= LAYOUT_DIMS.sidebar.min && sw <= LAYOUT_DIMS.sidebar.max) setSidebarWidth(sw);
    if (aw >= LAYOUT_DIMS.assistant.min && aw <= LAYOUT_DIMS.assistant.max) setAssistantWidth(aw);
    if (th >= LAYOUT_DIMS.terminal.min && th <= LAYOUT_DIMS.terminal.max) setTerminalHeight(th);
  }, []);

  // Persist resize state to localStorage on change (debounced via the natural
  // mouseup commit pattern in Resizer — onChange fires on every move, but
  // localStorage writes are cheap and the user releases mouse fast)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_STORAGE_KEYS.sidebar, String(sidebarWidth));
  }, [sidebarWidth]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_STORAGE_KEYS.assistant, String(assistantWidth));
  }, [assistantWidth]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAYOUT_STORAGE_KEYS.terminal, String(terminalHeight));
  }, [terminalHeight]);
  const showAssistant = tweaks.assistant && !narrow;
  const showMinimap = tweaks.minimap && !narrow;

  const openFile = useCallback((path: string) => {
    setTabs((t) => (t.includes(path) ? t : [...t, path]));
    setActiveTab(path);
  }, []);

  const closeTab = useCallback(
    (path: string) => {
      setTabs((t) => {
        const i = t.indexOf(path);
        const next = t.filter((x) => x !== path);
        if (path === activeTab) {
          const fallback = next[i] || next[i - 1] || next[0] || null;
          setActiveTab(fallback);
        }
        return next;
      });
    },
    [activeTab]
  );

  const moveTab = useCallback((fromPath: string, toPath: string) => {
    if (fromPath === toPath) return;
    setTabs((t) => {
      const from = t.indexOf(fromPath);
      const to = t.indexOf(toPath);
      if (from === -1 || to === -1) return t;
      const next = t.slice();
      next.splice(from, 1);
      next.splice(to, 0, fromPath);
      return next;
    });
  }, []);

  // Global hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape' && paletteMode) {
        e.preventDefault();
        setPaletteMode(null);
        return;
      }
      if (!mod) return;
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPaletteMode('quickopen');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setPaletteMode('commands');
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setTweak('terminal', !tweaks.terminal);
      } else if (e.key === 'w' || e.key === 'W') {
        if (activeTab) {
          e.preventDefault();
          closeTab(activeTab);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteMode, activeTab, tweaks.terminal, setTweak, closeTab]);

  // Toast on theme change — small confirmation that the swap landed.
  const prevThemeRef = useRef<ThemeName>(tweaks.theme);
  useEffect(() => {
    if (prevThemeRef.current !== tweaks.theme) {
      const name = IDE_THEMES[tweaks.theme]?.name || tweaks.theme;
      window.IDE_TOAST?.('Theme → ' + name, 'ok');
      prevThemeRef.current = tweaks.theme;
    }
  }, [tweaks.theme]);

  // Layout grid.
  const grid: React.CSSProperties = useMemo(() => {
    const sidebarCol = tweaks.sidebar ? `${sidebarWidth}px` : '0';
    const minimapCol = showMinimap ? '76px' : '0';
    const assistantCol = showAssistant ? `${assistantWidth}px` : '0';
    const panelRow = tweaks.terminal ? `${terminalHeight}px` : '0';
    return {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
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
  }, [tweaks.minimap, tweaks.terminal, tweaks.assistant, tweaks.sidebar, theme, showAssistant, showMinimap, sidebarWidth, assistantWidth, terminalHeight]);

  return (
    <div style={grid} data-screen-label="01 IDE Portfolio">
      <TitleBar activeFile={activeTab} dirty={false} tweaks={tweaks} setTweak={setTweak} />
      <Sidebar
        activePanel={sidebarPanel}
        setActivePanel={setSidebarPanel}
        openFile={openFile}
        activePath={activeTab}
        visible={tweaks.sidebar}
        tweaks={tweaks}
        setTweak={setTweak}
      />
      <EditorPane
        tabs={tabs}
        active={activeTab}
        setActive={setActiveTab}
        closeTab={closeTab}
        moveTab={moveTab}
        motion={tweaks.motion}
        showMinimap={showMinimap}
      />
      <AssistantPanel
        openFile={openFile}
        onClose={() => setTweak('assistant', false)}
        visible={showAssistant}
        avatar={tweaks.avatar}
      />
      <Terminal
        openFile={openFile}
        setTheme={(name: string) => setTweak('theme', name as ThemeName)}
        themeName={tweaks.theme}
        visible={tweaks.terminal}
        onClose={() => setTweak('terminal', false)}
      />
      <StatusBar
        activeFile={activeTab}
        line={1}
        col={1}
        motion={tweaks.motion}
        themeName={tweaks.theme}
      />

      {/* Resize handles — drag to adjust, double-click to reset. localStorage-persisted. */}
      {tweaks.sidebar && (
        <Resizer
          orientation="vertical"
          current={sidebarWidth}
          onChange={setSidebarWidth}
          onReset={() => setSidebarWidth(LAYOUT_DIMS.sidebar.default)}
          min={LAYOUT_DIMS.sidebar.min}
          max={LAYOUT_DIMS.sidebar.max}
          // Sidebar right edge: 46 (activity bar) + sidebarWidth - ~2px (centered)
          position={{ left: 46 + sidebarWidth - 2, top: 30, bottom: 24 + (tweaks.terminal ? terminalHeight : 0) }}
          accent={theme.accent}
          ariaLabel="Resize sidebar width"
        />
      )}
      {showAssistant && (
        <Resizer
          orientation="vertical"
          current={assistantWidth}
          onChange={setAssistantWidth}
          onReset={() => setAssistantWidth(LAYOUT_DIMS.assistant.default)}
          min={LAYOUT_DIMS.assistant.min}
          max={LAYOUT_DIMS.assistant.max}
          reverse
          // Assistant left edge: right-anchored at (minimap + assistant) - 2px
          position={{ right: (showMinimap ? 76 : 0) + assistantWidth - 2, top: 30, bottom: 24 + (tweaks.terminal ? terminalHeight : 0) }}
          accent={theme.accent}
          ariaLabel="Resize assistant panel width"
        />
      )}
      {tweaks.terminal && (
        <Resizer
          orientation="horizontal"
          current={terminalHeight}
          onChange={setTerminalHeight}
          onReset={() => setTerminalHeight(LAYOUT_DIMS.terminal.default)}
          min={LAYOUT_DIMS.terminal.min}
          max={LAYOUT_DIMS.terminal.max}
          reverse
          // Terminal top edge: bottom-anchored at 24 (status bar) + terminalHeight - 2px
          position={{ left: 0, right: 0, bottom: 24 + terminalHeight - 2 }}
          accent={theme.accent}
          ariaLabel="Resize terminal panel height"
        />
      )}

      <PaletteOverlay
        kind={paletteMode}
        onClose={() => setPaletteMode(null)}
        openFile={openFile}
        setTheme={(name: string) => setTweak('theme', name as ThemeName)}
        themeName={tweaks.theme}
        setTerminalVisible={(v) =>
          setTweak('terminal', typeof v === 'function' ? v(tweaks.terminal) : v)
        }
        terminalVisible={tweaks.terminal}
        setMotion={(v) => setTweak('motion', typeof v === 'function' ? v(tweaks.motion) : v)}
        motion={tweaks.motion}
        setShowMinimap={(v) =>
          setTweak('minimap', typeof v === 'function' ? v(tweaks.minimap) : v)
        }
        showMinimap={tweaks.minimap}
        setAssistantVisible={(v) =>
          setTweak('assistant', typeof v === 'function' ? v(tweaks.assistant) : v)
        }
        assistantVisible={tweaks.assistant}
      />

      {tweaks.scanlines && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
            mixBlendMode: 'multiply',
            zIndex: 1500,
          }}
        />
      )}

      <Splash />
    </div>
  );
}
