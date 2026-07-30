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

  // Unique batch refs per farm — NULL allowed (auto-generated refs never collide because the
  // sequence is atomic), but two non-NULL values with the same (farm_id, batch_ref) are rejected.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wpr_farm_batch_ref
    ON winery_pressing_records(farm_id, batch_ref)
    WHERE batch_ref IS NOT NULL
  `);

  // Certified organic flag on pressing records — drives automatic SO₂ limit enforcement
  await db.execute(sql`ALTER TABLE winery_pressing_records ADD COLUMN IF NOT EXISTS is_organic boolean NOT NULL DEFAULT false`);

  // FK from fermentation records to pressing records — allows pressing additions to be shown
  // read-only in the fermentation view (nullable; existing rows are unlinked)
  await db.execute(sql`ALTER TABLE winery_fermentation_records ADD COLUMN IF NOT EXISTS pressing_record_id integer REFERENCES winery_pressing_records(id)`);

  // Organic flag on fermentation records — inherited from pressing, drives SO₂ limit enforcement
  await db.execute(sql`ALTER TABLE winery_fermentation_records ADD COLUMN IF NOT EXISTS is_organic boolean NOT NULL DEFAULT false`);

  // Organic flag on bottling records — inherited from fermentation/pressing, drives pre-bottling SO₂ ceiling
  await db.execute(sql`ALTER TABLE winery_bottling_records ADD COLUMN IF NOT EXISTS is_organic boolean NOT NULL DEFAULT false`);

  // Unique lot codes per farm — NULL allowed (lot code is optional), but two non-NULL values
  // with the same (farm_id, lot_code) are rejected at the DB level regardless of which code path writes them.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS winery_bottling_records_farm_lot_code_uniq
    ON winery_bottling_records(farm_id, lot_code)
    WHERE lot_code IS NOT NULL
  `);

  console.log("[WINERY-MIGRATE] Done.");
}
