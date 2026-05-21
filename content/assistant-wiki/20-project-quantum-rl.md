# Project — Quantum-Enhanced Simulation Learning for RL (M.Tech dissertation)

**Repo:** https://github.com/SaurabhJalendra/Quantum-Enhanced-Simulation-Learning-for-Reinforcement-Learning
**Period:** Nov 2025 – Feb 2026 (active dissertation work) · defended March 2026 · tag `v1.0-final` at commit `5745365` (2026-02-28). 15 commits since the tag added post-defense methodological controls.
**Status:** Completed dissertation. Workshop paper version under consideration. NOT YET PUBLISHED.
**Role:** Built (sole author / dissertation).
**Hardware:** AMD Ryzen 9 9950X3D, NVIDIA RTX 5090, 32 GB RAM. **Classical hardware — no quantum computers.** "Quantum-inspired" refers to algorithmic motivation only.

## The question
Can quantum-inspired algorithms — barrier-crossing optimizers, superposition buffers, entanglement layers, interference ensembles — improve the data efficiency of world model training for reinforcement learning, vs. a well-tuned classical baseline?

## What was built
- DreamerV3-style RSSM world model, ~4.7M parameters per model: `stoch_dim=64`, `deter_dim=512`, `hidden_dim=512`.
- Stack: Python 3.8+, PyTorch 2.10.0+cu128, Gymnasium, DMControl, ALE (Atari Learning Environment).
- 4 quantum-inspired methods + classical baseline implemented and benchmarked across 8 environments × 5 seeds = **200 total experiment runs** (5 methods × 5 seeds × 8 environments).
- Seeds fixed at `[42, 123, 456, 789, 1024]`.
- AdamW lr=3e-4, batch=32 (16 for Atari), seq_len=20, 10K steps.
- Statistical test: Mann-Whitney U non-parametric, Bonferroni correction (family α = 0.05/6 ≈ 0.0083). Min achievable p with n=5 is 0.00794.
- 1342-line dissertation document at `FINAL_DISSERTATION_2023AC05912.md` (63 KB) + 93 KB viva preparation guide.

## Methods (FINAL names, not original plan names)
1. **Quantum Tunneling** (originally "QAOA-Enhanced") — barrier-crossing optimizer
2. **Superposition Buffer** — state-superposition replay buffer
3. **Entanglement Layer** (originally "Gate-Enhanced") — correlated pair structure
4. **Interference Ensemble** (originally "Error Correction") — wave-interference ensembling
5. Classical baseline

## Environments (8)
CartPole-v1, Pendulum-v1 (simple) · Walker-walk, Cheetah-run, Reacher-easy, Reacher-hard (DMControl, state-based, 6–24D continuous control) · ALE/Pong-v5, ALE/Breakout-v5 (Atari, 84×84×1 visual).

## Results — honest, all 4 methods disclosed

| Method | Result | Honesty flag |
|---|---|---|
| **Interference Ensemble** | **36–47% MSE reduction on DMControl robotics** (Walker +43.2%, Cheetah +35.9%, Reacher-easy +45.0%, Reacher-hard +46.7%, all p<0.008) | Conditional: works only on state-based 6–24D continuous control. **Fails catastrophically on Atari** (−132% on Pong, −414% on Breakout). No effect on CartPole / Pendulum. |
| Quantum Tunneling | No significant effect | Null result |
| Superposition Buffer | **Catastrophic failure: −158% to −630% MSE** | Reported on the README front page |
| Entanglement Layer | No significant effect | Had a softmax bug making it a no-op (disclosed) |

## Disclosed caveats (all of them)
1. The 36–47% improvement is in **world model prediction MSE** — not in downstream RL policy reward. No RL agent was trained as part of the dissertation.
2. 3 of 4 quantum methods failed; only Interference Ensemble worked, only on state-based tasks.
3. The IE reward-prediction code had a known omission in `compute_ensemble_loss`. Fixed post-defense.
4. The baseline had LR scheduling + weight decay that the quantum variants lacked — this makes the IE result **more conservative**, not less.
5. **Uniform ensemble ablation on CartPole** added post-defense to control for "is this just ensembling, not quantum-inspired?" This is the methodologically right move.
6. Cohen's d on IE positive results: 2.4–3.2 — large effect size on the subset where it works.

## Why this work matters for frontier-lab interviews
The dissertation is the load-bearing example of Saurabh's empirical-methodology philosophy: 200 experiments, Bonferroni correction, negative results reported alongside positive ones, conditional applicability disclosed honestly (state-based works, visual RL fails), confounds called out before reviewers ask. The honesty is the contribution.
