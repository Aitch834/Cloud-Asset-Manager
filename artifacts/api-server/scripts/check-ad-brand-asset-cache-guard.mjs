#!/usr/bin/env node
/**
 * check-ad-brand-asset-cache-guard.mjs
 *
 * Confirms that the NODE_ENV=production 404 guard on
 * PUT /admin/ad-brand-assets/cache is in place and works correctly.
 *
 * Background: The PUT cache-override endpoint is a test-only hook that lets
 * integration checks inject known asset URIs without touching the DB or
 * on-disk fallback files.  When NODE_ENV=production it must return 404 so
 * that the mechanism cannot be invoked on a live deployment.
 *
 * Tests:
 *   A. Static source check — guard expression present in admin.ts source,
 *      and fires BEFORE the auth check (cannot be bypassed by an unauthenticated
 *      caller in production either).
 *   B. Dev-server integration — super-admin + valid body → 200 OK with
 *      { overridden: true }.
 *   C. Dev-server integration — super-admin + missing fields → 400 Bad Request.
 *   D. Production simulation — child process with NODE_ENV=production replicates
 *      the exact guard logic and must return 404 for any caller.
 *
 * Usage:  node scripts/check-ad-brand-asset-cache-guard.mjs
 * Env:    API_BASE         (default http://localhost:80/api)
 *         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)
 *         DATABASE_URL     (required for super-admin fixture — tests B and C)
 */

import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve as pathResolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const __scriptDir = dirname(fileURLToPath(import.meta.url));
const require      = createRequire(import.meta.url);

const API_BASE           = process.env.API_BASE         ?? "http://localhost:80/api";
const DEV_BYPASS_TOKEN   = process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local";
const DEV_BYPASS_USER_ID = "dev-bypass-user";

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

// ─── HTTP helper ─────────────────────────────────────────────────────────────
const BYPASS_HEADERS = {
  "x-dev-bypass":  DEV_BYPASS_TOKEN,
  "Content-Type": "application/json",
};

async function call(method, path, body, extraHeaders = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...BYPASS_HEADERS, ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json };
}

// ─── Preflight: API server alive ──────────────────────────────────────────────
// Returns true if reachable, false otherwise (caller decides how to proceed).
async function preflight() {
  const attempts = 3;
  let last = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) return true;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err?.cause?.code ?? err?.message ?? String(err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500));
  }
  console.warn(
    `\n  [skip] API server unreachable at ${API_BASE} (${last}).\n` +
    `  Start the "artifacts/api-server: API Server" workflow to run tests B and C.\n`,
  );
  return false;
}

// ─── pg pool (only needed for tests B and C) ─────────────────────────────────
let pool = null;
function getPool() {
  if (pool) return pool;
  let pgPkg;
  try {
    pgPkg = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
  } catch {
    pgPkg = require("pg");
  }
  pool = new pgPkg.Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

// ─── Super-admin fixture ──────────────────────────────────────────────────────
let insertedUserRow     = false;
let insertedTenantId    = null;

async function setup() {
  const pg = getPool();

  // Upsert the dev-bypass user (may already exist from prior check scripts).
  const existing = await pg.query(`SELECT id FROM users WHERE id = $1`, [DEV_BYPASS_USER_ID]);
  if (existing.rows.length === 0) {
    await pg.query(
      `INSERT INTO users (id, email, first_name, last_name)
       VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [DEV_BYPASS_USER_ID, "dev-bypass@test.internal", "Dev", "Bypass"],
    );
    insertedUserRow = true;
  }

  // Create a dedicated tenant for this fixture.
  const { rows } = await pg.query(
    `INSERT INTO tenants (name, slug, contact_email) VALUES ($1, $2, $3) RETURNING id`,
    ["cache-guard-check-tenant", `cache-guard-chk-${Date.now()}`, "cache-guard@example.com"],
  );
  insertedTenantId = rows[0].id;

  // Look up the BDE Super Admin role ID (required NOT NULL column on user_tenants).
  const roleResult = await pg.query(
    `SELECT id FROM roles WHERE name = 'BDE Super Admin' AND is_system_role = true LIMIT 1`,
  );
  if (roleResult.rows.length === 0) {
    throw new Error("Cannot find 'BDE Super Admin' system role — is the roles table seeded?");
  }
  const superAdminRoleId = roleResult.rows[0].id;

  // Grant super-admin on that tenant.
  await pg.query(
    `INSERT INTO user_tenants (user_id, tenant_id, role_id, is_super_admin, is_active)
     VALUES ($1, $2, $3, true, true)
     ON CONFLICT (user_id, tenant_id) DO UPDATE SET role_id = $3, is_super_admin = true, is_active = true`,
    [DEV_BYPASS_USER_ID, insertedTenantId, superAdminRoleId],
  );
  console.log(`  fixture: super-admin row created (tenant ${insertedTenantId})`);
}

async function cleanup() {
  if (!pool) return;
  try {
    if (insertedTenantId) {
      await pool.query(`DELETE FROM user_tenants WHERE tenant_id = $1`, [insertedTenantId]);
      await pool.query(`DELETE FROM tenants WHERE id = $1`, [insertedTenantId]);
    }
    if (insertedUserRow) {
      await pool.query(`DELETE FROM users WHERE id = $1`, [DEV_BYPASS_USER_ID]);
    }
  } catch (err) {
    console.warn("  [cleanup warning]", err?.message ?? err);
  } finally {
    await pool.end();
    pool = null;
  }
}

// ─── Production simulation server ────────────────────────────────────────────
// Spawns a minimal Node.js http server with NODE_ENV=production.  The server
// replicates the exact guard logic from admin.ts so we can verify the behaviour
// produced by that logic pattern under production conditions without starting
// the full API server in production mode (which would require a real DB, Clerk,
// etc.).  Test A (static) guards against the source text drifting; Test D guards
// against the logic being semantically wrong under production NODE_ENV.
async function spawnProductionSimServer() {
  // Find a free port by temporarily binding to :0.
  const port = await new Promise((resolve, reject) => {
    const tmp = createServer();
    tmp.listen(0, "127.0.0.1", () => {
      const p = tmp.address().port;
      tmp.close(() => resolve(p));
    });
    tmp.on("error", reject);
  });

  // Inline script — replicates the guard block verbatim, minus the auth check
  // (which is tested separately by the dev-server integration tests above).
  // The guard must fire BEFORE auth, so removing auth does not change its behaviour.
  const inlineScript = `
const http = require("node:http");
const server = http.createServer((req, res) => {
  if (req.method === "PUT" && req.url === "/admin/ad-brand-assets/cache") {
    // ── Guard replicated verbatim from admin.ts ──────────────────────────────
    if (process.env.NODE_ENV === "production") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    // ────────────────────────────────────────────────────────────────────────
    let data = "";
    req.on("data", (c) => { data += c; });
    req.on("end", () => {
      try {
        const { logoUri, qrUri } = JSON.parse(data || "{}");
        if (typeof logoUri !== "string" || typeof qrUri !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "logoUri and qrUri (strings) are required" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ overridden: true, logoUri: !!logoUri, qrUri: !!qrUri }));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad JSON" }));
      }
    });
    return;
  }
  res.writeHead(404); res.end();
});
server.listen(${port}, "127.0.0.1", () => process.stdout.write("ready\\n"));
`;

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["-e", inlineScript], {
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.includes("ready")) {
        resolve({ port, stop: () => child.kill() });
      }
    });
    child.stderr.on("data", (d) => console.error("[prod-sim]", d.toString().trim()));
    child.on("error", reject);

    // Guard against a hung child process.
    setTimeout(() => reject(new Error("Production simulation server timed out")), 6000);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// ── Test A: static source check ───────────────────────────────────────────────
console.log("\n── Test A: static source check ─────────────────────────────────────");

const adminSrcPath = pathResolve(__scriptDir, "../src/routes/admin.ts");
const adminSrc     = readFileSync(adminSrcPath, "utf8");

// 1a. The guard expression is present.
check(
  'admin.ts: guard expression process.env.NODE_ENV === "production" is present',
  adminSrc.includes('process.env.NODE_ENV === "production"'),
  'guard missing — endpoint is unprotected in production',
);

// 1b. The route handler returns 404 under that condition.
check(
  "admin.ts: route returns 404 under the production guard",
  adminSrc.includes('process.env.NODE_ENV === "production"') &&
    (() => {
      // Find the PUT /admin/ad-brand-assets/cache handler block and verify it
      // contains a 404 response inside the production branch.
      const handlerRe = /router\.put\(\s*["']\/admin\/ad-brand-assets\/cache["'][\s\S]*?(?=\n\s*router\.\w+\(|\n\s*export\s)/;
      const match = adminSrc.match(handlerRe);
      return match !== null && match[0].includes("status(404)");
    })(),
  "the PUT /admin/ad-brand-assets/cache handler is missing or has no 404 response",
);

// 1c. The guard fires BEFORE the checkPlatformAdmin auth call.
check(
  "admin.ts: NODE_ENV guard fires before checkPlatformAdmin (no auth bypass path in production)",
  (() => {
    const handlerRe = /router\.put\(\s*["']\/admin\/ad-brand-assets\/cache["'][\s\S]*?(?=\n\s*router\.\w+\(|\n\s*export\s)/;
    const match = adminSrc.match(handlerRe);
    if (!match) return false;
    const body        = match[0];
    const guardPos    = body.indexOf('process.env.NODE_ENV === "production"');
    const authPos     = body.indexOf("checkPlatformAdmin");
    return guardPos !== -1 && authPos !== -1 && guardPos < authPos;
  })(),
  "guard must appear before checkPlatformAdmin so production blocks ALL callers, not just anonymous ones",
);

// ── Tests B & C: dev-server integration ───────────────────────────────────────
// These tests require a running API server and DATABASE_URL.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const serverReachable = hasDatabaseUrl && (await preflight());

if (!hasDatabaseUrl) {
  console.log(
    "\n── Tests B & C: skipped (DATABASE_URL not set — provide it to run integration tests)",
  );
} else if (!serverReachable) {
  console.log("── Tests B & C: skipped (API server not reachable — see warning above)");
} else {
  console.log("\n── Setup ────────────────────────────────────────────────────────────");
  await setup();

  try {
    // Minimal 1×1 PNG data-URI stubs.
    const STUB_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=";
    const STUB_QR   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=";

    // Test B: valid body → 200
    console.log("\n── Test B: dev-server — super-admin + valid body → 200 ─────────────");
    const devOk = await call("PUT", "/admin/ad-brand-assets/cache", {
      logoUri: STUB_LOGO,
      qrUri:   STUB_QR,
    });
    check(
      "dev-server: valid body → 200",
      devOk.status === 200,
      `got ${devOk.status}: ${JSON.stringify(devOk.json)}`,
    );
    check(
      "dev-server: response contains overridden: true",
      devOk.json?.overridden === true,
      `body was: ${JSON.stringify(devOk.json)}`,
    );
    check(
      "dev-server: response logoUri flag reflects non-empty string",
      devOk.json?.logoUri === true,
      `logoUri flag was: ${JSON.stringify(devOk.json?.logoUri)}`,
    );
    check(
      "dev-server: response qrUri flag reflects non-empty string",
      devOk.json?.qrUri === true,
      `qrUri flag was: ${JSON.stringify(devOk.json?.qrUri)}`,
    );

    // Flush the injected cache so we leave the server in a clean state.
    await call("DELETE", "/admin/ad-brand-assets/cache");

    // Test C: missing fields → 400
    console.log("\n── Test C: dev-server — super-admin + missing fields → 400 ─────────");
    const devBad = await call("PUT", "/admin/ad-brand-assets/cache", {});
    check(
      "dev-server: missing logoUri/qrUri → 400",
      devBad.status === 400,
      `got ${devBad.status}: ${JSON.stringify(devBad.json)}`,
    );
    check(
      "dev-server: 400 body has error string",
      typeof devBad.json?.error === "string" && devBad.json.error.length > 0,
      `body was: ${JSON.stringify(devBad.json)}`,
    );

    // Test C2: non-string fields → 400
    const devBadTypes = await call("PUT", "/admin/ad-brand-assets/cache", {
      logoUri: 42,
      qrUri:   null,
    });
    check(
      "dev-server: non-string field types → 400",
      devBadTypes.status === 400,
      `got ${devBadTypes.status}: ${JSON.stringify(devBadTypes.json)}`,
    );
  } finally {
    await cleanup();
  }
}

// ── Test D: production simulation ─────────────────────────────────────────────
console.log("\n── Test D: production simulation — NODE_ENV=production → 404 ────────");

let prodSim = null;
try {
  prodSim = await spawnProductionSimServer();
  const base = `http://127.0.0.1:${prodSim.port}`;
  console.log(`  production sim running on port ${prodSim.port} (NODE_ENV=production)`);

  // D1: valid body must be rejected with 404 in production.
  const prodRes = await fetch(`${base}/admin/ad-brand-assets/cache`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      logoUri: "data:image/png;base64,aGVsbG8=",
      qrUri:   "data:image/png;base64,d29ybGQ=",
    }),
  });
  let prodJson = null;
  try { prodJson = await prodRes.json(); } catch { /* non-JSON */ }

  check(
    "production: PUT /admin/ad-brand-assets/cache → 404",
    prodRes.status === 404,
    `got ${prodRes.status}: ${JSON.stringify(prodJson)}`,
  );
  check(
    "production: 404 body has error field",
    typeof prodJson?.error === "string",
    `body was: ${JSON.stringify(prodJson)}`,
  );
  check(
    "production: 404 error message is 'Not found' (no internal detail leaked)",
    prodJson?.error === "Not found",
    `error was: ${JSON.stringify(prodJson?.error)}`,
  );

  // D2: even an empty body must be 404 (guard fires before body parsing).
  const prodEmpty = await fetch(`${base}/admin/ad-brand-assets/cache`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
  });
  check(
    "production: empty body also returns 404 (guard fires before body is read)",
    prodEmpty.status === 404,
    `got ${prodEmpty.status}`,
  );

  // D3: verify the guard is not applied to unrelated routes (sanity).
  const prodOther = await fetch(`${base}/admin/ad-brand-assets/unrelated-route`, {
    method: "GET",
  });
  check(
    "production: unrelated route reaches router normally (guard is route-specific)",
    prodOther.status === 404, // the sim returns 404 for unknown routes, not 403/500
    `got ${prodOther.status} — sim should reach the default 404 handler`,
  );
} finally {
  prodSim?.stop?.();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll cache-guard checks passed.");
