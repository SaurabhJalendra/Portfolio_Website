// Type definitions for the IDE portfolio.
//
// Types are intentionally loose for design-faithful porting — design uses
// dynamic shapes that resist tight typing. We can tighten in a polish pass.

export type ThemeName = 'midnight' | 'phosphor' | 'paper' | 'solar';
export type ChromeName = 'auto' | 'mac' | 'windows' | 'linux';
export type Platform = 'mac' | 'windows' | 'linux';
export type Lang = 'md' | 'json' | 'yaml' | 'ini';

export interface ChromeColors {
  titlebar: string;
  activityBar: string;
  sidebar: string;
  editor: string;
  panel: string;
  statusBar: string;
  statusBarFg: string;
  border: string;
  borderStrong: string;
  fg: string;
  fgDim: string;
  fgFainter: string;
  selBg: string;
  hoverBg: string;
  tabActive: string;
  gutter: string;
}

export interface SyntaxColors {
  text: string;
  comment: string;
  punct: string;
  hdrHash: string;
  hdr1: string;
  hdr2: string;
  hdr3: string;
  bold: string;
  emItalic: string;
  code: string;
  quote: string;
  quoteText: string;
  listBullet: string;
  linkText: string;
  linkHref: string;
  placeholder: string;
  jsonKey: string;
  jsonStr: string;
  jsonNum: string;
  jsonKw: string;
  yamlKey: string;
  yamlBare: string;
  iniSection: string;
}

export interface TerminalColors {
  fg: string;
  dim: string;
  prompt: string;
  ok: string;
  warn: string;
  err: string;
  info: string;
  bright: string;
  banner: string;
  bannerGlow: string;
}

export interface Theme {
  name: string;
  accent: string;
  chrome: ChromeColors;
  syntax: SyntaxColors;
  terminal: TerminalColors;
}

export type Themes = Record<ThemeName, Theme>;

export interface FileNode {
  type: 'file';
  path: string;
  lang: Lang;
  pinned?: boolean;
}

export interface DirNode {
  type: 'dir';
  path: string;
  children: FSNode[];
}

export type FSNode = FileNode | DirNode;

export interface PortfolioFS {
  root: string;
  tree: FSNode[];
  files: Record<string, string>;
}

export interface Token {
  t: string;
  v: string;
}

export interface OutlineEntry {
  depth: number;
  text: string;
  line: number;
}

export interface Tweaks {
  theme: ThemeName;
  chrome: ChromeName;
  motion: boolean;
  scanlines: boolean;
  sidebar: boolean;
  minimap: boolean;
  assistant: boolean;
  terminal: boolean;
  avatar: string;
}

export type SetTweak = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
