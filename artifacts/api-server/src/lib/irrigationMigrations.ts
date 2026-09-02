import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Startup migrations for irrigation records.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runIrrigationMigrations(): Promise<void> {
  await db.execute(
    sql`ALTER TABLE irrigation_records ADD COLUMN IF NOT EXISTS water_source text`,
  );
}