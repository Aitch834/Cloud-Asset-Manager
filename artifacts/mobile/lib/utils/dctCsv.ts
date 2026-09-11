export interface DctCsvRecord {
  dryOffDate: string;
  cowEarTag?: string | null;
  protocol?: string | null;
  antibioticTubeProduct?: string | null;
  antibioticTubeBatch?: string | null;
  antibioticTubeWithdrawalMilkDays?: number | null;
  standardMilkWithdrawalDays?: number | null;
  doubledMilkWithdrawalDays?: number | null;
  teatSealantProduct?: string | null;
  sccAtDryOff?: number | string | null;
  vetAuthorisation?: boolean | null;
  vetName?: string | null;
  certifierNotified?: boolean | null;
  expectedCalvingDate?: string | null;
  therapeuticJustification?: string | null;
  treatmentJustification?: string | null;
}

export interface DctCsvNativeDependencies {
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

export const DCT_CSV_HEADERS = [
  "Dry-Off Date",
  "Ear Tag",
  "Protocol",
  "Antibiotic Product",
  "Antibiotic Batch",
  "Std Milk W/D (days)",
  "Dbl Milk W/D (days)",
  "Teat Sealant Product",
  "SCC at Dry-Off (k/mL)",
  "Vet Authorisation",
  "Vet Name",
  "Certifier Notified",
  "Expected Calving Date",
  "Justification",
] as const;

function safeCsvValue(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const sanitised = /^[=+\-@|%\t\r]/.test(raw) ? `\t${raw}` : raw;
  return `"${sanitised.replace(/"/g, '""')}"`;
}

function csvDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
}

export function buildDctCsv(records: DctCsvRecord[]): string {
  const rows: unknown[][] = [
    [...DCT_CSV_HEADERS],
    ...records.map((record) => [
      csvDate(record.dryOffDate),
      record.cowEarTag ?? "",
      record.protocol?.replace(/-/g, " ") ?? "",
      record.antibioticTubeProduct ?? "",
      record.antibioticTubeBatch ?? "",
      record.standardMilkWithdrawalDays ??
        record.antibioticTubeWithdrawalMilkDays ??
        "",
      record.doubledMilkWithdrawalDays ?? "",
      record.teatSealantProduct ?? "",
      record.sccAtDryOff ?? "",
      record.vetAuthorisation ? "Yes" : "No",
      record.vetName ?? "",
      record.certifierNotified ? "Yes" : "No",
      csvDate(record.expectedCalvingDate),
      record.therapeuticJustification ?? record.treatmentJustification ?? "",
    ]),
  ];

  return (
    "\uFEFF" +
    rows.map((row) => row.map(safeCsvValue).join(",")).join("\r\n")
  );
}

export function buildDctCsvFilename(monthName: string): string {
  const slug = monthName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `dct-records-${slug}.csv`;
}

export async function shareDctCsvNative(
  records: DctCsvRecord[],
  monthName: string,
  { cacheDirectory, writeCsvFile, shareAsync }: DctCsvNativeDependencies,
): Promise<void> {
  if (!cacheDirectory) {
    throw new Error("The device cache directory is unavailable.");
  }

  const uri = `${cacheDirectory}${buildDctCsvFilename(monthName)}`;
  await writeCsvFile(uri, buildDctCsv(records));
  await shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Share DCT CSV",
    UTI: "public.comma-separated-values-text",
  });
}