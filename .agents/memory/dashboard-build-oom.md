---
name: Dashboard build memory baseline
description: Current dashboard production-build memory baseline, serial build policy, and fallback guidance if Rollup OOMs recur.
---

## Current baseline (September 2026)

The dashboard production build now completes reliably after the largest page
modules were split into smaller lazy-loaded chunks. The package build keeps
`NODE_OPTIONS=--max-old-space-size=4096`; no workflow-killing or special
dashboard-only build sequence is required on the current runner baseline.

`scripts/build-prod.sh` runs the API server, website, admin portal, and
dashboard serially. The serial order avoids making the frontend builds compete
for memory and is the required local production-build check.

## Historical problem

The dashboard build previously exited 137 during Rollup's chunk-rendering
phase when an 8 GB runner had roughly 1 GB free while all workflows were
running. The source has since been split substantially, and the dashboard is
now included in `scripts/build-prod.sh`.

## What does NOT help

- Raising `--max-old-space-size` past 4096 — the container cannot allocate it; 6144 also fails
- `sourcemap: false` alone — reduces post-build disk usage, not peak render memory
- `reportCompressedSize: false` alone — skips gzip calculation but OOM happens before that
- `minify: false` — minification is not the bottleneck; chunk rendering is
- `manualChunks` — forces Rollup to analyse the full graph; empty chunk warnings indicate hints are ignored
- Running in parallel with existing workflows — there is simply not enough free RAM

## Dashboard build safeguards

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
   - Does not attempt a production build
   - `git checkout HEAD -- artifacts/dashboard/dist/` restores the tracked dist as a safety net

4. **`artifacts/dashboard/dist/` is tracked in git**:
   - Committed dist = last working build; restored as fallback

## Update (Aug 2026)

WineryManagementTabs.tsx was split into `src/pages/winery/` modules (shared.tsx, print.tsx, BatchTrail.tsx, one file per tab) with WineryManagementTabs.tsx as an `export *` barrel; the build now completes in ~36s with no memory flag. Dairy, Fields, Poultry, and livestock/MortalitySection have since been split the same way (per-tab dirs `dairy/`, `fields/`, `poultry/`, `livestock/mortality/`, originals kept as barrels); build ~42s. Remaining oversized chunks: VineyardBlockMapTab (~1.29 MB, leaflet-heavy), index (~1.15 MB), generateCategoricalChart (~805 KB recharts) — vendor-dominated, split only if OOM recurs.

Lesson from the Dairy/Poultry split: when subagents split a shared.tsx mechanically, check for duplicated `export const` blocks (`grep '^export const' shared.tsx | sort | uniq -d`) — esbuild only fails at build time, tsc may pass late. Also note DairyPage intentionally keeps an inlined copy of AbrProcurementSection (proxy-cache workaround) as `dairy/DairyAbrProcurementSection.tsx`, separate from `dairy/AbrProcurementSection.tsx` used by other dairy pages — not an accidental duplicate.

## If OOM recurs

Do not loop on parallel retries. Confirm available memory, ensure
`NODE_ENV=production` is set, and run one dashboard build serially with the
package's 4096 MB heap limit. If the runner is under workflow pressure, stop
competing workflows before retrying and restart them afterward. Check the
largest page sources with:

`wc -c artifacts/dashboard/src/pages/*.tsx | sort -rn | head -10`

Keep the tracked `artifacts/dashboard/dist/` fallback intact while diagnosing.
