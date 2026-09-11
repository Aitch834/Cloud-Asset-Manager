#!/usr/bin/env node
/*
 * Post-Publish smoke check for the public Register Interest flow and the
 * protected admin lead/traffic responses.
 *
 * This is deliberately opt-in because it creates one clearly labelled lead.
 *
 * Usage:
 *   SMOKE_WRITE=1 node scripts/check-production-register-interest-traffic.mjs
 *   SMOKE_WRITE=1 node scripts/check-production-register-interest-traffic.mjs --skip-admin
 *
 * Defaults:
 *   PUBLIC_BASE_URL=https://bdefarmtrac.co.uk
 *   API_BASE_URL=$PUBLIC_BASE_URL
 *
 * Authenticated admin verification:
 *   ADMIN_PORTAL_SECRET    x-admin-secret value, or
 *   ADMIN_AUTH_TOKEN       Clerk bearer token with BDE Super Admin access
 *
 * The admin credential is read from the environment only and is never printed.
 */

const args = new Set(process.argv.slice(2));
const publicBaseUrl = stripTrailingSlash(process.env.PUBLIC_BASE_URL ?? "https://bdefarmtrac.co.uk");
const apiBaseUrl = stripTrailingSlash(process.env.API_BASE_URL ?? publicBaseUrl);
const adminSecret = process.env.ADMIN_PORTAL_SECRET;
const adminAuthToken = process.env.ADMIN_AUTH_TOKEN;
const skipAdmin = args.has("--skip-admin");
const writeEnabled = process.env.SMOKE_WRITE === "1" || args.has("--write");

let failures = 0;

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function check(label, ok, detail = "") {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // The caller can still assert the status for non-JSON responses.
  }
  return { status: response.status, text, json };
}

function adminHeaders() {
  if (adminSecret) return { "x-admin-secret": adminSecret };
  if (adminAuthToken) return { Authorization: `Bearer ${adminAuthToken}` };
  return {};
}

function detailFor(response) {
  // Do not echo response bodies: they may contain lead data or auth details.
  return `HTTP ${response.status}`;
}

function scriptSources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter((source) => source.startsWith("/") || source.startsWith(publicBaseUrl));
}

if (!writeEnabled) {
  console.error(
    "Refusing to run: this check creates one synthetic production lead. " +
      "Re-run with SMOKE_WRITE=1 (or --write) after confirming the target URL.",
  );
  process.exit(2);
}

console.log(`\nProduction Register Interest / traffic smoke check`);
console.log(`  Website: ${publicBaseUrl}`);
console.log(`  API:     ${apiBaseUrl}`);

const health = await request(apiBaseUrl, "/api/healthz");
check("API health endpoint responds 200", health.status === 200 && health.json?.status === "ok", detailFor(health));

const page = await request(publicBaseUrl, "/register-interest");
check(
  "Register Interest page shell responds 200",
  page.status === 200 && page.text.includes('id="root"'),
  detailFor(page),
);

const deployedScripts = scriptSources(page.text);
const deployedScriptBodies = await Promise.all(
  deployedScripts.map((source) =>
    request(publicBaseUrl, source.startsWith(publicBaseUrl) ? source.slice(publicBaseUrl.length) : source),
  ),
);
check(
  "Deployed website bundle contains the Register Interest route",
  deployedScripts.length > 0 &&
    deployedScriptBodies.some(
      (script) =>
        script.status === 200 &&
        script.text.includes("/register-interest") &&
        script.text.includes("/api/register-interest"),
    ),
  deployedScripts.length > 0 ? "route markers not found" : "no deployed scripts found",
);

const stamp = `${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}-${crypto.randomUUID().slice(0, 8)}`;
const email = `production-smoke-${stamp}@example.invalid`;
const lead = await request(publicBaseUrl, "/api/register-interest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Production",
    lastName: "SmokeTest",
    email,
    farmName: `Post-Publish Smoke Test ${stamp}`,
    holdingNumber: "SMOKE-2033",
    county: "Test County",
    farmType: "Other",
    numberOfHoldings: "1",
    modules: ["field-crop-management"],
    heardVia: "Post-Publish smoke test",
    message: "Automated production smoke test — do not contact.",
    sector: "Arable",
  }),
});
check("Register Interest submission returns 201", lead.status === 201 && Number.isInteger(lead.json?.id), detailFor(lead));
if (lead.status === 201) console.log(`  Created lead id: ${lead.json.id}`);

const visit = await request(publicBaseUrl, "/api/analytics/visit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ path: "/register-interest", referrer: publicBaseUrl }),
});
check("Analytics visit submission returns 204", visit.status === 204, detailFor(visit));

if (skipAdmin) {
  console.log("  SKIP  Admin lead-pipeline and traffic-stat checks (--skip-admin)");
} else if (!adminSecret && !adminAuthToken) {
  console.error(
    "  FAIL  Admin checks cannot run: set ADMIN_PORTAL_SECRET or ADMIN_AUTH_TOKEN, " +
      "or pass --skip-admin explicitly.",
  );
  failures += 1;
} else {
  const headers = adminHeaders();
  const adminLeads = await request(apiBaseUrl, "/api/admin/leads", { headers });
  const leadRows = Array.isArray(adminLeads.json?.leads) ? adminLeads.json.leads : [];
  check(
    "Lead appears in the admin pipeline response",
    adminLeads.status === 200 && leadRows.some((row) => row.email === email && row.status === "new"),
    detailFor(adminLeads),
  );

  const stats = await request(apiBaseUrl, "/api/admin/stats", { headers });
  const websiteVisits = stats.json?.stats?.websiteVisits;
  check(
    "Admin traffic stats response is successful",
    stats.status === 200 && websiteVisits && Number.isFinite(Number(websiteVisits.total)),
    detailFor(stats),
  );
  check(
    "Admin traffic stats contain real data",
    stats.status === 200 && Number(websiteVisits?.total) > 0,
    detailFor(stats),
  );
}

console.log(`\n${failures === 0 ? "Smoke check passed." : `Smoke check failed with ${failures} failure(s).`}\n`);
process.exit(failures === 0 ? 0 : 1);