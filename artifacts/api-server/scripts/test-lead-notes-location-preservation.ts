/**
 * HTTP-level regression test for notes-only lead updates.
 *
 * Run with:
 *   pnpm --filter @workspace/api-server run test:lead-notes-location
 */

import assert from "node:assert/strict";
import http from "node:http";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";

type IdRow = { id: number };
type LeadLocationRow = {
  notes: string | null;
  county: string | null;
  farm_type: string | null;
  cph_number: string | null;
};

const suffix = `${Date.now()}-${process.pid}`;
const actorUserId = "dev-bypass-user";
const adminSlug = `lead-notes-location-admin-${suffix}`;
const devBypass = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const originalNote = `Original internal note ${suffix}`;
const updatedNote = `Updated internal note ${suffix}`;
const expectedLocation = {
  county: "North Yorkshire",
  farmType: "Mixed Farming",
  cphNumber: "48/123/4567",
};

let adminTenantId: number | undefined;
let roleId: number | undefined;
let leadId: number | undefined;
let actorCreatedByTest = false;

function returnedId(result: { rows: unknown[] }, label: string): number {
  const row = result.rows[0] as IdRow | undefined;
  assert(row?.id, `${label} did not return an id`);
  return Number(row.id);
}

async function createFixtures(): Promise<void> {
  const existingActor = await db.execute(sql`
    SELECT id FROM users WHERE id = ${actorUserId} LIMIT 1
  `);
  if (existingActor.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO users (id, email, first_name, last_name)
      VALUES (${actorUserId}, ${`lead-location-${suffix}@example.test`}, 'Lead', 'Tester')
    `);
    actorCreatedByTest = true;
  }

  adminTenantId = returnedId(await db.execute(sql`
    INSERT INTO tenants (name, slug, contact_email)
    VALUES (
      ${`Lead location admin ${suffix}`},
      ${adminSlug},
      ${`lead-location-admin-${suffix}@example.test`}
    )
    RETURNING id
  `), "admin tenant");

  roleId = returnedId(await db.execute(sql`
    INSERT INTO roles (tenant_id, name, is_system_role)
    VALUES (${adminTenantId}, ${`Lead location admin role ${suffix}`}, true)
    RETURNING id
  `), "admin role");

  await db.execute(sql`
    INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)
    VALUES (${actorUserId}, ${adminTenantId}, ${roleId}, true, true)
  `);

  leadId = returnedId(await db.execute(sql`
    INSERT INTO registration_leads (
      business_name,
      contact_name,
      email,
      farm_count,
      modules_interested,
      county,
      farm_type,
      cph_number,
      notes
    )
    VALUES (
      ${`Lead location farm ${suffix}`},
      ${`Lead Contact ${suffix}`},
      ${`lead-location-${suffix}@example.test`},
      1,
      ARRAY['farm-management']::text[],
      ${expectedLocation.county},
      ${expectedLocation.farmType},
      ${expectedLocation.cphNumber},
      ${originalNote}
    )
    RETURNING id
  `), "lead");
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

    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/admin/leads/${leadId}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-dev-bypass": devBypass,
          "x-tenant-slug": adminSlug,
        },
        body: JSON.stringify({ notes: updatedNote }),
      },
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, responseText);

    const responseBody = JSON.parse(responseText) as {
      lead?: {
        notes?: string | null;
        county?: string | null;
        farmType?: string | null;
        cphNumber?: string | null;
      };
    };
    assert.deepEqual(
      {
        notes: responseBody.lead?.notes,
        county: responseBody.lead?.county,
        farmType: responseBody.lead?.farmType,
        cphNumber: responseBody.lead?.cphNumber,
      },
      { notes: updatedNote, ...expectedLocation },
      "notes-only response must retain dedicated lead location values",
    );

    const persistedRows = await db.execute(sql`
      SELECT notes, county, farm_type, cph_number
      FROM registration_leads
      WHERE id = ${leadId}
    `);
    assert.equal(persistedRows.rows.length, 1, "updated lead should still exist");
    const persisted = persistedRows.rows[0] as LeadLocationRow;
    assert.deepEqual(
      {
        notes: persisted.notes,
        county: persisted.county,
        farmType: persisted.farm_type,
        cphNumber: persisted.cph_number,
      },
      { notes: updatedNote, ...expectedLocation },
      "persisted lead must retain dedicated location values after a notes-only update",
    );

    console.log("Lead notes location preservation regression passed.");
    console.log("  notes-only protected admin update: verified");
    console.log("  county, farm type, and CPH: retained in response and database");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

main()
  .catch((error) => {
    console.error("Lead notes location preservation regression failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (leadId !== undefined) {
      await db.execute(sql`DELETE FROM registration_leads WHERE id = ${leadId}`);
    }
    if (adminTenantId !== undefined) {
      await db.execute(sql`
        DELETE FROM user_tenants
        WHERE user_id = ${actorUserId} AND tenant_id = ${adminTenantId}
      `);
    }
    if (roleId !== undefined) {
      await db.execute(sql`DELETE FROM roles WHERE id = ${roleId}`);
    }
    if (adminTenantId !== undefined) {
      await db.execute(sql`DELETE FROM tenants WHERE id = ${adminTenantId}`);
    }
    if (actorCreatedByTest) {
      await db.execute(sql`DELETE FROM users WHERE id = ${actorUserId}`);
    }
    await pool.end();
  });