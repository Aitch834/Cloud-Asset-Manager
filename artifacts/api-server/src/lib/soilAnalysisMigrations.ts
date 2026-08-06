import { pool } from "@workspace/db";

export async function runSoilAnalysisMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE farms ADD COLUMN IF NOT EXISTS fsa_vine_register_ref TEXT;
    `);
    await client.query(`
      ALTER TABLE vineyard_soil_analysis
        ADD COLUMN IF NOT EXISTS request_reference TEXT;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS vineyard_soil_sample_points (
        id            SERIAL PRIMARY KEY,
        soil_analysis_id INTEGER NOT NULL REFERENCES vineyard_soil_analysis(id) ON DELETE CASCADE,
        farm_id       INTEGER NOT NULL REFERENCES farms(id),
        lat           NUMERIC(10, 6) NOT NULL,
        lng           NUMERIC(10, 6) NOT NULL,
        label         TEXT,
        captured_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        captured_by   TEXT,
        accuracy      NUMERIC(8, 2),
        created_at    TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}
