export interface MastitisTrendCsvRow {
  label: string;
  regular: number;
  chronic: number;
}

export interface MastitisTrendCsvNativeDependencies {
  cacheDirectory: string | null;
  writeCsvFile(uri: string, content: string): Promise<void>;
  shareAsync(
    uri: string,
    options: {
      mimeType: string;
      dialogTitle: string;
      UTI: string;
    },
  ): Promise<void>;
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

/**
 * Writes the rolling trend CSV to the native cache and opens the platform
 * sharing sheet. Dependencies are injected so this device boundary can be
 * verified in Jest without a physical phone.
 */
export async function shareMastitisTrendCsv(
  rows: MastitisTrendCsvRow[],
  filename: string,
  { cacheDirectory, writeCsvFile, shareAsync }: MastitisTrendCsvNativeDependencies,
): Promise<void> {
  if (!cacheDirectory) {
    throw new Error("The device cache directory is unavailable.");
  }

  const uri = `${cacheDirectory}${filename}`;
  await writeCsvFile(uri, buildMastitisTrendCsv(rows));
  await shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Share Mastitis Trend CSV",
    UTI: "public.comma-separated-values-text",
  });
}