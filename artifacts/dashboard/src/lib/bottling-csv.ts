// ─── Bottling CSV columns — single source of truth ────────────────────────────
// Mirrors the HARVEST_COLUMNS pattern in WineryManagementTabs.tsx: the export
// CSV columns, the import template headers, the template example row, the
// import field aliases, and the bulk-import payload mapping are ALL derived
// from this one list. Adding or renaming a field requires only one edit here,
// and exports use the exact import headers + re-import-safe value formats
// (ISO date, Yes/No), so an exported CSV can always be re-imported.

export interface BottlingColumn {
  /** CSV header used by both the export and the import template */
  header: string;
  /** snake_case field name from the API rows — also accepted as an import header alias */
  dbKey: string;
  /** camelCase key expected by the bulk-import endpoint */
  recordKey: string;
  /** Example value in the downloadable import template */
  example: string;
  /** Extra legacy import header aliases (e.g. old export labels) */
  aliases?: string[];
  /** Optional export formatter — must produce a value the import understands */
  exportValue?: (r: Record<string, unknown>) => string;
  /** Optional import parser — maps the raw CSV cell to the bulk-import value */
  parseImport?: (v: string) => string | undefined;
}

export const BOTTLING_COLUMNS: BottlingColumn[] = [
  {
    header: "Bottling Date", dbKey: "bottling_date", recordKey: "bottlingDate", example: "2024-09-15",
    // ISO YYYY-MM-DD so the export can be re-imported (not locale dd/mm/yyyy)
    exportValue: r => (r.bottling_date ? String(r.bottling_date).split("T")[0] : ""),
  },
  { header: "Vintage",            dbKey: "vintage_year",          recordKey: "vintageYear",        example: "2023" },
  { header: "Batch Ref",          dbKey: "batch_ref",             recordKey: "batchRef",           example: "BATCH-001" },
  { header: "Lot Code",           dbKey: "lot_code",              recordKey: "lotCode",            example: "LOT-2023-001" },
  { header: "Wine Colour",        dbKey: "wine_colour",           recordKey: "wineColour",         example: "White" },
  {
    header: "Organic (Yes/No)", dbKey: "is_organic", recordKey: "isOrganic", example: "No",
    aliases: ["Organic SO₂ Limits"], // legacy export label
    exportValue: r => (r.is_organic === true || r.is_organic === "true" ? "Yes" : "No"),
    parseImport: v => (v.toLowerCase() === "yes" ? "true" : "false"),
  },
  { header: "Volume Bottled (L)", dbKey: "volume_bottled_litres", recordKey: "volumeBottledLitres", example: "500" },
  { header: "Bottle Size (ml)",   dbKey: "bottle_size_ml",        recordKey: "bottleSizeMl",       example: "750" },
  { header: "Bottles",            dbKey: "bottles_produced",      recordKey: "bottlesProduced",    example: "666" },
  { header: "Cases",              dbKey: "cases_produced",        recordKey: "casesProduced",      example: "55" },
  { header: "Closure Type",       dbKey: "closure_type",          recordKey: "closureType",        example: "Screw cap (Stelvin)" },
  { header: "Free SO2 (mg/L)",    dbKey: "free_so2_mg_l",         recordKey: "freeSo2MgL",         example: "35",  aliases: ["Free SO₂ (mg/L)"] },
  { header: "Total SO2 (mg/L)",   dbKey: "total_so2_mg_l",        recordKey: "totalSo2MgL",        example: "120", aliases: ["Total SO₂ (mg/L)"] },
  { header: "Notes",              dbKey: "notes",                 recordKey: "notes",              example: "Example row — delete before importing" },
];

export const BOTTLING_IMPORT_HEADERS = BOTTLING_COLUMNS.map(c => c.header);

// Each canonical header also accepts its legacy labels and snake_case dbKey as import aliases
export const BOTTLING_FIELD_ALIASES: Record<string, string[]> = Object.fromEntries(
  BOTTLING_COLUMNS.map(c => [c.header, [c.header, ...(c.aliases ?? []), c.dbKey]]),
);

export const resolveBottlingField = (row: Record<string, string>, canonical: string): string => {
  for (const alias of BOTTLING_FIELD_ALIASES[canonical] ?? [canonical]) {
    if (row[alias] != null && row[alias] !== "") return row[alias];
  }
  return "";
};

// Map one parsed import row (header-keyed) to a bulk-import record payload.
export const bottlingImportRecord = (row: Record<string, string>): Record<string, string | undefined> => {
  const rec: Record<string, string | undefined> = {};
  for (const c of BOTTLING_COLUMNS) {
    const raw = resolveBottlingField(row, c.header);
    rec[c.recordKey] = c.parseImport ? c.parseImport(raw) : (raw || undefined);
  }
  return rec;
};

// ─── Full-file CSV parser ─────────────────────────────────────────────────────
// State machine that tokenizes the whole text so quoted fields may contain
// commas, escaped quotes ("") and embedded newlines — exports with multiline
// Notes round-trip cleanly through import. Same algorithm as the Harvest
// Reception importer.
export function parseCsvText(src: string): string[][] {
  const records: string[][] = [];
  let cells: string[] = [];
  let val = "";
  let inQuotes = false;
  let cellStarted = false;
  const endCell = () => { cells.push(val.trim()); val = ""; cellStarted = false; };
  const endRecord = () => {
    endCell();
    // Skip records that are entirely empty (blank lines)
    if (cells.length > 1 || cells[0] !== "") records.push(cells);
    cells = [];
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { val += '"'; i++; }
        else inQuotes = false;
      } else val += ch;
    } else if (ch === '"' && !cellStarted) {
      inQuotes = true; cellStarted = true;
    } else if (ch === ',') {
      endCell();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      endRecord();
    } else {
      val += ch; cellStarted = true;
    }
  }
  if (val !== "" || cells.length > 0) endRecord();
  return records;
}

// Parse a bottling CSV file's text into header-keyed rows, extracting any
// WARNING prefix records our own exports prepend. The real header row is the
// first record containing a recognised column header or alias; anything above
// it starting with "WARNING:" is surfaced as a warning, other prefix records
// (e.g. farm-name comment rows) are skipped.
export function parseBottlingCsv(text: string):
  | { ok: true; rows: Record<string, string>[]; warnings: string[] }
  | { ok: false; error: string; warnings: string[] } {
  const parsed = parseCsvText(text);
  const knownHeaders = new Set(BOTTLING_COLUMNS.flatMap(c => [c.header, ...(c.aliases ?? []), c.dbKey]));
  const headerIdx = parsed.findIndex(cells => cells.some(cell => knownHeaders.has(cell)));
  const warnings: string[] = [];
  for (const cells of parsed.slice(0, headerIdx === -1 ? 0 : headerIdx)) {
    const joined = cells.join(" — ").trim();
    if (/^WARNING:/i.test(joined)) warnings.push(joined);
  }
  const records = headerIdx === -1 ? [] : parsed.slice(headerIdx);
  if (headerIdx === -1 || records.length < 2) {
    return { ok: false, error: "CSV must have a header row and at least one data row.", warnings };
  }
  const headers = records[0];
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < records.length; i++) {
    const cells = records[i];
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
    rows.push(row);
  }
  if (rows.length > 500) return { ok: false, error: "Maximum 500 rows per import.", warnings };
  return { ok: true, rows, warnings };
}
