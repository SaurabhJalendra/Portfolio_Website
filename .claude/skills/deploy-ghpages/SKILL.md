---
name: deploy-ghpages
description: Build and deploy the portfolio to GitHub Pages via GitHub Actions
disable-model-invocation: true
---

# Deploy to GitHub Pages

Build the project and ensure it's ready for GitHub Pages deployment.

## Steps

1. Run `npm run build` and verify it succeeds
2. Check that `dist/` was created with index.html
3. Verify all asset paths are relative (not absolute `/`)
4. Check that `vite.config.ts` has the correct `base` path set for the GitHub repo
5. If GitHub Actions workflow doesn't exist, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

6. Commit and push to trigger deployment
7. Verify the deployment at the GitHub Pages URL
