---
name: Schema push — raw SQL vs drizzle-kit
description: drizzle-kit push hangs on interactive prompts in Replit CI; workaround for adding new nullable columns to existing tables
---

## The problem
`drizzle-kit push` hangs indefinitely waiting for interactive "yes/no" prompts that can't be answered in a non-tty context. Even piping `echo "yes"` doesn't help because the prompt is tty-aware.

## Why it doesn't matter for nullable columns
Adding nullable columns or boolean columns with defaults is a non-destructive `ALTER TABLE … ADD COLUMN IF NOT EXISTS` — no data migration needed, no drizzle snapshot risk.

## Workaround: node ESM script
Write a `/tmp/push_cols.mjs` script and run with `node`:

```js
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query(`ALTER TABLE my_table ADD COLUMN IF NOT EXISTS my_col text`);
await pool.end();
```

**Why:** The pnpm store path avoids ESM resolution issues. The node version supports top-level await.

**How to apply:** Any time you add new nullable/defaulted columns to an existing table and need to push without drizzle-kit.

**Note:** Use the actual pg version from `ls /home/runner/workspace/node_modules/.pnpm/ | grep "^pg@"`.
