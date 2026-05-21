---
name: test-dashboard Vite alias / optimizeDeps rule
description: Why every package with dynamic import() or React hooks must be pre-bundled in test-dashboard — and the symptoms when it's missing.
---

## The rule

Every package that dashboard source files import AND that either:
- calls React hooks / uses React context internally, OR
- is dynamically imported (`import("pkg")` inside a `useEffect` or similar)

**must** appear in `artifacts/test-dashboard/vite.config.ts` under **both**:
- `resolve.alias` (if it's React-aware — so all copies resolve to the same instance)
- `optimizeDeps.include` (so Vite pre-bundles it at startup, not mid-render)

React-aware packages also go in `resolve.dedupe`.

**Why:** If Vite discovers a package for the first time during a component render (i.e., it wasn't pre-bundled at startup), it triggers a forced re-optimisation. This rehashes ALL pre-bundled chunks including React. The browser then loads old React chunks alongside new ones — two React instances — causing "Invalid hook call" on whichever component happens to be rendering at the time.

**How to apply:** When a new component is added that uses `import("some-pkg")` dynamically, add `"some-pkg"` to `optimizeDeps.include`. If the package uses React internally, also add it to `resolve.alias` (pointing to `td("pkg")` if available in test-dashboard's node_modules, or `path.resolve(..., "../dashboard/node_modules/pkg")` if it lives only there) and `resolve.dedupe`.

## Known instances

- `leaflet` — dynamically imported inside `StorageLocationMapPicker`'s `useEffect`. Only `optimizeDeps.include` needed (leaflet doesn't use React). Added after SlurryTab crashed with "Invalid hook call" every time EnvironmentalPageFull first rendered.
- `@uppy/*` — dynamically discovered via `ObjectUploader.tsx`; caused "Invalid hook call" on FlocksTab.
- `lucide-react` — large icon library; mid-render discovery caused crashes on multiple pages.
- All `@radix-ui/react-*` packages — Radix UI uses React context; must be aliased + deduped.

## Symptoms

- Browser console: "Invalid hook call. Hooks can only be called inside of the body of a function component."
- ErrorBoundary catches `{}` (empty object, not a standard Error)
- The crash happens on a specific tab/page that's visited first (whichever component is rendering when Vite discovers the new package)
- Component stack points to a component that looks structurally correct (all hooks at top level)
- Line number in browser source doesn't match the TypeScript source file line count (stale cached bundle)

## DO NOT use `optimizeDeps.force: true`

It was intentionally removed. `force: true` re-hashes all chunks on every server restart; Replit's preview proxy caches old hashes so the browser loads mixed old/new chunks → same two-React-instance problem on every restart.
