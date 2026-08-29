export interface MastitisTrendCsvRow {
  label: string;
  regular: number;
  chronic: number;
}

const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function quoteCsvCell(value: unknown): string {
  const cell = value == null ? "" : String(value);
  const safeCell = FORMULA_STARTERS.test(cell) ? `\t${cell}` : cell;
  return `"${safeCell.replace(/"/g, '""')}"`;
}

export function buildMastitisTrendCsv(rows: MastitisTrendCsvRow[]): string {
  const csvRows: unknown[][] = [
    ["Month", "Total Cases", "Chronic Cases"],
    ...rows.map((row) => [
      row.label,
      row.regular + row.chronic,
      row.chronic,
    ]),
  ];

  return "\uFEFF" + csvRows.map((row) => row.map(quoteCsvCell).join(",")).join("\r\n");
}