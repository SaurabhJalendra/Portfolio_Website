# Project — Prism (skinDB-ai)

**Repo:** https://github.com/SaurabhJalendra/skinDB-ai (PUBLIC, OPEN SOURCE)
**Status:** Working prototype. **NOT DEPLOYED PUBLICLY.** Engineered as a portfolio case study, not a live product.
**Period:** 2025 — last origin push 2025-09-11. Local has 2 unpushed docs-only commits (CLAUDE.md, IDEA/ROADMAP bootstrap).
**Role:** Built (solo).
**Internal-DAU gate:** Never ran for 7 days. CV framing must NOT claim "deployed at..." / "in production" / "users / traction."

## What it is
A multi-source product-intelligence pipeline (beauty / skincare vertical). The work is the *reliability engineering pattern*, not the product itself: chunked-parallel LLM orchestration + JSON-repair recovery layer + idempotent upserts + structured failure logging.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + SWR + Recharts
- **Backend:** FastAPI + Python 3.11, LlamaIndex ≥ 0.9.40
- **LLM:** OpenRouter `openai/gpt-4o-mini-search-preview` (web-search-grounded — so the "Reddit/YouTube sentiment" is LLM-mediated inference, NOT direct scraping)
- **Database:** PostgreSQL 17 with JSONB
- **3-service Docker Compose** (Next.js web + FastAPI api + Postgres) — runs only on localhost (`localhost:3000`, `localhost:8000`)

## The reliability pattern (the actual contribution)

### Chunked-parallel orchestration
Each product is decomposed into a 4-chunk LLM pipeline:
1. `fetch_retail_chunk` — 5 retail platforms (Amazon, Sephora, Ulta, Walmart, Nordstrom)
2. `fetch_brand_editorial_chunk`
3. `fetch_influencer_chunk`
4. `fetch_summary_chunk` (sequential, depends on all three above)

`ParallelLLMProcessor` runs the 3 independent chunks concurrently via `ThreadPoolExecutor(max_workers=3)` with a 120s timeout each — **3–5× speedup** over sequential ingestion.

### Production-reliability layer
- `json_repair.py` — captures malformed LLM outputs and rewrites them to the target schema (every other beautifying-LLM pipeline dies on one bad parse; Prism's doesn't)
- Structured `logs/invalid_*.json` capture for failed LLM outputs
- Idempotent upserts
- Daily-price-history dedup via PostgreSQL JSONB + `UNIQUE (product, retailer, day)` constraint

### Schema
**7 tables** — `products`, `offers`, `ratings`, `reviews`, `specs`, `summaries`, `price_history` — UUID primary keys, JSONB storage, triggers, idempotent upserts.

## Honest scope
- 10 curated beauty products fully ingested across 5 retail platforms plus social signal
- Local-only — no public URL, admin-triggered refresh only
- The chunked-parallel + JSON-repair pattern transferred directly into SKY AI's Klares production stack — the reliability instinct outlived the prototype
- "skinDB-ai" is the GitHub name; the in-product / portfolio name is "Prism"
