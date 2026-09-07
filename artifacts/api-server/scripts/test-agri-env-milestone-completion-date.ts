/**
 * HTTP-level regression test for future agri-environment milestone completion dates.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:agri-env-milestone-completion-date
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runAgriEnvMigrations } from "../src/lib/agriEnvMigrations.js";

const suffix = `${Date.now()}-${process.pid}`;
const tenantSlug = `milestone-completion-date-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const today = new Date().toISOString().slice(0, 10);
const futureDate = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);

let tenantId: number | undefined;
let farmId: number | undefined;
let projectId: number | undefined;
let milestoneId: number | undefined;

function returnedId(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as { id?: number } | undefined;
  assert(row?.id, `${label} did not return an id`);
  return Number(row.id);
}

async function expectFutureDateRejection(response: Response): Promise<void> {
  const text = await response.text();
  assert.equal(response.status, 400, text);
  const body = JSON.parse(text) as { error?: string; field?: string };
  assert.equal(body.field, "completionDate");
  assert.match(body.error ?? "", /cannot be in the future/i);
}

async function main(): Promise<void> {
  await runAgriEnvMigrations();

  tenantId = returnedId(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Milestone completion date tenant ${suffix}`},
      ${tenantSlug},
      ${`milestone-date-${suffix}@example.test`}
    )
    RETURNING id
  `), "tenant");

  farmId = returnedId(await db.execute(sql`
    INSERT INTO farms (tenant_id, name)
    VALUES (${tenantId}, ${`Milestone date farm ${suffix}`})
    RETURNING id
  `), "farm");

  projectId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_projects (farm_id, scheme_name)
    VALUES (${farmId}, ${"Milestone completion date scheme"})
    RETURNING id
  `), "project");

  milestoneId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_milestones (
      farm_id, project_id, milestone_name, completion_date, status
    )
    VALUES (${farmId}, ${projectId}, ${"Existing milestone"}, ${today}, ${"completed"})
    RETURNING id
  `), "milestone");

  const { default: app } = await import("../src/app");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const baseUrl = `http://127.0.0.1:${address.port}/api/farms/${farmId}/agri-env-projects/${projectId}/milestones`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantSlug,
    };

    await expectFutureDateRejection(await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        milestoneName: "Rejected future create",
        completionDate: futureDate,
        status: "completed",
      }),
    }));

    const rejectedCreateRows = await db.execute(sql`
      SELECT id
      FROM agri_env_milestones
      WHERE project_id = ${projectId}
        AND milestone_name = ${"Rejected future create"}
    `);
    assert.equal(rejectedCreateRows.rows.length, 0, "the rejected create must not persist a milestone");

    await expectFutureDateRejection(await fetch(`${baseUrl}/${milestoneId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ completionDate: futureDate }),
    }));

    const unchangedRows = await db.execute(sql`
      SELECT completion_date
      FROM agri_env_milestones
      WHERE id = ${milestoneId}
    `);
    assert.equal(unchangedRows.rows.length, 1);
    assert.equal(
      (unchangedRows.rows[0] as { completion_date: string }).completion_date,
      today,
      "the rejected update must leave the stored completion date unchanged",
    );

    console.log("Agri-environment milestone completion date regression passed.");
    console.log("  future create: rejected and not persisted");
    console.log("  future update: rejected and existing date unchanged");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Agri-environment milestone completion date regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
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