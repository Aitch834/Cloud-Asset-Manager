import { pool } from "@workspace/db";

export async function runSoilAnalysisMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE vineyard_soil_analysis
        ADD COLUMN IF NOT EXISTS request_reference TEXT;
    `);
  } finally {
    client.release();
  }
}
