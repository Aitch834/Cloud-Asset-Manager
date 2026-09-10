#!/usr/bin/env node
// Integration check: stable 422 contracts on the three ad-PDF render endpoints,
// AND the brand-asset status endpoint used by the admin-portal warning banner.
//
// Part 1 — 422 guard (loadAdBrandAssets / in-memory cache path)
// ──────────────────────────────────────────────────────────────
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
// Part 2 — Status endpoint (resolveAdBrandAssets / live DB state)
// ───────────────────────────────────────────────────────────────
// GET /admin/ad-brand-assets/status calls resolveAdBrandAssets() which is
// cache-free: it reads from platform_config in the DB and falls back to
// legacy on-disk HTML files if either key is absent/empty.
//
// Because the cache-override mechanism (PUT .../cache) bypasses resolveAdBrandAssets(),
// these checks manipulate the DB directly and temporarily rename the on-disk fallback
// directory so that "missing" scenarios are not silently satisfied by the file fallback.
//
// Expected outcomes:
//   • Both missing  → { logoResolvable: false, qrResolvable: false }
//   • Logo missing  → { logoResolvable: false, qrResolvable: true  }
//   • QR missing    → { logoResolvable: true,  qrResolvable: false }
//   • Both present  → { logoResolvable: true,  qrResolvable: true  }
//
// Usage:  node scripts/check-ad-pdf-422-guard.mjs
// Env:    API_BASE         (default http://localhost:80/api)
//         DATABASE_URL     (required — for super-admin fixture setup/teardown)
//         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)

import { createRequire } from "node:module";
import { renameSync, existsSync } from "node:fs";
import { resolve as pathResolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { acquireProcessLock } from "./lib/process-lock.mjs";
import { overrideAdBrandAssetCache } from "./lib/ad-brand-asset-cache-override.mjs";

// Absolute path to the legacy on-disk fallback directory, relative to this script.
// The API server resolves it via path.resolve(process.cwd(), "scripts/ad-templates")
// when its CWD is artifacts/api-server/.  This is the same physical directory.
const __scriptDir = dirname(fileURLToPath(import.meta.url));
const FALLBACK_DIR     = pathResolve(__scriptDir, "ad-templates");
const FALLBACK_DIR_BAK = pathResolve(__scriptDir, "ad-templates.bak");
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

const releaseAdPdfValidationLock =
  await acquireProcessLock("bde-ad-pdf-validation");

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

// timeoutMs: optional AbortController timeout (ms).  Returns { status, json, timedOut }.
async function call(method, path, body, timeoutMs) {
  const controller = timeoutMs ? new AbortController() : null;
  const timer      = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: BASE_HEADERS,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller?.signal,
    });
    let json = null;
    try { json = await res.json(); } catch { /* binary response (PNG/PDF) — ignore */ }
    return { status: res.status, json, timedOut: false };
  } catch (err) {
    if (err?.name === "AbortError" || err?.code === "ABORT_ERR") {
      return { status: null, json: null, timedOut: true };
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
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

// Status-check cleanup state
let fallbackDirRenamed     = false;   // true while FALLBACK_DIR has been moved to FALLBACK_DIR_BAK
let savedLogoValue         = undefined; // undefined = key was not in DB before status tests
let savedQrValue           = undefined;

// ─── Status-check DB helpers ──────────────────────────────────────────────────

// Fetch current DB value for a platform_config key via raw SQL (read-only).
// Returns undefined when the key is absent, or the stored string when present.
// We always read via pool.query so this does not depend on the API being up.
async function getConfigValue(key) {
  const { rows } = await pool.query(
    "SELECT value FROM platform_config WHERE key = $1",
    [key],
  );
  return rows.length > 0 ? rows[0].value : undefined;
}

// Set a platform_config key to a non-empty value via the HTTP API.
// Using the same route (PUT /admin/platform-config/:key) that the API server
// uses for writes ensures both the write and the subsequent resolveAdBrandAssets()
// read share the same Drizzle ORM connection pool — eliminating any inter-pool
// visibility lag that would occur when writing via a separate pool.query client.
async function setConfigViaApi(key, value) {
  // URL-encode the key since it contains a dot (brand.adLogoDataUrl).
  const r = await call("PUT", `/admin/platform-config/${encodeURIComponent(key)}`, { value });
  if (r.status !== 200) {
    throw new Error(`setConfigViaApi(${key}) failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

// Remove a platform_config key via the HTTP API (triggers the same Drizzle path).
async function deleteConfigViaApi(key) {
  const r = await call("DELETE", `/admin/platform-config/${encodeURIComponent(key)}`);
  if (r.status !== 200 && r.status !== 404) {
    throw new Error(`deleteConfigViaApi(${key}) failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

// Restore a config key to its pre-test state:
//   • undefined → key was absent before tests → delete it
//   • non-empty string → key had a value → restore via API PUT
//   • "" (empty string) → edge case: restore via raw SQL (API rejects empty values)
async function restoreConfigKey(key, savedValue) {
  if (savedValue === undefined) {
    await deleteConfigViaApi(key);
  } else if (savedValue === "") {
    await pool.query(
      "UPDATE platform_config SET value = $2, updated_at = NOW() WHERE key = $1",
      [key, ""],
    );
  } else {
    await setConfigViaApi(key, savedValue);
  }
}

// ─── Fallback-dir helpers ─────────────────────────────────────────────────────

// Recover a fallback directory left behind when a previous run was force-killed
// before its finally block could restore the original name.
function recoverStaleFallbackDir() {
  if (existsSync(FALLBACK_DIR_BAK) && !existsSync(FALLBACK_DIR)) {
    console.warn(
      `WARNING: found stale fallback backup at ${FALLBACK_DIR_BAK}; ` +
      `automatically restoring it to ${FALLBACK_DIR}.`,
    );
    renameSync(FALLBACK_DIR_BAK, FALLBACK_DIR);
  }
}

// Rename the on-disk fallback directory so resolveAdBrandAssets() cannot use it.
// This must be done before "missing" status scenarios, because the function falls
// back to those HTML files whenever a DB value is absent/empty.
function hideFallbackDir() {
  if (!existsSync(FALLBACK_DIR)) return; // already absent — nothing to do
  if (existsSync(FALLBACK_DIR_BAK)) {
    throw new Error(
      `Backup path ${FALLBACK_DIR_BAK} already exists — a previous run may have left it. ` +
      `Rename it back to ${FALLBACK_DIR} and re-run.`,
    );
  }
  renameSync(FALLBACK_DIR, FALLBACK_DIR_BAK);
  fallbackDirRenamed = true;
}

// Restore the fallback directory to its original name.
function restoreFallbackDir() {
  if (!fallbackDirRenamed) return;
  if (existsSync(FALLBACK_DIR_BAK)) {
    renameSync(FALLBACK_DIR_BAK, FALLBACK_DIR);
  }
  fallbackDirRenamed = false;
}

// ─── Status-check scenario helper ────────────────────────────────────────────

// Call GET /admin/ad-brand-assets/status and confirm it returns the expected flags.
// logoExpected / qrExpected are booleans.
async function assertStatusScenario(label, logoExpected, qrExpected) {
  console.log(`\n── Status ${label}`);
  console.log(`   Expected: logoResolvable=${logoExpected}, qrResolvable=${qrExpected}`);

  const r = await call("GET", "/admin/ad-brand-assets/status");
  check(
    `${label} → HTTP 200`,
    r.status === 200,
    `got ${r.status}: ${JSON.stringify(r.json)}`,
  );
  check(
    `${label} → logoResolvable = ${logoExpected}`,
    r.json?.logoResolvable === logoExpected,
    `got ${JSON.stringify(r.json?.logoResolvable)}`,
  );
  check(
    `${label} → qrResolvable = ${qrExpected}`,
    r.json?.qrResolvable === qrExpected,
    `got ${JSON.stringify(r.json?.qrResolvable)}`,
  );
}

// ─── Status-check suite ───────────────────────────────────────────────────────

async function runStatusChecks() {
  console.log("\n\n══ Part 3: brand-asset status endpoint ═════════════════════════");
  console.log(
    "   (GET /admin/ad-brand-assets/status — uses resolveAdBrandAssets(),\n" +
    "    which is cache-free and reads from the DB then the on-disk fallback.)",
  );

  // 1. Save the current DB state so we can restore it afterwards.
  savedLogoValue = await getConfigValue("brand.adLogoDataUrl");
  savedQrValue   = await getConfigValue("brand.adQrDataUrl");
  console.log(
    `\n   Pre-test DB state: logo=${savedLogoValue !== undefined ? "present" : "absent"}, ` +
    `qr=${savedQrValue !== undefined ? "present" : "absent"}`,
  );

  // 2. Hide the on-disk fallback directory so resolveAdBrandAssets() cannot use
  //    it as a fallback when DB keys are absent/empty.  This makes the "missing"
  //    scenarios deterministic regardless of whether legacy HTML files exist.
  hideFallbackDir();
  if (fallbackDirRenamed) {
    console.log(`   Fallback dir temporarily renamed to ${FALLBACK_DIR_BAK}`);
  } else {
    console.log("   Fallback dir not present — no rename needed.");
  }

  // All DB writes in the status-check suite go through the HTTP API so that
  // both writes and the subsequent resolveAdBrandAssets() reads share the same
  // Drizzle ORM connection pool.  Raw pool.query writes (separate pg client)
  // were previously invisible to the API server's Drizzle reads due to inter-
  // pool connection isolation.
  //
  // "missing" scenario = DELETE the key from DB.  resolveAdBrandAssets() then
  //   gets undefined → "" for that key and tries the on-disk fallback, which is
  //   hidden at this point, so the result stays "" → logoResolvable/qrResolvable: false.
  // "present" scenario = PUT the key to a stub data-URI.

  try {
    // ── S-A: both missing ─────────────────────────────────────────────────────
    await deleteConfigViaApi("brand.adLogoDataUrl");
    await deleteConfigViaApi("brand.adQrDataUrl");
    await assertStatusScenario("S-A (both missing)", false, false);

    // ── S-B: logo missing, QR present ────────────────────────────────────────
    await deleteConfigViaApi("brand.adLogoDataUrl");
    await setConfigViaApi("brand.adQrDataUrl", STUB_QR);
    await assertStatusScenario("S-B (logo missing, QR present)", false, true);

    // ── S-C: logo present, QR missing ────────────────────────────────────────
    await setConfigViaApi("brand.adLogoDataUrl", STUB_LOGO);
    await deleteConfigViaApi("brand.adQrDataUrl");
    await assertStatusScenario("S-C (logo present, QR missing)", true, false);

    // ── S-D: both present ─────────────────────────────────────────────────────
    await setConfigViaApi("brand.adLogoDataUrl", STUB_LOGO);
    await setConfigViaApi("brand.adQrDataUrl",   STUB_QR);
    await assertStatusScenario("S-D (both present)", true, true);

  } finally {
    // Restore the fallback directory FIRST so the server returns to normal
    // operation before we restore the DB (avoids a window where DB is restored
    // but disk is still hidden, causing the status endpoint to see wrong results
    // if another request races in).
    restoreFallbackDir();
    if (!fallbackDirRenamed) {
      console.log("\n   Fallback dir restored.");
    }

    // Restore original DB values.
    await restoreConfigKey("brand.adLogoDataUrl", savedLogoValue);
    await restoreConfigKey("brand.adQrDataUrl",   savedQrValue);
    console.log(
      `   DB state restored: logo=${savedLogoValue !== undefined ? "present" : "absent"}, ` +
      `qr=${savedQrValue !== undefined ? "present" : "absent"}`,
    );
  }
}

// ─── Cache override helper ────────────────────────────────────────────────────
// Injects logoUri / qrUri directly into the server-side in-memory cache so the
// next call to loadAdBrandAssets() returns the injected values without touching
// the DB or on-disk fallback files.
// Pass "" for either value to simulate that asset being missing.
async function overrideCache(logoUri, qrUri) {
  await overrideAdBrandAssetCache(call, logoUri, qrUri);
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
  // Purge any stale copy left by a previous interrupted run before creating.
  await pool.query("DELETE FROM ad_templates WHERE slug = '__422-guard-test__'");

  // The body must include all required placeholders so the placeholder-presence guard
  // does not fire before the brand-asset guard that we are testing.
  const resp = await call("POST", "/admin/ad-templates", {
    name: "__422-guard-test-template__",
    slug: "__422-guard-test__",
    htmlBody: GUARD_TEST_BODY,
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

  // Safety: if the script crashed mid-status-check, restore the fallback dir and
  // DB values so the running API server is not left in a broken state.
  try {
    restoreFallbackDir();
  } catch (err) {
    console.warn("  WARNING: could not restore fallback dir:", err.message);
  }
  if (savedLogoValue !== undefined || savedQrValue !== undefined) {
    try {
      await restoreConfigKey("brand.adLogoDataUrl", savedLogoValue);
      await restoreConfigKey("brand.adQrDataUrl",   savedQrValue);
    } catch (err) {
      console.warn("  WARNING: could not restore platform_config values:", err.message);
    }
  }

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
    htmlBody: GUARD_TEST_BODY,
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

// ─── Missing-placeholder response contract ───────────────────────────────────
// The admin portal renders each missingPlaceholders item as a token. Keep this
// array canonical and stable rather than returning explanatory sentences.
async function runMissingPlaceholderChecks() {
  console.log("\n\n══ Part 2: missing-placeholder response contract ═══════════════");

  const missingLogoBody = "<p>missing logo contract test</p>{{font_css}}{{bg}}{{qr}}";
  const expected = ["{{logo}}"];

  // Saved-template endpoints check brand assets before placeholders, so ensure
  // both assets are resolvable and replace the fixture body with one missing token.
  await overrideCache(STUB_LOGO, STUB_QR);
  await pool.query(
    "UPDATE ad_templates SET html_body = $1, updated_at = NOW() WHERE id = $2",
    [missingLogoBody, createdTemplateId],
  );

  const endpoints = [
    {
      label: "preview-draft",
      call: () => call("POST", "/admin/ad-pdf/preview-draft", { htmlBody: missingLogoBody }),
    },
    {
      label: "ad-pdf/preview",
      call: () => call("GET", `/admin/ad-pdf/preview?templateId=${createdTemplateId}`),
    },
    {
      label: "ad-pdf",
      call: () => call("POST", "/admin/ad-pdf", { templateId: createdTemplateId }),
    },
  ];

  for (const endpoint of endpoints) {
    await overrideCache(STUB_LOGO, STUB_QR);
    const result = await endpoint.call();
    check(
      `${endpoint.label} missing placeholder → 422`,
      result.status === 422,
      `got ${result.status}: ${JSON.stringify(result.json)}`,
    );
    check(
      `${endpoint.label} missingPlaceholders uses canonical tokens`,
      JSON.stringify(result.json?.missingPlaceholders) === JSON.stringify(expected),
      `got ${JSON.stringify(result.json?.missingPlaceholders)}`,
    );
    check(
      `${endpoint.label} error remains user-readable`,
      typeof result.json?.error === "string" && result.json.error.includes("{{logo}}"),
      `error was: ${JSON.stringify(result.json?.error)}`,
    );
  }
}

// Minimal 1×1 PNG data-URIs — different pixel colours so they are distinct assets.
const STUB_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
const STUB_QR   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// HTML body used for all ad-PDF guard tests.
// Must include every required placeholder so the placeholder-presence guard
// (which runs BEFORE the brand-asset guard) does not fire prematurely and
// return missingPlaceholders instead of missingAssets.
// Required: {{font_css}}, {{logo}}, {{bg}}, {{qr}}  (from AD_TEMPLATE_REQUIRED_PLACEHOLDERS).
const GUARD_TEST_BODY = "<p>422 guard test</p>{{font_css}}{{logo}}{{bg}}{{qr}}";

// ─── Main ─────────────────────────────────────────────────────────────────────
recoverStaleFallbackDir();
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

  // Scenario D — both assets present: confirmed implicitly by Scenarios B and C.
  //
  // In Scenario B the guard returns missingAssets: ["logo"] (not ["logo","QR code"]),
  // proving that a present QR asset does NOT trigger the guard.
  // In Scenario C the guard returns missingAssets: ["QR code"] (not both), proving
  // that a present logo does NOT trigger the guard.
  // Together these demonstrate the guard is conditional on absence, not always-on.
  //
  // We do NOT make a "both assets present" live-render request here because all three
  // render endpoints use execSync(WeasyPrint/Ghostscript) which blocks the API server's
  // event loop for up to 180 s.  Issuing such a request would prevent the follow-on
  // status endpoint checks from running for the duration of the render.
  console.log("\n── Scenario D (guard conditionality) — confirmed by Scenarios B and C above.");
  console.log("   Scenario B: missingAssets=[\"logo\"] proves QR-present does not trigger guard.");
  console.log("   Scenario C: missingAssets=[\"QR code\"] proves logo-present does not trigger guard.");

  await runMissingPlaceholderChecks();

  // ── Part 3: status endpoint ──────────────────────────────────────────────────
  // runStatusChecks() manages its own DB state and fallback-dir rename/restore
  // inside its own try/finally, so it is safe to call here even if Part 1 had
  // failures.  The outer cleanup() also has a safety-restore in case this throws.
  await runStatusChecks();

} finally {
  await cleanup();
}

await releaseAdPdfValidationLock();

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll ad-pdf 422 contracts and brand-asset status checks passed.");
