import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * One-off backfills: older equipment-compliance and contractor-RAMS tasks were
 * raised before taskType/taskSourceId were set at creation, so pages that look
 * tasks up by the structured link can miss them. Mirrors the incident-task
 * backfill in farmIncidentsMigrations.ts. Idempotent — only touches rows still
 * missing the structured link (task_type defaults to 'custom', never NULL, so
 * the match must include '' and 'custom' as well as NULL).
 */
export async function runTaskLinkMigrations(): Promise<void> {
  // Equipment compliance-defect tasks: the equipment id is recoverable from
  // the task's href ("/workshop?tab=equipment&open=<id>").
  await db.execute(sql`
    UPDATE farm_task_assignments
    SET task_type = 'compliance_defect',
        task_source_id = 'equipment-' || substring(href from 'tab=equipment&open=(\\d+)')
    WHERE (task_type IS NULL OR task_type IN ('', 'custom'))
      AND (task_source_id IS NULL OR task_source_id = '')
      AND href ~ 'tab=equipment&open=\\d+'
  `);

  // Contractor RAMS review tasks (pending): the RAMS row still points at the
  // task via pending_review_task_id, so link by that direct reference.
  await db.execute(sql`
    UPDATE farm_task_assignments t
    SET task_type = 'contractor-hs-review',
        task_source_id = 'contractor-rams-' || r.id
    FROM contractor_rams r
    WHERE r.pending_review_task_id = t.id
      AND (t.task_type IS NULL OR t.task_type IN ('', 'custom'))
      AND (t.task_source_id IS NULL OR t.task_source_id = '')
  `);

  // Contractor RAMS review tasks (already reviewed — pending_review_task_id
  // was cleared): recover via the generated title
  // "Review RAMS — <activity> (<company>)", but only where that title maps to
  // exactly one RAMS row on the farm, to avoid guessing between duplicates.
  await db.execute(sql`
    UPDATE farm_task_assignments t
    SET task_type = 'contractor-hs-review',
        task_source_id = 'contractor-rams-' || m.rams_id
    FROM (
      SELECT r.farm_id,
             (array_agg(r.id))[1] AS rams_id,
             'Review RAMS — ' || r.activity_description || ' (' || c.company_name || ')' AS title
      FROM contractor_rams r
      JOIN contractors c ON c.id = r.contractor_id AND c.farm_id = r.farm_id
      GROUP BY r.farm_id, r.activity_description, c.company_name
      HAVING count(*) = 1
    ) m
    WHERE t.farm_id = m.farm_id
      AND t.title = m.title
      AND t.title LIKE 'Review RAMS — %'
      AND (t.task_type IS NULL OR t.task_type IN ('', 'custom'))
      AND (t.task_source_id IS NULL OR t.task_source_id = '')
  `);
}
