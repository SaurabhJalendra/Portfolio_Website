"use client";

// MarkdownWithViz — react-markdown wrapper that:
//   1. Renders standard Markdown (headings, paragraphs, lists, quotes, tables, …)
//   2. Routes `chart:bar` / `chart:line` / `chart:area` fenced blocks to ChartRenderer
//   3. Routes `diagram` / `mermaid` / `graph TD` fenced blocks to DiagramRenderer
//      (lazy-loaded via next/dynamic to avoid SSR breakage from Mermaid)
//   4. Styles every element against the active IDE theme
//   5. Highlights [bracketed] placeholders (preserved from the hand-rolled parser)
//   6. Routes internal links through openFile() instead of navigating

import { Children, isValidElement, useContext } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import { ThemeCtx } from '@/lib/theme';
import type { Theme } from '@/types/ide';

// Lazy-load Recharts (~191 KB gzip) — charts appear in only a few blog posts,
// so this keeps it out of the initial bundle. Same next/dynamic pattern as
// the Mermaid diagram renderer below.
const ChartRenderer = dynamic(
  () => import('./ChartRenderer').then((m) => m.ChartRenderer),
  { ssr: false, loading: () => null }
);

// Lazy-load Mermaid — touches document/window on import, breaks SSR otherwise.
const DiagramRenderer = dynamic(
  () => import('./DiagramRenderer').then((m) => m.DiagramRenderer),
  { ssr: false, loading: () => null }
);

interface MarkdownWithVizProps {
  body: string;
  openFile?: (path: string) => void;
}

function getCodeLanguage(child: ReactNode): string {
  if (isValidElement(child)) {
    const props = child.props as Record<string, unknown>;
    const className = props.className as string | undefined;
    return className?.replace('language-', '') ?? '';
  }
  return '';
}

function isVisualizationLang(lang: string): boolean {
  return lang.startsWith('chart:') || lang === 'diagram' || lang === 'mermaid';
}

// Highlight `[placeholder]` segments inside text nodes (preserves design behavior
// from the hand-rolled parser). Splits each text run by `[xxx]` and wraps the
// matches in a styled <span>. URL/markdown link brackets are handled by
// react-markdown before this runs, so this only sees raw bracketed text.
function highlightPlaceholders(text: string, T: Theme, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]\n]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span
        key={`${keyPrefix}-${k++}`}
        style={{
          background: 'rgba(255,170,107,0.14)',
          color: T.syntax.placeholder || '#ffa86b',
          padding: '0 5px',
          borderRadius: 3,
          fontWeight: 500,
        }}
      >
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

function withPlaceholderHighlights(children: ReactNode, T: Theme): ReactNode {
  return Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      return <>{highlightPlaceholders(child, T, `ph-${idx}`)}</>;
    }
    return child;
  });
}

export function MarkdownWithViz({ body, openFile }: MarkdownWithVizProps) {
  const T = useContext(ThemeCtx);

  const codeInlineStyle: React.CSSProperties = {
    background: T.chrome.hoverBg,
    color: T.syntax.code,
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: '0.92em',
    fontFamily: '"Geist Mono", monospace',
  };

  const preStyle: React.CSSProperties = {
    margin: '20px 0',
    padding: '14px 18px',
    background: T.chrome.titlebar,
    border: '1px solid ' + T.chrome.border,
    borderRadius: 10,
    fontFamily: '"Geist Mono", "JetBrains Mono", monospace',
    fontSize: 13,
    lineHeight: 1.65,
    overflow: 'auto',
    color: T.chrome.fg,
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children }) {
          const child = Children.toArray(children)[0];
          const lang = getCodeLanguage(child);
          if (isVisualizationLang(lang)) {
            // Strip the <pre> wrapper for viz blocks
            return <>{children}</>;
          }
          return <pre style={preStyle}>{children}</pre>;
        },

        code({ className, children }) {
          const codeContent = String(children).replace(/\n$/, '');
          const lang = className?.replace('language-', '') ?? '';

          // Chart blocks
          if (lang.startsWith('chart:')) {
            const chartType = lang.split(':')[1];
            return <ChartRenderer content={codeContent} chartType={chartType} />;
          }

          // Mermaid / diagram blocks
          if (lang === 'diagram' || lang === 'mermaid') {
            return <DiagramRenderer content={codeContent} />;
          }

          // Block code (inside <pre>) — styled via parent <pre>; just emit code
          if (className) {
            return (
              <code style={{ fontFamily: '"Geist Mono", monospace', color: T.chrome.fg }}>
                {children}
              </code>
            );
          }

          // Inline code
          return <code style={codeInlineStyle}>{children}</code>;
        },

        h1: ({ children }) => (
          <h1
            style={{
              fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
              fontSize: 30,
              fontWeight: 700,
              color: T.chrome.fg,
              background: T.chrome.hoverBg,
              borderLeft: '4px solid ' + T.accent,
              padding: '16px 20px',
              borderRadius: 8,
              margin: '52px 0 20px',
              lineHeight: 1.2,
              letterSpacing: '-0.012em',
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: T.chrome.fg,
              margin: '34px 0 10px',
              lineHeight: 1.25,
              letterSpacing: '-0.005em',
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: T.chrome.fg,
              margin: '24px 0 6px',
              fontFamily: '"Geist Mono", monospace',
              letterSpacing: '0.01em',
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </h3>
        ),
        h4: ({ children }) => (
          <h4
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.chrome.fg,
              margin: '20px 0 6px',
              fontFamily: '"Geist Mono", monospace',
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </h4>
        ),
        p: ({ children }) => (
          <p
            style={{
              color: T.chrome.fg,
              margin: '0 0 16px',
              fontSize: 15.5,
              lineHeight: 1.7,
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </p>
        ),
        ul: ({ children }) => (
          <ul style={{ margin: '14px 0 18px', padding: 0, listStyle: 'none' }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '14px 0 18px', paddingLeft: 22, color: T.chrome.fg }}>
            {children}
          </ol>
        ),
        li: ({ children, ...rest }) => {
          // For unordered lists we replace the bullet with the accent dash;
          // ordered lists keep the default numeric marker (still inside themed color).
          const isOrdered = (rest as { ordered?: boolean }).ordered;
          if (isOrdered) {
            return (
              <li style={{ color: T.chrome.fg, lineHeight: 1.65, padding: '4px 0' }}>
                {withPlaceholderHighlights(children, T)}
              </li>
            );
          }
          return (
            <li
              style={{
                display: 'flex',
                gap: 12,
                padding: '5px 0',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  color: T.accent,
                  flex: '0 0 auto',
                  marginTop: 2,
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: 13,
                }}
              >
                —
              </span>
              <span style={{ color: T.chrome.fg, lineHeight: 1.65 }}>
                {withPlaceholderHighlights(children, T)}
              </span>
            </li>
          );
        },
        a: ({ href, children }) => {
          const url = href || '';
          const isInternal = url && !/^https?:|^mailto:|^#/.test(url);
          return (
            <a
              href={url}
              onClick={(e) => {
                if (isInternal && openFile) {
                  e.preventDefault();
                  openFile(url);
                }
              }}
              target={isInternal ? undefined : '_blank'}
              rel="noreferrer"
              style={{
                color: T.syntax.linkText,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                textDecorationColor: T.chrome.borderStrong,
                cursor: 'pointer',
              }}
            >
              {children}
            </a>
          );
        },
        blockquote: ({ children }) => (
          <blockquote
            style={{
              margin: '22px 0',
              padding: '12px 18px',
              borderLeft: '3px solid ' + T.accent,
              background: T.chrome.hoverBg,
              borderRadius: '0 10px 10px 0',
              color: T.chrome.fg,
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.55,
            }}
          >
            {children}
          </blockquote>
        ),
        strong: ({ children }) => (
          <strong style={{ fontWeight: 700, color: T.chrome.fg }}>
            {withPlaceholderHighlights(children, T)}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ color: T.syntax.emItalic, fontStyle: 'italic' }}>
            {withPlaceholderHighlights(children, T)}
          </em>
        ),
        hr: () => (
          <hr
            style={{
              border: 'none',
              height: 3,
              width: 72,
              background: T.accent,
              borderRadius: 999,
              margin: '64px 0 8px',
            }}
          />
        ),
        table: ({ children }) => (
          <div style={{ overflowX: 'auto', margin: '20px 0' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid ' + T.chrome.border,
                fontSize: 14,
                color: T.chrome.fg,
              }}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead style={{ background: T.chrome.hoverBg }}>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr style={{ borderBottom: '1px solid ' + T.chrome.border }}>{children}</tr>
        ),
        th: ({ children }) => (
          <th
            style={{
              padding: '10px 14px',
              textAlign: 'left',
              fontWeight: 600,
              color: T.chrome.fg,
              border: '1px solid ' + T.chrome.border,
              fontFamily: '"Geist Mono", monospace',
              fontSize: 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            style={{
              padding: '10px 14px',
              color: T.chrome.fg,
              border: '1px solid ' + T.chrome.border,
            }}
          >
            {withPlaceholderHighlights(children, T)}
          </td>
        ),
      }}
    >
      {body}
    </ReactMarkdown>
  );
}

export default MarkdownWithViz;
