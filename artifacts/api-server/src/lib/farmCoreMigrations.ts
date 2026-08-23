import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Startup migrations for the core farms table.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runFarmCoreMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS contact_phone text`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS county text`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_cost_per_mm_ha numeric(8,2)`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_crop_price_per_tonne numeric(10,2)`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_application_rate_mm numeric(8,2)`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS irrigation_abstraction_source text`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS idle_barrel_days integer`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS approaching_neutral_fills integer`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS barrel_retirement_threshold_gbp integer`);
}
