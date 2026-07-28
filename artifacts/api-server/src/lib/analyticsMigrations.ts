import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for website visit analytics.
 * Safe to run on every startup — uses CREATE TABLE / INDEX IF NOT EXISTS.
 */
export async function runAnalyticsMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS website_visits (
      id          SERIAL PRIMARY KEY,
      visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      path        TEXT NOT NULL,
      referrer    TEXT,
      ip_hash     TEXT
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_website_visits_visited_at
      ON website_visits (visited_at DESC)
  `);
}
