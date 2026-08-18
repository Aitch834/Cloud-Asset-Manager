import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the registration_leads table.
 * Safe to run on every startup — uses IF NOT EXISTS / DO NOTHING patterns.
 */
export async function runLeadsMigrations(): Promise<void> {
  // Add the dedicated sector column (nullable text)
  await db.execute(sql`
    ALTER TABLE registration_leads
    ADD COLUMN IF NOT EXISTS sector text
  `);

  // Backfill sector from the packed notes field for any rows that don't have it yet.
  // The notes field stores a "Sector: <value>" line as the first prefix line.
  // Use POSIX [[:space:]]* (not \s) — JS template literals pass \s literally to PostgreSQL.
  // btrim() strips any stray leading/trailing whitespace from the captured value.
  await db.execute(sql`
    UPDATE registration_leads
    SET sector = btrim(
      (regexp_match(notes, '(?m)^Sector:[[:space:]]*(.+)$'))[1]
    )
    WHERE sector IS NULL
      AND notes IS NOT NULL
      AND notes ~ '(?m)^Sector:'
  `);
}
