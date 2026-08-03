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

// Preflight: make sure the API server is actually up before running checks.
// If the api-server workflow is asleep, every request comes back as a 502
// from the proxy (or a connection error) — that is NOT a duplicate-handling
// regression, so detect it up front and fail with an explicit message.
async function preflight() {
  const attempts = 5;
  let last = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}/farms/${FARM_ID}`, { headers: HEADERS });
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) return; // server answered
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err?.cause?.code ?? err?.message ?? String(err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(
    `\nAPI server unreachable at ${API_BASE} (${last}).\n` +
      `The api-server workflow does not appear to be running — start the ` +
      `"artifacts/api-server: API Server" workflow, then re-run this check.\n` +
      `No duplicate-ref checks were executed; this is NOT a duplicate-handling failure.`,
  );
  process.exit(2);
}

async function testRoute(name, route, makeBody, expectedCode = "DUPLICATE_BATCH_REF") {
  console.log(`\n${name} (POST ${route})`);
  const ref = `DUPCHK-${name.toUpperCase().slice(0, 5)}-${Date.now()}`;

  // 1. First insert succeeds
  const first = await call("POST", route, makeBody(ref));
  check("first insert returns 201", first.status === 201, `got ${first.status}: ${JSON.stringify(first.json)}`);
  const firstId = first.json?.record?.id;
  if (firstId) created.push({ route, id: firstId });

  // 2. Duplicate insert is rejected with 409 + the expected code
  const dup = await call("POST", route, makeBody(ref));
  check("duplicate insert returns 409", dup.status === 409, `got ${dup.status}: ${JSON.stringify(dup.json)}`);
  check(`duplicate insert returns code "${expectedCode}"`, dup.json?.code === expectedCode, `got code ${JSON.stringify(dup.json?.code)}`);
  if (dup.status === 201 && dup.json?.record?.id) created.push({ route, id: dup.json.record.id });

  // 3. PUT that renames another record onto this ref is also rejected
  const other = await call("POST", route, makeBody(`${ref}-B`));
  const otherId = other.json?.record?.id;
  if (otherId) {
    created.push({ route, id: otherId });
    // farmRlsMiddleware commits each request's transaction in res.on("finish"),
    // i.e. *after* the response is sent — so a PUT fired immediately after the
    // setup POST can race the commit and see 0 rows (200 + empty body). That is
    // a timing artefact, not a duplicate-check regression: a real regression
    // returns 200 WITH the updated record. Retry only the 0-row case briefly.
    let put = await call("PUT", `${route}/${otherId}`, makeBody(ref));
    for (let i = 0; i < 10 && put.status === 200 && !put.json?.record; i++) {
      await new Promise((r) => setTimeout(r, 150));
      put = await call("PUT", `${route}/${otherId}`, makeBody(ref));
    }
    check("PUT onto an existing ref returns 409", put.status === 409, `got ${put.status}: ${JSON.stringify(put.json)}`);
    check(`PUT returns code "${expectedCode}"`, put.json?.code === expectedCode, `got code ${JSON.stringify(put.json?.code)}`);
  } else {
    check("setup record for PUT check created", false, `got ${other.status}`);
  }

  // 4. Race: two truly simultaneous POSTs with the same ref. The pre-check
  // SELECT can't catch this — both requests pass it before either inserts —
  // so it exercises the DB unique index + err.cause.code → friendly 409 path.
  const raceRef = `${ref}-RACE`;
  const [a, b] = await Promise.all([
    call("POST", route, makeBody(raceRef)),
    call("POST", route, makeBody(raceRef)),
  ]);
  for (const r of [a, b]) {
    if (r.status === 201 && r.json?.record?.id) created.push({ route, id: r.json.record.id });
  }
  const statuses = [a.status, b.status].sort((x, y) => x - y);
  check(
    "race: exactly one 201 and one 409",
    statuses[0] === 201 && statuses[1] === 409,
    `got ${a.status} & ${b.status}: ${JSON.stringify(a.json)} / ${JSON.stringify(b.json)}`,
  );
  const loser = a.status === 409 ? a : b;
  check(
    `race: 409 carries code "${expectedCode}"`,
    loser.status === 409 && loser.json?.code === expectedCode,
    `got code ${JSON.stringify(loser.json?.code)}`,
  );
}

await preflight();

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

// Bottling uses lot_code (not batch_ref) as its per-farm unique key
await testRoute("bottling", `${base}/winery-bottling`, (ref) => ({
  lotCode: ref,
  bottlingDate: "2026-08-01",
  vintageYear: 2026,
}), "DUPLICATE_LOT_CODE");

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
