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

\\\`\\\`\\\`chart:bar
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
\\\`\\\`\\\`

Most open models specialize — DeepSeek Coder for code, Qwen-Math for math. Gemma 4 is different: it's genuinely strong across *all* capabilities. That's critical because I don't want five fine-tuned specialists — I want one model that can seamlessly shift between reasoning about a physics problem, brainstorming a startup idea, writing the code, and deploying it.

Key advantages:
- **Multi-capability base** — strong at reasoning, math, science, AND code out of the box
- **Built-in tool use** — trained with function calling from the start
- **Open weights** — full fine-tuning access
- **Efficient at 12B** — runs on consumer hardware with quantization

## The Vision: Not a Coding Bot — A Thinking Partner

\\\`\\\`\\\`diagram
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
\\\`\\\`\\\`

The difference from existing AI tools: this model would be trained to think *with me*, not just *for me*. It would know my research interests (RL, world models, quantum-inspired ML), my coding style, my projects, and my way of approaching problems.

## The Training Pipeline

Four phases, each building on the last. Start from Gemma 4's strong base, progressively specialize.

**Phase 1: Continued Pre-Training** — Deepen Gemma 4's knowledge with curated domain data.

\\\`\\\`\\\`chart:bar
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
\\\`\\\`\\\`

Data sources: The Stack v2 (3.3TB code), arXiv papers (2M+), Proof-Pile, OpenWebMath. The key question: what mix ratio prevents catastrophic forgetting while deepening expertise?

**Phase 2: Multi-Capability Fine-Tuning** — Train the model to *apply* its knowledge across reasoning, brainstorming, science, and code. Using GSM8K and MATH for reasoning, SciQ and SciBench for science, CodeAlpaca for code, and synthetically generated brainstorm dialogues.

**Phase 3: Agentic Alignment** — Train multi-step tool use: reason about a problem, write code to test it, run experiments, analyze results. Using tool-use trajectories, ReAct traces, and DPO for safety alignment.

**Phase 4: Personal Specialization** — A LoRA adapter trained on my 51 repos, research notes, and Claude sessions. Cheap enough to run on my RTX 5090.

## The Agentic Architecture

\\\`\\\`\\\`diagram
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
\\\`\\\`\\\`

The model decides *what mode to operate in*: should it reason, research, code, or plan? And it chains these together — reason about a problem, write code to test the hypothesis, run it, analyze results.

## Cost Estimate

\\\`\\\`\\\`chart:bar
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
\\\`\\\`\\\`

~$23K total. The pragmatic path: start with Phase 4 ($200) on my own GPU, measure improvement, then decide if the full pipeline is worth the investment.

## The Real Question

Can a fine-tuned 12B model match the reasoning depth of Claude or GPT-4 on *my specific tasks*? Probably not on general benchmarks. But on *my* problems — my codebase, my research domain, my workflow — it might not need to match them. It just needs to be *good enough* while being fully mine: local, private, customizable, and always available.

That's worth researching.

Next step: auditing Gemma 4's existing performance on my actual tasks and prototyping Phase 4 — the personal LoRA fine-tune on my own hardware.`,
  },
]
