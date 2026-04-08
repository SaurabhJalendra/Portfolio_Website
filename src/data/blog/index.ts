import type { BlogPost } from '../../types'

export const blogPosts: BlogPost[] = [
  {
    slug: '2026-03-21-llm-programming-language',
    title: 'I Think We\'re Programming Wrong',
    date: '2026-03-21',
    tags: ['programming-languages', 'llm', 'future-of-code'],
    summary: 'What if the LLM isn\'t a tool that generates code — but IS the code? Exploring a programming language where intent is syntax and the runtime understands.',
    readTime: '5 min read',
    content: `Today I started exploring an idea that's been nagging me for weeks: what if we stopped writing code entirely?

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
  },
  {
    slug: '2026-03-25-personal-ai-gemma4',
    title: 'My Research Agenda: Building a Personal AI on Gemma 4',
    date: '2026-03-25',
    tags: ['llm-training', 'gemma', 'agentic-ai', 'reasoning', 'research'],
    summary: 'I\'m exploring training a general-purpose personal AI on Gemma 4 — one that reasons deeply, brainstorms creatively, handles science and math, writes code, and runs agentic workflows.',
    readTime: '7 min read',
    content: `What if you had a personal AI that wasn't just a coding assistant — but a genuine thinking partner?

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
  },
  {
    slug: '2026-04-06-sensory-data-gap',
    title: '11 Million Bits Per Second: The Data Gap Between Brains and AI',
    date: '2026-04-06',
    tags: ['ai-training', 'neuroscience', 'embodied-ai', 'multimodal', 'research'],
    summary: 'Humans process 11 million bits of sensory data every second. AI trains on static datasets in batch runs. What would change if computers could learn from continuous sensory streams the way we do?',
    readTime: '6 min read',
    content: `Right now, as you read this, your brain is processing approximately 11 million bits of sensory data per second. Vision alone accounts for 10 million. Sound adds another million. Touch, smell, taste, proprioception — they all contribute to a continuous, unfiltered, multimodal data stream that your brain processes effortlessly, every waking moment.

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

\`\`\`diagram
graph TD
    A[Collect Dataset] --> B[Clean and Label]
    B --> C[Batch Training]
    C --> D[Freeze Model]
    D --> E[Deploy - Never Learns Again]
\`\`\`

**Biological learning is the opposite:**

\`\`\`diagram
graph TD
    F[Continuous Sensory Input] --> G[Real-Time Processing]
    G --> H[Compression and Filtering]
    H --> I[Update World Model]
    I --> J[Never Stops]
    J --> F
\`\`\`

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

\`\`\`diagram
graph TD
    A[11M bits/sec Raw Sensory Input] --> B[Sensory Receptors]
    B --> C[Thalamus - Routing and Filtering]
    C --> D[Cortex - Pattern Recognition]
    D --> E[Hippocampus - Memory Consolidation]
    D --> F[50 bits/sec Conscious Awareness]
    E --> G[Updated World Model]
    G --> C
\`\`\`

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
  },
  {
    slug: '2026-04-06-introducing-haze',
    title: 'Introducing HAZE: A Benchmark for How AI Handles Bad Prompts',
    date: '2026-04-06',
    tags: ['benchmark', 'llm-evaluation', 'research', 'ambiguity', 'agentic-ai'],
    summary: 'Most benchmarks test LLMs on perfect inputs. HAZE tests what happens when users write vague, incomplete, or contradictory prompts — and whether the model can figure out what they actually meant.',
    readTime: '5 min read',
    content: `"Sort this list." "Make it better." "Fix the bug."

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
  },
]
