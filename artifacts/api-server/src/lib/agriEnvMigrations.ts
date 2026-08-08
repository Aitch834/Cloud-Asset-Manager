import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Idempotent migrations for agri-environment scheme tracking:
 *   1. agri_env_projects  — one row per agreement/scheme (FiPL, SFI, CS, ELMs, etc.)
 *   2. agri_env_milestones — milestone / claim rows within a project
 *
 * Safe to run on every startup — CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
 */
export async function runAgriEnvMigrations(): Promise<void> {
  // ── agri_env_projects ────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS agri_env_projects (
      id                      serial PRIMARY KEY,
      farm_id                 integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      scheme_name             text NOT NULL,
      administering_body      text,
      agreement_reference     text,
      designated_landscape    text,
      theme                   text,
      start_date              date,
      end_date                date,
      total_grant_value_pence integer,
      status                  text NOT NULL DEFAULT 'active',
      notes                   text,
      created_at              timestamptz NOT NULL DEFAULT now(),
      updated_at              timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_agri_env_projects_farm ON agri_env_projects(farm_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_agri_env_projects_status ON agri_env_projects(farm_id, status)`);

  // ── agri_env_milestones ──────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS agri_env_milestones (
      id                  serial PRIMARY KEY,
      farm_id             integer NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
      project_id          integer NOT NULL REFERENCES agri_env_projects(id) ON DELETE CASCADE,
      milestone_name      text NOT NULL,
      due_date            date,
      completion_date     date,
      claim_amount_pence  integer,
      status              text NOT NULL DEFAULT 'pending',
      evidence_notes      text,
      created_at          timestamptz NOT NULL DEFAULT now(),
      updated_at          timestamptz NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_agri_env_milestones_project ON agri_env_milestones(project_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_agri_env_milestones_farm ON agri_env_milestones(farm_id)`);
}
