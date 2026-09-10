export type RestrictedInputsStatusFilter = "active" | "expired" | "pending" | "all";

export interface RestrictedInputCsvRecord {
  productName: string;
  inputType: string | null | undefined;
  fieldName: string | null | undefined;
  appliedBy: string | null | undefined;
  approvalStatus: string;
  certifierApprovalRef: string | null | undefined;
  certifierNotified: boolean;
  dateOfUse: string | null | undefined;
  derogationExpiryDate: string | null | undefined;
  supplier: string | null | undefined;
  poReference: string | null | undefined;
  grnReference: string | null | undefined;
  justification: string | null | undefined;
  cropYear: number | null | undefined;
  pending?: boolean;
}

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required",
};

const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;

function formatCsvDate(value: string | null | undefined): string {
  if (!value) return "";
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

function quoteCsvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = FORMULA_STARTERS.test(raw) ? `\t${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function getRestrictedInputsStatus(
  record: RestrictedInputCsvRecord,
  now = new Date(),
): Exclude<RestrictedInputsStatusFilter, "all"> {
  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  if (record.derogationExpiryDate) {
    const dateOnly = record.derogationExpiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const expiryKey = dateOnly
      ? `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`
      : (() => {
          const expiry = new Date(record.derogationExpiryDate!);
          if (Number.isNaN(expiry.getTime())) return record.derogationExpiryDate!;
          return [
            expiry.getFullYear(),
            String(expiry.getMonth() + 1).padStart(2, "0"),
            String(expiry.getDate()).padStart(2, "0"),
          ].join("-");
        })();
    if (expiryKey < todayKey) return "expired";
    if (record.certifierApprovalRef?.trim()) return "active";
    return "pending";
  }

  const currentYear = now.getFullYear();
  const year = record.cropYear ?? (
    record.dateOfUse ? new Date(record.dateOfUse).getFullYear() : null
  );
  if (year !== null && year < currentYear) return "expired";
  if (record.certifierApprovalRef?.trim()) return "active";
  return "pending";
}

export function filterRestrictedInputs<T extends RestrictedInputCsvRecord>(
  records: T[],
  filter: RestrictedInputsStatusFilter,
  now = new Date(),
): T[] {
  const restrictedRecords = records.filter(
    (record) => record.approvalStatus === "restricted" || record.approvalStatus === "derogation",
  );
  return filter === "all"
    ? restrictedRecords
    : restrictedRecords.filter((record) => getRestrictedInputsStatus(record, now) === filter);
}

export function buildRestrictedInputsCsv(records: RestrictedInputCsvRecord[]): string {
  const includesPendingRows = records.some((record) => record.pending === true);
  const headers = [
    "Date Applied",
    "Product",
    "Type / Category",
    "Field / Area",
    "Applied By",
    "Approval Status",
    "Certifier Approval Ref",
    "Certifier Notified",
    "Derogation Expiry Date",
    "Supplier",
    "PO Reference",
    "GRN / Delivery Ref",
    "Justification",
  ];
  if (includesPendingRows) headers.push("Sync Status");

  const rows: unknown[][] = [
    headers,
    ...records.map((record) => {
      const row = [
        formatCsvDate(record.dateOfUse),
        record.productName,
        record.inputType,
        record.fieldName,
        record.appliedBy,
        APPROVAL_STATUS_LABELS[record.approvalStatus] ?? record.approvalStatus,
        record.certifierApprovalRef,
        record.certifierNotified ? "Yes" : "No",
        formatCsvDate(record.derogationExpiryDate),
        record.supplier,
        record.poReference,
        record.grnReference,
        record.justification,
      ];
      if (includesPendingRows) row.push(record.pending ? "Pending sync" : "");
      return row;
    }),
  ];

  return `\uFEFF${rows.map((row) => row.map(quoteCsvCell).join(",")).join("\r\n")}`;
}

export function buildFilteredRestrictedInputsCsv(
  records: RestrictedInputCsvRecord[],
  filter: RestrictedInputsStatusFilter,
  now = new Date(),
): string {
  return buildRestrictedInputsCsv(filterRestrictedInputs(records, filter, now));
}

export function buildRestrictedInputsCsvFilename(
  farmName: string,
  filter: RestrictedInputsStatusFilter,
): string {
  const safeName = farmName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `restricted-inputs-${filter}-${safeName || "farm"}.csv`;
}