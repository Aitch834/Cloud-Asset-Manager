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

  // Separate email-completion flag so SMS dispatch (end_notified) and advisor email
  // delivery (end_email_notified) can complete independently. This prevents the
  // email retry loop from re-dispatching all-clear SMS on every cycle.
  await db.execute(sql`
    ALTER TABLE sector_alert_episodes
    ADD COLUMN IF NOT EXISTS end_email_notified boolean NOT NULL DEFAULT false
  `);

  // Per-recipient email delivery outbox: tracks which advisor addresses have already
  // received an all-clear email for a given episode. Prevents duplicate sends on retry
  // and lets the job skip already-delivered recipients if SMTP was down for some.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sector_alert_email_deliveries (
      id           serial       PRIMARY KEY,
      episode_id   integer      NOT NULL REFERENCES sector_alert_episodes(id) ON DELETE CASCADE,
      email_norm   text         NOT NULL,
      advisor_name text,
      sent_at      timestamptz  NOT NULL DEFAULT now(),
      UNIQUE (episode_id, email_norm)
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_saed_episode
    ON sector_alert_email_deliveries(episode_id)
  `);

  console.log("[SECTOR-ALERT-MIGRATE] Done.");
}
