import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for planner/task-assignment duration columns.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runPlannerMigrations(): Promise<void> {
  await db.execute(sql`ALTER TABLE farm_planner_events     ADD COLUMN IF NOT EXISTS end_date timestamptz`);
  await db.execute(sql`ALTER TABLE farm_task_assignments   ADD COLUMN IF NOT EXISTS end_date text`);
}
