import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for LIS sync columns.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runLisMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE herd_flock_register  ADD COLUMN IF NOT EXISTS lis_herd_ref text`);
  await db.execute(sql`ALTER TABLE livestock_animals    ADD COLUMN IF NOT EXISTS lis_tag_ref text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_movement_ref text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_source text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_raw_data jsonb`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_imported_at timestamptz`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_last_synced_at timestamptz`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_last_sync_summary text`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_sync_history jsonb`);

  // LIS LIP (Livestock Information Platform) — Cattle Auth Foundation
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lip_farm_tokens (
      id serial primary key,
      farm_id integer not null unique references farms(id),
      is_configured boolean not null default false,
      test_status text,
      test_message text,
      last_tested_at timestamptz,
      platform_access_token text,
      token_expires_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}
