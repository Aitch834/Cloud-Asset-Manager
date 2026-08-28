import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for AHDB Levy Management tables.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
 */
export async function runAhdbMigrations(): Promise<void> {
  // One registration row per farm per sector — stores the AHDB levy/membership number.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ahdb_registrations (
      id            serial primary key,
      farm_id       integer not null references farms(id),
      sector        text not null,
      membership_number text,
      registered_since  date,
      notes         text,
      created_at    timestamptz not null default now(),
      updated_at    timestamptz not null default now(),
      UNIQUE(farm_id, sector)
    )
  `);

  // Individual levy-eligible quantity entries (one per commodity per quarter).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ahdb_levy_records (
      id              serial primary key,
      farm_id         integer not null references farms(id),
      sector          text not null,
      period_year     integer not null,
      period_quarter  integer not null check (period_quarter between 1 and 4),
      commodity       text not null,
      quantity        numeric(14,3) not null,
      unit            text not null,
      custom_rate_pence numeric(10,4),
      notes           text,
      created_at      timestamptz not null default now(),
      updated_at      timestamptz not null default now()
    )
  `);

  // Farm-side records of decisions made using AHDB's hosted BYDV tool.
  // BDE stores the user's inputs and recorded outcome; it does not reproduce
  // or claim ownership of AHDB's risk model.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bydv_assessments (
      id                     serial primary key,
      farm_id                integer not null references farms(id) on delete cascade,
      field_id               integer not null references fields(id) on delete cascade,
      assessment_date        date not null,
      assessment_mode        text not null check (assessment_mode in ('spray_decision', 'sow_decision')),
      crop_type              text not null check (crop_type in ('winter_wheat', 'winter_barley')),
      variety                text,
      sow_date               date not null,
      emergence_date         date,
      surrounded_by_arable   boolean not null default false,
      insecticide_programme  text,
      result_status          text not null,
      result_notes           text,
      internal_decision      text not null,
      assessor_name          text,
      source_url             text not null default 'https://bydvtool.ahdb.org.uk/',
      created_at             timestamptz not null default now(),
      updated_at             timestamptz not null default now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS bydv_assessments_farm_field_date_idx
      ON bydv_assessments (farm_id, field_id, assessment_date DESC)
  `);
  await db.execute(sql`ALTER TABLE bydv_assessments ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE bydv_assessments FORCE ROW LEVEL SECURITY`);
  await db.execute(sql`DROP POLICY IF EXISTS bydv_assessments_farm_isolation ON bydv_assessments`);
  await db.execute(sql`
    CREATE POLICY bydv_assessments_farm_isolation ON bydv_assessments
      FOR ALL
      USING (
        current_setting('app.current_farm_id', true) IS NULL
        OR current_setting('app.current_farm_id', true) = ''
        OR farm_id = current_setting('app.current_farm_id', true)::integer
      )
      WITH CHECK (
        current_setting('app.current_farm_id', true) IS NULL
        OR current_setting('app.current_farm_id', true) = ''
        OR farm_id = current_setting('app.current_farm_id', true)::integer
      )
  `);
}
