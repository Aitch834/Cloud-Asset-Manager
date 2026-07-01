---
name: Test-dashboard Vite deps cache — persistent "Invalid hook call" fix
description: Complete root cause and all fix layers for recurring "Invalid hook call" on any tab in the test-dashboard. There are TWO distinct causes — proxy stale-cache AND in-memory transform-cache staleness — both must be addressed.
---

## The TWO root causes (both must be fixed)

### Cause A — Replit proxy caches dep chunks by path, ignoring ?v=HASH
Replit's preview proxy caches responses keyed on URL PATH only (query params stripped).
Vite's dep-serving sets `Cache-Control: max-age=31536000,immutable` on pre-bundled
dep chunks. The proxy caches them as `node_modules/.vite/deps/chunk-XXX.js` (path key).
When the browserHash changes across sessions/restarts, fresh source files reference NEW
dep-chunk hash URLs, but the proxy serves the OLD cached content from the previous hash.
Two different react.js instances in the browser → "Invalid hook call".

### Cause B — Vite's in-memory transform cache retains stale dep-chunk URL references
When Vite re-optimises deps MID-SESSION (triggered by discovering a new dep at runtime),
the browserHash changes. But Vite's in-memory transform cache still holds the previously
compiled output of every source file (.tsx → .js), with the OLD ?v=HASH baked into every
dep-chunk import URL. When the browser reloads after the full-reload event, Vite serves
the STALE transforms (old hash) alongside newly-compiled dep chunks (new hash) → two
different react.js URLs in the browser (different modules) → "Invalid hook call" on
whichever component renders next.

## Fix layers implemented in vite.config.ts (reconnectReloadPlugin)

### Layer 0 — intercept res.setHeader to force Cache-Control: no-store on all module responses
Prevents Vite's sirv from overwriting our header with max-age=immutable.
Targets URLs containing `/.vite/deps/`, `/@fs/`, `/@td/`, `/node_modules/`, or `/src/`.

### Layer 1 — path-based session token on source files (@fs/ URLs)
Every @fs/ source-file URL embedded in compiled JS is rewritten to include SESSION TOKEN
in the PATH:  `/base/@fs/path`  →  `/base/@td/TOKEN/@fs/path`
Proxy sees a different path each session → cache miss → always fresh.

### Layer 1b — path-based session token on dep chunks (.vite/deps/ URLs) — STRIP ?v=HASH
Absolute dep-chunk URLs embedded in compiled source files are rewritten:
  `/base/node_modules/.vite/deps/react.js?v=HASH`  →  `/base/@td/TOKEN/deps/react.js`
CRITICAL: ?v=HASH is STRIPPED (not just the prefix replaced). Why: dep chunks use RELATIVE
imports internally without ?v= (e.g. `import "./chunk-KC53NVYV.js"`), which the browser
resolves to `/base/@td/TOKEN/deps/chunk-KC53NVYV.js` (no ?v=). If source files kept
`?v=HASH`, the browser's ES module registry would see two DIFFERENT module identities for
the same React → two React instances → "Invalid hook call".
Stripping ?v= unifies module identity between source-file imports and dep-chunk relative imports.
Regex: `"BASE/node_modules/.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`  (group 1 = bare filename)
Replacement: `"BASE/@td/TOKEN/deps/${filename}"`

### Layer 2 — entry-script path token in index.html
The `<script type="module" src="...">` entry point is also rewritten with the session token.

### Layer 3 — startup-token endpoint (server-restart detection)
Client (main.tsx) fetches `/__td_startup_token__` on vite:ws:connect; if token changed
since last load, reloads the page before stale hashes can mix.

### Layer 4 — moduleGraph.invalidateAll() on full-reload + token regen (FIX FOR CAUSE B)
When Vite fires a full-reload event (dep re-optimisation changed the browserHash mid-session),
the plugin calls invalidateAll() BEFORE regenerating the session token. This flushes Vite's
in-memory transform cache. The browser reloads → fetches source files with the new session
token → Vite re-transforms them fresh → embeds the CURRENT browserHash in dep-chunk URLs →
single consistent React instance.

CRITICAL — VITE 7 API CHANGE: `server.moduleGraph.invalidateAll()` is a COMPATIBILITY SHIM
in Vite 7 that SILENTLY NO-OPS. Vite 7 has a per-environment module graph:
  for (const env of Object.values(server.environments)) {
    env.moduleGraph.invalidateAll();
  }
This is confirmed by Vite 7 dist (config.js): `for (const environment of Object.values(server.environments)) environment.moduleGraph.invalidateAll()`
The optional-chaining form `server.moduleGraph?.invalidateAll?.()` always succeeded silently,
meaning the stale transform cache was NEVER flushed — root cause of persistent "Invalid hook call".

## Infrastructure
- `dev` script clears `node_modules/.vite` on every startup (already in package.json).
  This handles the cold-start case; Layer 4 handles the mid-session case.

## How to diagnose if the error reappears
1. Check the error component stack for dep chunk URL (e.g. `chunk-TUKGDGPK.js?v=HASH`).
2. Check `artifacts/test-dashboard/node_modules/.vite/deps/_metadata.json` → `browserHash`.
3. If the error's hash ≠ _metadata.json hash: Cause A or B — stale content.
4. Verify all 5 fix layers are present in `reconnectReloadPlugin` in `vite.config.ts`.
5. Restart the workflow (clears `.vite` and the in-memory transform cache).

## Inlining rule — small @fs/ components that get proxy-cached

Small @fs/ files (<500KB) CAN still be proxy-cached with stale dep hashes even with
Layers 0-4 in place, because Replit's proxy may normalise away the @td/TOKEN path segment.

**Fix:** inline the small component's code directly into the large page file (>500KB).
DairyPage.tsx is >500KB (Babel deoptimised) and exceeds Replit's proxy cache limit;
the proxy always serves it fresh. Code inlined into it is never independently cached.

**Components inlined into DairyPage.tsx** (do NOT extract back to separate files):
- `AbrProcurementSection` — inlined to prevent sibling proxy-cache issue
- `DairyEnterpriseReport` — inlined (enterprise report, too small on its own)
- `JohnesTab` — inlined at bottom of DairyPage.tsx; confirmed fixes "Invalid hook call"
  - Previously extracted to its own file (commit 4663f4a) which solved a React Refresh
    counter mismatch, but then the small-file proxy caching caused the error to return.
  - Layer 4 (per-environment invalidateAll) now correctly flushes the transform cache,
    so the counter mismatch no longer occurs → inlining is safe and is the correct fix.
  - Helper functions renamed: `johnesFmtDate`, `johnesRiskLabel`, `johnesTypeLabel`
    (to avoid potential collisions with future functions in the same file).

## What NOT to do
- Do NOT look for a hooks violation in the component source — the component code is correct.
- Do NOT add `optimizeDeps.force:true` — it re-hashes chunks on every restart, making
  the proxy caching problem worse.
- Do NOT extract JohnesTab (or the other inlined components) back into separate small files —
  small files get proxy-cached and the error returns.
