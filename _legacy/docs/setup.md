# Claude Code Setup Guide

> Paste this into any project's `CLAUDE.md` to get a high-performance Claude Code workflow. Customize the project-specific sections at the bottom.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- Keep main context window clean for coordination

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests → then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Code Quality Standards

### General
- Never commit code that doesn't build
- Run linter/formatter after every edit
- TypeScript: strict mode, no `any`
- Delete dead code — don't comment it out
- YAGNI: don't build for hypothetical future requirements
- DRY only when there's actual duplication, not theoretical

### Testing
- Write tests for non-trivial logic
- Test behavior, not implementation details
- Use TDD for complex algorithms or state machines
- Integration tests > unit tests for API/DB code

### Git
- Commit messages: `type: description` (feat, fix, style, refactor, perf, docs, test)
- One logical change per commit
- Never commit secrets, env files, or large binaries
- Review your own diff before committing

---

## Claude Code Configuration Checklist

### Settings (`.claude/settings.json`)
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm install *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(git status*)",
      "Bash(git log*)",
      "Bash(git diff*)",
      "Bash(git add *)",
      "Bash(git branch*)",
      "Bash(git checkout*)",
      "Bash(gh *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(rm -rf .git)",
      "Edit(.env*)",
      "Write(.env*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"try{const f=JSON.parse(process.env.TOOL_INPUT||'{}').file_path||'';if(/\\.(tsx?|jsx?|css|json)$/.test(f)){const{execSync}=require('child_process');execSync('npx prettier --write '+JSON.stringify(f),{stdio:'inherit'})}}catch{}\"",
            "timeout": 10,
            "statusMessage": "Formatting..."
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const f=(JSON.parse(process.env.TOOL_INPUT||'{}').file_path||'');if(/\\.env/.test(f)){console.error('BLOCKED: Do not edit .env files');process.exit(2)}\""
          }
        ]
      }
    ]
  }
}
```

### Recommended MCP Servers
- **context7** — Live docs for any library (`claude mcp add context7`)
- **Figma** — Design-to-code (if using Figma)

### Recommended Agents (`.claude/agents/`)
| Agent | Purpose |
|-------|---------|
| `code-reviewer` | Reviews code for quality, patterns, and bugs |
| `performance-reviewer` | Reviews for performance bottlenecks |
| `accessibility-reviewer` | Reviews for WCAG compliance |
| `security-reviewer` | Reviews for OWASP vulnerabilities |

### Recommended Skills (`.claude/skills/`)
| Skill | Purpose |
|-------|---------|
| `/deploy` | Build and deploy to production |
| `/new-component` | Scaffold a new component with proper patterns |
| `/optimize-assets` | Compress images, models, and other assets |

---

## Project-Specific Section (Customize Below)

```markdown
# [Project Name]

## Overview
[One-paragraph description of what this project does]

## Tech Stack
- [Framework]: [version]
- [Language]: [version]
- [Key libraries]

## Architecture
[File structure or architecture diagram]

## Key Conventions
- [Convention 1]
- [Convention 2]

## Development
- Dev server: `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Deployment
- [How and where it deploys]
- [Environment variables needed]
```
