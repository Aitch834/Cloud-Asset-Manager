---
name: lib/db rebuild required after schema changes
description: The API server uses TypeScript project references pointing to lib/db's compiled dist/ output — schema changes require rebuilding lib/db before the API typecheck will see them.
---

## Rule
After any change to `lib/db/src/schema/*.ts`, run:

```
cd lib/db && npx tsc -b --force
```

before running `pnpm --filter @workspace/api-server run typecheck`.

**Note:** `pnpm --filter @workspace/db run build` does NOT work — lib/db has no `build` script. Use `tsc -b --force` directly instead.

**Why:** The API `tsconfig.json` uses `"references": [{ "path": "../../lib/db" }]` with `composite: true`. TypeScript project references resolve against the emitted `.d.ts` files in `lib/db/dist/`, not the source `.ts` files. Without a rebuild, the API compiler sees stale declaration files and reports "property does not exist" errors on new schema columns.

**How to apply:** Any session that adds or renames columns in `lib/db/src/schema/` must include this rebuild step before the final typecheck pass. Check for the `dist/` directory existing — if it does, the rebuild is the fix.

## JSX `unknown` children fix
In dashboard React components, `viewRecord` and `editing` are typed as `Record<string, unknown> | null`. Using `{viewRecord.someField && <JSX>}` evaluates to `unknown | JSX.Element` → `unknown`, which is NOT assignable to `ReactNode`. Always prefix with `!!`:
- `{!!viewRecord.someField && <JSX>}` → `boolean | JSX.Element` ✓
- `{!!editing?.id && <JSX>}` → `boolean | JSX.Element` ✓ (editing?.id is `unknown | undefined`)
- Same for chained: `{!!form.x && form.x !== "val" && <JSX>}` ✓
