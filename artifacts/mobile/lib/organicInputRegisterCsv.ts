export interface InputRegisterCsvRecord {
  productName: string;
  inputType: string | null;
  supplier: string | null;
  dateOfUse: string | null;
  quantityAmount: string | null;
  quantityUnit: string | null;
  certifierApprovalRef: string | null;
  derogationExpiryDate: string | null;
  fieldName: string | null;
  approvalStatus: string;
  notes: string | null;
  poReference: string | null;
  grnReference: string | null;
  pending?: boolean;
}

function fmtDateCsv(val: string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB");
}

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted",
  derogation: "Derogation",
};

/** Mirror of dashboard lib/csv.ts sanitiseCsvCell — prevents CSV formula injection. */
const FORMULA_STARTERS = /^[=+\-@|%\t\r]/;
function sanitiseCsvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return FORMULA_STARTERS.test(s) ? "\t" + s : s;
}

/** Always-quoted cell: sanitise first, then wrap in double-quotes. */
function quoteCsvCell(value: unknown): string {
  const s = sanitiseCsvCell(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildInputRegisterCsv(records: InputRegisterCsvRecord[]): string {
  const rows: unknown[][] = [
    [
      "Date Used",
      "Product",
      "Input Type",
      "Supplier",
      "PO Reference",
      "GRN / Delivery Ref",
      "Approval Status",
      "Derogation Expiry",
      "Certifier Ref",
      "Field / Area",
      "Quantity",
      "Notes",
    ],
    ...records.map((r) => [
      fmtDateCsv(r.dateOfUse),
      r.productName,
      r.inputType ?? "",
      r.supplier ?? "",
      r.poReference ?? "",
      r.grnReference ?? "",
      APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus,
      fmtDateCsv(r.derogationExpiryDate),
      r.certifierApprovalRef ?? "",
      r.fieldName ?? "",
      r.quantityAmount
        ? `${r.quantityAmount}${r.quantityUnit ? " " + r.quantityUnit : ""}`
        : "",
      r.pending
        ? r.notes
          ? `${r.notes} | Pending sync`
          : "Pending sync"
        : r.notes ?? "",
    ]),
  ];
  const body = rows.map((row) => row.map(quoteCsvCell).join(",")).join("\r\n");
  return "\uFEFF" + body; // UTF-8 BOM for Excel compatibility
}