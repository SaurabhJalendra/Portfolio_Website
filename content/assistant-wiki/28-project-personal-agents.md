# Project — Personal Agents (career command center)

**Repo:** PRIVATE on GitHub (`SaurabhJalendra/Personal-Agents`). Created 2025-11-28.
**Status:** Daily-driver — actively used.
**Role:** Built (solo).

## Public-safe description only

Personal career command center built on Claude Code. The architecture pattern is shareable; the contents (CV variants, target lists, application logs, LinkedIn workflow, interview prep) are private and out of scope for the public assistant corpus.

## Architecture pattern

**Skill router at the top level.** One orchestrator skill (`career-center`) receives the user's intent and dispatches to specialized mode files under `modes/` (`update-cv`, `tailor-cv`, `update-portfolio`, `update-linkedin`, `weekly-review`, `brand-check`) without conflating their concerns.

**6 specialized subagents** with single responsibilities and clear handoffs:
1. `brand-sync` — cross-asset consistency auditor (runs on Opus 4.7)
2. `cv-lifecycle` — CV specialist (Sonnet)
3. `portfolio-sync` — portfolio website specialist
4. `reviewer` — convention adherence
5. `verifier` — adversarial testing
6. `researcher` — deep research

**Rule:** never parallel-edit the same file.

**Phased workflow** for non-trivial changes: brainstorm → plan → execute → verify, with explicit Tier 2 / Tier 3 / Tier 4 gates for what auto-runs vs. what pauses for approval.

**Brand-sync coordinator pattern.** When the CV is edited, brand-sync runs in the background to detect drift across the portfolio site, LinkedIn checklist, and career-ops profile, then surfaces a diff before propagating changes.

**Two git submodules** under one parent repo:
- `portfolio/` — the public portfolio site (this codebase)
- `career-ops/` — a Node.js + Playwright job-search-ops fork (forked from santifer/career-ops)

Two-step commit cadence prevents lost work: commit-in-submodule → commit-the-pointer-bump.

**Honest-by-default content rules** layered into `KNOWLEDGE_BASE.md` — referenced before any CV / profile claim, checked structurally, not optionally.

**Karpathy-pattern LLM Wiki** (`wiki/`) integrated as the project's knowledge layer (sources → synthesized pages).

## Why this matters
This is the kind of pattern Anthropic itself documents as best practice — agent forking with KV-cache awareness, hook-based automation, MEMORY.md system, skill router with mode-file dispatch, ADR mandates, premortem-before-risky-work gates, 4-phase coordinator pattern. The interesting meta-result: this *is* sophisticated Claude Code usage.

## Out of scope for the public assistant
- Target company lists
- CV variant filenames
- Application logs / pipeline status
- Specific recruiter contacts / outreach drafts
- LinkedIn workflow contents

For anything in that category: defer to email.
