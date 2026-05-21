# Project — HAZE Benchmark (Handling Ambiguous Zero-clarity Expressions)

**Repo:** https://github.com/SaurabhJalendra/HAZE-Handling-Ambiguous-Zero-clarity-Expressions-
**Note:** The trailing dash in the URL **is correct** — verified 2026-05-14 via `gh api`. A URL without the dash returns 404. Older CV variants used a wrong URL (`HAZE-Hardness-of-Ambiguity-Zero-shot-Evaluation`) — that repo does not exist and must be replaced.
**Period:** 2026 · last push 2026-04-28 (70+ commits)
**Status:** Active research. Dataset 47% complete. **Targeting NeurIPS / ICML Datasets & Benchmarks track.**
**License:** Apache 2.0 (code); CC-BY-4.0 (planned for dataset).
**Role:** Built (sole author per README BibTeX entry crediting Saurabh Jalendra).

## What it measures

First benchmark to score the full `bad prompt → clarification → completion` loop with per-stage metrics:
1. **Stage 1 — Detection.** Binary F1 + False-Positive Rate (FPR). Does the model *notice* the prompt is ambiguous?
2. **Stage 2 — Clarification.** Coverage + efficiency + quality. Does it ask the *right* clarifying questions?
3. **Stage 3 — Completion.** Execution-based for code (does the resulting program work?); rubric-based for prose. Does it *deliver* a correct result after clarifying?

## The 5 domains
1. Code generation
2. Creative writing
3. Data analysis
4. General assistance
5. Reasoning

(NOT medical/legal/financial — that earlier framing was a hallucinated error already corrected. The 5 domains above are the canonical set per README.)

## 7-type ambiguity taxonomy
Underspecified · Vague · Contradictory · Implicit assumption · Missing context · Overloaded · Referential.

## 4 evaluation modes
Direct · Staged · Agentic-Scripted · Agentic-Human.

## The differentiator: 500 negative controls
HAZE includes **500 clear-control prompts as negative controls** so that an over-clarifying agent is penalized. The false-positive control is the contribution — every other ambiguity benchmark misses this.

## Engineering substance
- **17 Python modules**, **111 passing tests**, ruff clean
- Pydantic v2, anthropic + openai SDKs, mock + OpenAI + Anthropic model backends
- CLI: `haze evaluate / report / validate`
- Agentic simulated-user evaluation loop with turn-efficiency metrics at `src/haze/agentic/{loop.py, sim_user.py, turn_manager.py}`
- Companion **Claude Code plugin** at `haze-marketplace/haze-research/` ships 5 specialized agents (researcher, dataset-builder, eval-runner, paper-writer, internal-reviewer) and 5 workflow skills
- Project hygiene: Apache 2.0 LICENSE, IDEA.md, CONTRIBUTING.md, pyproject.toml — full open-source discipline

## Dataset progress (47% complete)
- ✅ 210 human-authored seed instances — done
- ✅ 500 clear-control prompts — done
- ⏳ 400 synthetic-validated instances — in progress
- ⏳ 390 real-sourced instances — in progress

## Self-adversarial dataset audit (credibility signal)
Pre-emptively caught and disclosed in the README "Anti-Patterns We Avoided" section:
- **Length confound** — Cohen's d = 1.601 between ambiguous and clear prompts. Fix in progress.
- **BoW shortcut** — a bag-of-words baseline scores 76.2% accuracy without any semantic understanding. Fix in progress.

The act of disclosing these openly is part of the research-quality signal.

## Why this matters
This is the strongest single AI-safety / research artifact on Saurabh's public GitHub. Anthropic, OpenAI, DeepMind, Meta FAIR — all of them ship benchmarks; HAZE is the kind of clarification-behavior measurement that interpretability teams and oversight teams both need.
