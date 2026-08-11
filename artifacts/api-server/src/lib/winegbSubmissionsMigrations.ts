import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the WineGB seasonal survey submission tracker.
 * Safe to run on every startup.
 */
export async function runWinegbSubmissionsMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vineyard_winegb_submissions (
      id           serial PRIMARY KEY,
      farm_id      integer NOT NULL REFERENCES farms(id),
      season_year  integer NOT NULL,
      survey_key   text    NOT NULL,
      submitted    boolean NOT NULL DEFAULT false,
      submitted_at timestamptz,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now(),
      UNIQUE(farm_id, season_year, survey_key)
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vws_farm_year ON vineyard_winegb_submissions(farm_id, season_year)`);
}
