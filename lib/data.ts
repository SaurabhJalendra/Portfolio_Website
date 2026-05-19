// IDE "filesystem" = portfolio content modeled as a folder tree.
// Each leaf has { name, lang, body } where body is the file content
// (kept as a single string; the syntax highlighter splits + tokenizes).
//
// Content sourced from cv/base-cv.md + cv/KNOWLEDGE_BASE.md +
// wiki/pages/projects/* + legacy blog posts. Honesty rules enforced.

import type { PortfolioFS } from '@/types/ide';

// ---- Career-as-commits ---------------------------------------------------
// Reverse-chronological history modeled as Conventional-Commits entries.
// Hashes are stable hex strings; they're not real Git commits.
export interface CareerCommit {
  date: string;       // ISO YYYY-MM-DD
  hash: string;       // 7-char hex, fake but stable
  type: 'feat' | 'fix' | 'chore' | 'refactor' | 'docs';
  message: string;    // Conventional-Commits-style commit message
  link?: string;      // optional path to open when commit is clicked
}

export const CAREER_COMMITS: CareerCommit[] = [
  {
    date: '2026-05-19',
    hash: 'a3f8c2d',
    type: 'feat',
    message: 'started Portfolio v2 (IDE-style site, Next.js 16, this very codebase)',
    link: 'README.md',
  },
  {
    date: '2026-05-04',
    hash: 'a7b3f2d',
    type: 'feat',
    message: 'earned 2 DeepLearning.AI math certifications — Mathematics for ML + Probability & Statistics for ML',
    link: 'experience.json',
  },
  {
    date: '2026-04-22',
    hash: 'b1e9c4a',
    type: 'feat',
    message: 'earned 3 Anthropic certifications (Claude 101, Claude Code 101, Claude Code in Action) + AI Fluency',
    link: 'experience.json',
  },
  {
    date: '2026-04-08',
    hash: '7e1b9f0',
    type: 'feat',
    message: 'shipped HAZE Benchmark v0 (first AI-safety original artifact)',
    link: 'projects/haze-benchmark.md',
  },
  {
    date: '2026-03-15',
    hash: '4c2d815',
    type: 'feat',
    message: 'defended M.Tech dissertation (Quantum-Enhanced Simulation Learning for RL, 200 experiments)',
    link: 'projects/quantum-enhanced-simulation-learning.md',
  },
  {
    date: '2026-03-04',
    hash: '2a90f7c',
    type: 'feat',
    message: 'started AI Trading Agent (8-agent orchestration with Risk-Manager veto)',
    link: 'projects/ai-trading-agent.md',
  },
  {
    date: '2026-02-12',
    hash: 'b18e3d4',
    type: 'feat',
    message: 'started Simulating Anything (192-domain RSSM world models in JAX/Equinox)',
    link: 'projects/simulating-anything.md',
  },
  {
    date: '2025-11-18',
    hash: 'd5f0a31',
    type: 'feat',
    message: 'shipped Quant Agent (production-grade autonomous Claude agent)',
    link: 'projects/quant-agent.md',
  },
  {
    date: '2025-10-22',
    hash: '9b3e6c7',
    type: 'feat',
    message: 'shipped CT-MRI Fusion paper-replication (cross-modal attention, 4974 images)',
    link: 'projects/side/ct-mri-fusion.md',
  },
  {
    date: '2025-09-09',
    hash: 'f47ad28',
    type: 'feat',
    message: 'shipped Prism (skinDB-ai) — LLM pipeline reliability case study',
    link: 'projects/prism-skindb.md',
  },
  {
    date: '2025-03-26',
    hash: 'c81fb59',
    type: 'feat',
    message: 'shipped Multimodal Gravitational Lensing (paper replication, 4-class classification)',
    link: 'projects/side/multimodal-gravitational-lensing.md',
  },
  {
    date: '2025-02-15',
    hash: '9d2e8b5',
    type: 'feat',
    message: 'founded SKY Advanced Research LLP — Co-Founder & AI Lead',
    link: 'experience.json',
  },
  {
    date: '2024-10-01',
    hash: '6a4d2e1',
    type: 'feat',
    message: 'started building Klares (pre-incorporation — Hong Kong finance vertical AI)',
    link: 'projects/klares-fila.md',
  },
  {
    date: '2024-05-15',
    hash: '3ef8b94',
    type: 'feat',
    message: 'started M.Tech AI/ML at BITS Pilani (Deep RL, CV, NLP, PGM, GNN)',
    link: 'experience.json',
  },
  {
    date: '2024-04-15',
    hash: 'e72c465',
    type: 'feat',
    message: 'graduated MBA Banking & Finance from NMIMS Mumbai',
    link: 'experience.json',
  },
  {
    date: '2024-03-31',
    hash: 'c4e8b71',
    type: 'chore',
    message: 'wrapped up Director role at S K Jalendra Marketing Services Pvt Ltd (6 yrs 3 mos) — pivot to AI',
    link: 'experience.json',
  },
  {
    date: '2022-04-01',
    hash: '0a1bd83',
    type: 'feat',
    message: 'started MBA Banking & Finance at NMIMS Mumbai',
    link: 'experience.json',
  },
  {
    date: '2020-08-12',
    hash: '7f3a2c9',
    type: 'feat',
    message: 'earned Diploma in Import & Export Management from iiiEM (Jaipur)',
    link: 'experience.json',
  },
  {
    date: '2018-01-15',
    hash: '5cbf7d2',
    type: 'feat',
    message: 'joined S K Jalendra Marketing Services Pvt Ltd as Director (family business)',
    link: 'experience.json',
  },
  {
    date: '2017-07-15',
    hash: '1b04e9a',
    type: 'feat',
    message: 'graduated B.Tech Computer Science from Government Engineering College, Bikaner (ISRO Project Internship Nov 2016 – Apr 2017 ran concurrent with final year)',
    link: 'experience.json',
  },
];

// ---- Skills as IDE extensions -------------------------------------------
// Modeled after VS Code's Extensions sidebar — each skill is a publisher-
// attributed "extension" with version (years of experience), downloads
// (project count using the skill), rating (0–5 stars), and description.
export interface SkillExtension {
  id: string;           // unique slug
  name: string;         // display name (e.g., "PyTorch")
  category: 'languages' | 'ml' | 'llm' | 'web' | 'cloud' | 'infra' | 'safety';
  version: string;      // years of experience as "vX.Y" (e.g., "v6.2" = 6.2 years)
  downloads: number;    // project count from lib/data.ts that uses this skill
  rating: number;       // 0–5 stars, derived from legacy proficiency × 5 (rounded to 0.5)
  publisher: string;    // always "Saurabh Jalendra"
  description: string;  // one-line description of skill use
  installed: boolean;   // always true
  featured?: boolean;   // top ~10 skills are featured
  linkedin_endorsements?: number; // optional LinkedIn endorsement count (when present on profile)
}

const PUBLISHER = 'Saurabh Jalendra';

export const SKILL_EXTENSIONS: SkillExtension[] = [
  // ---- Languages ----
  {
    id: 'python',
    name: 'Python',
    category: 'languages',
    version: 'v7.5',
    downloads: 11,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Daily driver — research code, agents, backends, data pipelines',
    installed: true,
    featured: true,
    linkedin_endorsements: 1,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'languages',
    version: 'v3.2',
    downloads: 6,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Strict-mode TS for frontends, FastAPI clients, and this portfolio',
    installed: true,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'languages',
    version: 'v5.0',
    downloads: 4,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Node ES modules, Vercel cron, browser scripting',
    installed: true,
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'languages',
    version: 'v5.5',
    downloads: 7,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Postgres-flavoured SQL — JSONB, window functions, migrations',
    installed: true,
    linkedin_endorsements: 2,
  },

  // ---- Machine Learning ----
  {
    id: 'pytorch',
    name: 'PyTorch',
    category: 'ml',
    version: 'v5.2',
    downloads: 5,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'World models, RSSM, multimodal fusion, autoencoders',
    installed: true,
    featured: true,
  },
  {
    id: 'jax-equinox',
    name: 'JAX/Equinox',
    category: 'ml',
    version: 'v1.2',
    downloads: 1,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Simulating Anything — 192-domain RSSM world models',
    installed: true,
    featured: true,
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    category: 'ml',
    version: 'v4.0',
    downloads: 2,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'DQN + Actor-Critic, Keras autoencoders for anomaly detection',
    installed: true,
  },
  {
    id: 'scikit-learn',
    name: 'scikit-learn',
    category: 'ml',
    version: 'v5.5',
    downloads: 3,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Random Forest, calibration, SMOTE rebalancing, fraud ensembles',
    installed: true,
  },
  {
    id: 'opencv',
    name: 'OpenCV',
    category: 'ml',
    version: 'v3.0',
    downloads: 2,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Image pre-processing for CT-MRI fusion and ISRO photogrammetry',
    installed: true,
  },
  {
    id: 'opengl',
    name: 'OpenGL',
    category: 'ml',
    version: 'v1.0',
    downloads: 1,
    rating: 3.0,
    publisher: PUBLISHER,
    description: 'VR rendering pipeline at ISRO (Oculus Rift / HTC Vive).',
    installed: true,
  },
  {
    id: 'rl',
    name: 'Reinforcement Learning',
    category: 'ml',
    version: 'v2.0',
    downloads: 3,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'DreamerV3-style world models, DQN, Actor-Critic, Gymnasium / DMControl',
    installed: true,
    featured: true,
  },

  // ---- LLM / Agents ----
  {
    id: 'claude-api',
    name: 'Claude API',
    category: 'llm',
    version: 'v1.8',
    downloads: 6,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Multi-agent orchestration, vision pipelines, structured tool use',
    installed: true,
    featured: true,
  },
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'llm',
    version: 'v2.0',
    downloads: 4,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Agent chains, structured outputs, retrieval orchestration',
    installed: true,
    featured: true,
  },
  {
    id: 'llamaindex',
    name: 'LlamaIndex',
    category: 'llm',
    version: 'v2.0',
    downloads: 4,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'RAG over pgvector; Klares DDQ auto-fill; document QA',
    installed: true,
    featured: true,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'llm',
    version: 'v2.5',
    downloads: 3,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Transformers, tokenizers, dataset hub for fine-tuning experiments',
    installed: true,
  },
  {
    id: 'rag',
    name: 'RAG Pipelines',
    category: 'llm',
    version: 'v2.5',
    downloads: 4,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'pgvector + cross-encoder re-rank — 78% → 94% faithfulness at Klares',
    installed: true,
  },
  {
    id: 'multi-agent-systems',
    name: 'Multi-Agent Systems',
    category: 'llm',
    version: 'v1.5',
    downloads: 3,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Trading Agent (8-agent orchestration with Risk-Manager veto) + Personal-Agents (6-subagent career command center). 1 LinkedIn endorsement.',
    installed: true,
    featured: true,
    linkedin_endorsements: 1,
  },
  {
    id: 'anthropic-claude',
    name: 'Anthropic Claude',
    category: 'llm',
    version: 'v1.8',
    downloads: 6,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Claude 101 certified by Anthropic. Production daily use across SKY AI, Personal-Agents, Quant Agent. 1 LinkedIn endorsement.',
    installed: true,
    linkedin_endorsements: 1,
  },

  // ---- Web ----
  {
    id: 'react',
    name: 'React',
    category: 'web',
    version: 'v3.5',
    downloads: 6,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'React 18/19 dashboards, IDE shell, agentic UIs',
    installed: true,
    featured: true,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'web',
    version: 'v2.5',
    downloads: 3,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'App Router for Prism, newsletter dashboard, this portfolio (v16)',
    installed: true,
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'web',
    version: 'v3.0',
    downloads: 5,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Pydantic-typed backends — Trading Agent, Quant Agent, Klares extractor',
    installed: true,
    featured: true,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'web',
    version: 'v4.0',
    downloads: 2,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'ES-modules Express servers, IMAP fetchers, GitHub Actions runners',
    installed: true,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL + pgvector',
    category: 'web',
    version: 'v4.0',
    downloads: 5,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'JSONB schemas, vector search, idempotent upserts, Alembic migrations',
    installed: true,
    featured: true,
  },
  {
    id: 'rest-apis',
    name: 'REST APIs',
    category: 'web',
    version: 'v6.0',
    downloads: 8,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'FastAPI + Express across most projects. 1 LinkedIn endorsement (since ISRO internship).',
    installed: true,
    linkedin_endorsements: 1,
  },
  {
    id: 'full-stack',
    name: 'Full-Stack Development',
    category: 'web',
    version: 'v5.0',
    downloads: 6,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Comfortable across React + FastAPI + Postgres + Docker for production AI products.',
    installed: true,
  },
  {
    id: 'webgl',
    name: 'WebGL',
    category: 'web',
    version: 'v1.0',
    downloads: 1,
    rating: 3.0,
    publisher: PUBLISHER,
    description: 'Photogrammetry 3D model viewer at ISRO.',
    installed: true,
  },

  // ---- Cloud ----
  {
    id: 'docker',
    name: 'Docker',
    category: 'cloud',
    version: 'v4.5',
    downloads: 5,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Compose-orchestrated stacks — web + api + postgres + nginx',
    installed: true,
    featured: true,
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'cloud',
    version: 'v3.0',
    downloads: 3,
    rating: 3.5,
    publisher: PUBLISHER,
    description: 'EC2 + S3 + Let\'s Encrypt for SKY AI production deployments',
    installed: true,
  },
  {
    id: 'gcp',
    name: 'GCP',
    category: 'cloud',
    version: 'v2.0',
    downloads: 1,
    rating: 3.5,
    publisher: PUBLISHER,
    description: 'Gemini API and Cloud Run for newsletter agent experiments',
    installed: true,
  },

  // ---- Infrastructure ----
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    category: 'infra',
    version: 'v3.0',
    downloads: 3,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Cron-driven pipelines — newsletter digest, soak-period CI gates',
    installed: true,
  },
  {
    id: 'mcp-servers',
    name: 'MCP Servers',
    category: 'infra',
    version: 'v1.2',
    downloads: 2,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Custom MCP integrations for Personal Agents and HAZE plugins',
    installed: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'infra',
    version: 'v2.0',
    downloads: 3,
    rating: 4.5,
    publisher: PUBLISHER,
    description: 'Next.js hosting + custom subdomains + Edge functions',
    installed: true,
  },

  // ---- AI Safety ----
  {
    id: 'ai-safety',
    name: 'AI Safety Patterns',
    category: 'safety',
    version: 'v1.0',
    downloads: 2,
    rating: 4.0,
    publisher: PUBLISHER,
    description: 'Risk-Manager-as-veto, HAZE clarification benchmark, negative controls',
    installed: true,
    featured: true,
  },
  {
    id: 'interpretability',
    name: 'Interpretability',
    category: 'safety',
    version: 'v0.6',
    downloads: 1,
    rating: 3.5,
    publisher: PUBLISHER,
    description: 'TransformerLens / nnsight / SAE feature analysis — learning curriculum',
    installed: true,
  },
];

// ---- Git remotes — contact links rendered as `git remote -v` -----------
export interface GitRemote {
  name: string;        // e.g. "github", "linkedin", "website", "email"
  url: string;         // full URL or mailto:
  description: string; // short tagline
  iconType?: 'github' | 'linkedin' | 'globe' | 'mail';
}

export const GIT_REMOTES: GitRemote[] = [
  {
    name: 'github',
    url: 'https://github.com/SaurabhJalendra',
    description: '89 public repos · fetch + push',
    iconType: 'github',
  },
  {
    name: 'linkedin',
    url: 'https://linkedin.com/in/saurabh-jalendra',
    description: "network · let's talk",
    iconType: 'linkedin',
  },
  {
    name: 'website',
    url: 'https://saurabhjalendra.com',
    description: 'origin · you are here',
    iconType: 'globe',
  },
  {
    name: 'email',
    url: 'mailto:saurabhjalendra@gmail.com',
    description: 'always open · 24h median response',
    iconType: 'mail',
  },
];

export const PORTFOLIO_FS: PortfolioFS = {
  root: 'saurabhjalendra',
  tree: [
    { type: 'file', path: 'README.md', lang: 'md', pinned: true },
    { type: 'file', path: 'about.md',  lang: 'md', pinned: true },
    { type: 'dir',  path: 'projects', children: [
      { type: 'file', path: 'projects/quantum-enhanced-simulation-learning.md', lang: 'md' },
      { type: 'file', path: 'projects/simulating-anything.md',                  lang: 'md' },
      { type: 'file', path: 'projects/ai-trading-agent.md',                     lang: 'md' },
      { type: 'file', path: 'projects/haze-benchmark.md',                       lang: 'md' },
      { type: 'file', path: 'projects/klares-fila.md',                          lang: 'md' },
      { type: 'file', path: 'projects/prism-skindb.md',                         lang: 'md' },
      { type: 'file', path: 'projects/quant-agent.md',                          lang: 'md' },
      { type: 'file', path: 'projects/personal-agents.md',                      lang: 'md' },
      { type: 'dir',  path: 'projects/side', children: [
        { type: 'file', path: 'projects/side/multimodal-gravitational-lensing.md', lang: 'md' },
        { type: 'file', path: 'projects/side/ct-mri-fusion.md',                    lang: 'md' },
        { type: 'file', path: 'projects/side/rl-traffic-optimization.md',          lang: 'md' },
        { type: 'file', path: 'projects/side/ai-newsletter-digest.md',             lang: 'md' },
        { type: 'file', path: 'projects/side/bank-fraud-detection.md',             lang: 'md' },
      ]},
    ]},
    { type: 'dir', path: 'writing', children: [
      { type: 'file', path: 'writing/2026-04-06-introducing-haze.md',     lang: 'md' },
      { type: 'file', path: 'writing/2026-04-06-sensory-data-gap.md',     lang: 'md' },
      { type: 'file', path: 'writing/2026-03-25-personal-ai-gemma4.md',   lang: 'md' },
      { type: 'file', path: 'writing/2026-03-21-llm-programming-language.md', lang: 'md' },
    ]},
    { type: 'file', path: 'experience.json', lang: 'json' },
    { type: 'file', path: 'now.md',          lang: 'md' },
    { type: 'file', path: 'contact.yaml',    lang: 'yaml' },
    { type: 'file', path: '.gitconfig',      lang: 'ini' },
  ],

  // Raw file contents. Keys match `path` above.
  files: {
    'README.md': `# saurabhjalendra

> AI Research Engineer · world models, RL, AI safety · India-based, open to anywhere

Hi, I'm **Saurabh Jalendra**. This portfolio is laid out as a working
codebase — every page is a file you can open. Try:

- the file tree on the left
- \`⌘P\` (macOS) or \`Ctrl+P\` (Windows / Linux) to quick-open any file
- \`⌘K\` / \`Ctrl+K\` to run a command
- \`⌘J\` / \`Ctrl+J\` to toggle the terminal — \`ls\`, \`cat about.md\`, \`projects\` all work

## status
- **available** for Research Engineer roles from Q3 2026
- based in Jaipur, India · open to UK / US / Canada / EU / Singapore once visa pathway is active
- inbox is usually clean — saurabhjalendra@gmail.com

## here you'll find
- /projects — 8 primary case studies + 5 side projects
- /writing — 4 essays on world models, AI safety, and LLM programming
- /now — what I'm working on this week
- /contact — every way to reach me`,

    'about.md': `# About

I'm Saurabh Jalendra — an AI research engineer working at the intersection of
**world models, reinforcement learning, and empirical AI safety**. My M.Tech
dissertation (BITS Pilani, defended March 2026) compared quantum-inspired vs
classical training for DreamerV3-style world models across 200 experiments with
Bonferroni-corrected significance testing. Day-to-day, I'm Co-Founder & AI Lead
at SKY Advanced Research LLP, where I ship three SKY AI products — Klares,
International Citizen, and KAT GCS (drone Ground Control Station for autonomous
flight, C++) — alongside vision-LLM pipelines, agentic systems, and RAG with
eval harnesses.

My research arc is using AI to understand and simulate the world: I started in
computer vision (B.Tech + ISRO VR/photogrammetry internship), moved through
applied ML at SKY AI, and now spend most of my time on RSSM world models, JAX
infrastructure, and the safety patterns that show up when you put 8 LLM agents
in a room and ask them to make a financial decision. From 2018 to 2024 I served
as Director at my family's business, S K Jalendra Marketing Services Pvt Ltd.
The MBA at NMIMS (2022–2024) made the family business operations more
systematic; the AI pivot crystallized in late 2024 with Klares.

## what I'm good at

- **Empirical research methodology** — 200-experiment dissertation, Mann-Whitney U with Bonferroni correction, negative results reported alongside positive ones, confounds disclosed before reviewers ask
- **Production AI shipping** — Klares document intelligence (retrieval faithfulness 78% → 94% via re-rank + tenant pre-filter), International Citizen (vision-LLM ingestion across ~500+ document types, 24+ currencies, 3 languages), Trading Agent (8-agent orchestration with Risk-Manager veto)
- **Agent orchestration** — Personal-Agents career command center coordinates a CV pipeline, portfolio site, LinkedIn workflow, and an LLM-Wiki knowledge base across 6 specialized subagents and 8+ skills (built on Claude Code)
- **World models in JAX/Equinox** — Simulating Anything implements 192 simulation domains, RSSM world models, and symbolic regression (PySR/SINDy) recovering known physical laws with R² ≥ 0.999 on 11/14 core domains
- **AI safety pattern thinking** — Risk-Manager-as-veto in the Trading Agent (analogous to scalable-oversight protocols), the HAZE Benchmark for measuring LLM clarification behavior with negative controls
- **Operations + business judgment** — 6 years running a family marketing-services business (Jan 2018 – Mar 2024) before the AI pivot. I understand how revenue actually happens, not just how to write code.

## what I'm working on getting better at

- **Open-source contribution cadence** — more PRs to JAX / Equinox / LlamaIndex / PySR rather than only personal repos
- **Paper-writing throughput** — Simulating Anything and HAZE are both unpublished; getting workshop submissions out is the immediate goal
- **Sharing work-in-progress publicly** — defaulting to "post the half-formed thought" instead of waiting for the polished version
- **Mechanistic interpretability depth** — TransformerLens / nnsight / SAE feature analysis are next on the curriculum
- **RLHF infrastructure** — moving from "I understand the algorithm" to "I have written the distributed training loop"

## off-screen

<!-- TODO: Saurabh to fill — hobbies, interests outside work -->`,

    'projects/quantum-enhanced-simulation-learning.md': `# Quantum-Enhanced Simulation Learning for RL — M.Tech dissertation, defended

**Role:** Built (sole author / dissertation)
**Stack:** Python 3.8+, PyTorch 2.10+cu128, DreamerV3-style RSSM, Gymnasium, DMControl, ALE
**Year:** 2025–2026  ·  **Status:** defended (March 2026); workshop paper version under consideration

## the problem

Can quantum-inspired algorithms — barrier-crossing optimizers, superposition
buffers, entanglement layers, interference ensembles — improve the data
efficiency of world model training for reinforcement learning? All methods run
on classical GPU hardware; "quantum-inspired" refers to algorithmic motivation,
not quantum computing. The honest version of the question: do these mechanisms
give you anything that a well-tuned classical baseline doesn't?

## what I did

- Implemented 4 quantum-inspired methods (tunneling optimizer, superposition buffer, entanglement layer, interference ensemble) on a DreamerV3-style RSSM world model (~4.7M parameters: \`stoch_dim=64\`, \`deter_dim=512\`, \`hidden_dim=512\`)
- Benchmarked all 4 methods + a classical baseline across 8 environments — CartPole, Pendulum, DMControl Walker-walk, Cheetah-run, Reacher-easy/hard, Atari Pong, Breakout — for **200 total experiment runs** (5 methods × 5 seeds × 8 environments)
- Applied Mann-Whitney U with Bonferroni correction (α = 0.05/4 = 0.0125, minimum achievable p with n=5 is 0.00794) — reported p<0.008 only after multiple-comparison correction
- Wrote the dissertation (\`FINAL_DISSERTATION_2023AC05912.md\`, ~1342 lines) with explicit "Known Limitations" + "Approach Evolution" sections documenting why methods changed during implementation

## outcome

- **Interference Ensemble achieved 36–47% reduction in world model prediction MSE** on DMControl robotics (Walker +43.2%, Cheetah +35.9%, Reacher-easy +45.0%, Reacher-hard +46.7%, all p<0.008)
- 3 of 4 quantum-inspired methods failed (Tunneling: no significant effect; Superposition Buffer: catastrophic failure -158% to -630%; Entanglement Layer: no significant effect) — reported honestly
- Interference Ensemble fails on Atari visual RL (-132% to -414%) — also reported honestly; the conditional nature of the finding ("works on state-based robotics, fails on visual RL") is the point
- Improvement is in **world model prediction MSE**, not downstream RL policy reward — no RL agent was trained as part of this work; that's stated explicitly

[→ GitHub: SaurabhJalendra/Quantum-Enhanced-Simulation-Learning-for-Reinforcement-Learning](https://github.com/SaurabhJalendra/Quantum-Enhanced-Simulation-Learning-for-Reinforcement-Learning)`,

    'projects/simulating-anything.md': `# Simulating Anything — domain-agnostic scientific discovery via world models

**Role:** Built
**Stack:** Python 3.12, JAX/Equinox, PyTorch (RSSM), PySR (Julia backend), pySINDy, NumPy/SciPy, Sphinx, LaTeX
**Year:** 2026  ·  **Status:** active research; paper draft in progress, **not yet published**

## the problem

Most scientific-discovery ML systems are one-domain demos: a paper rediscovers
Newton's laws from cart-pole data and stops there. The harder, more interesting
question is whether one pipeline can rediscover known physical laws across
hundreds of simulation domains — and, while doing so, surface the mathematical
isomorphisms that connect them. Toward Yann LeCun's AMI-style cognitive
architecture, the discovery engine becomes the *first capability* of a larger
system.

## what I did

- Built a 7-stage multi-agent pipeline: natural language query → simulation construction → RSSM world model training (JAX/Equinox) → parameter sweep → symbolic regression (PySR + ensemble SINDy) → cross-domain isomorphism detection → human-interpretable equation output
- Implemented **192 simulation domains** across physics, biology, and chemistry — Lorenz, Navier-Stokes 2D, Schrödinger, Lotka-Volterra, SIR, Gray-Scott, Kuramoto, Brusselator, FitzHugh-Nagumo, Kepler, Schwarzschild geodesic, plus 180+ more — spanning **125 mathematical equivalence classes**
- Benchmarked on NVIDIA RTX 5090 with 50-epoch RSSM training across all 14 core domains; all converge to ~32 loss
- Documented architecture in ADR-0001 (incorporating 5 newly-ingested 2024-2026 papers; ensemble SINDy as default); 7,876 unit tests; full Sphinx API documentation

## outcome

- **Mean R² = 0.970** across 14 core rediscoveries; **11 of 14 achieve R² ≥ 0.999** (Lorenz attractor coefficients, Navier-Stokes decay rates, heat equation spectral decay — all recovered cleanly)
- **570 cross-domain mathematical isomorphisms** detected across 192 domains — e.g., harmonic-oscillator dynamics recurring across pendulum, RLC circuit, and molecular vibration
- 316 campaigns, 1,267 discoveries, 118 validated, 43 2D phase diagrams (continuous-loop campaign engine)

[→ GitHub: SaurabhJalendra/Simulating-Anything](https://github.com/SaurabhJalendra/Simulating-Anything)`,

    'projects/ai-trading-agent.md': `# AI Trading Agent — 8-agent LLM orchestration with Risk-Manager veto

**Role:** Led development of (collaboration with one other engineer; CV uses "Led development of" per honesty rules)
**Stack:** FastAPI 0.104, React 18 + TypeScript + Vite, PostgreSQL 15, Docker Compose, Nginx + Let's Encrypt, AWS EC2, Anthropic SDK (Claude text + vision), APScheduler
**Year:** 2025–present  ·  **Status:** shipped, deployed at trading-agent.sky-ai.in (private repo)

## the problem

Most LLM trading systems are a single model with a prompt that says "be a good
trader." That collapses analysis, debate, decision, and risk into one
indistinguishable blob — and there's no oversight pattern. I wanted to build
the structurally honest version: specialized agents with explicit handoff
contracts, a debate stage between bull and bear, a reflection loop, and a Risk
Manager that holds **binding veto authority** over the decision agent's
outputs — analogous to the scalable-oversight protocols where one model audits
another.

## what I did

- Designed an 8-agent system in \`backend/agents/\` — \`news_analyst\` (multi-source RSS + Claude sentiment), \`technical_analyst\` (RSI/MACD/Bollinger + matplotlib chart → Claude Vision for pattern recognition), \`bullish_analyst\`, \`bearish_analyst\`, \`company_context\`, \`risk_manager\` (Kelly + Fixed Fractional sizing, VaR, drawdown, daily-loss cap, concentration check), \`execution_agent\` (Angel One SmartAPI + Zerodha KiteConnect), \`position_monitor\`
- Wrote the 78,423-byte \`coordinator.py\` implementing a 5-step reasoning chain (Observe → Analyze → Reason → Decide → Risk Assess) — the live code has since expanded to 7 stages (added Bull/Bear Debate + Reflection); CV keeps the conservative 5-step framing matching the original public docstring
- Implemented the Risk-Manager-as-veto pattern: \`coordinator.py:274\` only proceeds if \`risk_assessment.get('approved')\` is True; lines 283–295 enforce capital % and stop-width caps that can flip \`approved\` to False post-hoc
- Stack: pub/sub Message Bus between agents, SQLAlchemy + Alembic migrations, JWT auth, Fernet-encrypted broker credentials, APScheduler background jobs (news 15min, prices 5min, strategies 1min), Docker Compose orchestration, AWS EC2 with Let's Encrypt SSL
- Cited the foundational research: \`TradingAgents\` (Xiao 2024, arXiv:2412.20138) and \`Trading-R1\` (Xiao 2025, arXiv:2509.11420)

## outcome

- Production deployment at trading-agent.sky-ai.in covering NSE / BSE / MCX / Forex
- Real Claude integration across news sentiment, technical pattern recognition (Vision API), and decision synthesis
- **RL self-improvement is aspirational, not yet implemented** — current system is LLM orchestration only; the long-term goal is closing the loop with reward-on-close PnL feedback

Private repository — code available on request.`,

    'projects/haze-benchmark.md': `# HAZE Benchmark — measuring LLM clarification behavior

**Role:** Built
**Stack:** Python, Pydantic v2, anthropic + openai SDKs, pytest, Apache 2.0 (code) / CC-BY-4.0 (planned for dataset)
**Year:** 2026  ·  **Status:** active research; targeting NeurIPS / ICML Datasets & Benchmarks track

## the problem

Most LLM benchmarks evaluate well-formed inputs — HumanEval gives you a precise
function signature, MMLU gives you a clear MCQ. Real users don't write like
that. They say "sort this list," "make it better," "fix the bug." A competent
assistant should (1) **detect** ambiguity, (2) **ask** the right clarifying
question, (3) **complete** the task once clarified — and crucially, it should
*not* over-clarify on prompts that are already clear. No existing benchmark
tests all three jointly across multiple domains in agentic mode.

## what I did

- Built the first benchmark to score the full \`bad prompt → clarification → completion\` loop with per-stage metrics: Stage 1 detection F1 + FPR, Stage 2 clarification quality, Stage 3 task completion
- Curated a **210-instance human-authored seed dataset** spanning 5 domains — code, creative writing, data analysis, general assistance, reasoning — across a 7-type ambiguity taxonomy (underspecified, vague, contradictory, implicit-assumption, missing-context, overloaded, referential)
- Added **500 clear-control prompts as negative controls** — penalizes over-clarifying agents; this false-positive control is the differentiating contribution
- Implemented agentic simulated-user evaluation loop with turn-efficiency metrics (\`src/haze/agentic/{loop.py, sim_user.py, turn_manager.py}\`)
- 17 modules, 111 tests passing, full project hygiene (Apache 2.0 LICENSE, IDEA.md, CONTRIBUTING.md, pyproject.toml); pre-emptively detected and disclosed dataset confounds (length: Cohen's d=1.6; BoW shortcut: 76.2% accuracy without semantics) — fix in progress

## outcome

- Dataset: 210 seeds + 500 controls complete; 400 synthetic-validated and 390 real-sourced instances in progress
- Companion Claude Code plugin (\`haze-marketplace/haze-research/\`) ships 5 specialized agents (researcher, dataset-builder, eval-runner, paper-writer, internal-reviewer) and 5 workflow skills
- Self-audit confounds documented openly in the README "Anti-Patterns We Avoided" section — the act of disclosing them is part of the research-quality signal

[→ GitHub: SaurabhJalendra/HAZE-Handling-Ambiguous-Zero-clarity-Expressions-](https://github.com/SaurabhJalendra/HAZE-Handling-Ambiguous-Zero-clarity-Expressions-)`,

    'projects/klares-fila.md': `# Klares + Fila — document intelligence + multilingual portfolio agent

**Role:** Built Klares (sole engineer); Led development of International Citizen (team project)
**Stack:** Express 4 + TypeScript, React 18 + Vite + TanStack + Radix + Recharts, Drizzle ORM, Neon PostgreSQL, pgvector, AWS S3, FastAPI Python extraction microservice, Nodemailer, i18next, jspdf, Docker Compose, AWS EC2
**Year:** 2024–present  ·  **Status:** shipped — Klares to Hong Kong family-office and asset-management clients; International Citizen deployed at international-citizen.sky-ai.in

## the problem

Hong Kong family offices spend analyst-weeks filling Due Diligence
Questionnaires (DDQs) by hand from PDF source documents — repetitive,
error-prone, and the same question gets re-answered for every prospect. And the
cross-border investor problem is worse: any statement, any institution, any
language, any country (including Islamic banking instruments — Mudarabah,
Musharakah, Sukuk, Takaful — alongside conventional banking, brokerage, mutual
fund, retirement, crypto, loan, insurance). Vision-LLM extraction plus a
portfolio agent that grounds advice on live user data is the unblock.

## what I did

**Klares (document intelligence platform)** — built end-to-end:

- Vision-LLM ingestion of PDF / DOCX / XLSX / scanned documents → high-DPI page rasterization → multimodal vision-LLM payload
- DDQ question extraction with hierarchy preservation
- Sentence-BERT categorization + cross-encoder re-ranking over a **pgvector knowledge base**
- LlamaIndex RAG for unfilled-DDQ auto-fill from scoped documents
- Multi-tenant data isolation per client + Outlook integration + email-driven compliance reminders + a CRM for analyst workflows
- Structured eval harness for retrieval faithfulness (**78% → 94%** via re-rank + tenant pre-filter), per-tenant rate limiting, semantic-error detection (extracted line items not summing to stated total → flagged for human review)

**Fila (multilingual portfolio agent inside International Citizen)** — designed and shipped:

- Multilingual support: English / Hindi / Chinese, auto-detected from user profile; hard-enforced response language with prepended instructions
- Dynamically composed system prompt grounded on live user data per request — **not** a generic chatbot bolted onto a DB
- Account-holder filtering: 5 regex patterns detect "show me [Name]'s portfolio" and re-scope ALL downstream context (accounts, holdings, transactions, totals, monthly return) to that holder
- Analysis modules: diversification scoring + rebalancing recommendations, expense analysis (fees, monthly + annual averages, fee-impact %), cash-flow analysis (income, expense, savings rate), return analysis (gross + net %, total / realized / unrealized gains), goal-progress tracker, per-account profitability ranking
- Full unbounded transaction history (no truncation — agent can answer "show last 30 transactions on account X" or "all dividends in 2025-Q3")
- Chat-to-PDF export with auto-generated graphs (agent decides \`needsGraph\` inline); nominee 30-day-token portfolio access for estate planning

## outcome

- Klares: production deployments to Hong Kong family-office and asset-management clients; retrieval faithfulness eval pipeline 78% → 94%
- International Citizen: ~500+ document types covered, 24+ currencies with FX, 3 languages with hard-enforced multilingual response, schema v5.7 validated against 20 real statements across 10+ institutions / 3 countries / 9 account types
- 3-tier extraction prompt (Extract / Calculate / Inference-forbidden) — anti-hallucination guardrail that became the SKY AI house standard for structured extraction`,

    'projects/prism-skindb.md': `# Prism (skinDB-ai) — chunked-parallel LLM orchestration with JSON repair

**Role:** Built
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion + SWR + Recharts, FastAPI + Python 3.11, LlamaIndex ≥ 0.9.40, OpenRouter (\`openai/gpt-4o-mini-search-preview\`), PostgreSQL 17 with JSONB, Docker Compose
**Year:** 2025  ·  **Status:** working prototype — engineered as a reliability-pattern case study, **not deployed publicly**

## the problem

Multi-source product intelligence pipelines die two specific deaths in
production: (1) LLM output truncation at the long tail and (2) malformed JSON
on schema-conformant outputs. A single LLM call asking for "everything about
this product across all retailers" hits the output cap; a sequential 5-step
pipeline is too slow for daily refresh; and one bad JSON parse takes down the
batch. The interesting engineering is in how you decompose the call graph and
recover from bad outputs.

## what I did

- Decomposed each product into a 4-chunk LLM pipeline — \`fetch_retail_chunk\` (5 retail platforms), \`fetch_brand_editorial_chunk\`, \`fetch_influencer_chunk\`, then a sequential \`fetch_summary_chunk\` that depends on all three
- Implemented \`ParallelLLMProcessor\` with \`ThreadPoolExecutor(max_workers=3)\` running the 3 independent chunks concurrently with 120s timeout each — **3–5× speedup** over sequential ingestion
- Built a production-reliability layer: \`json_repair.py\` captures and rewrites malformed LLM outputs to the target schema; structured \`logs/invalid_*.json\` logging; idempotent upserts; daily-price-history dedup via PostgreSQL JSONB + UNIQUE constraint on \`(product, retailer, day)\`
- Schema: 7 tables (\`products\`, \`offers\`, \`ratings\`, \`reviews\`, \`specs\`, \`summaries\`, \`price_history\`) with UUID primary keys, JSONB storage, triggers, and idempotent upserts
- Full 3-service Docker Compose (web + api + postgres), cross-platform startup scripts, structured JSON logging with request/response tracking

## outcome

- 10 curated beauty products fully ingested across 5 retail platforms (Amazon, Sephora, Ulta, Walmart, Nordstrom) plus social signal
- The chunked-parallel + JSON-repair pattern transferred directly into SKY AI's Klares production stack (the reliability instinct outlived the prototype)
- Honest scope: this is a case study, not a live product — no public URL, admin-triggered refresh only, the "scraping" is LLM web-search-grounded inference rather than direct API scraping

[→ GitHub: SaurabhJalendra/skinDB-ai](https://github.com/SaurabhJalendra/skinDB-ai)`,

    'projects/quant-agent.md': `# Quant Agent — Claude Code CLI wrapped in a full-stack web app

**Role:** Built
**Stack:** FastAPI 0.109+, React 19.2 + TypeScript 5.9 + Vite 7.2 + Tailwind v4, PostgreSQL 16, JWT (HS256) + bcrypt (rounds=12), structlog (JSON logging), Docker Compose
**Year:** 2025–2026  ·  **Status:** active development (6 months of commits, last push 2026-05-14)

## the problem

The Claude Code CLI has a rich tool ecosystem — file ops, code search, git
operations, command execution — but it lives in a terminal. I wanted a web UI
that gave non-terminal users (and remote sessions) the same capability:
authenticated, per-session workspace isolation, real-time progress streaming,
inline visualization rendering. And I wanted to do it by **wrapping the CLI
itself** via subprocess management — not re-implementing every tool against the
Anthropic SDK.

## what I did

- Built a 3-service Docker Compose stack — PostgreSQL 16 + FastAPI backend + React 19 frontend (Nginx reverse proxy runs **inside** the React container, not as a 4th service)
- Implemented JWT auth (python-jose HS256), bcrypt password hashing at rounds=12, structured JSON logging via structlog, healthchecks on all three services, OAuth token refresh logic for the Claude Code CLI in \`claude_code_service.py\`
- Per-session workspace isolation via named volumes + per-session subdirectories — sessions can't see each other's files
- Path-traversal protection, schema-level \`requires_approval: bool\` field on \`ChatResponse\` for plan-approval gating (currently schema-level, not fully wired UX), real-time progress tracking
- The architectural choice — wrap the Claude Code CLI via subprocess instead of using the Anthropic SDK directly — gets the entire Claude Code tool ecosystem for free; the FastAPI service only has to manage process lifecycle, OAuth refresh, and stream output

## outcome

- Working full-stack app: authenticated multi-session UI with persistent PostgreSQL sessions, real Claude integration via the CLI subprocess pattern
- Honest scope: plan-approval is currently a schema-level field, not a fully wired gating mechanism in the UX; counts as scaffolding, not a finished safety control
- 17 KB README documenting the architecture choice and tradeoffs

[→ GitHub: SaurabhJalendra/quant-agent](https://github.com/SaurabhJalendra/quant-agent)`,

    'projects/personal-agents.md': `# Personal Agents — multi-agent orchestration on Claude Code

**Role:** Built
**Stack:** Claude Code (skills, subagents, hooks, MCP servers), Markdown + YAML for skill / agent / mode files, Python + LaTeX in the CV pipeline, Git submodules
**Year:** 2025–present  ·  **Status:** daily-driver — actively used across the team

## the problem

Personal productivity infrastructure built ad-hoc — a CV repo here, a
half-written blog there, a Notion page tracking what you read last month —
fragments and rots. The interesting design question is whether a single
Claude Code workspace, with the right separation of concerns, can coordinate
across all of these without one agent silently overwriting another. The
constraints are real: editing the same file in parallel breaks things, and the
honesty rules in one place (CV claims) must propagate to every downstream
asset.

## what I did

- Designed a **skill router** at the top level — one orchestrator skill receives the user intent and dispatches to specialized mode files (\`update-cv\`, \`tailor-cv\`, \`update-portfolio\`, \`update-linkedin\`, \`weekly-review\`, \`brand-check\`) without conflating their concerns
- Built **6 specialized subagents** with single responsibilities and clear handoffs: \`brand-sync\` (cross-asset consistency auditor, runs on Opus), \`cv-lifecycle\` (CV specialist on Sonnet), \`portfolio-sync\` (portfolio website specialist), \`reviewer\` (convention adherence), \`verifier\` (adversarial testing), \`researcher\` (deep research) — never parallel-edits the same file
- Implemented a **phased workflow** for non-trivial changes: brainstorm → plan → execute → verify, with explicit Tier 2 / Tier 3 / Tier 4 gates for what auto-runs vs what pauses for approval
- Built the **brand-sync coordinator pattern** — when the CV is edited, brand-sync runs in the background to detect drift across the portfolio site, LinkedIn checklist, and career-ops profile, then surfaces a diff before propagating changes
- Coordinated 2 git submodules (portfolio site and a job-search-ops fork) under one parent repo with a two-step commit cadence (commit-in-submodule → commit-the-pointer-bump) that prevents lost work
- Layered **honest-by-default content rules** into a \`KNOWLEDGE_BASE.md\` referenced before any CV / profile claim — checked structurally, not optionally

## outcome

- 6 specialized subagents, 8+ skills, 2 coordinated git submodules, daily-driver usage across all CV / portfolio / interview-prep workflows
- Karpathy-pattern LLM Wiki (sources → synthesized pages) integrated as the project's knowledge layer
- The interesting meta-result: this *is* sophisticated Claude Code usage — agent forking with KV-cache awareness, hook-based automation, MEMORY.md system, skill router with mode-file dispatch — the kind of pattern Anthropic itself documents as best practice`,

    'projects/side/multimodal-gravitational-lensing.md': `# Multimodal Gravitational Lensing Classification

**Role:** Co-built (group project, 4 contributors — Saurabh Jalendra, Tushar Shandilya, Monica Malik, Reddy Balaji C)
**Stack:** PyTorch, CNN + LSTM late fusion
**Year:** 2025  ·  **Status:** complete

## the problem

Reimplement the DeepGraviLens architecture (Pinciroli Vago & Fraternali, *Neural Computing and Applications*, 2023) to classify gravitational lensing events from multimodal data — combining 45×45 4-channel image stamps with 14-step light-curve time-series.

## what I did

- Built a multimodal architecture (722,340 trainable parameters): 4-block CNN (Conv2d 4→32→64→128→256, each with BatchNorm + ReLU + MaxPool) for image branch + 2-layer LSTM with 128 hidden units for the light-curve branch
- Late-fusion classification head: concat(256 + 128) → FC(384→256→128→4) with dropout 0.3–0.5
- Trained on **19,952 samples** from the DES-deep survey (Zenodo) across 4 balanced classes (non-lens, galaxy, group, cluster); CPU-only training with Adam lr=0.001 and ReduceLROnPlateau

## outcome

- **0.76 F1 on non-lens detection** (the best class) and **0.60 accuracy on the harder fine-grained lens-type classification** — both reported honestly
- Per-class F1: non-lens 0.76, galaxy 0.64, group 0.54, cluster 0.47; macro-F1 0.60
- Demonstrates the ability to read and faithfully reimplement a published multimodal architecture

[→ GitHub: SaurabhJalendra/GravitationalLens-MultimodalDL](https://github.com/SaurabhJalendra/GravitationalLens-MultimodalDL)`,

    'projects/side/ct-mri-fusion.md': `# CT-MRI Fusion with Cross-Modal Attention

**Role:** Built
**Stack:** PyTorch, torchvision (ResNet50), albumentations, mixed precision (FP16 + TF32)
**Year:** 2025  ·  **Status:** complete

## the problem

Single-modality medical image classifiers leave information on the table — CT shows bone and dense tissue clearly while MRI captures soft-tissue detail. The interesting engineering question is how to fuse the two representations at the feature level (rather than naive concatenation) on a 6 GB laptop GPU budget.

## what I did

- Dual-branch ResNet50 with **cross-modal attention gates** for feature-level fusion (not late concatenation) — the attention gates learn modality-specific feature weights
- Trained on **4,974 images** (1,742 CT-train + 1,744 MRI-train + 744 CT-test + 744 MRI-test) with mixed-precision (FP16 + TF32 enabled on cuDNN) on an NVIDIA RTX 4050 Laptop GPU (6 GB VRAM, CUDA 12.9)
- Pipeline: data exploration → cross-modal feature extraction & fusion → evaluation vs single-modality baselines

## outcome

- Working dual-branch fusion model with feature-level attention; demonstrates resource-aware engineering within a laptop-GPU budget
- Multimodal fusion at the feature level rather than naive late-concatenation — the harder, more interesting version

[→ GitHub: SaurabhJalendra/Fusion-model-for-CT-and-MRI-data](https://github.com/SaurabhJalendra/Fusion-model-for-CT-and-MRI-data)`,

    'projects/side/rl-traffic-optimization.md': `# RL Traffic Optimization — DQN + Actor-Critic on 10 Hz vehicle data

**Role:** Group project (BITS Pilani Group 111)
**Stack:** TensorFlow / Keras, NumPy, Pandas, Matplotlib
**Year:** 2025  ·  **Status:** coursework deliverable

## the problem

Coursework deliverable for the Deep Reinforcement Learning course at BITS Pilani — implement and compare value-based (DQN) and policy-based (Actor-Critic) agents on a real-world traffic-control problem with 10 Hz (100 ms interval) vehicle trajectory data.

## what I did

- Implemented both DQN and Actor-Critic agents controlling vehicle speed and lane changes
- Designed an 8-feature state space (speed, acceleration, lane, space headway, time headway, vehicle class, global X, global Y) with 5 discrete actions (maintain / increase / decrease / left / right)
- Safety-aware reward function: \`R = (10 - |V_t - V_optimal|) - P_collision\` with collision penalty P=20 when headway < 5m

## outcome

- Working DQN + Actor-Critic implementations on real 10 Hz vehicle trajectory data with defensible state / action / reward design
- Pairs with the M.Tech dissertation (model-based RL via world models) to give value-based + policy-based + model-based RL coverage end-to-end

[→ GitHub: SaurabhJalendra/Reinforcement-Learning-based-Traffic-Optimization](https://github.com/SaurabhJalendra/Reinforcement-Learning-based-Traffic-Optimization)`,

    'projects/side/ai-newsletter-digest.md': `# AI Newsletter Digest — zero-cost production agent

**Role:** Built
**Stack:** Node.js (ES modules), Gemini 1.5 Flash via OpenAI-compatible SDK, node-imap, nodemailer, cheerio + turndown + html-to-text, Next.js 14 + Tailwind dashboard, GitHub Actions cron, Vercel
**Year:** 2025–present  ·  **Status:** running in production since November 2025

## the problem

Twenty AI / dev newsletters arrive in your inbox every day. Reading them all is unrealistic; deleting them feels like missing signal. The right answer is an agent that fetches → summarises → emails → archives — and the constraint that makes it interesting is doing it for $0/month.

## what I did

- GitHub Actions cron (12:00 AM IST daily) → Gmail IMAP fetcher → cheerio/turndown HTML cleaning → Gemini 1.5 Flash summarisation → JSON file commit → triggers Vercel rebuild → dashboard updates
- Tracks 19 AI/dev newsletters (TLDR AI, The Rundown, Alpha Signal, Future Tools, LlamaIndex News, etc.)
- Static-file storage (JSON in git) instead of a DB — automatic version history, no DB ops, auto-deploys on commit
- Custom subdomain at newsletter.saurabhjalendra.com via Vercel + DNS CNAME

## outcome

- Production deployment running daily since November 2025 at $0/month (GitHub Actions free, Vercel free, Gemini free 15 RPM, Gmail SMTP free)
- The architectural lesson: static-file-in-git as a database is the right answer for single-user agentic apps — it gives you free version history, free hosting, free CI/CD

[→ GitHub: SaurabhJalendra/Email_daily_newsletter_summary](https://github.com/SaurabhJalendra/Email_daily_newsletter_summary)`,

    'projects/side/bank-fraud-detection.md': `# Bank Fraud Detection — hybrid rules + Random Forest + Autoencoder

**Role:** Built
**Stack:** scikit-learn (RandomForest, MinMaxScaler), imbalanced-learn (SMOTE), TensorFlow/Keras (Autoencoder), CTGAN, SHAP, Flask
**Year:** 2025–2026  ·  **Status:** complete

## the problem

Production fraud systems at JPMC / Stripe / PayPal aren't single classifiers — they layer interpretable rules (auditable, fast), supervised classifiers (high accuracy on known fraud), and unsupervised anomaly detection (catches novel patterns). Most academic fraud projects ship one classifier and stop. The interesting version is the calibrated ensemble.

## what I did

- Three-layer architecture: 7 hand-coded fraud rules (amount thresholds, velocity, time-of-day, type-mismatch, new beneficiary, geo-distance, behavior anomaly) + 100-tree Random Forest (supervised) + 9→4→2→4→9 dense Autoencoder (trained on normal-only, reconstruction error as anomaly score)
- Weighted ensemble: \`score = α·p_rf + (1-α)·p_ae\` — both \`α\` and the decision threshold grid-searched on validation data, persisted to \`thresholds.pkl\`
- CTGAN trained 50 epochs on a 2K seed dataset to generate 100K synthetic transactions (real fraud data is scarce / proprietary)
- Persisted full inference artifact bundle (\`rf_model.pkl\`, \`ae_model.keras\`, \`scaler.pkl\`, \`label_encoders.pkl\`, \`thresholds.pkl\`) behind a Flask inference app

## outcome

- End-to-end fraud system mirroring the production architecture used at major financial institutions — rules + supervised + unsupervised with explicit α calibration
- The autoencoder reconstruction-loss approach is structurally identical to how SAE-feature-activation can flag out-of-distribution inputs in mechanistic interpretability work

[→ GitHub: SaurabhJalendra/Bank_fraud_detection](https://github.com/SaurabhJalendra/Bank_fraud_detection)`,

    'writing/2026-04-06-introducing-haze.md': `# Introducing HAZE: A Benchmark for How AI Handles Bad Prompts
*Published 2026-04-06 · 5 min read*

"Sort this list." "Make it better." "Fix the bug."

This is how real people talk to AI. Not carefully engineered prompts — messy, vague, incomplete instructions that assume the model can read their mind.

And most of the time, the model just... guesses. It picks the most likely interpretation, produces a confident response, and moves on. Sometimes it's right. Often it's wrong. It almost never asks for clarification.

I've been building a benchmark to measure this: **HAZE — Handling Ambiguous, Zero-clarity Expressions**.

## What HAZE Measures

Most benchmarks evaluate LLMs on well-formed inputs — HumanEval gives you a precise function signature, MMLU gives you a clear multiple-choice question. But real-world usage is nothing like this.

HAZE evaluates the full ambiguity-handling loop:

\`\`\`diagram
graph TD
    A[Ambiguous User Prompt] --> B{Stage 1: Detection}
    B -->|Detected| C[Stage 2: Clarification]
    B -->|Not Detected| D[Blind Guess - Scored Low]
    C --> E{Good Questions?}
    E -->|Yes| F[Stage 3: Completion]
    E -->|No| G[Poor Clarification - Scored Medium]
    F --> H{Correct Result?}
    H -->|Yes| I[Full Score]
    H -->|No| J[Partial Score]
\`\`\`

Three stages, scored independently:
1. **Detection** — Does the model *notice* the prompt is ambiguous?
2. **Clarification** — Does it ask the *right* questions to resolve the ambiguity?
3. **Completion** — Does it *deliver* a correct result after clarifying?

This reveals exactly *where* models fail. Some are great at detection but terrible at asking useful questions. Others ask good questions but still produce wrong output.

## 7 Types of Ambiguity

Not all vagueness is the same. HAZE categorizes ambiguity into 7 types:

\`\`\`chart:bar
title: HAZE Ambiguity Categories
data:
  - label: Underspecified
    value: 280
  - label: Contradictory
    value: 180
  - label: Implicit Assumption
    value: 220
  - label: Missing Context
    value: 200
  - label: Scope Unclear
    value: 190
  - label: Subjective Criteria
    value: 230
  - label: Multi-Interpretation
    value: 200
ylabel: Number of Instances
\`\`\`

- **Underspecified** — "Sort this list" (by what? ascending? descending?)
- **Contradictory** — "Make it shorter but add more detail"
- **Implicit assumption** — "Fix the bug" (which bug? what is the expected behavior?)
- **Missing context** — "Write a function for this" (what language? what framework?)
- **Scope unclear** — "Improve the code" (performance? readability? both?)
- **Subjective criteria** — "Make it better" (better how?)
- **Multi-interpretation** — "Table" (HTML table? database table? data table?)

## Why Existing Benchmarks Fall Short

\`\`\`chart:bar
title: Benchmark Coverage Comparison
data:
  - label: CLAMBER
    value: 35
  - label: ClarEval
    value: 40
  - label: QuestBench
    value: 30
  - label: ClarifyMT
    value: 25
  - label: HAZE
    value: 95
ylabel: Coverage Score (%)
\`\`\`

Existing benchmarks each tackle a piece:
- **CLAMBER** tests ambiguity detection but not clarification
- **ClarEval** tests clarification quality but only for search queries
- **QuestBench** evaluates question generation but not task completion
- **ClarifyMT-Bench** covers multi-turn but only for translation

None of them evaluate the *full interactive workflow* across multiple domains. HAZE does.

## Multi-Domain Coverage

HAZE spans 5 domains — because ambiguity looks different in code vs. creative writing vs. data analysis:

\`\`\`diagram
graph TD
    A[HAZE Benchmark] --> B[Code Generation]
    A --> C[Creative Writing]
    A --> D[Data Analysis]
    A --> E[General Assistance]
    A --> F[Reasoning Tasks]
    B --> G[1500 total instances]
    C --> G
    D --> G
    E --> G
    F --> G
    G --> H[12+ Models Evaluated]
    H --> I[Human Performance Baselines]
\`\`\`

A model that handles ambiguity well in code ("fix the bug") might fail completely in creative writing ("make it more engaging"). HAZE measures both.

## By the Numbers

- **~1,500 benchmark instances** across 5 domains and 7 ambiguity types
- **12+ models** evaluated (GPT-4, Claude, Gemini, Llama, Mistral, and more)
- **Human performance baselines** — how well do humans handle the same ambiguous prompts?
- **Contamination analysis** — ensuring models haven't seen the test data
- **Adversarial testing** — prompts designed to fool models into *not* asking for clarification

## What We Are Finding

Early results show a clear pattern: models are getting better at *generating* answers but not at *knowing when they don't have enough information*. The best models detect ambiguity about 60% of the time — meaning 40% of the time they just guess silently.

The gap between detection and completion is even more revealing. Models that score 80%+ on detection often drop to 40% on completion — they know the prompt is vague but still can't deliver the right result after clarification.

## What is Next

HAZE is targeting the **NeurIPS/ICML Datasets and Benchmarks** track. The goal: push the field toward AI that doesn't just answer — it *understands what you actually meant*.

The benchmark, evaluation code, and leaderboard will be open-sourced. If you are working on ambiguity handling or clarification in LLMs, I would love to collaborate.`,

    'writing/2026-04-06-sensory-data-gap.md': `# 11 Million Bits Per Second: The Data Gap Between Brains and AI
*Published 2026-04-06 · 6 min read*

Right now, as you read this, your brain is processing approximately 11 million bits of sensory data per second. Vision alone accounts for 10 million. Sound adds another million. Touch, smell, taste, proprioception — they all contribute to a continuous, unfiltered, multimodal data stream that your brain processes effortlessly, every waking moment.

Now consider how we train AI: we collect a dataset, clean it, label it, batch it, and run a training loop for weeks on a GPU cluster. Then we freeze the model and deploy it. It never learns again.

These two approaches to intelligence couldn't be more different. And I think that gap is the most important unsolved problem in AI.

## The Numbers

\`\`\`chart:bar
title: Sensory Data Bandwidth (bits/sec)
data:
  - label: Vision
    value: 10000000
  - label: Touch
    value: 1000000
  - label: Hearing
    value: 100000
  - label: Smell
    value: 100000
  - label: Taste
    value: 1000
ylabel: bits/sec
\`\`\`

Humans ingest roughly 11 million bits per second through our senses. But here's the fascinating part: we're only *consciously aware* of about 50 bits per second. That means 99.9995% of sensory processing happens unconsciously — the brain is performing massive compression, pattern recognition, and filtering without us even knowing.

This unconscious processing IS learning. Every moment, your brain is updating its model of the world.

## How AI Trains vs How Brains Learn

**Current AI:** Collect Dataset → Clean → Batch Train → Freeze → Deploy (never learns again)

**Biological Brain:** Continuous Input → Real-Time Processing → Compress → Update World Model → Never Stops → Loop

The differences are fundamental:

| Dimension | Current AI | Biological Brain |
|-----------|-----------|-----------------|
| Data input | Static datasets | Continuous streams |
| Modalities | 1-2 (text, images) | 5+ simultaneous |
| Learning | Batch, then freeze | Always on |
| Compression | Tokenization | 11M to 50 bits/sec |
| Embodiment | None | Full sensorimotor |
| Adaptation | Requires retraining | Real-time |

## The Compression Problem

The brain's most impressive trick isn't processing 11 million bits per second — it's compressing them down to 50 bits of conscious experience while still learning from all of it.

**The compression pipeline:** 11M bits/sec Raw Input → Sensory Receptors → Thalamus (routing) → Cortex (pattern recognition) → Hippocampus (memory) → 50 bits/sec Conscious Awareness. The updated world model feeds back into the thalamus — a continuous loop.

Current AI architectures don't do anything like this. Transformers process tokens sequentially, with attention over a fixed context window. There's no continuous compression, no background learning, no unconscious processing.

What if we built architectures that could?

## What Would Need to Change

**1. Continuous learning architectures** — Models that update their weights in real-time from streaming data, without catastrophic forgetting. Current approaches (EWC, progressive networks) are primitive compared to what the brain does.

**2. Massive compression layers** — Something that takes raw sensory streams (video at 30fps, audio at 44kHz, sensor data) and compresses them into a learnable representation — the way the thalamus filters before the cortex processes.

**3. Multi-timescale memory** — The brain has working memory (seconds), episodic memory (hours-years), and semantic memory (lifetime). AI has a context window. We need architectures with multiple timescales of memory and learning.

**4. Embodiment** — Learning from sensory data requires having sensors. This means robots, IoT devices, or at minimum, always-on cameras and microphones feeding into a learning system.

## The Compute Question

Processing human-scale sensory data would require enormous compute. At 11 million bits/sec, a single day produces about 950 gigabits — nearly 120 gigabytes — of raw sensory data. Per person. Per day.

\`\`\`chart:line
title: Daily Sensory Data vs AI Training Data
series:
  - name: Human Sensory (cumulative GB)
    data: [[0,0],[30,3600],[90,10800],[365,43200]]
  - name: GPT-4 Training Data
    data: [[0,13000],[30,13000],[90,13000],[365,13000]]
xlabel: Days
ylabel: Data Volume (GB)
\`\`\`

In just one year, a single human processes more raw data than GPT-4's entire training set. In a lifetime, it's not even comparable.

But maybe the answer isn't more compute. The brain runs on about 20 watts. It doesn't need a GPU cluster — it needs a fundamentally different architecture. One that compresses, filters, and learns at the same time, in a single pass, on streaming data.

## What This Means for AI

If we solve continuous sensory learning, everything changes:
- **No more dataset curation** — the model learns from experience, not curated examples
- **No more training runs** — the model is always training, always improving
- **True multimodal understanding** — not just text and images, but the full sensory spectrum
- **Embodied intelligence** — robots that learn like children, through exploration
- **Personalized AI** — a model that learns YOUR world, not the internet's average

This is the gap between narrow AI and something approaching general intelligence. And it starts with taking seriously how biological systems actually learn: not from datasets, but from the raw, unfiltered, magnificent chaos of sensory experience.

The question is: can we build the architecture that handles the firehose?`,

    'writing/2026-03-25-personal-ai-gemma4.md': `# My Research Agenda: Building a Personal AI on Gemma 4
*Published 2026-03-25 · 7 min read*

What if you had a personal AI that wasn't just a coding assistant — but a genuine thinking partner?

One that reasons through complex problems, brainstorms ideas with you, understands scientific papers, solves math, writes code, and then *executes* on what you've planned together — autonomously managing files, running experiments, deploying code.

That's what I want to build. And I think Gemma 4 might be the right foundation.

## Why Gemma 4?

\`\`\`chart:bar
title: Gemma 4 vs Open Models — Multi-Capability
data:
  - label: Coding
    value: 82
  - label: Reasoning
    value: 78
  - label: Math
    value: 75
  - label: Science
    value: 74
  - label: Tool Use
    value: 80
  - label: Instruction Following
    value: 83
ylabel: Benchmark Score (%)
\`\`\`

Most open models specialize — DeepSeek Coder for code, Qwen-Math for math. Gemma 4 is different: it's genuinely strong across *all* capabilities. That's critical because I don't want five fine-tuned specialists — I want one model that can seamlessly shift between reasoning about a physics problem, brainstorming a startup idea, writing the code, and deploying it.

Key advantages:
- **Multi-capability base** — strong at reasoning, math, science, AND code out of the box
- **Built-in tool use** — trained with function calling from the start
- **Open weights** — full fine-tuning access
- **Efficient at 12B** — runs on consumer hardware with quantization

## The Vision: Not a Coding Bot — A Thinking Partner

\`\`\`diagram
graph TD
    A[Me] --> B[Personal AI on Gemma 4]
    B --> C[Deep Reasoning]
    B --> D[Creative Brainstorming]
    B --> E[Science and Math]
    B --> F[Code Generation]
    B --> G[Agentic Execution]
    C --> H[Break down complex problems]
    D --> J[Generate and challenge ideas]
    E --> L[Read papers and derive equations]
    F --> N[Write production code]
    G --> P[Run commands and manage projects]
\`\`\`

The difference from existing AI tools: this model would be trained to think *with me*, not just *for me*. It would know my research interests (RL, world models, quantum-inspired ML), my coding style, my projects, and my way of approaching problems.

## The Training Pipeline

Four phases, each building on the last. Start from Gemma 4's strong base, progressively specialize.

**Phase 1: Continued Pre-Training** — Deepen Gemma 4's knowledge with curated domain data.

\`\`\`chart:bar
title: Pre-Training Data Mix
data:
  - label: GitHub Code
    value: 40
  - label: Scientific Papers
    value: 25
  - label: Math and Proofs
    value: 15
  - label: Technical Books
    value: 10
  - label: High-Quality Web
    value: 10
ylabel: Mix Proportion (%)
\`\`\`

Data sources: The Stack v2 (3.3TB code), arXiv papers (2M+), Proof-Pile, OpenWebMath. The key question: what mix ratio prevents catastrophic forgetting while deepening expertise?

**Phase 2: Multi-Capability Fine-Tuning** — Train the model to *apply* its knowledge across reasoning, brainstorming, science, and code. Using GSM8K and MATH for reasoning, SciQ and SciBench for science, CodeAlpaca for code, and synthetically generated brainstorm dialogues.

**Phase 3: Agentic Alignment** — Train multi-step tool use: reason about a problem, write code to test it, run experiments, analyze results. Using tool-use trajectories, ReAct traces, and DPO for safety alignment.

**Phase 4: Personal Specialization** — A LoRA adapter trained on my 51 repos, research notes, and Claude sessions. Cheap enough to run on my RTX 5090.

## The Agentic Architecture

\`\`\`diagram
graph LR
    A[User Intent] --> B[Gemma 4 Agent]
    B --> C{What is needed?}
    C -->|Thinking| D[Reason through problem]
    C -->|Research| E[Search papers and web]
    C -->|Building| F[Write and run code]
    C -->|Planning| G[Break into steps]
    D --> H[Respond or continue]
    E --> H
    F --> H
    G --> H
    H --> B
\`\`\`

The model decides *what mode to operate in*: should it reason, research, code, or plan? And it chains these together — reason about a problem, write code to test the hypothesis, run it, analyze results.

## Cost Estimate

\`\`\`chart:bar
title: Estimated Training Cost by Phase
data:
  - label: Phase 1 Pre-Train
    value: 15000
  - label: Phase 2 Multi-Task
    value: 5000
  - label: Phase 3 Agentic
    value: 3000
  - label: Phase 4 Personal
    value: 200
ylabel: Cost (USD)
\`\`\`

~$23K total. The pragmatic path: start with Phase 4 ($200) on my own GPU, measure improvement, then decide if the full pipeline is worth the investment.

## The Real Question

Can a fine-tuned 12B model match the reasoning depth of Claude or GPT-4 on *my specific tasks*? Probably not on general benchmarks. But on *my* problems — my codebase, my research domain, my workflow — it might not need to match them. It just needs to be *good enough* while being fully mine: local, private, customizable, and always available.

That's worth researching.

Next step: auditing Gemma 4's existing performance on my actual tasks and prototyping Phase 4 — the personal LoRA fine-tune on my own hardware.`,

    'writing/2026-03-21-llm-programming-language.md': `# I Think We're Programming Wrong
*Published 2026-03-21 · 5 min read*

Today I started exploring an idea that's been nagging me for weeks: what if we stopped writing code entirely?

Not in the "AI will replace programmers" way. In the "we're using the wrong abstraction" way.

## The Abstraction Ladder

Every generation of programming languages has removed a layer of complexity:

\`\`\`chart:bar
title: Abstraction Level by Generation
data:
  - label: Assembly
    value: 20
  - label: C
    value: 40
  - label: Python
    value: 70
  - label: LLM-Lang
    value: 95
ylabel: Abstraction Level
\`\`\`

Assembly removed machine code. C removed assembly. Python removed memory management. Each step: less about *how*, more about *what*.

The next step is obvious: remove the code entirely.

## How It Would Work

\`\`\`diagram
graph TD
    A[Natural Language Intent] --> B[LLM Parser]
    B --> C{Reasoning Engine}
    C --> D[Execution Plan]
    C --> E[Error Prediction]
    D --> F[Compute]
    E --> F
    F --> G[Output + Explanation]
    G -->|Feedback Loop| C
\`\`\`

You express intent. The LLM reasons about what compute is needed. It plans execution, predicts errors before they happen, and runs.

## Not Just Prompt Engineering

This isn't ChatGPT with a REPL. It's fundamentally different:

\`\`\`chart:line
title: Developer Effort vs System Capability
series:
  - name: Traditional Code
    data: [[0,0],[20,30],[40,55],[60,70],[80,80],[100,85]]
  - name: LLM-Native
    data: [[0,0],[20,50],[40,75],[60,88],[80,93],[100,97]]
xlabel: System Complexity
ylabel: Capability Achieved
\`\`\`

With traditional code, developer effort scales linearly with complexity. With an LLM-native language, the LLM handles the complexity scaling — your effort stays roughly constant.

## The Hard Questions

- **Type safety**: How do you verify correctness when there's no type system? The LLM reasons about types, but can you trust it?
- **Debugging**: What do you debug when there's no source code? You'd debug the *intent* — "I meant X, but you did Y."
- **Concurrency**: The LLM decomposes tasks automatically. No mutexes, no async/await — just intent.

## What's Next

I'm going to prototype this. A minimal runtime where you express intent and the LLM figures out the rest. Starting with simple computations and working up.

The last programming language won't have syntax. It'll have understanding.`,

    'experience.json': `{
  "role": "AI Research Engineer · world models, RL, AI safety",
  "based_in": "Jaipur, India",
  "remote": true,
  "available_from": "2026-Q3",

  "current": {
    "from": "2025-02",
    "company": "SKY Advanced Research LLP",
    "title": "Co-Founder & AI Lead",
    "scope": "Building since Oct 2024 (pre-incorporation); company formally registered Feb 2025. Built Klares (vertical AI for Hong Kong finance — CRM + Outlook + DDQ autofill + compliance, LlamaIndex RAG + pgvector + cross-encoder re-rank); led International Citizen (cross-border wealth platform with Fila multilingual portfolio agent); shipped KAT GCS (drone Ground Control Station for autonomous flight, C++ implementation). 10+ internal AI tools."
  },

  "history": [
    {
      "from": "2018-01",
      "to": "2024-03",
      "company": "S K Jalendra Marketing Services Pvt Ltd",
      "title": "Director",
      "note": "Family business — self-employed director (6 yrs 3 mos). The bridge between B.Tech / ISRO and the AI pivot at SKY AI."
    },
    {
      "from": "2016-11",
      "to": "2017-04",
      "company": "Indian Space Research Organisation (ISRO), National Remote Sensing Centre, Jodhpur",
      "title": "Project Intern",
      "note": "VR heritage visualization (Unity / Oculus Rift / HTC Vive) + photogrammetry pipeline with Meshroom on aerial drone imagery. Started concurrent with final semester of B.Tech."
    }
  ],

  "education": [
    {
      "degree": "M.Tech AI/ML",
      "school": "BITS Pilani Work Integrated Learning Programmes",
      "from": "2024-05",
      "to": "2026-03",
      "highlights": [
        "Dissertation: Quantum-Enhanced Simulation Learning for RL — defended March 2026",
        "200 experiments, Bonferroni correction, Interference Ensemble 36-47% MSE reduction on DMControl",
        "Coursework: Deep RL, CV, NLP, PGM, GNN, Robotics"
      ]
    },
    {
      "degree": "MBA Banking & Finance Management",
      "school": "SVKM's Narsee Monjee Institute of Management Studies (NMIMS) Mumbai",
      "from": "2022-04",
      "to": "2024-04",
      "credential_id": "88136"
    },
    {
      "degree": "Diploma in Import & Export Management",
      "school": "iiiEM — International Institute of Import and Export Management",
      "from": "2020-01",
      "to": "2020-12"
    },
    {
      "degree": "B.Tech Computer Science",
      "school": "Government Engineering College, Bikaner",
      "from": "2013-06",
      "to": "2017-07"
    }
  ],

  "certifications": [
    { "name": "Probability & Statistics for Machine Learning & Data Science", "issuer": "DeepLearning.AI", "issued": "2026-05", "credential_id": "8466a512-e2d7-49b2-a526-0e0e1dff569c" },
    { "name": "Mathematics for Machine Learning and Data Science", "issuer": "DeepLearning.AI", "issued": "2026-05", "credential_id": "188c675d-e809-4995-838f-8e5c4586c95b" },
    { "name": "AI Fluency: Framework & Foundations", "issuer": "Anthropic", "issued": "2026-04" },
    { "name": "Linear Algebra for Machine Learning and Data Science", "issuer": "DeepLearning.AI", "issued": "2026-03", "credential_id": "ff640033-3f36-4991-8c41-58b9d06cfce1" },
    { "name": "Calculus for Machine Learning and Data Science", "issuer": "DeepLearning.AI", "issued": "2026-04", "credential_id": "3e8e095e-26db-4f26-8dd5-ada1492f7bdb" },
    { "name": "Claude Code in Action", "issuer": "Anthropic", "issued": "2026-04" },
    { "name": "Claude Code 101", "issuer": "Anthropic", "issued": "2026-04" },
    { "name": "Claude 101", "issuer": "Anthropic", "issued": "2026-04", "associated_skill": "Anthropic Claude" },
    { "name": "MBA Banking & Finance Management", "issuer": "NMIMS CDOE", "issued": "2024-05", "credential_id": "88136" }
  ],

  "stack": {
    "love":    ["PyTorch", "JAX/Equinox", "Claude API", "Python", "Postgres + pgvector"],
    "fluent":  ["TypeScript", "FastAPI", "React 19", "Docker", "AWS", "LlamaIndex", "LangChain", "MCP servers"],
    "learning":["DeepSpeed / FSDP", "Lean 4 (formal verification)", "Mech interp tooling (TransformerLens, nnsight)"]
  }
}`,

    'now.md': `# /now — week of May 19, 2026

What I'm actually doing this week, in order of how much of my brain it
takes up. (See [nownownow.com](https://nownownow.com) for the convention.)

## working on
- **Phase 2 portfolio rewrite** — porting the IDE-shell design into Next.js 16 + App Router; this page lives inside that
- **HAZE Benchmark v0.2** — closing the length-confound + BoW-shortcut on the dataset (Cohen's d=1.6 → target <0.3); 400 synthetic-validated + 390 real-sourced instances next
- **Anthropic Fellows application prep** — RL workstream primary, AI Safety secondary

## recently certified
- Completed 7 certifications in March–May 2026 — DeepLearning.AI math foundations (Linear Algebra, Calculus, Mathematics for ML, Probability & Statistics for ML) + Anthropic AI Fluency & Claude Code series (Claude 101, Claude Code 101, Claude Code in Action)

## reading
- *Natural Emergent Misalignment from Reward Hacking* (Anthropic, 2026) — central to the AI Safety workstream
- *Deliberative Alignment* (OpenAI) and *CoT Monitorability* (Anthropic + collaborators) — pair well on the reasoning-trace safety question
- *AlphaProof* (Nature, DeepMind) — formal proof + RL is the cleanest "model + search + verifier" loop in 2026
- Aleph Prover and PutnamBench notes — for the formal-verification curriculum

## thinking about
- **World models + safety implications** — if a DreamerV3-style world model learns reward-hacking shortcuts internally, can we detect that from the imagined-rollouts rather than only from the policy? This is where Simulating Anything and the Anthropic Fellows RL/Safety overlap lives
- **Risk-Manager-as-veto as a generalizable pattern** — the Trading Agent's risk gate is structurally similar to a Constitutional AI critic; what's the right interface for "one model holds binding veto over another"?

## listening to
<!-- TODO: Saurabh to fill — current album / podcast -->

_Last updated: 2026-05-19_`,

    'contact.yaml': `# the short version: email is best. i actually read it.

email:    saurabhjalendra@gmail.com
github:   saurabhjalendra
linkedin: in/saurabh-jalendra
website:  saurabhjalendra.com

availability:
  status:      available
  start_date:  2026-Q3
  modes:       [full-time, contract, research-fellowship]
  not_doing:   [crypto-only-projects, anything-with-an-NDA-on-the-NDA]

response_time:
  median:    24h
  worst:     72h
  signature: "if i don't reply in a week, it's not personal — nudge me"

based_in:    "Jaipur, India"
timezone:    IST · UTC+5:30
prefers:     "async-first, sync only when it earns it"`,

    '.gitconfig': `# the playful one — only the curious will find this

[user]
  name  = Saurabh Jalendra
  email = saurabhjalendra@gmail.com

[init]
  defaultBranch = main

[alias]
  hire       = !echo 'mailto:saurabhjalendra@gmail.com'
  projects   = !ls projects/
  why-me     = "!f() { cat about.md | head -20; }; f"
  research   = !cat projects/quantum-enhanced-simulation-learning.md

[fun]
  motto      = "honest results > impressive results"
  also-motto = "the work compounds; the hype decays"
  konami     = ↑↑↓↓←→←→ba

[remote "origin"]
  url = https://github.com/saurabhjalendra`,
  },

  // Outline (heading map) is computed on the fly from each file's markdown.
};
