import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for pig inventory counts and pig death records.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runPigInventoryDeathMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pig_inventory_records (
      id serial primary key,
      farm_id integer not null references farms(id),
      flock_id integer references herd_flock_register(id),
      group_name text,
      count_date date not null,
      sow_count integer not null default 0,
      boar_count integer not null default 0,
      piglet_count integer not null default 0,
      weaner_count integer not null default 0,
      grower_count integer not null default 0,
      finisher_count integer not null default 0,
      total_count integer not null default 0,
      counted_by text,
      notes text,
      created_at timestamp not null default now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pig_death_records (
      id serial primary key,
      farm_id integer not null references farms(id),
      flock_id integer references herd_flock_register(id),
      group_name text,
      death_date date not null,
      number_of_animals integer not null default 1,
      ear_tag_or_id text,
      cause_of_death text not null,
      disposal_method text not null,
      vet_attended boolean not null default false,
      apha_notified boolean not null default false,
      notes text,
      created_at timestamp not null default now()
    )
  `);
}
