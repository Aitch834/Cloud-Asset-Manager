#!/usr/bin/env node
// One-off backfill: set so2_from_pressing = true for fermentation records whose
// SO2 value was auto-filled from a linked pressing batch before the flag existed.
//
// Criteria:
//   - pressing_record_id IS NOT NULL  (record is linked to a pressing batch)
//   - so2_at_fermentation_mg_l matches the dose of an SO2 addition on that pressing batch
//   - so2_from_pressing is currently false (i.e. needs backfilling)
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const result = await pool.query(`
    UPDATE winery_fermentation_records f
    SET so2_from_pressing = true
    FROM winery_pressing_additions a
    WHERE f.pressing_record_id IS NOT NULL
      AND f.so2_from_pressing = false
      AND a.pressing_record_id = f.pressing_record_id
      AND a.category = 'so2'
      AND f.so2_at_fermentation_mg_l IS NOT NULL
      AND f.so2_at_fermentation_mg_l::numeric = a.dose::numeric
  `);
  console.log(`✅  Backfill complete — ${result.rowCount} fermentation record(s) updated with so2_from_pressing = true`);
} finally {
  await pool.end();
}
