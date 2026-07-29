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

  // Pressing additions — structured child rows replacing free-text additions_at_press
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS winery_pressing_additions (
      id                  serial PRIMARY KEY,
      farm_id             integer NOT NULL REFERENCES farms(id),
      pressing_record_id  integer NOT NULL REFERENCES winery_pressing_records(id) ON DELETE CASCADE,
      additive_name       text NOT NULL,
      category            text,
      product_brand       text,
      dose                numeric(10,3),
      unit                text,
      is_organic          boolean DEFAULT false,
      notes               text,
      created_at          timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wpa_farm_id           ON winery_pressing_additions(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_wpa_pressing_record_id ON winery_pressing_additions(pressing_record_id)`);

  console.log("[WINERY-MIGRATE] Done.");
}
