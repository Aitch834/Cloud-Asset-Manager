#!/usr/bin/env node
// Integration check: slug-conflict 409 guard on POST /admin/ad-templates/:id/restore.
//
// Background: Task #1150 — the restore route carries a 23505 catch that returns
// 409 when an active template already holds the same slug.  This script confirms
// the full round-trip:
//
//   1. Create template A with a unique slug, archive it.
//   2. Create template B with the SAME slug (now active, so the slug is taken).
//   3. POST restore on template A → must return 409 with a slug-conflict message.
//   4. Archive template B to free the slug, then restore template A again → must
//      return 200, proving the guard is slug-specific, not permanent.
//
// UI path note: the admin-portal restoreTemplate() fetch helper (AdPdfGenerator.tsx)
// already throws `new Error(json.error)` when !res.ok, and the restoreMutation
// .isError block renders that message in the templates list.  The 409 body therefore
// reaches the UI without any extra changes required.
//
// Runs against the local dev API server via the dev-bypass auth header.
// Usage:  node scripts/check-ad-template-restore-409.mjs
// Env:    API_BASE         (default http://localhost:80/api)
//         DATABASE_URL     (required — used for super-admin fixture setup/teardown)
//         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const API_BASE         = process.env.API_BASE         ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const DEV_BYPASS_USER_ID = "dev-bypass-user";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up the super-admin test fixture.");
  process.exit(2);
}

// ─── pg setup ────────────────────────────────────────────────────────────────
let pgPkg;
try {
  pgPkg = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
} catch {
  pgPkg = require("pg");
}
const { Pool } = pgPkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── HTTP helper ─────────────────────────────────────────────────────────────
const HEADERS = {
  "x-dev-bypass": DEV_BYPASS_TOKEN,
  "Content-Type": "application/json",
};

async function call(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

// ─── Check helper ─────────────────────────────────────────────────────────────
let failures = 0;
function check(label, ok, detail) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

// ─── Fixture state ────────────────────────────────────────────────────────────
let templateAId           = null;
let templateBId           = null;
let insertedTenantId      = null;
let insertedUserRow       = false;
let insertedMemberTenantId = null;

// ─── Preflight: API server alive ──────────────────────────────────────────────
async function preflight() {
  const attempts = 5;
  let last = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) return;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err?.cause?.code ?? err?.message ?? String(err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(
    `\nAPI server unreachable at ${API_BASE} (${last}).\n` +
    `Start the "artifacts/api-server: API Server" workflow and re-run.\n` +
    `No checks were executed.`,
  );
  process.exit(2);
}

// ─── Super-admin fixture (same approach as check-ad-pdf-archive-410.mjs) ─────
async function setupSuperAdminFixture() {
  const roleResult = await pool.query(
    `SELECT id FROM roles WHERE name = 'BDE Super Admin' AND is_system_role = true LIMIT 1`,
  );
  if (roleResult.rows.length === 0) {
    throw new Error("Cannot find 'BDE Super Admin' system role — is the roles table seeded?");
  }
  const superAdminRoleId = roleResult.rows[0].id;

  const userResult = await pool.query(`
    INSERT INTO users (id, email, first_name, last_name)
    VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `, [DEV_BYPASS_USER_ID]);
  insertedUserRow = userResult.rowCount > 0;

  const tenantResult = await pool.query(`SELECT id FROM tenants ORDER BY id LIMIT 1`);
  if (tenantResult.rows.length === 0) {
    const newTenant = await pool.query(`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES ('_test_scratch_', '_test_scratch_', 'scratch@test.local')
      RETURNING id
    `);
    insertedTenantId = newTenant.rows[0].id;
  }
  const tenantId = insertedTenantId ?? tenantResult.rows[0].id;

  const memberResult = await pool.query(`
    INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)
    VALUES ($1, $2, $3, true, true)
    ON CONFLICT (user_id, tenant_id) DO NOTHING
    RETURNING user_id
  `, [DEV_BYPASS_USER_ID, tenantId, superAdminRoleId]);
  if (memberResult.rowCount > 0) {
    insertedMemberTenantId = tenantId;
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\nCleanup");

  for (const [label, id] of [["template A", templateAId], ["template B", templateBId]]) {
    if (id !== null) {
      await pool.query(`DELETE FROM ad_templates WHERE id = $1`, [id]);
      console.log(`  removed ${label} (ad_template #${id})`);
    }
  }

  if (insertedMemberTenantId !== null) {
    await pool.query(
      `DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id = $2`,
      [DEV_BYPASS_USER_ID, insertedMemberTenantId],
    );
    console.log(`  removed user_tenants row (${DEV_BYPASS_USER_ID}, tenant ${insertedMemberTenantId})`);
  }

  if (insertedUserRow) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [DEV_BYPASS_USER_ID]);
    console.log(`  removed users row for ${DEV_BYPASS_USER_ID}`);
  }

  if (insertedTenantId !== null) {
    await pool.query(`DELETE FROM tenants WHERE id = $1`, [insertedTenantId]);
    console.log(`  removed scratch tenant #${insertedTenantId}`);
  }

  await pool.end();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
await preflight();
try {
  await setupSuperAdminFixture();
} catch (setupErr) {
  console.error("Fixture setup failed:", setupErr.message);
  await cleanup().catch(() => {});
  process.exit(2);
}

try {
  const sharedSlug = `_test-restore-409-${Date.now()}`;

  // ── Step 1: Create and archive template A ─────────────────────────────────
  console.log("\nSetup: create template A");
  const createA = await call("POST", "/admin/ad-templates", {
    name:     "Restore-409 Check — Template A (auto-test)",
    slug:     sharedSlug,
    widthMm:  210,
    heightMm: 297,
    htmlBody: "<html><body>RESTORE-409-A</body></html>",
  });
  check("template A created (201)", createA.status === 201, `got ${createA.status}: ${JSON.stringify(createA.json)}`);
  if (createA.status !== 201) {
    console.error("Cannot continue without template A. Aborting.");
    await cleanup();
    process.exit(1);
  }
  templateAId = createA.json.id;
  console.log(`  template A ID: ${templateAId}, slug: ${sharedSlug}`);

  console.log("\nSetup: archive template A");
  const archiveA = await call("DELETE", `/admin/ad-templates/${templateAId}`);
  check("template A archived (200)", archiveA.status === 200, `got ${archiveA.status}: ${JSON.stringify(archiveA.json)}`);
  if (archiveA.status !== 200) {
    console.error("Cannot continue — archive of template A failed. Aborting.");
    await cleanup();
    process.exit(1);
  }

  // ── Step 2: Create template B with the same slug (now the slug is taken) ──
  console.log("\nSetup: create template B with the same slug");
  const createB = await call("POST", "/admin/ad-templates", {
    name:     "Restore-409 Check — Template B (auto-test)",
    slug:     sharedSlug,
    widthMm:  210,
    heightMm: 297,
    htmlBody: "<html><body>RESTORE-409-B</body></html>",
  });
  check("template B created (201)", createB.status === 201, `got ${createB.status}: ${JSON.stringify(createB.json)}`);
  if (createB.status !== 201) {
    console.error("Cannot continue — template B creation failed. Aborting.");
    await cleanup();
    process.exit(1);
  }
  templateBId = createB.json.id;
  console.log(`  template B ID: ${templateBId}, slug: ${sharedSlug}`);

  // ── Test A: Restore A while B holds the slug — must return 409 ────────────
  console.log("\nTest A: restore template A while template B holds the slug — must return 409");
  const restoreConflict = await call("POST", `/admin/ad-templates/${templateAId}/restore`);
  check(
    "restore with slug conflict returns 409",
    restoreConflict.status === 409,
    `got ${restoreConflict.status}: ${JSON.stringify(restoreConflict.json)}`,
  );
  check(
    "409 body has an 'error' string",
    typeof restoreConflict.json?.error === "string" && restoreConflict.json.error.length > 0,
    `body was: ${JSON.stringify(restoreConflict.json)}`,
  );
  // The UI renders json.error via: throw new Error(json.error ?? `HTTP ${res.status}`)
  // and displays it as restoreMutation.error.message.  Confirm the message is
  // informative enough for an admin to act on (mentions slug or active template).
  check(
    "409 error message is actionable (mentions slug or active template)",
    typeof restoreConflict.json?.error === "string" &&
      (restoreConflict.json.error.toLowerCase().includes("slug") ||
       restoreConflict.json.error.toLowerCase().includes("active template")),
    `error was: ${JSON.stringify(restoreConflict.json?.error)}`,
  );

  // Confirm template A is still archived (restore rolled back).
  const verifyStillArchived = await pool.query(
    `SELECT archived_at FROM ad_templates WHERE id = $1`,
    [templateAId],
  );
  check(
    "template A remains archived after failed restore",
    verifyStillArchived.rows.length > 0 && verifyStillArchived.rows[0].archived_at !== null,
    `archived_at was: ${JSON.stringify(verifyStillArchived.rows[0]?.archived_at)}`,
  );

  // ── Test B: Free the slug, then restore A — must return 200 ───────────────
  console.log("\nTest B: archive template B to free the slug, then restore template A — must return 200");
  const archiveB = await call("DELETE", `/admin/ad-templates/${templateBId}`);
  check("template B archived (200)", archiveB.status === 200, `got ${archiveB.status}`);

  const restoreOk = await call("POST", `/admin/ad-templates/${templateAId}/restore`);
  check(
    "restore succeeds (200) once slug is free",
    restoreOk.status === 200,
    `got ${restoreOk.status}: ${JSON.stringify(restoreOk.json)}`,
  );
  check(
    "restored template has null archivedAt",
    restoreOk.json?.archivedAt === null || restoreOk.json?.archived_at === null,
    `archivedAt was: ${JSON.stringify(restoreOk.json?.archivedAt ?? restoreOk.json?.archived_at)}`,
  );

  // ── Test C: Restore a non-existent template — must return 404, not 409 ────
  console.log("\nTest C: restore a non-existent template — must return 404");
  const restoreMissing = await call("POST", "/admin/ad-templates/999999999/restore");
  check(
    "missing template returns 404",
    restoreMissing.status === 404,
    `got ${restoreMissing.status}: ${JSON.stringify(restoreMissing.json)}`,
  );

} finally {
  await cleanup();
}

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll restore-409 checks passed.");
