---
name: Test-dashboard hook crash root causes
description: Documents the two distinct root causes of "Invalid hook call" in test-dashboard and their fixes
---

## Root causes of "Invalid hook call" in test-dashboard

### Cause 1: HMR token mismatch (FIXED — polling in main.tsx)
When a source file is edited while the test-dashboard is running:
- Vite fires `vite:beforeFullReload` → `regenToken()` in reconnectReloadPlugin
- Replit's preview proxy caches old @fs/ module URLs (with old token)
- Browser keeps old-hash React chunk; new modules fetch new-hash React chunk
- Two React instances → "Invalid hook call"

**Fix**: `main.tsx` polls `/__td_startup_token__` every 4s. Token change → full reload.

### Cause 2: Corrupted Vite dep-optimisation cache (FIXED — nuke .vite/deps/)
If the test-dashboard Vite process is interrupted mid-optimisation (crash, forced stop), the `.vite/deps/` pre-bundled chunks can be partially written. Next startup reuses these corrupt chunks. React's internal module registration tables are inconsistent → "Invalid hook call" on FIRST page load (before any edits).

**Symptoms**: Error happens on a completely fresh browser tab (new session, no file edits). `DISCOVERED: []` in `_metadata.json`. Both modules import from the same `react.js?v=HASH` chunk.

**Fix**: Delete `artifacts/test-dashboard/node_modules/.vite/deps/` and restart the workflow. Vite rebuilds the cache cleanly.

**Why:** The reconnectReloadPlugin and `optimizeDeps.include` solve cause 1. Cache nuking solves cause 2. Both are needed.

### Architecture notes
- test-dashboard loads dashboard source via @fs/ paths — fragile but works when cache is clean
- All React-aware packages must be in BOTH `resolve.alias` and `optimizeDeps.include`
- `resolve.dedupe` is set for all React-aware packages as belt-and-suspenders
- Polling interval: 4000ms — enough to catch most file-edit token changes before the user navigates
