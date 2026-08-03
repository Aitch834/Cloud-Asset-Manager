import { describe, it, expect } from "vitest";
import {
  BOTTLING_COLUMNS,
  BOTTLING_IMPORT_HEADERS,
  bottlingImportRecord,
  parseBottlingCsv,
  parseCsvText,
} from "./bottling-csv";

// Build a CSV string the same way exportCSV in WineryManagementTabs.tsx does
function buildExportCsv(rows: Record<string, unknown>[], prefixLines?: string[]): string {
  const cols = BOTTLING_COLUMNS.map(c => ({ key: c.dbKey, fmt: c.exportValue, label: c.header }));
  const header = cols.map(c => `"${c.label}"`).join(",");
  const body = rows.map(r => cols.map(c => {
    const v = c.fmt ? c.fmt(r) : (r[c.key] ?? "");
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const prefix = prefixLines && prefixLines.length > 0 ? prefixLines.join("\n") + "\n" : "";
  return prefix + header + "\n" + body;
}

const sampleDbRow: Record<string, unknown> = {
  bottling_date: "2024-09-15T00:00:00.000Z",
  vintage_year: "2023",
  batch_ref: "BATCH-001",
  lot_code: "LOT-2023-001",
  wine_colour: "White",
  is_organic: true,
  volume_bottled_litres: "500",
  bottle_size_ml: "750",
  bottles_produced: "666",
  cases_produced: "55",
  closure_type: "Screw cap (Stelvin)",
  free_so2_mg_l: "35",
  total_so2_mg_l: "120",
  notes: 'Tricky notes: commas, "quotes",\nand a second line\r\nand a third',
};

describe("bottling CSV export → import round trip", () => {
  it("round-trips notes with commas, quotes and embedded newlines", () => {
    const csv = buildExportCsv([sampleDbRow]);
    const parsed = parseBottlingCsv(csv);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.rows).toHaveLength(1);
    const rec = bottlingImportRecord(parsed.rows[0]);
    expect(rec.bottlingDate).toBe("2024-09-15"); // ISO, re-import-safe
    expect(rec.isOrganic).toBe("true"); // Yes → "true"
    expect(rec.lotCode).toBe("LOT-2023-001");
    expect(rec.notes).toBe(String(sampleDbRow.notes)); // preserved verbatim inside quotes
  });

  it("extracts WARNING prefix records without breaking multiline rows", () => {
    const csv = buildExportCsv([sampleDbRow], ['"WARNING: 1 run exceeds the applicable SO₂ limit: LOT-2023-001"']);
    const parsed = parseBottlingCsv(csv);
    expect(parsed.ok).toBe(true);
    expect(parsed.warnings).toHaveLength(1);
    expect(parsed.warnings[0]).toMatch(/^WARNING:/);
    if (!parsed.ok) return;
    expect(parsed.rows).toHaveLength(1);
    expect(bottlingImportRecord(parsed.rows[0]).notes).toContain("second line");
  });

  it("accepts legacy export headers and snake_case aliases", () => {
    const legacyCsv = [
      '"Bottling Date","Organic SO₂ Limits","Free SO₂ (mg/L)","lot_code"',
      '"2023-05-01","Yes","30","LOT-X"',
    ].join("\n");
    const parsed = parseBottlingCsv(legacyCsv);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const rec = bottlingImportRecord(parsed.rows[0]);
    expect(rec.isOrganic).toBe("true");
    expect(rec.freeSo2MgL).toBe("30");
    expect(rec.lotCode).toBe("LOT-X");
  });

  it("maps Organic No / blank to false", () => {
    const csv = `"Bottling Date","Organic (Yes/No)"\n"2023-05-01","No"\n"2023-05-02",""`;
    const parsed = parseBottlingCsv(csv);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(bottlingImportRecord(parsed.rows[0]).isOrganic).toBe("false");
    expect(bottlingImportRecord(parsed.rows[1]).isOrganic).toBe("false");
  });

  it("lists unrecognised headers without blocking the import", () => {
    const csv = `"Bottling Date","Batch Reff","Notes"\n"2023-05-01","BATCH-001","ok"`;
    const parsed = parseBottlingCsv(csv);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.unknownHeaders).toEqual(["Batch Reff"]);
    expect(parsed.rows).toHaveLength(1);
  });

  it("reports no unrecognised headers for a clean template export", () => {
    const parsed = parseBottlingCsv(buildExportCsv([sampleDbRow]));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.unknownHeaders).toEqual([]);
  });

  it("rejects files without a recognised header row", () => {
    const parsed = parseBottlingCsv('"Foo","Bar"\n"1","2"');
    expect(parsed.ok).toBe(false);
  });

  it("export headers exactly match the import template headers", () => {
    const csv = buildExportCsv([sampleDbRow]);
    const headerRow = parseCsvText(csv)[0];
    expect(headerRow).toEqual(BOTTLING_IMPORT_HEADERS);
  });
});
