// Platform detection + modifier-key labeling.
// Auto-detects mac / windows / linux from the browser; the IDE app threads
// this through a context so the Tweaks panel can override it for preview.

import { createContext } from 'react';
import type { Platform } from '@/types/ide';

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'mac';
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const p = (
    (nav.userAgentData && nav.userAgentData.platform) ||
    navigator.platform ||
    ''
  ).toLowerCase();
  if (p.includes('mac') || p.includes('iphone') || p.includes('ipad')) return 'mac';
  if (p.includes('win')) return 'windows';
  return 'linux';
}

// Returns the symbol-or-word for the primary modifier key.
export function modKey(platform: Platform): string {
  return platform === 'mac' ? '⌘' : 'Ctrl';
}

// Shift label: Mac uses ⇧, others spell it.
export function shiftKey(platform: Platform): string {
  return platform === 'mac' ? '⇧' : 'Shift';
}

// Hotkey label e.g. ('P', platform) -> "⌘P" or "Ctrl+P"
export function hotkey(key: string, platform: Platform, withShift?: boolean): string {
  const mod = modKey(platform);
  const sh = withShift ? shiftKey(platform) : '';
  if (platform === 'mac') return mod + sh + key;
  return [mod, withShift ? 'Shift' : null, key].filter(Boolean).join('+');
}

export const PlatformCtx = createContext<Platform>('mac');
