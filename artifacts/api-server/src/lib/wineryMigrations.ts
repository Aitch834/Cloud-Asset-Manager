import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for winery-specific tables.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
 */
export async function runWineryMigrations(): Promise<void> {
  // Batch / lot number settings — one row per farm, controls auto-generation of pressing refs
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS winery_batch_settings (
      id                serial PRIMARY KEY,
      farm_id           integer NOT NULL UNIQUE REFERENCES farms(id),
      prefix            text    NOT NULL DEFAULT 'PRESS',
      year_format       text    NOT NULL DEFAULT 'YYYY',
      padding_digits    integer NOT NULL DEFAULT 3,
      next_sequence     integer NOT NULL DEFAULT 1,
      created_at        timestamptz NOT NULL DEFAULT now(),
      updated_at        timestamptz NOT NULL DEFAULT now()
    )
  `);

  console.log("[WINERY-MIGRATE] Done.");
}
