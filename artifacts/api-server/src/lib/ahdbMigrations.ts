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
}
