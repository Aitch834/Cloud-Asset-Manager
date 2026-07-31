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

  // Unique batch refs per farm on fermentation records — mirrors the same guard already in place
  // on pressing records. NULL allowed (batch_ref is optional), but two non-NULL values with the
  // same (farm_id, batch_ref) are rejected at the DB level regardless of which code path writes them.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_winery_fermentation_records_farm_batch_ref
    ON winery_fermentation_records (farm_id, batch_ref)
    WHERE batch_ref IS NOT NULL
  `);

  // ─── One-off data fix: correct SO₂ limits for pre-existing conventional-batch test records ───
  //
  // Before the organic flag was introduced, max_permitted_mg_l was always set to the organic
  // ceiling (Red=100, White/Rosé/Orange=150, Sparkling=185). Records for conventional
  // (non-organic) batches therefore show a ceiling that is 50 mg/L too low.
  //
  // This migration is idempotent: once a row's max_permitted_mg_l has been raised to the
  // conventional ceiling it will no longer match the WHERE filter, so re-runs are no-ops.
  //
  // Organic limits:      Red=100, White/Rosé/Orange=150, Sparkling=185
  // Conventional limits: Red=150, White/Rosé/Orange=200, Sparkling=235
  const fixResult = await db.execute(sql`
    UPDATE winery_so2_tests t
    SET
      max_permitted_mg_l = CASE t.wine_colour
        WHEN 'Red'       THEN 150
        WHEN 'White'     THEN 200
        WHEN 'Rosé'      THEN 200
        WHEN 'Sparkling' THEN 235
        WHEN 'Orange'    THEN 200
        ELSE t.max_permitted_mg_l
      END,
      so2_compliant = CASE
        WHEN t.total_so2_mg_l IS NULL THEN t.so2_compliant
        WHEN t.wine_colour = 'Red'       THEN (t.total_so2_mg_l <= 150)
        WHEN t.wine_colour = 'White'     THEN (t.total_so2_mg_l <= 200)
        WHEN t.wine_colour = 'Rosé'      THEN (t.total_so2_mg_l <= 200)
        WHEN t.wine_colour = 'Sparkling' THEN (t.total_so2_mg_l <= 235)
        WHEN t.wine_colour = 'Orange'    THEN (t.total_so2_mg_l <= 200)
        ELSE t.so2_compliant
      END
    FROM winery_pressing_records p
    WHERE t.batch_ref   = p.batch_ref
      AND t.farm_id     = p.farm_id
      AND p.is_organic  = false
      AND t.wine_colour IN ('Red', 'White', 'Rosé', 'Sparkling', 'Orange')
      AND t.max_permitted_mg_l = CASE t.wine_colour
        WHEN 'Red'       THEN 100
        WHEN 'White'     THEN 150
        WHEN 'Rosé'      THEN 150
        WHEN 'Sparkling' THEN 185
        WHEN 'Orange'    THEN 150
      END
  `);
  const rowsFixed = (fixResult as unknown as { rowCount?: number }).rowCount ?? 0;
  if (rowsFixed > 0) {
    console.log(`[WINERY-MIGRATE] Fixed SO₂ limits on ${rowsFixed} conventional-batch test record(s).`);
  }

  await db.execute(sql`ALTER TABLE winery_fermentation_records ADD COLUMN IF NOT EXISTS end_ph NUMERIC(4,2)`);
  await db.execute(sql`ALTER TABLE winery_fermentation_records ADD COLUMN IF NOT EXISTS end_ta_gl NUMERIC(6,2)`);

  console.log("[WINERY-MIGRATE] Done.");
}
