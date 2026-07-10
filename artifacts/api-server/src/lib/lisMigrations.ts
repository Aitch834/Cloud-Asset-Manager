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
  // Async processing — stores the UUID returned by 202 AsyncAcceptedResponse so we can poll GET /requeststatus/{id}
  await db.execute(sql`ALTER TABLE lip_submissions ADD COLUMN IF NOT EXISTS async_request_id text`);

  // ── Red Tractor Gap 1: Incoming livestock isolation / quarantine register ──
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS livestock_isolation_records (
      id serial primary key,
      farm_id integer not null references farms(id),
      herd_id integer references herd_flock_register(id),
      species text not null,
      animal_count integer,
      ear_tags_range text,
      source_holding_cph text,
      source_name text,
      purchased_from text,
      isolation_location text not null,
      isolation_start_date date not null,
      minimum_isolation_days integer not null default 21,
      target_clearance_date date,
      status text not null default 'active',
      cleared_date date,
      cleared_by text,
      clearance_notes text,
      veterinarian_name text,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS livestock_isolation_health_checks (
      id serial primary key,
      farm_id integer not null references farms(id),
      isolation_record_id integer not null references livestock_isolation_records(id),
      check_date date not null,
      checked_by text not null,
      overall_status text not null,
      temperature_celsius numeric(4,1),
      body_condition_score numeric(3,1),
      observations text,
      action_taken text,
      vet_contacted_name text,
      created_at timestamptz not null default now()
    )
  `);

  // ── Red Tractor Gap 2: Grassland & pasture management ─────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS grassland_grazing_events (
      id serial primary key,
      farm_id integer not null references farms(id),
      field_id integer not null references fields(id),
      herd_id integer,
      entry_date date not null,
      exit_date date,
      grazing_system text,
      species text,
      animal_count integer,
      pre_grazing_cover_mm integer,
      post_grazing_residual_mm integer,
      manure_applied_before_entry boolean default false,
      notes text,
      created_at timestamptz not null default now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS grassland_reseeding_records (
      id serial primary key,
      farm_id integer not null references farms(id),
      field_id integer not null references fields(id),
      reseeding_date date not null,
      reason text not null,
      seed_mix text,
      seed_rate_kg_ha numeric(6,2),
      method text,
      area_ha numeric(10,4),
      target_establishment_date date,
      actual_establishment_date date,
      establishment_success text,
      notes text,
      created_at timestamptz not null default now()
    )
  `);

  // ── Red Tractor Gap 3: Poultry chick/poult quality assessment at placement ─
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS poultry_placement_quality_assessments (
      id serial primary key,
      farm_id integer not null references farms(id),
      flock_id integer not null references poultry_flocks(id),
      assessment_date date not null,
      assessed_by text not null,
      arrival_temperature_celsius numeric(4,1),
      navel_condition text not null,
      leg_condition text not null,
      activity_level text not null,
      uniformity_percent numeric(5,1),
      cull_count_at_placement integer,
      cull_percent_at_placement numeric(5,2),
      overall_quality_score text not null,
      action_taken text,
      hatchery_notified boolean default false,
      hatchery_response_notes text,
      notes text,
      created_at timestamptz not null default now()
    )
  `);

  // ── Red Tractor Gap 4: Beekeeper / neighbour spray notification log ────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS spray_notifications (
      id serial primary key,
      farm_id integer not null references farms(id),
      spray_application_id integer references spray_applications(id),
      notification_date date not null,
      planned_spray_date date,
      recipient_type text not null,
      recipient_name text not null,
      contact_method text not null,
      products_notified text,
      field_refs text,
      confirmed boolean not null default false,
      confirmation_method text,
      confirmation_reference text,
      notes text,
      created_at timestamptz not null default now()
    )
  `);

  // ── Spray compliance: product expiry date ─────────────────────────────────
  await db.execute(sql`ALTER TABLE spray_products ADD COLUMN IF NOT EXISTS expiry_date date`);

  // ── Spray compliance: container disposal log ──────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS spray_container_disposal_logs (
      id serial primary key,
      farm_id integer not null references farms(id),
      disposal_date date not null,
      product_id integer references spray_products(id),
      product_name text,
      container_count integer,
      container_size_l numeric(8,2),
      disposal_method text,
      waste_contractor_name text,
      waste_transfer_ref text,
      rinsed_on_site boolean,
      operator_name text,
      operator_member_id integer references farm_members(id),
      document_path text,
      document_name text,
      notes text,
      created_at timestamptz not null default now()
    )
  `);

  // ── Spray compliance: pesticide store inspection record ───────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS spray_store_inspections (
      id serial primary key,
      farm_id integer not null references farms(id),
      inspection_date date not null,
      inspected_by_name text,
      inspected_by_id integer references farm_members(id),
      inspection_type text not null default 'routine',
      store_location text,
      locked boolean,
      bunded boolean,
      emergency_card_posted boolean,
      coshh_assessed boolean,
      signage_present boolean,
      ventilation_adequate boolean,
      separate_from_seed boolean,
      no_obvious_leaks boolean,
      passed boolean,
      condition_notes text,
      action_required text,
      action_due_date date,
      next_inspection_due date,
      document_path text,
      document_name text,
      notes text,
      created_at timestamptz not null default now()
    )
  `);
}
