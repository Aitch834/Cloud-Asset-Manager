import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Adds the ui_prefs JSONB column to the users table if it does not exist.
 * This stores per-user UI hint dismissal flags so they survive device changes.
 */
export async function runUserUiPrefsMigrations(): Promise<void> {
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS ui_prefs jsonb NOT NULL DEFAULT '{}'::jsonb
  `);
  await db.execute(sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS sms_categories jsonb
  `);
}
