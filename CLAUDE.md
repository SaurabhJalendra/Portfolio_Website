# Portfolio Site v2 — Project Instructions

> **In-progress migration**: this project is being rewritten from Vite + React 19 (2D static portfolio) to **Next.js 16 + App Router + Tailwind 4** as an **IDE-style portfolio** (VS Code / Zed aesthetic). The old Vite site is archived in `_legacy/` for rollback safety through the soak period. Final cleanup of `_legacy/` and old GitHub Pages workflows happens in Phase 8 after production stabilizes.

> **Plan reference**: `C:\Users\Saurabh\.claude\plans\valiant-roaming-thompson.md` (the full approved plan with all 10 brainstorm answers, phase breakdowns, verification steps, and rollback strategy)

---

## Project Overview

A personal portfolio site for **Saurabh Jalendra** styled as a working code editor. Content lives as "files" in a project workspace — visitors open them in tabs, view raw markdown with syntax highlighting (or Preview mode for blog posts with charts), run commands in an integrated terminal, and use ⌘P quick-open + ⌘K command palette to navigate. Four themes (midnight default, phosphor, paper, solar) and platform-adaptive chrome (mac / windows / linux).

**Target**: `saurabhjalendra.com` (DNS currently on GitHub Pages; will retarget to Vercel at Phase 7 cutover).

**Audience**: frontier-AI-lab recruiters (Anthropic, OpenAI, DeepMind, Mistral, AMI Labs) — the IDE aesthetic signals "this person works inside code" rather than "marketing site."

---

## Stack (confirmed 2026-05-19)

- **Framework**: Next.js 16.2.6 + App Router + TypeScript (strict)
- **Styling**: Tailwind CSS 4 + CSS variables for theme tokens
- **Content**: MDX via `@next/mdx` for project + writing files; JSON for `experience.json`; YAML for `contact.yaml`
- **Fonts**: `next/font/local` self-hosting Geist Mono, IBM Plex Mono, IBM Plex Sans, JetBrains Mono
- **Deploy**: Vercel (free hobby tier; native Next.js home; `/api/chat` route for Phase 5 assistant)
- **LLM (Phase 5)**: OpenRouter (model TBD in assistant phase brainstorm)
- **Animation**: built-in CSS transitions + small RAF utilities (no GSAP / Lenis); Framer Motion if needed
- **Build artifacts**: `.next/` (gitignored), Vercel auto-deploys on push

**Next.js 16 caveat** (see `AGENTS.md`): may have breaking changes from pre-trained patterns. Read `node_modules/next/dist/docs/` before writing non-trivial Next.js code.

---

## Repository Structure (target)

```
portfolio/                              ← Next.js root
├── app/                                ← Next.js App Router
│   ├── layout.tsx                      ← root layout + font loading
│   ├── page.tsx                        ← IDE shell mount point (single-page app)
│   └── api/
│       └── chat/route.ts               ← Phase 5: OpenRouter proxy with streaming
├── components/
│   └── ide/                            ← IDE-specific React components
│       ├── App.tsx                     ← state root (tabs, theme, palette, sidebar)
│       ├── Chrome.tsx                  ← title bar (platform variants) + status bar
│       ├── ActivityBar.tsx             ← 46px left rail with 6 icons
│       ├── Sidebar.tsx                 ← 240px panel dispatcher
│       ├── Editor.tsx                  ← tabs + breadcrumb + code body + minimap
│       ├── Preview.tsx                 ← markdown preview pane (Phase 3)
│       ├── Terminal.tsx                ← integrated terminal (~40 commands)
│       ├── Palette.tsx                 ← ⌘P + ⌘K overlay
│       ├── Splash.tsx                  ← first-visit boot sequence
│       ├── Toasts.tsx                  ← toast notification system
│       └── sidebar/
│           ├── ExplorerPanel.tsx       ← file tree
│           ├── SearchPanel.tsx         ← full-text search
│           ├── SourceControlPanel.tsx  ← career-as-commits
│           ├── OutlinePanel.tsx        ← active file headings
│           ├── ExtensionsPanel.tsx     ← skills as extensions
│           └── AssistantPanel.tsx      ← chat UI (Phase 5)
├── content/                            ← portfolio content as files
│   ├── README.md                       ← welcome + nav hint
│   ├── about.md                        ← bio + education
│   ├── now.md                          ← current focus (updated weekly)
│   ├── contact.yaml
│   ├── experience.json
│   ├── .gitconfig                      ← joke file
│   ├── projects/                       ← 8 primary case studies
│   │   ├── quantum-enhanced-simulation-learning.md
│   │   ├── simulating-anything.md
│   │   ├── ai-trading-agent.md
│   │   ├── haze-benchmark.md
│   │   ├── klares-fila.md
│   │   ├── prism-skindb.md
│   │   ├── quant-agent.md
│   │   ├── personal-agents.md
│   │   └── side/                       ← 4-5 breadth-signal projects
│   └── writing/                        ← blog posts
├── lib/                                ← utilities
│   ├── theme.ts                        ← 4 themes, tokens, ThemeContext
│   ├── platform.ts                     ← OS detect + modKey helpers
│   ├── syntax.ts                       ← markdown/json/yaml/ini tokenizer
│   ├── fuzzy.ts                        ← fuzzy scorer for palette
│   ├── content-loader.ts               ← MDX/JSON/YAML loader
│   ├── rag.ts                          ← (Phase 5) client-side retrieval
│   └── assistant-client.ts             ← (Phase 5) SSE consumer
├── types/
│   └── ide.ts                          ← Node, Theme, Tab interfaces
├── scripts/
│   └── sync-content.mjs                ← copy cv/cv.pdf from parent repo
├── public/                             ← static assets (cv.pdf synced at build)
├── _legacy/                            ← archived Vite site (Phase 8 deletes this)
├── design_handoff_ide_portfolio/       ← design reference (Claude Design export)
├── Portfolio.zip                       ← design archive
├── AGENTS.md                           ← Next.js 16 agent-rules warning
├── CLAUDE.md                           ← this file
├── README.md
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── package.json
```

---

## Workflow Orchestration

### 1. Phase Gates (user preference 2026-05-19)
- Brainstorm before each phase, align on decisions, then execute
- No end-to-end execution without per-phase alignment
- Phase boundaries: 0 (setup) → 1 (IDE shell) → 2 (content) → 3 (preview+viz) → 4 (extensions) → 5 (assistant) → 6 (testing) → 7 (deploy+soak) → 8 (final cleanup)

### 2. Plan Mode for Non-Trivial Work
- Enter plan mode for tasks touching 3+ files or architectural decisions
- The approved plan lives at `C:\Users\Saurabh\.claude\plans\valiant-roaming-thompson.md`

### 3. Verification Before Done
- Never mark complete without proving it works
- Run `npm run dev` and verify in browser before claiming a phase done
- Lighthouse audit at Phase 6 — target perf >90, a11y >95

### 4. Self-Improvement Loop
- Track corrections in `tasks/lessons.md` (create if absent)
- Apply lessons in subsequent phases

### 5. Submodule Commit Cadence
- One commit per phase boundary inside portfolio/ + one parent commit pointing at it
- No mid-phase submodule commits
- Never force-push during this work (rollback safety requires history)

---

## Design Hand-off Reference

The IDE design lives in `design_handoff_ide_portfolio/` (extracted from `Portfolio.zip`):
- `README.md` — 34 KB spec with exact tokens, SVG paths, keyboard maps, motion timings
- `design/ide/*.jsx` — high-fidelity prototype to port (NOT production-ready code; uses UMD React + in-browser Babel)
- Components to port: `app`, `chrome`, `editor`, `palette`, `sidebar`, `terminal`, `syntax`, `theme`, `platform`, `assistant`, `preview`, `splash`, `toasts`, `fly`, `mobile`
- Skip: `tweaks.jsx`, `tweaks-panel.jsx` (design-only, explicitly NOT to ship)

When implementing IDE components: read the corresponding `.jsx` reference + the relevant README section for that component, then write production TypeScript that matches the visual spec.

---

## Themes (4 total)

| Theme | Accent | Default for |
|---|---|---|
| **midnight** (default) | `#c8a4ff` lavender | dark-mode preference, all OS |
| **phosphor** | `#7be39a` green | terminal-green nostalgia |
| **paper** | `#7c4ddc` purple | light-mode preference |
| **solar** | `#ffaa3a` amber | high-contrast warm |

CSS variables under `[data-theme="midnight"]` etc. in `lib/theme.ts` + `app/globals.css`. Tailwind extended with `ide-*` tokens referencing the CSS vars.

---

## Honesty Rules (from parent repo's KNOWLEDGE_BASE.md)

These accuracy rules are NON-NEGOTIABLE on every project page in `content/projects/`:
- NEVER inflate metrics or invent experience
- Quantum methods = "quantum-inspired" (ran on classical hardware)
- GraviLens = 60% macro / 76% F1 non-lens — both honest
- "Led development" for team work, "Built" for solo
- Simulating Anything is NOT published — don't claim as publication
- Trading Agent RL self-improvement is aspirational, not implemented
- HAZE domains: code / creative writing / data analysis / general assistance / reasoning (NOT medical/legal/financial)

Cross-check every CV claim against `../cv/base-cv.md` and `../cv/KNOWLEDGE_BASE.md` before publishing.

---

## Useful References

| Resource | Location |
|---|---|
| Approved plan | `C:\Users\Saurabh\.claude\plans\valiant-roaming-thompson.md` |
| Design spec | `design_handoff_ide_portfolio/README.md` |
| Design prototype components | `design_handoff_ide_portfolio/design/ide/` |
| Source CV content | `../cv/base-cv.md`, `../cv/KNOWLEDGE_BASE.md` |
| Legacy site (rollback) | `_legacy/` |
| Existing chart/diagram components to reuse | `_legacy/src/components/ui/{ChartRenderer,DiagramRenderer,MarkdownWithViz}.tsx` |

---

## Current Phase

**Phase 0 — Setup & Cleanup** (executing now, 2026-05-19)

Next: brainstorm Phase 1 (IDE shell scaffold) before any IDE component code.
