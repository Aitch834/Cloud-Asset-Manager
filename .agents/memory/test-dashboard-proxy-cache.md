---
name: Test-dashboard proxy cache fix
description: Why @fs/ module URLs must be session-stamped in test-dashboard's vite.config.ts, and how the four-layer fix works.
---

## The Rule
Every `@fs/` import URL in compiled JS modules served by the test-dashboard Vite dev server must include a per-session `?td=TOKEN` query parameter. The token changes on every server restart **and** on every Vite-triggered full-reload (dep re-optimisation).

**Why:** Replit's preview proxy caches module responses by URL. Without session tokens, `@fs/` module URLs are identical across sessions. A new session's compiled modules embed the NEW `browserHash` (e.g. `react.js?v=B`), but the proxy serves OLD cached versions (which embed `?v=A`). Two distinct React instances coexist → "Invalid hook call".

The same problem occurs mid-session: Vite can run a second dep-optimisation pass within the same server process (visible as a double-connect in the browser console). The `browserHash` changes. Newly-extracted source files (e.g. SlurryTab.tsx, which have no proxy cache entry) get compiled fresh with the NEW hash. All other modules served from proxy cache keep the OLD hash. SlurryTab fails; inline tabs in the same proxy-cached module still work.

**How to apply:** The fix lives in `reconnectReloadPlugin(sessionBase)` in `artifacts/test-dashboard/vite.config.ts`. Four layers:

1. **Response interception** (`configureServer` middleware wrapping `res.end()`): Replaces every `"BASE@fs/PATH"` in compiled JS responses with `"BASE@fs/PATH?td=TOKEN"`. This is the only viable approach — the `transform` hook sees TypeScript source before Vite rewrites imports to `@fs/` form, so `@fs/` URLs never appear there.

2. **HTML entry-script stamp** (same middleware, `text/html` responses): Rewrites `<script type="module" src="main.tsx">` to include `?td=TOKEN`.

3. **URL strip** (same middleware, before other handling): Strips `?td=…` from incoming request URLs so Vite's module graph tracks modules by clean file paths.

4. **In-session re-optimisation reload** (`configureServer` wraps `server.hot.send` + `server.ws.send`): When Vite fires a `full-reload` event (dep re-opt within the same process), `sessionToken` is regenerated server-side BEFORE the payload reaches the browser. The browser reloads (Vite's own reload); then `checkServerToken()` in `main.tsx` detects the new token ≠ stored and reloads once more. That second reload uses new token URLs the proxy has never cached → single consistent React instance. `sessionToken` must be `let` (not `const`) for this to work.

## What Does NOT Work

- **`transform` hook**: Called with TypeScript source before `@fs/` rewrites — can't see the final import URLs.
- **`transformIndexHtml` with `enforce: "post"`**: Inconsistent ordering in Vite 7; did not reliably run after base-path injection.

## Important Details

- The `fsUrlRe` regex requires the full base path (e.g. `/test-dashboard/@fs/`) to avoid stamping HMR `createHotContext("/@fs/…")` strings.
- `res.removeHeader("content-length")` must be called after body modification or the browser receives a truncated response.
- `force: true` in `optimizeDeps` was deliberately removed — it re-hashes on every restart, making old proxy cache entries with different hashes collide. Hash stability (`3f7634eb`) depends on having all 59 packages in `optimizeDeps.include`.
- Any new npm package used in the dashboard source must be added to `optimizeDeps.include` to keep the hash stable.
