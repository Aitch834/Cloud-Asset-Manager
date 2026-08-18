import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for Trade Body Levies & Subscriptions tables.
 * Covers: NFU, WineGB, British Wool, QMS, HCC, Red Tractor.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runTradeBodiesMigrations(): Promise<void> {
  // One registration/membership row per farm per body.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS trade_body_registrations (
      id                serial primary key,
      farm_id           integer not null references farms(id),
      body              text not null,
      membership_number text,
      registered_since  date,
      notes             text,
      created_at        timestamptz not null default now(),
      updated_at        timestamptz not null default now(),
      UNIQUE(farm_id, body)
    )
  `);

  /* period_quarter is nullable: annual-only bodies (NFU, Red Tractor, WineGB)
     leave it null; quarterly bodies (QMS, HCC, British Wool) use 1-4. */
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS trade_body_records (
      id                serial primary key,
      farm_id           integer not null references farms(id),
      body              text not null,
      period_year       integer not null,
      period_quarter    integer check (period_quarter between 1 and 4),
      category          text not null,
      quantity          numeric(14,3) not null,
      unit              text not null,
      custom_rate_pence numeric(10,4),
      notes             text,
      created_at        timestamptz not null default now(),
      updated_at        timestamptz not null default now()
    )
  `);
}
