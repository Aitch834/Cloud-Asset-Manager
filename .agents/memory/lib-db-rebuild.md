---
name: lib/db rebuild after schema changes
description: How and when to rebuild lib/db compiled declarations; why drizzle push fails
---

## Rule
After ANY schema change in `lib/db/src/schema/`, rebuild declarations before running API typecheck:
```
cd lib/db && npx tsc -p tsconfig.json
```
Then restart the API server workflow.

**Why:** API server uses TypeScript project references to `lib/db`. TypeScript reads `dist/*.d.ts` (prebuilt declarations), NOT the source `.ts` files. Stale `dist/` causes the compiled queries to reference old column names, causing runtime DB errors even if the schema file is correct.

## DB Migration
`pnpm --filter @workspace/db run push` and `push-force` ALWAYS time out (schema pull hangs). Use direct SQL instead:
```javascript
await executeSql({ sqlQuery: `ALTER TABLE t ADD COLUMN IF NOT EXISTS col TYPE DEFAULT val;` });
```
For column renames (no IF EXISTS syntax), use a DO block:
```sql
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='t' AND column_name='old') THEN
    ALTER TABLE t RENAME COLUMN old TO new;
  END IF;
END $$;
```

## Column Rename History (sheep/goat dairy — done June 2026)
- somatic_cell_count → scc_thousands
- total_bacteria_count → tbc_cfu_ml
- fat_percentage → fat_percent
- protein_percentage → protein_percent
- brix_percentage: DROPPED

**How to apply:** Any time a schema file is edited, run the tsc rebuild immediately. Never rely on drizzle push.

## Spray Notifications schema additions (July 2026)
Added to `spray_notifications`: `recipient_contact`, `recipient_address`, `confirmation_date`.
Added new `spray_notification_contacts` table for reusable contact book per farm.
Field name mismatches fixed: DB uses `contactMethod` (not `notificationMethod`), `confirmed` (not `confirmationReceived`).
