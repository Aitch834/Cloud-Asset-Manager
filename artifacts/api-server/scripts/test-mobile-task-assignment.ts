/**
 * HTTP-level regression test for the shared mobile raise-task flow.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:mobile-task-assignment
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";

type IdRow = { id: number };
type Assignment = {
  id: number;
  farmId: number;
  tenantId: number;
  assignedToMemberId: number;
  assignedByUserId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  module: string | null;
  staffName: string;
};

const suffix = `${Date.now()}-${process.pid}`;
const userId = "dev-bypass-user";
const tenantSlug = `mobile-task-assignment-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const mobileDueDate = "2026-10-23";

let tenantId: number | undefined;
let farmId: number | undefined;
let linkedMemberId: number | undefined;
let explicitMemberId: number | undefined;
let userCreatedByTest = false;

function idFrom(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as IdRow | undefined;
  assert(row?.id, `${label} did not return an id`);
  return Number(row.id);
}

async function createFixtures(): Promise<void> {
  const existingUser = await db.execute(sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1`);
  if (existingUser.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (${userId}, ${`mobile-task-${suffix}@example.test`}, 'Mobile', 'Tester')
    `);
    userCreatedByTest = true;
  }

  tenantId = idFrom(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Mobile task assignment tenant ${suffix}`},
      ${tenantSlug},
      ${`mobile-task-${suffix}@example.test`}
    )
    RETURNING id
  `), "tenant");

  farmId = idFrom(await db.execute(sql`
    INSERT INTO farms (tenant_id, name)
    VALUES (${tenantId}, ${`Mobile task assignment farm ${suffix}`})
    RETURNING id
  `), "farm");

  linkedMemberId = idFrom(await db.execute(sql`
    INSERT INTO farm_members (farm_id, tenant_id, linked_user_id, first_name, last_name)
    VALUES (${farmId}, ${tenantId}, ${userId}, 'Mobile', 'Assignee')
    RETURNING id
  `), "linked farm member");

  explicitMemberId = idFrom(await db.execute(sql`
    INSERT INTO farm_members (farm_id, tenant_id, first_name, last_name)
    VALUES (${farmId}, ${tenantId}, 'Dashboard', 'Assignee')
    RETURNING id
  `), "explicit farm member");
}

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.text();
  assert.equal(response.status, 200, body);
  return JSON.parse(body) as T;
}

async function main(): Promise<void> {
  await createFixtures();
  const { default: app } = await import("../src/app");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const baseUrl = `http://127.0.0.1:${address.port}/api/farms/${farmId}/task-assignments`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantSlug,
    };

    const mobilePayload = {
      title: "Inspect damaged gate",
      description: "Raised from the shared mobile follow-up sheet",
      dueDate: mobileDueDate,
      module: "field_inspection",
    };
    assert(!("assignedToMemberId" in mobilePayload), "mobile payload must omit an explicit assignee");

    const created = await responseJson<{ record: Assignment }>(await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(mobilePayload),
    }));

    assert.equal(created.record.farmId, farmId);
    assert.equal(created.record.tenantId, tenantId);
    assert.equal(created.record.assignedToMemberId, linkedMemberId);
    assert.equal(created.record.assignedByUserId, userId);
    assert.equal(created.record.dueDate, mobileDueDate);
    assert.equal(created.record.staffName, "Mobile Assignee");

    const inbox = await responseJson<{ records: Assignment[]; memberId: number }>(
      await fetch(`${baseUrl}/mine`, { headers }),
    );
    assert.equal(inbox.memberId, linkedMemberId);
    assert.deepEqual(inbox.records.map((record) => record.id), [created.record.id]);
    assert.equal(inbox.records[0]?.dueDate, mobileDueDate);

    const dashboardDueDate = "2026-11-05";
    const explicit = await responseJson<{ record: Assignment }>(await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        assignedToMemberId: explicitMemberId,
        title: "Dashboard-assigned task",
        description: "Explicit assignee behavior remains supported",
        dueDate: dashboardDueDate,
        module: "planner",
      }),
    }));
    assert.equal(explicit.record.assignedToMemberId, explicitMemberId);
    assert.equal(explicit.record.staffName, "Dashboard Assignee");
    assert.equal(explicit.record.dueDate, dashboardDueDate);
    assert.equal(explicit.record.farmId, farmId);
    assert.equal(explicit.record.tenantId, tenantId);

    const inboxAfterExplicitAssignment = await responseJson<{ records: Assignment[] }>(
      await fetch(`${baseUrl}/mine`, { headers }),
    );
    assert.deepEqual(
      inboxAfterExplicitAssignment.records.map((record) => record.id),
      [created.record.id],
      "the linked user's inbox must not include a task explicitly assigned to someone else",
    );

    console.log("Mobile task assignment regression passed.");
    console.log("  implicit assignee: linked current farm member");
    console.log("  farm and tenant scope: verified");
    console.log("  due date and current-user inbox: verified");
    console.log("  explicit dashboard assignee: preserved");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Mobile task assignment regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (farmId !== undefined) {
      await db.execute(sql`DELETE FROM farm_task_assignments WHERE farm_id = ${farmId}`);
      await db.execute(sql`DELETE FROM farm_members WHERE farm_id = ${farmId}`);
      await db.execute(sql`DELETE FROM farms WHERE id = ${farmId}`);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    if (userCreatedByTest) {
      await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    }
    await pool.end();
  });