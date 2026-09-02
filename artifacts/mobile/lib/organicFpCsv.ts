export interface OrganicFpCsvRecord {
  applicationDate: string | null | undefined;
  cropYear: number | string | null | undefined;
  inputName: string | null | undefined;
  inputType: string | null | undefined;
  approvalStatus: string | null | undefined;
  derogationExpiryDate: string | null | undefined;
  supplier: string | null | undefined;
  quantityApplied: string | number | null | undefined;
  quantityUnit: string | null | undefined;
  purposeOfUse: string | null | undefined;
  appliedBy: string | null | undefined;
  certifierApprovalRef: string | null | undefined;
  poReference: string | null | undefined;
  grnReference: string | null | undefined;
  notes: string | null | undefined;
}

export const ORGANIC_FP_CSV_HEADERS = [
  "Date Applied",
  "Crop Year",
  "Input / Product",
  "Type",
  "Approval Status",
  "Expiry Date",
  "Days Remaining",
  "Supplier",
  "Qty Applied",
  "Unit",
  "Purpose",
  "Applied By",
  "Certifier Ref",
  "PO Ref",
  "GRN Ref",
  "Notes",
] as const;

const CSV_FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function quoteCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = CSV_FORMULA_STARTERS.test(raw) ? `\t${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}

function startOfToday(): number {
  return new Date().setHours(0, 0, 0, 0);
}

function daysRemaining(expiryDate: string, todayMs: number): number | null {
  const expiryMs = new Date(expiryDate).setHours(0, 0, 0, 0);
  if (Number.isNaN(expiryMs)) return null;
  return Math.round((expiryMs - todayMs) / 86400000);
}

export function buildOrganicFpCsv(
  records: OrganicFpCsvRecord[],
  todayMs = startOfToday(),
): string {
  const rows: unknown[][] = [
    [...ORGANIC_FP_CSV_HEADERS],
    ...records.map((record) => {
      const needsDerogation =
        record.approvalStatus === "restricted" ||
        record.approvalStatus === "derogation";
      const expiryDate =
        needsDerogation && record.derogationExpiryDate
          ? formatCsvDate(record.derogationExpiryDate)
          : "";
      const remaining =
        needsDerogation && record.derogationExpiryDate
          ? daysRemaining(record.derogationExpiryDate, todayMs)
          : null;

      return [
        formatCsvDate(record.applicationDate),
        record.cropYear ?? "",
        record.inputName ?? "",
        record.inputType ?? "",
        record.approvalStatus ?? "",
        expiryDate,
        remaining ?? "",
        record.supplier ?? "",
        record.quantityApplied ?? "",
        record.quantityUnit ?? "",
        record.purposeOfUse ?? "",
        record.appliedBy ?? "",
        record.certifierApprovalRef ?? "",
        record.poReference ?? "",
        record.grnReference ?? "",
        record.notes ?? "",
      ];
    }),
  ];

  return `\uFEFF${rows
    .map((row) => row.map(quoteCsvCell).join(","))
    .join("\r\n")}`;
}

export function buildOrganicFpCsvFilename(
  farmName: string,
  yearLabel: string,
): string {
  const slug = farmName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const yearPart = yearLabel === "All Years" ? "" : `-${yearLabel}`;
  return `fp-input-log${yearPart}-${slug}.csv`;
}
