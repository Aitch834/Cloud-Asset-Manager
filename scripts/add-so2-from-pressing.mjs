#!/usr/bin/env node
// One-off migration: add so2_from_pressing boolean column to winery_fermentation_records
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(`
    ALTER TABLE winery_fermentation_records
    ADD COLUMN IF NOT EXISTS so2_from_pressing boolean NOT NULL DEFAULT false;
  `);
  console.log("✅  so2_from_pressing column added (or already exists)");
} finally {
  await pool.end();
}
