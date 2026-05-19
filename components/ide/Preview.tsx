"use client";

// Markdown preview pane — renders .md files as formatted typography
// instead of source tokens. Toggled per-tab via the breadcrumb segmented
// control or ⇧⌘V (Shift-Cmd/Ctrl-V).
//
// Phase 3: routes through MarkdownWithViz (react-markdown + remark-gfm)
// with custom code-block handlers that render `chart:bar` / `chart:line`
// blocks as Recharts visualizations and `diagram` / `mermaid` blocks
// as Mermaid SVGs. Themes apply to chart colors + Mermaid theme variables.

import React, { useContext } from 'react';
import { ThemeCtx } from '@/lib/theme';
import { MarkdownWithViz } from './viz/MarkdownWithViz';

interface MarkdownPreviewProps {
  body: string;
  openFile?: (path: string) => void;
}

export default function MarkdownPreview({ body, openFile }: MarkdownPreviewProps) {
  const T = useContext(ThemeCtx);
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '36px 56px 80px',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        color: T.chrome.fg,
        fontSize: 15,
        lineHeight: 1.65,
      }}
    >
      <article style={{ maxWidth: 680, margin: '0 auto' }}>
        <MarkdownWithViz body={body} openFile={openFile} />
      </article>
    </div>
  );
}
