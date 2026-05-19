// IDE "filesystem" = portfolio content modeled as a folder tree.
// Each leaf has { name, lang, body } where body is the file content
// (kept as a single string; the syntax highlighter splits + tokenizes).
//
// All [bracketed] text is placeholder copy — swap with real bio/projects.

window.PORTFOLIO_FS = {
  root: 'saurabhjalendra',
  tree: [
    { type: 'file', path: 'README.md',         lang: 'md',   pinned: true },
    { type: 'file', path: 'about.md',          lang: 'md',   pinned: true },
    { type: 'dir',  path: 'projects', children: [
      { type: 'file', path: 'projects/alpha.md',    lang: 'md' },
      { type: 'file', path: 'projects/bravo.md',    lang: 'md' },
      { type: 'file', path: 'projects/charlie.md',  lang: 'md' },
      { type: 'file', path: 'projects/delta.md',    lang: 'md' },
      { type: 'file', path: 'projects/echo.md',     lang: 'md' },
      { type: 'file', path: 'projects/foxtrot.md',  lang: 'md' },
    ]},
    { type: 'dir',  path: 'writing', children: [
      { type: 'file', path: 'writing/2026-04-12-essay-one.md', lang: 'md' },
      { type: 'file', path: 'writing/2026-02-03-note-two.md',  lang: 'md' },
      { type: 'file', path: 'writing/2025-11-22-talk.md',      lang: 'md' },
    ]},
    { type: 'file', path: 'experience.json',   lang: 'json' },
    { type: 'file', path: 'now.md',            lang: 'md' },
    { type: 'file', path: 'contact.yaml',      lang: 'yaml' },
    { type: 'file', path: '.gitconfig',        lang: 'ini' },
  ],

  // Raw file contents. Keys match `path` above.
  files: {
    'README.md': `# saurabhjalendra
<!-- [Engineer · Product Builder] · [City, IN] · UTC+5:30 -->

> [One-line tagline — what you make and for whom.]

Hi, I'm **Saurabh Jalendra**. This portfolio is laid out as a working
codebase — every page is a file you can open. Try:

- the file tree on the left
- \`⌘P\` (macOS) or \`Ctrl+P\` (Windows / Linux) to quick-open any file
- \`⌘K\` / \`Ctrl+K\` to run a command
- \`⌘J\` / \`Ctrl+J\` to toggle the terminal — \`ls\`, \`cat about.md\`, \`projects\` all work

## status
- **available** for [contract / full-time] from [Q3 2026]
- based in [City, IN] · open to remote
- inbox is usually clean — [hello@saurabhjalendra.com](mailto:hello@saurabhjalendra.com)

## here you'll find
- /projects — six selected case studies
- /writing — essays, notes, a talk
- /now — what I'm working on this week
- /contact — every way to reach me`,

    'about.md': `# About

[Two or three sentences: what you build, where you've been, what you care
about. This appears on the about / readme view.]

I've spent the last [6+] years shipping [products in fintech / dev-tools /
consumer]. I care about [boring foundations that make ambitious work
possible — observability, design systems, internal tools], and I write code
that other engineers actually want to extend.

## what I'm good at

- **Building from zero** — taking a vague problem to a shipped product in
  weeks, not quarters
- **Picking the right abstraction** — boring tech where it should be boring,
  novel tech only where it earns it
- **Working across disciplines** — comfortable owning a feature end to end:
  design, frontend, backend, infra

## what I'm working on getting better at

- Saying no to scope creep gracefully
- Writing more, even when it feels half-formed
- [Your next growth area]

## off-screen

[A line or two about you outside work — hobbies, where you grew up, what you
read.]`,

    'projects/alpha.md': `# Project Alpha — realtime collab that survives flaky networks

**Role:** Lead engineer · Design
**Stack:** TypeScript, tRPC, Postgres, Redis, CRDTs
**Year:** 2026  ·  **Status:** shipped

## the problem
[Customers were losing edits any time their connection blipped — and on the
team's primary market, that was every few minutes. Existing libraries
assumed a stable WebSocket. We needed something that felt instant offline
and converged correctly on reconnect.]

## what I did
- Designed the sync protocol on top of Yjs with a custom transport that
  falls back from WebSocket → SSE → polling
- Built the conflict UI — when the server sees a divergent edit, we surface
  it as a diff the user can accept/decline, not a silent overwrite
- Drove the metrics story: edits-lost-per-session went 14% → 0.2%

## outcome
- Shipped to 100% of [Free + Pro] in 11 weeks
- Adoption of collaborative docs went up 3.4×
- Got cited in a customer's RFP as the reason they signed

[→ video walkthrough · case study PDF · the postmortem we wrote up]`,

    'projects/bravo.md': `# Project Bravo — turning a 14-min CI into 90 seconds

**Role:** Infra
**Stack:** Go, Bazel, GCP
**Year:** 2025  ·  **Status:** shipped

## the problem
[The platform team's CI had grown from a 90-second test run into a 14-minute
ordeal. Engineers were context-switching three or four times per PR. The
team had tried parallelization once and made it worse.]

## what I did
- Profiled the test graph and found 80% of the runtime in 6% of the targets
- Migrated those targets to Bazel with remote caching
- Wrote a CLI that runs only the test targets affected by a diff

## outcome
- Median CI: 14m → 90s
- Engineers reported [3.2× more PRs merged per day]
- The Bazel migration unlocked a downstream effort to ship a monorepo`,

    'projects/charlie.md': `# Project Charlie — WebGL playground for graph databases

**Role:** Solo · OSS
**Stack:** React, WebGL, Rust (compiled to WASM)
**Year:** 2025  ·  **Status:** shipped — open source

## the problem
[Graph databases are amazing and almost no one uses them, partly because
the introspection tools are bad. I wanted a thing where you could paste a
Cypher query and *see* it.]

## what I did
- Force-directed layout in a Rust WASM module — handles 50k nodes at 60fps
- React + WebGL canvas; pan/zoom/select with the keyboard
- Open-sourced under MIT; [~2.1k GitHub stars]

[→ live demo · github.com/saurabhjalendra/charlie]`,

    'projects/delta.md': `# Project Delta — design system for 7 product teams

**Role:** Tech lead
**Stack:** React, design tokens, Figma API
**Year:** 2024  ·  **Status:** shipped

## the problem
[Each product team was forking the design language and we'd accumulated
nine different button components. Onboarding a new product to look "like
us" took weeks.]

## what I did
- Built a token pipeline: Figma → JSON → CSS variables → typed React props
- Wrote the migration codemods so teams could adopt in a single PR
- Ran the office hours that made adoption stick — 7 product teams in 4
  months

## outcome
- Onboarding for a new product surface: weeks → a single afternoon
- [78%] of internal UI now ships from the system`,

    'projects/echo.md': `# Project Echo — CLI for legacy data migrations

**Role:** Author
**Stack:** Rust, WASM (so you can dry-run in a browser)
**Year:** 2024  ·  **Status:** archived but maintained

[Built this when I kept running the same migration playbook by hand. Now
my whole team uses it; dry-run + rollback turned out to be the killer
features.]

\`echo migrate --dry-run --from postgres://old --to postgres://new\``,

    'projects/foxtrot.md': `# Project Foxtrot — a small tool that does one thing well

**Role:** Building
**Stack:** Swift, iOS
**Year:** 2026  ·  **Status:** WIP — beta

[Currently in beta. Send me an email if you want a TestFlight invite.]`,

    'writing/2026-04-12-essay-one.md': `# [Essay title one]
*Published 2026-04-12 · 12 min read*

[Opening hook. The piece is about why the boring middle of a project is
where most of the design happens, and how to get good at that.]

…

[Read the rest →]`,

    'writing/2026-02-03-note-two.md': `# [Essay title two]
*Published 2026-02-03 · 4 min read*

[A short note on something you've been thinking about.]`,

    'writing/2025-11-22-talk.md': `# Talk · [Conference name], Nov 2025

**Subject:** [Talk title]
**Length:** 28 min + Q&A
**Recording:** [link]
**Slides:** [link]

## abstract
[Paragraph describing the talk for the program guide.]`,

    'experience.json': `{
  "role":     "[Engineer · Product Builder]",
  "based_in": "[City], India",
  "remote":   true,
  "available_from": "Q3 2026",

  "current": {
    "from": "2024-03",
    "company": "[Company A]",
    "title":   "[Senior Engineer]",
    "scope":   "[One-line note about scope and impact]"
  },

  "history": [
    { "from": "2022-01", "to": "2024-03", "company": "[Company B]", "title": "[Engineer]",        "note": "[One-line note]" },
    { "from": "2020-06", "to": "2022-01", "company": "[Company C]", "title": "[Engineer]",        "note": "[One-line note]" },
    { "from": "2018-08", "to": "2020-06", "company": "[Company D]", "title": "[Junior Engineer]", "note": "[One-line note]" }
  ],

  "stack": {
    "love":    ["TypeScript", "Rust", "Postgres", "React"],
    "fluent":  ["Go", "Python", "GCP", "Redis", "WebGL"],
    "learning":["Swift", "OCaml"]
  }
}`,

    'now.md': `# /now — week of May 19, 2026

What I'm actually doing this week, in order of how much of my brain it
takes up. (See [nownownow.com](https://nownownow.com) for the convention.)

## working on
- [Project Foxtrot] beta — closing the last 11 TestFlight bugs
- A small library for [thing] — should ship next week

## reading
- [Book title], [author]
- [Long-form article you liked recently]

## listening to
- [Album you're on repeat]
- [Podcast you discovered]

## thinking about
- [An open question you're chewing on]

_Last updated: 2026-05-19_`,

    'contact.yaml': `# the short version: email is best. i actually read it.

email:    hello@saurabhjalendra.com
github:   saurabhjalendra
linkedin: in/saurabhjalendra
x:        saurabhjalendra
rss:      /feed.xml

availability:
  status:      available
  start_date:  2026-Q3
  modes:       [contract, full-time, advisory]
  not_doing:   [crypto, anything-with-an-NDA-on-the-NDA]

response_time:
  median:    24h
  worst:     72h
  signature: "if i don't reply in a week, it's not personal — nudge me"

based_in:    "[City], India"
timezone:    IST · UTC+5:30
prefers:     "async, async, async. async + 30 min sync if needed."`,

    '.gitconfig': `# the playful one — only the curious will find this

[user]
  name  = Saurabh Jalendra
  email = hello@saurabhjalendra.com

[init]
  defaultBranch = main

[alias]
  hire     = !echo 'mailto:hello@saurabhjalendra.com'
  projects = !ls projects/
  why-me   = "!f() { cat about.md | head -20; }; f"

[fun]
  konami = ↑↑↓↓←→←→ba
  motto  = "boring tech, ambitious products"`,
  },

  // Outline (heading map) is computed on the fly from each file's markdown.
};
