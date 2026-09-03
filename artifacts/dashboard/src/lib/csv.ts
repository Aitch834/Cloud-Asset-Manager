/**
 * CSV formula-injection sanitiser.
 *
 * Spreadsheet applications (Excel, LibreOffice, Google Sheets) evaluate cell
 * content as a formula when it begins with =, +, -, @, | or %.
 * An attacker can craft user-supplied data (e.g. a farm field name) that injects
 * a formula and exfiltrates data when the victim opens the CSV.
 *
 * We neutralise this by prefixing such cells with a tab character, which is
 * stripped by most spreadsheets on import but prevents formula execution.
 *
 * References:
 *   OWASP CSV Injection — https://owasp.org/www-community/attacks/CSV_Injection
 */
const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

export function sanitiseCsvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (FORMULA_STARTERS.test(s)) {
    return "\t" + s;
  }
  return s;
}

/**
 * Derive tonnes per hectare from a total yield in kilograms and an area in
 * hectares. Missing, invalid, or non-positive inputs return null so CSV
 * callers can emit an empty cell instead of a spreadsheet error.
 */
export function deriveTonnesPerHa(totalKg: unknown, areaHa: unknown): number | null {
  const kg = Number.parseFloat(String(totalKg ?? ""));
  const ha = Number.parseFloat(String(areaHa ?? ""));
  return Number.isFinite(kg) && kg > 0 && Number.isFinite(ha) && ha > 0
    ? kg / 1000 / ha
    : null;
}

/**
 * Wrap a cell string in double-quotes, escaping any embedded double-quotes.
 * Always quote so commas inside values are safe.
 */
export function quoteCsvCell(value: unknown): string {
  const s = sanitiseCsvCell(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV string from an array of rows (each row is an array of values).
 * Prepends the UTF-8 BOM so Excel opens the file with the correct encoding.
 */
export function buildCsv(rows: unknown[][]): string {
  const body = rows.map(r => r.map(quoteCsvCell).join(",")).join("\n");
  return "\uFEFF" + body;
}

/**
 * Build the raw CSV string used by the viticulture exportCSV helper.
 *
 * Pure function (no DOM) — safe to call in Node / test environments.
 * The returned string includes the UTF-8 BOM, an optional warning row prepended
 * before the header, a header row, and one row per data record.
 *
 * @param rows       Data rows (each is a flat Record from the API)
 * @param cols       Column definitions — key to read, label for header, optional fmt
 * @param warningRow Optional pre-formatted warning string (already quoted for CSV)
 *                   to prepend as the very first line before the column headers.
 */
export function buildViticultureCsvContent(
  rows: Record<string, unknown>[],
  cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[],
  warningRow?: string,
): string {
  const header = cols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map(r =>
      cols
        .map(c => {
          const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
          const safe = sanitiseCsvCell(raw);
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  const prefix = warningRow ? warningRow + "\n" : "";
  return "\uFEFF" + prefix + header + "\n" + body;
}

/**
 * Build the warning message for viticulture CSV exports when some records are
 * not linked to a vineyard block. Returns undefined when all records are linked.
 *
 * This is the unquoted form for callers that pass the value through buildCsv
 * (such as downloadCsvFile).
 */
export function buildViticultureUnlinkedWarningText(
  rows: Record<string, unknown>[],
): string | undefined {
  const n = rows.filter(r => !r["blockId"]).length;
  if (n === 0) return undefined;
  return `WARNING: ${n} record${n === 1 ? "" : "s"} not linked to a block — block-level totals may be incomplete`;
}

/**
 * Build the warning row string for viticulture CSV exports.
 *
 * The returned string is already double-quoted so it can be passed directly to
 * buildViticultureCsvContent / exportCSV as the warningRow parameter.
 */
export function buildViticultureUnlinkedWarning(
  rows: Record<string, unknown>[],
): string | undefined {
  const warning = buildViticultureUnlinkedWarningText(rows);
  return warning === undefined ? undefined : quoteCsvCell(warning);
}

/**
 * Build the totals row for the vineyard Block Summary CSV.
 *
 * Total yield, picks, and chemistry averages include every supplied record.
 * Weighted t/ha uses only blocks with a known positive area, matching the
 * on-screen Block Summary footer. Values follow the CSV's column order.
 */
export function buildViticultureBlockSummaryFooterRow(
  rows: Record<string, unknown>[],
  getBlockAreaHa: (blockId: unknown) => number | null,
): (string | number)[] {
  const blockMap: Record<string, Record<string, unknown>[]> = {};
  for (const row of rows) {
    const key = String(row.blockId ?? "__unlinked__");
    if (!blockMap[key]) blockMap[key] = [];
    blockMap[key].push(row);
  }

  const avg = (values: number[]) => values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
  const summaryGroups = Object.entries(blockMap).map(([key, group]) => {
    const totalYieldKg = group.reduce(
      (sum, row) => sum + (parseFloat(String(row.yieldKg ?? 0)) || 0),
      0,
    );
    const areaHa = key === "__unlinked__" ? null : getBlockAreaHa(key);
    return { totalYieldKg, areaHa };
  });
  const groupsWithArea = summaryGroups.filter(group => group.areaHa != null && group.areaHa > 0);
  const totalAreaHa = groupsWithArea.reduce((sum, group) => sum + (group.areaHa ?? 0), 0);
  const areaYieldKg = groupsWithArea.reduce((sum, group) => sum + group.totalYieldKg, 0);
  const weightedTha = totalAreaHa > 0 && areaYieldKg > 0
    ? areaYieldKg / 1000 / totalAreaHa
    : null;
  const totalYieldKg = summaryGroups.reduce((sum, group) => sum + group.totalYieldKg, 0);
  const avgBrix = avg(rows.map(row => parseFloat(String(row.brix ?? ""))).filter(value => !isNaN(value)));
  const avgPh = avg(rows.map(row => parseFloat(String(row.ph ?? ""))).filter(value => !isNaN(value)));
  const avgTa = avg(rows.map(row => parseFloat(String(row.titratableAcidityGl ?? ""))).filter(value => !isNaN(value)));
  const avgPa = avg(rows.map(row => parseFloat(String(row.potentialAlcohol ?? ""))).filter(value => !isNaN(value)));

  return [
    "",
    "All blocks",
    "",
    totalAreaHa > 0 ? totalAreaHa.toFixed(2) : "",
    rows.length,
    totalYieldKg > 0 ? totalYieldKg.toFixed(1) : "",
    weightedTha != null ? weightedTha.toFixed(2) : "",
    avgBrix != null ? avgBrix.toFixed(1) : "",
    avgPh != null ? avgPh.toFixed(2) : "",
    avgTa != null ? avgTa.toFixed(2) : "",
    avgPa != null ? avgPa.toFixed(2) : "",
  ];
}

/**
 * Trigger a browser download of a CSV file.
 */
export function downloadCsvFile(filename: string, rows: unknown[][]): void {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
