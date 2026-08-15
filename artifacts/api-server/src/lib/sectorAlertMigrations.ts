import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the sector_alert_episodes table.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 *
 * This table stores the full lifecycle of every sector alert issued from
 * the Admin Portal: when it was raised, by whom, what level/message/counties,
 * and when it was resolved (ended_at / ended_by / ended_reason).
 * The end_notified flag is set to true after the all-clear SMS is dispatched
 * by the alerting job.
 */
export async function runSectorAlertMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sector_alert_episodes (
      id            serial       PRIMARY KEY,
      sector        text         NOT NULL,
      level         text         NOT NULL DEFAULT 'precautionary',
      message       text         NOT NULL DEFAULT '',
      counties      text         NOT NULL DEFAULT '',
      issued_at     timestamptz  NOT NULL DEFAULT now(),
      issued_by     text         NOT NULL DEFAULT '',
      ended_at      timestamptz,
      ended_by      text,
      ended_reason  text,
      end_notified  boolean      NOT NULL DEFAULT false,
      created_at    timestamptz  NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_sae_sector
    ON sector_alert_episodes(sector)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_sae_ended_at
    ON sector_alert_episodes(ended_at)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_sae_end_notified
    ON sector_alert_episodes(end_notified)
    WHERE ended_at IS NOT NULL
  `);
  console.log("[SECTOR-ALERT-MIGRATE] Done.");
}
