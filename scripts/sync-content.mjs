// sync-content.mjs
// Pre-build/pre-dev hook: copies content from the parent Personal-Agents repo
// into portfolio/public/ so it's accessible to the Next.js site.
//
// What it syncs:
//   - cv/cv.pdf -> public/cv.pdf   (resume; opened via cv.pdf tab in IDE tree)
//
// Phase 5 will extend this to sync the dedicated "about Saurabh" knowledge
// corpus once it's designed.
//
// Safe to run multiple times; idempotent (copies overwrite). If the source
// file is missing, prints a warning but does NOT fail the build — the
// portfolio can still ship without an updated CV.

import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioRoot = resolve(__dirname, '..');
const parentRoot = resolve(portfolioRoot, '..');

const syncs = [
  {
    from: join(parentRoot, 'cv', 'cv.pdf'),
    to: join(portfolioRoot, 'public', 'cv.pdf'),
    label: 'CV (cv.pdf)',
  },
];

let synced = 0;
let warned = 0;

for (const { from, to, label } of syncs) {
  if (!existsSync(from)) {
    console.warn(`[sync-content] WARN: source missing — ${label}\n  expected at: ${from}`);
    warned++;
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  const size = statSync(to).size;
  console.log(`[sync-content] OK  : ${label} (${(size / 1024).toFixed(1)} KB)`);
  synced++;
}

console.log(`[sync-content] done — ${synced} synced, ${warned} warned`);
