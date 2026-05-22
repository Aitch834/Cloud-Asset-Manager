---
name: SlurryTab Invalid Hook Call Fix
description: Root cause and definitive fix for "Invalid hook call" on SlurryTab in test-dashboard on every fresh page load.
---

# Root Cause

Two distinct copies of `react.js?v=<hash>` end up in the browser's ES-module registry simultaneously:

1. **Stale registry copy**: `EnvironmentalPageFull.tsx` is already in the browser's module registry with old dep-chunk hashes (from a previous HMR cycle or server restart).
2. **Fresh fetch**: `SlurryTab.tsx` (the only tab in a separate file) is fetched fresh with new dep-chunk hashes → different `react.js?v=` chunk → React's hook-call validator sees two React instances → "Invalid hook call".

All other tabs in `EnvironmentalPageFull` are **inline** in the same file — they always share the same React chunk. `SlurryTab` was the only externally-imported tab component.

# Definitive Fix (applied)

**Inline `SlurryTab`'s entire body directly into `EnvironmentalPageFull.tsx`.**

- Deleted `artifacts/dashboard/src/pages/SlurryTab.tsx`
- Removed `import { SlurryTab } from "./SlurryTab"` from `EnvironmentalPageFull.tsx`
- Appended all non-import content of SlurryTab (lines 26–1523) into `EnvironmentalPageFull.tsx`, removing the `export` keyword from the function declaration
- Result: `EnvironmentalPageFull.tsx` is now 3818 lines with `function SlurryTab` at line 2514 — same file, same module, same React chunk — no possible version split

**Why:** This eliminates the cross-file module boundary entirely. No matter how many times the Vite server restarts or HMR cycles occur, there is only one file to fetch, so there can only ever be one React chunk version in play.

# Other Approaches (do NOT use — they don't fix the root cause)

- Nuking `.vite/deps/` cache: temporarily works but returns after next server restart
- Adding to `optimizeDeps.include`: reduces frequency but doesn't eliminate the race
- The polling startup token in `test-dashboard/main.tsx`: protects against stale *page* loads but not stale *module registry* entries

# Pattern to Avoid Going Forward

Never split a React component out of its parent page file when:
- The parent is a large page-level component already in the module registry
- The child uses hooks from the same React instance
- The split would create a separate Vite module chunk

If a file gets too large, prefer keeping related hook-using components in the same file, or use a shared library chunk (via `manualChunks`) that is stable across server restarts.
