#!/usr/bin/env node
/**
 * check-financial-export-columns.mjs
 *
 * Verifies that the legacy POST /farms/:farmId/financial-exports and the
 * newer GET /farms/:farmId/financial-transactions/export produce identical
 * CSV column schemas and correctly populate the Enterprise and Agri-Env
 * Project columns.
 *
 * Tests:
 *   A. Headers match — both routes return the same 9-column header row.
 *   B. Non-null enterprise — the legacy POST includes the enterprise label
 *      in column 8 (index 7) for the uniquely-tagged test transaction.
 *   C. Null enterprise — the legacy POST still produces a 9-column row with
 *      empty strings in columns 8 and 9 for a transaction with no linked data.
 *   D. Linked Agri-Env project — both exports include the project's scheme name
 *      in column 9 for the uniquely-tagged linked transaction.
 *   E. Empty result — the legacy POST returns a valid header-only CSV for a
 *      date range with no matching transactions.
 *
 * Rows are identified by a unique token embedded in the description field so
 * that demo-farm data already in the DB cannot cause false passes.
 *
 * Usage:  node scripts/check-financial-export-columns.mjs
 * Env:    API_BASE (default http://localhost:80/api)
 *         TENANT_SLUG (default oakfield-farms), FARM_ID (default 1)
 *         DEV_BYPASS_TOKEN (default bde-dev-bypass-local)
 */

const API_BASE     = process.env.API_BASE           ?? "http://localhost:80/api";
const FARM_ID      = process.env.FARM_ID            ?? "1";
const TENANT_SLUG  = process.env.TENANT_SLUG        ?? "oakfield-farms";
const BYPASS_TOKEN = process.env.DEV_BYPASS_TOKEN   ?? "bde-dev-bypass-local";

const HEADERS = {
  "x-dev-bypass":  BYPASS_TOKEN,
  "x-tenant-slug": TENANT_SLUG,
  "Content-Type":  "application/json",
};

let failures = 0;
const created = []; // transaction IDs cleaned up at the end
const createdProjects = []; // Agri-Env project IDs cleaned up after transactions

function check(label, ok, detail) {
  if (ok) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function callJson(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

async function callRaw(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text, contentType: res.headers.get("content-type") ?? "" };
}

// ─── CSV parser ───────────────────────────────────────────────────────────────
// RFC-4180-aware: handles double-quoted fields with embedded commas/quotes.
function parseCsvRow(line) {
  const fields = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; }
        else { inQuote = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { fields.push(field); field = ""; }
      else { field += ch; }
    }
  }
  fields.push(field);
  return fields;
}

// ─── Preflight ────────────────────────────────────────────────────────────────
async function preflight() {
  const attempts = 5;
  let last = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${API_BASE}/farms/${FARM_ID}`, { headers: HEADERS });
      if (res.status !== 502 && res.status !== 503 && res.status !== 504) return;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err?.cause?.code ?? err?.message ?? String(err);
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(
    `\nAPI server unreachable at ${API_BASE} (${last}).\n` +
    `Start the "artifacts/api-server: API Server" workflow, then re-run this check.\n` +
    `No financial-export column checks were executed.`,
  );
  process.exit(2);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Create a financial transaction; track its ID for cleanup.
async function createTx(token, txDate, enterprise) {
  const body = {
    transactionDate: txDate,
    transactionType: "income",
    category:        "general",
    description:     `Export-col-check ${token}`,
    amountPence:     12345,
    ...(enterprise !== null ? { enterprise } : {}),
  };
  const r = await callJson("POST", `/farms/${FARM_ID}/financial-transactions`, body);
  if (r.status !== 201 || !r.json?.record?.id) {
    throw new Error(`Failed to create test transaction: ${r.status} ${JSON.stringify(r.json)}`);
  }
  created.push(r.json.record.id);
  return r.json.record;
}

// Create a farm-owned Agri-Env project; track it for cleanup after transactions.
async function createAgriEnvProject(schemeName) {
  const r = await callJson("POST", `/farms/${FARM_ID}/agri-env-projects`, {
    schemeName,
    status: "active",
  });
  if (r.status !== 201 || !r.json?.project?.id) {
    throw new Error(`Failed to create test Agri-Env project: ${r.status} ${JSON.stringify(r.json)}`);
  }
  createdProjects.push(r.json.project.id);
  return r.json.project;
}

async function linkTxToAgriEnvProject(transactionId, projectId) {
  let response = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    response = await callJson(
      "PATCH",
      `/farms/${FARM_ID}/financial-transactions/${transactionId}/link-agri-env`,
      { agriEnvProjectId: projectId },
    );
    if (response.status === 200 && response.json?.record?.agriEnvProjectId === projectId) return;
    if (response.status !== 404) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Failed to link test transaction to Agri-Env project: ${response?.status} ${JSON.stringify(response?.json)}`);
}

// Find all CSV data rows (excluding header) whose Description column contains
// the unique token.  Description is column index 3.
function findTestRows(csvText, token) {
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);
  const dataLines = lines.slice(1); // skip header
  return dataLines.map(parseCsvRow).filter((cols) => (cols[3] ?? "").includes(token));
}

// Call the legacy POST export and return parsed lines.
async function legacyPostExport(dateRangeStart, dateRangeEnd) {
  return callRaw("POST", `/farms/${FARM_ID}/financial-exports`, {
    format: "xero",
    dateRangeStart,
    dateRangeEnd,
  });
}

// Call the newer GET export and return parsed lines.
async function getExport(startDate, endDate) {
  const qs = `startDate=${startDate}&endDate=${endDate}`;
  return callRaw("GET", `/farms/${FARM_ID}/financial-transactions/export?${qs}`);
}

// Farm-scoped request transactions commit from the response "finish" event,
// so a successful create response can arrive just before the row is visible to
// the next request. Poll the exact export under test instead of relying on a
// fixed delay that becomes flaky under load.
async function waitForExportRows(loadExport, tokens) {
  let response = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    response = await loadExport();
    const allVisible = response.status === 200
      && tokens.every((token) => findTestRows(response.text, token).length === 1);
    if (allVisible) return response;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return response;
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
async function cleanup() {
  for (const id of created) {
    await callJson("DELETE", `/farms/${FARM_ID}/financial-transactions/${id}`);
  }
  for (const id of createdProjects) {
    await callJson("DELETE", `/farms/${FARM_ID}/agri-env-projects/${id}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
await preflight();

// Unique token per run so no demo-farm data can shadow our test rows.
const TOKEN = `COLCHK-${Date.now()}`;
const TX_DATE    = "2020-06-15";
const RANGE_START = "2020-06-01";
const RANGE_END   = "2020-06-30";
// Year 0001 is outside the range of dates accepted by the application, so
// this range cannot overlap with a real financial transaction.
const EMPTY_RANGE_START = "0001-01-01";
const EMPTY_RANGE_END   = "0001-01-31";
const ENTERPRISE_LABEL = "Arable";
const AGRI_ENV_SCHEME_NAME = `Export-column check scheme ${TOKEN}`;

const EXPECTED_HEADERS = [
  "*Date", "*Amount", "*AccountCode", "Description",
  "Reference", "TaxType", "TaxAmount", "Enterprise", "Agri-Env Project",
];
const EXPECTED_COL_COUNT = EXPECTED_HEADERS.length; // 9

try {
  // Create the project before the linked transaction so the link endpoint can
  // verify that the project belongs to this farm.
  const agriEnvProject = await createAgriEnvProject(AGRI_ENV_SCHEME_NAME);

  // Create all test transactions up front.
  await createTx(`${TOKEN}-ENT`, TX_DATE, ENTERPRISE_LABEL);   // enterprise set
  await createTx(`${TOKEN}-NOENT`, TX_DATE, null);              // enterprise null
  const linkedTx = await createTx(`${TOKEN}-AGRI`, TX_DATE, null);
  await linkTxToAgriEnvProject(linkedTx.id, agriEnvProject.id);

  const expectedTokens = [
    `${TOKEN}-ENT`,
    `${TOKEN}-NOENT`,
    `${TOKEN}-AGRI`,
  ];

  // Poll both exports because the create and link transactions commit after
  // their responses finish, so either export can briefly see stale rows.
  const [postResp, getResp] = await Promise.all([
    waitForExportRows(
      () => legacyPostExport(RANGE_START, RANGE_END),
      expectedTokens,
    ),
    waitForExportRows(
      () => getExport(RANGE_START, RANGE_END),
      expectedTokens,
    ),
  ]);

  // ── Test A: header parity between both routes ─────────────────────────────
  console.log("\n── Test A: header schema parity (POST vs GET) ───────────────────────");

  check(
    "POST response is text/csv",
    postResp.contentType.startsWith("text/csv"),
    `got "${postResp.contentType}"`,
  );
  check(
    "GET response is text/csv",
    getResp.contentType.startsWith("text/csv"),
    `got "${getResp.contentType}"`,
  );

  const postLines = postResp.text.split("\n").filter((l) => l.trim().length > 0);
  const getLines  = getResp.text.split("\n").filter((l) => l.trim().length > 0);

  const postHeaders = parseCsvRow(postLines[0] ?? "");
  const getHeaders  = parseCsvRow(getLines[0]  ?? "");

  check(
    `POST header has ${EXPECTED_COL_COUNT} columns`,
    postHeaders.length === EXPECTED_COL_COUNT,
    `got ${postHeaders.length}: ${JSON.stringify(postHeaders)}`,
  );
  check(
    `GET header has ${EXPECTED_COL_COUNT} columns`,
    getHeaders.length === EXPECTED_COL_COUNT,
    `got ${getHeaders.length}: ${JSON.stringify(getHeaders)}`,
  );
  check(
    "POST and GET headers are identical",
    JSON.stringify(postHeaders) === JSON.stringify(getHeaders),
    `POST: ${JSON.stringify(postHeaders)}\nGET:  ${JSON.stringify(getHeaders)}`,
  );
  check(
    "column 8 header is 'Enterprise'",
    postHeaders[7] === "Enterprise",
    `got "${postHeaders[7]}"`,
  );
  check(
    "column 9 header is 'Agri-Env Project'",
    postHeaders[8] === "Agri-Env Project",
    `got "${postHeaders[8]}"`,
  );

  // ── Test B: non-null enterprise row ──────────────────────────────────────
  console.log("\n── Test B: non-null enterprise — correct value in column 8 ─────────");

  const entRows = findTestRows(postResp.text, `${TOKEN}-ENT`);
  check(
    "exactly one legacy-POST row matches the enterprise test token",
    entRows.length === 1,
    `found ${entRows.length} row(s) matching "${TOKEN}-ENT"`,
  );
  if (entRows.length > 0) {
    const row = entRows[0];
    check(
      `enterprise row has ${EXPECTED_COL_COUNT} columns`,
      row.length === EXPECTED_COL_COUNT,
      `got ${row.length}: ${JSON.stringify(row)}`,
    );
    check(
      `column 8 (index 7) contains "${ENTERPRISE_LABEL}"`,
      row[7] === ENTERPRISE_LABEL,
      `got "${row[7]}"`,
    );
  }

  // ── Test C: null enterprise row ───────────────────────────────────────────
  console.log("\n── Test C: null enterprise — 9 columns, empty string in column 8 ──");

  const noEntRows = findTestRows(postResp.text, `${TOKEN}-NOENT`);
  check(
    "exactly one legacy-POST row matches the null-enterprise test token",
    noEntRows.length === 1,
    `found ${noEntRows.length} row(s) matching "${TOKEN}-NOENT"`,
  );
  if (noEntRows.length > 0) {
    const row = noEntRows[0];
    check(
      `null-enterprise row has ${EXPECTED_COL_COUNT} columns`,
      row.length === EXPECTED_COL_COUNT,
      `got ${row.length}: ${JSON.stringify(row)}`,
    );
    check(
      "column 8 (index 7) is an empty string for null enterprise",
      row[7] === "",
      `got "${row[7]}"`,
    );
    check(
      "column 9 (index 8) is an empty string for an unlinked transaction",
      row[8] === "",
      `got "${row[8]}"`,
    );
  }

  // ── Test D: linked Agri-Env project appears in column 9 ──────────────────
  console.log("\n── Test D: linked Agri-Env project — scheme name in column 9 ───────");

  for (const [exportLabel, csvText] of [
    ["legacy POST", postResp.text],
    ["newer GET", getResp.text],
  ]) {
    const agriRows = findTestRows(csvText, `${TOKEN}-AGRI`);
    check(
      `exactly one ${exportLabel} row matches the Agri-Env-linked test token`,
      agriRows.length === 1,
      `found ${agriRows.length} row(s) matching "${TOKEN}-AGRI"`,
    );
    if (agriRows.length > 0) {
      const row = agriRows[0];
      check(
        `${exportLabel} Agri-Env-linked row has ${EXPECTED_COL_COUNT} columns`,
        row.length === EXPECTED_COL_COUNT,
        `got ${row.length}: ${JSON.stringify(row)}`,
      );
      check(
        `${exportLabel} column 9 (index 8) contains "${AGRI_ENV_SCHEME_NAME}"`,
        row[8] === AGRI_ENV_SCHEME_NAME,
        `got "${row[8]}"`,
      );
    }
  }

  // ── Test E: empty result still returns a valid header-only CSV ────────────
  console.log("\n── Test E: no matching transactions — header-only CSV ────────────────");

  const emptyPostResp = await legacyPostExport(EMPTY_RANGE_START, EMPTY_RANGE_END);
  check(
    "empty-range POST responds with HTTP 200",
    emptyPostResp.status === 200,
    `got HTTP ${emptyPostResp.status}`,
  );
  check(
    "empty-range POST response is text/csv",
    emptyPostResp.contentType.startsWith("text/csv"),
    `got "${emptyPostResp.contentType}"`,
  );

  const emptyLines = emptyPostResp.text.split("\n").filter((line) => line.trim().length > 0);
  check(
    "empty-range POST contains only the header row",
    emptyLines.length === 1,
    `found ${emptyLines.length} non-empty line(s)`,
  );

  const emptyHeaders = parseCsvRow(emptyLines[0] ?? "");
  check(
    `empty-range header has ${EXPECTED_COL_COUNT} columns`,
    emptyHeaders.length === EXPECTED_COL_COUNT,
    `got ${emptyHeaders.length}: ${JSON.stringify(emptyHeaders)}`,
  );
  check(
    "empty-range header matches the expected export schema",
    JSON.stringify(emptyHeaders) === JSON.stringify(EXPECTED_HEADERS),
    `got ${JSON.stringify(emptyHeaders)}`,
  );

} finally {
  await cleanup();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll financial-export column checks passed.");
