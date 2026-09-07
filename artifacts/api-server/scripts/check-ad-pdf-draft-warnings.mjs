#!/usr/bin/env node
/**
 * API regression check for draft and saved-template ad render warnings.
 *
 * This deliberately calls the running Express API instead of testing the
 * detector in isolation. It proves that successful draft preview, saved
 * preview, and saved PDF responses preserve the warning header the admin
 * portal reads, while canonical placeholders do not produce a warning header.
 *
 * Run with:
 *   node scripts/check-ad-pdf-draft-warnings.mjs
 *
 * Env:
 *   API_BASE         (default http://localhost:80/api)
 *   DATABASE_URL     (required for the temporary super-admin fixture)
 *   DEV_BYPASS_TOKEN (default bde-dev-bypass-local)
 */

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { acquireProcessLock } from "./lib/process-lock.mjs";

const require = createRequire(import.meta.url);
let pg;
try {
  pg = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
} catch {
  pg = require("pg");
}

const { Pool } = pg;
const API_BASE = process.env.API_BASE ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const DEV_BYPASS_USER_ID = "dev-bypass-user";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to set up the super-admin test fixture.");
  process.exit(2);
}

const releaseAdPdfValidationLock =
  await acquireProcessLock("bde-ad-pdf-validation");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
let insertedUser = false;
let insertedMembershipTenantId = null;
let insertedTemplateId = null;

const STUB_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
const STUB_QR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const DRAFT_PREFIX = `<!doctype html>
<html>
  <head>
    <style>
      {{font_css}}
      @page { size: 190mm 133mm; margin: 0; }
      body { margin: 0; }
      .background { background-image: url('{{bg}}'); width: 190mm; height: 133mm; }
    </style>
  </head>
  <body>
    <div class="background">
      <img src="{{logo}}" alt="logo" width="1" height="1">
      <img src="{{qr}}" alt="qr" width="1" height="1">`;
const DRAFT_SUFFIX = `
    </div>
  </body>
</html>`;

const WARNING_BODY = `${DRAFT_PREFIX}<span>{{ headline }}</span>${DRAFT_SUFFIX}`;
const CANONICAL_BODY = `${DRAFT_PREFIX}<span>{{headline}}</span>${DRAFT_SUFFIX}`;
const EXPECTED_WARNING = "{{ headline }} looks like a typo for {{headline}}";

async function call(method, path, body, timeoutMs = 240_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "x-dev-bypass": DEV_BYPASS_TOKEN,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      response,
      bytes,
      warningHeader: response.headers.get("X-Ad-Render-Warnings"),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function setupSuperAdminFixture() {
  const roleResult = await pool.query(
    `SELECT id
       FROM roles
      WHERE name = 'BDE Super Admin' AND is_system_role = true
      LIMIT 1`,
  );
  const roleId = roleResult.rows[0]?.id;
  assert(roleId, "BDE Super Admin system role is not seeded");

  const userResult = await pool.query(
    `INSERT INTO users (id, email)
     VALUES ($1, 'dev-bypass@test.invalid')
     ON CONFLICT (id) DO NOTHING
     RETURNING id`,
    [DEV_BYPASS_USER_ID],
  );
  insertedUser = (userResult.rowCount ?? 0) > 0;

  const tenantResult = await pool.query(
    "SELECT id FROM tenants WHERE is_active = true ORDER BY id LIMIT 1",
  );
  const tenantId = tenantResult.rows[0]?.id;
  assert(tenantId, "At least one active tenant is required");

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

async function preflight() {
  const response = await fetch(`${API_BASE}/healthz`);
  assert.notEqual(
    response.status,
    502,
    `API server is unavailable at ${API_BASE}; start the API workflow first`,
  );
  assert.notEqual(response.status, 503, `API server returned ${response.status}`);
  assert.notEqual(response.status, 504, `API server returned ${response.status}`);
}

async function overrideBrandAssetCache() {
  const result = await call("PUT", "/admin/ad-brand-assets/cache", {
    logoUri: STUB_LOGO,
    qrUri: STUB_QR,
  });
  assert.equal(result.response.status, 200, "brand asset cache override should succeed");
}

async function flushBrandAssetCache() {
  const result = await call("DELETE", "/admin/ad-brand-assets/cache");
  assert.equal(result.response.status, 200, "brand asset cache flush should succeed");
}

async function insertSavedTemplate(htmlBody) {
  const result = await pool.query(
    `INSERT INTO ad_templates
       (name, slug, width_mm, height_mm, html_body, is_default)
     VALUES ($1, $2, 190, 133, $3, false)
     RETURNING id`,
    [
      "Ad render warning regression fixture",
      `ad-render-warning-regression-${process.pid}-${Date.now()}`,
      htmlBody,
    ],
  );
  insertedTemplateId = result.rows[0]?.id ?? null;
  assert(insertedTemplateId, "temporary saved template should be inserted");
}

async function updateSavedTemplate(htmlBody) {
  const result = await pool.query(
    `UPDATE ad_templates
        SET html_body = $1, updated_at = NOW()
      WHERE id = $2`,
    [htmlBody, insertedTemplateId],
  );
  assert.equal(result.rowCount, 1, "temporary saved template should be updated");
}

function assertPngResponse(result, label) {
  assert.equal(result.response.status, 200, `${label} should render successfully`);
  assert.equal(
    result.response.headers.get("Content-Type"),
    "image/png",
    `${label} should return a PNG`,
  );
  assert.deepEqual(
    [...result.bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${label} should return PNG bytes`,
  );
}

function assertPdfResponse(result, label) {
  assert.equal(result.response.status, 200, `${label} should render successfully`);
  assert.equal(
    result.response.headers.get("Content-Type"),
    "application/pdf",
    `${label} should return a PDF`,
  );
  assert.equal(
    result.bytes.subarray(0, 5).toString("ascii"),
    "%PDF-",
    `${label} should return PDF bytes`,
  );
}

function assertExpectedWarning(result, label) {
  assert.equal(
    result.warningHeader,
    JSON.stringify([EXPECTED_WARNING]),
    `${label} should preserve the near-miss warning in X-Ad-Render-Warnings`,
  );
  assert.deepEqual(
    JSON.parse(result.warningHeader),
    [EXPECTED_WARNING],
    `${label} warning header should contain the expected typo warning`,
  );
}

function savedPreviewPath() {
  const params = new URLSearchParams({
    templateId: String(insertedTemplateId),
    bgUrl: "https://httpbin.org/image/jpeg",
  });
  return `/admin/ad-pdf/preview?${params}`;
}

function savedPdfBody() {
  return {
    templateId: insertedTemplateId,
    bgUrl: "https://httpbin.org/image/jpeg",
  };
}

async function run() {
  await preflight();
  await setupSuperAdminFixture();
  await overrideBrandAssetCache();

  const warningResult = await call("POST", "/admin/ad-pdf/preview-draft", {
    htmlBody: WARNING_BODY,
    bgUrl: "https://httpbin.org/image/jpeg",
    widthMm: 190,
    heightMm: 133,
  });
  assertPngResponse(warningResult, "a draft containing a near-miss placeholder");
  assertExpectedWarning(warningResult, "the draft preview");

  const canonicalResult = await call("POST", "/admin/ad-pdf/preview-draft", {
    htmlBody: CANONICAL_BODY,
    bgUrl: "https://httpbin.org/image/jpeg",
    widthMm: 190,
    heightMm: 133,
  });
  assertPngResponse(canonicalResult, "a draft containing only canonical placeholders");
  assert.equal(
    canonicalResult.warningHeader,
    null,
    "canonical placeholders should not produce X-Ad-Render-Warnings",
  );

  await insertSavedTemplate(WARNING_BODY);

  const savedWarningPreview = await call("GET", savedPreviewPath());
  assertPngResponse(savedWarningPreview, "a saved preview containing a near-miss placeholder");
  assertExpectedWarning(savedWarningPreview, "the saved preview");

  const savedWarningPdf = await call("POST", "/admin/ad-pdf", savedPdfBody());
  assertPdfResponse(savedWarningPdf, "a saved PDF containing a near-miss placeholder");
  assertExpectedWarning(savedWarningPdf, "the saved PDF");

  await updateSavedTemplate(CANONICAL_BODY);

  const savedCanonicalPreview = await call("GET", savedPreviewPath());
  assertPngResponse(savedCanonicalPreview, "a saved preview containing only canonical placeholders");
  assert.equal(
    savedCanonicalPreview.warningHeader,
    null,
    "a canonical-only saved preview should omit X-Ad-Render-Warnings",
  );

  const savedCanonicalPdf = await call("POST", "/admin/ad-pdf", savedPdfBody());
  assertPdfResponse(savedCanonicalPdf, "a saved PDF containing only canonical placeholders");
  assert.equal(
    savedCanonicalPdf.warningHeader,
    null,
    "a canonical-only saved PDF should omit X-Ad-Render-Warnings",
  );

  console.log("Ad render warning regression passed.");
  console.log("  draft preview: warning and canonical control verified");
  console.log("  saved preview: warning and canonical control verified");
  console.log("  saved PDF: warning and canonical control verified");
}

async function cleanup() {
  if (insertedTemplateId !== null) {
    try {
      await pool.query("DELETE FROM ad_templates WHERE id = $1", [insertedTemplateId]);
    } catch (error) {
      console.warn("Warning: could not remove the temporary ad template:", error.message);
    }
  }

  try {
    await flushBrandAssetCache();
  } catch (error) {
    console.warn("Warning: could not flush the ad brand asset cache:", error.message);
  }

  if (insertedMembershipTenantId !== null) {
    await pool.query(
      "DELETE FROM user_tenants WHERE user_id = $1 AND tenant_id = $2",
      [DEV_BYPASS_USER_ID, insertedMembershipTenantId],
    );
  }
  if (insertedUser) {
    await pool.query("DELETE FROM users WHERE id = $1", [DEV_BYPASS_USER_ID]);
  }
  await pool.end();
}

try {
  await run();
} catch (error) {
  console.error("Ad render warning regression failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await cleanup();
  await releaseAdPdfValidationLock();
}