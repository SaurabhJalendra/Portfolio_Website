# Project — Simulating Anything

**Repo:** https://github.com/SaurabhJalendra/Simulating-Anything (PUBLIC, MIT licensed)
**Period:** Feb 2026 – Present (active research; V4 in flight)
**Status:** Paper draft at `paper/main.tex` targeting AI4Science workshop (NeurIPS / ICML / ICLR). **NOT YET PUBLISHED — do not claim as a publication.**
**Role:** Built (solo).
**Hardware:** NVIDIA RTX 5090, 50-epoch RSSM training across all 14 core domains.

## What it is
Domain-agnostic scientific discovery pipeline: natural-language query → simulation construction → RSSM world model training → parameter sweep → symbolic regression → cross-domain isomorphism detection → human-interpretable equations. Pitched as Phase 1 (the *first capability*) of a 4-phase, 12-month AMI-style cognitive architecture per `ADR-0001`.

## Verified numbers (most recently pushed 2026-05-01)

| Metric | Value |
|---|---|
| Simulation domains | **192** (14 core + 178 extended, up through #156 Three-Body Problem visible in README) |
| Mathematical equivalence classes | **125** |
| Tests passing | **7,876** (150+ files) |
| Mean R² across 14 core | **0.970** |
| Domains with R² ≥ 0.999 | **11 / 14** |
| Cross-domain mathematical isomorphisms | **570** |
| Project version | **0.5.0** |
| World models trained | 14 / 14 on RTX 5090 |
| Publication figures | 24 |
| Latest campaign engine progress | 316 campaigns / 1267 discoveries / 118 validated / 43 2D phase diagrams |

(LinkedIn About text currently says 187 domains — stale by 5; portfolio + wiki audit verified 192.)

## Stack (verified)
- **JAX + Equinox + Optax + diffrax** — NOT PyTorch. This matters for DeepMind / Google JAX-ecosystem framing.
- PySR (Julia backend) + ensemble SINDy (now the default after ADR-0001 Change #1)
- NumPy / SciPy, Sphinx (full API documentation), LaTeX (paper draft)
- 7-stage multi-agent pipeline

## V4 capabilities (per latest push 2026-05-01)
- **Composable dynamics modules** — snap-together building blocks (harmonic forces, nonlinear damping, gravity, growth, SIR) — build simulations without writing code
- **Equation-to-simulation parser** — strings like `dx/dt = v, dv/dt = -k*x` → running simulations with RK4 integration
- **DreamerV4 world model** — RSSMv2 with mixed stochastic (categorical + Gaussian), LayerNorm, continue predictor; EnsembleRSSM for epistemic uncertainty
- **External simulator bridges** — OpenFOAM, GROMACS, SUMO connectable via file / socket / subprocess / Python
- **Sim-to-real transfer validation** — 12 metrics (R², RMSE, MAPE, KS test, correlation) with composite confidence scores
- **Persistent knowledge base** — JSON-backed store for equations, analogies, parameters, hypotheses across sessions
- **New-discovery mode** — registry of 6 unsolved problems (three-body, Ising critical exponents, etc.) with automated parameter sweeps
- **Advanced encoders** — GNN, 3D CNN, DeepSets for graph / volumetric / particle data
- **ADR-0001 Change #2** — adaptive parameter-sweep sampling helper (2358bc)
- **ADR-0001 pivot to AMI-style cognitive architecture** per Yann LeCun framing (commit 3300667)

## Cross-domain isomorphism examples (from README)
- Lorenz ≡ Lorenz-Haken (Maxwell-Bloch laser chaos)
- Brusselator ↔ Schnakenberg ↔ Gray-Scott (activator-inhibitor reaction-diffusion family)
- Henon ↔ Ikeda ↔ Tinkerbell ↔ Lozi (2D discrete strange-attractor maps)
- Van der Pol ↔ FitzHugh-Nagumo (slow-fast relaxation oscillators)
- Kuramoto ↔ Winfree ↔ Stuart-Landau (collective synchronization, normal-form r = √μ)
- HH ↔ Morris-Lecar ↔ Izhikevich ↔ FHN ↔ Wilson-Cowan ↔ Hindmarsh-Rose (excitable neural family)
- Logistic ↔ Tent ↔ Cubic ↔ Gauss ↔ Circle (1D maps with period-doubling)

## Honesty constraints (per `cv/KNOWLEDGE_BASE.md`)
- NOT YET PUBLISHED. Always frame as "preprint / paper draft in progress."
- **Rediscoveries, not discoveries.** The system finds known equations (Lotka-Volterra, Lorenz, Brusselator) from simulation data — it does not claim novel science.
- AMI cognitive architecture is the **target**; phases 2–4 are stubbed.
- Solo work — "Built" is appropriate.
