---
name: Week-ahead planner — poolDb cascade fix + text due_date fix
description: Two-part fix for the week-ahead route: (1) cascade from RLS-shared connection; (2) text column vs ::date comparison operator error
---

## The two-part bug

### Part 1 — RLS transaction cascade (fixed)
The week-ahead route fired 102 `db.select()` calls concurrently via `Promise.allSettled`. All went through the single RLS-bound pg Client (`txDb`). If any query at position ≤44 caused a pg error, PostgreSQL marked the transaction as aborted, and all subsequent queries got `25P02 "current transaction is aborted"`.

**Fix:** Created a module-level `poolDb = drizzleNode(pool, { schema: dbSchema })` at the top of farms.ts (after imports). Replaced all 102 `db.select(` calls in the batch with `poolDb.select(`. Each query now gets its own autocommit pool connection via `pool.query()`, eliminating the cascade entirely.

### Part 2 — text `due_date` vs `::date` cast (fixed)
`farm_task_assignments.due_date` is stored as `text` in the DB (not `date`). The batch query used `gte(dueDate, sql\`${date}::date\`)` which generates `text >= date`, causing PostgreSQL error: `operator does not exist: text >= date`.

**Fix:** Changed to plain string comparison: `gte(dueDate, overdueStart.toISOString().split("T")[0])`. ISO date strings (YYYY-MM-DD) sort lexicographically correctly.

## Remaining non-critical issues
- `medicated_feed_records` table (query[67]) does not exist in DB — Promise.allSettled handles it silently (returns empty array). Pre-existing state.
- `DeprecationWarning: Calling client.query() concurrently` — fires from somewhere else in the API; not from the week-ahead batch.

## Key imports added to farms.ts
```typescript
import { pool, schema as dbSchema } from "@workspace/db";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
const poolDb = drizzleNode(pool, { schema: dbSchema }); // module level, after imports
```

**Why:** The RLS proxy `db` always routes through the AsyncLocalStorage-bound transaction client. Any concurrent batch of queries using `db` will collapse into a single pg Client and cascade on failure. `poolDb` bypasses the RLS proxy entirely.

**How to apply:** Any route that fires concurrent `db.select()` calls in `Promise.allSettled` must use `poolDb.select()` instead. Sequential `db.select()` calls (awaited one at a time) are fine on the RLS client.
