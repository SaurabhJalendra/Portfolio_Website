---
name: blog
description: Interactive blog post creation — reads daily notes, suggests topics, generates 3 drafts with embedded visualizations (charts + diagrams), user picks what to publish
---

# Blog Post Creator

Interactive skill for creating blog posts with embedded visualizations. Reads your daily notes, suggests topics, generates drafts with charts and diagrams, and publishes the one you choose.

## Workflow

### Phase 1: Read Notes & Suggest Topics

**Primary source — your notes:**
```bash
ls -t notes/*.md | head -5
```
Read all recent note files. These are the user's raw thoughts.

**Secondary source — GitHub activity:**
```bash
gh api users/SaurabhJalendra/events --jq '.[] | select(.type == "PushEvent" or .type == "CreateEvent") | "\(.type): \(.repo.name) - \(.created_at)"' | head -15
git log --since="7 days ago" --oneline --all --no-merges
```

Cross-reference notes with GitHub activity. Suggest 3-4 topics using AskUserQuestion.

### Phase 2: Generate 3 Drafts (with Visualizations)

Once topic is chosen, generate **3 draft variants**:

1. **Technical deep-dive** — the how, code snippets, architecture
2. **Narrative/story** — the why, the journey, lessons learned
3. **Quick insight** — one focused takeaway, punchy (300-400 words)

**CRITICAL: Every draft MUST include at least 2 visualizations** using these special code blocks:

#### Chart Types (rendered by Recharts):

Bar chart:
````
```chart:bar
title: Chart Title
data:
  - label: Category A
    value: 85
  - label: Category B
    value: 60
ylabel: Metric Name
```
````

Line chart (multiple series):
````
```chart:line
title: Chart Title
series:
  - name: Series A
    data: [[0,10],[50,35],[100,60],[150,80]]
  - name: Series B
    data: [[0,10],[50,50],[100,75],[150,95]]
xlabel: X Label
ylabel: Y Label
```
````

Area chart:
````
```chart:area
title: Chart Title
series:
  - name: Growth
    data: [[0,0],[25,20],[50,55],[75,80],[100,95]]
xlabel: Time
ylabel: Value
```
````

#### Diagrams (rendered by Mermaid):

Flowchart:
````
```diagram
graph TD
    A[Input] --> B{Decision}
    B --> |Yes| C[Action 1]
    B --> |No| D[Action 2]
    C --> E[Output]
    D --> E
```
````

Sequence diagram:
````
```diagram
sequenceDiagram
    User->>LLM: Express intent
    LLM->>Planner: Decompose task
    Planner->>Executor: Run steps
    Executor->>User: Return result
```
````

#### Choosing Visualizations

Pick visualizations that **add understanding**, not decoration:

| Post topic | Good visualizations |
|-----------|-------------------|
| Comparing approaches | Bar chart (metrics), diagram (architecture diff) |
| Training/learning | Line chart (curves over time), area chart (cumulative) |
| System architecture | Mermaid flowchart, sequence diagram |
| Performance results | Bar chart (benchmarks), line chart (scaling) |
| Process/workflow | Mermaid flowchart, sequence diagram |
| Evolution/timeline | Line chart, bar chart showing progression |

### Phase 3: Refine & Publish

After user picks a draft:

1. Show the full post
2. Ask: "Any changes? (tone, visualizations, details, length) Or approve to publish?"
3. If changes requested → apply and show again
4. On approval:

**Update blog index:** `src/data/blog/index.ts`
Add the full blog post object to the `blogPosts` array with ALL fields: slug, title, date, tags, summary, readTime, AND content (the full markdown string with visualization code blocks).

**IMPORTANT:** The content field is a TypeScript template literal string. Escape backticks inside chart/diagram blocks by using `\`` or store the content carefully.

**Commit:**
```bash
git add src/data/blog/index.ts
git commit -m "blog: YYYY-MM-DD - <title>"
```

5. Ask: "Push to deploy?"

## Notes Format

Users write daily notes in `notes/YYYY-MM-DD.md`. Any format works:
- Bullet points, stream of consciousness, code snippets
- Links to papers, questions being explored, problems solved
- The messier the better — this skill polishes it

## Writing Style
- **Tone**: Technical but approachable. Like explaining to a smart friend.
- **Length**: 400-800 words (quick insight: 300-400 words)
- **Structure**: Hook → Context → Technical insight (with viz) → What's next
- **Voice**: First person ("I built...", "I discovered...", "What surprised me...")
- **Visualizations**: At least 2 per post — one chart + one diagram minimum
- **Avoid**: Generic fluff, buzzword salads, vizzes that don't add understanding
- **Include**: Code when relevant, but explain it
