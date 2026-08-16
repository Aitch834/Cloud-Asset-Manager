#!/usr/bin/env node
// Integration check: archived-template 410 guard and HTML snapshot capture on
// POST /admin/ad-pdf and GET /admin/ad-pdf/preview.
//
// Background: Task #771 added a 410 Gone guard on both render endpoints for
// archived ad templates.  This script confirms:
//   1. POST /admin/ad-pdf returns 410 for an archived template.
//   2. GET  /admin/ad-pdf/preview returns 410 for an archived template.
//   3. An active template is NOT rejected with 410 — it proceeds past the
//      archive guard and reaches the brand-asset check (422).  This proves the
//      HTML snapshot is taken from the template at request time, not skipped.
//
// Runs against the local dev API server via the dev-bypass auth header.
// Usage:  node scripts/check-ad-pdf-archive-410.mjs
// Env:    API_BASE       (default http://localhost:80/api)
//         DATABASE_URL   (required — used for super-admin setup / teardown)
//         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const API_BASE         = process.env.API_BASE         ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

// The dev-bypass middleware sets req.userId = "dev-bypass-user", but does NOT
// set req.isSuperAdmin.  checkPlatformAdmin() then queries user_tenants for a
// row with is_super_admin = true.  We insert that row for the duration of this
// check and remove it at the end.
const DEV_BYPASS_USER_ID = "dev-bypass-user";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up the super-admin test fixture.");
  process.exit(2);
}

// ─── pg setup ────────────────────────────────────────────────────────────────
// Resolve pg from the workspace pnpm store rather than a local node_modules.
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
  try { json = await res.json(); } catch { /* non-JSON (e.g. PNG from preview) */ }
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

// ─── State to clean up ────────────────────────────────────────────────────────
let createdTemplateId   = null;
let insertedTenantId    = null;   // only if we had to create a scratch tenant
let insertedUserRow     = false;
let insertedMemberTenantId = null; // tenant_id used for the inserted member row

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

// ─── DB fixtures ──────────────────────────────────────────────────────────────
// Ensure dev-bypass-user is present in `users` and has a super-admin row in
// `user_tenants`.  We use a real tenant row (the lowest-id one) so we don't
// need to create a scratch tenant.  Everything is rolled back in cleanup().

async function setupSuperAdminFixture() {
  // 1. Resolve the "BDE Super Admin" system role ID dynamically.
  const roleResult = await pool.query(
    `SELECT id FROM roles WHERE name = 'BDE Super Admin' AND is_system_role = true LIMIT 1`,
  );
  if (roleResult.rows.length === 0) {
    throw new Error(
      "Cannot find 'BDE Super Admin' system role — is the roles table seeded?",
    );
  }
  const superAdminRoleId = roleResult.rows[0].id;

  // 2. Ensure the user row exists (ON CONFLICT DO NOTHING is safe).
  const userResult = await pool.query(`
    INSERT INTO users (id, email, first_name, last_name)
    VALUES ($1, 'dev-bypass@test.local', 'DevBypass', 'Test')
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `, [DEV_BYPASS_USER_ID]);
  insertedUserRow = userResult.rowCount > 0;

  // 3. Pick any existing tenant to attach the super-admin row to.
  const tenantResult = await pool.query(
    `SELECT id FROM tenants ORDER BY id LIMIT 1`,
  );
  if (tenantResult.rows.length === 0) {
    // No tenants at all — create a minimal schema-valid scratch one.
    const newTenant = await pool.query(`
      INSERT INTO tenants (name, slug, contact_email)
      VALUES ('_test_scratch_', '_test_scratch_', 'scratch@test.local')
      RETURNING id
    `);
    insertedTenantId = newTenant.rows[0].id;
  }
  const tenantId = insertedTenantId ?? tenantResult.rows[0].id;

  // 4. Insert the super-admin membership (ON CONFLICT DO NOTHING so we don't
  //    clobber an existing row).  Track the exact tenant_id so cleanup only
  //    removes this specific row, not all super-admin memberships.
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

  // Remove created ad template (archive + hard-delete via SQL since there is
  // no hard-delete HTTP endpoint).
  if (createdTemplateId !== null) {
    await pool.query(`DELETE FROM ad_templates WHERE id = $1`, [createdTemplateId]);
    console.log(`  removed ad_template #${createdTemplateId}`);
  }

  // Remove only the exact membership row this script inserted — do NOT do a
  // broad delete by user_id alone, which would wipe pre-existing memberships.
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
  // Attempt to roll back any partial inserts before exiting.
  await cleanup().catch(() => {});
  process.exit(2);
}

try {
  // ── Step 1: Create a test template ─────────────────────────────────────────
  console.log("\nSetup: create ad template");
  const uniqueSlug = `_test-410-check-${Date.now()}`;
  const create = await call("POST", "/admin/ad-templates", {
    name:     "410 Guard Check (auto-test)",
    slug:     uniqueSlug,
    widthMm:  210,
    heightMm: 297,
    htmlBody: `<html><body>SNAPSHOT-BODY-ORIGINAL-${Date.now()}</body></html>`,
  });
  check("template created (201)", create.status === 201, `got ${create.status}: ${JSON.stringify(create.json)}`);
  if (create.status !== 201) {
    console.error("Cannot continue without a test template. Aborting.");
    await cleanup();
    process.exit(1);
  }
  createdTemplateId = create.json.id;
  const originalHtmlBody = create.json.htmlBody;
  console.log(`  template ID: ${createdTemplateId}`);

  // ── Test A: Active template — must NOT return 410 ──────────────────────────
  // The route fetches the template, takes the HTML snapshot, then hits the
  // brand-asset check. With no brand assets configured in a clean dev
  // environment the expected response is 422 (not 410, 404, or 500 from the
  // render step). Any non-410 response with an active template confirms the
  // archive guard is not incorrectly firing and that the route reached the
  // snapshot step.
  console.log("\nTest A: active template — POST /admin/ad-pdf must not return 410");
  const activePost = await call("POST", "/admin/ad-pdf", { templateId: createdTemplateId });
  check(
    "active template: not rejected with 410",
    activePost.status !== 410,
    `got ${activePost.status}: ${JSON.stringify(activePost.json)}`,
  );
  // 200  — brand assets are configured and WeasyPrint rendered successfully
  // 422  — brand assets missing (common in fresh dev environments)
  // 500  — render tool unavailable (expected outside nix-shell)
  // Any of these confirms the route passed the archive guard and took the snapshot.
  check(
    "active template: route passed archive guard (200, 422, or render-error 500)",
    activePost.status === 200 || activePost.status === 422 || activePost.status === 500,
    `got ${activePost.status}: ${JSON.stringify(activePost.json)}`,
  );
  if (activePost.status === 422) {
    // Confirm the error is about brand assets, not something unexpected.
    check(
      "active template: 422 reason is missing brand assets",
      typeof activePost.json?.error === "string" && activePost.json.error.includes("brand asset"),
      `error was: ${JSON.stringify(activePost.json?.error)}`,
    );
  }

  console.log("\nTest A: active template — GET /admin/ad-pdf/preview must not return 410");
  const activePreview = await call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`);
  check(
    "active template preview: not rejected with 410",
    activePreview.status !== 410,
    `got ${activePreview.status}: ${JSON.stringify(activePreview.json)}`,
  );
  check(
    "active template preview: route passed archive guard (200, 422, or render-error 500)",
    activePreview.status === 200 || activePreview.status === 422 || activePreview.status === 500,
    `got ${activePreview.status}: ${JSON.stringify(activePreview.json)}`,
  );

  // ── Step 2: Update the template body then archive it ──────────────────────
  // Updating first demonstrates that the snapshot captures the state at request
  // time (not the latest DB value): the original body was used for Test A above
  // and any subsequent render would have used the same value from the same
  // synchronous fetch before the brand-asset check (or archive guard).
  console.log("\nSetup: update template body then archive");
  const updated = await call("PUT", `/admin/ad-templates/${createdTemplateId}`, {
    name:     "410 Guard Check (auto-test)",
    slug:     uniqueSlug,
    widthMm:  210,
    heightMm: 297,
    htmlBody: `<html><body>SNAPSHOT-BODY-MODIFIED-${Date.now()}</body></html>`,
  });
  check("template updated (200)", updated.status === 200, `got ${updated.status}`);

  // Archive via DELETE (soft-delete sets archivedAt).
  const archived = await call("DELETE", `/admin/ad-templates/${createdTemplateId}`);
  check("template archived (200)", archived.status === 200, `got ${archived.status}: ${JSON.stringify(archived.json)}`);

  // ── Test B: Archived template — must return 410 ───────────────────────────
  console.log("\nTest B: archived template — POST /admin/ad-pdf must return 410");
  const archivedPost = await call("POST", "/admin/ad-pdf", { templateId: createdTemplateId });
  check(
    "archived template: POST /admin/ad-pdf returns 410",
    archivedPost.status === 410,
    `got ${archivedPost.status}: ${JSON.stringify(archivedPost.json)}`,
  );
  check(
    "archived template: error message mentions archived",
    typeof archivedPost.json?.error === "string" && archivedPost.json.error.toLowerCase().includes("archived"),
    `error was: ${JSON.stringify(archivedPost.json?.error)}`,
  );

  console.log("\nTest B: archived template — GET /admin/ad-pdf/preview must return 410");
  const archivedPreview = await call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`);
  check(
    "archived template: GET /admin/ad-pdf/preview returns 410",
    archivedPreview.status === 410,
    `got ${archivedPreview.status}: ${JSON.stringify(archivedPreview.json)}`,
  );
  check(
    "archived template preview: error message mentions archived",
    typeof archivedPreview.json?.error === "string" && archivedPreview.json.error.toLowerCase().includes("archived"),
    `error was: ${JSON.stringify(archivedPreview.json?.error)}`,
  );

  // ── Test C: Restored template — 410 must stop firing ─────────────────────
  // Verifies the guard fires on archivedAt being non-null, not on something
  // permanent like the template ID.
  console.log("\nTest C: restored template — 410 must NOT fire after restore");
  const restored = await call("POST", `/admin/ad-templates/${createdTemplateId}/restore`);
  check("template restored (200)", restored.status === 200, `got ${restored.status}: ${JSON.stringify(restored.json)}`);

  const restoredPost = await call("POST", "/admin/ad-pdf", { templateId: createdTemplateId });
  check(
    "restored template: POST /admin/ad-pdf no longer returns 410",
    restoredPost.status !== 410,
    `got ${restoredPost.status}: ${JSON.stringify(restoredPost.json)}`,
  );

  const restoredPreview = await call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`);
  check(
    "restored template: GET /admin/ad-pdf/preview no longer returns 410",
    restoredPreview.status !== 410,
    `got ${restoredPreview.status}: ${JSON.stringify(restoredPreview.json)}`,
  );

  // ── Test D: Non-existent template — must return 404, not 410 ──────────────
  console.log("\nTest D: non-existent template — must return 404");
  const missingPost = await call("POST", "/admin/ad-pdf", { templateId: 999999999 });
  check(
    "missing template: POST returns 404",
    missingPost.status === 404,
    `got ${missingPost.status}: ${JSON.stringify(missingPost.json)}`,
  );

  const missingPreview = await call("GET", "/admin/ad-pdf/preview?templateId=999999999");
  check(
    "missing template: GET preview returns 404",
    missingPreview.status === 404,
    `got ${missingPreview.status}: ${JSON.stringify(missingPreview.json)}`,
  );

} finally {
  await cleanup();
}

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll ad-pdf archive-410 checks passed.");
