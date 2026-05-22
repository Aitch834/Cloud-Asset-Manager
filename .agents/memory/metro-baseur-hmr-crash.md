---
name: Metro baseUrl HMR crash
description: Why experiments.baseUrl in Expo app.json breaks Metro's HMR and causes a crash
---

# Metro baseUrl HMR Crash

## The rule
Never set `experiments.baseUrl` in `artifacts/mobile/app.json` to a path prefix like `/mobile/`. It breaks the Metro HMR WebSocket and causes Metro to crash.

**Why:** Metro's HMR client uses the bundle's `src` URL (from the HTML page) as the entry module path when registering with the HMR WebSocket server. When `baseUrl = "/mobile/"` is set, the bundle URL in the HTML becomes `/mobile/node_modules/.pnpm/expo-router.../entry.bundle`. Metro's HmrServer then tries to resolve `./mobile/node_modules/.pnpm/.../entry` relative to the workspace root — which doesn't exist — and throws an `UnableToResolveError` that crashes the process.

**How to apply:** The `experiments.baseUrl` field is for SPA sub-path hosting in production static exports (e.g. `expo export`). Do NOT use it to try to make Metro's dev server serve from a subpath. The dev server always serves from `/` and the expo subdomain provides the correct URL.

## What was tried (and why it failed)
- HTML rewriting proxy: rewrote `src="/node_modules/..."` to `src="/mobile/node_modules/..."` in Metro HTML responses to route asset requests through the gateway proxy — this caused the HMR crash described above.
- `experiments.baseUrl: "/mobile/"`: added the `transform.baseUrl` query param to bundle URLs, and also triggered the HMR crash when combined with HTML rewriting.
