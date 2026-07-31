#!/usr/bin/env node
// Push farm_incidents table — run once: node artifacts/api-server/scripts/push-farm-incidents.mjs
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS farm_incidents (
        id                    SERIAL PRIMARY KEY,
        farm_id               INTEGER NOT NULL REFERENCES farms(id),
        date_discovered       TEXT NOT NULL,
        date_occurred         TEXT,
        incident_type         TEXT NOT NULL,
        field_id              INTEGER REFERENCES fields(id),
        location_description  TEXT NOT NULL,
        description           TEXT NOT NULL,
        estimated_loss_value  TEXT,
        area_quantity_affected TEXT,
        police_attended       BOOLEAN NOT NULL DEFAULT FALSE,
        police_ref_number     TEXT,
        fire_attended         BOOLEAN NOT NULL DEFAULT FALSE,
        fire_ref_number       TEXT,
        ea_attended           BOOLEAN NOT NULL DEFAULT FALSE,
        ea_ref_number         TEXT,
        crime_reference       TEXT,
        status                TEXT NOT NULL DEFAULT 'reported',
        insurance_policy_id   INTEGER REFERENCES farm_insurance(id),
        insurance_claim_ref   TEXT,
        insurance_claim_date  TEXT,
        settlement_amount     TEXT,
        settlement_date       TEXT,
        insurer_contact       TEXT,
        notes                 TEXT,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ farm_incidents table created (or already exists)");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
