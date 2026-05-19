"use client";

// Resizer — thin draggable strip placed at a panel boundary.
// Real VS Code parity: drag to resize, double-click to reset to default,
// cursor changes on hover, persists user adjustments via parent state.
//
// Used by App.tsx at three boundaries:
//   1. Sidebar ↔ Editor       (vertical handle, drag right = wider sidebar)
//   2. Editor ↔ Assistant     (vertical handle, drag left = wider assistant)
//   3. Editor ↔ Terminal      (horizontal handle, drag up = taller terminal)

import { useEffect, useRef, useState, CSSProperties } from 'react';

interface ResizerProps {
  orientation: 'vertical' | 'horizontal';
  current: number;
  onChange: (next: number) => void;
  onReset?: () => void;
  min: number;
  max: number;
  /**
   * If true, dragging "negative" direction (left for vertical, up for horizontal)
   * increases the size. Used when the handle sits on the LEFT edge of the panel
   * being resized (e.g., assistant panel handle = left edge, drag left = wider).
   */
  reverse?: boolean;
  /** Absolute positioning anchors. Pass the relevant subset (left/right/top/bottom). */
  position: Pick<CSSProperties, 'left' | 'right' | 'top' | 'bottom'>;
  /** Theme accent — used for the brief hover/drag highlight. */
  accent: string;
  /** Optional accessible label for screen readers. */
  ariaLabel?: string;
}

export function Resizer({
  orientation,
  current,
  onChange,
  onReset,
  min,
  max,
  reverse = false,
  position,
  accent,
  ariaLabel,
}: ResizerProps) {
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ pos: 0, size: current });

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const cursorPos = orientation === 'vertical' ? e.clientX : e.clientY;
      const rawDelta = cursorPos - startRef.current.pos;
      const delta = reverse ? -rawDelta : rawDelta;
      const next = Math.max(min, Math.min(max, startRef.current.size + delta));
      onChange(next);
    };

    const onUp = () => setDragging(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = orientation === 'vertical' ? 'ew-resize' : 'ns-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragging, orientation, onChange, min, max, reverse]);

  const baseStyle: CSSProperties = {
    position: 'absolute',
    ...position,
    width: orientation === 'vertical' ? 5 : undefined,
    height: orientation === 'horizontal' ? 5 : undefined,
    cursor: orientation === 'vertical' ? 'ew-resize' : 'ns-resize',
    zIndex: 100,
    background: hover || dragging ? accent : 'transparent',
    opacity: hover || dragging ? 0.5 : 1,
    transition: 'background 0.15s ease, opacity 0.15s ease',
  };

  return (
    <div
      role="separator"
      aria-label={ariaLabel || `${orientation} resize handle`}
      aria-orientation={orientation}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => {
        startRef.current = {
          pos: orientation === 'vertical' ? e.clientX : e.clientY,
          size: current,
        };
        setDragging(true);
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        onReset?.();
      }}
      style={baseStyle}
    />
  );
}

/**
 * Constants for default + min/max widths/heights per panel.
 * Co-located here so resize bounds + defaults stay in sync.
 */
export const LAYOUT_DIMS = {
  sidebar: { default: 240, min: 180, max: 400 },
  assistant: { default: 440, min: 320, max: 540 },
  minimap: { default: 76, min: 60, max: 120 },
  terminal: { default: 230, min: 150, max: 600 },
} as const;

/**
 * localStorage key namespace for layout dimensions.
 * Keep in sync with the hydration effect in App.tsx.
 */
export const LAYOUT_STORAGE_KEYS = {
  sidebar: 'portfolio.layout.sidebarWidth',
  assistant: 'portfolio.layout.assistantWidth',
  minimap: 'portfolio.layout.minimapWidth',
  terminal: 'portfolio.layout.terminalHeight',
} as const;
