// Platform detection + modifier-key labeling.
// Auto-detects mac / windows / linux from the browser; the IDE app threads
// this through a context so the Tweaks panel can override it for preview.

window.detectPlatform = function () {
  const p = (
    (navigator.userAgentData && navigator.userAgentData.platform) ||
    navigator.platform || ''
  ).toLowerCase();
  if (p.includes('mac') || p.includes('iphone') || p.includes('ipad')) return 'mac';
  if (p.includes('win')) return 'windows';
  return 'linux';
};

// Returns the symbol-or-word for the primary modifier key.
window.modKey = function (platform) {
  return platform === 'mac' ? '⌘' : 'Ctrl';
};

// Shift label: Mac uses ⇧, others spell it.
window.shiftKey = function (platform) {
  return platform === 'mac' ? '⇧' : 'Shift';
};

// Hotkey label e.g. ('P', platform) -> "⌘P" or "Ctrl+P"
window.hotkey = function (key, platform, withShift) {
  const mod = window.modKey(platform);
  const sh  = withShift ? window.shiftKey(platform) : '';
  if (platform === 'mac') return mod + sh + key;
  return [mod, withShift ? 'Shift' : null, key].filter(Boolean).join('+');
};

window.PlatformCtx = React.createContext('mac');
