/**
 * HTTP-level regression test for grant-payment project farm isolation.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:grant-payment-project-isolation
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runAgriEnvMigrations } from "../src/lib/agriEnvMigrations.js";

const suffix = `${Date.now()}-${process.pid}`;
const tenantSlug = `grant-project-isolation-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

let tenantId: number | undefined;
let farmId: number | undefined;
let otherFarmId: number | undefined;
let projectId: number | undefined;
let otherProjectId: number | undefined;
let transactionId: number | undefined;

function returnedId(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as { id?: number } | undefined;
  assert(row?.id, `${label} did not return an id`);
  return Number(row.id);
}

async function storedProjectId(): Promise<number | null> {
  assert(transactionId !== undefined);
  const result = await db.execute(sql`
    SELECT agri_env_project_id
    FROM financial_transactions
    WHERE id = ${transactionId}
  `);
  assert.equal(result.rows.length, 1, "test transaction must still exist");
  const row = result.rows[0] as { agri_env_project_id: number | null };
  return row.agri_env_project_id == null ? null : Number(row.agri_env_project_id);
}

async function expectStoredProjectId(expected: number | null, message: string): Promise<void> {
  let actual: number | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    actual = await storedProjectId();
    if (actual === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.equal(actual, expected, message);
}

async function callLink(
  baseUrl: string,
  headers: Record<string, string>,
  agriEnvProjectId: number | null,
): Promise<{ status: number; body: { error?: string; record?: { agriEnvProjectId?: number | null } } }> {
  const response = await fetch(baseUrl, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ agriEnvProjectId }),
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
  };
}

async function main(): Promise<void> {
  await runAgriEnvMigrations();

  tenantId = returnedId(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Grant project isolation tenant ${suffix}`},
      ${tenantSlug},
      ${`grant-project-isolation-${suffix}@example.test`}
    )
    RETURNING id
  `), "tenant");

  farmId = returnedId(await db.execute(sql`
    INSERT INTO farms (tenant_id, name)
    VALUES (${tenantId}, ${`Grant payment farm ${suffix}`})
    RETURNING id
  `), "farm");

  otherFarmId = returnedId(await db.execute(sql`
    INSERT INTO farms (tenant_id, name)
    VALUES (${tenantId}, ${`Other grant farm ${suffix}`})
    RETURNING id
  `), "other farm");

  projectId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_projects (farm_id, scheme_name)
    VALUES (${farmId}, ${`Owned project ${suffix}`})
    RETURNING id
  `), "same-farm project");

  otherProjectId = returnedId(await db.execute(sql`
    INSERT INTO agri_env_projects (farm_id, scheme_name)
    VALUES (${otherFarmId}, ${`Other farm project ${suffix}`})
    RETURNING id
  `), "other-farm project");

  transactionId = returnedId(await db.execute(sql`
    INSERT INTO financial_transactions (
      farm_id, transaction_type, category, description, amount_pence, transaction_date
    )
    VALUES (
      ${farmId},
      ${"income"},
      ${"grants"},
      ${`Grant payment isolation check ${suffix}`},
      ${12500},
      NOW()
    )
    RETURNING id
  `), "financial transaction");

  const { default: app } = await import("../src/app");
  const server = http.createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    assert(address && typeof address !== "string", "API test server did not open a port");
    const baseUrl = `http://127.0.0.1:${address.port}/api/farms/${farmId}/financial-transactions/${transactionId}/link-agri-env`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": tenantSlug,
    };

    const sameFarmLink = await callLink(baseUrl, headers, projectId);
    assert.equal(sameFarmLink.status, 200, JSON.stringify(sameFarmLink.body));
    assert.equal(sameFarmLink.body.record?.agriEnvProjectId, projectId);
    await expectStoredProjectId(projectId, "same-farm project link must persist");

    const crossFarmLink = await callLink(baseUrl, headers, otherProjectId);
    assert.equal(crossFarmLink.status, 404, JSON.stringify(crossFarmLink.body));
    assert.match(crossFarmLink.body.error ?? "", /project not found/i);
    await expectStoredProjectId(
      projectId,
      "rejected cross-farm link must leave the transaction's existing project unchanged",
    );

    const unlink = await callLink(baseUrl, headers, null);
    assert.equal(unlink.status, 200, JSON.stringify(unlink.body));
    assert.equal(unlink.body.record?.agriEnvProjectId, null);
    await expectStoredProjectId(null, "unlink must persist");

    console.log("Grant payment project isolation regression passed.");
    console.log("  same-farm link: succeeded");
    console.log("  cross-farm link: rejected and existing link unchanged");
    console.log("  unlink: succeeded");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Grant payment project isolation regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (transactionId !== undefined) {
      await db.execute(sql`DELETE FROM financial_transactions WHERE id = ${transactionId}`);
    }
    if (projectId !== undefined || otherProjectId !== undefined) {
      await db.execute(sql`
        DELETE FROM agri_env_projects
        WHERE id IN (${projectId ?? -1}, ${otherProjectId ?? -1})
      `);
    }
    if (farmId !== undefined || otherFarmId !== undefined) {
      await db.execute(sql`
        DELETE FROM farms
        WHERE id IN (${farmId ?? -1}, ${otherFarmId ?? -1})
      `);
    }
    if (tenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${tenantId}`);
    }
    await pool.end();
  });