---
name: blog
description: Interactive blog post creation — reads your daily notes, suggests topics, generates 3 drafts, you pick what to publish
---

# Blog Post Creator

Interactive skill for creating blog posts. Reads your daily notes from `notes/`, optionally scans GitHub activity, generates multiple drafts, and publishes the one you choose.

## Workflow

### Phase 1: Read Notes & Suggest Topics

**Primary source — your notes:**
```bash
# Read recent notes (last 7 days)
find notes/ -name "*.md" -newer notes/$(date -d '7 days ago' +%Y-%m-%d).md -type f 2>/dev/null | sort -r
# Or just read the latest few
ls -t notes/*.md | head -5
```

Read all recent note files in `notes/` directory. These are the user's raw thoughts, daily logs, and observations.

**Secondary source — GitHub activity (supplement only):**
```bash
gh api users/SaurabhJalendra/events --jq '.[] | select(.type == "PushEvent" or .type == "CreateEvent") | "\(.type): \(.repo.name) - \(.created_at)"' | head -15
git log --since="7 days ago" --oneline --all --no-merges
```

**Combine and suggest:**
Cross-reference notes with GitHub activity to find the most interesting topics. Present to user:

1. Show a brief summary: "Here's what I found in your notes and GitHub"
2. Suggest 3-4 blog topic ideas using AskUserQuestion
3. Each suggestion should reference specific notes/activity
4. User can pick one OR type their own topic

### Phase 2: Generate 3 Drafts

Once topic is chosen, generate **3 draft variants**:

1. **Technical deep-dive** — the how, with code snippets and implementation details
2. **Narrative/story** — the why, the journey, lessons learned, what surprised you
3. **Quick insight** — one focused takeaway, punchy and concise (300-400 words)

Each draft must have:
- Title
- Summary (1-2 sentences)
- Tags
- Read time estimate
- Full blog content

Present all 3 using AskUserQuestion with **previews** showing:
```
Title: <title>
Summary: <summary>
---
<first 5-6 lines of content>
...
```

### Phase 3: Refine & Publish

After user picks a draft:

1. Show the full post
2. Ask: "Any changes? (tone, add/remove details, code examples, length) Or approve to publish?"
3. If changes requested → apply and show again
4. On approval:

**Create blog post file:** `src/data/blog/YYYY-MM-DD-<slug>.md`
```markdown
---
title: "<title>"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
summary: "<summary>"
readTime: "<X min read>"
---

<blog content>
```

**Update blog index:** `src/data/blog/index.ts`
Add metadata to `blogPosts` array (slug, title, date, tags, summary, readTime only — NOT content).

**Commit:**
```bash
git add src/data/blog/
git commit -m "blog: YYYY-MM-DD - <title>"
```

5. Ask: "Push to deploy?"

## Notes Format

Users write daily notes in `notes/YYYY-MM-DD.md`. Any format works:
- Bullet points
- Stream of consciousness
- Code snippets they found interesting
- Links to papers or articles
- Questions they're exploring
- Problems they solved

The messier the better — this skill's job is to turn raw notes into polished posts.

## Writing Style
- **Tone**: Technical but approachable. Like explaining to a smart friend.
- **Length**: 400-800 words (quick insight: 300-400 words)
- **Structure**: Hook → Context → Technical insight → What's next
- **Voice**: First person as Saurabh ("I built...", "I discovered...", "What surprised me...")
- **Avoid**: Generic fluff, buzzword salads, "In this blog post I will..."
- **Include**: Code when relevant, but explain it
- **Personality**: Curious, excited, honest about what worked and what didn't
