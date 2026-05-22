---
name: Test-dashboard token mismatch → Invalid hook call
description: Why SlurryTab (and others) crash with "Invalid hook call" in the user's external browser but not through the internal proxy, and how it's fixed.
---

## The rule
Any source-file edit during a live session can trigger `vite:beforeFullReload` → `regenToken()` in the `reconnectReloadPlugin`. If the user's HMR WebSocket is broken (common through the Replit external proxy), no automatic page reload fires. The browser then holds a mix of old-browserHash and new-browserHash pre-bundled chunks (e.g. `react.js?v=OLD` already in memory, `@tanstack/react-query.js?v=NEW` freshly fetched). These two hash variants carry different `ReactCurrentDispatcher` references → "Invalid hook call" on whichever component renders next (historically SlurryTab, because EnvironmentalPageFull is the largest page and is usually the first one touched mid-session).

**Why:** The Replit external proxy tunnels HTTP correctly but WebSocket connections are unreliable/dropped, so the HMR channel the plugin relies on to signal a reload doesn't reach the user's browser.

**How to apply:**
1. `main.tsx` now polls `/__td_startup_token__` every **4 seconds** via `setInterval`. If the token changes the page auto-reloads. This is the primary safety net.
2. `vite:ws:connect` still calls `checkServerToken` immediately on reconnect (belt-and-suspenders).
3. All 59 deps are in `optimizeDeps.include` so no *new* dep discovery should happen (which would also change the browserHash). If a future dep causes the crash again, add it to the include list AND the resolve.alias list in `artifacts/test-dashboard/vite.config.ts`.
4. The `Cache-Control: no-store` header prevents the browser caching stale chunk URLs.

## Key files
- `artifacts/test-dashboard/src/main.tsx` — token polling lives here
- `artifacts/test-dashboard/vite.config.ts` — reconnectReloadPlugin, alias list, optimizeDeps.include
