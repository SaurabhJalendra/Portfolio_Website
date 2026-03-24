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
    slug: 'quantum-enhanced-simulation-learning',
    title: 'Quantum-Enhanced Simulation Learning for Reinforcement Learning',
    date: '2026-02-15',
    tags: ['Reinforcement Learning', 'Quantum Computing', 'World Models'],
    summary: 'Exploring how quantum-inspired methods can revolutionize world model training in RL. We demonstrate a 4x speed increase using quantum tunneling, interference, and entanglement techniques.',
    readTime: '12 min read',
    content: '',
  },
  {
    slug: 'world-models-scientific-discovery',
    title: 'World Models for Scientific Discovery',
    date: '2026-02-01',
    tags: ['World Models', 'Scientific Simulation', 'Symbolic Regression'],
    summary: 'How domain-agnostic world models can recover known physical laws and discover new mathematical relationships across 187 simulation domains.',
    readTime: '10 min read',
    content: '',
  },
  {
    slug: 'multi-agent-systems-practice',
    title: 'Multi-Agent Systems in Practice',
    date: '2026-01-20',
    tags: ['LLM Agents', 'Multi-Agent', 'Architecture'],
    summary: 'Lessons learned building SKAI, a multi-agent AI system with orchestrated execution, semantic memory, and self-improvement loops.',
    readTime: '8 min read',
    content: '',
  },
  {
    slug: 'rag-pipelines-production',
    title: 'RAG Pipelines in Production: Lessons from Klares',
    date: '2026-01-05',
    tags: ['RAG', 'LlamaIndex', 'Production ML'],
    summary: 'Real-world lessons from building and deploying RAG pipelines for document intelligence in Hong Kong finance, including re-ranking, chunking strategies, and evaluation.',
    readTime: '9 min read',
    content: '',
  },
  {
    slug: 'gravitational-lensing-deep-learning',
    title: 'Classifying Gravitational Lensing with Multimodal Deep Learning',
    date: '2025-12-15',
    tags: ['Astrophysics', 'Deep Learning', 'Multimodal'],
    summary: 'A CNN+LSTM architecture for classifying gravitational lensing events using both imaging and light curve data from the DES-deep survey.',
    readTime: '7 min read',
    content: '',
  },
]
