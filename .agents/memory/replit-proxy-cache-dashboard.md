---
name: Replit proxy cache — dashboard vite.config fix
description: Replit's preview proxy caches module responses by URL path, ignoring Cache-Control headers. Fix applied to main dashboard vite.config.ts.
---

## The problem

Replit's preview proxy (`.replit.dev`) caches Vite module responses keyed on URL PATH only. It ignores `Cache-Control: no-store` headers. This means:
- Code changes to source files are invisible to external browsers even after hard refresh or in private windows
- `curl localhost:PORT/file` returns correct fresh content (bypasses proxy)
- Browser through `.replit.dev` gets stale proxy-cached content

Symptoms: user sees old UI (e.g. 7 tabs instead of 8) despite confirmed correct source on disk. Even private/incognito windows show old content.

**Why:** The proxy, not the browser, is the cache layer. Browser cache-clearing has no effect.

## The fix (applied to `artifacts/dashboard/vite.config.ts`)

Added `sessionCacheBustPlugin(basePath)` — modelled on the proven test-dashboard mechanism:

1. **Per-session token** generated at Vite startup (`Date.now().toString(36) + random`)
2. **Middleware Layer 1**: intercepts `res.setHeader` and `res.writeHead` to force `Cache-Control: no-store` on ALL responses (overrides Vite's `max-age=immutable` on dep chunks)
3. **Middleware Layer 2**: rewrites `@fs/` source-file URLs embedded in compiled JS to include the session token in the PATH: `/@td/TOKEN/@xfs-TOKEN/file` → proxy cache miss every session
4. **Middleware Layer 3**: rewrites dep-chunk URLs similarly: `/@td/TOKEN/@deps-TOKEN/chunk.js`
5. **Startup token endpoint** `/__startup_token__` returns current session token as JSON
6. **`main.tsx`**: fetches `/__startup_token__` on `vite:ws:connect`; if token changed since last check, calls `window.location.reload()` to force fresh module fetch

**Why it works:** The proxy cache key is the URL path. New session = new token = new path = guaranteed cache miss = Vite always serves current source.

## How to apply

If the dashboard vite.config ever loses this plugin (e.g. after a merge), re-add `sessionCacheBustPlugin` and the `main.tsx` startup token check. The test-dashboard's `vite.config.ts` is the authoritative reference implementation.

## What NOT to do

- Do NOT rely on `server.headers: { "Cache-Control": "no-store" }` alone — the proxy ignores it
- Do NOT clear `node_modules/.vite` expecting it to fix proxy-cached source files — that only helps dep pre-bundling
- Do NOT advise hard refresh or private window as a fix — the cache is proxy-side, not browser-side
