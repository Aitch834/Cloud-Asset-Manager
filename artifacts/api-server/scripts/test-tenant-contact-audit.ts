/**
 * HTTP-level regression test for tenant contact audit entries.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:tenant-contact-audit
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";

type IdRow = { id: number };
type AuditRow = {
  actor_user_id: string;
  target_tenant_id: number;
  metadata: unknown;
};

const suffix = `${Date.now()}-${process.pid}`;
const actorUserId = "dev-bypass-user";
const adminSlug = `tenant-contact-audit-admin-${suffix}`;
const targetSlug = `tenant-contact-audit-target-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

let adminTenantId: number | undefined;
let targetTenantId: number | undefined;
let roleId: number | undefined;
let actorCreatedByTest = false;

function idFrom(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as IdRow | undefined;
  assert(row?.id, `${label} did not return an id`);
  return row.id;
}

async function createFixtures(): Promise<void> {
  const existingActor = await db.execute(sql`
    SELECT id FROM users WHERE id = ${actorUserId} LIMIT 1
  `);
  if (existingActor.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (${actorUserId}, ${`tenant-contact-audit-${suffix}@example.test`}, 'Audit', 'Tester')
    `);
    actorCreatedByTest = true;
  }

  adminTenantId = idFrom(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Tenant contact audit admin ${suffix}`},
      ${adminSlug},
      ${`tenant-contact-audit-admin-${suffix}@example.test`}
    )
    RETURNING id
  `), "admin tenant");

  roleId = idFrom(await db.execute(sql`
    INSERT INTO roles (tenant_id, name, is_system_role)
    VALUES (${adminTenantId}, ${`Tenant contact audit role ${suffix}`}, true)
    RETURNING id
  `), "admin role");

  await db.execute(sql`
    INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)
    VALUES (${actorUserId}, ${adminTenantId}, ${roleId}, true, true)
  `);

  targetTenantId = idFrom(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email, contact_phone)
    VALUES (
      ${`Previous Contact ${suffix}`},
      ${targetSlug},
      ${`previous-${suffix}@example.test`},
      '+44 7700 900111'
    )
    RETURNING id
  `), "target tenant");
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
    const url = `http://127.0.0.1:${address.port}/api/admin/tenants/${targetTenantId}`;
    const headers = {
      "content-type": "application/json",
      "x-dev-bypass": devBypass,
      "x-tenant-slug": adminSlug,
    };
    const newContact = {
      contactName: `New Contact ${suffix}`,
      contactEmail: `new-${suffix}@example.test`,
      contactPhone: "+44 7700 900222",
    };

    const changedResponse = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(newContact),
    });
    assert.equal(changedResponse.status, 200, await changedResponse.text());

    const auditRows = await db.execute(sql`
      SELECT actor_user_id, target_tenant_id, metadata
      FROM platform_audit_log
      WHERE action = 'tenant_contact_update'
        AND target_tenant_id = ${targetTenantId}
      ORDER BY id
    `);
    assert.equal(auditRows.rows.length, 1, "changing all contact fields should create one audit entry");

    const audit = auditRows.rows[0] as AuditRow;
    assert.equal(audit.actor_user_id, actorUserId);
    assert.equal(Number(audit.target_tenant_id), targetTenantId);
    assert.deepEqual(audit.metadata, {
      contactName: {
        previous: `Previous Contact ${suffix}`,
        new: newContact.contactName,
      },
      contactEmail: {
        previous: `previous-${suffix}@example.test`,
        new: newContact.contactEmail,
      },
      contactPhone: {
        previous: "+44 7700 900111",
        new: newContact.contactPhone,
      },
    });

    const unchangedResponse = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(newContact),
    });
    assert.equal(unchangedResponse.status, 200, await unchangedResponse.text());

    const countRows = await db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM platform_audit_log
      WHERE action = 'tenant_contact_update'
        AND target_tenant_id = ${targetTenantId}
    `);
    assert.equal(
      Number((countRows.rows[0] as { count: number }).count),
      1,
      "submitting unchanged contact values must not create a duplicate audit entry",
    );

    console.log("Tenant contact audit regression passed.");
    console.log("  changed fields: one complete audit entry");
    console.log("  actor and target tenant: verified");
    console.log("  unchanged fields: no duplicate audit entry");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Tenant contact audit regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (adminTenantId !== undefined) {
      await db.execute(sql`
        DELETE FROM user_tenants
        WHERE user_id = ${actorUserId} AND tenant_id = ${adminTenantId}
      `);
    }
    if (roleId !== undefined) {
      await db.execute(sql`DELETE FROM roles WHERE id = ${roleId}`);
    }
    if (targetTenantId !== undefined || adminTenantId !== undefined) {
      await db.execute(sql`
        DELETE FROM tenants
        WHERE id IN (${targetTenantId ?? -1}, ${adminTenantId ?? -1})
      `);
    }
    if (actorCreatedByTest) {
      await db.execute(sql`DELETE FROM users WHERE id = ${actorUserId}`);
    }
    // Audit rows are append-only records and are intentionally not deleted.
    await pool.end();
  });