"use client";

// DiagramRenderer — ported from _legacy/src/components/ui/visualizations/DiagramRenderer.tsx
//
// Renders a Mermaid diagram from raw `graph TD` source. Mermaid touches
// document/window APIs on import, so this module must be loaded with
// next/dynamic({ ssr: false }) from its caller.
//
// Theme mapping (IDE theme → Mermaid theme):
//   midnight → 'dark'
//   phosphor → 'dark' + green themeVariables override
//   paper    → 'default' (light)
//   solar    → 'dark' + amber themeVariables override

import { useContext, useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ThemeCtx, IDE_THEMES } from '@/lib/theme';
import type { Theme } from '@/types/ide';

function detectThemeName(T: Theme): 'midnight' | 'phosphor' | 'paper' | 'solar' {
  if (T.accent === IDE_THEMES.midnight.accent) return 'midnight';
  if (T.accent === IDE_THEMES.phosphor.accent) return 'phosphor';
  if (T.accent === IDE_THEMES.paper.accent) return 'paper';
  if (T.accent === IDE_THEMES.solar.accent) return 'solar';
  return 'midnight';
}

function mermaidConfigFor(themeName: ReturnType<typeof detectThemeName>, T: Theme) {
  if (themeName === 'paper') {
    return {
      theme: 'default' as const,
      themeVariables: {
        primaryColor: T.chrome.editor,
        primaryTextColor: T.chrome.fg,
        primaryBorderColor: T.accent,
        lineColor: T.chrome.fgDim,
        secondaryColor: T.chrome.titlebar,
        tertiaryColor: T.chrome.sidebar,
        background: T.chrome.editor,
        mainBkg: T.chrome.editor,
        nodeBorder: T.accent,
        clusterBkg: T.chrome.sidebar,
        clusterBorder: T.chrome.borderStrong,
        edgeLabelBackground: T.chrome.titlebar,
        fontSize: '14px',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      },
    };
  }

  // Dark-base themes (midnight / phosphor / solar) — override with theme tokens
  return {
    theme: 'dark' as const,
    themeVariables: {
      primaryColor: T.chrome.editor,
      primaryTextColor: T.chrome.fg,
      primaryBorderColor: T.accent,
      lineColor: T.chrome.fgDim,
      secondaryColor: T.chrome.titlebar,
      tertiaryColor: T.chrome.sidebar,
      background: T.chrome.editor,
      mainBkg: T.chrome.editor,
      nodeBorder: T.accent,
      clusterBkg: T.chrome.sidebar,
      clusterBorder: T.chrome.borderStrong,
      edgeLabelBackground: T.chrome.titlebar,
      titleColor: T.chrome.fg,
      textColor: T.chrome.fg,
      fontSize: '14px',
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    },
  };
}

export function DiagramRenderer({ content }: { content: string }) {
  const T = useContext(ThemeCtx);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');
  const reactId = useId();
  const renderCount = useRef(0);

  useEffect(() => {
    const themeName = detectThemeName(T);
    const config = mermaidConfigFor(themeName, T);
    mermaid.initialize({ startOnLoad: false, ...config });

    // Generate unique ID for each render to avoid Mermaid ID collisions
    renderCount.current += 1;
    const id = `mermaid-${reactId.replace(/:/g, '')}-${renderCount.current}`;

    let cancelled = false;

    const render = async () => {
      try {
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const { svg: renderedSvg } = await mermaid.render(id, content.trim());
        if (!cancelled) setSvg(renderedSvg);
      } catch (e) {
        console.error('Mermaid render error:', e);
        if (!cancelled) {
          setSvg(
            `<pre style="color: ${T.terminal.err}; font-size: 13px; white-space: pre-wrap; font-family: 'Geist Mono', monospace;">${content}</pre>`
          );
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [content, reactId, T]);

  return (
    <div
      ref={containerRef}
      style={{
        margin: '24px 0',
        padding: '20px',
        background: T.chrome.titlebar,
        border: '1px solid ' + T.chrome.border,
        borderRadius: 10,
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default DiagramRenderer;
