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

  // Remove the now-redundant sector prefix from notes after backfilling it.
  // Trim any whitespace left at the edges so a sector-only note becomes NULL.
  await db.execute(sql`
    UPDATE registration_leads
    SET notes = NULLIF(
      regexp_replace(
        regexp_replace(notes, '(?m)^Sector:[[:space:]]*.+$', '', 'g'),
        '^[[:space:]]+|[[:space:]]+$',
        '',
        'g'
      ),
      ''
    )
    WHERE sector IS NOT NULL
      AND notes IS NOT NULL
      AND notes ~ '(?m)^Sector:[[:space:]]*.+$'
  `);

  await db.execute(sql`
    ALTER TABLE registration_leads
    ADD COLUMN IF NOT EXISTS county text,
    ADD COLUMN IF NOT EXISTS farm_type text,
    ADD COLUMN IF NOT EXISTS cph_number text
  `);

  await db.execute(sql`
    UPDATE registration_leads
    SET county = btrim((regexp_match(notes, '(?m)^County:[[:space:]]*(.+)$'))[1])
    WHERE county IS NULL
      AND notes IS NOT NULL
      AND notes ~ '(?m)^County:'
  `);

  await db.execute(sql`
    UPDATE registration_leads
    SET farm_type = btrim((regexp_match(notes, '(?m)^Farm type:[[:space:]]*(.+)$'))[1])
    WHERE farm_type IS NULL
      AND notes IS NOT NULL
      AND notes ~ '(?m)^Farm type:'
  `);

  await db.execute(sql`
    UPDATE registration_leads
    SET cph_number = btrim((regexp_match(notes, '(?m)^CPH number:[[:space:]]*(.+)$'))[1])
    WHERE cph_number IS NULL
      AND notes IS NOT NULL
      AND notes ~ '(?m)^CPH number:'
  `);
}
