---
name: lib/db rebuild required after schema changes
description: The API server uses TypeScript project references pointing to lib/db's compiled dist/ output — schema changes require rebuilding lib/db before the API typecheck will see them.
---

## Rule
After any change to `lib/db/src/schema/*.ts`, run:

```
pnpm --filter @workspace/db exec tsc -p tsconfig.json
```

before running `pnpm --filter @workspace/api-server run typecheck`.

**Why:** The API `tsconfig.json` uses `"references": [{ "path": "../../lib/db" }]` with `composite: true`. TypeScript project references resolve against the emitted `.d.ts` files in `lib/db/dist/`, not the source `.ts` files. Without a rebuild, the API compiler sees stale declaration files and reports "property does not exist" errors on new schema columns.

**How to apply:** Any session that adds or renames columns in `lib/db/src/schema/` must include this rebuild step before the final typecheck pass. Check for the `dist/` directory existing — if it does, the rebuild is the fix.
