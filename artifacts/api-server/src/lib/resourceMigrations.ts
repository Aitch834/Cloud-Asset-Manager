import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for the Resource Planner tables.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 */
export async function runResourceMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS farm_resources (
      id           serial PRIMARY KEY,
      farm_id      integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      name         text NOT NULL,
      type         text NOT NULL,
      description  text,
      colour       text NOT NULL DEFAULT 'slate',
      is_active    boolean NOT NULL DEFAULT true,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS farm_task_resource_allocations (
      id              serial PRIMARY KEY,
      farm_id         integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      resource_id     integer NOT NULL REFERENCES farm_resources(id) ON DELETE CASCADE,
      task_ref        text NOT NULL,
      task_title      text,
      allocated_date  text NOT NULL,
      notes           text,
      created_at      timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_farm_resources_farm_id ON farm_resources(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_task_resource_allocs_farm_id ON farm_task_resource_allocations(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_task_resource_allocs_task_ref ON farm_task_resource_allocations(task_ref)`);
  // Columns added after initial release — safe to add if not present
  await db.execute(sql`ALTER TABLE farm_task_resource_allocations ADD COLUMN IF NOT EXISTS start_time text`);
  await db.execute(sql`ALTER TABLE farm_task_resource_allocations ADD COLUMN IF NOT EXISTS end_time text`);
  await db.execute(sql`ALTER TABLE farm_task_resource_allocations ADD COLUMN IF NOT EXISTS task_assignment_id integer`);
}
