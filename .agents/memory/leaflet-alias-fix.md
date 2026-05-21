---
name: Leaflet alias fix for test-dashboard
description: Why leaflet needs an explicit resolve.alias in test-dashboard/vite.config.ts, not just an optimizeDeps.include entry
---

## Rule
Any package in `optimizeDeps.include` that lives ONLY in `dashboard/node_modules/`
(not in `test-dashboard/node_modules/`) MUST also have an explicit `resolve.alias`
entry pointing to `path.resolve(import.meta.dirname, "../dashboard/node_modules/<pkg>")`.

Without the alias, Vite cannot resolve the package name from test-dashboard's context,
so the include entry silently fails. The package then gets discovered at runtime
mid-render, triggers a forced re-optimisation, rehashes all chunks including React,
and briefly creates two React instances → "Invalid hook call".

**Why:** leaflet is a direct victim of this: it's in `optimizeDeps.include` as
`"leaflet"` but was never added to `resolve.alias`. Vite resolved it from
`dashboard/node_modules/leaflet` at runtime (via StorageLocationMapPicker's
dynamic `import("leaflet")`), not from the pre-bundle cache.

**How to apply:** When adding a new package to `optimizeDeps.include` that is not
in test-dashboard's own `node_modules/`, always add a matching alias entry too.
Packages already handled this way: `@clerk/react`, `@uppy/*`, zustand sub-paths,
and now `leaflet`.
