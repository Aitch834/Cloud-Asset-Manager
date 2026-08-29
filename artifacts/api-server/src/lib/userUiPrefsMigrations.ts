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
  await db.execute(sql`
    UPDATE users
    SET ui_prefs = COALESCE(
      (
        SELECT jsonb_object_agg(entry.key, entry.value)
        FROM jsonb_each(COALESCE(users.ui_prefs, '{}'::jsonb)) AS entry(key, value)
        WHERE NOT (
          entry.key ~ '^winegb_.+_[0-9]{4}$'
          AND (regexp_match(entry.key, '_([0-9]{4})$'))[1]::integer
            < EXTRACT(YEAR FROM CURRENT_DATE)::integer
        )
      ),
      '{}'::jsonb
    )
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_object_keys(COALESCE(users.ui_prefs, '{}'::jsonb)) AS stale_key(key)
      WHERE stale_key.key ~ '^winegb_.+_[0-9]{4}$'
        AND (regexp_match(stale_key.key, '_([0-9]{4})$'))[1]::integer
          < EXTRACT(YEAR FROM CURRENT_DATE)::integer
    )
  `);
}
