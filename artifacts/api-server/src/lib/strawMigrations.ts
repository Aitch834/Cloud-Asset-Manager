import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the Straw Production workflow:
 *   Phase 1 — Baling Operations (straw_baling_operations)
 *   Phase 2 — Cartage Journeys  (straw_cartage_journeys)
 *   Phase 3 — Inventory link    (baling_operation_id on straw_bale_inventory)
 *
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
 */
export async function runStrawMigrations(): Promise<void> {
  // ── Phase 1: Baling Operations ───────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS straw_baling_operations (
      id                    serial PRIMARY KEY,
      farm_id               integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      field_id              integer REFERENCES fields(id) ON DELETE SET NULL,
      field_of_origin       text,
      straw_type            text NOT NULL,
      bale_format           text NOT NULL,
      crop_variety          text,
      operation_date        date NOT NULL,
      area_ha               numeric(10,4),
      total_bales_produced  integer NOT NULL DEFAULT 0,
      bale_weight_kg        numeric(7,1),
      tractor_vehicle_id    integer,
      tractor_description   text,
      baler_implement_id    integer,
      baler_description     text,
      operator_name         text,
      machine_hours         numeric(8,2),
      labour_hours          numeric(8,2),
      weather_conditions    text,
      temperature_c         numeric(5,1),
      wind_speed_kmh        numeric(5,1),
      soil_conditions       text,
      status                text NOT NULL DEFAULT 'open',
      field_operation_id    integer,
      notes                 text,
      created_at            timestamptz NOT NULL DEFAULT now(),
      updated_at            timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_baling_ops_farm ON straw_baling_operations(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_baling_ops_date ON straw_baling_operations(farm_id, operation_date)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_baling_ops_status ON straw_baling_operations(farm_id, status)`);

  // ── Phase 2: Cartage Journeys ────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS straw_cartage_journeys (
      id                    serial PRIMARY KEY,
      farm_id               integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      baling_operation_id   integer NOT NULL REFERENCES straw_baling_operations(id) ON DELETE CASCADE,
      journey_date          date NOT NULL,
      journey_time          text,
      operator_name         text,
      tractor_vehicle_id    integer,
      tractor_description   text,
      trailer_vehicle_id    integer,
      trailer_description   text,
      bales_moved           integer NOT NULL DEFAULT 0,
      from_location         text,
      to_location           text,
      to_storage_type       text,
      notes                 text,
      created_at            timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_cartage_farm ON straw_cartage_journeys(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_cartage_baling_op ON straw_cartage_journeys(baling_operation_id)`);

  // ── Phase 3: Link inventory batches back to baling operations ────────────────
  await db.execute(sql`
    ALTER TABLE straw_bale_inventory ADD COLUMN IF NOT EXISTS baling_operation_id integer REFERENCES straw_baling_operations(id) ON DELETE SET NULL
  `);

  // ── Phase 4: Moisture check device field ─────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE straw_moisture_checks ADD COLUMN IF NOT EXISTS device_used text
  `);

  // ── Phase 5: Moisture Meter Register ─────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS straw_moisture_meters (
      id                          serial PRIMARY KEY,
      farm_id                     integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      device_name                 text NOT NULL,
      make                        text,
      model                       text,
      serial_number               text,
      purchase_date               date,
      last_calibration_date       date,
      next_calibration_due        date,
      calibration_interval_months integer DEFAULT 12,
      notes                       text,
      is_active                   boolean NOT NULL DEFAULT true,
      created_at                  timestamptz NOT NULL DEFAULT now(),
      updated_at                  timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_meters_farm ON straw_moisture_meters(farm_id)`);

  // ── Phase 6: Moisture Meter Calibration Log ───────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS straw_moisture_meter_calibrations (
      id               serial PRIMARY KEY,
      farm_id          integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      meter_id         integer NOT NULL REFERENCES straw_moisture_meters(id) ON DELETE CASCADE,
      calibration_date date NOT NULL,
      performed_by     text,
      method           text,
      result           text NOT NULL DEFAULT 'Pass',
      certificate_ref  text,
      next_due         date,
      notes            text,
      created_at       timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_meter_cals_meter ON straw_moisture_meter_calibrations(meter_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_straw_meter_cals_farm ON straw_moisture_meter_calibrations(farm_id)`);
}
