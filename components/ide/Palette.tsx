"use client";

// Two modal palettes that share most of their layout:
//   ⌘P  Quick Open  → fuzzy-finds a file path, opens in tab
//   ⌘K  Command     → runs a command (open file, change theme, toggle panel, …)

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeCtx } from '@/lib/theme';
import { PlatformCtx, modKey } from '@/lib/platform';
import { PORTFOLIO_FS } from '@/lib/data';
import { useFocusTrap } from '@/lib/focus-trap';
import type { Theme, FSNode } from '@/types/ide';

export type PaletteKind = 'quickopen' | 'commands' | null;

interface PaletteItem {
  id?: string;
  title: string;
  meta?: string;
  icon?: string;
  kbd?: string;
  action: () => void;
}

// Crude scoring: prefer (1) prefix match, (2) substring match, (3) char subsequence.
function fuzzyScore(needle: string, hay: string): number {
  if (!needle) return 1;
  const n = needle.toLowerCase(),
    h = hay.toLowerCase();
  if (h.startsWith(n)) return 1000 - (h.length - n.length);
  const idx = h.indexOf(n);
  if (idx !== -1) return 700 - idx;
  // subseq
  let hi = 0,
    score = 200,
    lastMatch = -1;
  for (let i = 0; i < n.length; i++) {
    const c = n[i];
    const found = h.indexOf(c, hi);
    if (found === -1) return -1;
    if (lastMatch !== -1 && found === lastMatch + 1) score += 3;
    hi = found + 1;
    lastMatch = found;
  }
  return score - (h.length - n.length) * 0.1;
}

interface PaletteShellProps {
  q: string;
  setQ: (s: string) => void;
  items: PaletteItem[];
  onPick: (it: PaletteItem) => void;
  footer: string;
  placeholder: string;
  leadingIcon: string;
}

function PaletteShell({ q, setQ, items, onPick, footer, placeholder, leadingIcon }: PaletteShellProps) {
  const T = useContext(ThemeCtx);
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setSel(0), [items.length, q]);

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(items.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[sel]) onPick(items[sel]);
    }
  }

  // Scroll selected into view
  useEffect(() => {
    const row = listRef.current?.querySelector(`[data-row="${sel}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 640,
        maxHeight: 460,
        display: 'flex',
        flexDirection: 'column',
        background: T.chrome.editor,
        color: T.chrome.fg,
        borderRadius: 12,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px ' + T.chrome.borderStrong,
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid ' + T.chrome.border,
        }}
      >
        <span style={{ color: T.chrome.fgDim, fontFamily: '"Geist Mono",monospace', fontSize: 13 }}>
          {leadingIcon}
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            flex: 1,
            background: 'transparent',
            border: 0,
            outline: 'none',
            fontSize: 15,
            color: T.chrome.fg,
            fontFamily: '"IBM Plex Mono",monospace',
          }}
        />
        <kbd style={kbdStyle(T)}>esc</kbd>
      </div>
      <div
        ref={listRef}
        role="listbox"
        aria-label="Results"
        style={{ flex: 1, overflow: 'auto', padding: '6px 6px 8px' }}
      >
        {items.length === 0 && (
          <div style={{ padding: '14px 18px', color: T.chrome.fgFainter, fontSize: 13 }}>No results.</div>
        )}
        {items.map((it, i) => (
          <div
            key={it.id || i}
            data-row={i}
            role="option"
            aria-selected={i === sel}
            onMouseEnter={() => setSel(i)}
            onClick={() => onPick(it)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              background: i === sel ? T.chrome.selBg : 'transparent',
              fontFamily: '"IBM Plex Mono",monospace',
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: i === sel ? T.accent : T.chrome.hoverBg,
                color: i === sel ? T.chrome.statusBarFg : T.chrome.fgDim,
                fontFamily: '"Geist Mono",monospace',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {it.icon || '·'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  color: T.chrome.fg,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.title}
              </div>
              {it.meta && (
                <div
                  style={{
                    fontSize: 11.5,
                    color: T.chrome.fgFainter,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: '"Geist Mono",monospace',
                  }}
                >
                  {it.meta}
                </div>
              )}
            </div>
            {it.kbd && <kbd style={kbdStyle(T)}>{it.kbd}</kbd>}
            {i === sel && !it.kbd && <kbd style={kbdStyle(T)}>↵</kbd>}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid ' + T.chrome.border,
          fontSize: 11.5,
          color: T.chrome.fgFainter,
          fontFamily: '"Geist Mono",monospace',
        }}
      >
        <span>{footer}</span>
        <span>
          <kbd style={kbdStyle(T)}>↑</kbd>
          <kbd style={kbdStyle(T)}>↓</kbd> navigate &nbsp; <kbd style={kbdStyle(T)}>↵</kbd> select
        </span>
      </div>
    </div>
  );
}

function kbdStyle(T: Theme): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
    padding: '0 6px',
    borderRadius: 5,
    margin: '0 2px',
    background: T.chrome.hoverBg,
    color: T.chrome.fg,
    fontFamily: '"Geist Mono",monospace',
    fontSize: 11,
    border: '1px solid ' + T.chrome.border,
  };
}

function QuickOpen({ open, onClose, openFile }: { open: boolean; onClose: () => void; openFile: (p: string) => void }) {
  const [q, setQ] = useState('');
  const allFiles = useMemo(() => {
    const out: string[] = [];
    const walk = (ns: FSNode[]) =>
      ns.forEach((n) => {
        if (n.type === 'file') out.push(n.path);
        if ('children' in n && n.children) walk(n.children);
      });
    walk(PORTFOLIO_FS.tree);
    return out;
  }, []);

  const items = useMemo<PaletteItem[]>(() => {
    const scored = allFiles
      .map((p) => ({ p, s: fuzzyScore(q, p) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 20)
      .map(({ p }) => ({
        id: p,
        title: p.split('/').pop() || p,
        meta: p,
        icon: p.endsWith('.json') ? '{}' : p.endsWith('.yaml') ? 'Y' : p.endsWith('.gitconfig') ? '⎇' : 'M',
        action: () => openFile(p),
      }));
    return scored;
  }, [q, allFiles, openFile]);

  if (!open) return null;
  return (
    <PaletteShell
      q={q}
      setQ={setQ}
      items={items}
      onPick={(it) => {
        it.action();
        onClose();
      }}
      placeholder="Go to file…"
      leadingIcon=">_"
      footer={`${items.length} of ${allFiles.length} files`}
    />
  );
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  openFile: (p: string) => void;
  setTheme: (name: string) => void;
  themeName: string;
  setTerminalVisible: (v: boolean | ((prev: boolean) => boolean)) => void;
  terminalVisible: boolean;
  setMotion: (v: boolean | ((prev: boolean) => boolean)) => void;
  motion: boolean;
  setShowMinimap: (v: boolean | ((prev: boolean) => boolean)) => void;
  showMinimap: boolean;
  setAssistantVisible: (v: boolean | ((prev: boolean) => boolean)) => void;
  assistantVisible: boolean;
}

function CommandPalette({
  open,
  onClose,
  openFile,
  setTheme,
  themeName,
  setTerminalVisible,
  terminalVisible,
  setMotion,
  motion,
  setShowMinimap,
  showMinimap,
  setAssistantVisible,
  assistantVisible,
}: CommandPaletteProps) {
  const platform = useContext(PlatformCtx);
  const mod = modKey(platform);
  const [q, setQ] = useState('');

  const cmds = useMemo<PaletteItem[]>(
    () => [
      // Files
      { id: 'go.readme', icon: 'M', title: 'Go to README.md', meta: 'open file', kbd: mod + 'P', action: () => openFile('README.md') },
      { id: 'go.about', icon: 'M', title: 'Go to about.md', meta: 'open file', action: () => openFile('about.md') },
      { id: 'go.now', icon: 'M', title: 'Go to /now', meta: 'open file', action: () => openFile('now.md') },
      { id: 'go.contact', icon: 'Y', title: 'Go to contact.yaml', meta: 'open file', action: () => openFile('contact.yaml') },
      { id: 'go.exp', icon: '{}', title: 'Go to experience.json', meta: 'open file', action: () => openFile('experience.json') },
      { id: 'go.git', icon: '⎇', title: 'Go to .gitconfig', meta: 'easter egg', action: () => openFile('.gitconfig') },
      // Themes
      { id: 'th.midnight', icon: '◐', title: 'Theme · Midnight', meta: 'change theme · current: ' + themeName, action: () => setTheme('midnight') },
      { id: 'th.phosphor', icon: '◐', title: 'Theme · Phosphor (terminal green)', meta: 'change theme', action: () => setTheme('phosphor') },
      { id: 'th.paper', icon: '◐', title: 'Theme · Paper (default)', meta: 'change theme', action: () => setTheme('paper') },
      { id: 'th.solar', icon: '◐', title: 'Theme · Solar (amber)', meta: 'change theme', action: () => setTheme('solar') },
      // View
      { id: 'view.assist', icon: 'AI', title: assistantVisible ? 'Hide assistant' : 'Show assistant', meta: 'view', action: () => setAssistantVisible((v) => !v) },
      { id: 'view.term', icon: '>_', title: terminalVisible ? 'Hide terminal' : 'Show terminal', meta: 'view', kbd: mod + 'J', action: () => setTerminalVisible((v) => !v) },
      { id: 'view.map', icon: '☰', title: showMinimap ? 'Hide minimap' : 'Show minimap', meta: 'view', action: () => setShowMinimap((v) => !v) },
      { id: 'view.motion', icon: '↻', title: motion ? 'Disable typing animation' : 'Enable typing animation', meta: 'view', action: () => setMotion((v) => !v) },
      // Actions
      { id: 'do.email', icon: '@', title: 'Email · saurabhjalendra@gmail.com', meta: 'contact', action: () => { window.open('mailto:saurabhjalendra@gmail.com'); } },
      { id: 'do.github', icon: 'G', title: 'GitHub · @SaurabhJalendra', meta: 'contact', action: () => { window.open('https://github.com/SaurabhJalendra', '_blank'); } },
      { id: 'do.linkedin', icon: 'in', title: 'LinkedIn · in/saurabh-jalendra', meta: 'contact', action: () => { window.open('https://linkedin.com/in/saurabh-jalendra', '_blank'); } },
      { id: 'do.dl', icon: '↓', title: 'Download résumé (PDF)', meta: 'contact', action: () => {
          // cv.pdf is synced into public/ by scripts/sync-content.mjs at build.
          const a = document.createElement('a');
          a.href = '/cv.pdf';
          a.download = 'Saurabh-Jalendra-CV.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
        } },
    ],
    [themeName, terminalVisible, motion, showMinimap, assistantVisible, openFile, setTheme, setTerminalVisible, setShowMinimap, setMotion, setAssistantVisible, mod]
  );

  const items = useMemo<PaletteItem[]>(
    () =>
      cmds
        .map((c) => ({ c, s: fuzzyScore(q, c.title + ' ' + (c.meta || '')) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .map(({ c }) => c),
    [q, cmds]
  );

  if (!open) return null;
  return (
    <PaletteShell
      q={q}
      setQ={setQ}
      items={items}
      onPick={(it) => {
        it.action();
        onClose();
      }}
      placeholder="Run a command…"
      leadingIcon=">"
      footer={`${items.length} commands`}
    />
  );
}

interface PaletteOverlayProps extends Omit<CommandPaletteProps, 'open' | 'onClose'> {
  kind: PaletteKind;
  onClose: () => void;
}

export default function PaletteOverlay({ kind, onClose, ...props }: PaletteOverlayProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  // Trap focus inside the palette while open; restore it to the previously
  // focused element (e.g. the editor) on close.
  useFocusTrap(dialogRef, kind !== null);
  if (!kind) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        animation: 'palfade .12s ease-out',
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={kind === 'quickopen' ? 'Quick open file' : 'Command palette'}
      >
        {kind === 'quickopen' && <QuickOpen open onClose={onClose} openFile={props.openFile} />}
        {kind === 'commands' && <CommandPalette open onClose={onClose} {...props} />}
      </div>
      <style>{`
        @keyframes palfade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
