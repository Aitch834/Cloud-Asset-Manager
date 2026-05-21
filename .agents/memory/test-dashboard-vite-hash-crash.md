---
name: test-dashboard Vite hash crash
description: Root cause and fix for "Invalid hook call" crash on SlurryTab (and any tab) in the test-dashboard — two React instances from mismatched dep-bundle browserHash values.
---

## The Crash
"Invalid hook call" at `useQueryClient()` in SlurryTab (EnvironmentalPageFull.tsx).
Happens when navigating from other pages; direct URL load works fine.

## Root Cause
When the Vite dep cache is invalidated (vite.config.ts change, fresh build, cache clear):
1. Initial optimisation writes `browserHash A` to disk (`_metadata.json`).
2. A second optimisation pass (Vite discovers transitive deps) produces `browserHash B` in memory — disk NOT updated.
3. If the browser was connected and loaded modules with hash A, it reconnects after the server restart but **keeps hash-A modules in its JS module graph** (no full page reload).
4. New navigations trigger new module fetches with hash B.
5. `react.js?v=A` (already loaded) ≠ `react.js?v=B` (new) → two React instances → crash.

## Confirming the Divergence
```bash
# check disk hash
python3 -c "import json; d=json.load(open('.vite/deps/_metadata.json')); print(d['browserHash'])"
# check served hash
curl -s http://localhost:PORT/BASE/src/main.tsx | grep -o '?v=[a-f0-9]*' | head -1
# test if disk hash is live
curl -o /dev/null -w "%{http_code}" http://localhost:PORT/BASE/node_modules/.vite/deps/react.js?v=HASH
# 200 = live hash, 504 = stale hash
```

## Fix — reconnect-reload plugin
Two files:
- `artifacts/test-dashboard/vite.config.ts` — `reconnectReloadPlugin()` exposes `/__td_startup_token__` HTTP endpoint returning a per-startup JSON token.
- `artifacts/test-dashboard/src/main.tsx` — on `vite:ws:connect` event, fetches the endpoint; if token changed vs sessionStorage, calls `location.reload()`.

This guarantees a full page reload on every server restart, clearing the JS module graph and ensuring all chunks load with the same consistent hash.

## Why the Stable-Cache Case Works
With a valid dep cache (no config change), Vite reuses the cache → same `browserHash` every restart → no divergence → no crash even without the plugin. But the plugin provides safety for config changes.

**Why:** `_metadata.json` is written once per startup (initial optimisation). Mid-startup re-optimisations update the in-memory hash but NOT the disk file. So disk ≠ served is a reliable indicator of a second-pass re-optimisation.
