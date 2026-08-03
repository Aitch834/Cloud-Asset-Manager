const BOTTLING_COLUMNS = [
  {
    header: "Bottling Date",
    dbKey: "bottling_date",
    recordKey: "bottlingDate",
    example: "2024-09-15",
    // ISO YYYY-MM-DD so the export can be re-imported (not locale dd/mm/yyyy)
    exportValue: (r) => r.bottling_date ? String(r.bottling_date).split("T")[0] : ""
  },
  { header: "Vintage", dbKey: "vintage_year", recordKey: "vintageYear", example: "2023" },
  { header: "Batch Ref", dbKey: "batch_ref", recordKey: "batchRef", example: "BATCH-001" },
  { header: "Lot Code", dbKey: "lot_code", recordKey: "lotCode", example: "LOT-2023-001" },
  { header: "Wine Colour", dbKey: "wine_colour", recordKey: "wineColour", example: "White" },
  {
    header: "Organic (Yes/No)",
    dbKey: "is_organic",
    recordKey: "isOrganic",
    example: "No",
    aliases: ["Organic SO₂ Limits"],
    // legacy export label
    exportValue: (r) => r.is_organic === true || r.is_organic === "true" ? "Yes" : "No",
    parseImport: (v) => v.toLowerCase() === "yes" ? "true" : "false"
  },
  { header: "Volume Bottled (L)", dbKey: "volume_bottled_litres", recordKey: "volumeBottledLitres", example: "500" },
  { header: "Bottle Size (ml)", dbKey: "bottle_size_ml", recordKey: "bottleSizeMl", example: "750" },
  { header: "Bottles", dbKey: "bottles_produced", recordKey: "bottlesProduced", example: "666" },
  { header: "Cases", dbKey: "cases_produced", recordKey: "casesProduced", example: "55" },
  { header: "Closure Type", dbKey: "closure_type", recordKey: "closureType", example: "Screw cap (Stelvin)" },
  { header: "Free SO2 (mg/L)", dbKey: "free_so2_mg_l", recordKey: "freeSo2MgL", example: "35", aliases: ["Free SO₂ (mg/L)"] },
  { header: "Total SO2 (mg/L)", dbKey: "total_so2_mg_l", recordKey: "totalSo2MgL", example: "120", aliases: ["Total SO₂ (mg/L)"] },
  { header: "Notes", dbKey: "notes", recordKey: "notes", example: "Example row — delete before importing" }
];
const BOTTLING_IMPORT_HEADERS = BOTTLING_COLUMNS.map((c) => c.header);
const BOTTLING_FIELD_ALIASES = Object.fromEntries(
  BOTTLING_COLUMNS.map((c) => [c.header, [c.header, ...c.aliases ?? [], c.dbKey]])
);
const resolveBottlingField = (row, canonical) => {
  for (const alias of BOTTLING_FIELD_ALIASES[canonical] ?? [canonical]) {
    if (row[alias] != null && row[alias] !== "") return row[alias];
  }
  return "";
};
const bottlingImportRecord = (row) => {
  const rec = {};
  for (const c of BOTTLING_COLUMNS) {
    const raw = resolveBottlingField(row, c.header);
    rec[c.recordKey] = c.parseImport ? c.parseImport(raw) : raw || void 0;
  }
  return rec;
};
function parseCsvText(src) {
  const records = [];
  let cells = [];
  let val = "";
  let inQuotes = false;
  let cellStarted = false;
  const endCell = () => {
    cells.push(val.trim());
    val = "";
    cellStarted = false;
  };
  const endRecord = () => {
    endCell();
    if (cells.length > 1 || cells[0] !== "") records.push(cells);
    cells = [];
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          val += '"';
          i++;
        } else inQuotes = false;
      } else val += ch;
    } else if (ch === '"' && !cellStarted) {
      inQuotes = true;
      cellStarted = true;
    } else if (ch === ",") {
      endCell();
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      endRecord();
    } else {
      val += ch;
      cellStarted = true;
    }
  }
  if (val !== "" || cells.length > 0) endRecord();
  return records;
}
function parseBottlingCsv(text) {
  const parsed = parseCsvText(text);
  const knownHeaders = new Set(BOTTLING_COLUMNS.flatMap((c) => [c.header, ...c.aliases ?? [], c.dbKey]));
  const headerIdx = parsed.findIndex((cells) => cells.some((cell) => knownHeaders.has(cell)));
  const warnings = [];
  for (const cells of parsed.slice(0, headerIdx === -1 ? 0 : headerIdx)) {
    const joined = cells.join(" — ").trim();
    if (/^WARNING:/i.test(joined)) warnings.push(joined);
  }
  const records = headerIdx === -1 ? [] : parsed.slice(headerIdx);
  if (headerIdx === -1 || records.length < 2) {
    return { ok: false, error: "CSV must have a header row and at least one data row.", warnings };
  }
  const headers = records[0];
  const unknownHeaders = headers.filter((h) => h.trim() !== "" && !knownHeaders.has(h));
  const rows = [];
  for (let i = 1; i < records.length; i++) {
    const cells = records[i];
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    rows.push(row);
  }
  if (rows.length > 500) return { ok: false, error: "Maximum 500 rows per import.", warnings };
  return { ok: true, rows, warnings, unknownHeaders };
}
export {
  BOTTLING_COLUMNS as B,
  BOTTLING_IMPORT_HEADERS as a,
  parseBottlingCsv as b,
  bottlingImportRecord as c,
  parseCsvText as p,
  resolveBottlingField as r
};
