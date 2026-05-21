# Project — International Citizen + Fila

**Live:** https://international-citizen.sky-ai.in (AWS EC2 at `52.77.65.56`)
**Repo:** PRIVATE on GitHub. **Independent project** — domain uses the `sky-ai.in` subdomain but per its current `IDEA.md` is NOT a SKY AI product line.
**Status:** Pre-revenue early-tester phase. Local checkout is 26 commits behind `origin/dev` as of 2026-05-17 (pull blocked by untracked sample PDFs; resolution path documented in IDEA.md).
**Role:** Led development of (3-engineer team: Saurabh + Kalpit Mathur + Himanshu). NOT "Built solo."

## What it is
Universal cross-border wealth platform. Vision-LLM statement ingestion across **500+ document types** from any institution / language / country (including Islamic banking instruments — Mudarabah, Musharakah, Sukuk, Takaful — alongside conventional banking, brokerage, mutual fund, retirement, crypto, loan, insurance, PMS).

## Stack (verified)
- **Frontend:** React 18 + Vite 6 + wouter, TanStack Query/Table, Radix UI, Framer Motion, Recharts, i18next (English / Hindi / Chinese)
- **Backend:** Express 4 + TypeScript (tsx/esbuild), 7,800-line `server/routes.ts`, schema v5.7 (`shared/schema.ts`), Drizzle ORM, PostgreSQL via Neon serverless, JWT + bcrypt + express-session
- **Python microservices:** `extraction-service`, `translation-service` — `docling` + `easyocr` + `pytesseract` + `llama-index` + `langchain` + `litellm` + `ragas` + `dspy` + `deep-translator`
- **Cloud / data:** AWS S3 (`@aws-sdk/client-s3`), Yahoo Finance + Sina Finance + EastMoney + Indian Mutual Fund APIs, OpenAI SDK v5
- **Deploy:** Docker + nginx, AWS EC2

## Engineering substance
- **3-tier extraction prompt** (Extract / Calculate / Inference-forbidden) — anti-hallucination guardrail
- **3-test balance-vs-quantity classifier** — separates balance/value rows from quantity/share-count rows in statements
- **3-layer account typing** — SAV / FD / MF / BROK / RET / LOAN / CC / INS / CRYPTO / PMS / OTHER
- **24+ currencies** with FX conversion
- Validated on 20 real statements across 10+ institutions / 3 countries / 9 account types

## Fila — multilingual portfolio agent
"Fila" is the in-product portfolio agent inside International Citizen. Designed and shipped by Saurabh.
- Multilingual support: English / Hindi / Chinese, auto-detected from user profile; hard-enforced response language with prepended instructions
- **Dynamically composed system prompt** grounded on live user data per request — not a generic chatbot bolted onto a DB
- **Account-holder filtering:** 5 regex patterns detect "show me [Name]'s portfolio" and re-scope ALL downstream context (accounts, holdings, transactions, totals, monthly return) to that holder
- Analysis modules: diversification scoring + rebalancing recommendations, expense analysis (fees, monthly + annual averages, fee-impact %), cash-flow analysis (income, expense, savings rate), return analysis (gross + net %, total / realized / unrealized gains), goal-progress tracker, per-account profitability ranking
- Full unbounded transaction history (no truncation — agent can answer "show last 30 transactions on account X" or "all dividends in 2025-Q3")
- Chat-to-PDF export with auto-generated graphs (agent decides `needsGraph` inline)
- Nominee 30-day-token portfolio access for estate planning

## Branch landscape (as of 2026-05-17 audit)

| Branch | Ahead | Behind | Status |
|---|---|---|---|
| `main` | — | — | canonical |
| `dev` | **60** | 0 | active development — onboarding redesign, extraction pipeline v2, security fixes, Ask Fila unification, JWT auth + session management, review UI v2 |
| `jay` | 0 | 53 | dormant — Jay never pushed work after onboarding |
| `kalpit` | 3 | 27 | MERGED (PR #1, 2025-09-24) — secret cleanup + large doc-addition payload |
| `kalpit_test` | 4 | 0 | working — UI changes, language-switcher, logger, `extraction_pipeline_2.py` (2948 lines), `ic.py` (1631 lines), `create_schema.sql` (444 lines) |

## Honest framing
- "Led development of" — NOT "Built solo." 3-engineer team.
- "Independent project on `sky-ai.in` subdomain" — NOT a SKY AI product line per current IDEA.md.
- Pre-revenue early-tester phase — do NOT claim users / traction.
- Vision-LLM extraction architecture and Fila agent design are Saurabh's primary intellectual contributions.
