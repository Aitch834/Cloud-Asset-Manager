#!/usr/bin/env node
/**
 * check-financial-export-columns.mjs
 *
 * Verifies that the legacy POST /farms/:farmId/financial-exports and the
 * newer GET /farms/:farmId/financial-transactions/export produce identical
 * CSV column schemas and correctly populate the Enterprise column.
 *
 * Tests:
 *   A. Headers match — both routes return the same 9-column header row.
 *   B. Non-null enterprise — the legacy POST includes the enterprise label
 *      in column 8 (index 7) for the uniquely-tagged test transaction.
 *   C. Null enterprise — the legacy POST still produces a 9-column row with
 *      an empty string in column 8 for a transaction with no enterprise tag.
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
async function waitForLegacyRows(dateRangeStart, dateRangeEnd, tokens) {
  let response = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    response = await legacyPostExport(dateRangeStart, dateRangeEnd);
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
}

// ─── Main ─────────────────────────────────────────────────────────────────────
await preflight();

// Unique token per run so no demo-farm data can shadow our test rows.
const TOKEN = `COLCHK-${Date.now()}`;
const TX_DATE    = "2020-06-15";
const RANGE_START = "2020-06-01";
const RANGE_END   = "2020-06-30";
const ENTERPRISE_LABEL = "Arable";

const EXPECTED_HEADERS = [
  "*Date", "*Amount", "*AccountCode", "Description",
  "Reference", "TaxType", "TaxAmount", "Enterprise", "Agri-Env Project",
];
const EXPECTED_COL_COUNT = EXPECTED_HEADERS.length; // 9

try {
  // Create both test transactions up front.
  await createTx(`${TOKEN}-ENT`, TX_DATE, ENTERPRISE_LABEL);   // enterprise set
  await createTx(`${TOKEN}-NOENT`, TX_DATE, null);              // enterprise null

  // Fetch both exports over the same date range.
  const [postResp, getResp] = await Promise.all([
    waitForLegacyRows(RANGE_START, RANGE_END, [`${TOKEN}-ENT`, `${TOKEN}-NOENT`]),
    getExport(RANGE_START, RANGE_END),
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
  }

} finally {
  await cleanup();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll financial-export column checks passed.");
