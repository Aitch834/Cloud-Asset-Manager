import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for poultry gaps: placement delivery fields,
 * HPAI zone tracking, inter-site transfers, and transport welfare logs.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.
 */
export async function runPoultryMigrations(): Promise<void> {
  // ── Flock placement delivery & organic fields ─────────────────────────────
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS supplier_organic_cert text`);
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS transit_mortality integer`);
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS delivery_company text`);
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS delivery_vehicle_reg text`);
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS delivery_driver text`);
  await db.execute(sql`ALTER TABLE poultry_flocks ADD COLUMN IF NOT EXISTS derogation_ref text`);

  // ── HPAI zone tracking on farms ───────────────────────────────────────────
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS hpai_zone_status text`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS hpai_zone_date text`);
  await db.execute(sql`ALTER TABLE farms ADD COLUMN IF NOT EXISTS hpai_housing_required_since text`);

  // ── Inter-site transfer records ───────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poultry_inter_site_transfers (
      id serial primary key,
      farm_id integer not null references farms(id),
      flock_id integer references poultry_flocks(id),
      to_cph text,
      to_farm_name text not null,
      transfer_date date not null,
      quantity_transferred integer not null,
      reason text,
      transport_company text,
      vehicle_reg text,
      driver_name text,
      estimated_journey_hours numeric(4,1),
      notes text,
      created_at timestamp not null default now()
    )
  `);

  // ── Transport welfare logs ────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poultry_transport_welfare (
      id serial primary key,
      farm_id integer not null references farms(id),
      flock_id integer references poultry_flocks(id),
      journey_date date not null,
      journey_purpose text not null,
      vehicle_reg text,
      driver_name text,
      transporter_authorisation_no text,
      journey_start_time text,
      journey_end_time text,
      journey_distance_km numeric(8,1),
      stocking_density_birds_m2 numeric(6,2),
      temperature_adequate boolean,
      water_provision boolean,
      ventilation_adequate boolean,
      birds_dead_on_arrival integer default 0,
      overall_welfare_assessment text not null default 'not_assessed',
      notes text,
      created_at timestamp not null default now()
    )
  `);
}
