import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for viticulture-specific tables that are not in the
 * main drizzle schema push (frost events, cane weights, etc.).
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runViticultureMigrations(): Promise<void> {
  // Frost events — seasonal risk log, may be farm-wide or per-block
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vineyard_frost_events (
      id                        serial PRIMARY KEY,
      farm_id                   integer NOT NULL REFERENCES farms(id),
      block_id                  integer REFERENCES vineyard_blocks(id),
      frost_date                date    NOT NULL,
      severity                  text    NOT NULL DEFAULT 'moderate',
      min_temp_c                numeric(5,2),
      duration_hours            numeric(5,1),
      bbch_stage_at_frost       text,
      estimated_damage_percent  integer,
      damaged_vines_count       integer,
      notes                     text,
      created_at                timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vfe_farm_id  ON vineyard_frost_events(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vfe_frost_date ON vineyard_frost_events(frost_date DESC)`);

  // Cane weights — vine vigour metric recorded at pruning time
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vineyard_cane_weights (
      id                            serial PRIMARY KEY,
      farm_id                       integer NOT NULL REFERENCES farms(id),
      block_id                      integer REFERENCES vineyard_blocks(id),
      measured_date                 date    NOT NULL,
      vines_sampled                 integer,
      average_cane_weight_g         numeric(8,2),
      total_cane_weight_kg_per_vine numeric(8,3),
      shoots_per_vine               numeric(6,1),
      buds_per_cane                 numeric(5,1),
      ravaz_index                   numeric(6,3),
      operator_name                 text,
      notes                         text,
      created_at                    timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vcw_farm_id     ON vineyard_cane_weights(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vcw_measured_date ON vineyard_cane_weights(measured_date DESC)`);
}
