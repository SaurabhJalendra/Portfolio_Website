# Portfolio_Website — Status: SECONDARY CLONE

**Status:** Secondary clone. The canonical version of this repo is the `portfolio/` git submodule inside **`D:/Git repos/Personal-Agents/portfolio/`**.

## Background

`Portfolio_Website` was the original standalone clone of `saurabhjalendra.com` (Vite + React 19 + TypeScript + Tailwind v4, deployed via GitHub Pages). After moving to the Personal-Agents command-center pattern, the same repo was added as a git submodule under `Personal-Agents/portfolio/` so that career-center workflows (`/career-center update-portfolio`) operate against it without leaving the Personal-Agents context.

Both checkouts point to the **same upstream GitHub repo**.

## Treat as

- **Canonical for daily work:** `D:/Git repos/Personal-Agents/portfolio/`
- **This directory (`Portfolio_Website`):** secondary clone — useful for standalone work, but updates should flow through the Personal-Agents submodule to keep that view current.

## Sync command

If this checkout falls behind:

```bash
cd "D:/Git repos/Portfolio_Website"
git pull
```

If Personal-Agents/portfolio submodule falls behind:

```bash
cd "D:/Git repos/Personal-Agents"
git submodule update --remote portfolio
```

## License

Personal — public portfolio site for Saurabh Jalendra.
