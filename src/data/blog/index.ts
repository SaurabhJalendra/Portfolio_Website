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
    G --> |Feedback Loop| C
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
]
