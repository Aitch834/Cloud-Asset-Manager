import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export async function runDataApiMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS data_api_keys (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id),
      farm_id INTEGER NOT NULL REFERENCES farms(id),
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    INSERT INTO modules (key, name, description, monthly_price_pence)
    VALUES (
      'data-api',
      'Data API Access',
      'Read-only REST API for connecting farm data to Excel Power Query, Power BI, Google Sheets, and Python',
      1500
    )
    ON CONFLICT (key) DO NOTHING
  `);
}
