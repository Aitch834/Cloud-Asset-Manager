export interface RestrictedInputExportRecord {
  productName: string;
  inputType: string | null;
  supplier: string | null;
  poReference: string | null;
  grnReference: string | null;
  approvalStatus: string;
  certifierApprovalRef: string | null;
  dateOfUse: string | null;
  fieldName: string | null;
  justification: string | null;
  certifierNotified: boolean;
  appliedBy: string | null;
  derogationExpiryDate: string | null;
}

interface RestrictedInputExportColumn {
  label: string;
  getValue: (record: RestrictedInputExportRecord) => string;
  printStyle?: string;
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB");
}

export const RESTRICTED_INPUT_APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required",
};

export const RESTRICTED_INPUT_COLUMNS: readonly RestrictedInputExportColumn[] = [
  { label: "Date Applied", getValue: record => formatDate(record.dateOfUse), printStyle: "white-space:nowrap" },
  { label: "Product", getValue: record => record.productName, printStyle: "font-weight:600" },
  { label: "Type / Category", getValue: record => record.inputType ?? "" },
  { label: "Field / Area", getValue: record => record.fieldName ?? "" },
  { label: "Applied By", getValue: record => record.appliedBy ?? "" },
  {
    label: "Approval Status",
    getValue: record => RESTRICTED_INPUT_APPROVAL_STATUS_LABELS[record.approvalStatus] ?? record.approvalStatus,
  },
  { label: "Certifier Approval Ref", getValue: record => record.certifierApprovalRef ?? "" },
  { label: "Certifier Notified", getValue: record => record.certifierNotified ? "Yes" : "No" },
  { label: "Derogation Expiry Date", getValue: record => formatDate(record.derogationExpiryDate), printStyle: "white-space:nowrap" },
  { label: "Supplier", getValue: record => record.supplier ?? "" },
  { label: "PO Reference", getValue: record => record.poReference ?? "" },
  { label: "GRN / Delivery Ref", getValue: record => record.grnReference ?? "" },
  { label: "Justification", getValue: record => record.justification ?? "" },
];

export function getRestrictedInputCsvHeaders(): string[] {
  return RESTRICTED_INPUT_COLUMNS.map(column => column.label);
}

export function getRestrictedInputPrintHeaders(): string[] {
  return RESTRICTED_INPUT_COLUMNS.map(column => column.label);
}

export function getRestrictedInputPrintHeaderHtml(): string {
  return getRestrictedInputPrintHeaders().map(label => `<th>${label}</th>`).join("");
}

export function getRestrictedInputValues(record: RestrictedInputExportRecord): string[] {
  return RESTRICTED_INPUT_COLUMNS.map(column => column.getValue(record));
}

export function getRestrictedInputPrintCellStyle(index: number): string | undefined {
  return RESTRICTED_INPUT_COLUMNS[index]?.printStyle;
}