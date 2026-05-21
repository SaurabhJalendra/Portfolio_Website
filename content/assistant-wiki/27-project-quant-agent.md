# Project — Quant Agent

**Repo:** https://github.com/SaurabhJalendra/quant-agent (PUBLIC, **renamed** from `Analyst_agentic_coder` on 2026-05-14 — commit `26f310f`).
**Period:** 2025-11 → present. Last push 2026-05-14.
**Status:** Active development. **NOT production-ready.** 6 known issues per `CLAUDE.md` (see below).
**Role:** Built (solo).
**Active branch:** `feature/phase-1-backend-streaming` — 24+ commits ahead of `main` between Apr 29 and May 14, 2026. The `main` branch was stale (last commit Jan 15, 2026: PostgreSQL/JWT/inline-viz/docs) until very recent merges.

## What it is
A web UI wrapper around the **Claude Code CLI** for non-terminal users and remote sessions: authenticated multi-session app with per-session workspace isolation, real-time progress streaming, inline visualization rendering, and PDF export. The architectural choice is to **wrap the CLI via subprocess** rather than re-implement every tool against the Anthropic SDK — the FastAPI service only manages process lifecycle, OAuth refresh, and output streaming.

## Stack
- **Backend:** FastAPI 0.109+, Python 3.x, structlog (JSON logging), `python-jose` (JWT HS256), bcrypt rounds=12, `claude_code_service.py` for OAuth token refresh against the Claude Code CLI
- **Frontend:** React 19.2 + TypeScript 5.9 + Vite 7.2 + Tailwind v4, KaTeX for math, 3-pane "Quant Agent" navy/gold layout
- **Database:** PostgreSQL 16, SQLAlchemy 2.0 + async, Alembic migrations
- **Deployment:** 3-service Docker Compose (postgres + backend + frontend with embedded Nginx reverse proxy) — **NOT 4 services** despite earlier CV phrasing
- **Brand frame:** Navy/gold "Quant Agent" theme, Inter font, 3-pane layout: left (sessions / workspace / knowledge), center (chat / notebook cells / branded artifact cards), right rail (Plan / Agents / Activity / Artifacts / Report / Audit tabs)

## Architecture highlights
- **Per-session workspace pattern** — each chat clones into its own isolated git repo under `backend/workspaces/{uuid}/`. One Claude CLI instance per session, stored in `workspace_manager._active_claude_instances`.
- **Audit logging** — `audit_logger.py` is append-only; every prompt + tool call traceable.
- **Branded artifacts** — Plotly charts, TanStack tables, code blocks, markdown + LaTeX, PDF export.
- **Path-traversal protection**, schema-level `requires_approval: bool` field on `ChatResponse` for plan-approval gating, real-time progress tracking.
- **Compliance bar** — entitlements + MNPI walls indicator + disclosures footer (institutional persona target).
- **Karpathy LLM Wiki** structure present under `wiki/` (concepts, entities, sources, synthesis, log.md, SCHEMA.md, index.md).
- **CI:** `.github/workflows/` has backend lint/typecheck/test workflow (commit `1fd4715`).

## Known issues per `CLAUDE.md` (HONEST DISCLOSURE)
**Do NOT call this production-ready.** The repo's own CLAUDE.md lists:
1. **Path-traversal hole** on `GET /api/files/{path:path}`
2. **Hardcoded CLI path** `C:\Users\Saurabh\.local\bin\claude.exe`
3. **Git credentials in URL logs**
4. **CORS = `*`** (wide open)
5. **Half-implemented plan-approval** — schema-level field exists but the UX gating is not fully wired
6. **`nul` / dead `docker-entrypoint`**, unused deps

A 2026-04-30 deep audit produced 7 Critical findings — all fixed by May 10, 2026 — plus a 5-important-fixes wave. Some of the items above are remaining from that audit; others surfaced afterward.

## Plus
- **No Python test runner configured** despite scaffolding for `test_endpoint.py` / `test_imports.py` per CLAUDE.md.
- **Wraps Claude Code CLI**, NOT the Anthropic SDK directly. This distinction matters: the wrapper pattern gets the entire Claude Code tool ecosystem for free.
- 17 KB README documenting the architecture choice and tradeoffs.

## Honest framing
- "Built (solo)" — appropriate per git log.
- "Active development" — appropriate.
- "Production-ready" — do NOT use this phrase; 6 known issues remain in CLAUDE.md.
- "Used by institutional clients" — do NOT claim; "institutional-client" is the target persona, not the actual user.
- Per `cv/KNOWLEDGE_BASE.md` rule: financial-analysis app — must NOT claim "regulated advice."
