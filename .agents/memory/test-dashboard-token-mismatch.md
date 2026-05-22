---
name: Test-dashboard "Invalid hook call" root cause and fix
description: Why SlurryTab (and any tab) crashes with two-React-copies, and the definitive fix in vite.config.ts
---

# Root cause

Replit's preview proxy caches module responses by URL, ignoring `Cache-Control: no-store`.
Two URL families matter:

**a) `@fs/` source files** — these are session-stamped with `?td=TOKEN` (token changes each restart).
The proxy can never serve a stale source file because the URL is unique per session. ✅ Fixed.

**b) Pre-bundled dep chunk URLs** (`/test-dashboard/node_modules/.vite/deps/react.js?v=HASH`) —
the `?v=HASH` is stable across restarts when deps/lockfile don't change. Without per-session
stamping, the proxy can serve a stale dep chunk from a prior session that was compiled against
a different React version (or a different internal state). This causes two React instances →
"Invalid hook call" specifically on the first hook-heavy tab rendered fresh after a restart.

# Why only SlurryTab?

SlurryTab was the last tab rendered (rendered only when `tab === "slurry"`). All other tabs
were rendered and their dep chunks loaded/cached during the initial page load.  SlurryTab's
first hook call (`useQueryClient`) hits the stale dep chunk's React copy → crash.

Even after inlining SlurryTab into EnvironmentalPageFull.tsx (eliminating the file-boundary),
the crash persisted because the problem was not file separation — it was dep chunk caching.

# Fix (in artifacts/test-dashboard/vite.config.ts)

Three changes to `reconnectReloadPlugin`:

1. **Added `depUrlRe`** — a regex matching `"/base/node_modules/.vite/deps/pkg.js?v=HASH"` strings
   inside compiled JS response bodies. Group 1 captures the full URL including `?v=HASH`.

2. **Updated `isJsModule`** to also intercept dep chunk request URLs
   (`url.includes("node_modules/.vite/deps/")`). This ensures the dep chunk RESPONSES
   are also intercepted, so their internal cross-references to other dep chunks are stamped too.

3. **Updated JS transform** to apply both stamps:
   - `@fs/` URLs: replaced with `"$1?td=TOKEN"` (strips old params, adds token)
   - Dep chunk URLs: replaced with `"$1&td=TOKEN"` (appends to existing `?v=HASH`)

The strip middleware already handles `&td=TOKEN` removal (`replace(/[?&]td=[^&]*/g, "")`),
so Vite sees clean URLs and module-graph tracking is unaffected.

**Why:**
- Appending `&td=TOKEN` to `?v=HASH` preserves Vite's chunk-invalidation logic
- Every session's dep chunk URLs are now unique → proxy has never cached them → fresh serve
- The full module chain is stamped: HTML entry → source files → dep chunks → dep chunk cross-refs
