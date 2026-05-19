import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived Vite site — kept for rollback through Phase 7 soak, removed in Phase 8.
    "_legacy/**",
    // Design hand-off reference (prototype code, not production).
    "design_handoff_ide_portfolio/**",
  ]),
]);

export default eslintConfig;
