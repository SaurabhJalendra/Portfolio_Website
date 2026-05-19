// Citation fly-to-tab animation.
// Given a chip element and a path, opens the file in the editor and
// animates a clone of the chip from its current position into the new
// tab's position in the tab strip.
//
// Usage from anywhere:
//   flyToTab(chipElement, 'projects/alpha.md', openFile);
//
// Falls back to a plain openFile if measurement fails.

declare global {
  interface Window {
    IDE_FLY_TO_TAB?: (chipEl: HTMLElement | null, path: string, openFile?: (p: string) => void) => Promise<void>;
  }
}

export async function flyToTab(
  chipEl: HTMLElement | null,
  path: string,
  openFile?: (path: string) => void
): Promise<void> {
  if (!chipEl || !openFile) {
    openFile?.(path);
    return;
  }
  const from = chipEl.getBoundingClientRect();
  const chipStyle = getComputedStyle(chipEl);
  const text = (chipEl as HTMLElement).innerText || path;

  // Trigger the open — React state changes, new tab will mount.
  openFile(path);

  // Wait two RAFs so React commits + browser paints, then measure target.
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  const tabEl = document.querySelector('[data-tab-path="' + cssEscape(path) + '"]') as HTMLElement | null;
  if (!tabEl) return; // tab not found — give up silently

  const to = tabEl.getBoundingClientRect();

  // Build the flying clone. Cloned styles keep visual continuity from the
  // chip; transform targets the tab's center for a smooth landing.
  const clone = document.createElement('div');
  Object.assign(clone.style, {
    position: 'fixed',
    left: from.left + 'px',
    top: from.top + 'px',
    height: from.height + 'px',
    paddingLeft: chipStyle.paddingLeft,
    paddingRight: chipStyle.paddingRight,
    paddingTop: chipStyle.paddingTop,
    paddingBottom: chipStyle.paddingBottom,
    borderRadius: chipStyle.borderRadius,
    background: chipStyle.backgroundColor,
    color: chipStyle.color,
    border: chipStyle.border,
    fontFamily: chipStyle.fontFamily,
    fontSize: chipStyle.fontSize,
    fontWeight: chipStyle.fontWeight,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    pointerEvents: 'none',
    zIndex: '9999',
    transition: 'transform .55s cubic-bezier(.34,.04,.18,1), opacity .55s ease-out',
    boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
    willChange: 'transform, opacity',
    whiteSpace: 'nowrap',
  });
  clone.textContent = text;
  document.body.appendChild(clone);

  // Force layout so the starting transform takes effect before we set the
  // ending one (otherwise the browser merges them into a no-op).
  void clone.offsetWidth;

  // Target the tab's horizontal center so the clone lands cleanly on it.
  const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
  const dy = to.top - from.top;
  clone.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.78)';
  clone.style.opacity = '0';

  // Brief landing flash on the destination tab — communicates "this is it".
  tabEl.style.animation = 'sj-tab-land .6s .3s ease-out';
  setTimeout(() => { tabEl.style.animation = ''; }, 1000);

  setTimeout(() => clone.remove(), 650);
}

// CSS.escape polyfill-ish for older browsers (and to keep selector safe
// when paths include '/', '.', etc).
function cssEscape(s: string): string {
  if (typeof window !== 'undefined' && window.CSS && CSS.escape) return CSS.escape(s);
  return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

// Ensure the keyframe for the landing-flash exists once, and register a
// window-level entry point so legacy callers still work.
export function installFlyToTab(): void {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('sj-fly-css')) {
    const s = document.createElement('style');
    s.id = 'sj-fly-css';
    s.textContent =
      '@keyframes sj-tab-land { 0% { box-shadow: inset 0 0 0 0 transparent; } '+
      '50% { box-shadow: inset 0 0 0 9999px rgba(255,255,255,0.06); } '+
      '100% { box-shadow: inset 0 0 0 0 transparent; } }';
    document.head.appendChild(s);
  }
  if (typeof window !== 'undefined') {
    window.IDE_FLY_TO_TAB = flyToTab;
  }
}
