import { b as useAppStore, r as reactExports, c as useQueryClient, a as useToast, m as useQuery, j as jsxRuntimeExports, R as Redirect, d as Button, e as LoaderCircle, U as FlaskConical, S as useMutation, T as Plus, n as Card, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, I as Input, N as DialogMutationError, aA as Check } from "./index-De1tglSK.js";
import { u as usePersistedTab } from "./use-persisted-tab-DVhLG8SL.js";
import { a as usePersistedFilter } from "./use-persisted-filter-D4-NjDsd.js";
import { A as AppLayout, c as ClipboardList, B as BookOpen, I as Info } from "./AppLayout-AS9SVnyn.js";
import { T as TabBar, a as TabButton } from "./tab-button-4aFIv4ML.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-BJLGBAzB.js";
import { C as Command, a as CommandInput, b as CommandList, c as CommandEmpty, d as CommandGroup, e as CommandItem } from "./command-CSYBwZeE.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BaXSGnhE.js";
import { T as Textarea } from "./textarea-CBg38xcQ.js";
import { D as DocAttach } from "./DocAttach-DAeRm4pX.js";
import { d as downloadCsvFile } from "./csv-DWj6ABOA.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-BgC10_2a.js";
import { D as Download } from "./download-DLcJwFHO.js";
import { S as ShieldCheck } from "./shield-check-0tyWLCtv.js";
import { E as ExternalLink } from "./external-link-XFtkE4KS.js";
import { P as Printer } from "./printer-B-R_DKDG.js";
import { E as Eye } from "./eye-CKZarkpw.js";
import { P as Pencil } from "./pencil-DO5zIt8-.js";
import { T as Trash2 } from "./trash-2-C6rbWPxa.js";
import { C as CircleCheck } from "./circle-check-6qvRCPEo.js";
import { C as Calendar } from "./calendar-BRz5-RL1.js";
import { a as Clock } from "./database-biFMvKzg.js";
import { P as Package } from "./use-safe-clerk-BjI1zB3C.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-BgS118qs.js";
import "./shield-alert-B-jggoZQ.js";
import "./tractor-DrfHD4BB.js";
import "./index-Be2cfGKd.js";
import "./search-i5LYlSiS.js";
import "./select-Dei_DleH.js";
import "./index-EPPPfGm0.js";
import "./chevron-up-Dv2JA1wd.js";
import "./use-upload-BgoxmqoD.js";
import "./api-Dhdsf4oM.js";
import "./upload-1N4YkEns.js";
function fmt(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 864e5);
}
function conversionProgress(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = start + 2 * 365.25 * 24 * 3600 * 1e3;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round((now - start) / (end - start) * 100)));
}
function expectedCertDate(startDate) {
  const d = new Date(startDate);
  d.setFullYear(d.getFullYear() + 2);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
const INPUT_CLS = "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full";
const CERTIFIERS = ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDOCA)", "Other"];
const CERT_SCOPES = ["All enterprises", "Arable", "Horticulture", "Livestock", "Livestock & Dairy", "Dairy", "Pigs", "Poultry", "Viticulture", "Other"];
const OUTCOMES = ["Pass", "Pass with Advisory Notes", "Non-conformance – Minor", "Non-conformance – Major", "Suspension"];
const STATUSES = ["certified", "in-conversion", "conventional"];
const STATUS_LABELS = { certified: "Certified Organic", "in-conversion": "In Conversion", conventional: "Conventional" };
const STATUS_COLORS = { certified: "bg-green-100 text-green-800 border-green-200", "in-conversion": "bg-amber-100 text-amber-800 border-amber-200", conventional: "bg-gray-100 text-gray-600 border-gray-200" };
const OUTCOME_COLORS = { "Pass": "text-green-700 bg-green-50 border-green-200", "Pass with Advisory Notes": "text-amber-700 bg-amber-50 border-amber-200", "Non-conformance – Minor": "text-orange-700 bg-orange-50 border-orange-200", "Non-conformance – Major": "text-red-700 bg-red-50 border-red-200", "Suspension": "text-red-900 bg-red-100 border-red-300" };
const PRINT_CSS = `body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;margin:0}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:14px}
.hdr h1{margin:0;font-size:16px;color:#166534}.hdr .sub{margin:2px 0 0;font-size:10px;color:#6b7280}
.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#166534;color:#fff;padding:6px 8px;text-align:left;font-size:10px;font-weight:600}
td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
tr:nth-child(even) td{background:#f9fafb}
.footer{border-top:1px solid #e5e7eb;padding-top:8px;font-size:9px;color:#9ca3af;margin-top:14px}`;
function openPrint(html) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}
function printInspectionRegister(records, farmName, year) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const yearLabel = year ? `${year}` : "All Years";
  const rows = records.map((r) => `<tr>
    <td style="white-space:nowrap">${r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifier}</td><td>${r.inspectorName || "—"}</td>
    <td><span style="font-weight:600">${r.outcome}</span></td>
    <td>${r.certificateReference || "—"}</td>
    <td style="white-space:nowrap">${r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.nonConformances || "—"}</td><td>${r.actions || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Inspection Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Certification Inspection Register · ${yearLabel} · Complementary Record</p></div>
<div class="hdr-r"><b>Inspection Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date</th><th>Certifier</th><th>Inspector</th><th>Outcome</th><th>Cert Ref</th><th>Next Due</th><th>Non-Conformances</th><th>Actions Required</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Inspection Register — Complementary record for Soil Association / OF&G portal. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function downloadInspectionsCsv(records, farmName, year) {
  const fmtDate = (v) => {
    if (!v) return "";
    try {
      return new Date(v).toLocaleDateString("en-GB");
    } catch {
      return v;
    }
  };
  const safeName = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const yearPart = year ? `-${year}` : "";
  const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  downloadCsvFile(`inspections-${safeName}${yearPart}-${dateStr}.csv`, [
    ["Date", "Certifier", "Inspector", "Outcome", "Cert Ref", "Next Due", "Non-Conformances", "Actions Required", "Notes"],
    ...records.map((r) => [
      fmtDate(r.inspectionDate),
      r.certifier,
      r.inspectorName ?? "",
      r.outcome,
      r.certificateReference ?? "",
      fmtDate(r.nextDueDate),
      r.nonConformances ?? "",
      r.actions ?? "",
      r.notes ?? ""
    ])
  ]);
}
function downloadFieldStatusCsv(records, farmName) {
  const fmtDate = (v) => {
    if (!v) return "";
    try {
      return new Date(v).toLocaleDateString("en-GB");
    } catch {
      return v;
    }
  };
  const safeName = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  downloadCsvFile(`field-status-register-${safeName}.csv`, [
    ["Field Name", "Status", "Conversion Start", "Certified From", "Certifier Ref", "Parallel Production", "Notes"],
    ...records.map((r) => [
      r.fieldName,
      STATUS_LABELS[r.status] ?? r.status,
      fmtDate(r.conversionStartDate),
      fmtDate(r.certificationDate),
      r.certifierRef ?? "",
      r.parallelProduction ? "Yes" : "No",
      r.notes ?? ""
    ])
  ]);
}
function printFieldStatusRegister(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map((r) => `<tr>
    <td>${r.fieldName}</td>
    <td style="font-weight:600">${STATUS_LABELS[r.status] ?? r.status}</td>
    <td style="white-space:nowrap">${r.conversionStartDate ? new Date(r.conversionStartDate).toLocaleDateString("en-GB") : "—"}</td>
    <td style="white-space:nowrap">${r.certificationDate ? new Date(r.certificationDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifierRef || "—"}</td>
    <td>${r.parallelProduction ? "Yes" : "No"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Field Status Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Field Status Register · Complementary Record</p></div>
<div class="hdr-r"><b>Field Register</b>${records.length} field${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Field Name</th><th>Status</th><th>Conversion Start</th><th>Certified From</th><th>Certifier Ref</th><th>Parallel Production</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Field Status Register — Complementary record for Soil Association / OF&G portal. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function exportRestrictedInputsCsv(records, farmName, filter) {
  const slug = farmName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const filterLabel = filter === "all" ? "all" : filter;
  downloadCsvFile(`restricted-inputs-${filterLabel}-${slug}.csv`, [
    ["Date Applied", "Product", "Type / Category", "Field / Area", "Applied By", "Approval Status", "Certifier Approval Ref", "Certifier Notified", "Derogation Expiry Date", "Supplier", "PO Reference", "GRN / Delivery Ref", "Justification"],
    ...records.map((r) => [
      r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "",
      r.productName,
      r.inputType ?? "",
      r.fieldName ?? "",
      r.appliedBy ?? "",
      APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus,
      r.certifierApprovalRef ?? "",
      r.certifierNotified ? "Yes" : "No",
      r.derogationExpiryDate ? new Date(r.derogationExpiryDate).toLocaleDateString("en-GB") : "",
      r.supplier ?? "",
      r.poReference ?? "",
      r.grnReference ?? "",
      r.justification ?? ""
    ])
  ]);
}
function printRestrictedInputsLog(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map((r) => `<tr>
    <td style="white-space:nowrap">${r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.inputType || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.appliedBy || "—"}</td>
    <td>${r.supplier || "—"}</td>
    <td>${r.poReference || "—"}</td>
    <td>${r.grnReference || "—"}</td>
    <td>${r.justification || "—"}</td>
    <td>${r.certifierApprovalRef || "—"}</td>
    <td>${r.certifierNotified ? "Yes" : "No"}</td>
    <td style="white-space:nowrap">${r.derogationExpiryDate ? new Date(r.derogationExpiryDate).toLocaleDateString("en-GB") : "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Restricted Inputs Log — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Restricted Inputs Log · Complementary Record</p></div>
<div class="hdr-r"><b>Restricted Inputs</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date Applied</th><th>Product</th><th>Category</th><th>Field / Area</th><th>Applied By</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Justification</th><th>Approval Ref</th><th>Certifier Notified</th><th>Derogation Expiry</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Restricted Inputs Log — Complementary record for Soil Association / OF&G portal. Retain with derogation approvals. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function escHtml(s) {
  if (!s) return "—";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function printCertificationSummary(records, farmName) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const safeFarmName = escHtml(farmName);
  const statusColor = (s) => s === "certified" ? "#166534" : s === "in-conversion" ? "#92400e" : "#6b7280";
  const rows = records.map((r) => `<tr>
    <td style="font-weight:600">${escHtml(r.certifier)}</td>
    <td>${escHtml(r.scope)}</td>
    <td>${escHtml(r.certificateNumber)}</td>
    <td>${escHtml(r.operatorNumber)}</td>
    <td style="white-space:nowrap">${r.certificationDate ? new Date(r.certificationDate).toLocaleDateString("en-GB") : "—"}</td>
    <td style="white-space:nowrap">${r.renewalDate ? new Date(r.renewalDate).toLocaleDateString("en-GB") : "—"}</td>
    <td style="white-space:nowrap">${r.expiryDate ? new Date(r.expiryDate).toLocaleDateString("en-GB") : "—"}</td>
    <td><span style="font-weight:600;color:${statusColor(r.status)}">${escHtml(STATUS_LABELS[r.status] ?? r.status)}</span></td>
    <td>${escHtml(r.notes)}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Certification Summary — ${safeFarmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${safeFarmName}</h1><p class="sub">Organic Certification Summary · Complementary Record</p></div>
<div class="hdr-r"><b>Certification Summary</b>${records.length} registration${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Certifying Body</th><th>Scope / Enterprise</th><th>Certificate No.</th><th>Operator No.</th><th>Certification Date</th><th>Annual Renewal</th><th>Expiry Date</th><th>Status</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Certification Summary — Complementary record for Soil Association / OF&amp;G portal. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function exportCertificationSummaryCSV(records, farmName) {
  const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const fmtDate = (val) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-GB");
    } catch {
      return String(val);
    }
  };
  const safeName = farmName.replace(/[^a-z0-9]/gi, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  const rows = [
    ["Certifying Body", "Scope / Enterprise", "Certificate No.", "Operator No.", "Certification Date", "Annual Renewal Date", "Certificate Expiry Date", "Status", "Notes"],
    ...records.map((r) => [
      r.certifier,
      r.scope ?? "",
      r.certificateNumber ?? "",
      r.operatorNumber ?? "",
      fmtDate(r.certificationDate),
      fmtDate(r.renewalDate),
      fmtDate(r.expiryDate),
      STATUS_LABELS[r.status] ?? r.status,
      r.notes ?? ""
    ])
  ];
  downloadCsvFile(`${safeName}_Organic_Certification_${dateStr}.csv`, rows);
}
function downloadInputRegisterCsv(records, farmName, cropYear, approvalStatusFilter) {
  const fmtDate = (v) => {
    if (!v) return "";
    try {
      return new Date(v).toLocaleDateString("en-GB");
    } catch {
      return v;
    }
  };
  const safeName = farmName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  const yearPart = cropYear ? `-${cropYear}` : "";
  const statusPart = approvalStatusFilter && approvalStatusFilter !== "all" ? `-${approvalStatusFilter}` : "";
  downloadCsvFile(`input-register${yearPart}${statusPart}-${safeName}.csv`, [
    ["Date Used", "Product", "Input Type", "Supplier", "PO Reference", "GRN / Delivery Ref", "Approval Status", "Derogation Expiry", "Certifier Ref", "Field / Area", "Quantity", "Notes"],
    ...records.map((r) => [
      fmtDate(r.dateOfUse),
      r.productName,
      r.inputType ?? "",
      r.supplier ?? "",
      r.poReference ?? "",
      r.grnReference ?? "",
      APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus,
      fmtDate(r.derogationExpiryDate),
      r.certifierApprovalRef ?? "",
      r.fieldName ?? "",
      r.quantityAmount ? `${r.quantityAmount}${r.quantityUnit ? " " + r.quantityUnit : ""}` : "",
      r.notes ?? ""
    ])
  ]);
}
function printInputRegister(records, farmName, cropYear) {
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const yearLabel = cropYear ? `Crop Year ${cropYear}` : "All Years";
  const rows = records.map((r) => `<tr>
    <td style="white-space:nowrap">${r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.inputType || "—"}</td>
    <td>${r.supplier || "—"}</td>
    <td>${r.poReference || "—"}</td>
    <td>${r.grnReference || "—"}</td>
    <td style="font-weight:600;color:${r.approvalStatus === "permitted" ? "#166534" : r.approvalStatus === "restricted" ? "#92400e" : "#991b1b"}">${APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus}</td>
    <td style="white-space:nowrap">${r.derogationExpiryDate ? new Date(r.derogationExpiryDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifierApprovalRef || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.quantityAmount ? `${r.quantityAmount}${r.quantityUnit ? " " + r.quantityUnit : ""}` : "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Input Register — ${farmName} — ${yearLabel}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Input Purchase Register · ${yearLabel} · Complementary Record</p></div>
<div class="hdr-r"><b>Input Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date Used</th><th>Product</th><th>Input Type</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Approval Status</th><th>Derogation Expiry</th><th>Certifier Ref</th><th>Field / Area</th><th>Quantity</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Input Register — Complementary record for Soil Association / OF&G portal. This register demonstrates that inputs used comply with organic standards. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}
function FieldPicker({
  farmFields,
  fieldId,
  fieldName,
  onFieldChange
}) {
  const hasFields = farmFields.length > 0;
  const selectedInList = fieldId !== null || hasFields && farmFields.some((f) => f.name === fieldName);
  const [showCustom, setShowCustom] = reactExports.useState(!selectedInList && fieldName !== "");
  if (!hasFields) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        className: INPUT_CLS,
        placeholder: "e.g. Home Field, North Block",
        value: fieldName,
        onChange: (e) => onFieldChange(null, e.target.value)
      }
    );
  }
  const selectValue = fieldId !== null ? String(fieldId) : farmFields.find((f) => f.name === fieldName) ? String(farmFields.find((f) => f.name === fieldName).id) : showCustom ? "__other__" : fieldName !== "" ? "__other__" : "";
  function handleSelect(val) {
    if (val === "__other__") {
      setShowCustom(true);
      onFieldChange(null, "");
    } else if (val === "") {
      setShowCustom(false);
      onFieldChange(null, "");
    } else {
      const field = farmFields.find((f) => f.id === parseInt(val));
      if (field) {
        setShowCustom(false);
        onFieldChange(field.id, field.name);
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: selectValue, onChange: (e) => handleSelect(e.target.value), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select field…" }),
      farmFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(f.id), children: [
        f.name,
        f.areaHectares ? ` (${parseFloat(f.areaHectares).toFixed(1)} ha)` : ""
      ] }, f.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other__", children: "Other / specify below" })
    ] }),
    (showCustom || selectValue === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        className: INPUT_CLS,
        placeholder: "Field or area name",
        value: fieldName,
        onChange: (e) => onFieldChange(null, e.target.value),
        autoFocus: true
      }
    )
  ] });
}
const EMPTY_CERT = { certifier: "Soil Association", scope: "All enterprises", certificateNumber: "", certificationDate: "", renewalDate: "", expiryDate: "", status: "certified", operatorNumber: "", notes: "" };
function CertificationTab({ farmId, farmName }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_CERT);
  const { data, isLoading } = useQuery({
    queryKey: ["organic-cert", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/certification`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/organic/certification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-cert", farmId] });
      setAdding(false);
      toast({ title: "Certifier registration added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, ...body }) => fetch(`/api/farms/${farmId}/organic/certification/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-cert", farmId] });
      setEditRecord(null);
      toast({ title: "Certifier registration updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic/certification/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-cert", farmId] });
      setDeleteId(null);
      toast({ title: "Certifier registration removed" });
    },
    onError: () => toast({ title: "Failed to remove", variant: "destructive" })
  });
  function openAdd() {
    setForm(EMPTY_CERT);
    setAdding(true);
  }
  function openEdit(r) {
    setForm({ certifier: r.certifier, scope: r.scope ?? "All enterprises", certificateNumber: r.certificateNumber ?? "", certificationDate: r.certificationDate ?? "", renewalDate: r.renewalDate ?? "", expiryDate: r.expiryDate ?? "", status: r.status, operatorNumber: r.operatorNumber ?? "", notes: r.notes ?? "" });
    setEditRecord(r);
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Complementary record — not a replacement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700", children: "BDE Farm Trac stores your certification reference details alongside your operational records. Your official certification is managed directly with your certifier's portal. Add one registration per certifying body — most holdings have one, but diversified farms registered with multiple bodies (e.g. Soil Association for livestock, OF&G for horticulture) can record each separately." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://www.soilassociation.org/certification", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
            "Soil Association Portal"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://www.ofgorganic.org", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
            "OF&G Portal"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      records.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printCertificationSummary(records, farmName), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          "Print Certification Summary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportCertificationSummaryCSV(records, farmName), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
          "Export CSV"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
        "Add Certifier Registration"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg mb-1", children: "No certifier registrations recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 mb-4", children: "Add the certifying body or bodies your holding is registered with." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
        "Add Certifier Registration"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: records.map((record) => {
      const renewalDays = daysUntil(record.renewalDate);
      const expiryDays = daysUntil(record.expiryDate);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 text-green-700" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: record.certifier }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[record.status] ?? STATUS_COLORS.conventional}`, children: STATUS_LABELS[record.status] ?? record.status }),
                record.scope && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60 bg-muted px-2 py-0.5 rounded-full border", children: record.scope })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            record.renewalDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Raise renewal task", onClick: () => setRaiseTaskFor({ title: `Organic Certification Renewal Due — ${record.certifier}`, description: `Your organic certification annual renewal is due. Contact ${record.certifier} and update the record in Organic Compliance → Certification.`, dueDate: record.renewalDate ?? void 0 }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 text-amber-600" }) }),
            record.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Raise expiry reminder task", onClick: () => setRaiseTaskFor({ title: `Certificate Expiry — ${record.certifier}`, description: `Your organic certificate issued by ${record.certifier} is due to expire. Check with your certifier and update the record in Organic Compliance → Certification.`, dueDate: record.expiryDate ?? void 0 }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 text-red-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "View", onClick: () => setViewRecord(record), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Edit", onClick: () => openEdit(record), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive hover:text-destructive", title: "Remove", onClick: () => setDeleteId(record.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4 pt-3 border-t", children: [
          record.certificateNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Certificate No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: record.certificateNumber })
          ] }),
          record.operatorNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Operator No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: record.operatorNumber })
          ] }),
          record.certificationDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Certified Since" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(record.certificationDate) })
          ] }),
          record.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-medium flex items-center gap-1.5 ${expiryDays !== null && expiryDays <= 60 && expiryDays >= 0 ? "text-amber-600" : expiryDays !== null && expiryDays < 0 ? "text-red-600" : ""}`, children: [
              fmt(record.expiryDate),
              expiryDays !== null && expiryDays <= 60 && expiryDays >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200", children: [
                expiryDays,
                "d"
              ] }),
              expiryDays !== null && expiryDays < 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200", children: "Expired" })
            ] })
          ] }),
          record.renewalDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Annual Renewal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-medium flex items-center gap-1.5 ${renewalDays !== null && renewalDays <= 60 && renewalDays >= 0 ? "text-amber-600" : renewalDays !== null && renewalDays < 0 ? "text-red-600" : ""}`, children: [
              fmt(record.renewalDate),
              renewalDays !== null && renewalDays <= 60 && renewalDays >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200", children: [
                renewalDays,
                "d"
              ] }),
              renewalDays !== null && renewalDays < 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200", children: "Overdue" })
            ] })
          ] })
        ] }),
        record.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/70 mt-2 pt-2 border-t", children: record.notes })
      ] }, record.id);
    }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Certifier Registration Detail" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifier })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: STATUS_LABELS[viewRecord.status] ?? viewRecord.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scope / Enterprise" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.scope || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certificateNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Operator Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.operatorNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certification Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.certificationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Annual Renewal Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.renewalDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.expiryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: adding || !!editRecord, onOpenChange: (v) => {
      if (!v) {
        setAdding(false);
        setEditRecord(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Certifier Registration" : "Add Certifier Registration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record one entry per certifying body. Most holdings have one; diversified farms may have more." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        if (editRecord) updateMut.mutate({ ...form, id: editRecord.id });
        else createMut.mutate(form);
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              className: INPUT_CLS,
              value: CERTIFIERS.filter((c) => c !== "Other").includes(form.certifier) ? form.certifier : "Other",
              onChange: (e) => setForm((f) => ({ ...f, certifier: e.target.value })),
              children: CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c === "Other" ? "Other (please specify)" : c }, c))
            }
          ),
          (form.certifier === "Other" || form.certifier && !CERTIFIERS.filter((c) => c !== "Other").includes(form.certifier)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: `${INPUT_CLS} mt-1`,
              value: form.certifier === "Other" ? "" : form.certifier,
              onChange: (e) => setForm((f) => ({ ...f, certifier: e.target.value || "Other" })),
              placeholder: "Please specify certifying body…",
              autoFocus: form.certifier === "Other"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope / Enterprise" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, value: form.scope, onChange: (e) => setForm((f) => ({ ...f, scope: e.target.value })), children: CERT_SCOPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: "Which enterprises or activities this certifying body covers for your holding." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farm Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, value: form.status, onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })), children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUS_LABELS[s] }, s)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, value: form.certificateNumber, onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, value: form.operatorNumber, onChange: (e) => setForm((f) => ({ ...f, operatorNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.certificationDate, onChange: (e) => setForm((f) => ({ ...f, certificationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Renewal Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: INPUT_CLS, value: form.renewalDate, onChange: (e) => setForm((f) => ({ ...f, renewalDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Certificate Expiry Date ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40 font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: "The date on which the certificate itself expires, if different from the annual renewal date." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editRecord ? updateMut : createMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setAdding(false);
            setEditRecord(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: (editRecord ? updateMut : createMut).isPending || !form.certifier, children: [
            (editRecord ? updateMut : createMut).isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
            editRecord ? "Save Changes" : "Add Registration"
          ] })
        ] })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setDeleteId(null);
      deleteMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Certifier Registration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will permanently remove this certifier registration from your holding records. Are you sure?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to remove — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteMut.mutate(deleteId), children: [
          deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
          "Remove"
        ] })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        defaultTitle: raiseTaskFor.title,
        defaultDescription: raiseTaskFor.description,
        defaultDueDate: raiseTaskFor.dueDate,
        taskType: "compliance_fix",
        module: "Organic Compliance",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    )
  ] });
}
const EMPTY_FIELD = { fieldId: null, fieldName: "", status: "conventional", conversionStartDate: "", certificationDate: "", certifierRef: "", parallelProduction: false, notes: "" };
function FieldsTab({ farmId, farmName }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_FIELD);
  const { data, isLoading } = useQuery({
    queryKey: ["organic-fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/fields`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const { data: fieldsData } = useQuery({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.ok ? r.json() : { records: [] })
  });
  const farmFields = (fieldsData?.records ?? []).map((f) => ({ id: f.id, name: f.name, areaHectares: f.areaHectares }));
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/organic/fields`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-fields", farmId] });
      setFormOpen(false);
      setForm(EMPTY_FIELD);
      toast({ title: "Field saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-fields", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FIELD);
      toast({ title: "Field updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-fields", farmId] });
      setDeleteId(null);
      toast({ title: "Field removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({ fieldId: r.fieldId ?? null, fieldName: r.fieldName, status: r.status, conversionStartDate: r.conversionStartDate ?? "", certificationDate: r.certificationDate ?? "", certifierRef: r.certifierRef ?? "", parallelProduction: r.parallelProduction, notes: r.notes ?? "" });
    setFormOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateM.mutate({ id: editing.id, body: form });
    } else {
      createM.mutate(form);
    }
  }
  const certified = records.filter((r) => r.status === "certified");
  const converting = records.filter((r) => r.status === "in-conversion");
  const conventional = records.filter((r) => r.status === "conventional");
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 inline-block" }),
            certified.length,
            " certified"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 inline-block" }),
            converting.length,
            " in conversion"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-gray-400 inline-block" }),
            conventional.length,
            " conventional"
          ] })
        ] }),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printFieldStatusRegister(records, farmName), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            "Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadFieldStatusCsv(records, farmName), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Export CSV"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm(EMPTY_FIELD);
        setFormOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Add Field"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "No fields recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Add your fields to track organic status and conversion progress." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      converting.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2", children: "In Conversion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: converting.map((r) => {
          const pct = conversionProgress(r.conversionStartDate);
          const expDate = r.conversionStartDate ? expectedCertDate(r.conversionStartDate) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.fieldName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-200", children: "In Conversion" }),
                r.parallelProduction && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200", children: "Parallel production" })
              ] }),
              r.conversionStartDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-foreground/60 mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Conversion started ",
                    fmt(r.conversionStartDate)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    pct,
                    "% complete",
                    expDate ? ` · cert. eligible ${expDate}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-amber-500 rounded-full transition-all", style: { width: `${pct}%` } }) })
              ] }),
              r.certifierRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1", children: [
                "Ref: ",
                r.certifierRef
              ] }),
              r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: r.notes })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
            ] })
          ] }) }, r.id);
        }) })
      ] }),
      certified.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2", children: "Certified Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: certified.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.fieldName }),
                r.certificationDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-foreground/60 ml-2", children: [
                  "Since ",
                  fmt(r.certificationDate)
                ] }),
                r.certifierRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/40 ml-2", children: [
                  "· ",
                  r.certifierRef
                ] }),
                r.parallelProduction && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 ml-2", children: "Parallel production" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-2 pl-8", children: r.notes })
        ] }, r.id)) })
      ] }),
      conventional.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2", children: "Conventional" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: conventional.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.fieldName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs ml-2 px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200", children: "Conventional" }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: r.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
          ] })
        ] }) }, r.id)) })
      ] })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Field Status" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Field Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fieldName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: STATUS_LABELS[viewRecord.status] ?? viewRecord.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conversion Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.conversionStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certified From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.certificationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Parallel Production" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.parallelProduction ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (v) => {
      setFormOpen(v);
      if (!v) {
        setEditing(null);
        createM.reset();
        updateM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Field" : "Add Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record the organic status of this field." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FieldPicker,
            {
              farmFields,
              fieldId: form.fieldId,
              fieldName: form.fieldName,
              onFieldChange: (id, name) => setForm((f) => ({ ...f, fieldId: id, fieldName: name }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, required: true, value: form.status, onChange: (e) => setForm((f) => ({ ...f, status: e.target.value })), children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: STATUS_LABELS[s] }, s)) })
        ] }),
        form.status === "in-conversion" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.conversionStartDate, onChange: (e) => setForm((f) => ({ ...f, conversionStartDate: e.target.value })) })
        ] }),
        form.status === "certified" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certified From" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.certificationDate, onChange: (e) => setForm((f) => ({ ...f, certificationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, placeholder: "e.g. SA-2024-F001", value: form.certifierRef, onChange: (e) => setForm((f) => ({ ...f, certifierRef: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "parallel", checked: form.parallelProduction, onChange: (e) => setForm((f) => ({ ...f, parallelProduction: e.target.checked })), className: "rounded border-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parallel", children: "Parallel production (part-organic, part-conventional enterprise)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateM : createM, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createM.isPending || updateM.isPending || !form.fieldName.trim(), children: [
            createM.isPending || updateM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
            "Save"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        deleteM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Remove this field from the organic register? This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteM, message: "Failed to remove — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: deleteM.isPending, onClick: () => deleteId && deleteM.mutate(deleteId), children: [
          deleteM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
          "Remove"
        ] })
      ] })
    ] }) })
  ] });
}
const EMPTY_INSP = { certifier: "Soil Association", inspectorName: "", inspectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), outcome: "Pass", certificateReference: "", nextDueDate: "", nonConformances: "", actions: "", notes: "" };
function InspectionsTab({ farmId, farmName }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_INSP);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-inspections", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear()) });
  const { data, isLoading } = useQuery({
    queryKey: ["organic-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/inspections`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const filteredRecords = reactExports.useMemo(
    () => yearFilter === "all" ? records : records.filter((r) => r.inspectionDate && new Date(r.inspectionDate).getFullYear() === Number(yearFilter)),
    [records, yearFilter]
  );
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/organic/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] });
      setFormOpen(false);
      setForm(EMPTY_INSP);
      toast({ title: "Inspection recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_INSP);
      toast({ title: "Inspection updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] });
      setDeleteId(null);
      toast({ title: "Inspection deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({ certifier: r.certifier, inspectorName: r.inspectorName ?? "", inspectionDate: r.inspectionDate?.slice(0, 10) ?? "", outcome: r.outcome, certificateReference: r.certificateReference ?? "", nextDueDate: r.nextDueDate ?? "", nonConformances: r.nonConformances ?? "", actions: r.actions ?? "", notes: r.notes ?? "" });
    setFormOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateM.mutate({ id: editing.id, body: form });
    } else {
      createM.mutate(form);
    }
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-9 rounded-xl border-2 border-border bg-transparent px-3 text-sm",
            value: yearFilter,
            onChange: (e) => setYearFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
              yearRange().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        filteredRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printInspectionRegister(filteredRecords, farmName, yearFilter === "all" ? null : Number(yearFilter)), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            "Print Register"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadInspectionsCsv(filteredRecords, farmName, yearFilter === "all" ? null : Number(yearFilter)), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Export CSV"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditing(null);
        setForm(EMPTY_INSP);
        setFormOpen(true);
      }, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Add Inspection"
      ] })
    ] }),
    filteredRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: records.length === 0 ? "No inspections recorded" : `No inspections recorded for ${yearFilter}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Record your annual certifier inspection visits here to keep a local evidence trail alongside your certifier's portal." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredRecords.map((r) => {
      const nextDays = daysUntil(r.nextDueDate);
      const outcomeColor = OUTCOME_COLORS[r.outcome] ?? "text-gray-700 bg-gray-50 border-gray-200";
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-foreground/40 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: fmt(r.inspectionDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/60", children: r.certifier }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${outcomeColor}`, children: r.outcome })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/60 space-y-0.5", children: [
            r.inspectorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Inspector: ",
              r.inspectorName
            ] }),
            r.certificateReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Certificate ref: ",
              r.certificateReference
            ] }),
            r.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `flex items-center gap-1 ${nextDays !== null && nextDays <= 60 ? "text-amber-600 font-medium" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5" }),
              "Next due: ",
              fmt(r.nextDueDate),
              nextDays !== null && nextDays <= 60 && nextDays >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200", children: [
                nextDays,
                "d"
              ] }),
              nextDays !== null && nextDays < 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200", children: "Overdue" })
            ] }),
            r.nonConformances && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-orange-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Non-conformances:" }),
              " ",
              r.nonConformances
            ] }),
            r.actions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Actions:" }),
              " ",
              r.actions
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DocAttach,
              {
                farmId,
                endpoint: "organic/inspections",
                recordId: r.id,
                documentPath: r.documentPath,
                documentName: r.documentName,
                queryKey: ["organic-inspections", String(farmId)]
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          r.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "Raise task", onClick: () => setRaiseTaskFor({ title: `Organic Inspection Due — ${r.certifier}`, description: `The next annual organic inspection by ${r.certifier} is due. Contact your certifying body to schedule and confirm the visit.`, dueDate: r.nextDueDate ?? void 0 }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-4 h-4 text-amber-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }) }, r.id);
    }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Organic Inspection" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inspection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.inspectionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certifier ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Inspector Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.inspectorName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.outcome ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certificateReference ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Inspection Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.nextDueDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Non-Conformances" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.nonConformances ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.actions ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (v) => {
      setFormOpen(v);
      if (!v) {
        setEditing(null);
        createM.reset();
        updateM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Inspection" : "Record Inspection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log your annual certifier inspection visit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, value: form.certifier, onChange: (e) => setForm((f) => ({ ...f, certifier: e.target.value })), children: CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), required: true, value: form.inspectionDate, onChange: (e) => setForm((f) => ({ ...f, inspectionDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, value: form.inspectorName, onChange: (e) => setForm((f) => ({ ...f, inspectorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, value: form.outcome, onChange: (e) => setForm((f) => ({ ...f, outcome: e.target.value })), children: OUTCOMES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, placeholder: "e.g. SA-2024-12345", value: form.certificateReference, onChange: (e) => setForm((f) => ({ ...f, certificateReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), className: INPUT_CLS, value: form.nextDueDate, onChange: (e) => setForm((f) => ({ ...f, nextDueDate: e.target.value })) })
          ] })
        ] }),
        (form.outcome.includes("Non-conformance") || form.outcome.includes("Suspension")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Non-Conformances Identified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.nonConformances, onChange: (e) => setForm((f) => ({ ...f, nonConformances: e.target.value })), rows: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Required" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actions, onChange: (e) => setForm((f) => ({ ...f, actions: e.target.value })), rows: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateM : createM, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createM.isPending || updateM.isPending, children: [
            createM.isPending || updateM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
            "Save"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        deleteM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Inspection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Delete this inspection record? This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteM, message: "Failed to delete — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: deleteM.isPending, onClick: () => deleteId && deleteM.mutate(deleteId), children: [
          deleteM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
          "Delete"
        ] })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        defaultTitle: raiseTaskFor.title,
        defaultDescription: raiseTaskFor.description,
        defaultDueDate: raiseTaskFor.dueDate,
        taskType: "compliance_fix",
        module: "Organic Compliance",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    )
  ] });
}
const ANNEX_I_INPUTS = [
  { substance: "Farmyard Manure (FYM) — composted or well-rotted", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Composted Plant & Animal Material", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Green Manure / Cover Crop Residue", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Slurry (composted; restricted from non-organic units)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Straw / Crop Residues", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dried Blood (Blood Meal)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bone Meal / Steamed Bone Flour", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Hoof & Horn Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Feather Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Fish Meal / Fish Emulsion", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Calcified Seaweed (Lithothamnium)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Extract (liquid)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Rock Phosphate (soft / reactive)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Basic Slag", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Potassium Sulphate (natural mineral extraction, low chloride)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Kieserite (Magnesium Sulphate, natural mineral)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vinasse (potassium-rich molasses by-product)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Wood Ash (from untreated wood only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Leonardite / Humic Acid Product", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Ground Limestone / Calcium Carbonate", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dolomitic Limestone / Magnesium Limestone", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Gypsum (natural calcium sulphate)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Elemental Sulphur", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Borax / Boron Product", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Zinc Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Manganese Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Iron Chelate / Iron Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Molybdenum Product (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bentonite / Clay Minerals", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Peat (growing media only, not direct soil application)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vermiculite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Perlite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Certified Organic Seed", autoType: "Seed Treatment" },
  { substance: "Untreated Conventional Seed (derogation required)", autoType: "Seed Treatment" },
  { substance: "Potassium Permanganate (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Calcium Hydroxide / Slaked Lime (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Hydrogen Peroxide (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Peracetic Acid (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Sodium Hypochlorite (disinfection of equipment only)", autoType: "Cleaning & Disinfection" }
];
function SubstancePicker({
  options,
  value,
  onSelect,
  placeholder
}) {
  const inList = options.some((o) => o.substance === value);
  const [showCustom, setShowCustom] = reactExports.useState(!inList && value !== "");
  const selectValue = inList ? value : showCustom || value !== "" ? "__other__" : "";
  function handleSelect(val) {
    if (val === "__other__") {
      setShowCustom(true);
      onSelect("", "");
    } else if (val === "") {
      setShowCustom(false);
      onSelect("", "");
    } else {
      const opt = options.find((o) => o.substance === val);
      if (opt) {
        setShowCustom(false);
        onSelect(opt.substance, opt.autoType);
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: selectValue, onChange: (e) => handleSelect(e.target.value), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select approved substance…" }),
      options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.substance, children: o.substance }, o.substance)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other__", children: "Other / specify below" })
    ] }),
    (showCustom || selectValue === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        className: INPUT_CLS,
        required: true,
        placeholder,
        value: inList ? "" : value,
        onChange: (e) => onSelect(e.target.value, ""),
        autoFocus: true
      }
    )
  ] });
}
const APPROVAL_STATUS_LABELS = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required"
};
const APPROVAL_STATUS_COLORS = {
  permitted: "bg-green-100 text-green-800 border-green-200",
  restricted: "bg-amber-100 text-amber-800 border-amber-200",
  derogation: "bg-red-100 text-red-800 border-red-200"
};
const INPUT_TYPES = ["Fertiliser / Soil Amendment", "Crop Protection", "Seed Treatment", "Feed Supplement / Additive", "Cleaning & Disinfection", "Other"];
const QUANTITY_UNITS = ["kg", "g", "tonnes", "L", "mL", "bags", "units", "other"];
function yearRange() {
  const y = (/* @__PURE__ */ new Date()).getFullYear();
  return [y + 1, y, y - 1, y - 2, y - 3, y - 4];
}
function SupplierCombobox({ suppliers, value, valueId, onChange }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          role: "combobox",
          type: "button",
          className: "flex-1 justify-between font-normal text-left h-12 px-3 rounded-xl border-2 border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: value ? "text-foreground" : "text-muted-foreground", children: value || "Search Trade Contacts…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-80 p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search suppliers…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No supplier found in Trade Contacts." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandItem, { value: s.name, onSelect: () => {
            onChange(s.id, s.name);
            setOpen(false);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: `mr-2 h-4 w-4 ${valueId === s.id ? "opacity-100" : "opacity-0"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: s.name }),
              s.accountNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Acct: ",
                s.accountNumber
              ] })
            ] })
          ] }, s.id)) })
        ] })
      ] }) })
    ] }),
    (value || valueId !== null) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        onClick: () => onChange(null, ""),
        className: "px-2 h-12 text-muted-foreground hover:text-destructive",
        title: "Clear supplier",
        children: "×"
      }
    )
  ] });
}
function derogationStatus(r) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  if (r.derogationExpiryDate) {
    const expiry = new Date(r.derogationExpiryDate);
    expiry.setHours(0, 0, 0, 0);
    if (expiry < today) return "expired";
    if (r.certifierApprovalRef && r.certifierApprovalRef.trim() !== "") return "active";
    return "pending";
  }
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const year = r.cropYear ?? (r.dateOfUse ? new Date(r.dateOfUse).getFullYear() : null);
  if (year !== null && year < currentYear) return "expired";
  if (r.certifierApprovalRef && r.certifierApprovalRef.trim() !== "") return "active";
  return "pending";
}
const DEROGATION_FILTER_LABELS = {
  active: "Active",
  expired: "Expired",
  pending: "Pending",
  all: "All"
};
function RestrictedInputsTab({ farmId, farmName }) {
  const [statusFilterRaw, setStatusFilter] = usePersistedFilter({
    page: "organic-restricted-inputs",
    filter: "derogation-status",
    farmId,
    defaultValue: "active"
  });
  const statusFilter = statusFilterRaw;
  const { data, isLoading } = useQuery({
    queryKey: ["organic-inputs", farmId, "all"],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/inputs`).then((r) => r.json())
  });
  const allRecords = data?.records ?? [];
  const restrictedRecords = allRecords.filter((r) => r.approvalStatus === "restricted" || r.approvalStatus === "derogation");
  const records = reactExports.useMemo(
    () => statusFilter === "all" ? restrictedRecords : restrictedRecords.filter((r) => derogationStatus(r) === statusFilter),
    [restrictedRecords, statusFilter]
  );
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-amber-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Restricted & derogation inputs — read-only audit view" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-800", children: [
        "This view shows all inputs from the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Input Register" }),
        " that have Restricted or Derogation status — for easy inspection and printing. To add or edit a restricted input, use the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Input Register" }),
        " tab and set the approval status accordingly."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/60 shrink-0", children: "Derogation status:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["active", "pending", "expired", "all"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusFilter(f),
            className: `px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${statusFilter === f ? f === "active" ? "bg-green-600 text-white border-green-600" : f === "expired" ? "bg-gray-500 text-white border-gray-500" : f === "pending" ? "bg-amber-500 text-white border-amber-500" : "bg-foreground text-background border-foreground" : "bg-transparent text-foreground/70 border-border hover:bg-muted"}`,
            children: DEROGATION_FILTER_LABELS[f]
          },
          f
        )) })
      ] }),
      records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportRestrictedInputsCsv(records, farmName, statusFilter), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printRestrictedInputsLog(records, farmName), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          "Print"
        ] })
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-10 h-10 mx-auto mb-3 text-amber-500 opacity-50" }),
      statusFilter === "all" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "No restricted or derogation inputs recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "When you add an input in the Input Register with Restricted or Derogation status, it will appear here for audit review." })
      ] }) : statusFilter === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "No active derogations this season" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/60", children: [
          "Active derogations are inputs with a certifier approval reference logged for the current crop year. Switch to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "All" }),
          " to see every record."
        ] })
      ] }) : statusFilter === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "No pending derogations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/60", children: [
          "Pending derogations are restricted inputs awaiting a certifier approval reference. Switch to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "All" }),
          " to see every record."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "No expired derogations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground/60", children: [
          "Expired derogations are inputs recorded in a previous crop year. Switch to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "All" }),
          " to see every record."
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4 text-amber-500 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: r.productName }),
        r.inputType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60 bg-secondary px-2 py-0.5 rounded-full", children: r.inputType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${APPROVAL_STATUS_COLORS[r.approvalStatus] ?? APPROVAL_STATUS_COLORS.permitted}`, children: APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus }),
        r.certifierNotified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
          "Certifier notified"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200", children: "Certifier not yet notified" }),
        r.derogationExpiryDate && (() => {
          const d = daysUntil(r.derogationExpiryDate);
          if (d !== null && d < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-300", children: [
            "Expired ",
            fmt(r.derogationExpiryDate)
          ] });
          if (d !== null && d <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-300 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
            "Expires ",
            fmt(r.derogationExpiryDate)
          ] });
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200", children: [
            "Expires ",
            fmt(r.derogationExpiryDate)
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/60 space-y-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-3 flex-wrap", children: [
          r.dateOfUse && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Applied: ",
            fmt(r.dateOfUse)
          ] }),
          r.fieldName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Field: ",
            r.fieldName
          ] }),
          r.appliedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "By: ",
            r.appliedBy
          ] })
        ] }),
        r.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/80", children: "Justification:" }),
          " ",
          r.justification
        ] }),
        r.certifierApprovalRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Certifier approval ref: ",
          r.certifierApprovalRef
        ] }),
        (r.supplier || r.poReference) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
          r.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Supplier: ",
            r.supplier
          ] }),
          r.poReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· PO: ",
            r.poReference
          ] }),
          r.grnReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· GRN: ",
            r.grnReference
          ] })
        ] })
      ] })
    ] }) }, r.id)) })
  ] });
}
const EMPTY_ORG_INPUT = {
  fieldId: null,
  fieldName: "",
  productName: "",
  inputType: "",
  supplier: "",
  poReference: "",
  grnReference: "",
  approvalStatus: "permitted",
  certifierApprovalRef: "",
  cropYear: (/* @__PURE__ */ new Date()).getFullYear(),
  dateOfUse: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  quantityAmount: "",
  quantityUnit: "kg",
  justification: "",
  certifierNotified: false,
  appliedBy: "",
  derogationExpiryDate: "",
  notes: ""
};
function InputRegisterTab({ farmId, farmName }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_ORG_INPUT);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-input-register", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear()) });
  const [approvalStatusFilter, setApprovalStatusFilter] = usePersistedFilter({ page: "organic-input-register", filter: "approval-status", farmId, defaultValue: "all" });
  const [supplierIdFilter, setSupplierIdFilter] = reactExports.useState(null);
  const [poIdFilter, setPoIdFilter] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["organic-inputs", farmId, yearFilter],
    queryFn: () => {
      const url = yearFilter === "all" ? `/api/farms/${farmId}/organic/inputs` : `/api/farms/${farmId}/organic/inputs?cropYear=${yearFilter}`;
      return fetch(url).then((r) => r.json());
    }
  });
  const records = data?.records ?? [];
  const { data: fieldsData } = useQuery({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.ok ? r.json() : { records: [] })
  });
  const farmFields = (fieldsData?.records ?? []).map((f) => ({ id: f.id, name: f.name, areaHectares: f.areaHectares }));
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const suppliers = suppliersData ?? [];
  const { data: posData } = useQuery({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const allPOs = posData ?? [];
  const { data: grnsData } = useQuery({
    queryKey: ["stock-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries`).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const allGRNs = grnsData ?? [];
  const filteredPOs = reactExports.useMemo(
    () => supplierIdFilter ? allPOs.filter((p) => p.supplierId === supplierIdFilter) : allPOs,
    [allPOs, supplierIdFilter]
  );
  const filteredGRNs = reactExports.useMemo(
    () => poIdFilter ? allGRNs.filter((g) => g.poId === poIdFilter) : supplierIdFilter ? allGRNs.filter((g) => g.supplierId === supplierIdFilter) : allGRNs,
    [allGRNs, poIdFilter, supplierIdFilter]
  );
  const createM = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/organic/inputs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] });
      setFormOpen(false);
      setForm(EMPTY_ORG_INPUT);
      toast({ title: "Input recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/organic/inputs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] });
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_ORG_INPUT);
      toast({ title: "Input updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteM = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/organic/inputs/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] });
      setDeleteId(null);
      toast({ title: "Input deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openEdit(r) {
    setEditing(r);
    setForm({
      fieldId: r.fieldId ?? null,
      fieldName: r.fieldName ?? "",
      productName: r.productName,
      inputType: r.inputType ?? "",
      supplier: r.supplier ?? "",
      poReference: r.poReference ?? "",
      grnReference: r.grnReference ?? "",
      approvalStatus: r.approvalStatus,
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      cropYear: r.cropYear ?? (/* @__PURE__ */ new Date()).getFullYear(),
      dateOfUse: r.dateOfUse?.slice(0, 10) ?? "",
      quantityAmount: r.quantityAmount ?? "",
      quantityUnit: r.quantityUnit ?? "kg",
      justification: r.justification ?? "",
      certifierNotified: r.certifierNotified,
      appliedBy: r.appliedBy ?? "",
      derogationExpiryDate: r.derogationExpiryDate?.slice(0, 10) ?? "",
      notes: r.notes ?? ""
    });
    const matchedSupplier = suppliers.find((s) => s.name === (r.supplier ?? ""));
    setSupplierIdFilter(matchedSupplier?.id ?? null);
    const matchedPO = allPOs.find((p) => p.poNumber === (r.poReference ?? ""));
    setPoIdFilter(matchedPO?.id ?? null);
    setFormOpen(true);
  }
  function openCreate() {
    setEditing(null);
    setForm(EMPTY_ORG_INPUT);
    setSupplierIdFilter(null);
    setPoIdFilter(null);
    setFormOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateM.mutate({ id: editing.id, body: form });
    } else {
      createM.mutate(form);
    }
  }
  const permitted = records.filter((r) => r.approvalStatus === "permitted").length;
  const restricted = records.filter((r) => r.approvalStatus === "restricted").length;
  const derogation = records.filter((r) => r.approvalStatus === "derogation").length;
  const filteredRecords = reactExports.useMemo(
    () => approvalStatusFilter === "all" ? records : records.filter((r) => r.approvalStatus === approvalStatusFilter),
    [records, approvalStatusFilter]
  );
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-sm space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center text-green-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Input register — arable, horticultural & general farm inputs" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-800", children: [
        "Record all permitted, restricted, and derogated inputs applied to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "arable crops, general organic land, or shared farm infrastructure" }),
        " — fertilisers, crop protection, seed treatments, and cleaning products. This is your evidence register for annual certifier inspection."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-green-700 space-y-1 text-xs border-t border-green-200 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-0.5", children: "Other sectors have their own dedicated input logs — record in the correct place to avoid duplication:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "→ ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Vineyard inputs" }),
          " (including restricted & derogated products) — use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Viticulture → Organic Inputs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "→ ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fresh produce inputs" }),
          " — use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Fresh Produce → Input Log" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "→ ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Livestock & dairy feed records" }),
          " — use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Livestock → Feed Records" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-9 rounded-xl border-2 border-border bg-transparent px-3 text-sm",
            value: yearFilter,
            onChange: (e) => setYearFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
              yearRange().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-9 rounded-xl border-2 border-border bg-transparent px-3 text-sm",
            value: approvalStatusFilter,
            onChange: (e) => setApprovalStatusFilter(e.target.value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All statuses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "permitted", children: "Permitted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "restricted", children: "Restricted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "derogation", children: "Derogation" })
            ]
          }
        ),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-sm pl-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 inline-block" }),
              permitted,
              " permitted"
            ] }),
            restricted > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 inline-block" }),
              restricted,
              " restricted"
            ] }),
            derogation > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 inline-block" }),
              derogation,
              " derogation"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => downloadInputRegisterCsv(filteredRecords, farmName, yearFilter === "all" ? null : Number(yearFilter), approvalStatusFilter), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Export CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => printInputRegister(filteredRecords, farmName, yearFilter === "all" ? null : Number(yearFilter)), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
            "Print Register"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Add Input"
      ] })
    ] }),
    filteredRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-1", children: [
        "No inputs recorded",
        yearFilter !== "all" ? ` for ${yearFilter}` : "",
        approvalStatusFilter !== "all" ? ` with status "${APPROVAL_STATUS_LABELS[approvalStatusFilter] ?? approvalStatusFilter}"` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Log every input used on organic land — this is your evidence register for annual inspection." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredRecords.map((r) => {
      const statusColor = APPROVAL_STATUS_COLORS[r.approvalStatus] ?? APPROVAL_STATUS_COLORS.permitted;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: r.productName }),
            r.inputType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/60 bg-secondary px-2 py-0.5 rounded-full", children: r.inputType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`, children: APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/60 space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-3 flex-wrap", children: [
              r.dateOfUse && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(r.dateOfUse) }),
              r.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Supplier: ",
                r.supplier
              ] }),
              r.fieldName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Field: ",
                r.fieldName
              ] }),
              r.quantityAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Qty: ",
                r.quantityAmount,
                r.quantityUnit ? ` ${r.quantityUnit}` : ""
              ] })
            ] }),
            (r.poReference || r.grnReference) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
              r.poReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "PO: ",
                r.poReference
              ] }),
              r.grnReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "· GRN: ",
                r.grnReference
              ] })
            ] }),
            (r.approvalStatus === "restricted" || r.approvalStatus === "derogation") && r.certifierApprovalRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Certifier ref: ",
              r.certifierApprovalRef
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: () => setDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }) }, r.id);
    }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Input Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.productName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Input Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.inputType || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.supplier || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approval Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: APPROVAL_STATUS_LABELS[viewRecord.approvalStatus] ?? viewRecord.approvalStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.poReference || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "GRN / Delivery Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.grnReference || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierApprovalRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Derogation Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.derogationExpiryDate ? fmt(viewRecord.derogationExpiryDate) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crop Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.cropYear ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date of Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.dateOfUse) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Field / Area" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fieldName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quantityAmount ? `${viewRecord.quantityAmount}${viewRecord.quantityUnit ? " " + viewRecord.quantityUnit : ""}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Applied By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.appliedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.certifierNotified ? "Yes" : "No" })
        ] }),
        viewRecord.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.justification })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes || "—" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (v) => {
      setFormOpen(v);
      if (!v) {
        setEditing(null);
        createM.reset();
        updateM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Input Record" : "Add Input" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record an input used on organic land for your evidence register." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Substance / Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SubstancePicker,
            {
              options: ANNEX_I_INPUTS,
              value: form.productName,
              onSelect: (substance, autoType) => setForm((f) => ({
                ...f,
                productName: substance,
                inputType: autoType || f.inputType
              })),
              placeholder: "e.g. Calcified seaweed, compost, product trade name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: form.inputType, onChange: (e) => setForm((f) => ({ ...f, inputType: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
              INPUT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SupplierCombobox,
              {
                suppliers,
                value: form.supplier,
                valueId: supplierIdFilter,
                onChange: (id, name) => {
                  setSupplierIdFilter(id);
                  setPoIdFilter(null);
                  setForm((f) => ({ ...f, supplier: name, poReference: "", grnReference: "" }));
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purchase Order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: form.poReference, onChange: (e) => {
              const poNum = e.target.value;
              const po = allPOs.find((p) => p.poNumber === poNum);
              setPoIdFilter(po?.id ?? null);
              setForm((f) => ({ ...f, poReference: poNum, grnReference: "" }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— None —" }),
              filteredPOs.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.poNumber, children: [
                p.poNumber,
                p.orderDate ? ` · ${fmt(p.orderDate)}` : ""
              ] }, p.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN / Delivery Note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: form.grnReference, onChange: (e) => setForm((f) => ({ ...f, grnReference: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— None —" }),
              filteredGRNs.filter((g) => g.grnNumber).map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: g.grnNumber, children: [
                g.grnNumber,
                g.deliveryDate ? ` · ${fmt(g.deliveryDate)}` : ""
              ] }, g.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Status *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: INPUT_CLS, value: form.approvalStatus, onChange: (e) => setForm((f) => ({ ...f, approvalStatus: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "permitted", children: "Permitted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "restricted", children: "Restricted (notify certifier)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "derogation", children: "Derogation Required" })
            ] })
          ] }),
          (form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, value: form.certifierApprovalRef, onChange: (e) => setForm((f) => ({ ...f, certifierApprovalRef: e.target.value })) })
          ] })
        ] }),
        (form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Derogation Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, value: form.derogationExpiryDate, onChange: (e) => setForm((f) => ({ ...f, derogationExpiryDate: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "The date this derogation approval expires, as stated on the certifier's approval letter. When set, the Active/Expired filter uses this date instead of the crop year." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: INPUT_CLS, value: form.cropYear, onChange: (e) => setForm((f) => ({ ...f, cropYear: parseInt(e.target.value) })), children: yearRange().map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date of Use" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: INPUT_CLS, max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.dateOfUse, onChange: (e) => setForm((f) => ({ ...f, dateOfUse: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FieldPicker,
              {
                farmFields,
                fieldId: form.fieldId,
                fieldName: form.fieldName,
                onFieldChange: (id, name) => setForm((f) => ({ ...f, fieldId: id, fieldName: name }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, placeholder: "Amount", value: form.quantityAmount, onChange: (e) => setForm((f) => ({ ...f, quantityAmount: e.target.value })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-12 rounded-xl border-2 border-border bg-transparent px-2 text-sm", value: form.quantityUnit, onChange: (e) => setForm((f) => ({ ...f, quantityUnit: e.target.value })), children: QUANTITY_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u, children: u }, u)) })
            ] })
          ] })
        ] }),
        form.approvalStatus !== "permitted" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { required: true, value: form.justification, onChange: (e) => setForm((f) => ({ ...f, justification: e.target.value })), rows: 2, placeholder: "Explain why this restricted/derogated input is necessary…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applied By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: INPUT_CLS, value: form.appliedBy, onChange: (e) => setForm((f) => ({ ...f, appliedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "certNotifiedInput", checked: form.certifierNotified, onChange: (e) => setForm((f) => ({ ...f, certifierNotified: e.target.checked })), className: "rounded border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "certNotifiedInput", children: "Certifier has been notified of this use" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editing ? updateM : createM, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setFormOpen(false);
            setEditing(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createM.isPending || updateM.isPending || !form.productName.trim(), children: [
            createM.isPending || updateM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
            "Save"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (v) => {
      if (!v) {
        setDeleteId(null);
        deleteM.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Input" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Delete this input record? This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteM, message: "Failed to delete — the record is still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: deleteM.isPending, onClick: () => deleteId && deleteM.mutate(deleteId), children: [
          deleteM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : null,
          "Delete"
        ] })
      ] })
    ] }) })
  ] });
}
const TABS = ["certification", "fields", "inspections", "restricted-inputs", "input-register"];
const TAB_LABELS = {
  certification: "Certification",
  fields: "Field Status",
  inspections: "Inspections",
  "restricted-inputs": "Restricted Inputs",
  "input-register": "Input Register"
};
const TAB_ICONS = {
  certification: Leaf,
  fields: BookOpen,
  inspections: ShieldCheck,
  "restricted-inputs": FlaskConical,
  "input-register": ClipboardList
};
function OrganicPage() {
  const { farmId } = useAppStore();
  const [activeTab, setActiveTab] = usePersistedTab({ page: "organic", farmId, validIds: TABS, defaultTab: "certification", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const [auditPackBusy, setAuditPackBusy] = reactExports.useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.name ?? "Farm";
  async function downloadAuditPack() {
    if (!farmId) return;
    setAuditPackBusy(true);
    try {
      const staleTime = 6e4;
      const [certResult, fieldsResult, inspResult, inputsResult] = await Promise.all([
        qc.fetchQuery({
          queryKey: ["organic-cert", farmId],
          queryFn: () => fetch(`/api/farms/${farmId}/organic/certification`).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          staleTime
        }),
        qc.fetchQuery({
          queryKey: ["organic-fields", farmId],
          queryFn: () => fetch(`/api/farms/${farmId}/organic/fields`).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          staleTime
        }),
        qc.fetchQuery({
          queryKey: ["organic-inspections", farmId],
          queryFn: () => fetch(`/api/farms/${farmId}/organic/inspections`).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          staleTime
        }),
        qc.fetchQuery({
          queryKey: ["organic-inputs", farmId, "all"],
          queryFn: () => fetch(`/api/farms/${farmId}/organic/inputs`).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          staleTime
        })
      ]);
      const restrictedRecords = inputsResult.records.filter(
        (r) => r.approvalStatus === "restricted" || r.approvalStatus === "derogation"
      );
      exportCertificationSummaryCSV(certResult.records, farmName);
      await new Promise((res) => setTimeout(res, 300));
      downloadFieldStatusCsv(fieldsResult.records, farmName);
      await new Promise((res) => setTimeout(res, 300));
      downloadInspectionsCsv(inspResult.records, farmName, null);
      await new Promise((res) => setTimeout(res, 300));
      exportRestrictedInputsCsv(restrictedRecords, farmName, "all");
    } catch {
      toast({
        title: "Could not download audit pack",
        description: "One or more registers failed to load. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAuditPackBusy(false);
    }
  }
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-6 h-6 text-green-600" }),
          "Organic Compliance"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60 mt-1", children: "Complementary records alongside your certifier's portal — Soil Association, OF&G, BDOCA." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: downloadAuditPack,
          disabled: auditPackBusy,
          className: "gap-2 shrink-0 mt-1",
          title: "Download all four compliance registers as separate CSV files",
          children: [
            auditPackBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Download Audit Pack"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabBar, { children: TABS.map((tab) => {
      const Icon = TAB_ICONS[tab];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: activeTab === tab, onClick: () => setActiveTab(tab), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
        TAB_LABELS[tab]
      ] }, tab);
    }) }),
    activeTab === "certification" && /* @__PURE__ */ jsxRuntimeExports.jsx(CertificationTab, { farmId, farmName }),
    activeTab === "fields" && /* @__PURE__ */ jsxRuntimeExports.jsx(FieldsTab, { farmId, farmName }),
    activeTab === "inspections" && /* @__PURE__ */ jsxRuntimeExports.jsx(InspectionsTab, { farmId, farmName }),
    activeTab === "restricted-inputs" && /* @__PURE__ */ jsxRuntimeExports.jsx(RestrictedInputsTab, { farmId, farmName }),
    activeTab === "input-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputRegisterTab, { farmId, farmName })
  ] }) });
}
export {
  OrganicPage as default
};
