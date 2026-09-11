/**
 * HTTP-level regression test for milestone due-date push-marker resets.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:agri-env-milestone-due-date-reset
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runAgriEnvMigrations } from "../src/lib/agriEnvMigrations.js";

const suffix = `${Date.now()}-${process.pid}`;
const tenantSlug = `milestone-due-date-reset-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

let tenantId: number | undefined;
let farmId: number | undefined;
let projectId: number | undefined;
let milestoneId: number | undefined;

function datePlusDays(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function returnedId(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as { id?: number } | undefined;
  assert(row?.id, `${label} did not return an id`);
  return Number(row.id);
}

async function readMilestone(): Promise<{
  due_date: string | null;
  push_7d_sent_at: string | null;
}> {
  const result = await db.execute(sql`
    SELECT due_date, push_7d_sent_at
    FROM agri_env_milestones
    WHERE id = ${milestoneId}
  `);
  assert.equal(result.rows.length, 1, "milestone should still exist");
  return result.rows[0] as {
    due_date: string | null;
    push_7d_sent_at: string | null;
  };
}

async function waitForMilestone(
  predicate: (row: Awaited<ReturnType<typeof readMilestone>>) => boolean,
  message: string,
): Promise<Awaited<ReturnType<typeof readMilestone>>> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const row = await readMilestone();
    if (predicate(row)) return row;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  const row = await readMilestone();
  assert.ok(predicate(row), message);
  return row;
}

async function main(): Promise<void> {
  await runAgriEnvMigrations();
  const originalDueDate = datePlusDays(14);
  const newDueDate = datePlusDays(7);

  tenantId = returnedId(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Milestone due-date reset tenant ${suffix}`},
      ${tenantSlug},
      ${`milestone-reset-${suffix}@example.test`}
    )
    RETURNING id
  `), "tenant");

  farmId = returnedId(await db.execute(sql`
    INSERT INTO farms (tenant_id, name)
    VALUES (${tenantId}, ${`Milestone reset farm ${suffix}`})
    RETURNING id
  `), "farm");

  projectId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_projects (farm_id, scheme_name)
    VALUES (${farmId}, ${"Milestone reset scheme"})
    RETURNING id
  `), "project");

  milestoneId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_milestones (
      farm_id, project_id, milestone_name, due_date, status, push_7d_sent_at
    )
    VALUES (
      ${farmId},
      ${projectId},
      ${"Evidence deadline"},
      ${originalDueDate},
      ${"pending"},
      NOW()
    )
    RETURNING id
  `), "milestone");

  const { default: app } = await import("../src/app");
  const { checkAgriEnvMilestoneDeadlines } = await import("../src/lib/alertingJob.js");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const url = `http://127.0.0.1:${address.port}/api/farms/${farmId}/agri-env-projects/${projectId}/milestones/${milestoneId}`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantSlug,
    };
    const put = async (body: Record<string, unknown>): Promise<void> => {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      assert.equal(response.status, 200, await response.text());
    };

    await put({ dueDate: originalDueDate });
    assert.ok(
      (await readMilestone()).push_7d_sent_at,
      "an unchanged due date must preserve push_7d_sent_at",
    );

    await put({ evidenceNotes: "Unrelated evidence note edit" });
    assert.ok(
      (await readMilestone()).push_7d_sent_at,
      "an unrelated milestone edit must preserve push_7d_sent_at",
    );

    await put({ dueDate: newDueDate });
    const changed = await waitForMilestone(
      (row) => row.due_date === newDueDate && row.push_7d_sent_at === null,
      "a changed due date must persist and clear push_7d_sent_at",
    );
    assert.equal(changed.due_date, newDueDate);
    assert.equal(
      changed.push_7d_sent_at,
      null,
      "a changed due date must clear push_7d_sent_at",
    );

    await checkAgriEnvMilestoneDeadlines();
    assert.ok(
      (await readMilestone()).push_7d_sent_at,
      "the reset marker must let the milestone enter the alerting job's new 7-day window",
    );

    await put({ dueDate: null });
    const cleared = await waitForMilestone(
      (row) => row.due_date === null && row.push_7d_sent_at === null,
      "an explicitly cleared due date must persist and clear push_7d_sent_at",
    );
    assert.equal(cleared.due_date, null, "an explicitly cleared due date must persist as null");
    assert.equal(
      cleared.push_7d_sent_at,
      null,
      "an explicitly cleared due date must clear push_7d_sent_at",
    );

    console.log("Agri-environment milestone due-date reset regression passed.");
    console.log("  unchanged due date: marker preserved");
    console.log("  unrelated edit: marker preserved");
    console.log("  changed due date: marker cleared and 7-day alert eligibility restored");
    console.log("  explicitly cleared due date: due date and marker cleared");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Agri-environment milestone due-date reset regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM notifications WHERE farm_id = ${farmId}`);
    }
    if (projectId !== undefined) {
      await db.execute(sql`DELETE FROM agri_env_milestones WHERE project_id = ${projectId}`);
      await db.execute(sql`DELETE FROM agri_env_projects WHERE id = ${projectId}`);
    }
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM farms WHERE id = ${farmId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await pool.end();
  });