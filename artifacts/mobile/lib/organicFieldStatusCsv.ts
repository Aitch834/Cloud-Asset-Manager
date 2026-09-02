import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface OrganicFieldStatusCsvRecord {
  fieldName: string;
  status: string;
  conversionStartDate: string | null;
  certificationDate: string | null;
  certifierRef: string | null;
  parallelProduction: boolean;
  notes: string | null;
}

export const ORGANIC_FIELD_STATUS_CSV_HEADERS = [
  "Field Name",
  "Status",
  "Conversion Start",
  "Certified From",
  "Certifier Ref",
  "Parallel Production",
  "Notes",
] as const;

const STATUS_LABELS: Record<string, string> = {
  certified: "Certified Organic",
  "in-conversion": "In Conversion",
  conventional: "Conventional",
};

const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

function quoteCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = FORMULA_STARTERS.test(raw) ? `\t${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildOrganicFieldStatusCsv(
  records: OrganicFieldStatusCsvRecord[],
): string {
  const rows: unknown[][] = [
    [...ORGANIC_FIELD_STATUS_CSV_HEADERS],
    ...records.map((record) => [
      record.fieldName,
      STATUS_LABELS[record.status] ?? record.status,
      formatCsvDate(record.conversionStartDate),
      formatCsvDate(record.certificationDate),
      record.certifierRef ?? "",
      record.parallelProduction ? "Yes" : "No",
      record.notes ?? "",
    ]),
  ];

  return `\uFEFF${rows
    .map((row) => row.map(quoteCsvCell).join(","))
    .join("\r\n")}`;
}

export function buildOrganicFieldStatusCsvFilename(farmName: string): string {
  const safeName = farmName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `field-status-register-${safeName || "farm"}.csv`;
}

/**
 * Share a native CSV file. The same contract is supported by the iOS share
 * sheet (including Save to Files) and Android's document/share targets.
 */
export async function shareOrganicFieldStatusCsv(
  records: OrganicFieldStatusCsvRecord[],
  farmName: string,
): Promise<void> {
  const filename = buildOrganicFieldStatusCsvFilename(farmName);
  const uri = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(uri, buildOrganicFieldStatusCsv(records), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Share Field Status Register CSV",
    UTI: "public.comma-separated-values-text",
  });
}