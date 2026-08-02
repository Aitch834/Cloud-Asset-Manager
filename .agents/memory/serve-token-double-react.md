---
name: serve.mjs ?v= asset token caused double React (error #321)
description: Why appending a cache-bust query to content-hashed JS entry URLs breaks a code-split bundle, and the correct cache strategy for the dashboard serve layer.
---

## The rule
Never append a `?v=<token>` query string to Vite's content-hashed JS asset URLs in served HTML. The lazy chunks import the shared bundle by its plain filename (`./index-<hash>.js`), so a tokenised entry URL makes the browser evaluate the SAME file twice as two distinct ES modules → two React/zustand instances → minified React error #321 (invalid hook call) on every page load, plus `removeChild` NotFoundError from the error boundary.

**Why:** The dashboard `serve.mjs` rewrote `src/href` of `.js/.css` in index.html to add `?v=<startupToken>` for proxy cache-busting. Content hashes already change per rebuild, so this was redundant AND harmful.

**How to apply:** Cache-busting layers that are safe: (1) content-hashed filenames from the build, (2) the inline `?_v=` HTML redirect script, (3) no-store headers + HTML padding. Keep asset URLs untouched. Diagnostic tell in a #321 stack: the same bundle appears both with and without a query string.

## Related fix
Winery/viticulture farm-name lookups called a nonexistent `GET /api/farms` (404 on every load). The real endpoint is `GET /api/tenants/current/farms` returning `{ farms }` (not `{ records }`); all `["farms-list"]` queries must share that shape.
