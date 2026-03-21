---
name: blog
description: Interactive blog post creation — scans activity, suggests topics, generates drafts, user picks what to publish
---

# Blog Post Creator

Interactive skill for creating blog posts. Scans GitHub activity and Claude Code sessions to suggest topics, generates multiple drafts, and publishes the one you choose.

## Workflow

### Phase 1: Activity Scan & Topic Suggestions

**Scan GitHub activity (last 7 days):**
```bash
# Recent commits across all repos
gh api users/SaurabhJalendra/events --paginate --jq '.[] | select(.type == "PushEvent" or .type == "CreateEvent" or .type == "PullRequestEvent") | "\(.type): \(.repo.name) - \(.created_at)"' | head -30

# Commits in this repo
git log --since="7 days ago" --oneline --all

# Recently updated repos
gh api users/SaurabhJalendra/repos --jq 'sort_by(.pushed_at) | reverse | .[:10] | .[] | "\(.name) (pushed: \(.pushed_at | split("T")[0]))"'
```

**Scan Claude Code session history (if available):**
```bash
# Check recent Claude Code transcripts for topics discussed
ls -lt ~/.claude/projects/*/sessions/ 2>/dev/null | head -10
# Read recent session summaries for topic ideas
```

**Present findings to user:**
Show a summary of recent activity, then suggest 3-5 blog topic ideas based on:
- What repos were worked on and what changed
- Interesting technical patterns or challenges encountered
- Research progress or new experiments
- Tools/libraries explored
- Connections between different work streams

Use AskUserQuestion to present topic options:
- Option 1-4: Suggested topics from activity scan
- User can also type their own topic

### Phase 2: Draft Generation

Once the user picks a topic (or provides their own):

Generate **3 draft variants** with different angles:
1. **Technical deep-dive** — focused on the how, with code snippets
2. **Narrative/story** — focused on the why, the journey, the lessons
3. **Tutorial/educational** — focused on teaching the reader something

Each draft should be 400-800 words with:
- An engaging title
- A 1-2 sentence summary
- Relevant tags
- Estimated read time

Present all 3 drafts to the user using AskUserQuestion with previews showing the title, summary, and first few lines.

### Phase 3: Refinement & Publishing

After user picks a draft:

1. Ask if they want any changes (tone, length, details, code examples)
2. Apply changes if requested
3. Show final version for approval
4. On approval:

```bash
# Create the blog post file
# Filename: src/data/blog/YYYY-MM-DD-<slug>.md

# Update src/data/blog/index.ts — add metadata to blogPosts array
# Only metadata: slug, title, date, tags, summary, readTime
# Do NOT put content in index.ts

# Commit
git add src/data/blog/
git commit -m "blog: YYYY-MM-DD - <title>"
```

5. Ask if they want to push to deploy

## Writing Style Guidelines
- **Tone**: Technical but approachable. Like explaining to a smart friend.
- **Length**: 400-800 words. Quality over quantity.
- **Structure**: Hook → Context → Technical insight → What's next
- **Include**: Code snippets when relevant, but explain them
- **Avoid**: Generic fluff, buzzword salads, "In this blog post I will..."
- **Personality**: Show curiosity and genuine excitement about the work
- **First person**: Write as Saurabh ("I built...", "I discovered...", "What surprised me was...")

## Quality Checklist
Before presenting to user, verify each draft:
- [ ] Title is compelling (would you click it?)
- [ ] Summary works as a standalone preview
- [ ] Tags are relevant
- [ ] Opening line hooks the reader
- [ ] Post teaches the reader something
- [ ] No filler or fluff
- [ ] Code snippets (if any) are explained
