---
name: Replit proxy cache — dashboard fix
description: Replit's proxy layer ignores Cache-Control headers and caches JS files by URL. Vite dev mode serves files at fixed URLs so the only reliable fix is build+serve mode (content-hashed filenames).
---

## The problem

Replit's preview proxy caches Vite module responses keyed on URL path, ignoring `Cache-Control: no-store`. In Vite **dev mode**, source files are served at fixed URLs (e.g. `/dashboard/src/components/layout/Sidebar.tsx`). Even after:
- hard refresh
- clearing `node_modules/.vite`
- restarting the workflow

…the proxy still returns the stale cached version of those fixed URLs. Users see old UI despite correct code on disk.

## The fix (confirmed working)

Switch the dashboard from Vite dev mode to **build + serve mode**.

`artifacts/dashboard/package.json` `dev` script:
```
"dev": "vite build --config vite.config.ts && vite preview --config vite.config.ts --host 0.0.0.0"
```

The workflow command `pnpm --filter @workspace/dashboard run dev` runs a full production build then `vite preview`. Content-hashed filenames (e.g. `index-CFJPqgUu.js`) mean every restart produces new URLs → proxy must fetch fresh.

**Why it works:** Proxy cache key is the URL. New content hash = new URL = guaranteed cache miss.

## How to apply

- Any dashboard code change now requires a workflow restart (~25s build) — HMR is gone but stale cache is also gone permanently.
- The `test-dashboard` uses the same pattern: `pnpm run build && pnpm run serve`.
- Do NOT revert to `vite --host 0.0.0.0` dev mode — proxy caching will immediately return.

## What does NOT work

- `server.headers: { "Cache-Control": "no-store" }` alone — proxy ignores it
- Clearing `node_modules/.vite` — only clears Vite's internal dep cache, not the proxy's URL cache
- Session-token / startup-token plugins that only change the HTML entry point — downstream module URLs remain fixed and cached
- Hard refresh / private window — cache is proxy-side, not browser-side
