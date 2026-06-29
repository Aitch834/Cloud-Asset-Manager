---
name: Test-dashboard Vite deps cache — persistent "Invalid hook call" fix
description: Root cause and permanent fix for recurring "Invalid hook call" on any tab in the test-dashboard caused by stale dep chunks served from Replit's proxy cache.
---

## Rule
The test-dashboard's `dev` script MUST clear `node_modules/.vite` on every startup
(already in `package.json`), AND `vite.config.ts` MUST intercept `res.setHeader` in
the custom middleware to prevent Vite from writing `Cache-Control: max-age=31536000,immutable`
on dep-chunk responses.

## Why (full root cause)

Replit's preview proxy caches responses keyed on URL PATH only — query-string
parameters are stripped from the cache key.

Vite's internal dep-serving (`sirv`) sets `Cache-Control: max-age=31536000,immutable`
on all pre-bundled dep chunks (e.g. `node_modules/.vite/deps/react.js?v=BROWSERHASH`).
The Vite config's `server.headers: { "Cache-Control": "no-store" }` is set BEFORE
Vite's own middlewares run, so sirv OVERRIDES it with `max-age=immutable`.

Result: the proxy caches dep chunks under their path (`react.js`, `chunk-TUKGDGPK.js`,
etc.) ignoring `?v=HASH`. Across sessions (or after any mid-session re-optimisation
that changes the browserHash), the proxy serves STALE chunks with the old hash.
Source files are fresh (our Layer-1 session-token prevents source caching), but they
reference dep chunks by the NEW hash while the proxy serves OLD ones.

Two different React instances end up in the same tab → "Invalid hook call" on
whichever component renders next (observed: JohnesTab, CompliancePage, FlocksTab,
SlurryTab — always whichever tab the user clicked).

## Fix (Layer 0 in vite.config.ts)

In `reconnectReloadPlugin`, at the very start of the `server.middlewares.use` handler,
intercept `res.setHeader` for all module-like URLs BEFORE Vite sees the request:

```javascript
const isModuleUrl =
  rawUrl.includes("/.vite/deps/") ||
  rawUrl.includes("/@fs/") ||
  rawUrl.includes("/@td/") ||
  rawUrl.includes("/node_modules/") ||
  /\/src\/[^?]+\.(tsx?|jsx?|js)/.test(rawUrl);

if (isModuleUrl) {
  const origSet = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    if (name.toLowerCase() === "cache-control") return origSet("Cache-Control", "no-store");
    return origSet(name, value);
  };
  res.setHeader("Cache-Control", "no-store");
}
```

This prevents sirv from ever writing `max-age=immutable`. The proxy sees `no-store`
and always forwards dep-chunk requests to Vite, which always returns the CURRENT hash.

## How to apply if the error reappears
1. Do NOT look for a hooks violation in the component source — the code is correct.
2. Check that Layer 0 (the `isModuleUrl` / `res.setHeader` override) is present in
   `artifacts/test-dashboard/vite.config.ts` inside `reconnectReloadPlugin`.
3. If it is missing, re-add it before the `── 1. Strip session token` block.
4. Restart the test-dashboard workflow.

The `dev` script already clears `node_modules/.vite` on every startup — keep that.
