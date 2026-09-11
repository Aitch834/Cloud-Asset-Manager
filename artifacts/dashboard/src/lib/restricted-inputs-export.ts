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

export interface InputRegisterPrintRecord {
  dateOfUse: string | null;
  productName: string;
  inputType: string | null;
  supplier: string | null;
  poReference: string | null;
  grnReference: string | null;
  approvalStatus: string;
  derogationExpiryDate: string | null;
  certifierApprovalRef: string | null;
  fieldName: string | null;
  quantityAmount: string | null;
  quantityUnit: string | null;
  notes: string | null;
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

export function getInputRegisterApprovalFilterLabel(approvalStatusFilter: string): string {
  if (approvalStatusFilter === "all") return "";
  return `${RESTRICTED_INPUT_APPROVAL_STATUS_LABELS[approvalStatusFilter] ?? approvalStatusFilter} only`;
}

export function buildInputRegisterPrintHtml(
  records: InputRegisterPrintRecord[],
  farmName: string,
  cropYear: number | null,
  approvalStatusFilter: string,
  printCss: string,
  printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
): string {
  const yearLabel = cropYear ? `Crop Year ${cropYear}` : "All Years";
  const approvalStatusLabel = getInputRegisterApprovalFilterLabel(approvalStatusFilter);
  const rows = records.map(r => `<tr>
    <td style="white-space:nowrap">${r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.inputType || "—"}</td>
    <td>${r.supplier || "—"}</td>
    <td>${r.poReference || "—"}</td>
    <td>${r.grnReference || "—"}</td>
    <td style="font-weight:600;color:${r.approvalStatus === "permitted" ? "#166534" : r.approvalStatus === "restricted" ? "#92400e" : "#991b1b"}">${RESTRICTED_INPUT_APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus}</td>
    <td style="white-space:nowrap">${r.derogationExpiryDate ? new Date(r.derogationExpiryDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifierApprovalRef || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.quantityAmount ? `${r.quantityAmount}${r.quantityUnit ? " " + r.quantityUnit : ""}` : "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  return `<!DOCTYPE html><html><head><title>Input Register — ${farmName} — ${yearLabel}</title><style>${printCss}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Input Purchase Register · ${yearLabel}${approvalStatusLabel ? ` · ${approvalStatusLabel}` : ""} · Complementary Record</p></div>
<div class="hdr-r"><b>Input Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${printedDate}</div></div>
<table><thead><tr><th>Date Used</th><th>Product</th><th>Input Type</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Approval Status</th><th>Derogation Expiry</th><th>Certifier Ref</th><th>Field / Area</th><th>Quantity</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Input Register — Complementary record for Soil Association / OF&G portal. This register demonstrates that inputs used comply with organic standards. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${printedDate}</div>
</body></html>`;
}

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