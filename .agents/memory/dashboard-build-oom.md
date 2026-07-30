---
name: Dashboard build OOM — causes, current fixes, long-term fix
description: The dashboard production build is consistently OOM-killed at Rollup's chunk-rendering phase. Documents why, what the current mitigations are, and what the long-term fix requires.
---

## The problem

The dashboard build (`NODE_OPTIONS=--max-old-space-size=4096 PORT=3000 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build`) is killed with exit code 137 (OOM) at the "rendering chunks" phase.

Root cause: the container has 8 GB total RAM but ~7 GB is consumed by the running workflows (API server, test-dashboard, mobile, website, admin portal etc.). Only ~1 GB is available when post-merge runs. Rollup's chunk rendering needs significantly more than that for a 3329-module SPA.

## What does NOT help

- Raising `--max-old-space-size` past 4096 — the container cannot allocate it; 6144 also fails
- `sourcemap: false` alone — reduces post-build disk usage, not peak render memory
- `reportCompressedSize: false` alone — skips gzip calculation but OOM happens before that
- `minify: false` — minification is not the bottleneck; chunk rendering is
- `manualChunks` — forces Rollup to analyse the full graph; empty chunk warnings indicate hints are ignored
- Running in parallel with existing workflows — there is simply not enough free RAM

## Current mitigations (as of July 2026)

1. **`artifacts/dashboard/vite.config.ts`**:
   - `sourcemap: false`
   - `reportCompressedSize: false`
   - `minify: false`
   - `emptyOutDir: false` ← critical: prevents wiping the working dist if build is killed mid-run
   - `rollupOptions.maxParallelFileOps: 3` ← limits concurrent file I/O to reduce peak RAM

2. **`artifacts/dashboard/src/App.tsx`**:
   - All 110+ page imports converted to `React.lazy()` with a single `<Suspense>` wrapper
   - Reduces Rollup's chunk graph analysis peak memory when/if the build CAN run
   - Also improves runtime performance (pages load on demand)

3. **`scripts/post-merge.sh`**:
   - Build is attempted; if it exits non-zero, `git checkout HEAD -- artifacts/dashboard/dist/` restores the last committed dist
   - Post-merge never fails due to a build OOM; dashboard stays functional (slightly stale content)

4. **`artifacts/dashboard/dist/` is tracked in git**:
   - Committed dist = last working build; restored as fallback

## Long-term fix required

The root cause is that WineryManagementTabs.tsx and LivestockPage.tsx have grown to 500 KB+ each. Rollup holds all source in memory during chunk rendering, and these files dominate the total.

Fix: split these files into smaller sub-components (< 100 KB each). With React.lazy() already in place, each split sub-file becomes its own async chunk, reducing peak memory dramatically.

**Why:** Proxy caching means the dashboard MUST use build+serve mode (content-hashed filenames). Dev mode cannot be used. The build must succeed.

**How to apply:** If a post-merge build fails with exit 137, check which page files are > 200 KB with `wc -c artifacts/dashboard/src/pages/*.tsx | sort -rn | head -10`. Split the largest one by extracting dialog/tab components into separate files under `src/pages/<PageName>/`.
