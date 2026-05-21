# Co-Founder & AI Lead — SKY Advanced Research LLP

**Period:** Feb 2025 – Present (formalized role per LinkedIn). Pre-incorporation Klares product work began Oct 2024.
**Casual name:** SKY AI. **Legal entity:** SKY Advanced Research LLP. **Location:** Jaipur, Rajasthan, India.
**Partner reference:** Lavish Yadav (Goldman Sachs), credited in career-ops partner notes.

## Product lines (3) + internal tools (10+)

### 1. Klares — vertical AI for institutional finance
- Target market: Hong Kong family-office and asset-management clients (never named specifically).
- Current production: `Klares_new_MVP` — single Express 4 monorepo (TypeScript, ESM) hosting a React 18 SPA + 5 Python daemons running under PM2 (`ddq_autofill_python`, `knowledge-base`, `categorizer`, `document_processor`, `crm_outlook`).
- Drizzle ORM over PostgreSQL — 2046-line schema, 63 pgTable definitions.
- Dual storage: AWS S3 + GCS with active migration tooling. AWS SES + Postmark for email. Microsoft Graph for Outlook integration.
- EC2 production deployment with GitHub Actions CI/CD. Mirrored to client-controlled `Startkitsune/Klares_new_MVP` GitHub org (not under Saurabh's personal GitHub).
- Retrieval faithfulness eval pipeline went **78% → 94%** via cross-encoder re-rank + tenant pre-filter.
- Evolution: `Auto-Formfilling` (Dec 2024) → `DDQAutofilling` (Feb 2025) → `DDQAutoVersion2` (Mar 2025 – Apr 2026) → `Klares_new_MVP` (current).
- Active 2026-Q2 release work is in the `DDQAutoVersion2` workbench: Docling adoption (replacing LlamaParse SaaS), ground-truth + synthetic-data evaluation harness, multi-document production dashboard, `qa_matcher.py` for filling new DDQs from prior corpus.

### 2. KAT GCS — drone Ground Control Station
- Co-architected the Ground Control Station for KAT (Kinetic Aerial Targeting) drone system, framed as team work under NDA-adjacent constraints.
- Public-shareable architecture: FastAPI (async + WebSocket + MAVSDK) backend, React 18 + TypeScript + MUI v5 + Leaflet.js frontend, PostgreSQL + Redis + Celery, Docker Compose with PX4 SITL simulation profile, JWT auth, 4-phase implementation roadmap.
- Internal SKY AI stack `gcs_cplus` (private) is the C++20 + Boost.Asio MAVLink core (single-vehicle focus). Distinct from client repo `NGCS` (multi-vehicle JavaScript Electron GCS, KAT-owned, archived in Saurabh's workspace 2026-05-17).
- Distribution: Windows NSIS x64 installer via electron-builder.

### 3. International Citizen — independent project (not a SKY AI product)
- **Status note:** project lives on the `sky-ai.in` subdomain (`international-citizen.sky-ai.in`) but per its current `IDEA.md` is an **independent project**, not a SKY AI product line. Pre-revenue early-tester phase.
- Universal cross-border wealth platform with vision-LLM statement ingestion across 500+ document types from any institution / language / country.
- Fila multilingual portfolio agent (English / Hindi / Chinese) — see `25-project-international-citizen.md`.

## Internal tools and adjacent assets

`statement-pipelines` (synthetic Indian credit-card analytics), `analyst_agent` (Claude-powered financial chatbot, private prototype), `Knowledge-base` (standalone RAG reference, absorbed into Klares), `Doc-Categorizer`/`New_Doc_categorizer` (categorization prototypes, absorbed into Klares categorizer module), `Extraction_core` (trade-data extraction from investor emails, public Docling demo), `Extraction_and_Filling` (Klares-DDQ FastAPI tool, private), `dividend-tax-exemption-portal` (only .NET piece, client deliverable), `ISIN-Automation-Web-App` (ASP.NET Web Forms RTA workflow for Indian capital markets), `HMS-system-` / ZenHosp (Hospital Management System, ownership status to be confirmed — likely paid client work given AWS EC2 + PM2 + Windows installer deployment maturity), `Trading-Agent` (deployed at `trading-agent.sky-ai.in`).

## Internal operations
SKY Advanced Research LLP runs an internal operations hub on Markdown + Claude Code RemoteTrigger agents (8 agents: standup, ops, alerts, code review, ticket-from-transcript, client updates, knowledge sync, doc generation). Wiki migrated from Notion to GitHub on 2026-05-05 (Karpathy LLM-wiki pattern) when Notion's free-tier block limit hit.

## Honest framing constraints
- Use "Co-Founder" (LinkedIn-canonical) — not "Founder."
- Klares clients are "Hong Kong family-office and asset-management clients" only.
- For team-built components, use "Led development of (with [collaborator])" or "Built (with team)" — never solo-claim shared work.
- KAT GCS public framing is "co-architected" only; gcs_cplus is private and not for detailed external discussion.
