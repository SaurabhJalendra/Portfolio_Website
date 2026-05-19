"use client";

// Sidebar = ActivityBar (icons, leftmost rail) + Panel (file tree / search /
// outline / source control / profile). Activity icon toggles which panel is
// shown. File rows are clickable and feed openFile() up.

import React, { useContext, useEffect, useRef, useState } from 'react';
import { ThemeCtx, IDE_THEMES } from '@/lib/theme';
import { PlatformCtx, modKey, shiftKey } from '@/lib/platform';
import {
  PORTFOLIO_FS,
  CAREER_COMMITS,
  SKILL_EXTENSIONS,
  GIT_REMOTES,
  type CareerCommit,
  type SkillExtension,
  type GitRemote,
} from '@/lib/data';
import { extractOutline } from '@/lib/syntax';
import type { Theme, Tweaks, SetTweak, FSNode } from '@/types/ide';

declare global {
  interface Window {
    IDE_JUMP_TO?: (lineIdx: number) => void;
  }
}

type ActivePanel = 'explorer' | 'search' | 'scm' | 'outline' | 'ext';

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<ActivePanel, string> = {
  explorer: 'M3 5h7l2 2h9v12H3z',
  search: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm5 11.5l4.5 4.5',
  scm: 'M6 3v18 M18 3v6a6 6 0 0 1-6 6h-6',
  ext: 'M4 4h7v7H4z M13 13h7v7h-7z M13 4h7v7h-7z M4 13h7v7H4z',
  outline: 'M4 6h16 M4 12h10 M4 18h7',
};

interface ActivityBarProps {
  active: ActivePanel;
  setActive: (a: ActivePanel) => void;
  onSettings: () => void;
  settingsBtnRef: React.RefObject<HTMLButtonElement | null>;
  settingsActive: boolean;
}

function ActivityBar({ active, setActive, onSettings, settingsBtnRef, settingsActive }: ActivityBarProps) {
  const T = useContext(ThemeCtx);
  const platform = useContext(PlatformCtx);
  const mod = modKey(platform);
  const sh = shiftKey(platform);
  const sep = platform === 'mac' ? '' : '+';
  const items: [ActivePanel, string][] = [
    ['explorer', 'Explorer · ' + mod + sep + sh + sep + 'E'],
    ['search', 'Search · ' + mod + sep + sh + sep + 'F'],
    ['scm', 'Source Control · ' + mod + sep + sh + sep + 'G'],
    ['outline', 'Outline'],
    ['ext', 'Extensions · ' + mod + sep + sh + sep + 'X'],
  ];
  return (
    <div
      style={{
        gridArea: 'activity',
        background: T.chrome.activityBar,
        borderRight: '1px solid ' + T.chrome.border,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 6,
        gap: 2,
      }}
    >
      {items.map(([k, title]) => (
        <button
          key={k}
          title={title}
          onClick={() => setActive(k)}
          style={{
            position: 'relative',
            width: 44,
            height: 42,
            background: 'transparent',
            border: 0,
            padding: 0,
            color: active === k ? T.chrome.fg : T.chrome.fgFainter,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color .15s',
          }}
        >
          {active === k && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 8,
                bottom: 8,
                width: 2,
                background: T.accent,
                borderRadius: 2,
              }}
            />
          )}
          <Icon d={ICONS[k]} />
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button
        ref={settingsBtnRef}
        title="Settings · themes & chrome"
        onClick={onSettings}
        style={{
          position: 'relative',
          width: 44,
          height: 42,
          background: 'transparent',
          border: 0,
          padding: 0,
          color: settingsActive ? T.chrome.fg : T.chrome.fgFainter,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color .15s',
        }}
      >
        {settingsActive && (
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 8,
              bottom: 8,
              width: 2,
              background: T.accent,
              borderRadius: 2,
            }}
          />
        )}
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}

// Recursive file tree row.
interface TreeRowProps {
  node: FSNode;
  depth: number;
  openFile: (p: string) => void;
  activePath: string | null;
  expanded: Record<string, boolean>;
  toggleExpand: (p: string) => void;
}

function TreeRow({ node, depth, openFile, activePath, expanded, toggleExpand }: TreeRowProps) {
  const T = useContext(ThemeCtx);
  const sel = node.type === 'file' && activePath === node.path;
  const isOpen = expanded[node.path];
  const name = node.path.split('/').pop() || node.path;
  const padLeft = 6 + depth * 14;

  const iconFor = (n: FSNode): string => {
    if (n.type === 'dir') return isOpen ? '▾' : '▸';
    if (n.path.endsWith('.md')) return 'M';
    if (n.path.endsWith('.json')) return '{}';
    if (n.path.endsWith('.yaml')) return 'Y';
    if (n.path.endsWith('.gitconfig')) return '⎇';
    return '·';
  };
  const iconColor = (n: FSNode): string => {
    if (n.type === 'dir') return T.chrome.fgDim;
    if (n.path.endsWith('.md')) return T.syntax.hdr1;
    if (n.path.endsWith('.json')) return T.syntax.jsonNum;
    if (n.path.endsWith('.yaml')) return T.syntax.yamlKey;
    if (n.path.endsWith('.gitconfig')) return T.syntax.iniSection;
    return T.chrome.fgDim;
  };

  return (
    <>
      <div
        onClick={() => (node.type === 'dir' ? toggleExpand(node.path) : openFile(node.path))}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 0 3px ' + padLeft + 'px',
          color: sel ? T.chrome.fg : T.chrome.fgDim,
          background: sel ? T.chrome.selBg : 'transparent',
          fontSize: 12.5,
          cursor: 'pointer',
          position: 'relative',
          animation: 'sj-row-in .2s ease-out',
        }}
        onMouseEnter={(e) => {
          if (!sel) e.currentTarget.style.background = T.chrome.hoverBg;
        }}
        onMouseLeave={(e) => {
          if (!sel) e.currentTarget.style.background = 'transparent';
        }}
      >
        {sel && (
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: T.accent }} />
        )}
        <span
          style={{
            width: 14,
            textAlign: 'center',
            color: iconColor(node),
            fontFamily: '"Geist Mono",monospace',
            fontSize: 10.5,
            fontWeight: 600,
          }}
        >
          {iconFor(node)}
        </span>
        <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{name}</span>
      </div>
      {node.type === 'dir' &&
        isOpen &&
        node.children?.map((c) => (
          <TreeRow
            key={c.path}
            node={c}
            depth={depth + 1}
            openFile={openFile}
            activePath={activePath}
            expanded={expanded}
            toggleExpand={toggleExpand}
          />
        ))}
    </>
  );
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  const T = useContext(ThemeCtx);
  return (
    <div
      style={{
        fontSize: 10.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: T.chrome.fgFainter,
        padding: '10px 14px 6px',
        fontFamily: '"Geist Mono",monospace',
      }}
    >
      {children}
    </div>
  );
}

function ExplorerPanel({ openFile, activePath }: { openFile: (p: string) => void; activePath: string | null }) {
  const T = useContext(ThemeCtx);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ projects: true, writing: true });
  const toggleExpand = (p: string) => setExpanded((s) => ({ ...s, [p]: !s[p] }));

  return (
    <>
      <SidebarHeader>Portfolio</SidebarHeader>
      <div
        onClick={() => toggleExpand(PORTFOLIO_FS.root)}
        style={{
          display: 'flex',
          gap: 6,
          padding: '3px 8px',
          color: T.chrome.fg,
          fontSize: 12.5,
          cursor: 'pointer',
          fontFamily: '"IBM Plex Mono",monospace',
        }}
      >
        <span style={{ color: T.chrome.fgDim, width: 14, textAlign: 'center' }}>▾</span>
        <span style={{ fontWeight: 500 }}>{PORTFOLIO_FS.root}/</span>
      </div>
      {PORTFOLIO_FS.tree.map((n) => (
        <TreeRow
          key={n.path}
          node={n}
          depth={1}
          openFile={openFile}
          activePath={activePath}
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      ))}
    </>
  );
}

function OutlinePanel({ activePath }: { activePath: string | null }) {
  const T = useContext(ThemeCtx);
  const [activeHeading, setActiveHeading] = useState(-1);

  // Listen for editor scroll-spy events so the active heading lights up
  // as the user scrolls through the file.
  useEffect(() => {
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ path: string; line: number }>;
      if (ce.detail.path === activePath) setActiveHeading(ce.detail.line);
    };
    window.addEventListener('sj-active-heading', h);
    return () => window.removeEventListener('sj-active-heading', h);
  }, [activePath]);

  if (!activePath) return <div style={{ padding: 14, color: T.chrome.fgFainter, fontSize: 12 }}>No active file.</div>;
  const body = PORTFOLIO_FS.files[activePath] || '';
  const outline = extractOutline(body);
  return (
    <>
      <SidebarHeader>Outline · {activePath}</SidebarHeader>
      {outline.length === 0 && (
        <div style={{ padding: '4px 14px', color: T.chrome.fgFainter, fontSize: 12 }}>no headings</div>
      )}
      {outline.map((h, i) => {
        const isActive = h.line === activeHeading;
        return (
          <div
            key={i}
            onClick={() => window.IDE_JUMP_TO?.(h.line)}
            style={{
              display: 'flex',
              gap: 8,
              padding: '3px 0 3px ' + (6 + h.depth * 14) + 'px',
              color: isActive ? T.chrome.fg : T.chrome.fgDim,
              background: isActive ? T.chrome.selBg : 'transparent',
              fontSize: 12.5,
              cursor: 'pointer',
              position: 'relative',
              fontFamily: '"IBM Plex Mono",monospace',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = T.chrome.hoverBg;
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            {isActive && (
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: T.accent }} />
            )}
            <span
              style={{
                width: 14,
                textAlign: 'center',
                color: h.depth === 1 ? T.syntax.hdr1 : T.chrome.fgFainter,
                fontWeight: 600,
                fontSize: 10.5,
              }}
            >
              #
            </span>
            <span>{h.text}</span>
          </div>
        );
      })}
    </>
  );
}

function SearchPanel() {
  const T = useContext(ThemeCtx);
  return (
    <>
      <SidebarHeader>Search</SidebarHeader>
      <div style={{ padding: '0 12px 10px' }}>
        <input
          placeholder="Search portfolio"
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid ' + T.chrome.borderStrong,
            background: T.chrome.editor,
            color: T.chrome.fg,
            fontSize: 12,
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ padding: '6px 14px', color: T.chrome.fgFainter, fontSize: 12 }}>
        type to search file contents
      </div>
    </>
  );
}

// ---- Source Control panel ------------------------------------------------
// Two sections: a `git remote -v` block (contact links rendered as remotes),
// followed by a git-log-style career history. Commits with a `link` open
// that file in the editor; remote rows open their URL in a new tab.

function RemoteIcon({ kind, color }: { kind: GitRemote['iconType']; color: string }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { color },
  };
  if (kind === 'github') {
    return (
      <svg {...common}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    );
  }
  if (kind === 'linkedin') {
    return (
      <svg {...common}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (kind === 'globe') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
  // mail
  return (
    <svg {...common}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ScmPanel({ openFile }: { openFile: (p: string) => void }) {
  const T = useContext(ThemeCtx);

  const typeColor = (t: CareerCommit['type']): string => {
    switch (t) {
      case 'feat':
        return T.syntax.hdrHash; // green
      case 'fix':
        return T.syntax.linkText; // blue
      case 'docs':
        return T.syntax.emItalic; // cyan
      case 'refactor':
        return T.syntax.placeholder; // orange
      case 'chore':
      default:
        return T.chrome.fgDim;
    }
  };

  return (
    <>
      <SidebarHeader>Source Control · main</SidebarHeader>
      <div style={{ padding: '4px 14px 10px', color: T.chrome.fgDim, fontSize: 12 }}>
        <span style={{ color: T.syntax.hdrHash }}>✓</span> working tree clean
      </div>

      {/* $ git remote -v */}
      <SidebarHeader>$ git remote -v</SidebarHeader>
      <div style={{ padding: '0 6px 6px' }}>
        {GIT_REMOTES.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target={r.iconType === 'mail' ? undefined : '_blank'}
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 6,
              color: T.chrome.fgDim,
              textDecoration: 'none',
              fontFamily: '"IBM Plex Mono",monospace',
              fontSize: 12,
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.chrome.hoverBg;
              e.currentTarget.style.color = T.chrome.fg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = T.chrome.fgDim;
            }}
          >
            <RemoteIcon kind={r.iconType} color={T.accent} />
            <span style={{ minWidth: 64, color: T.syntax.jsonKey }}>{r.name}</span>
            <span style={{ flex: 1, color: T.chrome.fgFainter, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.description}
            </span>
          </a>
        ))}
      </div>

      {/* $ git log --oneline */}
      <SidebarHeader>$ git log — career</SidebarHeader>
      <div style={{ padding: '0 4px 8px' }}>
        {CAREER_COMMITS.map((c) => {
          const tc = typeColor(c.type);
          const clickable = !!c.link;
          return (
            <div
              key={c.hash}
              onClick={() => clickable && c.link && openFile(c.link)}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (clickable && c.link && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  openFile(c.link);
                }
              }}
              style={{
                padding: '6px 10px',
                margin: '1px 0',
                borderRadius: 5,
                cursor: clickable ? 'pointer' : 'default',
                fontFamily: '"IBM Plex Mono",monospace',
                fontSize: 12,
                color: T.chrome.fgDim,
                transition: 'background .15s',
                animation: 'sj-row-in .22s ease-out',
              }}
              onMouseEnter={(e) => {
                if (clickable) e.currentTarget.style.background = T.chrome.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ color: T.accent, fontWeight: 600 }}>*</span>
                <span style={{ color: T.chrome.fgFainter, fontSize: 10.5, minWidth: 70 }}>{c.date}</span>
                <span style={{ color: T.chrome.fgFainter, fontSize: 10.5 }}>{c.hash}</span>
                <span style={{ color: tc, fontWeight: 600, fontSize: 11 }}>{c.type}:</span>
              </div>
              <div
                style={{
                  color: T.chrome.fg,
                  fontSize: 12,
                  lineHeight: 1.45,
                  marginLeft: 16,
                  marginTop: 2,
                }}
              >
                {c.message}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---- Extensions panel ----------------------------------------------------
// Renders SKILL_EXTENSIONS as VS-Code-style extension cards, grouped by
// category, with a "featured" rail at the top for the most load-bearing
// skills.

const CATEGORY_LABELS: Record<SkillExtension['category'], string> = {
  languages: 'Languages',
  ml: 'Machine Learning',
  llm: 'LLM & Agents',
  web: 'Web & Backend',
  cloud: 'Cloud',
  infra: 'Infrastructure',
  safety: 'AI Safety',
};

const CATEGORY_ORDER: SkillExtension['category'][] = [
  'languages',
  'ml',
  'llm',
  'web',
  'cloud',
  'infra',
  'safety',
];

function StarBar({ rating, color, faint }: { rating: number; color: string; faint: string }) {
  // Render 5 stars, half-filled when needed.
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display: 'inline-flex', gap: 1, fontFamily: '"Geist Mono",monospace', fontSize: 11 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const isHalf = i === full && half;
        return (
          <span key={i} style={{ color: filled || isHalf ? color : faint }}>
            {filled ? '★' : isHalf ? '★' : '☆'}
          </span>
        );
      })}
    </span>
  );
}

function ExtensionCard({
  ext,
  T,
  compact,
}: {
  ext: SkillExtension;
  T: Theme;
  compact?: boolean;
}) {
  const initial = ext.name.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || '·';
  // Stable per-id color from the syntax palette so each category icon
  // doesn't all collapse to the same hue.
  const swatchByCategory: Record<SkillExtension['category'], string> = {
    languages: T.syntax.jsonKey,
    ml: T.syntax.hdr1,
    llm: T.accent,
    web: T.syntax.linkText,
    cloud: T.syntax.code,
    infra: T.syntax.placeholder,
    safety: T.syntax.listBullet,
  };
  const sw = swatchByCategory[ext.category];

  return (
    <div
      title={ext.description}
      style={{
        display: 'flex',
        gap: 10,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: 7,
        margin: compact ? 0 : '2px 6px',
        background: 'transparent',
        cursor: 'default',
        transition: 'background .15s',
        width: compact ? 160 : 'auto',
        boxSizing: 'border-box',
        border: compact ? '1px solid ' + T.chrome.border : '0',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.chrome.hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: 32,
          height: 32,
          flex: '0 0 32px',
          borderRadius: 6,
          background: sw,
          color: T.chrome.titlebar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Geist Mono",monospace',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
          <span
            style={{
              color: T.chrome.fg,
              fontSize: 12.5,
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ext.name}
          </span>
          <span
            style={{
              fontFamily: '"Geist Mono",monospace',
              fontSize: 10.5,
              color: T.chrome.fgFainter,
              border: '1px solid ' + T.chrome.border,
              borderRadius: 4,
              padding: '0 5px',
              flex: '0 0 auto',
            }}
          >
            {ext.version}
          </span>
        </div>
        <div
          style={{
            color: T.chrome.fgFainter,
            fontSize: 10.5,
            marginTop: 2,
            fontFamily: '"Geist Mono",monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ext.publisher} · {ext.downloads} {ext.downloads === 1 ? 'project' : 'projects'}
        </div>
        {!compact && (
          <>
            <div style={{ marginTop: 4 }}>
              <StarBar rating={ext.rating} color={T.syntax.code} faint={T.chrome.fgFainter} />
            </div>
            <div
              style={{
                color: T.chrome.fgDim,
                fontSize: 11.5,
                fontStyle: 'italic',
                marginTop: 4,
                lineHeight: 1.4,
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              }}
            >
              {ext.description}
            </div>
          </>
        )}
        {compact && (
          <div style={{ marginTop: 3 }}>
            <StarBar rating={ext.rating} color={T.syntax.code} faint={T.chrome.fgFainter} />
          </div>
        )}
      </div>
    </div>
  );
}

function ExtPanel() {
  const T = useContext(ThemeCtx);
  const featured = SKILL_EXTENSIONS.filter((e) => e.featured);

  const byCategory: Record<SkillExtension['category'], SkillExtension[]> = {
    languages: [],
    ml: [],
    llm: [],
    web: [],
    cloud: [],
    infra: [],
    safety: [],
  };
  for (const ext of SKILL_EXTENSIONS) byCategory[ext.category].push(ext);

  return (
    <>
      <SidebarHeader>
        Extensions · {SKILL_EXTENSIONS.length} installed
      </SidebarHeader>

      {/* Featured rail */}
      {featured.length > 0 && (
        <>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: T.chrome.fgFainter,
              padding: '4px 14px 6px',
              fontFamily: '"Geist Mono",monospace',
            }}
          >
            ★ Featured
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              padding: '0 10px 8px',
            }}
          >
            {featured.map((ext) => (
              <ExtensionCard key={ext.id} ext={ext} T={T} compact />
            ))}
          </div>
          <div style={{ height: 1, background: T.chrome.border, margin: '4px 12px 6px' }} />
        </>
      )}

      {/* Category-grouped list */}
      {CATEGORY_ORDER.map((cat) => {
        const items = byCategory[cat];
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: T.chrome.fgFainter,
                padding: '8px 14px 4px',
                fontFamily: '"Geist Mono",monospace',
              }}
            >
              {CATEGORY_LABELS[cat]} · {items.length}
            </div>
            {items.map((ext) => (
              <ExtensionCard key={ext.id} ext={ext} T={T} />
            ))}
          </div>
        );
      })}
    </>
  );
}

interface SettingsPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  tweaks: Tweaks;
  setTweak: SetTweak;
}

function SettingsPopover({ anchorRef, onClose, tweaks, setTweak }: SettingsPopoverProps) {
  const T = useContext(ThemeCtx);
  const [pos, setPos] = useState({ left: 50, bottom: 36 });

  // Anchor to the gear button: pop opens to its right, aligned to the
  // button's bottom edge so the menu rises upward.
  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ left: r.right + 6, bottom: window.innerHeight - r.bottom });
  }, [anchorRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const themes = IDE_THEMES;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 2000 }} />
      <div
        style={{
          position: 'fixed',
          left: pos.left,
          bottom: pos.bottom,
          width: 280,
          zIndex: 2001,
          background: T.chrome.editor,
          borderRadius: 12,
          boxShadow: '0 18px 50px rgba(0,0,0,0.45), 0 0 0 1px ' + T.chrome.borderStrong,
          padding: 6,
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          animation: 'sj-pop-in .14s ease-out',
        }}
      >
        <PopHeader T={T}>Theme</PopHeader>
        {Object.entries(themes).map(([k, th]) => (
          <ThemeRow
            key={k}
            themeDef={th}
            active={tweaks.theme === k}
            onClick={() => setTweak('theme', k as Tweaks['theme'])}
            T={T}
          />
        ))}

        <div style={{ height: 1, background: T.chrome.border, margin: '6px 4px' }} />

        <PopHeader T={T}>Window chrome</PopHeader>
        <Segmented
          value={tweaks.chrome}
          options={[
            { value: 'auto', label: 'auto' },
            { value: 'mac', label: 'macOS' },
            { value: 'windows', label: 'Windows' },
            { value: 'linux', label: 'Linux' },
          ]}
          onChange={(v) => setTweak('chrome', v as Tweaks['chrome'])}
          T={T}
        />

        <div style={{ height: 1, background: T.chrome.border, margin: '8px 4px' }} />

        <button
          onClick={() => {
            onClose();
            window.parent?.postMessage({ type: '__activate_edit_mode' }, '*');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 10px',
            border: 0,
            borderRadius: 6,
            background: 'transparent',
            color: T.chrome.fgDim,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12.5,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.chrome.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span>More tweaks…</span>
          <span style={{ color: T.chrome.fgFainter, fontFamily: '"Geist Mono",monospace', fontSize: 11 }}>↗</span>
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

function PopHeader({ T, children }: { T: Theme; children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: '"Geist Mono",monospace',
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: T.chrome.fgFainter,
        padding: '8px 10px 6px',
      }}
    >
      {children}
    </div>
  );
}

function ThemeRow({
  themeDef,
  active,
  onClick,
  T,
}: {
  themeDef: Theme;
  active: boolean;
  onClick: () => void;
  T: Theme;
}) {
  const swatch = [themeDef.chrome.editor, themeDef.accent, themeDef.syntax.hdr1, themeDef.syntax.code];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '8px 10px',
        border: 0,
        borderRadius: 6,
        background: active ? T.chrome.selBg : 'transparent',
        color: T.chrome.fg,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = T.chrome.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'inline-flex',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px ' + T.chrome.borderStrong,
          }}
        >
          {swatch.map((c, i) => (
            <span key={i} style={{ width: 10, height: 18, background: c }} />
          ))}
        </span>
        <span style={{ fontSize: 12.5 }}>{themeDef.name}</span>
      </span>
      {active && <span style={{ color: T.accent, fontFamily: '"Geist Mono",monospace' }}>✓</span>}
    </button>
  );
}

function Segmented({
  value,
  options,
  onChange,
  T,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  T: Theme;
}) {
  return (
    <div
      style={{
        display: 'flex',
        background: T.chrome.hoverBg,
        borderRadius: 7,
        padding: 2,
        margin: '0 6px',
      }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: '6px 4px',
              border: 0,
              borderRadius: 5,
              background: active ? T.chrome.tabActive : 'transparent',
              color: active ? T.chrome.fg : T.chrome.fgDim,
              cursor: 'pointer',
              fontSize: 11.5,
              fontFamily: '"Geist Mono",monospace',
              transition: 'background .12s, color .12s',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface SidebarProps {
  activePanel: ActivePanel;
  setActivePanel: (p: ActivePanel) => void;
  openFile: (p: string) => void;
  activePath: string | null;
  visible?: boolean;
  tweaks: Tweaks;
  setTweak: SetTweak;
}

export default function Sidebar({
  activePanel,
  setActivePanel,
  openFile,
  activePath,
  visible = true,
  tweaks,
  setTweak,
}: SidebarProps) {
  const T = useContext(ThemeCtx);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
  let panel: React.ReactNode = null;
  if (activePanel === 'explorer') panel = <ExplorerPanel openFile={openFile} activePath={activePath} />;
  else if (activePanel === 'search') panel = <SearchPanel />;
  else if (activePanel === 'scm') panel = <ScmPanel openFile={openFile} />;
  else if (activePanel === 'outline') panel = <OutlinePanel activePath={activePath} />;
  else if (activePanel === 'ext') panel = <ExtPanel />;
  return (
    <>
      <ActivityBar
        active={activePanel}
        setActive={setActivePanel}
        onSettings={() => setSettingsOpen((o) => !o)}
        settingsBtnRef={settingsBtnRef}
        settingsActive={settingsOpen}
      />
      {visible && (
        <div
          style={{
            gridArea: 'sidebar',
            background: T.chrome.sidebar,
            borderRight: '1px solid ' + T.chrome.border,
            overflow: 'auto',
            paddingBottom: 8,
          }}
        >
          {panel}
        </div>
      )}
      {settingsOpen && tweaks && setTweak && (
        <SettingsPopover
          anchorRef={settingsBtnRef}
          onClose={() => setSettingsOpen(false)}
          tweaks={tweaks}
          setTweak={setTweak}
        />
      )}
      <SidebarAnimStyle />
    </>
  );
}

// Inject the row-mount keyframe once. Used by TreeRow to animate children
// sliding in when a folder is expanded.
function SidebarAnimStyle() {
  return (
    <style>{`
      @keyframes sj-row-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
    `}</style>
  );
}

export type { ActivePanel };
