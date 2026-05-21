# Project — Klares

**Repo (current production):** `Klares_new_MVP` — local-only, mirrored to client-controlled `Startkitsune/Klares_new_MVP` GitHub org. **Not under Saurabh's personal GitHub.**
**Status:** Production. Real clients (Hong Kong family-office and asset-management — never named specifically). 2026-Q2 release work currently in flight in the `DDQAutoVersion2` R&D workbench.
**Role:** Built / led architecture (with SKY AI team — Kalpit Mathur, Vishvesh Mathur, Himanshu are known contributors). Honest framing: "Built (with team)" for the platform; "Led architecture" for components Saurabh personally owns.

## What it is
Vertical AI for institutional finance. Originally framed as a DDQ (Due Diligence Questionnaire) autofill tool; converged into a full document-intelligence platform spanning DDQ autofill, document categorization, RAG knowledge base, document processing, CRM/Outlook integration, compliance reminders, audit logs, investor directory, KYC packs, demo mode.

## Production architecture (sanitized)

**Single Express 4 monorepo (TypeScript, ESM) hosting a React 18 SPA + 5 Python daemons running under PM2.**

### Server (`server/`)
- Express 4 (ESM, TypeScript via `tsx`)
- Passport-local auth + express-session + bcrypt
- Drizzle ORM over PostgreSQL — **2046-line schema, 63 `pgTable` definitions** (users, organizations, investors, documents, packs, embeddings, jobs, notifications, audit, KYC, reminders, …)
- AWS S3 + GCS (dual-storage with active migration tooling)
- AWS SES + Postmark for email
- Microsoft Graph for Outlook (CRM sync, email sync, token rotation)

### Python sub-services (PM2 daemons)
1. `ddq_autofill_python/` — DDQ autofill daemon, embedding cache, job queue, Phoenix observability
2. `knowledge-base/` — KB query daemon, requirements extractor, Phoenix tracing
3. `categorizer/` — SBERT-based document categorizer
4. `document_processor/` — OCR (EasyOCR) + chunking + LlamaIndex extraction + Docling + PyMuPDF + pypdf
5. `crm_outlook/` — Microsoft Graph integration

### Client (`client/src/`)
- React 18 + TypeScript + Vite 5, `wouter` routing, TanStack Query, Tailwind 3 + Radix UI + MUI + shadcn theming
- i18n, audit-log UI, multi-page IR/Compliance/CIO/Legal dashboards
- Pages: dashboard, documents, investor-relations*, legal-compliance*, cio/, audit-logs, employee-access, organization-access, settings, compliance/, document-sections/, plus separate `demo-restricted.tsx` on port 5050

### Production deployment
- AWS EC2 + PM2 (`ecosystem.config.cjs`)
- GitHub Actions CI/CD from `main`
- Demo mode: restricted bundle on port 5050 (`PORT=5050 DEMO_MODE=true`)

## Reliability engineering
- Retrieval faithfulness eval pipeline: **78% → 94%** via cross-encoder re-rank + tenant pre-filter
- Per-tenant rate limiting
- Semantic-error detection (extracted line items not summing to stated total → flagged for human review)
- 3-tier extraction prompt (Extract / Calculate / Inference-forbidden) — anti-hallucination guardrail that became the SKY AI house standard

## Klares prototype lineage (consolidated audit)

| Date | Repo | Role |
|---|---|---|
| 2024-12-21 | `Auto-Formfilling` | First Klares-shape pattern — hedge-fund schema + 16 valid-regulator whitelist + HF-NLI question-to-schema routing + S3 hook |
| 2024-12-21 | `Doc-Categorizer` | First Klares document classification module (S3 bucket literally `klaresdocs`). 50+ finance-category taxonomy |
| 2024-12-25 | `New_Doc_categorizer` | Doc-Categorizer V2 — two-pipeline local-only classification (NLTK/TF-IDF + Sentence-BERT), removed HF Inference API dependency |
| 2025-02-13 | `DDQAutofilling` | **Klares V1 Q&A engine** — Flask + SBERT cross-encoder pair-scoring + SSE streaming + source-file attribution. Validated against AIMA / ILPA / INREV / PRI / Wolfsberg CBDDQ |
| 2025-03-13 | `DDQAutoVersion2` | **Klares V2 = full production architecture** — LlamaParse (PDF/DOCX) → DeepSeek-R1 via OpenRouter → SBERT all-MiniLM-L6-v2 bi-encoder → SQLite BLOB vector storage |
| 2025-12-08 | `Extraction_core` (public) | First IBM Docling parser experiment + OpenRouter Claude 3.5 Sonnet for trade-data extraction from investor emails |
| 2025-12-18 → 2026-02-13 | `Extraction_and_Filling` | Vision-LLM pipeline using Google Gemini 2.0 Flash via OpenRouter for DDQ extraction + interactive HTML form generation |
| **2026-04-16 (last push) + uncommitted local work** | `DDQAutoVersion2` (resurrected as R&D workbench) | **Klares 2026-Q2 convergence** — Docling adoption + ground-truth/synthetic-data evaluation harness + multi-doc dashboard + `qa_matcher.py` for filling new DDQs from prior corpus |

## Honest framing constraints
- Client names: ONLY "Hong Kong family-office and asset-management clients."
- "Led architecture" / "Built" only for components Saurabh personally owned; "Contributed to" or "with team" for shared parts.
- DDQ autofill hit-rate / time-saved metrics need real production data before quoting; placeholder figures are NOT acceptable.
- Klares MVP repo is mirrored to client-controlled `Startkitsune/Klares_new_MVP` — visibility belongs to the client.
