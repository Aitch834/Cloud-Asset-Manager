import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the Farm Incidents register.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runFarmIncidentsMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS farm_incidents (
      id                     SERIAL PRIMARY KEY,
      farm_id                INTEGER NOT NULL REFERENCES farms(id),
      date_discovered        TEXT NOT NULL,
      date_occurred          TEXT,
      incident_type          TEXT NOT NULL,
      field_id               INTEGER REFERENCES fields(id),
      location_description   TEXT NOT NULL,
      description            TEXT NOT NULL,
      estimated_loss_value   TEXT,
      area_quantity_affected TEXT,
      police_attended        BOOLEAN NOT NULL DEFAULT FALSE,
      police_ref_number      TEXT,
      fire_attended          BOOLEAN NOT NULL DEFAULT FALSE,
      fire_ref_number        TEXT,
      ea_attended            BOOLEAN NOT NULL DEFAULT FALSE,
      ea_ref_number          TEXT,
      crime_reference        TEXT,
      status                 TEXT NOT NULL DEFAULT 'reported',
      insurance_policy_id    INTEGER REFERENCES farm_insurance(id),
      insurance_claim_ref    TEXT,
      insurance_claim_date   TEXT,
      settlement_amount      TEXT,
      settlement_date        TEXT,
      insurer_contact        TEXT,
      notes                  TEXT,
      created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
