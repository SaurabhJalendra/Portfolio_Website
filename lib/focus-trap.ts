"use client";

// useFocusTrap — confines Tab/Shift+Tab focus to a container while it is
// mounted, and restores focus to whatever was focused before it opened.
//
// Usage:
//   const ref = useRef<HTMLDivElement>(null);
//   useFocusTrap(ref, isOpen);
//   ...
//   <div ref={ref}>…overlay content…</div>
//
// On mount (when `active`): remembers document.activeElement, then moves
// focus into the container (first focusable element, else the container
// itself). While active: Tab wraps within the container. On unmount /
// deactivate: focus is returned to the remembered element.

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Move focus into the overlay if it isn't already there.
    if (!container.contains(document.activeElement)) {
      const first = focusables()[0];
      if (first) first.focus();
      else {
        container.tabIndex = -1;
        container.focus();
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last || !container.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      // Restore focus to the element that was focused before the trap opened.
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef]);
}
