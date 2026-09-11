#!/usr/bin/env node

import { createRequire } from "node:module";
import { acquireProcessLock } from "./lib/process-lock.mjs";

const require = createRequire(import.meta.url);
const API_BASE = process.env.API_BASE ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const DEV_BYPASS_USER_ID = "dev-bypass-user";
const CONFIG_KEY = "barrel_retirement_threshold_pence";
const BUILT_IN_DEFAULT = "60000";
const SAVED_TEST_VALUE = "72500";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up and restore the platform-config fixture.");
  process.exit(2);
}

let pgPkg;
try {
  pgPkg = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
} catch {
  pgPkg = require("pg");
}
const { Pool } = pgPkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const releaseLock = await acquireProcessLock("bde-platform-config-validation");

const headers = {
  "x-dev-bypass": DEV_BYPASS_TOKEN,
  "Content-Type": "application/json",
};

async function call(method, path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    // Keep the status available for a useful failure when a non-JSON response is returned.
  }
  return { status: response.status, json };
}

let failures = 0;
function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function readStoredValue() {
  const result = await pool.query("SELECT value FROM platform_config WHERE key = $1", [CONFIG_KEY]);
  return result.rows[0]?.value;
}

async function restoreConfig(savedRow) {
  if (!savedRow) {
    await pool.query("DELETE FROM platform_config WHERE key = $1", [CONFIG_KEY]);
    return;
  }
  await pool.query(
    `INSERT INTO platform_config (key, value, label, description, updated_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       label = EXCLUDED.label,
       description = EXCLUDED.description,
       updated_at = EXCLUDED.updated_at`,
    [savedRow.key, savedRow.value, savedRow.label, savedRow.description, savedRow.updated_at],
  );
}

let insertedUser = false;
const originalConfigResult = await pool.query(
  "SELECT key, value, label, description, updated_at FROM platform_config WHERE key = $1",
  [CONFIG_KEY],
);
const originalConfigRow = originalConfigResult.rows[0];
const originalMembershipsResult = await pool.query(
  `SELECT id, user_id, tenant_id, role_id, is_super_admin, is_active,
          receive_alerts, created_at, updated_at
   FROM user_tenants
   WHERE user_id = $1
   ORDER BY id`,
  [DEV_BYPASS_USER_ID],
);
const originalMemberships = originalMembershipsResult.rows;

try {
  const userResult = await pool.query(
    `INSERT INTO users (id, email, first_name, last_name)
     VALUES ($1, $2, 'Platform', 'Config Check')
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [DEV_BYPASS_USER_ID, "platform-config-check@local.invalid"],
  );
  insertedUser = userResult.rowCount === 1;

  const fixtureRole = await pool.query(
    `SELECT t.id AS tenant_id, r.id AS role_id
     FROM tenants t
     JOIN roles r ON r.tenant_id = t.id OR r.tenant_id IS NULL
     ORDER BY CASE WHEN r.tenant_id = t.id THEN 0 ELSE 1 END, t.id, r.id
     LIMIT 1`,
  );
  if (fixtureRole.rowCount === 0) {
    throw new Error("No tenant and compatible role exist for the super-admin fixture");
  }

  await pool.query("DELETE FROM user_tenants WHERE user_id = $1", [DEV_BYPASS_USER_ID]);
  await pool.query(
    `INSERT INTO user_tenants
       (user_id, tenant_id, role_id, is_super_admin, is_active, receive_alerts)
     VALUES ($1, $2, $3, true, true, false)`,
    [DEV_BYPASS_USER_ID, fixtureRole.rows[0].tenant_id, fixtureRole.rows[0].role_id],
  );

  console.log("\nBarrel retirement platform-config regression check");

  const save = await call("PUT", `/admin/platform-config/${CONFIG_KEY}`, { value: SAVED_TEST_VALUE });
  check("admin endpoint accepts a positive whole number", save.status === 200, `${save.status} ${JSON.stringify(save.json)}`);
  check("admin endpoint returns the persisted value", save.json?.value === SAVED_TEST_VALUE, JSON.stringify(save.json));
  check("saved value persists in platform_config", (await readStoredValue()) === SAVED_TEST_VALUE);

  const publicSaved = await call("GET", "/platform-config");
  check("public endpoint returns the saved threshold", publicSaved.status === 200 && publicSaved.json?.config?.[CONFIG_KEY] === SAVED_TEST_VALUE, `${publicSaved.status} ${JSON.stringify(publicSaved.json)}`);

  for (const value of ["", "0", "1.5", "-1", "not-a-number"]) {
    const invalid = await call("PUT", `/admin/platform-config/${CONFIG_KEY}`, { value });
    check(`rejects invalid value ${JSON.stringify(value)}`, invalid.status === 400, `${invalid.status} ${JSON.stringify(invalid.json)}`);
    check(`does not overwrite the saved value after ${JSON.stringify(value)}`, (await readStoredValue()) === SAVED_TEST_VALUE);
  }

  const reset = await call("DELETE", `/admin/platform-config/${CONFIG_KEY}`);
  check("admin reset deletes the override", reset.status === 200, `${reset.status} ${JSON.stringify(reset.json)}`);
  check("admin reset removes the persisted row", (await readStoredValue()) === undefined);

  const publicReset = await call("GET", "/platform-config");
  check("public endpoint returns the built-in 60000-pence default after reset", publicReset.status === 200 && publicReset.json?.config?.[CONFIG_KEY] === BUILT_IN_DEFAULT, `${publicReset.status} ${JSON.stringify(publicReset.json)}`);
} catch (error) {
  failures += 1;
  console.error("  FAIL  check crashed", error);
} finally {
  try {
    await restoreConfig(originalConfigRow);
    await pool.query("DELETE FROM user_tenants WHERE user_id = $1", [DEV_BYPASS_USER_ID]);
    for (const membership of originalMemberships) {
      await pool.query(
        `INSERT INTO user_tenants
           (id, user_id, tenant_id, role_id, is_super_admin, is_active,
            receive_alerts, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          membership.id,
          membership.user_id,
          membership.tenant_id,
          membership.role_id,
          membership.is_super_admin,
          membership.is_active,
          membership.receive_alerts,
          membership.created_at,
          membership.updated_at,
        ],
      );
    }
    if (insertedUser) {
      await pool.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    }
  } finally {
    await pool.end();
    await releaseLock();
  }
}

if (failures > 0) {
  console.error(`\n${failures} barrel retirement platform-config check(s) failed.`);
  process.exit(1);
}

console.log("\nAll barrel retirement platform-config checks passed.");