---
name: Test-dashboard Vite deps cache — persistent "Invalid hook call" fix
description: Root cause and permanent fix for recurring "Invalid hook call" on CompliancePage in the test-dashboard.
---

## Rule
The test-dashboard's `dev` script MUST clear `node_modules/.vite` on every startup.
This is already implemented in `package.json`.

## Why
Replit's preview proxy caches JS module responses. Large files (>~500 KB compiled,
e.g. CompliancePage.tsx at 2,690 lines) exceed the proxy's per-entry limit and are
always fetched fresh from Vite with the **current** `browserHash`. Small files
(AppLayout, TabBar, etc.) are served from proxy cache with the **old** `browserHash`.

When hashes differ — after any dep re-optimisation — the browser ends up with:
- fresh CompliancePage → `react.js?v=NEW`
- cached small deps  → `react.js?v=OLD`

Two React instances → React's dispatcher is per-instance → any hook call from a
component compiled against OLD React, while being rendered by NEW React's fiber,
throws `"Invalid hook call"`. The error surfaces at the first JSX child in
CompliancePage's return (line 936) because that is where inter-instance interaction
first occurs.

## How to apply
If this error reappears after a future session, do NOT look for a hooks violation in
CompliancePage source code — the code is correct. Run:
  `rm -rf artifacts/test-dashboard/node_modules/.vite && restart workflow`

The `dev` script already does this automatically on every startup via:
  `node -e "...rmSync('node_modules/.vite')..." && vite --config ...`

The existing 4-layer session-token mechanism in `vite.config.ts` handles
cross-session proxy cache busting; within-session consistency from the fresh cache
is all that's needed.
