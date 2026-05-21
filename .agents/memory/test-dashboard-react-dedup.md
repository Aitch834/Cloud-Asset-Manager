---
name: Test-dashboard React deduplication
description: How the test-dashboard avoids "Invalid hook call" from multiple React instances
---

## The Rule
The test-dashboard imports dashboard source via `@fs/` paths. This can create two React instances ("Invalid hook call") through two mechanisms:

1. **Mid-render dep discovery**: if any npm package used by a dashboard component isn't in `optimizeDeps.include`, Vite discovers it mid-render, changes `browserHash`, and old/new modules coexist with different React instances.

2. **Large component files**: very large source files (>~2000 lines) can have hook dispatcher issues. Extracting huge components into their own files (e.g. `SlurryTab.tsx` from 2953-line `EnvironmentalPageFull.tsx`) resolves these.

**Why:** Vite's dep optimizer uses a single global `browserHash` for all pre-bundled chunks. Any new discovery mid-render changes this hash, causing stale old-hash modules and new-hash modules to coexist briefly.

**How to apply:**
- Every new npm package used by dashboard components must be added to BOTH `resolve.alias` (with `td()` or dashboard path) AND `optimizeDeps.include` in `artifacts/test-dashboard/vite.config.ts`.
- If a dashboard page gets very long (>1500 lines), consider extracting tab components into separate files.
- The `reconnectReloadPlugin` + `Cache-Control: no-store` handles restart hash mismatches.
- Check `node_modules/.vite/deps/_metadata.json` — "discovered" section must be empty; everything in "optimized".
