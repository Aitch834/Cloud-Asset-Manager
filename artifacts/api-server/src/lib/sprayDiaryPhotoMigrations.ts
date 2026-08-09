import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for vineyard spray diary photo attachments.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runSprayDiaryPhotoMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vineyard_spray_diary_photos (
      id             serial PRIMARY KEY,
      spray_diary_id integer NOT NULL REFERENCES vineyard_spray_diary(id) ON DELETE CASCADE,
      farm_id        integer NOT NULL REFERENCES farms(id),
      object_path    text NOT NULL,
      file_name      text,
      caption        text,
      sort_order     integer,
      uploaded_at    timestamptz NOT NULL DEFAULT now(),
      created_at     timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_vineyard_spray_diary_photos_spray_diary_id
      ON vineyard_spray_diary_photos(spray_diary_id)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_vineyard_spray_diary_photos_farm_id
      ON vineyard_spray_diary_photos(farm_id)
  `);
}
