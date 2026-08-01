#!/usr/bin/env node
// Integration check: duplicate batch references must be cleanly rejected (409 +
// code DUPLICATE_BATCH_REF) on the winery pressing and fermentation routes.
//
// Runs against the local dev API server via the dev-bypass auth headers.
// Usage:  node scripts/check-duplicate-batch-ref.mjs
// Env:    API_BASE (default http://localhost:80/api)
//         TENANT_SLUG (default oakfield-farms), FARM_ID (default 1)
//         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)

const API_BASE = process.env.API_BASE ?? "http://localhost:80/api";
const FARM_ID = process.env.FARM_ID ?? "1";
const HEADERS = {
  "x-dev-bypass": process.env.DEV_BYPASS_TOKEN ?? "bde-dev-bypass-local",
  "x-tenant-slug": process.env.TENANT_SLUG ?? "oakfield-farms",
  "Content-Type": "application/json",
};

let failures = 0;
const created = []; // { route, id } — cleaned up at the end

function check(label, ok, detail) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function call(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json };
}

async function testRoute(name, route, makeBody) {
  console.log(`\n${name} (POST ${route})`);
  const ref = `DUPCHK-${name.toUpperCase().slice(0, 5)}-${Date.now()}`;

  // 1. First insert succeeds
  const first = await call("POST", route, makeBody(ref));
  check("first insert returns 201", first.status === 201, `got ${first.status}: ${JSON.stringify(first.json)}`);
  const firstId = first.json?.record?.id;
  if (firstId) created.push({ route, id: firstId });

  // 2. Duplicate insert is rejected with 409 + DUPLICATE_BATCH_REF
  const dup = await call("POST", route, makeBody(ref));
  check("duplicate insert returns 409", dup.status === 409, `got ${dup.status}: ${JSON.stringify(dup.json)}`);
  check('duplicate insert returns code "DUPLICATE_BATCH_REF"', dup.json?.code === "DUPLICATE_BATCH_REF", `got code ${JSON.stringify(dup.json?.code)}`);
  if (dup.status === 201 && dup.json?.record?.id) created.push({ route, id: dup.json.record.id });

  // 3. PUT that renames another record onto this ref is also rejected
  const other = await call("POST", route, makeBody(`${ref}-B`));
  const otherId = other.json?.record?.id;
  if (otherId) {
    created.push({ route, id: otherId });
    const put = await call("PUT", `${route}/${otherId}`, makeBody(ref));
    check("PUT onto an existing ref returns 409", put.status === 409, `got ${put.status}: ${JSON.stringify(put.json)}`);
    check('PUT returns code "DUPLICATE_BATCH_REF"', put.json?.code === "DUPLICATE_BATCH_REF", `got code ${JSON.stringify(put.json?.code)}`);
  } else {
    check("setup record for PUT check created", false, `got ${other.status}`);
  }
}

const base = `/farms/${FARM_ID}`;

await testRoute("pressing", `${base}/winery-pressing`, (ref) => ({
  batchRef: ref,
  pressDate: "2026-08-01",
  vintageYear: 2026,
}));

await testRoute("fermentation", `${base}/winery-fermentation`, (ref) => ({
  batchRef: ref,
  vintageYear: 2026,
  wineColour: "red",
}));

await testRoute("cellar-ops", `${base}/winery-cellar-ops`, (ref) => ({
  batchRef: ref,
  vintageYear: 2026,
  opDate: "2026-08-01",
  opType: "racking",
}));

// Cleanup — remove every record this check created
console.log("\nCleanup");
for (const { route, id } of created) {
  const del = await call("DELETE", `${route}/${id}`);
  if (del.status >= 400) console.warn(`  warn: DELETE ${route}/${id} returned ${del.status}`);
}
console.log(`  removed ${created.length} test record(s)`);

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll duplicate-batch-ref checks passed.");
