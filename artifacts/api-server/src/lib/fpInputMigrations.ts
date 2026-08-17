import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for organic fresh-produce input log.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runFpInputMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE organic_fresh_produce_input_log ADD COLUMN IF NOT EXISTS derogation_expiry_date date`);
}
