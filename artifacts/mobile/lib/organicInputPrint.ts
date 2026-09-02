export interface OrganicInputPrintRecord {
  productName: string;
  inputType: string | null;
  approvalStatus: string;
  supplier: string | null;
  dateOfUse: string | null;
  quantityAmount: string | null;
  quantityUnit: string | null;
  certifierApprovalRef: string | null;
  derogationExpiryDate: string | null;
  fieldName: string | null;
  cropYear: number | null;
  notes: string | null;
  poReference: string | null;
  grnReference: string | null;
  pending?: boolean;
}

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted",
  derogation: "Derogation",
};

const PRINT_CSS = `body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;margin:0}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:14px}
.hdr h1{margin:0;font-size:16px;color:#166534}.hdr .sub{margin:2px 0 0;font-size:10px;color:#6b7280}
.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#166534;color:#fff;padding:6px 8px;text-align:left;font-size:10px;font-weight:600}
td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
tr:nth-child(even) td{background:#f9fafb}
.footer{border-top:1px solid #e5e7eb;padding-top:8px;font-size:9px;color:#9ca3af;margin-top:14px}`;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString("en-GB");
}

function formatCell(value: string | null | undefined): string {
  return value ? escapeHtml(value) : "—";
}

function formatQuantity(record: OrganicInputPrintRecord): string {
  if (!record.quantityAmount) return "—";
  return escapeHtml(`${record.quantityAmount}${record.quantityUnit ? ` ${record.quantityUnit}` : ""}`);
}

function formatNotes(record: OrganicInputPrintRecord): string {
  const notes = record.notes ?? "";
  if (record.pending) {
    return formatCell(notes ? `${notes} | Pending sync` : "Pending sync");
  }
  return formatCell(notes);
}

function approvalColor(status: string): string {
  if (status === "permitted") return "#166534";
  if (status === "restricted") return "#92400e";
  return "#991b1b";
}

export function organicInputRegisterHtml(
  records: OrganicInputPrintRecord[],
  farmName: string,
  cropYear: number | null,
): string {
  const safeFarmName = escapeHtml(farmName);
  const yearLabel = cropYear ? `Crop Year ${cropYear}` : "All Years";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const rows = records.map((record) => `<tr>
    <td style="white-space:nowrap">${formatDate(record.dateOfUse)}</td>
    <td style="font-weight:600">${formatCell(record.productName)}</td>
    <td>${formatCell(record.inputType)}</td>
    <td>${formatCell(record.supplier)}</td>
    <td>${formatCell(record.poReference)}</td>
    <td>${formatCell(record.grnReference)}</td>
    <td style="font-weight:600;color:${approvalColor(record.approvalStatus)}">${escapeHtml(APPROVAL_STATUS_LABELS[record.approvalStatus] ?? record.approvalStatus)}</td>
    <td style="white-space:nowrap">${formatDate(record.derogationExpiryDate)}</td>
    <td>${formatCell(record.certifierApprovalRef)}</td>
    <td>${formatCell(record.fieldName)}</td>
    <td>${formatQuantity(record)}</td>
    <td>${formatNotes(record)}</td>
  </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Input Register — ${safeFarmName} — ${escapeHtml(yearLabel)}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${safeFarmName}</h1><p class="sub">Organic Input Purchase Register · ${escapeHtml(yearLabel)} · Complementary Record</p></div>
<div class="hdr-r"><b>Input Register</b><br>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${escapeHtml(today)}</div></div>
<table><thead><tr><th>Date Used</th><th>Product</th><th>Input Type</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Approval Status</th><th>Derogation Expiry</th><th>Certifier Ref</th><th>Field / Area</th><th>Quantity</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Input Register — Complementary record for Soil Association / OF&amp;G portal. This register demonstrates that inputs used comply with organic standards. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${escapeHtml(today)}</div>
</body></html>`;
}