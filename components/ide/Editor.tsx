"use client";

// Editor pane = breadcrumb row + tab strip + code area + minimap.
// Typing animation: when a tab is opened for the first time and motion is on,
// the body streams in char-by-char (~1.5ms each, cancelable).

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeCtx } from '@/lib/theme';
import { PlatformCtx, modKey } from '@/lib/platform';
import { PORTFOLIO_FS } from '@/lib/data';
import { highlight, extractOutline } from '@/lib/syntax';
import type { Theme, Token, FSNode } from '@/types/ide';
import MarkdownPreview from './Preview';

declare global {
  interface Window {
    IDE_JUMP_TO?: (lineIdx: number) => void;
  }
}

interface BreadcrumbProps {
  path: string | null;
  lang: string;
  viewMode: 'code' | 'preview';
  setViewMode: (m: 'code' | 'preview') => void;
}

function Breadcrumb({ path, lang, viewMode, setViewMode }: BreadcrumbProps) {
  const T = useContext(ThemeCtx);
  const parts = path ? path.split('/') : [];
  const canPreview = lang === 'md';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 14px',
        borderBottom: '1px solid ' + T.chrome.border,
        fontSize: 11.5,
        color: T.chrome.fgFainter,
        fontFamily: '"Geist Mono",monospace',
        height: 24,
        boxSizing: 'border-box',
      }}
    >
      <span>{PORTFOLIO_FS.root}</span>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <span style={{ color: T.chrome.fgFainter }}>›</span>
          <span style={{ color: i === parts.length - 1 ? T.chrome.fg : T.chrome.fgFainter }}>{p}</span>
        </React.Fragment>
      ))}
      <div style={{ flex: 1 }} />
      {canPreview && (
        <div
          style={{
            display: 'flex',
            background: T.chrome.hoverBg,
            borderRadius: 5,
            padding: 1,
            marginRight: -4,
          }}
        >
          {(['code', 'preview'] as const).map((mode) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={mode === 'preview' ? 'Open preview · ⇧⌘V' : 'Show source'}
                style={{
                  padding: '2px 8px',
                  border: 0,
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: active ? T.chrome.tabActive : 'transparent',
                  color: active ? T.chrome.fg : T.chrome.fgDim,
                  fontFamily: 'inherit',
                  fontSize: 11,
                  transition: 'background .12s, color .12s',
                }}
              >
                {mode === 'code' ? 'source' : 'preview'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface TabStripProps {
  tabs: string[];
  active: string | null;
  setActive: (p: string) => void;
  closeTab: (p: string) => void;
  moveTab: (from: string, to: string) => void;
}

function TabStrip({ tabs, active, setActive, closeTab, moveTab }: TabStripProps) {
  const T = useContext(ThemeCtx);
  const [closing, setClosing] = useState<Set<string>>(() => new Set());
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  // Animate-out, then remove. Keeps the close click feeling weighty.
  function handleClose(p: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setClosing((prev) => {
      const n = new Set(prev);
      n.add(p);
      return n;
    });
    setTimeout(() => {
      closeTab(p);
      setClosing((prev) => {
        const n = new Set(prev);
        n.delete(p);
        return n;
      });
    }, 180);
  }

  return (
    <div
      style={{
        display: 'flex',
        background: T.chrome.titlebar,
        borderBottom: '1px solid ' + T.chrome.border,
        height: 34,
        minHeight: 34,
        flex: '0 0 auto',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {tabs.map((p) => {
        const isActive = p === active;
        const isClosing = closing.has(p);
        const name = p.split('/').pop() || p;
        const found = (PORTFOLIO_FS.tree as FSNode[]).find((n) => n.path === p);
        const lang = (found && 'lang' in found ? found.lang : flattenLang(p)) || 'md';
        const iconColor =
          lang === 'json' ? T.syntax.jsonNum : lang === 'yaml' ? T.syntax.yamlKey : T.syntax.hdr1;
        return (
          <div
            key={p}
            data-tab-path={p}
            draggable={!isClosing}
            onDragStart={(e) => {
              setDragging(p);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', p);
            }}
            onDragEnd={() => {
              setDragging(null);
              setDragOver(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragging && dragging !== p) setDragOver(p);
            }}
            onDragLeave={() => {
              if (dragOver === p) setDragOver(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging && moveTab) moveTab(dragging, p);
              setDragging(null);
              setDragOver(null);
            }}
            onClick={() => !isClosing && setActive(p)}
            className="ide-tab"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isClosing ? 0 : 8,
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              paddingLeft: isClosing ? 0 : 14,
              paddingRight: isClosing ? 0 : 12,
              paddingTop: 8,
              paddingBottom: 8,
              maxWidth: isClosing ? 0 : 180,
              opacity: isClosing ? 0 : dragging === p ? 0.4 : 1,
              overflow: 'hidden',
              background:
                dragOver === p ? T.chrome.selBg : isActive ? T.chrome.tabActive : 'transparent',
              color: isActive ? T.chrome.fg : T.chrome.fgDim,
              fontSize: 12.5,
              cursor: isClosing ? 'default' : dragging ? 'grabbing' : 'pointer',
              borderRight: '1px solid ' + T.chrome.border,
              borderTop: '2px solid ' + (isActive ? T.accent : 'transparent'),
              borderLeft: dragOver === p ? '2px solid ' + T.accent : '2px solid transparent',
              marginTop: -1,
              position: 'relative',
              fontFamily: '"IBM Plex Mono",monospace',
              transition:
                'max-width .18s ease-out, padding .18s ease-out, opacity .18s ease-out, background .12s, color .12s, gap .18s ease-out, border-left-color .12s',
              animation: 'sj-tab-in .22s cubic-bezier(.2,.7,.3,1)',
            }}
          >
            <span
              style={{
                color: iconColor,
                fontFamily: '"Geist Mono",monospace',
                fontSize: 10,
                fontWeight: 700,
                flex: '0 0 auto',
              }}
            >
              {lang === 'json' ? '{}' : lang === 'yaml' ? 'Y' : 'M'}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
            <button
              onClick={(e) => handleClose(p, e)}
              style={{
                background: 'transparent',
                border: 0,
                color: T.chrome.fgFainter,
                width: 18,
                height: 18,
                borderRadius: 4,
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
                fontSize: 14,
                lineHeight: 1,
                flex: '0 0 auto',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.chrome.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title="Close · ⌘W"
            >
              ×
            </button>
          </div>
        );
      })}
      <div style={{ flex: 1, borderBottom: '1px solid ' + T.chrome.border, minWidth: 12 }} />
      <style>{`
        @keyframes sj-tab-in {
          from { max-width: 0; opacity: 0; padding-left: 0; padding-right: 0; }
          to   { max-width: 180px; opacity: 1; padding-left: 14px; padding-right: 12px; }
        }
      `}</style>
    </div>
  );
}

// Typed renderer. Given a body, returns the slice currently revealed plus
// a "done" flag. ~600 chars per second by default; finishing is instant if
// motion is disabled or if the same tab was previously fully typed.
function useTypewriter(
  body: string,
  key: string,
  motion: boolean,
  completedRef: React.MutableRefObject<Record<string, boolean>>
): number {
  const [shown, setShown] = useState<number>(motion && !completedRef.current[key] ? 0 : body.length);
  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, [body, key, motion, completedRef]);
  return shown;
}

interface CodeBodyProps {
  body: string;
  lang: string;
  motion: boolean;
  tabKey: string;
  completedRef: React.MutableRefObject<Record<string, boolean>>;
  scrollKey: string;
}

function CodeBody({ body, lang, motion, tabKey, completedRef, scrollKey }: CodeBodyProps) {
  const T = useContext(ThemeCtx);
  const shown = useTypewriter(body, tabKey, motion, completedRef);
  const partial = body.slice(0, shown);
  const lines = useMemo(() => highlight(lang, partial), [partial, lang]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [flashLine, setFlashLine] = useState(-1);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollKey]);

  // Install a jump-to-line handler that the outline panel can call.
  // Scrolls the editor so the target line sits near the top, then briefly
  // flashes that line so the eye lands on it.
  useEffect(() => {
    window.IDE_JUMP_TO = (lineIdx: number) => {
      if (!scrollRef.current) return;
      const rowHeight = 13 * 1.7; // matches fontSize 13 · lineHeight 1.7
      scrollRef.current.scrollTo({ top: Math.max(0, lineIdx * rowHeight - 14), behavior: 'smooth' });
      setFlashLine(lineIdx);
      setTimeout(() => setFlashLine(-1), 1200);
    };
    return () => {
      if (window.IDE_JUMP_TO) delete window.IDE_JUMP_TO;
    };
  }, [scrollKey]);

  // Scroll-spy: as the editor body scrolls, find the latest heading at or
  // above the viewport top, and emit a 'sj-active-heading' event so the
  // outline panel can highlight it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fireSpy = () => {
      const rowHeight = 13 * 1.7;
      const topLine = Math.max(0, Math.floor((el.scrollTop + 14) / rowHeight));
      const headings = extractOutline(body);
      let active = -1;
      for (const h of headings) {
        if (h.line <= topLine) active = h.line;
        else break;
      }
      window.dispatchEvent(
        new CustomEvent('sj-active-heading', { detail: { line: active, path: scrollKey } })
      );
    };
    el.addEventListener('scroll', fireSpy, { passive: true });
    fireSpy();
    return () => el.removeEventListener('scroll', fireSpy);
  }, [scrollKey, body]);

  // Blink the cursor on the last line.
  const [caretOn, setCaretOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setCaretOn((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  // The "active" line is the one the caret is on — last rendered line.
  const activeLineIdx = lines.length - 1;

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '14px 0 80px',
        position: 'relative',
        fontFamily: '"Geist Mono","JetBrains Mono","IBM Plex Mono",ui-monospace,monospace',
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      {lines.map((toks, i) => {
        const isActive = i === activeLineIdx;
        const isFlash = i === flashLine;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: '0 14px',
              background: isFlash ? T.chrome.selBg : isActive ? T.chrome.hoverBg : 'transparent',
              animation: isFlash ? 'sj-flash 1.1s ease-out' : undefined,
              transition: isActive && !isFlash ? 'background .15s ease-out' : undefined,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 48,
                textAlign: 'right',
                paddingRight: 18,
                color: isActive ? T.chrome.fg : T.chrome.gutter,
                userSelect: 'none',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, color: T.syntax.text, whiteSpace: 'pre-wrap' }}>
              {toks.map((tok, j) => (
                <span key={j} style={tokenStyle(tok.t, T)}>
                  {tok.v}
                </span>
              ))}
              {i === lines.length - 1 && shown < body.length && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: '1em',
                    verticalAlign: '-2px',
                    background: T.accent,
                    marginLeft: 1,
                  }}
                />
              )}
              {i === lines.length - 1 && shown >= body.length && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: '1em',
                    verticalAlign: '-2px',
                    background: caretOn ? T.accent : 'transparent',
                    marginLeft: 1,
                  }}
                />
              )}
            </span>
          </div>
        );
      })}
      {/* Phantom lines to keep gutter visible even when content is short */}
      {Array.from({ length: Math.max(0, 6) }).map((_, i) => (
        <div key={'p' + i} style={{ display: 'flex', padding: '0 14px' }}>
          <span
            style={{
              display: 'inline-block',
              width: 48,
              textAlign: 'right',
              paddingRight: 18,
              color: T.chrome.gutter,
              opacity: 0.4,
              userSelect: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {lines.length + i + 1}
          </span>
          <span />
        </div>
      ))}
      <style>{`@keyframes sj-flash { 0%{ background: ${T.chrome.selBg}; } 60%{ background: ${T.chrome.selBg}; } 100%{ background: transparent; } }`}</style>
    </div>
  );
}

function tokenStyle(t: string, T: Theme): React.CSSProperties {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (T.syntax as any)[t] || T.syntax.text;
  const base: React.CSSProperties = { color: c };
  if (t === 'hdr1') return { ...base, fontWeight: 700, fontSize: '1.05em', letterSpacing: '-0.005em' };
  if (t === 'hdr2') return { ...base, fontWeight: 700 };
  if (t === 'hdr3') return { ...base, fontWeight: 600 };
  if (t === 'bold') return { ...base, fontWeight: 700 };
  if (t === 'emItalic') return { ...base, fontStyle: 'italic' };
  if (t === 'comment') return { ...base, fontStyle: 'italic' };
  if (t === 'placeholder')
    return { ...base, background: 'rgba(255,170,107,0.12)', padding: '0 2px', borderRadius: 2 };
  if (t === 'code') return { ...base, background: 'rgba(255,208,122,0.10)', padding: '0 4px', borderRadius: 3 };
  if (t === 'linkText') return { ...base, textDecoration: 'underline', textUnderlineOffset: 3 };
  return base;
}

// Minimap — block representation of all lines, drawn directly off the
// non-typed body so the visual scale doesn't change mid-typing.
function Minimap({ body, lang }: { body: string; lang: string; scrollKey: string }) {
  const T = useContext(ThemeCtx);
  const lines = useMemo(() => highlight(lang, body), [body, lang]);
  return (
    <div
      style={{
        gridArea: 'minimap',
        background: T.chrome.sidebar,
        borderLeft: '1px solid ' + T.chrome.border,
        padding: '8px 6px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {lines.map((toks: Token[], i: number) => {
          const len = toks.reduce((s, t) => s + t.v.length, 0);
          const isHdr = toks[0] && (toks[0].t === 'hdrHash' || toks[0].t === 'iniSection');
          return (
            <div
              key={i}
              style={{
                height: 3,
                borderRadius: 1,
                width: Math.min(60, 4 + len * 0.9),
                background: isHdr ? T.accent : T.chrome.fgFainter,
                opacity: isHdr ? 0.85 : 0.45,
              }}
            />
          );
        })}
      </div>
      {/* viewport rectangle */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 8,
          height: 80,
          background: 'rgba(255,255,255,0.05)',
          borderTop: '1px solid ' + T.chrome.borderStrong,
          borderBottom: '1px solid ' + T.chrome.borderStrong,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

interface EditorPaneProps {
  tabs: string[];
  active: string | null;
  setActive: (p: string) => void;
  closeTab: (p: string) => void;
  moveTab: (from: string, to: string) => void;
  motion: boolean;
  showMinimap: boolean;
}

export default function EditorPane({
  tabs,
  active,
  setActive,
  closeTab,
  moveTab,
  motion,
  showMinimap,
}: EditorPaneProps) {
  const T = useContext(ThemeCtx);
  const platform = useContext(PlatformCtx);
  const completedRef = useRef<Record<string, boolean>>({});
  const [viewModes, setViewModes] = useState<Record<string, 'code' | 'preview'>>({});

  if (!active) {
    const mod = modKey(platform);
    return (
      <>
        <div
          style={{
            gridArea: 'editor',
            background: T.chrome.editor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.chrome.fgFainter,
            fontFamily: '"Geist Mono",monospace',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{ fontSize: 28, color: T.chrome.fg, marginBottom: 6, fontWeight: 600 }}>No file open</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              press <Kbd>{mod}</Kbd> <Kbd>P</Kbd> to open a file
              <br />
              press <Kbd>{mod}</Kbd> <Kbd>K</Kbd> to run a command
              <br />
              press <Kbd>{mod}</Kbd> <Kbd>J</Kbd> to toggle the terminal
            </div>
          </div>
        </div>
        {showMinimap && (
          <div
            style={{
              gridArea: 'minimap',
              background: T.chrome.sidebar,
              borderLeft: '1px solid ' + T.chrome.border,
            }}
          />
        )}
      </>
    );
  }

  const body = PORTFOLIO_FS.files[active] || '(file not found)';
  const found = (PORTFOLIO_FS.tree as FSNode[]).find((n) => n.path === active);
  const lang = (found && 'lang' in found ? found.lang : flattenLang(active)) || 'md';
  const viewMode = viewModes[active] || 'code';
  const setViewMode = (m: 'code' | 'preview') => setViewModes((prev) => ({ ...prev, [active]: m }));
  const showPreview = viewMode === 'preview' && lang === 'md';

  return (
    <>
      <div
        style={{
          gridArea: 'editor',
          background: T.chrome.editor,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <TabStrip tabs={tabs} active={active} setActive={setActive} closeTab={closeTab} moveTab={moveTab} />
        <Breadcrumb path={active} lang={lang} viewMode={viewMode} setViewMode={setViewMode} />
        {showPreview ? (
          <MarkdownPreview body={body} openFile={setActive} />
        ) : (
          <CodeBody
            body={body}
            lang={lang}
            motion={motion}
            tabKey={active}
            completedRef={completedRef}
            scrollKey={active}
          />
        )}
      </div>
      {showMinimap && !showPreview && <Minimap body={body} lang={lang} scrollKey={active} />}
      {showMinimap && showPreview && (
        <div
          style={{
            gridArea: 'minimap',
            background: T.chrome.sidebar,
            borderLeft: '1px solid ' + T.chrome.border,
          }}
        />
      )}
    </>
  );
}

// Walk the tree for path's lang (handles nested paths the flat .find missed)
export function flattenLang(path: string): string {
  const walk = (nodes: FSNode[]): string | undefined => {
    for (const n of nodes) {
      if (n.path === path && 'lang' in n) return n.lang;
      if ('children' in n && n.children) {
        const r = walk(n.children);
        if (r) return r;
      }
    }
    return undefined;
  };
  return walk(PORTFOLIO_FS.tree) || 'md';
}

function Kbd({ children }: { children: React.ReactNode }) {
  const T = useContext(ThemeCtx);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 22,
        height: 22,
        padding: '0 6px',
        borderRadius: 5,
        background: T.chrome.hoverBg,
        color: T.chrome.fg,
        fontFamily: '"Geist Mono",monospace',
        fontSize: 11.5,
        border: '1px solid ' + T.chrome.border,
        margin: '0 2px',
      }}
    >
      {children}
    </span>
  );
}
