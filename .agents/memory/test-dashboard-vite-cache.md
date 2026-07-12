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

## Key files
- `artifacts/test-dashboard/vite.config.ts` — alias entry (around line 934)
- `artifacts/test-dashboard/src/clerk-bypass.ts` — shim
- `artifacts/test-dashboard/index.html` — SW unregister only
