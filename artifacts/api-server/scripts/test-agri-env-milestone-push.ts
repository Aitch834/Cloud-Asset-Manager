/**
 * Regression test for 7-day agri-environment milestone push notifications.
 *
 * The test creates a milestone due exactly seven days from today, registers an
 * active Expo token for its tenant, and replaces fetch only for the duration of
 * the alerting job. It verifies the payload sent to Expo, the sent timestamp,
 * the no-duplicate guard, and terminal-status skips.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:agri-env-milestone-push
 */

import assert from "node:assert/strict";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runAgriEnvMigrations } from "../src/lib/agriEnvMigrations.js";

type ExpoRequest = {
  url: string;
  payload: Record<string, unknown>;
};

type ExpoOutcome = "http-error" | "rejected" | "accepted";

function datePlusDays(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const suffix = `${Date.now()}-${process.pid}`;
  const slug = `agri-env-push-${suffix}`;
  const userId = `agri-env-push-user-${suffix}`;
  const token = `ExponentPushToken[agri-env-push-${suffix}]`;
  const testEmail = `agri-env-push-${suffix}@example.test`;
  const dueDate = datePlusDays(7);
  const expoRequests: ExpoRequest[] = [];
  const expoOutcomes: ExpoOutcome[] = ["http-error", "rejected", "accepted"];

  let tenantId: number | undefined;
  let farmId: number | undefined;
  let projectId: number | undefined;
  let milestoneId: number | undefined;
  let paidMilestoneId: number | undefined;
  let cancelledMilestoneId: number | undefined;
  let roleId: number | undefined;
  const originalFetch = globalThis.fetch;

  try {
    await runAgriEnvMigrations();
    const { checkAgriEnvMilestoneDeadlines } = await import("../src/lib/alertingJob.js");

    globalThis.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const [input, init] = args;
      const body = typeof init?.body === "string" ? init.body : "";
      const outcome = expoOutcomes.shift();
      expoRequests.push({
        url: String(input),
        payload: JSON.parse(body) as Record<string, unknown>,
      });
      assert.ok(outcome, "the test received an unexpected extra Expo request");
      return new Response(JSON.stringify({
        data: { status: outcome === "accepted" ? "ok" : "error" },
      }), {
        status: outcome === "http-error" ? 503 : 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const roleRows = await db.execute(sql`
      INSERT INTO roles (name, is_system_role)
      VALUES (${`Agri environment push test role ${suffix}`}, true)
      RETURNING id
    `);
    roleId = Number((roleRows.rows[0] as { id: number }).id);

    const tenantRows = await db.execute(sql`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES (${`Agri environment push test ${suffix}`}, ${slug}, ${testEmail})
      RETURNING id
    `);
    tenantId = Number((tenantRows.rows[0] as { id: number }).id);

    const farmRows = await db.execute(sql`
      INSERT INTO farms (tenant_id, name)
      VALUES (${tenantId}, ${`Push test farm ${suffix}`})
      RETURNING id
    `);
    farmId = Number((farmRows.rows[0] as { id: number }).id);

    const projectRows = await db.execute(sql`
      INSERT INTO agri_env_projects (farm_id, scheme_name)
      VALUES (${farmId}, ${"Push test scheme"})
      RETURNING id
    `);
    projectId = Number((projectRows.rows[0] as { id: number }).id);

    const milestoneRows = await db.execute(sql`
      INSERT INTO agri_env_milestones (farm_id, project_id, milestone_name, due_date, status)
      VALUES (${farmId}, ${projectId}, ${"Seven-day evidence submission"}, ${dueDate}, ${"pending"})
      RETURNING id
    `);
    milestoneId = Number((milestoneRows.rows[0] as { id: number }).id);

    const paidRows = await db.execute(sql`
      INSERT INTO agri_env_milestones (farm_id, project_id, milestone_name, due_date, status)
      VALUES (${farmId}, ${projectId}, ${"Already paid milestone"}, ${dueDate}, ${"paid"})
      RETURNING id
    `);
    paidMilestoneId = Number((paidRows.rows[0] as { id: number }).id);

    const cancelledRows = await db.execute(sql`
      INSERT INTO agri_env_milestones (farm_id, project_id, milestone_name, due_date, status)
      VALUES (${farmId}, ${projectId}, ${"Cancelled milestone"}, ${dueDate}, ${"cancelled"})
      RETURNING id
    `);
    cancelledMilestoneId = Number((cancelledRows.rows[0] as { id: number }).id);

    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (${userId}, ${testEmail}, ${"Push"}, ${"Tester"})
    `);
    await db.execute(sql`
      INSERT INTO user_tenants (user_id, tenant_id, role_id, is_active)
      VALUES (${userId}, ${tenantId}, ${roleId}, true)
    `);
    await db.execute(sql`
      INSERT INTO expo_push_tokens (user_id, farm_id, expo_push_token, platform)
      VALUES (${userId}, ${farmId}, ${token}, ${"test"})
    `);

    await checkAgriEnvMilestoneDeadlines();

    assert.equal(expoRequests.length, 1, "the 7-day milestone should produce one Expo request");
    assert.equal(expoRequests[0]?.url, "https://exp.host/--/api/v2/push/send");
    assert.deepEqual(expoRequests[0]?.payload, {
      to: token,
      sound: "default",
      title: "Grant Milestone Due Soon",
      body: "Push test scheme: Seven-day evidence submission — due in 7 days",
      data: { href: "/agri-env-projects" },
    });

    const afterHttpFailureRows = await db.execute(sql`
      SELECT push_7d_sent_at
      FROM agri_env_milestones
      WHERE id = ${milestoneId}
    `);
    assert.equal(
      (afterHttpFailureRows.rows[0] as { push_7d_sent_at: string | null }).push_7d_sent_at,
      null,
      "a non-2xx Expo response must leave push_7d_sent_at unset",
    );

    await checkAgriEnvMilestoneDeadlines();
    assert.equal(expoRequests.length, 1, "an active push lease must prevent an immediate retry");

    await db.execute(sql`
      UPDATE agri_env_milestones
      SET push_7d_claimed_at = NOW() - INTERVAL '61 minutes'
      WHERE id = ${milestoneId}
    `);
    await checkAgriEnvMilestoneDeadlines();
    assert.equal(expoRequests.length, 2, "the push should retry after the failed-send lease expires");

    const afterRejectedTicketRows = await db.execute(sql`
      SELECT push_7d_sent_at
      FROM agri_env_milestones
      WHERE id = ${milestoneId}
    `);
    assert.equal(
      (afterRejectedTicketRows.rows[0] as { push_7d_sent_at: string | null }).push_7d_sent_at,
      null,
      "an all-rejected Expo ticket response must leave push_7d_sent_at unset",
    );

    await db.execute(sql`
      UPDATE agri_env_milestones
      SET push_7d_claimed_at = NOW() - INTERVAL '61 minutes'
      WHERE id = ${milestoneId}
    `);
    await checkAgriEnvMilestoneDeadlines();
    assert.equal(expoRequests.length, 3, "the rejected push should retry after its lease expires");

    const afterAcceptedTicketRows = await db.execute(sql`
      SELECT push_7d_sent_at
      FROM agri_env_milestones
      WHERE id = ${milestoneId}
    `);
    assert.ok(
      (afterAcceptedTicketRows.rows[0] as { push_7d_sent_at: string | null }).push_7d_sent_at,
      "a later accepted Expo ticket must stamp push_7d_sent_at",
    );

    await checkAgriEnvMilestoneDeadlines();
    assert.equal(expoRequests.length, 3, "a sent push must not be duplicated");

    const terminalStatusIds = [paidMilestoneId, cancelledMilestoneId];
    const terminalRowsBefore = await db.execute(sql`
      SELECT id, push_7d_sent_at
      FROM agri_env_milestones
      WHERE id IN (${paidMilestoneId}, ${cancelledMilestoneId})
      ORDER BY id
    `);
    assert.equal(terminalRowsBefore.rows.length, terminalStatusIds.length);
    assert.deepEqual(
      terminalRowsBefore.rows.map((row) => (row as { push_7d_sent_at: string | null }).push_7d_sent_at),
      [null, null],
      "terminal milestones should begin without a push timestamp",
    );
    assert.deepEqual(
      terminalRowsBefore.rows.map((row) => Number((row as { id: number }).id)).sort((a, b) => a - b),
      terminalStatusIds.sort((a, b) => a - b),
    );
    assert.equal(expoRequests.length, 3, "paid and cancelled milestones must not reach Expo");

    console.log("✓ agri-environment 7-day milestone push guard passed");
    console.log(`  due date: ${dueDate}`);
    console.log("  Expo payload: verified");
    console.log("  non-2xx response: left retryable");
    console.log("  all-rejected tickets: left retryable");
    console.log("  expired leases: retried");
    console.log("  accepted retry: stamped without later duplicate");
    console.log("  paid/cancelled milestones: skipped");
  } finally {
    globalThis.fetch = originalFetch;

    if (farmId !== undefined) {
      // Notifications are intentionally retained rather than cascaded.
      await db.execute(sql`DELETE FROM notifications WHERE farm_id = ${farmId}`);
    }
    if (projectId !== undefined) {
      await db.execute(sql`DELETE FROM agri_env_milestones WHERE project_id = ${projectId}`);
      await db.execute(sql`DELETE FROM agri_env_projects WHERE id = ${projectId}`);
    }
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM expo_push_tokens WHERE farm_id = ${farmId}`);
      await db.execute(sql`DELETE FROM farms WHERE id = ${farmId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM user_tenants WHERE tenant_id = ${tenantId}`);
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    if (roleId !== undefined) {
      await db.execute(sql`DELETE FROM roles WHERE id = ${roleId}`);
    }
    await pool.end();
  }
}

main().catch((err) => {
  console.error("✗ agri-environment 7-day milestone push guard failed");
  console.error(err);
  process.exitCode = 1;
});