# Project — AI Trading Agent

**Repo:** PRIVATE on GitHub (`SaurabhJalendra/Trading-Agent`). Production at `https://trading-agent.sky-ai.in`.
**Period:** 2025–present (started 2026-03-04 per CAREER_COMMITS).
**Status:** Shipped. Live trading via Angel One SmartAPI integration. Self-improvement RL loop is **aspirational, not implemented**.
**Role:** **"Led development of (with Vishvesh Mathur, SKY AI intern)."** Per `cv/KNOWLEDGE_BASE.md`: NEVER use "Built" for this project.

## Authorship and collaboration — verified by git blame and commit log

Saurabh designed the **architecture**; Vishvesh extended and integrated. Both contributions are real.

### Saurabh's commits (23 architectural)
- `8f0ff1c` Initial commit: complete AI trading agent with multi-agent system and full-stack implementation (110 files, 23,379 LOC) — **the foundational implementation**.
- `840827c` Implement autonomous multi-agent trading with full lifecycle.
- `e4080ef` Upgrade agent orchestration: Bull/Bear debate, reflection, trade memory — **the 7-step expansion was Saurabh's**: "New 7-step chain: Observe → Analyze → Debate → Reason → Decide → Reflect → Risk → Execute."
- `58730ec` Add CompanyContextAgent for fundamentals-aware trading decisions — **the 8th agent was Saurabh's addition**.
- `da8889f` Refactor: introduce DecisionContext, remove `self._` shared state.
- `2fc804e` Refactor: extract `_persist_trade_to_db` to `coordinator_persistence.py`.
- `3565ade` Add `correlation_id` tracing + fix market hours.
- `be42e82` Make all Claude API calls async (stop blocking event loop).
- `72078e2` Add error recovery: pipeline continues when debate/reflect/execute fails.
- `468ef73` Parallelize independent agent execution with `asyncio.gather`.

### Vishvesh Mathur's commits (43 + 8 alias)
- UI: Dashboard, settings page, trading history page, agent pages.
- Angel One live trading integration via SmartAPI (branches `SSH-Code`, `fix/settings-tsx-build` merged via PR #5 + #6).
- Capital test, AMO order execution, position monitor, risk-manager line-tweaks.
- Three "Ubuntu" deploy commits from AWS EC2.

### Honest framing rule
**"Led development of (with Vishvesh Mathur, SKY AI intern)"** — designed the 8-agent multi-agent LLM trading architecture; Vishvesh extended to live trading + UI. NEVER "Built." NEVER omit Vishvesh.

## Architecture

8 specialized agents in `backend/agents/`:
1. `news_analyst` — multi-source RSS + Claude sentiment
2. `technical_analyst` — RSI / MACD / Bollinger + matplotlib chart → Claude Vision for pattern recognition
3. `bullish_analyst`
4. `bearish_analyst`
5. `company_context` — fundamentals-aware (Saurabh's 8th-agent addition)
6. `risk_manager` — Kelly + Fixed Fractional sizing, VaR, drawdown, daily-loss cap, concentration check
7. `execution_agent` — Angel One SmartAPI + Zerodha KiteConnect
8. `position_monitor`

Coordinator: **`coordinator.py` is 78,423 bytes** implementing the live 7-step reasoning chain (Observe → Analyze → Debate → Reason → Decide → Reflect → Risk → Execute). CV preserves the conservative 5-step framing from the original public docstring (Observe → Analyze → Reason → Decide → Risk Assess); both numbers are honest.

**Risk-Manager-as-veto pattern** (architectural commitment): `coordinator.py:274` only proceeds if `risk_assessment.get('approved')` is True; lines 283–295 enforce capital % and stop-width caps that can flip `approved` to False post-hoc. Analogous to scalable-oversight protocols where one model audits another.

## Stack
FastAPI 0.104, React 18 + TypeScript + Vite, PostgreSQL 15, Docker Compose (3-service: postgres + backend + frontend with embedded Nginx — NOT 4 services; CV says 4, which is inflation per audit), Nginx + Let's Encrypt, AWS EC2, Anthropic SDK (Claude text + vision), APScheduler (news 15min, prices 5min, strategies 1min). Pub/sub Message Bus between agents, SQLAlchemy + Alembic migrations, JWT auth, Fernet-encrypted broker credentials.

## Foundational research cited
- `TradingAgents` (Xiao 2024, arXiv:2412.20138)
- `Trading-R1` (Xiao 2025, arXiv:2509.11420)

## Honest scope
- Markets covered: NSE / BSE / MCX / Forex (Indian retail).
- **RL self-improvement is aspirational** — the current system is LLM orchestration only. The long-term goal of closing the loop with reward-on-close PnL feedback is not yet implemented.
- README says "6 agents"; code has 8; CV says 8. Internal doc inconsistency on README — code is the source of truth.
- `.env.production` was committed with placeholder values; real credentials rotated per credential-hygiene memory.
- This is a research-engineering artifact and **not a regulated financial advisory product**.
