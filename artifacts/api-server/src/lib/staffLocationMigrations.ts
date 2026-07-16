import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migration for staff location sharing.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runStaffLocationMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS staff_location_pings (
      id          serial PRIMARY KEY,
      farm_id     integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      user_id     text NOT NULL,
      user_name   text NOT NULL,
      latitude    numeric(10,7) NOT NULL,
      longitude   numeric(10,7) NOT NULL,
      accuracy_m  numeric(8,2),
      is_sharing  boolean NOT NULL DEFAULT true,
      shift_started_at timestamptz,
      last_seen_at     timestamptz NOT NULL DEFAULT now(),
      created_at       timestamptz NOT NULL DEFAULT now(),
      UNIQUE(farm_id, user_id)
    )
  `);
}
