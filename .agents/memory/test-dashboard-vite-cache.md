---
name: Test-dashboard production build — all fix layers
description: Complete history of proxy-cache and crash fixes for the test-dashboard (production build mode).
---

## Summary of all fix layers applied

### Layer 1 — Production build (vite build + vite preview)
Switch from `vite dev` to `pnpm run build && pnpm run serve` eliminated the "Invalid hook call" caused by the Replit proxy caching different browserHash dep-chunk URLs that produced two React instances.

### Layer 2 — @clerk/react bypass shim (FINAL FIX for `{}` crash)
**Problem:** `@clerk/react` was a static import in `App.tsx` and `use-safe-clerk.ts`. Even with `<ClerkProvider>` not rendered, Clerk's module-level code (async session polling) ran and threw a plain `{}` object into the React render tree ~20 seconds after page load, crashing the ErrorBoundary.

**Fix:** In `artifacts/test-dashboard/vite.config.ts`, added a Vite `resolve.alias` entry:
```
{ find: "@clerk/react", replacement: path.resolve(import.meta.dirname, "./src/clerk-bypass.ts") }
```
`src/clerk-bypass.ts` exports no-op stubs for `ClerkProvider`, `useClerk`, `useAuth`, `useUser`, `SignIn`, `SignUp`.

**Why:** Static imports always evaluate the module regardless of whether the exports are used (even with tree-shaking). A Vite alias replaces the module at bundle time, so zero Clerk code enters the production bundle.

### Layer 3 — Remove SW registration from index.html
The SW register + `ready.then(reload)` block caused a `window.location.reload()` ~20s after first visit or hard refresh, compounding the Clerk crash timing. Replaced with a simple SW unregister call to clean up old SWs from dev sessions.

## Architecture invariant
The test-dashboard **always** runs in `VITE_DEV_BYPASS_AUTH=true` mode. It is a production-built showcase of the dashboard that never needs Clerk. The `@clerk/react` alias MUST remain in `vite.config.ts` for all future builds.

### Layer 4 — serve.mjs replaces vite preview (proxy HTML caching fix)
**Problem:** `vite preview` served a 2.33 KB HTML file. Replit's proxy cached this tiny HTML, so rebuilds with new JS bundle hashes were invisible to users — the proxy kept serving the old HTML referencing the old (now-missing) bundle hash.

**Fix:** Added `artifacts/test-dashboard/serve.mjs` (Node built-ins only — no express, which isn't in devDependencies). Changed `package.json` serve script from `vite preview --config vite.config.ts --host 0.0.0.0` to `node serve.mjs`. The serve.mjs:
1. Generates a per-restart `startupToken` (timestamp + 4 random bytes)
2. Rewrites JS/CSS `src`/`href` attributes in the HTML to include `?v=<token>`
3. Injects a redirect script into `<head>` that bounces to `?_v=<token>` if the current URL doesn't already contain it (proxy-served stale HTML redirects to new URL → cache miss)
4. Appends ~700 KB of random hex as an HTML comment — non-compressible content exceeds the proxy's size cache limit, preventing HTML caching entirely

**Why use Node built-ins:** test-dashboard's `package.json` only has devDependencies (vite, react, etc.) — `express` is not available at serve time. The main dashboard's `serve.mjs` uses express because it lives in an artifact that has express declared.

## Key files
- `artifacts/test-dashboard/vite.config.ts` — alias entry (around line 934)
- `artifacts/test-dashboard/src/clerk-bypass.ts` — shim
- `artifacts/test-dashboard/index.html` — SW unregister only
- `artifacts/test-dashboard/serve.mjs` — custom Node HTTP server with token-redirect + HTML padding
