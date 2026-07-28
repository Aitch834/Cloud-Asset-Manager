import { pool } from "@workspace/db";

export async function runReportBuilderMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_reports (
        id          SERIAL PRIMARY KEY,
        tenant_id   INTEGER NOT NULL,
        farm_id     INTEGER NOT NULL,
        name        TEXT NOT NULL,
        description TEXT,
        config      JSONB NOT NULL,
        created_by  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS saved_reports_farm_idx ON saved_reports (farm_id, tenant_id);
    `);

    await client.query(`
      INSERT INTO modules (key, name, description, monthly_price_pence)
      VALUES (
        'report-builder',
        'Report Builder',
        'Build, save, and export custom reports from any farm dataset — fields, livestock, medicines, sprays, soil tests, inspections, training, equipment, financials, and risk assessments. Column picker, date-range and field-level filters, optional bar / line / pie charts, CSV export.',
        2000
      )
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log("[REPORT-BUILDER-MIGRATE] Done.");
  } finally {
    client.release();
  }
}
