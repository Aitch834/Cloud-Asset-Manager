import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for:
 *   1. Woodland & Tree Felling compliance (felling_licences, tree_felling_records)
 *      — Forestry Commission (England) felling licence + exemption evidence rules,
 *        updated guidance published 8 July 2026.
 *   2. Regenerative Farming evidence (regen_practice_records, regen_soil_indicators)
 *      — practice records per six regen principles + outcome-based soil indicators.
 *
 * Safe to run on every startup — CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS,
 * with farm-isolation RLS policies matching rls_resource_tables.sql conventions.
 */

const RLS_TABLES = [
  "felling_licences",
  "tree_felling_records",
  "regen_practice_records",
  "regen_soil_indicators",
] as const;

export async function runWoodlandRegenMigrations(): Promise<void> {
  // ── Felling Licences ─────────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS felling_licences (
      id                        serial PRIMARY KEY,
      farm_id                   integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      licence_number            text,
      status                    text NOT NULL DEFAULT 'planned',
      felling_type              text,
      area_description          text,
      area_hectares             numeric(10,4),
      estimated_volume_m3       numeric(10,2),
      application_date          date,
      approval_date             date,
      expiry_date               date,
      restocking_required       boolean NOT NULL DEFAULT true,
      restocking_conditions     text,
      restocking_deadline       date,
      restocking_completed_date date,
      notes                     text,
      created_at                timestamptz NOT NULL DEFAULT now(),
      updated_at                timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_felling_licences_farm ON felling_licences(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_felling_licences_status ON felling_licences(farm_id, status)`);

  // ── Tree Felling Records ─────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tree_felling_records (
      id              serial PRIMARY KEY,
      farm_id         integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      licence_id      integer REFERENCES felling_licences(id) ON DELETE SET NULL,
      field_id        integer REFERENCES fields(id) ON DELETE SET NULL,
      felling_date    date NOT NULL,
      location        text,
      species         text,
      tree_count      integer,
      volume_m3       numeric(10,2),
      volume_sold_m3  numeric(10,2),
      legal_basis     text NOT NULL DEFAULT 'licence',
      purpose         text,
      contractor      text,
      evidence_notes  text,
      notes           text,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tree_felling_farm ON tree_felling_records(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tree_felling_date ON tree_felling_records(farm_id, felling_date)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tree_felling_licence ON tree_felling_records(licence_id)`);

  // ── Regenerative Practice Records ────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS regen_practice_records (
      id             serial PRIMARY KEY,
      farm_id        integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      field_id       integer REFERENCES fields(id) ON DELETE SET NULL,
      field_name     text,
      record_date    date NOT NULL,
      season_year    integer,
      principle      text NOT NULL,
      practice       text NOT NULL,
      area_hectares  numeric(10,2),
      details        text,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_regen_practices_farm ON regen_practice_records(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_regen_practices_year ON regen_practice_records(farm_id, season_year)`);

  // ── Regenerative Soil Health Indicators ──────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS regen_soil_indicators (
      id                      serial PRIMARY KEY,
      farm_id                 integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      field_id                integer REFERENCES fields(id) ON DELETE SET NULL,
      field_name              text,
      test_date               date NOT NULL,
      sample_depth_cm         integer,
      organic_matter_percent  numeric(5,2),
      worm_count              integer,
      vess_score              integer,
      infiltration_seconds    integer,
      bulk_density_g_cm3      numeric(5,2),
      lab_name                text,
      notes                   text,
      created_at              timestamptz NOT NULL DEFAULT now(),
      updated_at              timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_regen_soil_farm ON regen_soil_indicators(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_regen_soil_date ON regen_soil_indicators(farm_id, test_date)`);

  // ── Row-Level Security: farm isolation (fail-open when setting unset) ────────
  for (const table of RLS_TABLES) {
    await db.execute(sql.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
    await db.execute(sql.raw(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`));
    await db.execute(sql.raw(`DROP POLICY IF EXISTS ${table}_farm_isolation ON ${table}`));
    await db.execute(sql.raw(`
      CREATE POLICY ${table}_farm_isolation ON ${table}
        FOR ALL
        USING (
          current_setting('app.current_farm_id', true) IS NULL
          OR current_setting('app.current_farm_id', true) = ''
          OR farm_id = current_setting('app.current_farm_id', true)::integer
        )
    `));
  }
}
