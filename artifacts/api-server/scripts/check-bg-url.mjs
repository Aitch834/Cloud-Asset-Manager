#!/usr/bin/env node
/**
 * Integration check for GET /api/admin/check-bg-url.
 *
 * It uses real image CDN responses (including redirects and a host that rejects
 * HEAD), successful non-image responses, an unsafe redirect, and one broken
 * URL. This exercises the server-side probe that avoids browser CORS
 * limitations and verifies its stable JSON contract.
 *
 * Usage: node scripts/check-bg-url.mjs
 * Env: API_BASE (default http://localhost:80/api)
 *      DEV_BYPASS_TOKEN (default bde-dev-bypass-local)
 *      DATABASE_URL (required for the temporary super-admin identity)
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const API_BASE = process.env.API_BASE ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const DEV_BYPASS_USER_ID = "dev-bypass-user";

let pgPackage;
try {
  pgPackage = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
} catch {
  pgPackage = require("pg");
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up the super-admin test fixture.");
  process.exit(2);
}

const pool = new pgPackage.Pool({ connectionString: process.env.DATABASE_URL });
let insertedUser = false;
let insertedMembershipTenantId = null;
let failures = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function setupSuperAdminFixture() {
  const roleResult = await pool.query(
    `SELECT id FROM roles
     WHERE name = 'BDE Super Admin' AND is_system_role = true
     LIMIT 1`,
  );
  const roleId = roleResult.rows[0]?.id;
  if (!roleId) throw new Error("BDE Super Admin system role is not seeded");

  const userResult = await pool.query(
    `INSERT INTO users (id, email, first_name, last_name)
     VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [DEV_BYPASS_USER_ID],
  );
  insertedUser = (userResult.rowCount ?? 0) > 0;

  const tenantResult = await pool.query(
    "SELECT id FROM tenants ORDER BY id LIMIT 1",
  );
  const tenantId = tenantResult.rows[0]?.id;
  if (!tenantId) throw new Error("At least one tenant is required");

  const membershipResult = await pool.query(
    `INSERT INTO user_tenants
       (user_id, tenant_id, role_id, is_super_admin, is_active)
     VALUES ($1, $2, $3, true, true)
     ON CONFLICT (user_id, tenant_id) DO NOTHING
     RETURNING tenant_id`,
    [DEV_BYPASS_USER_ID, tenantId, roleId],
  );
  if ((membershipResult.rowCount ?? 0) > 0) {
    insertedMembershipTenantId = tenantId;
  }
}

async function cleanup() {
  try {
    if (insertedMembershipTenantId !== null) {
      await pool.query(
        "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id = $2",
        [DEV_BYPASS_USER_ID, insertedMembershipTenantId],
      );
    }
    if (insertedUser) {
      await pool.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    }
  } finally {
    await pool.end();
  }
}

async function callProbe(url) {
  const params = new URLSearchParams({ url });
  const response = await fetch(`${API_BASE}/admin/check-bg-url?${params}`, {
    headers: {
      "x-dev-bypass": DEV_BYPASS_TOKEN,
      "Content-Type": "application/json",
    },
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    // The contract check below reports a useful failure for non-JSON responses.
  }
  return { response, body };
}

try {
  await setupSuperAdminFixture();

  const cases = [
    {
      label: "real CDN image",
      url: "https://httpbin.org/image/jpeg",
      expectedOk: true,
      expectedContentType: "image/jpeg",
    },
    {
      label: "HTTPS redirect to image",
      url: "https://httpbin.org/redirect-to?url=%2Fimage%2Fjpeg",
      expectedOk: true,
      expectedContentType: "image/jpeg",
    },
    {
      label: "HEAD-rejecting CDN GET fallback",
      url: "https://picsum.photos/64/64",
      expectedOk: true,
      expectedContentType: "image/jpeg",
    },
    {
      label: "successful non-image URL",
      url: "https://example.com/",
      expectedOk: false,
      expectedContentType: "text/html",
    },
    {
      label: "HTTPS redirect to non-image",
      url: "https://httpbin.org/redirect-to?url=https%3A%2F%2Fexample.com%2F",
      expectedOk: false,
      expectedContentType: "text/html",
    },
    {
      label: "redirect to unsafe HTTP target",
      url: "https://httpbin.org/redirect-to?url=http%3A%2F%2Fexample.com%2F",
      expectedOk: false,
      expectedContentType: null,
    },
    {
      label: "broken URL",
      url: "https://example.com/bg-url-regression-does-not-exist-1847.jpg",
      expectedOk: false,
      expectedContentType: "text/html",
    },
  ];

  for (const testCase of cases) {
    console.log(`\n── ${testCase.label} ──`);
    const { response, body } = await callProbe(testCase.url);
    check(
      `${testCase.label}: HTTP 200`,
      response.status === 200,
      `got ${response.status}: ${JSON.stringify(body)}`,
    );
    check(
      `${testCase.label}: response has boolean ok`,
      typeof body?.ok === "boolean",
      `body was ${JSON.stringify(body)}`,
    );
    check(
      `${testCase.label}: response has contentType`,
      testCase.expectedContentType === null
        ? body?.contentType === null
        : typeof body?.contentType === "string" && body.contentType.length > 0,
      `body was ${JSON.stringify(body)}`,
    );
    check(
      `${testCase.label}: ok=${testCase.expectedOk}`,
      body?.ok === testCase.expectedOk,
      `body was ${JSON.stringify(body)}`,
    );
    check(
      `${testCase.label}: contentType=${testCase.expectedContentType}`,
      body?.contentType === testCase.expectedContentType,
      `body was ${JSON.stringify(body)}`,
    );
  }
} finally {
  await cleanup();
}

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll background URL probe checks passed.");