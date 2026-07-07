import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for LIS sync columns.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runLisMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE herd_flock_register  ADD COLUMN IF NOT EXISTS lis_herd_ref text`);
  await db.execute(sql`ALTER TABLE livestock_animals    ADD COLUMN IF NOT EXISTS lis_tag_ref text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_movement_ref text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_source text`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_raw_data jsonb`);
  await db.execute(sql`ALTER TABLE livestock_movements  ADD COLUMN IF NOT EXISTS lis_imported_at timestamptz`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_last_synced_at timestamptz`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_last_sync_summary text`);
  await db.execute(sql`ALTER TABLE lis_farm_tokens      ADD COLUMN IF NOT EXISTS lis_sync_history jsonb`);

  // LIS LIP (Livestock Information Platform) — Cattle Auth Foundation
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lip_farm_tokens (
      id serial primary key,
      farm_id integer not null unique references farms(id),
      is_configured boolean not null default false,
      test_status text,
      test_message text,
      last_tested_at timestamptz,
      platform_access_token text,
      token_expires_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  // Additional columns added to lip_farm_tokens after initial creation
  await db.execute(sql`ALTER TABLE lip_farm_tokens ADD COLUMN IF NOT EXISTS sandbox_mode boolean NOT NULL DEFAULT true`);
  await db.execute(sql`ALTER TABLE lip_farm_tokens ADD COLUMN IF NOT EXISTS lip_refresh_token text`);
  await db.execute(sql`ALTER TABLE lip_farm_tokens ADD COLUMN IF NOT EXISTS oauth_state text`);

  // Field Season Expenses — miscellaneous per-season costs (agronomy, drying, haulage, etc.)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS field_season_expenses (
      id serial primary key,
      farm_id integer not null references farms(id),
      field_crop_assignment_id integer not null references field_crop_assignments(id),
      field_id integer not null references fields(id),
      expense_date date not null,
      category text not null,
      description text not null,
      amount_pence integer not null,
      notes text,
      created_at timestamptz not null default now()
    )
  `);

  // Delivery-linked costing — Option B schema additions
  await db.execute(sql`
    ALTER TABLE nvz_fertiliser_applications
      ADD COLUMN IF NOT EXISTS stock_item_id integer,
      ADD COLUMN IF NOT EXISTS stock_delivery_id integer,
      ADD COLUMN IF NOT EXISTS batch_number text,
      ADD COLUMN IF NOT EXISTS lot_number text,
      ADD COLUMN IF NOT EXISTS application_rate_kg_ha numeric(10,2),
      ADD COLUMN IF NOT EXISTS unit_cost_pence_per_tonne integer
  `);
  await db.execute(sql`
    ALTER TABLE seed_drilling_records
      ADD COLUMN IF NOT EXISTS stock_item_id integer,
      ADD COLUMN IF NOT EXISTS stock_delivery_id integer,
      ADD COLUMN IF NOT EXISTS batch_number text
  `);
  await db.execute(sql`
    ALTER TABLE fuel_usage
      ADD COLUMN IF NOT EXISTS cost_pence_per_litre integer
  `);

  // LIS LIP Submission Log — tracks every cattle movement/birth/death submission via LIP API
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lip_submissions (
      id serial primary key,
      farm_id integer not null references farms(id),
      movement_id integer references livestock_movements(id),
      mortality_id integer references livestock_mortality(id),
      calving_id integer references dairy_calving_records(id),
      submission_type text not null,
      status text not null default 'pending',
      sandbox_mode boolean not null default true,
      submitted_at timestamptz,
      acknowledged_at timestamptz,
      lip_reference text,
      error_message text,
      request_payload jsonb,
      response_payload jsonb,
      retry_count integer not null default 0,
      submitted_by_user_id integer,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  // LIS LIP Lost & Found — report of lost, found or stolen cattle
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lip_lost_found (
      id serial primary key,
      farm_id integer not null references farms(id),
      ear_tag text not null,
      site_identifier text,
      status text not null,
      event_date date not null,
      crime_reference_number text,
      found_dead boolean,
      lip_reference text,
      lip_status text not null default 'pending',
      sandbox_mode boolean not null default true,
      notes text,
      request_payload jsonb,
      response_payload jsonb,
      error_message text,
      submitted_at timestamptz,
      submitted_by_user_id integer,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  // Additional action columns on lip_submissions — for confirm/reject/cancel flows
  await db.execute(sql`ALTER TABLE lip_submissions ADD COLUMN IF NOT EXISTS confirmed_at timestamptz`);
  await db.execute(sql`ALTER TABLE lip_submissions ADD COLUMN IF NOT EXISTS confirmed_action text`);
  await db.execute(sql`ALTER TABLE lip_submissions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz`);
}
