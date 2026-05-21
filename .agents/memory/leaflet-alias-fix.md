---
name: Vite browserHash crash pattern — test-dashboard
description: Why every runtime-discovered package must be in BOTH resolve.alias AND optimizeDeps.include in test-dashboard/vite.config.ts, or any late discovery crashes SlurryTab (and others) with "Invalid hook call"
---

## The crash mechanism

When Vite discovers ANY new dep mid-render it increments the global `browserHash`.
Every pre-bundled chunk URL carries that hash (e.g. `react.js?v=<browserHash>`).
Modules already in memory hold references to the OLD hash URL; newly-loaded modules
fetch the NEW hash URL. For a brief window there are two distinct React instances
in the same tab → "Invalid hook call" on whichever component is currently rendering.

## The rule

**Every package that Vite has ever discovered at runtime** (check
`node_modules/.vite/deps/_metadata.json` — packages listed under "optimized" but
absent from the explicit `include` list in vite.config.ts) MUST be added to:
1. `resolve.alias` — so Vite can find it (packages only in dashboard/node_modules
   need `path.resolve(…, "../dashboard/node_modules/<pkg>")`; packages in
   test-dashboard's own node_modules can use the `td()` helper)
2. `optimizeDeps.include` — so Vite pre-bundles it at startup before any render
3. `resolve.dedupe` — for React-aware packages only

**Why:** without both alias + include, `include` silently fails (Vite can't resolve
the package name from test-dashboard's context), so the package remains undiscovered
until a page that uses it is first visited. That first visit triggers a
re-optimisation, changes the browserHash, and corrupts all in-flight renders.

## Packages fixed

All 9 packages that were previously runtime-discovered are now in alias + include:
- `leaflet` (dashboard only) — discovered via StorageLocationMapPicker dynamic import
- `recharts` (both) — used by chart.tsx → report pages
- `cmdk` (both) — used by command.tsx
- `qrcode.react` (dashboard only) — used by Fields, Equipment, Storage pages
- `jspdf` + `jspdf-autotable` (dashboard only) — used by print functions
- `class-variance-authority`, `clsx`, `tailwind-merge` (both) — shadcn utilities

## How to detect future issues

If a new "Invalid hook call" appears on a specific tab, check _metadata.json for
any newly-discovered packages (present in "optimized" but not in the explicit
`include` list). Add them following this pattern.
