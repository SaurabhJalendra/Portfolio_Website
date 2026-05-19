"use client";

// Mobile view — replaces the IDE shell entirely below 900px.
//
// Recruiters on phones don't want a desktop IDE squeezed into 375px; they
// want a clean scrollable portfolio. So we render a single vertical page
// with hero → about → selected work → writing → now → contact, plus a
// floating "Ask the assistant" sheet for the AI feature.

import React, { useContext, useEffect, useRef, useState } from 'react';
import { ThemeCtx, IDE_THEMES } from '@/lib/theme';
import { PORTFOLIO_FS } from '@/lib/data';
import type { Theme, Tweaks, SetTweak, DirNode, ThemeName } from '@/types/ide';
import MarkdownPreview from './Preview';
import {
  ChatMarkdown,
  FilePreviewCard,
  StackPills,
  ComparisonTable,
  ActionButtons,
  mockReply,
} from './Assistant';

// Hook: returns whether viewport width is below `bp` (default 900).
export function useIsMobile(bp = 900): boolean {
  const [m, setM] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  followups?: string[];
  stack?: string[];
  table?: { headers: string[]; rows: string[][] };
  actions?: { label: string; do: string; icon?: string; kind?: 'secondary' }[];
  streaming?: boolean;
}

// ------------------------------------------------------------------ App
interface MobileAppProps {
  tweaks: Tweaks;
  setTweak: SetTweak;
}

export default function MobileApp({ tweaks, setTweak }: MobileAppProps) {
  const T = useContext(ThemeCtx);
  const P = PORTFOLIO_FS;
  const [sheetFile, setSheetFile] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: T.chrome.editor,
        color: T.chrome.fg,
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        overflowX: 'hidden',
        WebkitTapHighlightColor: 'transparent',
      }}
      data-screen-label="01 Mobile Portfolio"
    >
      <TopBar T={T} tweaks={tweaks} setTweak={setTweak} />
      <Hero T={T} />
      <Section T={T} title="About" id="about">
        <RenderedMarkdown body={P.files['about.md']} onLink={setSheetFile} />
      </Section>
      <Section T={T} title="Selected work" id="projects">
        <Projects T={T} onOpen={setSheetFile} />
      </Section>
      <Section T={T} title="Writing" id="writing">
        <WritingList T={T} onOpen={setSheetFile} />
      </Section>
      <Section T={T} title="Now" id="now" subtitle="week of May 19, 2026">
        <RenderedMarkdown body={P.files['now.md']} onLink={setSheetFile} />
      </Section>
      <Section T={T} title="Reach me" id="contact">
        <ContactCard T={T} />
      </Section>
      <Footer T={T} />

      {sheetFile && <FileSheet T={T} file={sheetFile} onClose={() => setSheetFile(null)} />}
      <AskFab T={T} onClick={() => setAskOpen(true)} />
      {askOpen && <AskSheet T={T} onClose={() => setAskOpen(false)} onOpenFile={setSheetFile} />}
    </div>
  );
}

// ------------------------------------------------------------------ Top bar
function TopBar({ T, tweaks, setTweak }: { T: Theme; tweaks: Tweaks; setTweak: SetTweak }) {
  const themes = IDE_THEMES;
  const keys = Object.keys(themes) as ThemeName[];
  const cycle = () => {
    const i = (keys.indexOf(tweaks.theme) + 1) % keys.length;
    setTweak('theme', keys[i]);
  };
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: T.chrome.titlebar + 'EE',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid ' + T.chrome.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        fontFamily: '"Geist Mono",monospace',
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: T.chrome.fg,
          fontWeight: 600,
          letterSpacing: '-0.005em',
        }}
      >
        saurabhjalendra<span style={{ color: T.accent }}>.com</span>
      </span>
      <button
        onClick={cycle}
        title={'Theme: ' + tweaks.theme}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: '1px solid ' + T.chrome.border,
          borderRadius: 8,
          padding: '4px 8px 4px 6px',
          color: T.chrome.fgDim,
          cursor: 'pointer',
          fontFamily: '"Geist Mono",monospace',
          fontSize: 11,
        }}
      >
        <span style={{ display: 'inline-flex', gap: 0, borderRadius: 3, overflow: 'hidden' }}>
          <span style={{ width: 8, height: 14, background: T.chrome.editor }} />
          <span style={{ width: 8, height: 14, background: T.accent }} />
          <span style={{ width: 8, height: 14, background: T.syntax.code }} />
        </span>
        <span>{tweaks.theme}</span>
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ Hero
function Hero({ T }: { T: Theme }) {
  return (
    <div style={{ padding: '36px 24px 28px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 11px',
          borderRadius: 999,
          border: '1px solid #7be39a',
          background: 'rgba(123,227,154,0.10)',
          color: '#7be39a',
          fontSize: 11,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          fontFamily: '"Geist Mono",monospace',
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#7be39a',
            boxShadow: '0 0 8px #7be39a',
          }}
        />
        Available — Q3 2026
      </div>
      <h1
        style={{
          fontSize: 38,
          lineHeight: 1.1,
          margin: 0,
          color: T.chrome.fg,
          fontWeight: 700,
          letterSpacing: '-0.018em',
        }}
      >
        Saurabh Jalendra
      </h1>
      <div
        style={{
          marginTop: 6,
          color: T.chrome.fgDim,
          fontSize: 14,
          fontFamily: '"Geist Mono",monospace',
        }}
      >
        [Engineer · Product Builder] · IST
      </div>
      <p
        style={{
          marginTop: 18,
          fontSize: 17,
          lineHeight: 1.55,
          color: T.chrome.fg,
        }}
      >
        [One-line tagline — what you make and for whom.] I build products end-to-end and care about the boring
        foundations that make ambitious work possible.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ Section
function Section({
  T,
  title,
  subtitle,
  id,
  children,
}: {
  T: Theme;
  title: string;
  subtitle?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        padding: '28px 24px 32px',
        borderTop: '1px solid ' + T.chrome.border,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: T.chrome.fg,
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span
            style={{
              fontSize: 11,
              color: T.chrome.fgFainter,
              fontFamily: '"Geist Mono",monospace',
              letterSpacing: '0.06em',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ Projects
function Projects({ T, onOpen }: { T: Theme; onOpen: (path: string) => void }) {
  const P = PORTFOLIO_FS;
  const dir = P.tree.find((n) => n.path === 'projects') as DirNode | undefined;
  if (!dir) return null;
  const cards = dir.children.map((child) => {
    const body = P.files[child.path] || '';
    const lines = body.split('\n');
    const title = (lines[0] || '').replace(/^#\s*/, '').replace(/—.*$/, '').trim() || child.path;
    const blurb = (lines[0] || '').includes('—') ? lines[0].split('—').slice(1).join('—').trim() : '';
    // Find first paragraph
    let firstPara = '';
    for (const ln of lines.slice(1)) {
      if (!ln.trim()) continue;
      if (ln.startsWith('#') || ln.startsWith('**')) continue;
      firstPara = ln;
      break;
    }
    // Status — search for **Status:**
    const statusMatch = body.match(/\bStatus:\*?\*?\s*([a-z]+)/i);
    const status = statusMatch ? statusMatch[1].toLowerCase() : 'shipped';
    const yearMatch = body.match(/\bYear:\*?\*?\s*(\d{4})/);
    const year = yearMatch ? yearMatch[1] : '';
    return { path: child.path, title, blurb, firstPara, status, year };
  });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {cards.map((c) => (
        <button
          key={c.path}
          onClick={() => onOpen(c.path)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '16px 18px',
            background: T.chrome.titlebar,
            border: '1px solid ' + T.chrome.border,
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: T.chrome.fg,
            transition: 'transform .12s, border-color .12s',
          }}
          onTouchStart={(e) => (e.currentTarget.style.transform = 'scale(0.985)')}
          onTouchEnd={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600 }}>{c.title}</span>
            <span
              style={{
                fontFamily: '"Geist Mono",monospace',
                fontSize: 10.5,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:
                  c.status === 'wip' ? '#ffd07a' : c.status === 'archived' ? T.chrome.fgFainter : '#7be39a',
              }}
            >
              {c.status} {c.year && '· ' + c.year}
            </span>
          </div>
          <div style={{ color: T.chrome.fgDim, fontSize: 13.5, lineHeight: 1.5 }}>
            {c.blurb || c.firstPara.slice(0, 140)}
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: '"Geist Mono",monospace',
              fontSize: 11,
              color: T.chrome.fgFainter,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ color: T.accent }}>↗</span> {c.path}
          </div>
        </button>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ Writing
function WritingList({ T, onOpen }: { T: Theme; onOpen: (path: string) => void }) {
  const P = PORTFOLIO_FS;
  const dir = P.tree.find((n) => n.path === 'writing') as DirNode | undefined;
  if (!dir) return null;
  return (
    <div
      style={{
        display: 'grid',
        gap: 1,
        background: T.chrome.border,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid ' + T.chrome.border,
      }}
    >
      {dir.children.map((c) => {
        const body = P.files[c.path] || '';
        const title = (body.split('\n')[0] || '').replace(/^#\s*/, '');
        const dateMatch = c.path.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : '';
        return (
          <button
            key={c.path}
            onClick={() => onOpen(c.path)}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 10,
              padding: '14px 16px',
              background: T.chrome.titlebar,
              border: 0,
              color: T.chrome.fg,
              fontFamily: 'inherit',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
            <span style={{ fontSize: 11, color: T.chrome.fgFainter, fontFamily: '"Geist Mono",monospace' }}>
              {date}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ Contact
function ContactCard({ T }: { T: Theme }) {
  const rows: { label: string; value: string; href: string | null }[] = [
    { label: 'email', value: 'hello@saurabhjalendra.com', href: 'mailto:hello@saurabhjalendra.com' },
    { label: 'github', value: '@saurabhjalendra', href: 'https://github.com/saurabhjalendra' },
    { label: 'linkedin', value: 'in/saurabhjalendra', href: 'https://linkedin.com/in/saurabhjalendra' },
    { label: 'response', value: 'median 24h · worst 72h', href: null },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gap: 1,
        background: T.chrome.border,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid ' + T.chrome.border,
      }}
    >
      {rows.map((r) => (
        <a
          key={r.label}
          href={r.href || undefined}
          target={r.href && r.href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: T.chrome.titlebar,
            color: T.chrome.fg,
            textDecoration: 'none',
            fontFamily: '"Geist Mono",monospace',
            cursor: r.href ? 'pointer' : 'default',
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              color: T.chrome.fgFainter,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}
          >
            {r.label}
          </span>
          <span style={{ fontSize: 13, color: r.href ? T.accent : T.chrome.fg }}>{r.value}</span>
        </a>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ Footer
function Footer({ T }: { T: Theme }) {
  return (
    <div
      style={{
        padding: '24px 24px 96px',
        textAlign: 'center',
        color: T.chrome.fgFainter,
        fontFamily: '"Geist Mono",monospace',
        fontSize: 11,
        letterSpacing: '0.06em',
      }}
    >
      <div style={{ marginBottom: 4 }}>↑ this site is also an IDE on desktop ↑</div>
      <div>saurabhjalendra.com · v2026.05</div>
    </div>
  );
}

// ------------------------------------------------------------------ FAB
function AskFab({ T, onClick }: { T: Theme; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 18,
        bottom: 22,
        zIndex: 90,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: T.accent,
        color: T.chrome.statusBarFg,
        border: 0,
        cursor: 'pointer',
        boxShadow: '0 12px 32px rgba(0,0,0,0.35), 0 0 0 4px ' + T.chrome.editor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Geist Mono",monospace',
        fontSize: 14,
        fontWeight: 700,
      }}
      title="Ask the assistant"
    >
      <span style={{ transform: 'translateY(-1px)' }}>{'>_'}</span>
    </button>
  );
}

// ------------------------------------------------------------------ File sheet
// Bottom sheet for reading any portfolio file in rendered form.
function FileSheet({ T, file, onClose }: { T: Theme; file: string; onClose: () => void }) {
  const body = PORTFOLIO_FS.files[file] || '(file not found)';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        animation: 'sj-fade .18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '92vh',
          background: T.chrome.editor,
          borderRadius: '18px 18px 0 0',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sj-sheet-in .26s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        {/* Grab handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: T.chrome.borderStrong,
            }}
          />
        </div>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 18px 12px',
            borderBottom: '1px solid ' + T.chrome.border,
          }}
        >
          <div style={{ fontFamily: '"Geist Mono",monospace', fontSize: 12, color: T.chrome.fgDim }}>
            {file}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 0,
              color: T.chrome.fg,
              width: 28,
              height: 28,
              borderRadius: 6,
              padding: 0,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {/* Body — reuse MarkdownPreview */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <MarkdownPreview body={body} openFile={() => {}} />
        </div>
      </div>
      <style>{`
        @keyframes sj-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sj-sheet-in { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ------------------------------------------------------------------ Rendered markdown wrapper
function RenderedMarkdown({ body, onLink }: { body: string; onLink: (p: string) => void }) {
  return (
    <div style={{ margin: '0 -8px' }}>
      <MarkdownPreview body={body} openFile={onLink} />
    </div>
  );
}

// ------------------------------------------------------------------ Ask sheet
// Mobile-friendly chat. Uses the same mock backend as the desktop assistant.
function AskSheet({
  T,
  onClose,
  onOpenFile,
}: {
  T: Theme;
  onClose: () => void;
  onOpenFile: (p: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi — I'm grounded in this repo's files. Ask about Saurabh's work, stack, or availability.",
      citations: [],
      followups: ["What's his stack?", 'Show me his strongest project', 'Is he available?'],
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setStreaming(true);
    const reply = mockReply(q);
    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: '',
        citations: reply.citations,
        followups: reply.followups,
        stack: reply.stack,
        table: reply.table,
        actions: reply.actions,
        streaming: true,
      },
    ]);
    // Simple streaming
    const text2 = reply.text;
    let idx = 0;
    const tick = () => {
      idx = Math.min(text2.length, idx + 2 + Math.floor(Math.random() * 3));
      setMessages((m) => {
        const c = m.slice();
        const i = c.length - 1;
        c[i] = { ...c[i], content: text2.slice(0, idx) };
        return c;
      });
      if (idx < text2.length) setTimeout(tick, 16 + Math.random() * 18);
      else {
        setMessages((m) => {
          const c = m.slice();
          const i = c.length - 1;
          c[i] = { ...c[i], streaming: false };
          return c;
        });
        setStreaming(false);
      }
    };
    setTimeout(tick, 220);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        animation: 'sj-fade .18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '85vh',
          background: T.chrome.sidebar,
          borderRadius: '18px 18px 0 0',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sj-sheet-in .26s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.chrome.borderStrong }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 16px 10px',
            borderBottom: '1px solid ' + T.chrome.border,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Geist Mono",monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: T.chrome.fgFainter,
              }}
            >
              Assistant
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: T.chrome.fg,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: T.accent,
                  boxShadow: '0 0 6px ' + T.accent,
                }}
              />
              grounded in this repo
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 0,
              color: T.chrome.fg,
              width: 28,
              height: 28,
              borderRadius: 6,
              padding: 0,
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          ref={bodyRef}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {messages.map((m, i) => (
            <ChatBubble key={i} m={m} T={T} onOpenFile={onOpenFile} onFollowup={send} />
          ))}
        </div>

        <div
          style={{
            padding: '10px 12px 14px',
            borderTop: '1px solid ' + T.chrome.border,
            background: T.chrome.sidebar,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: T.chrome.editor,
              borderRadius: 12,
              border: '1px solid ' + T.chrome.border,
              padding: '10px 12px',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={streaming ? 'streaming…' : 'Ask about Saurabh…'}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: 0,
                outline: 'none',
                background: 'transparent',
                color: T.chrome.fg,
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.45,
                minHeight: 24,
                maxHeight: 120,
              }}
            />
            <button
              onClick={() => send()}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: 0,
                cursor: 'pointer',
                background: T.accent,
                color: T.chrome.statusBarFg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 11V3 M3 7l4-4 4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  m,
  T,
  onOpenFile,
  onFollowup,
}: {
  m: ChatMessage;
  T: Theme;
  onOpenFile: (p: string) => void;
  onFollowup: (q: string) => void;
}) {
  if (m.role === 'user') {
    return (
      <div
        style={{
          alignSelf: 'flex-end',
          maxWidth: '88%',
          background: T.chrome.selBg,
          color: T.chrome.fg,
          border: '1px solid ' + T.chrome.border,
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}
      >
        {m.content}
      </div>
    );
  }
  const isThinking = m.streaming && !m.content;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          flex: '0 0 auto',
          background: T.accent,
          color: T.chrome.statusBarFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Geist Mono",monospace',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {'>_'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isThinking ? (
          <div style={{ display: 'flex', gap: 5, padding: '8px 0' }}>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: T.accent,
                animation: 'sj-bounce 1.2s -.24s ease-in-out infinite',
              }}
            />
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: T.accent,
                animation: 'sj-bounce 1.2s -.12s ease-in-out infinite',
              }}
            />
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: T.accent,
                animation: 'sj-bounce 1.2s 0s    ease-in-out infinite',
              }}
            />
          </div>
        ) : (
          <ChatMarkdown
            body={m.content}
            citations={m.citations || []}
            openFile={onOpenFile}
            streaming={m.streaming}
            T={T}
          />
        )}
        {m.stack && m.stack.length > 0 && !m.streaming && <StackPills items={m.stack} T={T} />}
        {m.table && !m.streaming && <ComparisonTable table={m.table} T={T} />}
        {m.actions && m.actions.length > 0 && !m.streaming && <ActionButtons actions={m.actions} T={T} />}
        {m.citations && m.citations.length > 0 && !m.streaming && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            <span
              style={{
                fontFamily: '"Geist Mono",monospace',
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: T.chrome.fgFainter,
                marginBottom: 2,
              }}
            >
              sources
            </span>
            {m.citations.map((c) => (
              <FilePreviewCard key={c} path={c} T={T} onOpen={onOpenFile} />
            ))}
          </div>
        )}
        {m.followups && m.followups.length > 0 && !m.streaming && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {m.followups.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowup(q)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'transparent',
                  color: T.chrome.fg,
                  border: '1px solid ' + T.chrome.border,
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
