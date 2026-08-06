import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for AI pest trap capture tables (SWD & flying pest
 * monitoring). Safe to run on every startup — CREATE TABLE IF NOT EXISTS.
 */
export async function runPestTrapMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pest_trap_captures (
      id                  serial PRIMARY KEY,
      farm_id             integer NOT NULL REFERENCES farms(id),
      block_id            integer REFERENCES vineyard_blocks(id),
      capture_date        date NOT NULL,
      trap_ref            text,
      trap_type           text,
      recorded_by         text,
      latitude            numeric(10,7),
      longitude           numeric(10,7),
      photo_object_path   text,
      photo_file_name     text,
      analysis_status     text DEFAULT 'pending',
      swd_male_count      integer,
      swd_female_count    integer,
      other_pests         jsonb DEFAULT '[]'::jsonb,
      total_insect_count  integer,
      pest_pressure       text,
      ai_summary          text,
      ai_model            text,
      analysis_error      text,
      notes               text,
      created_at          timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ptc_farm_id  ON pest_trap_captures(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_ptc_block_id ON pest_trap_captures(block_id)`);

  console.log("[PEST-TRAP-MIGRATE] Done.");
}
