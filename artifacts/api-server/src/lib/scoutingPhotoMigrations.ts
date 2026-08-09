import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for vineyard scouting photo attachments.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runScoutingPhotoMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vineyard_scouting_photos (
      id           serial PRIMARY KEY,
      scouting_id  integer NOT NULL REFERENCES vineyard_scouting(id) ON DELETE CASCADE,
      farm_id      integer NOT NULL REFERENCES farms(id),
      object_path  text NOT NULL,
      file_name    text,
      caption      text,
      sort_order   integer,
      uploaded_at  timestamptz NOT NULL DEFAULT now(),
      created_at   timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_vineyard_scouting_photos_scouting_id
      ON vineyard_scouting_photos(scouting_id)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_vineyard_scouting_photos_farm_id
      ON vineyard_scouting_photos(farm_id)
  `);
}
