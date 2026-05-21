---
name: Test-dashboard proxy cache fix
description: Why @fs/ module URLs must be session-stamped in test-dashboard's vite.config.ts, and how the fix works.
---

## The Rule
Every `@fs/` import URL in compiled JS modules served by the test-dashboard Vite dev server must include a per-session `?td=TOKEN` query parameter. The token changes on every server restart.

**Why:** Replit's preview proxy caches module responses by URL. Without session tokens, `@fs/` module URLs are identical across server restarts. A new session's compiled modules embed the NEW `browserHash` (e.g. `react.js?v=B`), but the proxy serves the OLD cached versions of those modules (which embed `?v=A`). The browser ends up with two distinct React instances in the same tab → "Invalid hook call" on any hook-using component (SlurryTab was the original symptom, but it affects all tabs).

**How to apply:** The fix lives entirely in `reconnectReloadPlugin(sessionBase)` in `artifacts/test-dashboard/vite.config.ts`. Three layers:

1. **Response interception** (`configureServer` middleware wrapping `res.end()`): After Vite generates the compiled JS response body, replace every `"BASE@fs/PATH"` string with `"BASE@fs/PATH?td=TOKEN"`. This is the only approach that works — `transform` hook sees TypeScript source code before Vite rewrites relative imports to `@fs/` form; it cannot see the final `@fs/` URLs.

2. **HTML entry-script stamp** (same middleware, applied to `text/html` responses): Rewrites `<script type="module" src="main.tsx">` to `src="main.tsx?td=TOKEN"`, closing the proxy-cache gap at the very start of the module cascade.

3. **URL strip** (same middleware, before other handling): Strips `?td=…` from incoming request URLs so Vite's module graph tracks modules by clean file paths, keeping HMR functional.

## What Does NOT Work

- **`transform` hook**: Vite calls this with the original TypeScript/JS source, before it rewrites relative imports (`../../dashboard/src/App`) to absolute `@fs/` form. The `@fs/` URLs are never present in the transform input.
- **`transformIndexHtml` hook with `enforce: "post"`**: Inconsistent ordering behaviour in Vite 7; the hook did not run after Vite's base-path injection in practice.

## Important Details

- The `fsUrlRe` regex requires the full base path (e.g. `/test-dashboard/@fs/`) to avoid accidentally stamping HMR `createHotContext("/@fs/…")` strings which do NOT include the base path.
- `res.removeHeader("content-length")` must be called after modifying the body, or the browser receives a truncated response.
- The existing startup-token check (`/__td_startup_token__` + `vite:ws:connect` reload in `main.tsx`) is preserved as a belt-and-suspenders for connected browsers that were open during a server restart.
