import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

type SqlExecutor = Pick<typeof db, "execute">;

export async function repairPhenologyPlantingLinks(executor: SqlExecutor = db): Promise<number> {
  const result = await executor.execute(sql`
    WITH desired_plantings AS (
      SELECT
        phenology.id,
        CASE
          WHEN phenology.block_id IS NULL THEN NULL
          ELSE COALESCE(
            (
              SELECT linked_planting.id
              FROM vineyard_block_plantings AS linked_planting
              WHERE linked_planting.id = phenology.planting_id
                AND linked_planting.block_id = phenology.block_id
                AND linked_planting.farm_id = phenology.farm_id
              LIMIT 1
            ),
            (
              SELECT active_planting.id
              FROM vineyard_block_plantings AS active_planting
              WHERE active_planting.block_id = phenology.block_id
                AND active_planting.farm_id = phenology.farm_id
                AND active_planting.status = 'active'
              ORDER BY active_planting.id DESC
              LIMIT 1
            )
          )
        END AS planting_id
      FROM vineyard_phenology AS phenology
    )
    UPDATE vineyard_phenology AS phenology
    SET planting_id = desired_plantings.planting_id
    FROM desired_plantings
    WHERE phenology.id = desired_plantings.id
      AND phenology.planting_id IS DISTINCT FROM desired_plantings.planting_id
    RETURNING phenology.id
  `);

  return result.rowCount ?? 0;
}

/**
 * Idempotent migrations for viticulture-specific tables that are not in the
 * main drizzle schema push (frost events, cane weights, etc.).
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runViticultureMigrations(): Promise<void> {
  // Reconcile legacy phenology rows created before block changes also updated
  // planting_id. A valid historical planting on the same farm and block is
  // preserved even when it is no longer active; only mismatched links resolve
  // to the block's current active planting. NULL-safe comparison makes reruns
  // no-ops once all rows are correct.
  const correctedPhenologyRows = await repairPhenologyPlantingLinks();
  console.log(
    `[VITICULTURE-MIGRATE] Phenology planting repair corrected ${correctedPhenologyRows} row(s)`,
  );

  // Harvest interval acknowledgement evidence. Nullable columns preserve the
  // distinction between legacy records and records entered with no warning.
  await db.execute(sql`
    ALTER TABLE vineyard_harvest
      ADD COLUMN IF NOT EXISTS harvest_interval_warning_acknowledged boolean,
      ADD COLUMN IF NOT EXISTS harvest_interval_acknowledged_at timestamptz,
      ADD COLUMN IF NOT EXISTS harvest_interval_products jsonb
  `);

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
