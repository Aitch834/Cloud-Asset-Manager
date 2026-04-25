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
