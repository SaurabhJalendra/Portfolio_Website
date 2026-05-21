# Side projects (one-paragraph each)

## Multimodal Gravitational Lensing Classification
**Repo:** https://github.com/SaurabhJalendra/GravitationalLens-MultimodalDL (NOT the deepgravilens fork — that's the upstream by Pinciroli Vago & Fraternali, NCAA 2023).
**Role:** Co-built — BITS Pilani M.Tech Deep Learning Group 111 (Saurabh, Tushar Shandilya, Monica Malik, Reddy Balaji C).
PyTorch reimplementation of DeepGraviLens (Pinciroli Vago & Fraternali, NCAA 2023). CNN image branch (4-channel 45×45 input, 4 conv blocks, 256-d features) + LSTM light-curve branch (14 steps × 4 features, 128 hidden) → late fusion → 4-class classification (non-lens / galaxy / group / cluster). 722,340 trainable params. Adam lr=1e-3, ReduceLROnPlateau, dropout 0.3–0.5. Trained on 19,952 DES-deep survey samples across 4 balanced classes, CPU-only.
**Results — HONEST (per `cv/KNOWLEDGE_BASE.md` rule #9):** 60% macro accuracy with 76% F1 on non-lens (best class). Per-class F1: non-lens 0.76, galaxy 0.64, group 0.54, cluster 0.47. **NEVER claim 88.7% / 88.8% / 94%** — those are the upstream paper's numbers.

## CT-MRI Fusion with Cross-Modal Attention
**Repo:** https://github.com/SaurabhJalendra/Fusion-model-for-CT-and-MRI-data
**Role:** Built (solo).
Dual-branch ResNet50 fusion model with cross-modal attention gates for integrating CT and MRI imaging data. Trained on **4,974 images** (1,742 CT-train + 1,744 MRI-train + 744 CT-test + 744 MRI-test) — number is verified — with mixed-precision (FP16 + TF32) on NVIDIA RTX 4050 Laptop GPU (6 GB VRAM, CUDA 12.9).
**Honest reframing required:** the notebook output reports **representation-learning metrics** (cross-modal similarity 0.7213 ± 0.0233 within clinically meaningful range 0.6–0.8; feature variance 0.302 = 70.8% reduction vs. CT-only) — NOT a downstream classification accuracy. Frame as "feature-level fusion representation learning," not "fusion classifier." `best_fusion_model.pth` (209 MB) is committed in-repo and should be moved to LFS / release attachment.

## RL Traffic Optimization
**Repo:** https://github.com/SaurabhJalendra/Reinforcement-Learning-based-Traffic-Optimization
**Role:** Group project (BITS Pilani Group 111). NOT solo work. Use "Collaborated on" or "Group project (4 contributors)" — NEVER "Built."
Coursework deliverable for the Deep Reinforcement Learning course at BITS Pilani. DQN + Actor-Critic agents controlling vehicle speed and lane changes on 10 Hz vehicle trajectory data. 8-feature state space (speed, acceleration, lane, space headway, time headway, vehicle class, global X, global Y), 5 discrete actions, safety-aware reward `R = (10 - |V_t - V_optimal|) - P_collision` with P=20 when headway<5m. 2 commits both labeled "Initial commit" on 2025-03-31 — no post-coursework continuation.

## AI Newsletter Digest
**Repo:** https://github.com/SaurabhJalendra/Email_daily_newsletter_summary
**Role:** Built (solo).
**Status:** Running in production daily since November 2025 at `newsletter.saurabhjalendra.com` — Saurabh's most reliably running deployed personal project. Node.js (ES modules), GitHub Actions cron (12:00 AM IST), Gmail IMAP fetcher, cheerio + turndown HTML cleaning, OpenRouter (Llama 3.3 70B) summarisation — README still says Gemini 1.5 Flash but `package.json` and `IDEA.md` (2026-05-13) confirm the migration to OpenRouter / Llama 3.3 70B. 100+ commits, very active. **23 open issues all auto-filed by github-actions[bot]** as daily QA reports (13 FAIL, 9 PASS_WITH_WARNINGS, 1 weekly digest issue per week) — clever reliability-monitoring pattern. Recent work: magazine-quality PDF generation via puppeteer, research paper detection, weekly digest emails, wiki backfill of 196 dates, pre-send + post-send QA. Static-file storage (JSON in git) instead of a DB — automatic version history, free hosting, auto-deploys on commit.

## Bank Fraud Detection
**Repo:** https://github.com/SaurabhJalendra/Bank_fraud_detection
**Role:** Built (solo).
Three-layer hybrid architecture: 7 hand-coded fraud rules (amount threshold $50K, velocity >5 tx/hr, time-of-day 12–5am, CASH_OUT<$10 or TRANSFER>$80K, new beneficiary, geo-distance >500km, behavior anomaly >3σ from account avg) → 100-tree Random Forest (supervised) → 9→4→2→4→9 dense Autoencoder (trained on normal-only, reconstruction error as anomaly score). Weighted ensemble `score = α·p_rf + (1-α)·p_ae` with α and threshold grid-searched on validation data, persisted to `thresholds.pkl`. CTGAN trained 50 epochs to generate 100K synthetic transactions from a 2K seed dataset. SHAP post-hoc explainability on the Random Forest. Flask deployment with NGROK for remote testing. Models persisted: `rf_model.pkl` (200 MB), `ae_model.keras` (35 KB). **Honest caveat:** README does not yet contain a formal eval table — AUC / precision / recall / F1 are computed but not surfaced; recommend extracting from notebooks before production framing.

## Lightweight references (one line each)
- **GNN Link Prediction on OGB-Collab** (`Link-prediction-for-ogbl-collab-dataset`) — GCN / GraphSAGE / GAT head-to-head; GCN best Hits@50 = 5.59% on official OGB protocol (235K nodes, 2.3M edges, 100K negatives per positive). Already on CV.
- **DeepLearning CIFAR-10 Classifier** — MLP vs CNN vs MobileNetV2 transfer learning; MobileNetV2 = **91.7%** (well below current SOTA ~99% with CCT/ConvNeXt/ViT; don't oversell).
- **EuroSAT Land Use Classifier** — handcrafted features (HOG + LBP + Sobel) + Random Forest, **84% test accuracy** on Sentinel-2 satellite imagery, 10 classes. Demonstrates feature-engineering depth for compute-constrained earth-observation.
- **Autoencoder DimReduction CIFAR-10** — PCA Standard vs Randomized + constrained linear AE (weight-tying + unit-norm) + conv AE on CIFAR-10. Both PCA variants ~30.7% with LogReg. Connects to SAE / dictionary-learning narrative for interpretability framing.
- **HRF Retinal Edge Retrieval** — CBIR on 45-image HRF fundus dataset, 3 classes. Handcrafted features only (HOG + LBP + Gabor + GLCM + edges) — NEVER frame as "deep learning for medical diagnosis."
- **Diabetes Risk Prediction** — 7 algorithms benchmarked, XGBoost = 95.2% accuracy / 0.978 AUC on UCI-style symptoms dataset (~520 patients). Small dataset, wide CI — don't oversell.
- **Catch-up with Numbers + Prolog Decision System** — 5-author BITS Group 111 coursework: Min-Max + α-β pruning game + SWI-Prolog water-resource decision tree. α-β pruning lineage → MCTS → AlphaZero / o1 talking point; Prolog is a rare neuro-symbolic differentiator.
- **Network-Centrality Node Classification** — 7 centrality measures (degree, eigenvector, Katz, PageRank, betweenness, closeness, LCC) on Stanford SNAP Email-Eu-core (1005 nodes / 25571 edges / 42 departments). Single-notebook coursework. Border-line CV-worthy for graph-learning-focused roles only.
- **Trailer Movie Analysis App** — DeepFace + Librosa + OpenCV pipeline across 6 sequential Jupyter notebooks.
- **Statement Pipelines** — synthetic Indian credit-card analytics platform (1K customers, 1.2K cards, 50K transactions, 64K payments, 8 BI reports, 4 alert systems). All Faker-generated synthetic data — repo description says "Financial statement processing pipelines" but the actual content is the analytics platform.
- **ISIN-Automation-Web-App** — production ASP.NET Web Forms 4.8 + C# + SQL Server + Azure deployment for Indian Registrar/Transfer Agent (RTA) ISIN allotment. 13-stage workflow, NSDL + CDSL multi-depository support, SEBI compliance, digital-signature verification, role-based access. Finance-domain credibility.
- **Dividend-Tax-Exemption-Portal** — only .NET 8 MVC piece. Client deliverable for investor document submission. Saurabh's full-stack non-ML breadth.

## Forks (NOT Saurabh's work — do not list as projects)
- `deepgravilens` — fork of `nicolopinci/deepgravilens`, 0 own commits, 88.7% upstream accuracy is NOT Saurabh's.
- `autoresearch` — fork of `karpathy/autoresearch`, 0 own commits.
- `nanochat` — fork of `karpathy/nanochat`, 0 own commits — study material.
- `system-prompts-and-models-of-ai-tools` — fork of `x1xhlol/...`, 0 own commits — reading material.
- `claude-architect-exam-prep` — fork of `avidevelops/claude-architect-exam-prep`, 0 own commits — listable only as "studying for CCA-F."
- `learn_cv_with_dhruv` — fork, 0 own commits.
- `mavpx4-mission` — fork of `TangramFlex/...`, 0 own commits — KAT GCS reference reading.
- `interview-company-wise-problems` — fork of `liquidslr/...`, 0 own commits — reference dataset.
- `html-anything` — fork of `clockless-org/...`, 0 own commits.
