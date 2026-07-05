---
name: lib/api-client-react build failure fix
description: Why tsc --build failed for api-client-react and how it was fixed (noImplicitAny + missing devDependencies)
---

`pnpm run typecheck:libs` (`tsc --build`) failed to rebuild `lib/api-client-react/dist` with two separate root causes:

1. The orval-generated `src/generated/api.ts` has always relied on `noImplicitAny: false`-style leniency (e.g. `queryFn: QueryFunction<T> = ({ signal }) => ...` patterns) that trip `noImplicitAny` from the shared `tsconfig.base.json`. Fixed by adding `"noImplicitAny": false` directly in `lib/api-client-react/tsconfig.json` (scoped to this generated-only package, not the base config).
2. `@tanstack/react-query` and `react` are only declared as `peerDependencies` in `lib/api-client-react/package.json`, so `tsc --build` run standalone (or from root) can't resolve their types — pnpm doesn't hoist peer deps into a package's own resolution scope unless something in the workspace declares them as a real dependency. Fixed by adding them (plus `@types/react`) as `devDependencies: catalog:` in that package, then `pnpm install`.

**Why:** dist/ is gitignored and rebuilt on demand; this failure is invisible until someone actually reruns `tsc --build` after an openapi.yaml/codegen change (see lib-db-rebuild.md for the analogous lib/db rule — same rebuild-after-schema-change hazard applies here too).

**How to apply:** whenever `pnpm run typecheck:libs` fails on `lib/api-client-react` after a codegen run, check both of these first before assuming the new API changes are at fault — the errors are pre-existing/structural, not caused by the new endpoints.
