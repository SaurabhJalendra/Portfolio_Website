"use client";

// Integrated terminal. A real (small) shell:
//   ls / ls projects        → tree listing
//   cat <file>              → prints any portfolio file
//   open <file>             → opens the file in the editor
//   whoami                  → short bio
//   projects                → list projects with status
//   contact                 → contact card
//   now                     → /now content
//   theme [name]            → change/inspect theme
//   clear                   → clear scrollback
//   help / ?                → list commands
//   curl saurabhjalendra.com → cute ASCII response
//   echo / date / pwd       → standard mini-commands
//   any unknown → cmd not found, with suggestion

import { useContext, useEffect, useRef, useState } from 'react';
import { ThemeCtx, IDE_THEMES } from '@/lib/theme';
import { PlatformCtx, modKey } from '@/lib/platform';
import { PORTFOLIO_FS } from '@/lib/data';
import type { Theme, ThemeName, FSNode, DirNode } from '@/types/ide';

interface TerminalLine {
  kind: 'prompt' | 'banner' | 'out';
  text: string;
  color?: string;
}

interface TerminalProps {
  openFile: (path: string) => void;
  setTheme: (name: string) => void;
  themeName: string;
  visible: boolean;
  onClose: () => void;
}

export default function Terminal({ openFile, setTheme, themeName, visible, onClose }: TerminalProps) {
  const T = useContext(ThemeCtx);
  const platform = useContext(PlatformCtx);
  const mod = modKey(platform);
  const [history, setHistory] = useState<TerminalLine[]>(() => bootHistory(mod));
  const [input, setInput] = useState('');
  const [past, setPast] = useState<string[]>([]);
  const [pastIdx, setPastIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  function pushLines(lines: TerminalLine[]) {
    setHistory((h) => [...h, ...lines]);
  }

  function run(raw: string) {
    const trimmed = raw.trim();
    pushLines([{ kind: 'prompt', text: raw }]);
    if (!trimmed) return;
    const [cmd, ...args] = trimmed.split(/\s+/);
    const out = exec(cmd, args, { openFile, setTheme, themeName });
    pushLines(out);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input);
      if (input.trim()) {
        setPast((p) => [...p, input]);
        setPastIdx(-1);
      }
      setInput('');
    } else if (e.key === 'ArrowUp') {
      if (past.length) {
        e.preventDefault();
        const i = pastIdx === -1 ? past.length - 1 : Math.max(0, pastIdx - 1);
        setPastIdx(i);
        setInput(past[i]);
      }
    } else if (e.key === 'ArrowDown') {
      if (pastIdx !== -1) {
        e.preventDefault();
        const i = pastIdx + 1;
        if (i >= past.length) {
          setPastIdx(-1);
          setInput('');
        } else {
          setPastIdx(i);
          setInput(past[i]);
        }
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistory([]);
    }
  }

  if (!visible) return null;

  return (
    <div
      style={{
        gridArea: 'panel',
        background: T.chrome.panel,
        borderTop: '1px solid ' + T.chrome.borderStrong,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"Geist Mono","JetBrains Mono",monospace',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          borderBottom: '1px solid ' + T.chrome.border,
          fontSize: 11,
          color: T.chrome.fgDim,
        }}
      >
        <div style={{ display: 'flex', gap: 18 }}>
          <span style={{ color: T.chrome.fgDim }}>PROBLEMS</span>
          <span style={{ color: T.chrome.fgDim }}>OUTPUT</span>
          <span style={{ color: T.chrome.fgDim }}>DEBUG</span>
          <span style={{ color: T.chrome.fg, borderBottom: '1px solid ' + T.accent, paddingBottom: 2 }}>TERMINAL</span>
          <span style={{ color: T.chrome.fgDim }}>PORTS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>zsh · saurabhjalendra</span>
          <button
            onClick={onClose}
            title={'Hide · ' + mod + 'J'}
            style={{
              background: 'transparent',
              border: 0,
              color: T.chrome.fgFainter,
              cursor: 'pointer',
              width: 22,
              height: 22,
              borderRadius: 4,
              padding: 0,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>
      {/* Body */}
      <div
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
        style={{ flex: 1, overflow: 'auto', padding: '8px 14px', fontSize: 12.5, lineHeight: 1.6 }}
      >
        {history.map((l, i) => (
          <TermLine key={i} line={l} T={T} />
        ))}
        {/* Live input line */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ color: T.terminal.prompt }}>saurabh@portfolio</span>
          <span style={{ color: T.chrome.fgFainter, margin: '0 6px' }}>:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 0,
              outline: 'none',
              color: T.terminal.fg,
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TermLine({ line, T }: { line: TerminalLine; T: Theme }) {
  // Resolve role names (ok / err / warn / info / bright / accent / dim) into
  // theme colors; pass-through any literal value (hex/rgba) for one-offs.
  const resolve = (c?: string): string => {
    if (!c) return T.terminal.fg;
    if (typeof c !== 'string') return c;
    if (c[0] === '#' || c.startsWith('rgb') || c.startsWith('hsl')) return c;
    if (c === 'accent') return T.accent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (T.terminal as any)[c] || T.terminal.fg;
  };
  if (line.kind === 'prompt')
    return (
      <div>
        <span style={{ color: T.terminal.prompt }}>saurabh@portfolio</span>
        <span style={{ color: T.chrome.fgFainter, margin: '0 6px' }}>:~$</span>
        <span style={{ color: T.terminal.fg }}>{line.text}</span>
      </div>
    );
  if (line.kind === 'banner')
    return (
      <pre
        style={{
          margin: 0,
          color: T.terminal.banner,
          textShadow: '0 0 8px ' + T.terminal.bannerGlow,
          fontSize: 11,
          lineHeight: 1.1,
        }}
      >
        {line.text}
      </pre>
    );
  return <div style={{ color: resolve(line.color), whiteSpace: 'pre-wrap' }}>{line.text}</div>;
}

function bootHistory(mod: string): TerminalLine[] {
  const m = mod || '⌘';
  return [
    {
      kind: 'banner',
      text: `  ███████╗     ██╗
  ██╔════╝     ██║
  ███████╗     ██║
  ╚════██║██   ██║
  ███████║╚█████╔╝
  ╚══════╝ ╚════╝   saurabhjalendra.com`,
    },
    { kind: 'out', text: 'welcome — try `help` or `ls`. press ' + m + 'J to hide me.', color: 'info' },
    { kind: 'out', text: '' },
  ];
}

interface ExecContext {
  openFile: (p: string) => void;
  setTheme: (name: string) => void;
  themeName: string;
}

function exec(cmd: string, args: string[], ctx: ExecContext): TerminalLine[] {
  const P = PORTFOLIO_FS;
  const allPaths: string[] = [];
  const walk = (ns: FSNode[]) =>
    ns.forEach((n) => {
      allPaths.push(n.path);
      if ('children' in n && n.children) walk(n.children);
    });
  walk(P.tree);

  if (cmd === 'help' || cmd === '?') {
    return [
      { kind: 'out', text: 'commands:', color: 'ok' },
      { kind: 'out', text: '  ls [path]        list files' },
      { kind: 'out', text: '  cat <file>       print file contents' },
      { kind: 'out', text: '  open <file>      open in editor' },
      { kind: 'out', text: '  whoami           short bio' },
      { kind: 'out', text: '  projects         list projects' },
      { kind: 'out', text: '  contact          contact card' },
      { kind: 'out', text: '  now              current focus' },
      { kind: 'out', text: '  theme [name]     midnight | phosphor | paper | solar' },
      { kind: 'out', text: '  clear            clear scrollback (⌃L)' },
      { kind: 'out', text: '  curl ' + 'saurabhjalendra.com', color: 'info' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'ls') {
    const target = args[0];
    if (!target) {
      return [
        ...P.tree.map(
          (n) =>
            ({
              kind: 'out',
              text: n.type === 'dir' ? n.path + '/' : n.path,
              color: n.type === 'dir' ? 'accent' : undefined,
            }) as TerminalLine
        ),
        { kind: 'out', text: '' },
      ];
    }
    const dir = P.tree.find((n) => n.path === target.replace(/\/$/, '') && n.type === 'dir') as DirNode | undefined;
    if (dir)
      return [
        ...dir.children.map((c) => ({ kind: 'out', text: c.path }) as TerminalLine),
        { kind: 'out', text: '' },
      ];
    return [
      { kind: 'out', text: 'ls: no such directory: ' + target, color: 'err' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'cat') {
    const file = args[0];
    if (!file)
      return [
        { kind: 'out', text: 'cat: missing file', color: 'err' },
        { kind: 'out', text: '' },
      ];
    const body = P.files[file];
    if (!body)
      return [
        { kind: 'out', text: 'cat: ' + file + ': no such file', color: 'err' },
        { kind: 'out', text: '' },
      ];
    return [...body.split('\n').map((l) => ({ kind: 'out', text: l }) as TerminalLine), { kind: 'out', text: '' }];
  }

  if (cmd === 'open') {
    const file = args[0];
    if (!file)
      return [
        { kind: 'out', text: 'open: missing file', color: 'err' },
        { kind: 'out', text: '' },
      ];
    if (!P.files[file])
      return [
        { kind: 'out', text: 'open: ' + file + ': no such file', color: 'err' },
        { kind: 'out', text: '' },
      ];
    ctx.openFile?.(file);
    return [
      { kind: 'out', text: '→ opened ' + file, color: 'ok' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'whoami') {
    return [
      { kind: 'out', text: 'Saurabh Jalendra', color: 'bright' },
      { kind: 'out', text: '[Engineer · Product Builder]', color: 'info' },
      { kind: 'out', text: 'available Q3 2026 — hello@saurabhjalendra.com' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'projects') {
    const dir = P.tree.find((n) => n.path === 'projects') as DirNode | undefined;
    if (!dir)
      return [
        { kind: 'out', text: 'projects: directory not found', color: 'err' },
        { kind: 'out', text: '' },
      ];
    return [
      ...dir.children.map((c) => {
        const title = (P.files[c.path] || '').split('\n')[0].replace(/^#\s*/, '');
        return {
          kind: 'out',
          text:
            '  ' + (c.path.replace('projects/', '').replace('.md', '').padEnd(10, ' ')) + ' · ' + title,
        } as TerminalLine;
      }),
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'contact') {
    return [
      { kind: 'out', text: 'email     hello@saurabhjalendra.com', color: 'bright' },
      { kind: 'out', text: 'github    @saurabhjalendra' },
      { kind: 'out', text: 'linkedin  in/saurabhjalendra' },
      { kind: 'out', text: 'response  median 24h · worst 72h' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'now') {
    return [
      ...(P.files['now.md'] || '').split('\n').map((l) => ({ kind: 'out', text: l }) as TerminalLine),
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'theme') {
    if (!args[0])
      return [
        { kind: 'out', text: 'current theme: ' + ctx.themeName, color: 'info' },
        { kind: 'out', text: 'available: midnight, phosphor, paper, solar' },
        { kind: 'out', text: '' },
      ];
    if ((IDE_THEMES as Record<string, unknown>)[args[0]]) {
      ctx.setTheme(args[0] as ThemeName);
      return [
        { kind: 'out', text: 'theme → ' + args[0], color: 'ok' },
        { kind: 'out', text: '' },
      ];
    }
    return [
      { kind: 'out', text: 'no such theme: ' + args[0], color: 'err' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'clear') {
    setTimeout(() => {
      // Hack: caller refreshes by re-mounting; we just emit a marker
    }, 0);
    return []; // handled below in onKey via ⌃L; explicit handled there
  }

  if (cmd === 'echo')
    return [
      { kind: 'out', text: args.join(' ') },
      { kind: 'out', text: '' },
    ];
  if (cmd === 'pwd')
    return [
      { kind: 'out', text: '/home/saurabh/portfolio' },
      { kind: 'out', text: '' },
    ];
  if (cmd === 'date')
    return [
      { kind: 'out', text: new Date().toString() },
      { kind: 'out', text: '' },
    ];

  if (cmd === 'curl') {
    return [
      { kind: 'out', text: 'HTTP/2 200', color: 'ok' },
      { kind: 'out', text: 'server: portfolio' },
      { kind: 'out', text: 'content-type: text/html; charset=utf-8' },
      { kind: 'out', text: '' },
      { kind: 'out', text: '<!-- you found the curl. nice. -->', color: 'info' },
      { kind: 'out', text: '<p>hi — i make things. hello@saurabhjalendra.com</p>' },
      { kind: 'out', text: '' },
    ];
  }

  if (cmd === 'sudo')
    return [
      { kind: 'out', text: 'nice try.', color: 'warn' },
      { kind: 'out', text: '' },
    ];
  if (cmd === 'rm' && args.includes('-rf'))
    return [
      { kind: 'out', text: "… let's not.", color: 'warn' },
      { kind: 'out', text: '' },
    ];

  // unknown
  return [
    { kind: 'out', text: 'zsh: command not found: ' + cmd, color: 'err' },
    { kind: 'out', text: 'try `help` for the list', color: 'info' },
    { kind: 'out', text: '' },
  ];
}
