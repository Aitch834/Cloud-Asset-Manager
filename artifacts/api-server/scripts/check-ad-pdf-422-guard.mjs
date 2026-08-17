#!/usr/bin/env node
// Integration check: 422 missing-asset guard on the three ad-PDF render endpoints.
//
// Background: loadAdBrandAssets() is called at the start of each render handler.
// When either brand.adLogoDataUrl or brand.adQrDataUrl resolves to an empty string,
// the handler must return 422 with a `missingAssets` array before touching the
// filesystem or invoking WeasyPrint.  This script confirms the guard fires for:
//
//   • Both assets missing  → 422, missingAssets: ["logo", "QR code"]
//   • Logo only missing    → 422, missingAssets: ["logo"]
//   • QR code only missing → 422, missingAssets: ["QR code"]
//   • Both assets present  → NOT 422 (guard is conditional, not unconditional)
//
// All three render endpoints are checked in each scenario:
//   1. POST /admin/ad-pdf/preview-draft   (draft HTML body, no template)
//   2. GET  /admin/ad-pdf/preview         (saved template)
//   3. POST /admin/ad-pdf                 (saved template, CMYK PDF)
//
// The test injects asset values directly into the server-side in-memory cache
// via PUT /admin/ad-brand-assets/cache so that results are reliable regardless
// of what is stored in the DB or on the legacy on-disk HTML fallback files.
//
// Usage:  node scripts/check-ad-pdf-422-guard.mjs
// Env:    API_BASE         (default http://localhost:80/api)
//         DATABASE_URL     (required — for super-admin fixture setup/teardown)
//         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const API_BASE         = process.env.API_BASE         ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";

// The dev-bypass middleware sets req.userId = "dev-bypass-user" but does NOT
// set req.isSuperAdmin.  checkPlatformAdmin() queries user_tenants for a row
// with is_super_admin = true.  We insert that row for the duration of the check.
const DEV_BYPASS_USER_ID = "dev-bypass-user";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up the super-admin test fixture.");
  process.exit(2);
}

// ─── pg setup ─────────────────────────────────────────────────────────────────
let pgPkg;
try {
  pgPkg = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
} catch {
  pgPkg = require("pg");
}
const { Pool } = pgPkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── HTTP helpers ──────────────────────────────────────────────────────────────
const BASE_HEADERS = {
  "x-dev-bypass": DEV_BYPASS_TOKEN,
  "Content-Type": "application/json",
};

async function call(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: BASE_HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* binary response (PNG/PDF) — ignore */ }
  return { status: res.status, json };
}

// ─── Check helpers ─────────────────────────────────────────────────────────────
let failures = 0;
function check(label, ok, detail) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

// ─── State for cleanup ────────────────────────────────────────────────────────
let createdTemplateId      = null;
let insertedUserRow        = false;
let insertedMemberTenantId = null;

// ─── Cache override helper ────────────────────────────────────────────────────
// Injects logoUri / qrUri directly into the server-side in-memory cache so the
// next call to loadAdBrandAssets() returns the injected values without touching
// the DB or on-disk fallback files.
// Pass "" for either value to simulate that asset being missing.
async function overrideCache(logoUri, qrUri) {
  const r = await call("PUT", "/admin/ad-brand-assets/cache", { logoUri, qrUri });
  if (r.status !== 200 || !r.json?.overridden) {
    throw new Error(`Cache override failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

// Flush the cache so the server re-resolves from DB + disk (restores normal operation).
async function flushCache() {
  const r = await call("DELETE", "/admin/ad-brand-assets/cache");
  if (r.status !== 200 || !r.json?.flushed) {
    throw new Error(`Cache flush failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

// ─── Preflight: API server alive ──────────────────────────────────────────────
async function preflight() {
  const attempts = 5;
  let last = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}/healthz`);
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) return;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err?.cause?.code ?? err?.message ?? String(err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(
    `\nAPI server unreachable at ${API_BASE} (${last}).\n` +
    `Start the "artifacts/api-server: API Server" workflow and re-run.\n`,
  );
  process.exit(2);
}

// ─── Setup: super-admin fixture + test template ───────────────────────────────
async function setup() {
  // 1. Resolve the "BDE Super Admin" system role ID.
  const { rows: roleRows } = await pool.query(
    "SELECT id FROM roles WHERE name = 'BDE Super Admin' AND is_system_role = true LIMIT 1",
  );
  if (roleRows.length === 0) {
    throw new Error("Could not find 'BDE Super Admin' system role — is the DB seeded?");
  }
  const superAdminRoleId = roleRows[0].id;

  // 2. Ensure the dev-bypass user exists in users.
  const { rows: userRows } = await pool.query(
    "SELECT id FROM users WHERE id = $1",
    [DEV_BYPASS_USER_ID],
  );
  if (userRows.length === 0) {
    await pool.query(
      "INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [DEV_BYPASS_USER_ID, "dev-bypass@test.invalid"],
    );
    insertedUserRow = true;
  }

  // 3. Attach a super-admin membership to the first available tenant.
  const { rows: tenantRows } = await pool.query("SELECT id FROM tenants LIMIT 1");
  if (tenantRows.length === 0) throw new Error("No tenants found — seed the DB first.");
  const tenantId = tenantRows[0].id;

  const memberResult = await pool.query(`
    INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)
    VALUES ($1, $2, $3, true, true)
    ON CONFLICT (user_id, tenant_id) DO NOTHING
    RETURNING user_id
  `, [DEV_BYPASS_USER_ID, tenantId, superAdminRoleId]);
  // Only track for cleanup if we actually inserted the row.
  if ((memberResult.rowCount ?? 0) > 0) {
    insertedMemberTenantId = tenantId;
  }

  // 4. Create a minimal ad template (needed for the two template-dependent endpoints).
  const resp = await call("POST", "/admin/ad-templates", {
    name: "__422-guard-test-template__",
    slug: "__422-guard-test__",
    htmlBody: "<p>422 guard test</p>",
    widthMm: 190,
    heightMm: 133,
  });
  if (resp.status !== 201) {
    throw new Error(`Template creation failed: ${resp.status} ${JSON.stringify(resp.json)}`);
  }
  createdTemplateId = resp.json?.template?.id ?? resp.json?.id;
  if (!createdTemplateId) {
    throw new Error(`Could not determine created template ID from: ${JSON.stringify(resp.json)}`);
  }
  console.log(`  Template created: id=${createdTemplateId}`);
}

// ─── Teardown ─────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log("\n── Cleanup ─────────────────────────────────────────────────────");

  // Restore normal cache operation (re-resolves from DB + disk on next request).
  try {
    await flushCache();
    console.log("  Cache flushed (normal operation restored).");
  } catch (err) {
    console.warn("  WARNING: cache flush failed:", err.message);
  }

  // Delete the test template.
  if (createdTemplateId !== null) {
    try {
      await pool.query("DELETE FROM ad_templates WHERE id = $1", [createdTemplateId]);
      console.log(`  Template ${createdTemplateId} deleted.`);
    } catch (err) {
      console.warn(`  WARNING: could not delete template ${createdTemplateId}:`, err.message);
    }
  }

  // Remove the super-admin membership we inserted.
  if (insertedMemberTenantId !== null) {
    try {
      await pool.query(
        "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id = $2",
        [DEV_BYPASS_USER_ID, insertedMemberTenantId],
      );
    } catch (err) {
      console.warn("  WARNING: could not remove super-admin row:", err.message);
    }
  }

  // Remove the dev-bypass user if we created it.
  if (insertedUserRow) {
    try {
      await pool.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
    } catch (err) {
      console.warn("  WARNING: could not remove test user:", err.message);
    }
  }

  await pool.end();
}

// ─── Core: assert a scenario on all three endpoints ──────────────────────────
// expectedMissing is the exact array the response body must contain (in order).
async function assertScenario(scenarioLabel, logoUri, qrUri, expectedMissing) {
  console.log(`\n── ${scenarioLabel}`);
  console.log(`   Injected: logo=${!!logoUri}, qr=${!!qrUri}`);
  console.log(`   Expected missingAssets: ${JSON.stringify(expectedMissing)}`);

  // Inject the desired asset values into the server-side cache.
  await overrideCache(logoUri, qrUri);

  // 1. POST /admin/ad-pdf/preview-draft ─────────────────────────────────────
  const draft = await call("POST", "/admin/ad-pdf/preview-draft", {
    htmlBody: "<p>422 guard test</p>",
  });
  check(
    "preview-draft → 422",
    draft.status === 422,
    `got ${draft.status}: ${JSON.stringify(draft.json)}`,
  );
  check(
    "preview-draft → missingAssets matches",
    JSON.stringify(draft.json?.missingAssets) === JSON.stringify(expectedMissing),
    `got ${JSON.stringify(draft.json?.missingAssets)}`,
  );
  check(
    "preview-draft → error string mentions missing assets",
    typeof draft.json?.error === "string" && draft.json.error.toLowerCase().includes("missing"),
    `error was: ${JSON.stringify(draft.json?.error)}`,
  );

  // 2. GET /admin/ad-pdf/preview ────────────────────────────────────────────
  // Re-inject before each call: the previous call may have re-populated the
  // cache via loadAdBrandAssets() if the guard did NOT fire (Scenario D).
  await overrideCache(logoUri, qrUri);
  const preview = await call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`);
  check(
    "ad-pdf/preview → 422",
    preview.status === 422,
    `got ${preview.status}: ${JSON.stringify(preview.json)}`,
  );
  check(
    "ad-pdf/preview → missingAssets matches",
    JSON.stringify(preview.json?.missingAssets) === JSON.stringify(expectedMissing),
    `got ${JSON.stringify(preview.json?.missingAssets)}`,
  );
  check(
    "ad-pdf/preview → error string mentions missing assets",
    typeof preview.json?.error === "string" && preview.json.error.toLowerCase().includes("missing"),
    `error was: ${JSON.stringify(preview.json?.error)}`,
  );

  // 3. POST /admin/ad-pdf ───────────────────────────────────────────────────
  await overrideCache(logoUri, qrUri);
  const pdf = await call("POST", "/admin/ad-pdf", { templateId: createdTemplateId });
  check(
    "ad-pdf → 422",
    pdf.status === 422,
    `got ${pdf.status}: ${JSON.stringify(pdf.json)}`,
  );
  check(
    "ad-pdf → missingAssets matches",
    JSON.stringify(pdf.json?.missingAssets) === JSON.stringify(expectedMissing),
    `got ${JSON.stringify(pdf.json?.missingAssets)}`,
  );
  check(
    "ad-pdf → error string mentions missing assets",
    typeof pdf.json?.error === "string" && pdf.json.error.toLowerCase().includes("missing"),
    `error was: ${JSON.stringify(pdf.json?.error)}`,
  );
}

// Minimal 1×1 PNG data-URIs — different pixel colours so they are distinct assets.
const STUB_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
const STUB_QR   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// ─── Main ─────────────────────────────────────────────────────────────────────
await preflight();
console.log("\n── Setup ───────────────────────────────────────────────────────");
await setup();

try {

  // Scenario A: both assets missing ──────────────────────────────────────────
  await assertScenario(
    "Scenario A — both logo AND QR code missing",
    "", "",
    ["logo", "QR code"],
  );

  // Scenario B: logo missing, QR present ────────────────────────────────────
  await assertScenario(
    "Scenario B — logo missing, QR code present",
    "", STUB_QR,
    ["logo"],
  );

  // Scenario C: QR missing, logo present ────────────────────────────────────
  await assertScenario(
    "Scenario C — logo present, QR code missing",
    STUB_LOGO, "",
    ["QR code"],
  );

  // Scenario D: both present → guard must NOT fire ───────────────────────────
  // The render will fail for other reasons in this environment (WeasyPrint not
  // available, external font fetch, etc.) but the response must NOT be 422.
  // This confirms the guard is conditional rather than always-on.
  console.log("\n── Scenario D — both assets present → guard must NOT fire (no 422)");
  await overrideCache(STUB_LOGO, STUB_QR);

  const draftD = await call("POST", "/admin/ad-pdf/preview-draft", {
    htmlBody: "<p>422 guard test</p>",
  });
  check(
    "preview-draft with valid assets → NOT 422",
    draftD.status !== 422,
    `got ${draftD.status}: ${JSON.stringify(draftD.json)}`,
  );

  await overrideCache(STUB_LOGO, STUB_QR);
  const previewD = await call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`);
  check(
    "ad-pdf/preview with valid assets → NOT 422",
    previewD.status !== 422,
    `got ${previewD.status}: ${JSON.stringify(previewD.json)}`,
  );

  await overrideCache(STUB_LOGO, STUB_QR);
  const pdfD = await call("POST", "/admin/ad-pdf", { templateId: createdTemplateId });
  check(
    "ad-pdf with valid assets → NOT 422",
    pdfD.status !== 422,
    `got ${pdfD.status}: ${JSON.stringify(pdfD.json)}`,
  );

} finally {
  await cleanup();
}

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll ad-pdf 422-guard checks passed.");
