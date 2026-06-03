---
name: lib/db rebuild required after schema changes
description: The API server uses TypeScript project references pointing to lib/db's compiled dist/ output — schema changes require rebuilding lib/db before the API typecheck will see them.
---

## Rule
After any change to `lib/db/src/schema/*.ts`, run:

```
cd lib/db && npx tsc -p tsconfig.json
```

before running `pnpm --filter @workspace/api-server run typecheck`.

**Note:** `pnpm --filter @workspace/db run build` does NOT work — lib/db has no `build` script. Use `tsc -p tsconfig.json` directly (not `-b --force` which previously caused issues).

## DB migration — drizzle-kit push hangs
`pnpm --filter @workspace/db run push-force` always times out on "Pulling schema". Use raw SQL via the workspace pg module instead:

```js
node --input-type=module << 'EOF'
import pg from '/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
await c.query(`ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`);
console.log('done');
await c.end();
EOF
```

The pg module path may change with version updates — check with `ls node_modules/.pnpm/ | grep "^pg@"` if the import fails.

**Why:** The API `tsconfig.json` uses `"references": [{ "path": "../../lib/db" }]` with `composite: true`. TypeScript project references resolve against the emitted `.d.ts` files in `lib/db/dist/`, not the source `.ts` files. Without a rebuild, the API compiler sees stale declaration files and reports "property does not exist" errors on new schema columns.

**How to apply:** Any session that adds or renames columns in `lib/db/src/schema/` must include this rebuild step before the final typecheck pass. Check for the `dist/` directory existing — if it does, the rebuild is the fix.

## JSX `unknown` children fix
In dashboard React components, `viewRecord` and `editing` are typed as `Record<string, unknown> | null`. Using `{viewRecord.someField && <JSX>}` evaluates to `unknown | JSX.Element` → `unknown`, which is NOT assignable to `ReactNode`. Always prefix with `!!`:
- `{!!viewRecord.someField && <JSX>}` → `boolean | JSX.Element` ✓
- `{!!editing?.id && <JSX>}` → `boolean | JSX.Element` ✓ (editing?.id is `unknown | undefined`)
- Same for chained: `{!!form.x && form.x !== "val" && <JSX>}` ✓
