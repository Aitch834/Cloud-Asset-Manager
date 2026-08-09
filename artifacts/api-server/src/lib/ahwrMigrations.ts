import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for Annual Health & Welfare Review enhancements.
 * Safe to run on every startup — uses ADD COLUMN IF NOT EXISTS.
 */
export async function runAhwrMigrations(): Promise<void> {
  // Link to registered vet contact record in farm_contacts
  await db.execute(sql`
    ALTER TABLE annual_health_welfare_reviews
    ADD COLUMN IF NOT EXISTS vet_contact_id integer REFERENCES farm_contacts(id)
  `);
  // Who the actions were agreed with (usually vet name, auto-filled)
  await db.execute(sql`
    ALTER TABLE annual_health_welfare_reviews
    ADD COLUMN IF NOT EXISTS agreed_with text
  `);
  // Overall outcome of the review: satisfactory | action_required | urgent_action
  await db.execute(sql`
    ALTER TABLE annual_health_welfare_reviews
    ADD COLUMN IF NOT EXISTS outcome text
  `);
  // Health priorities agreed for the next 12 months
  await db.execute(sql`
    ALTER TABLE annual_health_welfare_reviews
    ADD COLUMN IF NOT EXISTS health_priorities text
  `);
}
