import { b as useAppStore, m as useQuery, j as jsxRuntimeExports, a as useToast, c as useQueryClient, r as reactExports, S as useMutation, d as Button, T as Plus, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-Bd-r42pU.js";
import { u as usePersistedTab } from "./use-persisted-tab-CcMnGIzb.js";
import { a as usePersistedFilter } from "./use-persisted-filter-CNQJRFNJ.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-CuvP0bUc.js";
import { S as StaffSelect } from "./staff-select-Clk1Cwva.js";
import { A as AppLayout, g as TreePine, C as CalendarDays } from "./AppLayout-BanleXYV.js";
import { T as Textarea } from "./textarea-Bc-eZ9Pe.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RkUXSykD.js";
import { C as ConfirmDialog } from "./confirm-dialog-BB3eOEwL.js";
import { B as Badge } from "./badge-CY4VEnEu.js";
import { T as TabBar, a as TabButton } from "./tab-button-C7Iwt8bu.js";
import { S as StorageLocationMapPicker } from "./StorageLocationMapPicker-DlUDhBjh.js";
import { R as RecordAttachments } from "./RecordAttachments-B9O6Bg_b.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BJELSPeW.js";
import { P as Printer } from "./printer-7PqXDQma.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-Cu9EpiaP.js";
import { E as Eye } from "./eye-Dzi1eKEl.js";
import { P as Pencil } from "./pencil-DlGbObxa.js";
import { T as Trash2 } from "./trash-2-CzpE_E7W.js";
import { M as MessageSquare } from "./message-square-Bpu8Nb4G.js";
import { C as ClipboardCheck, D as Droplets } from "./shield-alert-DWs-PSsT.js";
import "./use-safe-clerk-CYaLgRwx.js";
import "./database-DVm6kjB5.js";
import "./shield-check-B1cZod9y.js";
import "./tractor-Bmlnur2O.js";
import "./index-5HIDTgSn.js";
import "./index-DHClN1k1.js";
import "./chevron-up-C4Hh87RG.js";
import "./use-upload-DuYZ4b2s.js";
import "./paperclip-Bk8rwuWm.js";
import "./upload-BmetgIyP.js";
import "./image-CM_x2lBt.js";
import "./download-DXjHH8jV.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtAmt = (pence) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};
function StatusBadge({ status }) {
  const map = {
    active: { bg: "#dcfce7", color: "#166534" },
    completed: { bg: "#eff6ff", color: "#1e40af" },
    expired: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#fef3c7", color: "#92400e" }
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }, children: status });
}
function OutcomeBadge({ outcome }) {
  const map = {
    pass: { bg: "#dcfce7", color: "#166534", label: "Pass" },
    advisory: { bg: "#fef3c7", color: "#92400e", label: "Pass with Advisories" },
    fail: { bg: "#fee2e2", color: "#991b1b", label: "Fail" }
  };
  const s = map[outcome] ?? { bg: "#f3f4f6", color: "#374151", label: outcome };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.75rem" }, children: s.label });
}
function FeatureTypeLabel({ type }) {
  const labels = {
    hedgerow: "Hedgerow",
    pond: "Pond",
    woodland: "Woodland",
    wetland: "Wetland",
    grassland: "Grassland",
    wildflower_margin: "Wildflower Margin",
    watercourse: "Watercourse",
    buffer_strip: "Buffer Strip",
    other: "Other"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: labels[type] ?? type });
}
function featureTypeLabel(type) {
  const labels = {
    hedgerow: "Hedgerow",
    pond: "Pond",
    woodland: "Woodland",
    wetland: "Wetland",
    grassland: "Grassland",
    wildflower_margin: "Wildflower Margin",
    watercourse: "Watercourse",
    buffer_strip: "Buffer Strip",
    other: "Other"
  };
  return labels[type] ?? type;
}
function printFeatureRegister(features, schemes, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const rows = features.map((r) => {
    const hasGps = r.latitude && r.longitude;
    return `
      <tr>
        <td>${featureTypeLabel(r.featureType)}</td>
        <td>${r.description || "—"}</td>
        <td>${r.areaHectares != null ? parseFloat(r.areaHectares).toFixed(2) : "—"}</td>
        <td>${r.lengthMetres != null ? parseFloat(r.lengthMetres).toFixed(0) : "—"}</td>
        <td>${r.managementPractice || "—"}</td>
        <td>${hasGps ? `${parseFloat(r.latitude).toFixed(5)}, ${parseFloat(r.longitude).toFixed(5)}` : "—"}</td>
        <td>${new Date(r.dateRecorded).toLocaleDateString("en-GB")}</td>
      </tr>`;
  }).join("");
  const schemeRows = schemes.filter((s) => s.status === "active").map((s) => `
    <tr>
      <td>${s.schemeName}</td>
      <td>${s.agreementNumber || "—"}</td>
      <td>${new Date(s.startDate).toLocaleDateString("en-GB")}</td>
      <td>${s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "Ongoing"}</td>
      <td>${s.annualPaymentPence != null ? `£${(s.annualPaymentPence / 100).toFixed(2)}` : "—"}</td>
    </tr>`).join("");
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Environmental Features Register</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; margin: 20mm; }
  h1 { font-size: 16pt; color: #166534; margin-bottom: 4px; }
  h2 { font-size: 12pt; color: #166534; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px; }
  .meta { font-size: 9pt; color: #555; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 12px; }
  th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .sig-block { margin-top: 40px; }
  .sig-row { display: flex; gap: 40px; margin-top: 24px; }
  .sig-field { flex: 1; }
  .sig-line { border-bottom: 1px solid #333; height: 32px; margin-bottom: 4px; }
  .sig-label { font-size: 9pt; color: #555; }
  .footer { margin-top: 32px; font-size: 8pt; color: #888; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @page { margin: 15mm; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>Environmental Features Register</h1>
<div class="meta">
  Farm reference: Farm ID ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; BDE Farm Trac
</div>

<h2>Environmental Features (${features.length} recorded)</h2>
${features.length === 0 ? "<p>No features recorded.</p>" : `
<table>
  <thead><tr>
    <th>Feature Type</th><th>Description</th><th>Area (ha)</th><th>Length (m)</th>
    <th>Management Practice</th><th>GPS Coordinates</th><th>Date Recorded</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`}

${schemeRows ? `<h2>Active Agri-Environment Schemes</h2>
<table>
  <thead><tr><th>Scheme</th><th>Agreement No.</th><th>Start Date</th><th>End Date</th><th>Annual Payment</th></tr></thead>
  <tbody>${schemeRows}</tbody>
</table>` : ""}

<div class="sig-block">
  <h2>Assessor Sign-off</h2>
  <p style="font-size:9pt; color:#555;">
    I confirm that I have inspected the environmental features listed above and that the records are accurate and 
    consistent with features observed on the farm. This register satisfies the Red Tractor Combinable Crops 
    Standard requirement for an Environmental Features Record.
  </p>
  <div class="sig-row">
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Assessor signature</div>
    </div>
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Assessor name (print)</div>
    </div>
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Organisation</div>
    </div>
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Date of inspection</div>
    </div>
  </div>
  <div class="sig-row">
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Farmer / farm manager signature</div>
    </div>
    <div class="sig-field">
      <div class="sig-line"></div>
      <div class="sig-label">Name (print)</div>
    </div>
    <div class="sig-field" style="flex:2">
      <div class="sig-line"></div>
      <div class="sig-label">Outcome &nbsp;&nbsp; ☐ Pass &nbsp;&nbsp; ☐ Pass with advisories &nbsp;&nbsp; ☐ Fail</div>
    </div>
  </div>
</div>

<div class="footer">
  This document was generated by BDE Farm Trac. Keep a signed copy on file for Red Tractor inspection purposes.
</div>
</body>
</html>`;
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
const CSS_BASE = `
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #111; margin: 20mm; }
  h1 { font-size: 15pt; color: #166534; margin-bottom: 4px; }
  h2 { font-size: 11pt; color: #166534; margin-top: 22px; margin-bottom: 7px; border-bottom: 1px solid #bbf7d0; padding-bottom: 3px; }
  h3 { font-size: 10pt; color: #374151; margin: 14px 0 5px; }
  .meta { font-size: 9pt; color: #555; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 10px; }
  th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge-pass { background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-advisory { background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-fail { background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-active { background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-expired { background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-pending { background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .sig-block { margin-top: 36px; }
  .sig-row { display: flex; gap: 32px; margin-top: 20px; }
  .sig-field { flex: 1; }
  .sig-line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 3px; }
  .sig-label { font-size: 8.5pt; color: #555; }
  .notice { background:#fffbeb; border:1px solid #fde68a; border-radius:5px; padding:7px 10px; font-size:8.5pt; color:#92400e; margin-bottom:12px; }
  .footer { margin-top: 28px; font-size: 8pt; color: #888; border-top: 1px solid #e5e7eb; padding-top: 7px; }
  .store-block { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
  .store-header { font-size: 10.5pt; font-weight: 700; color: #166534; margin-bottom: 6px; }
  @page { margin: 14mm; }
  @media print { body { margin: 0; } }
`;
function openPrintWindow(title, html) {
  const w = window.open("", "_blank", "width=920,height=700");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS_BASE}</style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
function printAssessmentHistory(records, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...records].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  const rows = sorted.map((r) => {
    const badge = r.outcome === "pass" ? "pass" : r.outcome === "advisory" ? "advisory" : "fail";
    const label = r.outcome === "pass" ? "Pass" : r.outcome === "advisory" ? "Pass with Advisories" : "Fail";
    return `<tr>
      <td style="white-space:nowrap">${new Date(r.assessmentDate).toLocaleDateString("en-GB")}</td>
      <td>${r.assessorName || "—"}</td>
      <td>${r.assessorOrganisation || "—"}</td>
      <td><span class="badge-${badge}">${label}</span></td>
      <td>${r.conditions || "—"}</td>
      <td style="white-space:nowrap">${r.nextAssessmentDue ? new Date(r.nextAssessmentDue).toLocaleDateString("en-GB") : "—"}</td>
      <td>${r.notes || "—"}</td>
    </tr>`;
  }).join("");
  const last = sorted[0];
  openPrintWindow("Assessment History Report", `
    <h1>Assessment History Report</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; BDE Farm Trac &nbsp;|&nbsp; ${records.length} record${records.length !== 1 ? "s" : ""}</div>
    <div class="notice"><strong>Red Tractor requirement:</strong> Assessment records must be retained and made available during farm inspections. This report provides a full history of assessor visits, outcomes, and remedial conditions.</div>
    ${last ? `<p style="font-size:9pt"><strong>Most recent assessment:</strong> ${new Date(last.assessmentDate).toLocaleDateString("en-GB")} — ${last.assessorOrganisation || last.assessorName || "unknown"}${last.nextAssessmentDue ? ` &nbsp;|&nbsp; Next due: ${new Date(last.nextAssessmentDue).toLocaleDateString("en-GB")}` : ""}</p>` : ""}
    <h2>Assessment Records (${records.length})</h2>
    ${records.length === 0 ? "<p>No assessment records.</p>" : `
    <table><thead><tr>
      <th>Date</th><th>Assessor</th><th>Organisation</th><th>Outcome</th>
      <th>Conditions / Remedial Actions</th><th>Next Due</th><th>Notes</th>
    </tr></thead><tbody>${rows}</tbody></table>`}
    <div class="sig-block">
      <h2>Inspector Sign-off</h2>
      <div class="sig-row">
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Inspector signature</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Inspector name (print)</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Organisation</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Date</div></div>
      </div>
    </div>
    <div class="footer">Generated by BDE Farm Trac. Retain a signed copy for Red Tractor and assurance body inspection purposes.</div>
  `);
}
const EVENT_TYPE_LABELS = {
  hedge_trimming: "Hedge Trimming",
  hedge_laying: "Hedge Laying",
  hedge_coppicing: "Hedge Coppicing",
  ditch_clearance: "Ditch Clearance",
  pond_management: "Pond Management",
  tree_planting: "Tree Planting",
  grass_cutting: "Grass Cutting",
  grazing_management: "Grazing Management",
  spraying: "Spraying",
  weed_control: "Weed Control",
  soil_sampling: "Soil Sampling",
  water_management: "Water Management",
  wildflower_seeding: "Wildflower Seeding",
  other: "Other"
};
function printManagementEventLog(records, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...records].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  const rows = sorted.map((r) => `<tr>
    <td style="white-space:nowrap">${new Date(r.eventDate).toLocaleDateString("en-GB")}</td>
    <td>${EVENT_TYPE_LABELS[r.eventType] ?? r.eventType ?? "—"}</td>
    <td>${r.featureName || r.featureType || "—"}</td>
    <td>${r.description || "—"}</td>
    <td>${r.contractorUsed ? r.contractorName || "Contractor" : r.operator || "—"}</td>
    <td>${r.fulfilsSchemeObligation ? `Yes${r.schemeName ? ` (${r.schemeName})` : ""}` : "No"}</td>
    <td>${r.followUpActionsNeeded || "—"}</td>
  </tr>`).join("");
  openPrintWindow("Environmental Management Event Log", `
    <h1>Environmental Management Event Log</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; BDE Farm Trac &nbsp;|&nbsp; ${records.length} event${records.length !== 1 ? "s" : ""} recorded</div>
    <div class="notice"><strong>Agri-environment scheme evidence:</strong> Natural England, NatureScot and scheme monitors may request a dated management event log during spot checks. This document provides a dated evidence trail that scheme management obligations are being actively fulfilled.</div>
    <h2>Management Events (${records.length})</h2>
    ${records.length === 0 ? "<p>No management events recorded.</p>" : `
    <table><thead><tr>
      <th>Date</th><th>Event Type</th><th>Feature / Area</th><th>Description of Work</th>
      <th>Operator / Contractor</th><th>Fulfils Scheme Obligation</th><th>Follow-up Actions</th>
    </tr></thead><tbody>${rows}</tbody></table>`}
    <div class="footer">Generated by BDE Farm Trac. This log should be retained for the duration of any agri-environment scheme agreement and for five years after its end.</div>
  `);
}
function printSchemeSummary(records, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const active = records.filter((r) => r.status === "active");
  const totalPence = active.reduce((s, r) => s + (r.annualPaymentPence ?? 0), 0);
  const rows = records.map((r) => {
    const badgeCls = r.status === "active" ? "active" : r.status === "expired" ? "expired" : "pending";
    const label = (r.status || "active").charAt(0).toUpperCase() + (r.status || "active").slice(1);
    return `<tr>
      <td><strong>${r.schemeName}</strong></td>
      <td>${r.agreementNumber || "—"}</td>
      <td style="white-space:nowrap">${r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB") : "—"}</td>
      <td style="white-space:nowrap">${r.endDate ? new Date(r.endDate).toLocaleDateString("en-GB") : "Ongoing"}</td>
      <td><span class="badge-${badgeCls}">${label}</span></td>
      <td>${r.annualPaymentPence != null ? `£${(r.annualPaymentPence / 100).toFixed(2)}` : "—"}</td>
      <td>${r.obligations || "—"}</td>
    </tr>`;
  }).join("");
  openPrintWindow("Agri-Environment Scheme Summary", `
    <h1>Agri-Environment Scheme Summary</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; BDE Farm Trac</div>
    <div style="display:flex;gap:24px;margin-bottom:14px">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 14px;font-size:9pt">
        <div style="color:#6b7280;margin-bottom:2px">Active Schemes</div>
        <div style="font-size:14pt;font-weight:700;color:#1e40af">${active.length}</div>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 14px;font-size:9pt">
        <div style="color:#6b7280;margin-bottom:2px">Total Annual Payment</div>
        <div style="font-size:14pt;font-weight:700;color:#1e40af">£${(totalPence / 100).toFixed(2)}</div>
      </div>
    </div>
    <h2>Scheme Records (${records.length})</h2>
    ${records.length === 0 ? "<p>No scheme records.</p>" : `
    <table><thead><tr>
      <th>Scheme Name</th><th>Agreement No.</th><th>Start Date</th><th>End Date</th>
      <th>Status</th><th>Annual Payment</th><th>Obligations</th>
    </tr></thead><tbody>${rows}</tbody></table>`}
    <div class="footer">Generated by BDE Farm Trac. Keep alongside scheme agreement documents for scheme monitor visits.</div>
  `);
}
function printSFISummary(agreements, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const active = agreements.filter((r) => r.status === "Active");
  const total = active.reduce((s, r) => s + (Number(r.totalAnnualPayment) || 0), 0);
  const rows = agreements.map((r) => {
    const isActive = r.status === "Active";
    return `<tr>
      <td style="font-family:monospace">${String(r.agreementNumber ?? "—")}</td>
      <td style="font-family:monospace">${String(r.applicationReference ?? "—")}</td>
      <td style="white-space:nowrap">${r.startDate ? new Date(r.startDate).toLocaleDateString("en-GB") : "—"}</td>
      <td style="white-space:nowrap">${r.endDate ? new Date(r.endDate).toLocaleDateString("en-GB") : "—"}</td>
      <td><span class="${isActive ? "badge-active" : "badge-pending"}">${String(r.status ?? "—")}</span></td>
      <td>${r.totalAnnualPayment ? `£${Number(r.totalAnnualPayment).toFixed(2)}` : "—"}</td>
    </tr>`;
  }).join("");
  openPrintWindow("SFI / ELMs Agreements Summary", `
    <h1>SFI / ELMs Actions &amp; Agreements</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; BDE Farm Trac &nbsp;|&nbsp; ${agreements.length} agreement${agreements.length !== 1 ? "s" : ""}</div>
    ${active.length > 0 ? `<p style="font-size:9pt"><strong>${active.length} active agreement${active.length !== 1 ? "s" : ""}</strong> &nbsp;|&nbsp; Total annual payment: <strong>£${total.toFixed(2)}</strong></p>` : ""}
    <h2>Agreements (${agreements.length})</h2>
    ${agreements.length === 0 ? "<p>No SFI/ELMs agreements recorded.</p>" : `
    <table><thead><tr>
      <th>Agreement No.</th><th>Application Ref</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Annual Payment</th>
    </tr></thead><tbody>${rows}</tbody></table>`}
    <div class="footer">Generated by BDE Farm Trac. Retain alongside RPA agreement documentation.</div>
  `);
}
function EnvironmentalFeaturesTab({ farmId, schemes }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [pin, setPin] = reactExports.useState(null);
  const emptyForm = () => ({
    featureType: "",
    description: "",
    areaHectares: "",
    lengthMetres: "",
    managementPractice: "",
    dateRecorded: "",
    notes: "",
    fieldId: "",
    isEnclosed: false
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const fieldsQuery = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fields = fieldsQuery.data ?? [];
  const q = useQuery({
    queryKey: ["environmental-features", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-features`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["environmental-features", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/environmental-features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Feature saved" });
      invalidate();
      setAddOpen(false);
      setForm(emptyForm());
      setPin(null);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/environmental-features/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Feature updated" });
      invalidate();
      setEditRecord(null);
      setForm(emptyForm());
      setPin(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/environmental-features/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  function openEdit(r) {
    setForm({
      featureType: r.featureType ?? "",
      description: r.description ?? "",
      areaHectares: r.areaHectares != null ? String(parseFloat(r.areaHectares)) : "",
      lengthMetres: r.lengthMetres != null ? String(parseFloat(r.lengthMetres)) : "",
      managementPractice: r.managementPractice ?? "",
      dateRecorded: r.dateRecorded ? new Date(r.dateRecorded).toISOString().slice(0, 10) : "",
      notes: r.notes ?? "",
      fieldId: r.fieldId != null ? String(r.fieldId) : "",
      isEnclosed: !!r.isEnclosed
    });
    setPin(r.latitude && r.longitude ? { lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) } : null);
    setEditRecord(r);
  }
  function handleSubmit() {
    const payload = { ...form, latitude: pin ? String(pin.lat) : null, longitude: pin ? String(pin.lng) : null };
    if (editRecord) updateMut.mutate({ id: editRecord.id, body: payload });
    else createMut.mutate(payload);
  }
  const dialogOpen = addOpen || !!editRecord;
  const records = q.data ?? [];
  const totalHa = records.reduce((s, r) => s + (r.areaHectares ? parseFloat(r.areaHectares) : 0), 0);
  const totalM = records.reduce((s, r) => s + (r.lengthMetres ? parseFloat(r.lengthMetres) : 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Total Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#166534" }, children: records.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Total Area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#166534" }, children: [
          totalHa.toFixed(2),
          " ha"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Total Length" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#166534" }, children: totalM > 1e3 ? `${(totalM / 1e3).toFixed(1)} km` : `${Math.round(totalM)} m` })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-2", onClick: () => printFeatureRegister(records, schemes, farmId), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
        "Print Feature Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(emptyForm());
        setPin(null);
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Feature"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No environmental features recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Map hedgerows, ponds, woodland and other habitats on your farm." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Feature Type", "Description", "Area (ha)", "Length (m)", "Management Practice", "GPS", "Date Recorded", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const hasGps = r.latitude && r.longitude;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureTypeLabel, { type: r.featureType }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }, children: r.description || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.areaHectares != null ? parseFloat(r.areaHectares).toFixed(2) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.lengthMetres != null ? parseFloat(r.lengthMetres).toFixed(0) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.managementPractice || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: hasGps ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`,
              target: "_blank",
              rel: "noreferrer",
              style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#2563eb", fontFamily: "monospace", textDecoration: "none" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 11 }),
                parseFloat(r.latitude).toFixed(4),
                ", ",
                parseFloat(r.longitude).toFixed(4)
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "Not set" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.dateRecorded) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm());
        setPin(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "56rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Environmental Feature" : "Add Environmental Feature" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Feature Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.featureType, onValueChange: (v) => setForm((f) => ({ ...f, featureType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["hedgerow", "pond", "woodland", "wetland", "grassland", "wildflower_margin", "watercourse", "buffer_strip", "other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureTypeLabel, { type: t }) }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date Recorded ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateRecorded, onChange: (e) => setForm((f) => ({ ...f, dateRecorded: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Northern boundary hedgerow", value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (hectares)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", min: "0", value: form.areaHectares, onChange: (e) => setForm((f) => ({ ...f, areaHectares: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Length (metres)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.lengthMetres, onChange: (e) => setForm((f) => ({ ...f, lengthMetres: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Management Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Annual trim, no autumn cutting", value: form.managementPractice, onChange: (e) => setForm((f) => ({ ...f, managementPractice: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Associated Field ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontWeight: 400 }, children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v, isEnclosed: v === "__none__" ? false : f.isEnclosed })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None — farm-wide feature" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None — farm-wide feature" }),
                fields.map((fld) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(fld.id), children: [
                  fld.name,
                  fld.areaHectares ? ` (${parseFloat(String(fld.areaHectares)).toFixed(2)} ha)` : ""
                ] }, fld.id))
              ] })
            ] })
          ] }),
          form.fieldId && form.fieldId !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "isEnclosed", checked: !!form.isEnclosed, onChange: (e) => setForm((f) => ({ ...f, isEnclosed: e.target.checked })), style: { width: 15, height: 15, marginTop: 2 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "isEnclosed", style: { cursor: "pointer", fontSize: "0.875rem", color: "#111827" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Wholly enclosed within this field" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 400, fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }, children: "Tick this if the feature (e.g. copse, pond) sits entirely within the field boundary. Its area will be deducted from the field's farmable area, affecting yield and rate calculations." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
          ] }),
          editRecord ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "block mb-1.5", children: "Photos & Attachments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "environmental_feature", recordId: editRecord.id, compact: true })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }, children: "📎 Save the feature first, then re-open it to attach photos or documents." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, className: "text-muted-foreground" }),
            "GPS Pin Location"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StorageLocationMapPicker, { value: pin, onChange: setPin, mapHeight: 400 }, dialogOpen ? "open" : "closed")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm());
          setPin(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: !form.featureType || !form.dateRecorded || createMut.isPending || updateMut.isPending, children: editRecord ? "Save Changes" : "Save Feature" })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 16, className: "text-green-600" }),
        "Environmental Feature"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }, children: [
          { label: "Feature Type", value: /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureTypeLabel, { type: viewRecord.featureType }) },
          { label: "Date Recorded", value: fmt(viewRecord.dateRecorded) },
          { label: "Description", value: viewRecord.description || "—", full: true },
          { label: "Area", value: viewRecord.areaHectares ? `${parseFloat(viewRecord.areaHectares).toFixed(2)} ha` : "—" },
          { label: "Length", value: viewRecord.lengthMetres ? `${parseFloat(viewRecord.lengthMetres).toFixed(0)} m` : "—" },
          { label: "Management Practice", value: viewRecord.managementPractice || "—", full: true },
          { label: "GPS Location", value: viewRecord.latitude && viewRecord.longitude ? `${parseFloat(viewRecord.latitude).toFixed(5)}, ${parseFloat(viewRecord.longitude).toFixed(5)}` : "Not set" },
          { label: "Notes", value: viewRecord.notes || "—", full: true }
        ].map(({ label, value, full }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: full ? { gridColumn: "1 / -1" } : {}, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 3 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: "#111827" }, children: value })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }, children: "Photos & Attachments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "environmental_feature", recordId: viewRecord.id })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Feature" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Feature" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this environmental feature record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function AgriEnvSchemesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [viewScheme, setViewScheme] = reactExports.useState(null);
  const [schemeTab, setSchemeTab] = reactExports.useState("details");
  const [schemeCommOpen, setSchemeCommOpen] = reactExports.useState(false);
  const [schemeCommForm, setSchemeCommForm] = reactExports.useState({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
  const [form, setForm] = reactExports.useState({
    schemeName: "",
    agreementNumber: "",
    startDate: "",
    endDate: "",
    annualPaymentPence: "",
    obligations: "",
    status: "active",
    notes: ""
  });
  const q = useQuery({
    queryKey: ["agri-schemes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["agri-schemes", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/agri-schemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, annualPaymentPence: body.annualPaymentPence ? Math.round(parseFloat(body.annualPaymentPence) * 100) : null })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Scheme saved" });
      invalidate();
      setAddOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/agri-schemes/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const resetForm = () => setForm({ schemeName: "", agreementNumber: "", startDate: "", endDate: "", annualPaymentPence: "", obligations: "", status: "active", notes: "" });
  const schemeCommsQ = useQuery({
    queryKey: ["scheme-comms", farmId, viewScheme?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme.id}/communications`).then((r) => r.json()),
    enabled: !!viewScheme
  });
  const addSchemeCommMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme?.id}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheme-comms", farmId, viewScheme?.id] });
      setSchemeCommOpen(false);
      setSchemeCommForm({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
      toast({ title: "Communication logged" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const delSchemeCommMut = useMutation({
    mutationFn: (commId) => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme?.id}/communications/${commId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheme-comms", farmId, viewScheme?.id] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const activeSchemes = records.filter((r) => r.status === "active");
  const totalAnnual = activeSchemes.reduce((s, r) => s + (r.annualPaymentPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Active Schemes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }, children: activeSchemes.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Total Annual Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }, children: fmtAmt(totalAnnual) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }, children: [
      records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printSchemeSummary(records, farmId), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        "Print Summary"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        resetForm();
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Add Scheme"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreePine, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No agri-environment schemes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record Countryside Stewardship, SFI, and other agri-environment scheme agreements." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Scheme Name", "Agreement No.", "Start Date", "End Date", "Annual Payment", "Status", "Obligations", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 600 }, children: r.schemeName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.agreementNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.startDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.endDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmtAmt(r.annualPaymentPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status || "active" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, fontSize: "0.8rem" }, children: r.obligations || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setViewScheme(r);
            setSchemeTab("details");
          }, style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        resetForm();
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Agri-Environment Scheme" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Scheme Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Countryside Stewardship, SFI, HLS", value: form.schemeName, onChange: (e) => setForm((f) => ({ ...f, schemeName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agreement Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.agreementNumber, onChange: (e) => setForm((f) => ({ ...f, agreementNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.annualPaymentPence, onChange: (e) => setForm((f) => ({ ...f, annualPaymentPence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Start Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.startDate, onChange: (e) => setForm((f) => ({ ...f, startDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.endDate, onChange: (e) => setForm((f) => ({ ...f, endDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: "Completed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Obligations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Key obligations and actions required under this scheme...", value: form.obligations, onChange: (e) => setForm((f) => ({ ...f, obligations: e.target.value })), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.schemeName || !form.startDate || createMut.isPending, children: "Save Scheme" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Scheme Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this agri-environment scheme record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    viewScheme && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setViewScheme(null);
      setSchemeTab("details");
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: viewScheme.schemeName }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }, children: ["details", "communications"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSchemeTab(t), style: { border: "none", background: "none", padding: "8px 14px", fontSize: "0.8125rem", fontWeight: schemeTab === t ? 600 : 400, color: schemeTab === t ? "#166534" : "#6b7280", borderBottom: schemeTab === t ? "2px solid #166534" : "2px solid transparent", cursor: "pointer" }, children: t === "details" ? "Details" : `Communications${schemeCommsQ.data?.length > 0 ? ` (${schemeCommsQ.data.length})` : ""}` }, t)) }),
      schemeTab === "details" ? (() => {
        const s = viewScheme;
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Agreement Number", value: s.agreementNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.status || "active" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Start Date", value: s.startDate ? fmt(s.startDate) : null }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "End Date", value: s.endDate ? fmt(s.endDate) : null })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Annual Payment", value: s.annualPaymentPence ? fmtAmt(s.annualPaymentPence) : null }),
          s.obligations && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Obligations", value: s.obligations }),
          s.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: s.notes })
        ] });
      })() : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setSchemeCommForm({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
          setSchemeCommOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Log Communication"
        ] }) }),
        schemeCommsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", textAlign: "center", padding: "2rem" }, children: "Loading…" }) : schemeCommsQ.data?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 28, style: { margin: "0 auto 8px", opacity: 0.4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No correspondence logged" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem" }, children: "Log emails, letters, calls, and meetings with scheme administrators (Natural England, RPA, etc.)." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: schemeCommsQ.data.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem", background: "#fff" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 20, background: c.direction === "inbound" ? "#eff6ff" : "#f0fdf4", color: c.direction === "inbound" ? "#1d4ed8" : "#15803d" }, children: c.direction === "inbound" ? "Received" : "Sent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }, children: c.comm_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: c.comm_date ? new Date(c.comm_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delSchemeCommMut.mutate(c.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827", marginTop: 6, marginBottom: c.summary ? 4 : 0 }, children: c.subject }),
          c.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#6b7280", margin: 0 }, children: c.summary })
        ] }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
        setViewScheme(null);
        setSchemeTab("details");
      }, children: "Close" }) })
    ] }) }),
    schemeCommOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      setSchemeCommOpen(o);
      if (!o) addSchemeCommMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Communication" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: schemeCommForm.commDate, onChange: (e) => setSchemeCommForm((f) => ({ ...f, commDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: schemeCommForm.direction, onValueChange: (v) => setSchemeCommForm((f) => ({ ...f, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "outbound", children: "Sent / Outgoing" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inbound", children: "Received / Incoming" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: schemeCommForm.commType, onValueChange: (v) => setSchemeCommForm((f) => ({ ...f, commType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Email", "Letter", "Phone call", "Meeting", "Site visit", "Video call", "Other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Subject ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Annual payment query", value: schemeCommForm.subject, onChange: (e) => setSchemeCommForm((f) => ({ ...f, subject: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: schemeCommForm.summary, onChange: (e) => setSchemeCommForm((f) => ({ ...f, summary: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addSchemeCommMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSchemeCommOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => addSchemeCommMut.mutate(schemeCommForm), disabled: !schemeCommForm.subject || !schemeCommForm.commType || addSchemeCommMut.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const KNOWN_ASSESSOR_ORGS = [
  "Red Tractor",
  "Natural England",
  "AHDB",
  "Environment Agency",
  "RSPCA Assured",
  "Linking Environment and Farming (LEAF)",
  "Organic Farmers & Growers (OF&G)",
  "Soil Association",
  "Pasture for Life"
];
function AssessmentsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskOpen, setRaiseTaskOpen] = reactExports.useState(false);
  const [pendingTask, setPendingTask] = reactExports.useState(null);
  const [taskAssigneeId, setTaskAssigneeId] = reactExports.useState("");
  const [taskDueDate, setTaskDueDate] = reactExports.useState("");
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = membersData?.members.filter((m) => m.isActive) ?? [];
  const emptyForm = () => ({
    assessorName: "",
    assessorOrganisation: "",
    assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    outcome: "pass",
    conditions: "",
    nextAssessmentDue: "",
    notes: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const q = useQuery({
    queryKey: ["environmental-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-assessments`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["environmental-assessments", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/environmental-assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: (_data, variables) => {
      toast({ title: "Assessment record saved" });
      invalidate();
      setAddOpen(false);
      setForm(emptyForm());
      if ((variables.outcome === "advisory" || variables.outcome === "fail") && variables.conditions?.trim()) {
        const outcomeLabel = variables.outcome === "fail" ? "Fail" : "Pass with Advisories";
        const dateStr = variables.assessmentDate ? new Date(variables.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
        const orgPart = variables.assessorOrganisation ? ` — ${variables.assessorOrganisation}` : "";
        setPendingTask({
          title: `Remedial actions required: ${outcomeLabel}${orgPart} (${dateStr})`,
          description: variables.conditions.trim()
        });
        setTaskAssigneeId("");
        setTaskDueDate("");
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const raiseMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/environmental-assessments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const plannerMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/planner-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => toast({ title: "Added to Week Ahead Planner" }),
    onError: () => toast({ title: "Failed to add to planner", variant: "destructive" })
  });
  const records = q.data ?? [];
  const lastPass = records.find((r) => r.outcome === "pass" || r.outcome === "advisory");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    lastPass && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 20, color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, color: "#166534", fontSize: "0.875rem" }, children: [
          "Last successful assessment: ",
          fmt(lastPass.assessmentDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#374151", fontSize: "0.8rem" }, children: [
          lastPass.assessorName,
          lastPass.assessorOrganisation ? ` — ${lastPass.assessorOrganisation}` : ""
        ] })
      ] }),
      lastPass.nextAssessmentDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginLeft: "auto", textAlign: "right" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "Next assessment due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", fontSize: "0.875rem" }, children: fmt(lastPass.nextAssessmentDue) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 16, padding: "0.875rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#92400e" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor requirement:" }),
      " The Combinable Crops standard requires that you hold an Environmental Features Register and that it is inspected during your farm assessment. Record each assessor visit here to maintain a full inspection history."
    ] }) }),
    (() => {
      const outstanding = records.filter(
        (r) => (r.outcome === "advisory" || r.outcome === "fail") && r.conditions
      );
      if (!outstanding.length) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, color: "#92400e" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#92400e", fontSize: "0.875rem", margin: 0 }, children: outstanding.length === 1 ? "1 assessment has outstanding remedial actions" : `${outstanding.length} assessments have outstanding remedial actions` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: outstanding.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "0.5rem 0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 2 }, children: [
            fmt(r.assessmentDate),
            r.outcome === "fail" ? " — Fail" : " — Pass with Advisories",
            r.assessorOrganisation ? ` · ${r.assessorOrganisation}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#92400e", margin: 0 }, children: r.conditions })
        ] }, r.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#78350f", marginTop: 8, marginBottom: 0 }, children: "Ensure all relevant personnel on the holding are made aware of these requirements. Once complete, note the action taken in the record." })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }, children: [
      records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printAssessmentHistory(records, farmId), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        "Print History"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(emptyForm());
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Assessment Visit"
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No assessment records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Log Red Tractor assessor visits and their outcomes here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Assessment Date", "Assessor", "Organisation", "Outcome", "Conditions / Actions", "Next Due", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontWeight: 500 }, children: fmt(r.assessmentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.assessorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.assessorOrganisation || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { outcome: r.outcome }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, fontSize: "0.8rem" }, children: r.conditions || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.nextAssessmentDue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
          fmt(r.nextAssessmentDue),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => plannerMut.mutate({ title: "Environmental Assessment Due", eventDate: r.nextAssessmentDue, colour: "blue", description: r.assessorOrganisation ? `Assessor: ${r.assessorOrganisation}` : void 0 }),
              style: { background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 2, lineHeight: 1 },
              title: "Add to Week Ahead Planner",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 12 })
            }
          )
        ] }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160, fontSize: "0.8rem" }, children: r.notes || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        setForm(emptyForm());
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Assessment Visit" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Assessor Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. John Smith", value: form.assessorName, onChange: (e) => setForm((f) => ({ ...f, assessorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Assessment Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.assessmentDate, onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Organisation" }),
          (() => {
            const selectVal = KNOWN_ASSESSOR_ORGS.includes(form.assessorOrganisation) ? form.assessorOrganisation : form.assessorOrganisation ? "Other" : "";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectVal, onValueChange: (v) => {
                if (v === "Other") setForm((f) => ({ ...f, assessorOrganisation: "" }));
                else setForm((f) => ({ ...f, assessorOrganisation: v }));
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select organisation…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  KNOWN_ASSESSOR_ORGS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other (please specify)" })
                ] })
              ] }),
              selectVal === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "mt-1.5",
                  placeholder: "Organisation name",
                  value: form.assessorOrganisation,
                  onChange: (e) => setForm((f) => ({ ...f, assessorOrganisation: e.target.value }))
                }
              )
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Outcome ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome, onValueChange: (v) => setForm((f) => ({ ...f, outcome: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advisory", children: "Pass with Advisories" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conditions / Required Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Any conditions placed on the pass, or corrective actions required...", value: form.conditions, onChange: (e) => setForm((f) => ({ ...f, conditions: e.target.value })), rows: 3 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.nextAssessmentDue, onChange: (e) => setForm((f) => ({ ...f, nextAssessmentDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.assessorName || !form.assessmentDate || createMut.isPending, children: "Save Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Assessment Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this assessment record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: raiseTaskOpen, onOpenChange: (o) => {
      if (!o) {
        setRaiseTaskOpen(false);
        setPendingTask(null);
        raiseMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise a Task for Remedial Actions?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "Actions recorded:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: 0 }, children: pendingTask?.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Assign to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: taskAssigneeId, onValueChange: setTaskAssigneeId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
              memberFullName(m),
              m.jobTitle ? ` — ${m.jobTitle}` : ""
            ] }, m.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: taskDueDate, onChange: (e) => setTaskDueDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "The assignee will receive an SMS notification. The task will appear on the Task Board and stay open until marked complete." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: raiseMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setRaiseTaskOpen(false);
          setPendingTask(null);
        }, children: "Skip for now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !taskAssigneeId || raiseMut.isPending,
            onClick: () => {
              if (!pendingTask || !taskAssigneeId) return;
              raiseMut.mutate({
                assignedToMemberId: Number(taskAssigneeId),
                title: pendingTask.title,
                description: pendingTask.description,
                module: "Environmental",
                taskType: "compliance",
                href: "/environmental-management?tab=assessments",
                ...taskDueDate ? { dueDate: taskDueDate } : {}
              });
            },
            children: "Raise Task & Notify"
          }
        )
      ] })
    ] }) })
  ] });
}
const EVENT_TYPES = [
  { value: "hedge_trimming", label: "Hedge Trimming / Laying" },
  { value: "scrub_clearance", label: "Scrub Clearance" },
  { value: "mowing", label: "Mowing / Cutting" },
  { value: "pond_clearance", label: "Pond Clearance" },
  { value: "ditch_clearance", label: "Ditch Clearance" },
  { value: "vegetation_management", label: "Vegetation Management" },
  { value: "tree_work", label: "Tree Work / Coppicing" },
  { value: "grazing", label: "Grazing / Livestock Management" },
  { value: "spraying", label: "Spraying" },
  { value: "cultivation", label: "Cultivation" },
  { value: "planting", label: "Planting / Seeding" },
  { value: "water_management", label: "Water / Irrigation Management" },
  { value: "pest_control", label: "Pest / Invasive Species Control" },
  { value: "other", label: "Other" }
];
const eventTypeLabel = (v) => EVENT_TYPES.find((t) => t.value === v)?.label ?? v;
const EVENT_TYPE_COLORS = {
  hedge_trimming: "bg-green-100 text-green-800",
  scrub_clearance: "bg-lime-100 text-lime-800",
  mowing: "bg-emerald-100 text-emerald-800",
  pond_clearance: "bg-cyan-100 text-cyan-800",
  ditch_clearance: "bg-blue-100 text-blue-800",
  vegetation_management: "bg-teal-100 text-teal-800",
  tree_work: "bg-amber-100 text-amber-800",
  grazing: "bg-orange-100 text-orange-800",
  spraying: "bg-purple-100 text-purple-800",
  cultivation: "bg-stone-100 text-stone-800",
  planting: "bg-green-100 text-green-800",
  water_management: "bg-sky-100 text-sky-800",
  pest_control: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-700"
};
function ManagementEventsTab({ farmId, features, schemes }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [filterFeature, setFilterFeature] = usePersistedFilter({ page: "environmental-management-events", filter: "feature", farmId, defaultValue: "__all__" });
  const [filterType, setFilterType] = usePersistedFilter({ page: "environmental-management-events", filter: "type", farmId, defaultValue: "__all__" });
  const [raiseTaskOpen, setRaiseTaskOpen] = reactExports.useState(false);
  const [pendingTask, setPendingTask] = reactExports.useState(null);
  const [taskAssigneeId, setTaskAssigneeId] = reactExports.useState("");
  const [taskDueDate, setTaskDueDate] = reactExports.useState("");
  const { data: contractorsData } = useQuery({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contractors`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => (d.records ?? []).filter((c) => c.isActive)
  });
  const contractors = contractorsData ?? [];
  const activeMembers = membersData?.members.filter((m) => m.isActive) ?? [];
  const emptyForm = () => ({
    featureId: "",
    featureName: "",
    featureType: "",
    eventDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    eventType: "",
    description: "",
    operator: "",
    contractorUsed: false,
    contractorName: "",
    fulfilsSchemeObligation: false,
    schemeId: "",
    schemeName: "",
    notes: "",
    followUpActionsNeeded: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const q = useQuery({
    queryKey: ["env-management-events", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-management-events`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["env-management-events", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/environmental-management-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_data, variables) => {
      toast({ title: "Event logged" });
      invalidate();
      setAddOpen(false);
      maybeRaiseTask(variables);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/environmental-management-events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_data, variables) => {
      toast({ title: "Event updated" });
      invalidate();
      setEditRecord(null);
      maybeRaiseTask(variables.body);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const raiseMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" })
  });
  function maybeRaiseTask(payload) {
    if (!payload?.followUpActionsNeeded?.trim()) return;
    const eventLabel = payload.eventType ? ` — ${eventTypeLabel(payload.eventType)}` : "";
    const dateStr = payload.eventDate ? new Date(payload.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
    setPendingTask({
      title: `Follow-up required: Management Event${eventLabel} (${dateStr})`,
      description: payload.followUpActionsNeeded.trim()
    });
    setTaskAssigneeId("");
    setTaskDueDate("");
    setRaiseTaskOpen(true);
  }
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/environmental-management-events/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setForm(emptyForm());
    setAddOpen(true);
  }
  function openEdit(r) {
    setForm({
      featureId: r.featureId?.toString() ?? "",
      featureName: r.featureName ?? "",
      featureType: r.featureType ?? "",
      eventDate: r.eventDate ? new Date(r.eventDate).toISOString().slice(0, 10) : "",
      eventType: r.eventType ?? "",
      description: r.description ?? "",
      operator: r.operator ?? "",
      contractorUsed: r.contractorUsed ?? false,
      contractorName: r.contractorName ?? "",
      fulfilsSchemeObligation: r.fulfilsSchemeObligation ?? false,
      schemeId: r.schemeId?.toString() ?? "",
      schemeName: r.schemeName ?? "",
      notes: r.notes ?? "",
      followUpActionsNeeded: r.followUpActionsNeeded ?? ""
    });
    setEditRecord(r);
  }
  function handleFeatureSelect(fid) {
    if (fid === "__none__") {
      setForm((f) => ({ ...f, featureId: "", featureName: "", featureType: "" }));
      return;
    }
    const feat = features.find((f) => f.id.toString() === fid);
    setForm((f) => ({ ...f, featureId: fid, featureName: feat?.description || featureTypeLabel(feat?.featureType || ""), featureType: feat?.featureType ?? "" }));
  }
  function handleSchemeSelect(sid) {
    if (sid === "__none__") {
      setForm((f) => ({ ...f, schemeId: "", schemeName: "" }));
      return;
    }
    const scheme = schemes.find((s) => s.id.toString() === sid);
    setForm((f) => ({ ...f, schemeId: sid, schemeName: scheme?.schemeName ?? "" }));
  }
  function handleSubmit() {
    if (!form.eventDate || !form.eventType) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      featureId: form.featureId && form.featureId !== "__none__" ? parseInt(form.featureId) : null,
      schemeId: form.schemeId && form.schemeId !== "__none__" ? parseInt(form.schemeId) : null
    };
    if (editRecord) {
      updateMut.mutate({ id: editRecord.id, body: payload });
    } else {
      createMut.mutate(payload);
    }
  }
  const allRecords = q.data ?? [];
  const filtered = allRecords.filter((r) => {
    if (filterFeature !== "__all__" && r.featureId?.toString() !== filterFeature && r.featureName !== filterFeature) return false;
    if (filterType !== "__all__" && r.eventType !== filterType) return false;
    return true;
  });
  const thisYear = (/* @__PURE__ */ new Date()).getFullYear();
  const eventsThisYear = allRecords.filter((r) => new Date(r.eventDate).getFullYear() === thisYear).length;
  const schemeLinked = allRecords.filter((r) => r.fulfilsSchemeObligation).length;
  const dialogOpen = addOpen || !!editRecord;
  const dialogTitle = editRecord ? "Edit Management Event" : "Log Management Event";
  function featureDisplayName(r) {
    if (r.featureName) return r.featureName;
    if (r.featureType) return featureTypeLabel(r.featureType);
    return "—";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    allRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Total Events Logged" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#166534" }, children: allRecords.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: [
          "This Year (",
          thisYear,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#166534" }, children: eventsThisYear })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: "Scheme-Linked Events" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }, children: schemeLinked })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 16, padding: "0.875rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#92400e" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor requirement:" }),
      " You must be able to demonstrate that environmental features are actively managed. This log provides the dated evidence trail that management is actually taking place — not just intended. Log every management activity here, even small ones."
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }, children: [
      features.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterFeature, onValueChange: setFilterFeature, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 200 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All features" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All features" }),
          features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.id.toString(), children: f.description || featureTypeLabel(f.featureType) }, f.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 210 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All event types" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All event types" }),
          EVENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginLeft: "auto", display: "flex", gap: 8 }, children: [
        allRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printManagementEventLog(allRecords, farmId), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Event Log"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Log Event"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: allRecords.length === 0 ? "No management events logged yet" : "No events match the current filter" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: allRecords.length === 0 ? "Start building your evidence trail — log every hedge trim, pond clearance, or mowing event." : "Try clearing the filter to see all events." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Feature", "Event Type", "Description", "Operator", "Scheme", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const badgeCls = EVENT_TYPE_COLORS[r.eventType] ?? "bg-gray-100 text-gray-700";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontWeight: 500 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 13, color: "#9ca3af" }),
            fmt(r.eventDate)
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4, fontWeight: 500, color: "#111827" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 13, color: "#16a34a" }),
            featureDisplayName(r)
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`, children: eventTypeLabel(r.eventType) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 200, fontSize: "0.8rem" }, children: r.description || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.contractorUsed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            r.contractorName || "Contractor",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "(contractor)" })
          ] }) : r.operator || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.fulfilsSchemeObligation ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", background: "#eff6ff", color: "#1e40af", borderRadius: 4, padding: "2px 6px" }, children: r.schemeName || "Scheme" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160, fontSize: "0.8rem" }, children: r.notes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Management Event" }) }),
      (() => {
        const r = viewRecord;
        const fmt2 = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
        const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Feature", value: r.featureName || r.featureType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Feature Type", value: r.featureType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Event Date", value: fmt2(r.eventDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Event Type", value: r.eventType })
          ] }),
          r.description && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Description", value: r.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Operator", value: r.contractorUsed ? `${r.contractorName || "Contractor"} (contractor)` : r.operator }),
          r.fulfilsSchemeObligation && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Scheme Obligation", value: r.schemeName || "Yes" }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: r.notes })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }, children: "Photos & Attachments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "environmental_management_event", recordId: viewRecord.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit Event" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm());
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                value: form.eventDate,
                onChange: (e) => setForm((f) => ({ ...f, eventDate: e.target.value })),
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Event Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.eventType || "__none__", onValueChange: (v) => v !== "__none__" && setForm((f) => ({ ...f, eventType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", disabled: true, children: "Select type…" }),
                EVENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feature" }),
          features.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.featureId || "__none__", onValueChange: handleFeatureSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select feature…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not linked to a specific feature —" }),
              features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.id.toString(), children: f.description ? `${featureTypeLabel(f.featureType)} — ${f.description}` : featureTypeLabel(f.featureType) }, f.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.featureName,
              onChange: (e) => setForm((f) => ({ ...f, featureName: e.target.value })),
              placeholder: "Feature name or description",
              style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description of work carried out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.description,
              onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
              placeholder: "e.g. North boundary hedge trimmed to 1.5m height on both sides, arisings left on field side",
              rows: 2
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carried out by" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StaffSelect,
              {
                value: form.operator,
                onChange: (v) => setForm((f) => ({ ...f, operator: v })),
                staffNames,
                loading: membersLoading
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", marginTop: "1.4rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: form.contractorUsed,
                  onChange: (e) => setForm((f) => ({ ...f, contractorUsed: e.target.checked })),
                  style: { width: 16, height: 16 }
                }
              ),
              "Carried out by contractor"
            ] }),
            form.contractorUsed && (contractors.length > 0 ? (() => {
              const knownNames = contractors.map((c) => c.companyName);
              const selectVal = knownNames.includes(form.contractorName) ? form.contractorName : form.contractorName ? "Other" : "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectVal, onValueChange: (v) => {
                  if (v === "Other") setForm((f) => ({ ...f, contractorName: "" }));
                  else setForm((f) => ({ ...f, contractorName: v }));
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contractor…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.companyName, children: c.companyName }, c.id)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other (not in register)" })
                  ] })
                ] }),
                selectVal === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: form.contractorName,
                    onChange: (e) => setForm((f) => ({ ...f, contractorName: e.target.value })),
                    placeholder: "Contractor name / company",
                    style: { marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }
                  }
                )
              ] });
            })() : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: form.contractorName,
                onChange: (e) => setForm((f) => ({ ...f, contractorName: e.target.value })),
                placeholder: "Contractor name / company",
                style: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }
              }
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: form.fulfilsSchemeObligation,
                onChange: (e) => setForm((f) => ({ ...f, fulfilsSchemeObligation: e.target.checked })),
                style: { width: 16, height: 16 }
              }
            ),
            "This event fulfils an agri-environment scheme obligation"
          ] }),
          form.fulfilsSchemeObligation && schemes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.schemeId || "__none__", onValueChange: handleSchemeSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to scheme…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No specific scheme —" }),
              schemes.filter((s) => s.status === "active").map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.id.toString(), children: [
                s.schemeName,
                s.agreementNumber ? ` (${s.agreementNumber})` : ""
              ] }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
              placeholder: "Soil / weather conditions, observations…",
              rows: 2
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-up Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.followUpActionsNeeded,
              onChange: (e) => setForm((f) => ({ ...f, followUpActionsNeeded: e.target.value })),
              placeholder: "Describe any actions that need to be completed as a result of this event…",
              rows: 2
            }
          ),
          form.followUpActionsNeeded?.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#92400e" }, children: "A task will be raised on the Task Board when you save — you can assign it to the relevant person." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm());
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: createMut.isPending || updateMut.isPending, children: editRecord ? "Save Changes" : "Log Event" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Event" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this management event record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: raiseTaskOpen, onOpenChange: (o) => {
      if (!o) {
        setRaiseTaskOpen(false);
        setPendingTask(null);
        raiseMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise a Task for Follow-up Actions?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "Actions required:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: 0 }, children: pendingTask?.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Assign to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: taskAssigneeId, onValueChange: setTaskAssigneeId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
              memberFullName(m),
              m.jobTitle ? ` — ${m.jobTitle}` : ""
            ] }, m.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: taskDueDate, onChange: (e) => setTaskDueDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "The assignee will receive an SMS notification. The task will appear on the Task Board and stay open until marked complete." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: raiseMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setRaiseTaskOpen(false);
          setPendingTask(null);
        }, children: "Skip for now" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !taskAssigneeId || raiseMut.isPending,
            onClick: () => {
              if (!pendingTask || !taskAssigneeId) return;
              raiseMut.mutate({
                assignedToMemberId: Number(taskAssigneeId),
                title: pendingTask.title,
                description: pendingTask.description,
                module: "Environmental",
                taskType: "compliance",
                href: "/environmental-management?tab=events",
                ...taskDueDate ? { dueDate: taskDueDate } : {}
              });
            },
            children: "Raise Task & Notify"
          }
        )
      ] })
    ] }) })
  ] });
}
const SFI_SCHEME_NAMES = [
  "SFI 2023",
  "SFI 2024",
  "SFI Pilot",
  "Countryside Stewardship (Higher Tier)",
  "Countryside Stewardship (Mid Tier)",
  "England Woodland Creation Offer (EWCO)",
  "Farming in Protected Landscapes (FiPL)",
  "ELMs Pilot"
];
const SFI_MANAGING_BODIES = [
  "Rural Payments Agency (RPA)",
  "Natural England",
  "Forestry Commission"
];
const COMMON_ACTION_CODES = [
  { code: "SAM1", title: "Assess soil, produce a soil management plan and test soil organic matter" },
  { code: "SAM2", title: "Multi-species winter cover crop" },
  { code: "SAM3", title: "Herbal leys" },
  { code: "NUM1", title: "Assess nutrient management and produce a nutrient management plan" },
  { code: "NUM2", title: "Optimise application of inorganic fertiliser" },
  { code: "NUM3", title: "Precision application of nitrogen to agricultural land" },
  { code: "IGL1", title: "Take improved grassland field corners and blocks out of management" },
  { code: "IGL2", title: "Manage grassland with very low nutrient inputs (outside SDAs)" },
  { code: "IGL3", title: "Manage grassland with low nutrient inputs (outside SDAs)" },
  { code: "AHL1", title: "Arable and horticultural land: assess soil, produce a soil management plan" },
  { code: "AHL2", title: "Arable and horticultural land: establish and maintain a year-round green cover" },
  { code: "AHL3", title: "Arable and horticultural land: establish and maintain temporary grassland" },
  { code: "IPM1", title: "Assess integrated pest management and produce a plan" },
  { code: "IPM2", title: "Insect monitoring traps" },
  { code: "IPM3", title: "Companion cropping on arable and horticultural land" },
  { code: "IPM4", title: "Cultivated areas for arable plants" },
  { code: "HRW1", title: "Manage hedgerows" },
  { code: "HRW2", title: "Add woody features to hedgerows" },
  { code: "HRW3", title: "Manage hedgerow trees on farms" },
  { code: "WBD1", title: "Create or restore bunds, dams or scrapes" },
  { code: "FG1", title: "Manage farmland around ponds" },
  { code: "OFC1", title: "Manage or create traditional farm orchards" }
];
function emptySFIAction() {
  return { actionCode: "", actionTitle: "", landParcelReference: "", eligibleAreaHa: "", annualPaymentPerHa: "", annualPaymentAmount: "", complianceStatus: "compliant", notes: "" };
}
function SFIActionsTab({ farmId, openId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ status: "Active" });
  const [actions, setActions] = reactExports.useState([]);
  const [deletedActionIds, setDeletedActionIds] = reactExports.useState([]);
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [plannerOpen, setPlannerOpen] = reactExports.useState(false);
  const [pendingPlannerDates, setPendingPlannerDates] = reactExports.useState(null);
  const rowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["sfi-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-agreements`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => Array.isArray(d) ? d : d.records ?? []
  });
  const { data: allActions = [] } = useQuery({
    queryKey: ["sfi-actions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-actions`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => Array.isArray(d) ? d : d.records ?? []
  });
  const plannerMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/planner-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => toast({ title: "Date added to Week Ahead Planner" }),
    onError: () => toast({ title: "Failed to add to planner", variant: "destructive" })
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? `/api/farms/${farmId}/sfi-agreements/${editing.id}` : `/api/farms/${farmId}/sfi-agreements`;
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const agreement = await res.json();
      const agreementId = agreement.id;
      await Promise.all(deletedActionIds.map(
        (id) => fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        })
      ));
      await Promise.all(actions.map(
        (action) => action.id ? fetch(`/api/farms/${farmId}/sfi-actions/${action.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...action, agreementId, farmId }) }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        }) : fetch(`/api/farms/${farmId}/sfi-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...action, agreementId, farmId }) }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        })
      ));
      return { startDate: body.agreementStartDate, endDate: body.agreementEndDate, schemeName: String(body.schemeName ?? body.agreementNumber ?? "") };
    },
    onSuccess: ({ startDate, endDate, schemeName }) => {
      qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] });
      qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] });
      setOpen(false);
      setForm({ status: "Active" });
      setEditing(null);
      setActions([]);
      setDeletedActionIds([]);
      toast({ title: "Agreement saved" });
      if (startDate || endDate) {
        setPendingPlannerDates({ start: startDate || null, end: endDate || null, schemeName });
        setPlannerOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const acts = allActions.filter((a) => a.agreementId === id);
      await Promise.all(acts.map((a) => fetch(`/api/farms/${farmId}/sfi-actions/${a.id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      })));
      await fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] });
      qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const rows = agreements;
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || rows.length === 0) return;
    const target = rows.find((r) => Number(r.id) === openId);
    if (target) {
      autoOpened.current = true;
      setTimeout(() => setViewRecord(target), 100);
    }
  }, [openId, rows]);
  function openAdd() {
    setEditing(null);
    setForm({ status: "Active" });
    setActions([]);
    setDeletedActionIds([]);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v != null ? String(v) : ""])));
    const agreementActions = allActions.filter((a) => a.agreementId === Number(r.id));
    setActions(agreementActions.map((a) => ({
      id: a.id,
      actionCode: a.actionCode ?? "",
      actionTitle: a.actionTitle ?? "",
      landParcelReference: a.landParcelReference ?? "",
      eligibleAreaHa: a.eligibleAreaHa != null ? String(a.eligibleAreaHa) : "",
      annualPaymentPerHa: a.annualPaymentPerHa != null ? String(a.annualPaymentPerHa) : "",
      annualPaymentAmount: a.annualPaymentAmount != null ? String(a.annualPaymentAmount) : "",
      complianceStatus: a.complianceStatus ?? "compliant",
      notes: a.notes ?? ""
    })));
    setDeletedActionIds([]);
    setOpen(true);
  }
  function updateActionRow(idx, field, value) {
    setActions((prev) => prev.map((a, i) => {
      if (i !== idx) return a;
      const updated = { ...a, [field]: value };
      if ((field === "eligibleAreaHa" || field === "annualPaymentPerHa") && !updated.annualPaymentAmount) {
        const area = parseFloat(updated.eligibleAreaHa);
        const rate = parseFloat(updated.annualPaymentPerHa);
        if (!isNaN(area) && !isNaN(rate)) updated.annualPaymentAmount = (area * rate).toFixed(2);
      }
      if (field === "actionCode" && !updated.actionTitle) {
        const known = COMMON_ACTION_CODES.find((c) => c.code.toUpperCase() === value.toUpperCase());
        if (known) updated.actionTitle = known.title;
      }
      return updated;
    }));
  }
  function removeActionRow(idx) {
    const action = actions[idx];
    if (action.id) setDeletedActionIds((prev) => [...prev, action.id]);
    setActions((prev) => prev.filter((_, i) => i !== idx));
  }
  const calcTotal = actions.reduce((s, a) => {
    const v = parseFloat(a.annualPaymentAmount);
    return s + (isNaN(v) ? 0 : v);
  }, 0);
  const statusColors = {
    Active: "bg-green-100 text-green-700",
    Applied: "bg-blue-100 text-blue-700",
    Withdrawn: "bg-gray-100 text-gray-600",
    Expired: "bg-red-100 text-red-600",
    "Under Query": "bg-amber-100 text-amber-700"
  };
  const complianceColors = {
    compliant: "bg-green-100 text-green-700",
    "non-compliant": "bg-red-100 text-red-700",
    "under-review": "bg-amber-100 text-amber-700",
    "pending-assessment": "bg-blue-100 text-blue-700"
  };
  const isSchemeNameCustom = !SFI_SCHEME_NAMES.includes(form.schemeName ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "SFI / ELMs Actions & Agreements" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record Sustainable Farming Incentive and Environmental Land Management agreements, action codes, areas and annual payments." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printSFISummary(rows, farmId), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-2" }),
          "Print Summary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          "Add Agreement"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-muted-foreground text-sm", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm", children: rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-8 text-center", children: "No SFI / ELMs agreements recorded yet. Add your first agreement above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Scheme", "Agreement No.", "Start", "End", "Status", "Actions", "Annual Payment", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: rows.map((r) => {
        const agreementActions = allActions.filter((a) => a.agreementId === Number(r.id));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            ref: (el) => {
              if (el) rowRefs.current.set(Number(r.id), el);
            },
            className: `transition-colors${hlId === Number(r.id) ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : " hover:bg-black/5"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: String(r.schemeName ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: String(r.agreementNumber ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: r.agreementStartDate ? new Date(r.agreementStartDate).toLocaleDateString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: r.agreementEndDate ? new Date(r.agreementEndDate).toLocaleDateString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[String(r.status)] ?? "bg-gray-100 text-gray-600"}`, children: String(r.status ?? "—") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: agreementActions.length > 0 ? `${agreementActions.length} code${agreementActions.length !== 1 ? "s" : ""}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.totalAnnualPayment ? `£${Number(r.totalAnnualPayment).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right space-x-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(r), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
              ] })
            ]
          },
          Number(r.id)
        );
      }) })
    ] }) }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 text-green-600" }),
        "SFI / ELMs Agreement"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3", children: [
          !!viewRecord.schemeName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: String(viewRecord.schemeName) })
          ] }),
          !!viewRecord.agreementNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Agreement No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono", children: String(viewRecord.agreementNumber) })
          ] }),
          !!viewRecord.agreementStartDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewRecord.agreementStartDate).toLocaleDateString("en-GB") })
          ] }),
          !!viewRecord.agreementEndDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewRecord.agreementEndDate).toLocaleDateString("en-GB") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[String(viewRecord.status)] ?? "bg-gray-100 text-gray-600"}`, children: String(viewRecord.status ?? "—") })
          ] }),
          !!viewRecord.totalAnnualPayment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Annual Payment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              "£",
              Number(viewRecord.totalAnnualPayment).toLocaleString("en-GB", { minimumFractionDigits: 2 })
            ] })
          ] }),
          !!viewRecord.managingBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Managing Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: String(viewRecord.managingBody) })
          ] }),
          !!viewRecord.agentOrAdvisorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Agent / Advisor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: String(viewRecord.agentOrAdvisorName) })
          ] }),
          !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: String(viewRecord.notes) })
          ] })
        ] }),
        (() => {
          const acts = allActions.filter((a) => a.agreementId === Number(viewRecord.id));
          if (!acts.length) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-2", children: [
              "Action Codes (",
              acts.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Code", "Action Title", "Parcel Ref", "Area (ha)", "Rate (£/ha)", "Annual (£)", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-muted-foreground", children: h }, h)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: acts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono font-semibold text-green-700", children: a.actionCode }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground max-w-48", children: a.actionTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono", children: a.landParcelReference || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.eligibleAreaHa ? Number(a.eligibleAreaHa).toFixed(2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: a.annualPaymentPerHa ? `£${Number(a.annualPaymentPerHa).toFixed(2)}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-semibold", children: a.annualPaymentAmount ? `£${Number(a.annualPaymentAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${complianceColors[a.complianceStatus] ?? "bg-gray-100 text-gray-600"}`, children: (a.complianceStatus ?? "").replace(/-/g, " ") }) })
              ] }, a.id)) })
            ] }) })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm({ status: "Active" });
        setActions([]);
        setDeletedActionIds([]);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "56rem", maxHeight: "90vh", overflow: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit SFI / ELMs Agreement" : "Add SFI / ELMs Agreement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b", children: "Agreement Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Scheme Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: SFI_SCHEME_NAMES.includes(form.schemeName ?? "") ? form.schemeName ?? "" : "Other",
                onValueChange: (v) => setForm((f) => ({ ...f, schemeName: v === "Other" ? "" : v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    SFI_SCHEME_NAMES.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other…" })
                  ] })
                ]
              }
            ),
            isSchemeNameCustom && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", placeholder: "Enter scheme name", value: form.schemeName ?? "", onChange: (e) => setForm((f) => ({ ...f, schemeName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Agreement Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AG00012345", value: form.agreementNumber ?? "", onChange: (e) => setForm((f) => ({ ...f, agreementNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Start Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.agreementStartDate ?? "", onChange: (e) => setForm((f) => ({ ...f, agreementStartDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "End Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.agreementEndDate ?? "", onChange: (e) => setForm((f) => ({ ...f, agreementEndDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Status ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "Active", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Active", "Applied", "Withdrawn", "Expired", "Under Query"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Annual Payment (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: calcTotal > 0 ? `${calcTotal.toFixed(2)} (calculated)` : "e.g. 5000.00", value: form.totalAnnualPayment ?? "", onChange: (e) => setForm((f) => ({ ...f, totalAnnualPayment: e.target.value })) }),
            calcTotal > 0 && !form.totalAnnualPayment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "From action codes: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-green-700", children: [
                "£",
                calcTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })
              ] }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-blue-600 underline", onClick: () => setForm((f) => ({ ...f, totalAnnualPayment: calcTotal.toFixed(2) })), children: "Use this" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Managing Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: SFI_MANAGING_BODIES.includes(form.managingBody ?? "") ? form.managingBody ?? "" : form.managingBody ? "Other" : "",
                onValueChange: (v) => setForm((f) => ({ ...f, managingBody: v === "Other" ? "" : v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "e.g. Rural Payments Agency…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    SFI_MANAGING_BODIES.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other…" })
                  ] })
                ]
              }
            ),
            form.managingBody !== void 0 && !SFI_MANAGING_BODIES.includes(form.managingBody) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", placeholder: "Managing body name", value: form.managingBody ?? "", onChange: (e) => setForm((f) => ({ ...f, managingBody: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agent / Advisor Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of agent or farm advisor", value: form.agentOrAdvisorName ?? "", onChange: (e) => setForm((f) => ({ ...f, agentOrAdvisorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Any additional notes or conditions…", value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 pb-1 border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Action Codes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", type: "button", onClick: () => setActions((prev) => [...prev, emptySFIAction()]), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
            "Add Action Code"
          ] })
        ] }),
        actions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground/70 italic text-center py-3", children: 'No action codes added yet. Click "Add Action Code" to record the SFI actions under this agreement.' }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          actions.map((a, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-3 bg-gray-50/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                "Code ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  list: `sfi-codes-${idx}`,
                  value: a.actionCode,
                  onChange: (e) => updateActionRow(idx, "actionCode", e.target.value.toUpperCase()),
                  placeholder: "e.g. SAM1",
                  className: "w-full border border-input rounded-md px-2 py-1.5 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-ring"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: `sfi-codes-${idx}`, children: COMMON_ACTION_CODES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.code, children: [
                c.code,
                " — ",
                c.title
              ] }, c.code)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
                "Action Title ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "Description of the action", value: a.actionTitle, onChange: (e) => updateActionRow(idx, "actionTitle", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Parcel Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs font-mono", placeholder: "e.g. TL1234", value: a.landParcelReference, onChange: (e) => updateActionRow(idx, "landParcelReference", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Area (ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-xs", value: a.eligibleAreaHa, onChange: (e) => updateActionRow(idx, "eligibleAreaHa", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "£/ha" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-xs", value: a.annualPaymentPerHa, onChange: (e) => updateActionRow(idx, "annualPaymentPerHa", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Annual (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "h-8 text-xs", value: a.annualPaymentAmount, onChange: (e) => updateActionRow(idx, "annualPaymentAmount", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: a.complianceStatus, onValueChange: (v) => updateActionRow(idx, "complianceStatus", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "compliant", children: "Compliant" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "non-compliant", children: "Non-compliant" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "under-review", children: "Under review" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending-assessment", children: "Pending" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-12 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => removeActionRow(idx), className: "text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }),
              "Remove"
            ] }) })
          ] }) }, idx)),
          calcTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-green-700", children: [
            "Total from action codes: £",
            calcTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
          setForm({ status: "Active" });
          setActions([]);
          setDeletedActionIds([]);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              const payload = { ...form };
              if (!payload.totalAnnualPayment && calcTotal > 0) payload.totalAnnualPayment = calcTotal.toFixed(2);
              save.mutate(payload);
            },
            disabled: save.isPending || !form.schemeName || !form.agreementNumber || !form.agreementStartDate || !form.agreementEndDate,
            children: save.isPending ? "Saving…" : "Save Agreement"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: plannerOpen, onOpenChange: (o) => {
      if (!o) {
        setPlannerOpen(false);
        plannerMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-4 h-4 text-blue-600" }),
        "Add Dates to Week Ahead Planner?"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-1 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Add the agreement start and/or end dates to the Week Ahead Planner as diary reminders?" }),
        pendingPlannerDates?.start && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg px-3 py-2 bg-green-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Agreement starts: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: new Date(pendingPlannerDates.start).toLocaleDateString("en-GB") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => plannerMut.mutate({ title: `SFI starts: ${pendingPlannerDates.schemeName}`, eventDate: pendingPlannerDates.start, colour: "green" }), children: "Add" })
        ] }),
        pendingPlannerDates?.end && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg px-3 py-2 bg-amber-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Agreement ends: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: new Date(pendingPlannerDates.end).toLocaleDateString("en-GB") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => plannerMut.mutate({ title: `SFI ends: ${pendingPlannerDates.schemeName}`, eventDate: pendingPlannerDates.end, colour: "amber" }), children: "Add" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: plannerMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setPlannerOpen(false), children: "Done" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete Agreement",
        message: "Delete this SFI/ELMs agreement and all its action codes? This cannot be undone.",
        mutation: del,
        onConfirm: () => {
          if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          del.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
function EnvironmentalPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "environmental", farmId, validIds: ["features", "schemes", "assessments", "events", "sfi", "slurry", "silage"], defaultTab: "features", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const openId = (() => {
    const n = Number(new URLSearchParams(window.location.search).get("open"));
    return n > 0 ? n : null;
  })();
  const schemesQ = useQuery({
    queryKey: ["agri-schemes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const featuresQ = useQuery({
    queryKey: ["environmental-features", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-features`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Environmental Management", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Record environmental features, manage agri-environment scheme agreements, log assessor visits, and maintain a dated evidence trail of all management activities." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "features", onClick: () => setTab("features"), children: "Environmental Features" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "schemes", onClick: () => setTab("schemes"), children: "Agri-Env Schemes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assessments", onClick: () => setTab("assessments"), children: "Assessment Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "events", onClick: () => setTab("events"), children: "Management Events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "sfi", onClick: () => setTab("sfi"), children: "SFI / ELMs Actions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "slurry", onClick: () => setTab("slurry"), children: "Slurry & Manure" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "silage", onClick: () => setTab("silage"), children: "Silage & Haylage" })
    ] }),
    farmId && tab === "features" && /* @__PURE__ */ jsxRuntimeExports.jsx(EnvironmentalFeaturesTab, { farmId, schemes: schemesQ.data ?? [] }),
    farmId && tab === "schemes" && /* @__PURE__ */ jsxRuntimeExports.jsx(AgriEnvSchemesTab, { farmId }),
    farmId && tab === "assessments" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentsTab, { farmId }),
    farmId && tab === "events" && /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementEventsTab, { farmId, features: featuresQ.data ?? [], schemes: schemesQ.data ?? [] }),
    farmId && tab === "sfi" && /* @__PURE__ */ jsxRuntimeExports.jsx(SFIActionsTab, { farmId, openId }),
    farmId && tab === "slurry" && /* @__PURE__ */ jsxRuntimeExports.jsx(SlurryTab, { farmId, openId }),
    farmId && tab === "silage" && /* @__PURE__ */ jsxRuntimeExports.jsx(SilageTab, { farmId })
  ] }) });
}
const CSS_PRINT = `
  body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #111; margin: 20mm; }
  h1 { font-size: 15pt; color: #166534; margin-bottom: 4px; }
  h2 { font-size: 11pt; color: #166534; margin-top: 22px; margin-bottom: 7px; border-bottom: 1px solid #bbf7d0; padding-bottom: 3px; }
  .meta { font-size: 9pt; color: #555; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 10px; }
  th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { border: 1px solid #e5e7eb; padding: 5px 7px; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .badge-pass { background:#dcfce7; color:#166534; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-advisory { background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .badge-fail { background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-size:8.5pt; font-weight:600; }
  .notice { background:#fffbeb; border:1px solid #fde68a; border-radius:5px; padding:7px 10px; font-size:8.5pt; color:#92400e; margin-bottom:12px; }
  .footer { margin-top: 28px; font-size: 8pt; color: #888; border-top: 1px solid #e5e7eb; padding-top: 7px; }
  .sig-block { margin-top: 36px; }
  .sig-row { display: flex; gap: 32px; margin-top: 20px; }
  .sig-field { flex: 1; }
  .sig-line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 3px; }
  .sig-label { font-size: 8.5pt; color: #555; }
  @page { margin: 14mm; }
  @media print { body { margin: 0; } }
`;
function openPrint(title, body) {
  const w = window.open("", "_blank", "width=920,height=700");
  if (!w) return;
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS_PRINT}</style></head><body>${body}</body></html>`
  );
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
function doSSAFOPrint(stores, inspections, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const storeRows = stores.map(
    (s) => `<tr>
      <td><strong>${s.storeName}</strong></td>
      <td>${s.storeType || "—"}</td>
      <td>${s.capacityM3 != null ? `${s.capacityM3} m³` : "—"}</td>
      <td>${s.material || "—"}</td>
      <td>${s.designStandard || "—"}</td>
      <td>${s.agencyRegistrationNumber || "—"}</td>
      <td>${s.lastInspectionDate ? new Date(s.lastInspectionDate).toLocaleDateString("en-GB") : "Not inspected"}</td>
      <td>${s.nextInspectionDue ? new Date(s.nextInspectionDue).toLocaleDateString("en-GB") : "—"}</td>
      <td><span class="badge-${s.status === "Compliant" ? "pass" : "fail"}">${s.status || "—"}</span></td>
    </tr>`
  ).join("");
  const inspRows = [...inspections].sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()).map(
    (r) => `<tr>
        <td>${new Date(r.inspectionDate).toLocaleDateString("en-GB")}</td>
        <td><strong>${r.storeName || "—"}</strong></td>
        <td>${[r.inspectorName, r.inspectorOrganisation].filter(Boolean).join(", ") || "—"}</td>
        <td><span class="badge-${r.outcome === "Pass" ? "pass" : r.outcome === "Advisory" ? "advisory" : "fail"}">${r.outcome}</span></td>
        <td>${r.freeboardOk ? "Yes" : "No"}</td>
        <td>${r.leaksOrDamageFound ? "<strong style='color:#991b1b'>Yes</strong>" : "No"}</td>
        <td>${r.deficiencies || "—"}</td>
        <td>${r.actionsRequired || "—"}</td>
        <td>${r.nextInspectionDue ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB") : "—"}</td>
      </tr>`
  ).join("");
  openPrint(
    "SSAFO Compliance Register",
    `<h1>SSAFO Compliance Register — Slurry &amp; Manure Stores</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; ${stores.length} store${stores.length !== 1 ? "s" : ""} | ${inspections.length} inspection record${inspections.length !== 1 ? "s" : ""}</div>
    <div class="notice"><strong>SSAFO requirement (England):</strong> The Silage, Slurry and Agricultural Fuel Oil Regulations 2010 require that slurry storage structures are maintained in good condition, regularly inspected, and that records are available on request by the Environment Agency.</div>
    <h2>Store Inventory (${stores.length})</h2>
    ${stores.length === 0 ? "<p>No stores recorded.</p>" : `<table><thead><tr><th>Store Name</th><th>Type</th><th>Capacity</th><th>Material</th><th>Design Std</th><th>EA Ref</th><th>Last Insp.</th><th>Next Due</th><th>Status</th></tr></thead><tbody>${storeRows}</tbody></table>`}
    <h2>Inspection History (${inspections.length})</h2>
    ${inspections.length === 0 ? "<p>No inspection records.</p>" : `<table><thead><tr><th>Date</th><th>Store</th><th>Inspector</th><th>Outcome</th><th>Freeboard OK</th><th>Leaks</th><th>Deficiencies</th><th>Actions</th><th>Next Due</th></tr></thead><tbody>${inspRows}</tbody></table>`}
    <div class="sig-block"><h2>EA Inspector Sign-off</h2>
      <div class="sig-row">
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">EA Officer signature</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Name (print)</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Date of visit</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Farmer signature</div></div>
      </div>
    </div>
    <div class="footer">Generated by BDE Farm Trac. SSAFO Regulations 2010 (SI 2010/639). Retain and make available for Environment Agency inspection on request.</div>`
  );
}
function doSpreadingPrint(spreadings, farmId) {
  const now = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const rows = [...spreadings].sort(
    (a, b) => new Date(b.spreadingDate ?? 0).getTime() - new Date(a.spreadingDate ?? 0).getTime()
  ).map(
    (r) => `<tr>
    <td>${r.spreadingDate ? new Date(r.spreadingDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.fieldDescription || "—"}</td>
    <td>${r.fieldAreaHa != null ? `${r.fieldAreaHa} ha` : "—"}</td>
    <td>${r.manureType || "—"}</td>
    <td>${r.volumeAppliedM3 != null ? `${Number(r.volumeAppliedM3).toFixed(1)} m³` : "—"}</td>
    <td>${r.applicationMethod || "—"}</td>
    <td>${r.operatorName || "—"}</td>
    <td>${r.groundConditions || "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`
  ).join("");
  openPrint(
    "Organic Material Spreading Records",
    `<h1>Organic Material Spreading Records</h1>
    <div class="meta">Farm ID: ${farmId} &nbsp;|&nbsp; Generated: ${now} &nbsp;|&nbsp; ${spreadings.length} record${spreadings.length !== 1 ? "s" : ""}</div>
    <div class="notice"><strong>Farming Rules for Water (2018) &amp; NVZ requirements:</strong> Records of organic material applications must be retained for at least five years.</div>
    <h2>Spreading Records (${spreadings.length})</h2>
    ${spreadings.length === 0 ? "<p>No spreading records.</p>" : `<table><thead><tr><th>Date</th><th>Field</th><th>Area (ha)</th><th>Material</th><th>Volume/Tonnes</th><th>Method</th><th>Operator</th><th>Weather</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`}
    <div class="sig-block"><h2>Sign-off</h2>
      <div class="sig-row">
        <div class="sig-field" style="flex:2"><div class="sig-line"></div><div class="sig-label">Farm manager signature</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Name (print)</div></div>
        <div class="sig-field"><div class="sig-line"></div><div class="sig-label">Date</div></div>
      </div>
    </div>
    <div class="footer">Generated by BDE Farm Trac. Farming Rules for Water (SI 2018/151). Retain for a minimum of five years.</div>`
  );
}
const STORE_TYPES = [
  "Slurry Lagoon",
  "Slurry Tank",
  "Reception Pit",
  "Silage Clamp",
  "Dung Pad",
  "Manure Store",
  "Earth Bank Store"
];
const MATERIALS = [
  "Cattle Slurry",
  "Pig Slurry",
  "Poultry Slurry",
  "FYM (Cattle)",
  "FYM (Pig)",
  "FYM (Poultry)",
  "Digestate",
  "Mixed"
];
const SPREAD_MATERIALS = [
  "Cattle Slurry",
  "Pig Slurry",
  "Poultry Slurry",
  "FYM (Cattle)",
  "FYM (Pig)",
  "FYM (Poultry)",
  "Digestate"
];
const APPLICATION_METHODS = [
  "Broadcast",
  "Trailing shoe",
  "Shallow injection",
  "Deep injection",
  "Band spread",
  "Splash plate"
];
const INCORPORATION_METHODS = [
  "Not applicable",
  "Ploughed in (6 hrs)",
  "Cultivated (12 hrs)",
  "Applied to bare soil"
];
const STORE_STATUSES = ["Compliant", "Non-Compliant", "Under Repair", "Decommissioned"];
function SlurryTab({ farmId, openId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);
  const [storeOpen, setStoreOpen] = reactExports.useState(false);
  const [editingStore, setEditingStore] = reactExports.useState(null);
  const [storeForm, setStoreForm] = reactExports.useState({});
  const [viewStore, setViewStore] = reactExports.useState(null);
  const [spreadOpen, setSpreadOpen] = reactExports.useState(false);
  const [spreadForm, setSpreadForm] = reactExports.useState({});
  const [inspOpen, setInspOpen] = reactExports.useState(false);
  const [editingInsp, setEditingInsp] = reactExports.useState(null);
  const [inspForm, setInspForm] = reactExports.useState({});
  const [inspStoreId, setInspStoreId] = reactExports.useState("");
  const [deleteInspId, setDeleteInspId] = reactExports.useState(null);
  const [fillOpen, setFillOpen] = reactExports.useState(false);
  const [fillStoreId, setFillStoreId] = reactExports.useState("");
  const [fillForm, setFillForm] = reactExports.useState({});
  const [raiseTaskOpen, setRaiseTaskOpen] = reactExports.useState(false);
  const [pendingTask, setPendingTask] = reactExports.useState(
    null
  );
  const [taskAssigneeId, setTaskAssigneeId] = reactExports.useState("");
  const [taskDueDate, setTaskDueDate] = reactExports.useState("");
  const [hlId, setHlId] = reactExports.useState(openId ?? null);
  const storeRowRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const autoOpened = reactExports.useRef(false);
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const storesQ = useQuery({
    queryKey: ["slurry-stores", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/slurry-stores`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    select: (d) => d.records ?? []
  });
  const spreadQ = useQuery({
    queryKey: ["slurry-spreading", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/slurry-spreading-records`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    select: (d) => d.records ?? []
  });
  const inspQ = useQuery({
    queryKey: ["slurry-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/slurry-store-inspections`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    select: (d) => d.records ?? []
  });
  const fillEventsQ = useQuery({
    queryKey: ["slurry-fill-events", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/slurry-fill-events`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const inspectorOrgsQ = useQuery({
    queryKey: ["lookup", "inspector_organisations"],
    queryFn: () => fetch(`/api/lookups/inspector_organisations`).then((r) => r.json()),
    select: (d) => (d.items ?? []).map((i) => String(i.value))
  });
  const saveStoreMut = useMutation({
    mutationFn: (body) => {
      const url = editingStore ? `/api/farms/${farmId}/slurry-stores/${editingStore.id}` : `/api/farms/${farmId}/slurry-stores`;
      return fetch(url, {
        method: editingStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-stores", farmId] });
      setStoreOpen(false);
      setStoreForm({});
      setEditingStore(null);
      toast({ title: "Store saved" });
    },
    onError: () => toast({ title: "Failed to save store", variant: "destructive" })
  });
  const saveSpreadMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/slurry-spreading-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-spreading", farmId] });
      setSpreadOpen(false);
      setSpreadForm({});
      toast({ title: "Spreading record saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const saveFillMut = useMutation({
    mutationFn: async (body) => {
      const res = await fetch(`/api/farms/${farmId}/slurry-fill-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to record fill event");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-fill-events", farmId] });
      setFillOpen(false);
      setFillForm({});
      toast({ title: "Fill event recorded" });
    },
    onError: (err) => toast({ title: err.message || "Failed to record fill event", variant: "destructive" })
  });
  const deleteFillMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/slurry-fill-events/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-fill-events", farmId] });
      toast({ title: "Fill event deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const saveInspMut = useMutation({
    mutationFn: (body) => {
      const url = editingInsp ? `/api/farms/${farmId}/slurry-store-inspections/${editingInsp.id}` : `/api/farms/${farmId}/slurry-store-inspections`;
      return fetch(url, {
        method: editingInsp ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      }).then((r) => r.json());
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["slurry-inspections", farmId] });
      qc.invalidateQueries({ queryKey: ["slurry-stores", farmId] });
      const wasEditing = editingInsp;
      setInspOpen(false);
      setInspForm({});
      setEditingInsp(null);
      toast({ title: wasEditing ? "Inspection updated" : "Inspection recorded" });
      const hasLeaks = variables.leaksOrDamageFound === "true";
      const hasDeficiencies = !!variables.deficiencies?.trim();
      const hasActions = !!variables.actionsRequired?.trim();
      const store = (storesQ.data ?? []).find((s) => String(s.id) === String(variables.storeId));
      const isSilageClamp = String(store?.storeType ?? "") === "Silage Clamp";
      const effluentFailed = isSilageClamp && variables.effluentContained === "false";
      const coverFailed = isSilageClamp && variables.coverSheetIntact === "false";
      const wallsFailed = isSilageClamp && variables.wallsSound === "false";
      if (hasLeaks || hasDeficiencies || hasActions || effluentFailed || coverFailed || wallsFailed) {
        const storeName = store ? String(store.storeName ?? "store") : "store";
        const dateStr = variables.inspectionDate ? new Date(variables.inspectionDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "";
        const parts = [];
        if (hasLeaks)
          parts.push(
            "URGENT: Leaks or structural damage found — immediate remedial action required. Do not allow further filling until the store is made safe."
          );
        if (effluentFailed)
          parts.push(
            "URGENT: Silage effluent is not contained — pollution risk. Check drainage/collection and stop filling until resolved (SSAFO)."
          );
        if (coverFailed)
          parts.push("Cover sheet is not intact/weighted — reseal to prevent spoilage and rainwater ingress.");
        if (wallsFailed)
          parts.push("Clamp walls are not sound (cracks/lean) — arrange structural inspection/repair before further filling.");
        if (hasDeficiencies) parts.push(`Deficiencies noted: ${variables.deficiencies.trim()}`);
        if (hasActions) parts.push(`Actions required: ${variables.actionsRequired.trim()}`);
        setPendingTask({
          title: `${hasLeaks || effluentFailed ? "[URGENT] " : ""}${isSilageClamp ? "Silage Clamp" : "Slurry Store"} Inspection — ${storeName} (${dateStr})`,
          description: parts.join("\n\n")
        });
        setTaskAssigneeId("");
        setTaskDueDate("");
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save inspection", variant: "destructive" })
  });
  const deleteInspMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/slurry-store-inspections/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-inspections", farmId] });
      setDeleteInspId(null);
      toast({ title: "Inspection deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const raiseTaskMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" })
  });
  reactExports.useEffect(() => {
    if (!openId || autoOpened.current || (storesQ.data ?? []).length === 0) return;
    const target = (storesQ.data ?? []).find((r) => Number(r.id) === openId);
    if (target) {
      autoOpened.current = true;
      setTimeout(() => setViewStore(target), 100);
    }
  }, [openId, storesQ.data]);
  const stores = storesQ.data ?? [];
  const spreadings = spreadQ.data ?? [];
  const inspections = inspQ.data ?? [];
  const fillEvents = fillEventsQ.data ?? [];
  const storeCapacity = reactExports.useMemo(() => {
    const cap = {};
    for (const s of stores) {
      const id = Number(s.id);
      const maxM3 = Number(s.capacityM3) || 0;
      const filled = fillEvents.filter((f) => Number(f.storeId) === id).reduce((sum, f) => sum + (Number(f.volumeM3) || 0), 0);
      const spread = spreadings.filter((r) => Number(r.storeId) === id).reduce((sum, r) => sum + (Number(r.volumeAppliedM3) || 0), 0);
      const current = Math.max(0, filled - spread);
      cap[id] = {
        filled,
        spread,
        current,
        available: maxM3 > 0 ? Math.max(0, maxM3 - current) : null,
        pct: maxM3 > 0 ? Math.min(100, current / maxM3 * 100) : null
      };
    }
    return cap;
  }, [stores, fillEvents, spreadings]);
  function openInspDialog(store) {
    setEditingInsp(null);
    setInspForm({
      inspectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      outcome: "Pass",
      storeId: store ? String(store.id) : ""
    });
    setInspStoreId(store ? String(store.id) : "");
    setInspOpen(true);
  }
  function statusBadge(status) {
    return String(status) === "Compliant" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
  }
  function outcomeBadge(outcome) {
    return outcome === "Pass" ? "bg-green-100 text-green-700" : outcome === "Advisory" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  }
  function rowToForm(row) {
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? "")]));
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Slurry & Manure Stores" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          stores.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => doSSAFOPrint(stores, inspections, farmId),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
                " SSAFO Register"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              onClick: () => {
                setEditingStore(null);
                setStoreForm({ status: "Compliant" });
                setStoreOpen(true);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
                " Add Store"
              ]
            }
          )
        ] })
      ] }),
      storesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: stores.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No slurry stores recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
          "Store Name",
          "Type",
          "Capacity (m³)",
          "Fill Level",
          "Material",
          "Last Inspection",
          "Next Due",
          "Status",
          ""
        ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs",
            children: h
          },
          h
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: stores.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            ref: (el) => {
              if (el) storeRowRefs.current.set(Number(r.id), el);
            },
            className: `transition-colors${hlId === Number(r.id) ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : " hover:bg-black/5"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: String(r.storeName ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.storeType ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.capacityM3 ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", style: { minWidth: 130 }, children: (() => {
                const cap = storeCapacity[Number(r.id)];
                if (!cap || cap.pct === null)
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "—" });
                const color = cap.pct >= 90 ? "#dc2626" : cap.pct >= 70 ? "#d97706" : "#16a34a";
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: 2, color: "#6b7280" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      cap.current.toFixed(1),
                      " m³"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: cap.available < 10 ? "#dc2626" : "#374151" }, children: [
                      cap.available.toFixed(1),
                      " free"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${cap.pct}%`, background: color, borderRadius: 3, transition: "width 0.3s" } }) })
                ] });
              })() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.material ?? "—") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.lastInspectionDate ? new Date(r.lastInspectionDate).toLocaleDateString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.nextInspectionDue ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(r.status)}`,
                  children: String(r.status ?? "—")
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    title: "View",
                    onClick: () => setViewStore(r),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    style: { fontSize: "0.75rem", height: 28, padding: "0 10px" },
                    onClick: () => openInspDialog(r),
                    children: "Inspect"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    onClick: () => {
                      setEditingStore(r);
                      setStoreForm(rowToForm(r));
                      setStoreOpen(true);
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }) })
            ]
          },
          Number(r.id)
        )) })
      ] }) })
    ] }),
    viewStore && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewStore(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Slurry / Manure Store" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Store Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: String(viewStore.storeName ?? "—") })
          ] }),
          !!viewStore.storeType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: String(viewStore.storeType) })
          ] }),
          !!viewStore.capacityM3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Capacity (m³)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: String(viewStore.capacityM3) })
          ] }),
          !!viewStore.material && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Material" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: String(viewStore.material) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(viewStore.status)}`,
                children: String(viewStore.status ?? "—")
              }
            )
          ] }),
          !!viewStore.lastInspectionDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Last Inspection" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewStore.lastInspectionDate).toLocaleDateString("en-GB") })
          ] }),
          !!viewStore.nextInspectionDue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase font-medium mb-0.5", children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: new Date(viewStore.nextInspectionDue).toLocaleDateString("en-GB") })
          ] })
        ] }),
        (() => {
          const cap = storeCapacity[Number(viewStore.id)];
          const maxM3 = Number(viewStore.capacityM3) || 0;
          if (!cap || maxM3 === 0) return null;
          const color = cap.pct >= 90 ? "#dc2626" : cap.pct >= 70 ? "#d97706" : "#16a34a";
          const bgColor = cap.pct >= 90 ? "#fef2f2" : cap.pct >= 70 ? "#fffbeb" : "#f0fdf4";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12, padding: "12px 14px", background: bgColor, borderRadius: 8, border: `1px solid ${color}33` }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase text-muted-foreground mb-2", children: "Current Fill Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: cap.current.toFixed(1) }),
                " m³ stored"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: cap.available < maxM3 * 0.1 ? "#dc2626" : "#16a34a", fontWeight: 600 }, children: [
                cap.available.toFixed(1),
                " m³ free"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 14, background: "#e5e7eb", borderRadius: 7, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", width: `${cap.pct}%`, background: color, borderRadius: 7, transition: "width 0.4s" } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 500 }, children: [
                cap.pct.toFixed(0),
                "% full"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                maxM3,
                " m³ max"
              ] })
            ] }),
            cap.filled > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#6b7280", marginTop: 6 }, children: [
              "Total filled: ",
              cap.filled.toFixed(1),
              " m³ · Total spread: ",
              cap.spread.toFixed(1),
              " m³"
            ] }),
            cap.pct >= 90 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, marginTop: 4 }, children: "⚠ Near capacity — do not add further material without spreading first." })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => {
              const s = viewStore;
              setViewStore(null);
              setEditingStore(s);
              setStoreForm(rowToForm(s));
              setStoreOpen(true);
            },
            children: "Edit"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => {
              setViewStore(null);
              setFillForm({ eventDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), storeId: String(viewStore.id) });
              setFillStoreId(String(viewStore.id));
              setFillOpen(true);
            },
            children: "Log Fill Event"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setViewStore(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Fill & Intake Events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record when slurry or manure is added into a store — used to calculate available capacity." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => {
              setFillForm({ eventDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
              setFillStoreId("");
              setFillOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              " Log Fill Event"
            ]
          }
        )
      ] }),
      fillEventsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: fillEvents.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No fill events recorded. Log an event each time slurry or manure is added to a store." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Store", "Material", "Volume (m³)", "Source / Origin", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: fillEvents.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.storeName ?? stores.find((s) => Number(s.id) === Number(r.storeId))?.storeName ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.materialType ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "2px 7px", borderRadius: 10 }, children: String(r.materialType) }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.volumeM3 ? Number(r.volumeM3).toFixed(1) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.sourceDescription ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: String(r.notes ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "text-red-500 hover:text-red-700",
              onClick: () => deleteFillMut.mutate(Number(r.id)),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem" }, children: "✕" })
            }
          ) })
        ] }, r.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Spreading Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          spreadings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => doSpreadingPrint(spreadings, farmId),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
                " Print Log"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              onClick: () => {
                setSpreadForm({});
                setSpreadOpen(true);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
                " Log Spreading"
              ]
            }
          )
        ] })
      ] }),
      spreadQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: spreadings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No spreading records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
          "Date",
          "Source Store",
          "Field",
          "Area (ha)",
          "Material",
          "Volume (m³)",
          "Method",
          "Operator"
        ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs",
            children: h
          },
          h
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: spreadings.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.spreadingDate ? new Date(r.spreadingDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.storeName ?? (r.storeId ? stores.find((s) => Number(s.id) === Number(r.storeId))?.storeName ?? "—" : "—")) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.fieldDescription ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.fieldAreaHa ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.manureType ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.volumeAppliedM3 ? `${Number(r.volumeAppliedM3).toFixed(1)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.applicationMethod ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.operatorName ?? "—") })
        ] }, r.id != null ? Number(r.id) : i)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Store Inspection Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => openInspDialog(null), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          " Log Inspection"
        ] })
      ] }),
      inspQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: inspections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: 'No inspections recorded. Use the "Inspect" button on a store row to log one.' }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
          "Date",
          "Store",
          "Inspector",
          "Outcome",
          "Leaks / Damage",
          "Next Due",
          "Actions",
          ""
        ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs",
            children: h
          },
          h
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: inspections.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.storeName ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: [r.inspectorName, r.inspectorOrganisation].filter(Boolean).join(", ") || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${outcomeBadge(r.outcome)}`,
              children: r.outcome
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.leaksOrDamageFound ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-medium", children: "Yes" }) : "No" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.nextInspectionDue ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB") : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              className: "px-4 py-3 text-gray-600 text-xs",
              style: { maxWidth: 200 },
              children: r.actionsRequired || "—"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  setEditingInsp(r);
                  setInspForm(rowToForm(r));
                  setInspStoreId(String(r.storeId));
                  setInspOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "text-red-500 hover:text-red-700",
                onClick: () => setDeleteInspId(Number(r.id)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem" }, children: "✕" })
              }
            )
          ] }) })
        ] }, r.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: storeOpen, onOpenChange: (o) => {
      setStoreOpen(o);
      if (!o) saveStoreMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingStore ? "Edit Store" : "Add Slurry / Manure Store" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: storeForm.storeName ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, storeName: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: storeForm.storeType ?? "",
              onValueChange: (v) => setStoreForm((f) => ({ ...f, storeType: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STORE_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: storeForm.capacityM3 ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, capacityM3: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Material" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: storeForm.material ?? "",
              onValueChange: (v) => setStoreForm((f) => ({ ...f, material: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MATERIALS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Design Standard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: storeForm.designStandard ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, designStandard: e.target.value })),
              placeholder: "e.g. CIRIA 126"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Required Storage (months)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: storeForm.requiredStorage ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, requiredStorage: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: storeForm.status ?? "Compliant",
              onValueChange: (v) => setStoreForm((f) => ({ ...f, status: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STORE_STATUSES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agency Ref / Permit No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: storeForm.agencyRegistrationNumber ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, agencyRegistrationNumber: e.target.value })),
              placeholder: "EA permit or RPID ref"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: storeForm.notes ?? "",
              onChange: (e) => setStoreForm((f) => ({ ...f, notes: e.target.value })),
              rows: 2,
              placeholder: "General notes about this store…"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveStoreMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setStoreOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => saveStoreMut.mutate(storeForm),
            disabled: saveStoreMut.isPending,
            children: "Save"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: spreadOpen, onOpenChange: (o) => {
      setSpreadOpen(o);
      if (!o) saveSpreadMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Slurry / Manure Spreading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Spreading Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              max: today,
              value: spreadForm.spreadingDate ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, spreadingDate: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: spreadForm.storeId || "__none__",
              onValueChange: (v) => {
                if (v === "__none__") {
                  setSpreadForm((f) => ({ ...f, storeId: "" }));
                  return;
                }
                const store = stores.find((s) => String(s.id) === v);
                setSpreadForm((f) => ({
                  ...f,
                  storeId: v,
                  manureType: store?.material ? String(store.material) : f.manureType
                }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select store (optional)…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / unspecified" }),
                  stores.map((s) => {
                    const cap = storeCapacity[Number(s.id)];
                    const avail = cap?.available != null ? ` (${cap.available.toFixed(0)} m³ free)` : "";
                    const mat = s.material ? ` · ${s.material}` : "";
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                      String(s.storeName),
                      mat,
                      avail
                    ] }, s.id);
                  })
                ] })
              ]
            }
          ),
          spreadForm.storeId && spreadForm.storeId !== "__none__" && (() => {
            const store = stores.find((s) => String(s.id) === spreadForm.storeId);
            if (!store?.material) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#059669", marginTop: 4 }, children: [
              "✓ Material type set to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: String(store.material) }),
              " from store configuration."
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: spreadForm.fieldId || "__select__",
              onValueChange: (v) => {
                if (v === "__select__" || v === "__noop__") return;
                const field = (fieldsQ.data ?? []).find((f) => f.id.toString() === v);
                setSpreadForm((f) => ({
                  ...f,
                  fieldId: v,
                  fieldDescription: field?.name ?? "",
                  fieldAreaHa: f.fieldAreaHa || (field?.areaHectares ? parseFloat(field.areaHectares).toFixed(2) : "")
                }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__select__", disabled: true, children: "Select field…" }),
                  (fieldsQ.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__noop__", disabled: true, children: "No fields registered — add in Fields & Crops" }),
                  (fieldsQ.data ?? []).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f.id.toString(), children: f.name }, f.id))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.01",
              value: spreadForm.fieldAreaHa ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, fieldAreaHa: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manure / Material Type *" }),
          (() => {
            const sourceStore = stores.find((s) => String(s.id) === spreadForm.storeId);
            const locked = !!sourceStore?.material;
            if (locked) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1rem" }, children: "🔒" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: String(sourceStore.material) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.68rem", color: "#166534", margin: 0 }, children: "Locked to store configuration — species-specific storage enforced" })
                    ] })
                  ]
                }
              );
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: spreadForm.manureType ?? "",
                onValueChange: (v) => setSpreadForm((f) => ({ ...f, manureType: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPREAD_MATERIALS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
                ]
              }
            );
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume Applied (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.1",
              value: spreadForm.volumeAppliedM3 ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, volumeAppliedM3: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: spreadForm.applicationMethod ?? "",
              onValueChange: (v) => setSpreadForm((f) => ({ ...f, applicationMethod: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APPLICATION_METHODS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incorporation Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: spreadForm.incorporationMethod ?? "",
              onValueChange: (v) => setSpreadForm((f) => ({ ...f, incorporationMethod: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INCORPORATION_METHODS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StaffSelect,
            {
              value: spreadForm.operatorName ?? "",
              onChange: (v) => setSpreadForm((f) => ({ ...f, operatorName: v })),
              staffNames,
              loading: membersLoading
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.1",
              value: spreadForm.soilTemp ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, soilTemp: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ground / Weather Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: spreadForm.groundConditions ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, groundConditions: e.target.value })),
              placeholder: "e.g. dry, frozen, waterlogged"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: spreadForm.notes ?? "",
              onChange: (e) => setSpreadForm((f) => ({ ...f, notes: e.target.value })),
              rows: 2
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveSpreadMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSpreadOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => saveSpreadMut.mutate(spreadForm),
            disabled: saveSpreadMut.isPending,
            children: "Save"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: inspOpen,
        onOpenChange: (o) => {
          if (!o) {
            setInspOpen(false);
            setEditingInsp(null);
            setInspForm({});
            saveInspMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingInsp ? "Edit Inspection Record" : "Log Store Inspection" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: inspForm.storeId ?? inspStoreId,
                  onValueChange: (v) => {
                    setInspForm((f) => ({ ...f, storeId: v }));
                    setInspStoreId(v);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select store…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: String(s.storeName) }, String(s.id))) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  max: today,
                  value: inspForm.inspectionDate ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, inspectionDate: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: inspForm.inspectorName ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, inspectorName: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Organisation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  list: "inspector-org-options",
                  value: inspForm.inspectorOrganisation ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, inspectorOrganisation: e.target.value })),
                  placeholder: "e.g. Internal, AHDB, EA"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "inspector-org-options", children: (inspectorOrgsQ.data ?? []).map((org) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: org }, org)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: inspForm.outcome ?? "Pass",
                  onValueChange: (v) => setInspForm((f) => ({ ...f, outcome: v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pass", children: "Pass — No deficiencies" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Advisory", children: "Advisory — Minor issues noted" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Fail", children: "Fail — Deficiencies requiring action" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  value: inspForm.nextInspectionDue ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, nextInspectionDue: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: inspForm.freeboardOk === "true",
                        onChange: (e) => setInspForm((f) => ({
                          ...f,
                          freeboardOk: e.target.checked ? "true" : "false"
                        })),
                        style: { width: 16, height: 16 }
                      }
                    ),
                    "Freeboard adequate"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: inspForm.leaksOrDamageFound === "true",
                        onChange: (e) => setInspForm((f) => ({
                          ...f,
                          leaksOrDamageFound: e.target.checked ? "true" : "false"
                        })),
                        style: { width: 16, height: 16 }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        style: {
                          color: inspForm.leaksOrDamageFound === "true" ? "#dc2626" : "inherit"
                        },
                        children: "Leaks or structural damage found"
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Freeboard Measured (mm)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: inspForm.freeboardMm ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, freeboardMm: e.target.value })),
                  placeholder: "Distance from slurry surface to top of wall"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deficiencies Found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: inspForm.deficiencies ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, deficiencies: e.target.value })),
                  rows: 2,
                  placeholder: "Describe any deficiencies observed…"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: inspForm.actionsRequired ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, actionsRequired: e.target.value })),
                  rows: 2,
                  placeholder: "Describe actions needed to remedy deficiencies…"
                }
              ),
              (inspForm.actionsRequired?.trim() || inspForm.deficiencies?.trim() || inspForm.leaksOrDamageFound === "true") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#92400e", marginTop: 4 }, children: [
                "A task will be raised on the Task Board when you save — you can assign it to the responsible person.",
                inspForm.leaksOrDamageFound === "true" && /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { display: "block", color: "#dc2626", marginTop: 2 }, children: "⚠ Leaks / damage: an URGENT task will be created." })
              ] })
            ] }),
            (() => {
              const selectedStore = stores.find(
                (s) => String(s.id) === String(inspForm.storeId ?? inspStoreId)
              );
              if (String(selectedStore?.storeType ?? "") !== "Silage Clamp") return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs font-medium text-amber-800", children: "Silage Clamp — additional checks (SSAFO)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: inspForm.effluentContained === "true",
                          onChange: (e) => setInspForm((f) => ({
                            ...f,
                            effluentContained: e.target.checked ? "true" : "false"
                          })),
                          style: { width: 16, height: 16 }
                        }
                      ),
                      "Effluent contained (no runoff)"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: inspForm.coverSheetIntact === "true",
                          onChange: (e) => setInspForm((f) => ({
                            ...f,
                            coverSheetIntact: e.target.checked ? "true" : "false"
                          })),
                          style: { width: 16, height: 16 }
                        }
                      ),
                      "Cover sheet intact & weighted"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "checkbox",
                          checked: inspForm.wallsSound === "true",
                          onChange: (e) => setInspForm((f) => ({
                            ...f,
                            wallsSound: e.target.checked ? "true" : "false"
                          })),
                          style: { width: 16, height: 16 }
                        }
                      ),
                      "Clamp walls sound (no cracks/leans)"
                    ]
                  }
                )
              ] });
            })(),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: inspForm.notes ?? "",
                  onChange: (e) => setInspForm((f) => ({ ...f, notes: e.target.value })),
                  rows: 2,
                  placeholder: "Any other observations…"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveInspMut, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => {
                  setInspOpen(false);
                  setEditingInsp(null);
                  setInspForm({});
                },
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !inspForm.storeId || !inspForm.inspectionDate || !inspForm.outcome || saveInspMut.isPending,
                onClick: () => saveInspMut.mutate({
                  ...inspForm,
                  storeId: inspForm.storeId ?? inspStoreId
                }),
                children: editingInsp ? "Save Changes" : "Save Inspection"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: fillOpen, onOpenChange: (o) => {
      if (!o) {
        setFillOpen(false);
        setFillForm({});
        saveFillMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Slurry / Manure Fill Event" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Record each time slurry or manure is added into a storage store. This updates the calculated fill level shown in the store table." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              max: today,
              value: fillForm.eventDate ?? "",
              onChange: (e) => setFillForm((f) => ({ ...f, eventDate: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: fillForm.storeId || fillStoreId || "__select__",
              onValueChange: (v) => {
                setFillStoreId(v);
                setFillForm((f) => ({ ...f, storeId: v }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select store…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__select__", disabled: true, children: "Select store…" }),
                  stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                    String(s.storeName),
                    s.material ? ` · ${s.material}` : ""
                  ] }, s.id))
                ] })
              ]
            }
          ),
          (() => {
            const sid = fillForm.storeId || fillStoreId;
            if (!sid || sid === "__select__") return null;
            const store = stores.find((s) => String(s.id) === sid);
            if (!store) return null;
            const mat = store.material ? String(store.material) : null;
            const cap = storeCapacity[Number(store.id)];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, padding: "6px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: "0.72rem", color: "#166534" }, children: [
              mat && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Accepts: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: mat }),
                " "
              ] }),
              cap && cap.pct !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: cap.pct >= 90 ? "#dc2626" : "#166534" }, children: [
                "· Currently ",
                cap.current.toFixed(1),
                " m³ stored",
                cap.available !== null ? ` (${cap.available.toFixed(1)} m³ free)` : "",
                cap.pct >= 90 ? " ⚠ Near capacity" : ""
              ] }),
              !mat && !cap && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No material type configured for this store." })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Material Type *" }),
          (() => {
            const sid = fillForm.storeId || fillStoreId;
            const store = sid ? stores.find((s) => String(s.id) === sid) : null;
            const locked = !!store?.material;
            if (locked) {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1rem" }, children: "🔒" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: String(store.material) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.68rem", color: "#166534", margin: 0 }, children: [
                        "Locked — this store accepts ",
                        String(store.material),
                        " only"
                      ] })
                    ] })
                  ]
                }
              );
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: fillForm.materialType ?? "",
                onValueChange: (v) => setFillForm((f) => ({ ...f, materialType: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select material type…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SPREAD_MATERIALS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
                ]
              }
            );
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume Added (m³) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.1",
              min: "0",
              value: fillForm.volumeM3 ?? "",
              onChange: (e) => setFillForm((f) => ({ ...f, volumeM3: e.target.value })),
              placeholder: "0.0"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source / Origin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: fillForm.sourceDescription ?? "",
              onChange: (e) => setFillForm((f) => ({ ...f, sourceDescription: e.target.value })),
              placeholder: "e.g. cattle housing, dirty water, import"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: fillForm.notes ?? "",
              onChange: (e) => setFillForm((f) => ({ ...f, notes: e.target.value })),
              rows: 2,
              placeholder: "Any additional information…"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveFillMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setFillOpen(false);
          setFillForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !fillForm.eventDate || !(fillForm.storeId || fillStoreId) || !fillForm.volumeM3 || saveFillMut.isPending,
            onClick: () => {
              const sid = fillForm.storeId || fillStoreId;
              const store = sid ? stores.find((s) => String(s.id) === sid) : null;
              saveFillMut.mutate({
                ...fillForm,
                storeId: sid,
                materialType: fillForm.materialType || (store?.material ? String(store.material) : "")
              });
            },
            children: "Log Fill Event"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: raiseTaskOpen,
        onOpenChange: (o) => {
          if (!o) {
            setRaiseTaskOpen(false);
            setPendingTask(null);
            raiseTaskMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Raise a Task for Inspection Actions?" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                style: {
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: 6,
                  padding: "0.625rem 0.875rem"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }, children: "Actions required:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: 0 }, children: pendingTask?.description })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Assign to ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: taskAssigneeId, onValueChange: setTaskAssigneeId, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  memberFullName(m),
                  m.jobTitle ? ` — ${m.jobTitle}` : ""
                ] }, m.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  min: today,
                  value: taskDueDate,
                  onChange: (e) => setTaskDueDate(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "The assignee will receive an SMS notification. The task will appear on the Task Board and stay open until marked complete." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: raiseTaskMut, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => {
                  setRaiseTaskOpen(false);
                  setPendingTask(null);
                },
                children: "Skip for now"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !taskAssigneeId || raiseTaskMut.isPending,
                onClick: () => {
                  if (!pendingTask || !taskAssigneeId) return;
                  raiseTaskMut.mutate({
                    assignedToMemberId: Number(taskAssigneeId),
                    title: pendingTask.title,
                    description: pendingTask.description,
                    module: "Environmental",
                    taskType: "compliance",
                    href: "/environmental-management?tab=slurry",
                    ...taskDueDate ? { dueDate: taskDueDate } : {}
                  });
                },
                children: "Raise Task & Notify"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: deleteInspId !== null,
        onOpenChange: (o) => {
          if (!o) {
            setDeleteInspId(null);
            deleteInspMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Inspection Record" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this inspection record? This cannot be undone." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteInspMut, message: "Failed to delete — please try again." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteInspId(null), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "destructive",
                onClick: () => deleteInspId !== null && deleteInspMut.mutate(deleteInspId),
                disabled: deleteInspMut.isPending,
                children: "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function SilageTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [additiveOpen, setAdditiveOpen] = reactExports.useState(false);
  const [editingAdditive, setEditingAdditive] = reactExports.useState(null);
  const [additiveForm, setAdditiveForm] = reactExports.useState({});
  const [deleteAdditiveId, setDeleteAdditiveId] = reactExports.useState(null);
  const [qualityOpen, setQualityOpen] = reactExports.useState(false);
  const [qualityMode, setQualityMode] = reactExports.useState("log");
  const [editingQuality, setEditingQuality] = reactExports.useState(null);
  const [qualityForm, setQualityForm] = reactExports.useState({});
  const [deleteQualityId, setDeleteQualityId] = reactExports.useState(null);
  const [raiseTaskOpen, setRaiseTaskOpen] = reactExports.useState(false);
  const [pendingTask, setPendingTask] = reactExports.useState(null);
  const storesQ = useQuery({
    queryKey: ["slurry-stores", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/slurry-stores`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const stores = (storesQ.data ?? []).filter(
    (s) => String(s.storeType ?? "") === "Silage Clamp"
  );
  const additivesQ = useQuery({
    queryKey: ["silage-additives", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-additive-records`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const qualityQ = useQuery({
    queryKey: ["silage-quality-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-quality-tests`, { credentials: "include" }).then(
      (r) => r.json()
    ),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const saveAdditiveMut = useMutation({
    mutationFn: (body) => {
      const url = editingAdditive ? `/api/farms/${farmId}/silage-additive-records/${editingAdditive.id}` : `/api/farms/${farmId}/silage-additive-records`;
      return fetch(url, {
        method: editingAdditive ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-additives", farmId] });
      setAdditiveOpen(false);
      setEditingAdditive(null);
      setAdditiveForm({});
      toast({ title: "Additive record saved" });
    },
    onError: () => toast({ title: "Failed to save additive record", variant: "destructive" })
  });
  const deleteAdditiveMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/silage-additive-records/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-additives", farmId] });
      setDeleteAdditiveId(null);
      toast({ title: "Additive record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const saveQualityMut = useMutation({
    mutationFn: (body) => {
      const url = editingQuality ? `/api/farms/${farmId}/silage-quality-tests/${editingQuality.id}` : `/api/farms/${farmId}/silage-quality-tests`;
      return fetch(url, {
        method: editingQuality ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["silage-quality-tests", farmId] });
      setQualityOpen(false);
      setEditingQuality(null);
      setQualityForm({});
      toast({ title: "Quality test saved" });
      const ph = variables.ph ? parseFloat(String(variables.ph)) : null;
      const ammoniaN = variables.ammoniaN ? parseFloat(String(variables.ammoniaN)) : null;
      const dryMatterPct = variables.dryMatterPct ? parseFloat(String(variables.dryMatterPct)) : null;
      const phFailed = ph !== null && !isNaN(ph) && ph > 4.5;
      const ammoniaFailed = ammoniaN !== null && !isNaN(ammoniaN) && ammoniaN > 15;
      const dmFailed = dryMatterPct !== null && !isNaN(dryMatterPct) && dryMatterPct < 25;
      if (phFailed || ammoniaFailed || dmFailed) {
        const store = (storesQ.data ?? []).find((s) => String(s.id) === String(variables.storeId));
        const storeName2 = store ? String(store.storeName ?? "clamp") : "clamp";
        const dateStr = variables.testDate ? new Date(variables.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
        const parts = [];
        if (phFailed)
          parts.push(`pH is ${ph} (above 4.5) — poor fermentation, elevated listeria/clostridial risk. Review before feeding.`);
        if (ammoniaFailed)
          parts.push(`Ammonia-N is ${ammoniaN}% of total N (above 15%) — indicates spoilage/proteolysis. May be unsuitable to feed; seek nutritionist/vet advice.`);
        if (dmFailed)
          parts.push(`Dry Matter is ${dryMatterPct}% (below 25%) — high effluent risk. Check clamp drainage/effluent containment (SSAFO).`);
        setPendingTask({
          title: `[Silage Quality] ${storeName2} test out of range (${dateStr})`,
          description: parts.join("\n\n")
        });
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save quality test", variant: "destructive" })
  });
  const deleteQualityMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/silage-quality-tests/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-quality-tests", farmId] });
      setDeleteQualityId(null);
      toast({ title: "Quality test deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const [stockOpen, setStockOpen] = reactExports.useState(false);
  const [editingStock, setEditingStock] = reactExports.useState(null);
  const [stockForm, setStockForm] = reactExports.useState({});
  const [deleteStockId, setDeleteStockId] = reactExports.useState(null);
  const [usageOpen, setUsageOpen] = reactExports.useState(false);
  const [usageForStock, setUsageForStock] = reactExports.useState(null);
  const [usageForm, setUsageForm] = reactExports.useState({});
  const stockQ = useQuery({
    queryKey: ["silage-haylage-balance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-haylage-balance`, { credentials: "include" }).then((r) => r.json()),
    select: (d) => d.records ?? []
  });
  const stockRows = stockQ.data ?? [];
  const saveStockMut = useMutation({
    mutationFn: async (body) => {
      const url = editingStock ? `/api/farms/${farmId}/silage-haylage-stock/${editingStock.id}` : `/api/farms/${farmId}/silage-haylage-stock`;
      const r = await fetch(url, { method: editingStock ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] });
      setStockOpen(false);
      setEditingStock(null);
      setStockForm({});
      toast({ title: editingStock ? "Stock updated" : "Batch logged" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteStockMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/silage-haylage-stock/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] });
      setDeleteStockId(null);
      toast({ title: "Batch deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const saveUsageMut = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(`/api/farms/${farmId}/silage-haylage-usage`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] });
      setUsageOpen(false);
      setUsageForStock(null);
      setUsageForm({});
      toast({ title: "Drawdown recorded" });
    },
    onError: () => toast({ title: "Failed to record drawdown", variant: "destructive" })
  });
  const additives = additivesQ.data ?? [];
  const qualityTests = qualityQ.data ?? [];
  const storeName = (id) => (storesQ.data ?? []).find((s) => Number(s.id) === Number(id))?.storeName ?? "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Silage & Haylage Stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditingStock(null);
          setStockForm({ harvestDate: today, status: "in-store" });
          setStockOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
          " Log Batch"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground p-4", children: "Loading…" }) : stockRows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No silage or haylage batches logged yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Type", "Cut", "Source Field", "Harvest Date", "Qty In", "Used", "Remaining", "DM%", "Clamp", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: stockRows.map((r) => {
          const isBales = r.quantityBales != null;
          const qtyIn = isBales ? `${r.quantityBales ?? 0} bales` : r.quantityTonnes != null ? `${parseFloat(String(r.quantityTonnes)).toFixed(1)} t` : "—";
          const usedDisplay = isBales ? `${r.usedBales ?? 0} bales` : `${(r.usedTonnes ?? 0).toFixed(1)} t`;
          const rem = isBales ? r.remainingBales != null ? `${r.remainingBales} bales` : "—" : r.remainingTonnes != null ? `${parseFloat(String(r.remainingTonnes)).toFixed(1)} t` : "—";
          const remPct = isBales && r.quantityBales ? Math.max(0, Math.min(100, (r.remainingBales ?? r.quantityBales) / r.quantityBales * 100)) : !isBales && r.quantityTonnes ? Math.max(0, Math.min(100, (r.remainingTonnes ?? r.quantityTonnes) / parseFloat(String(r.quantityTonnes)) * 100)) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.cropType ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.cutNumber ? `${r.cutNumber}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.fieldOfOrigin ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: r.harvestDate ? new Date(r.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: qtyIn }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-amber-700", children: usedDisplay }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: remPct != null && remPct < 20 ? "text-red-700 font-semibold" : remPct != null && remPct < 40 ? "text-amber-700" : "text-green-700", children: rem }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.dryMatterPercent != null ? `${r.dryMatterPercent}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.storeName ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Record drawdown", onClick: () => {
                setUsageForStock(r);
                setUsageForm({ stockId: r.id, usageDate: today });
                setUsageOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 text-blue-500" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
                setEditingStock(r);
                setStockForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
                setStockOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeleteStockId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-red-500" }) })
            ] })
          ] }, r.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Silage / Haylage Additive Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => {
              setEditingAdditive(null);
              setAdditiveForm({ applicationDate: today });
              setAdditiveOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              " Add Record"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: additivesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground p-4", children: "Loading…" }) : additives.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No additive / inoculant records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Store", "Crop", "Product", "Rate", "Applied By", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: additives.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(r.applicationDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.storeName ?? storeName(r.storeId)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.cropType ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.productName ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.applicationRate ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.appliedBy ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  setEditingAdditive(r);
                  setAdditiveForm(
                    Object.fromEntries(
                      Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])
                    )
                  );
                  setAdditiveOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeleteAdditiveId(Number(r.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-red-500" }) })
          ] })
        ] }, Number(r.id))) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Silage Quality & Dry Matter Tests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => {
              setEditingQuality(null);
              setQualityMode("log");
              setQualityForm({ testDate: today });
              setQualityOpen(true);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
              " Log Sample"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto", children: qualityQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground p-4", children: "Loading…" }) : qualityTests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No quality test records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-black/5 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Store", "DM %", "pH", "ME (MJ/kg)", "Crude Protein %", "Lab", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: qualityTests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-black/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmt(r.testDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.storeName ?? storeName(r.storeId)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: !r.dryMatterPct ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : String(r.dryMatterPct) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.ph ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.metabolisableEnergy ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.crudeProteinPct ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: String(r.labName ?? "—") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right whitespace-nowrap", children: [
            !r.dryMatterPct && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "mr-1 h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50",
                onClick: () => {
                  setEditingQuality(r);
                  setQualityMode("result");
                  setQualityForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
                  setQualityOpen(true);
                },
                children: "Enter results"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => {
                  setEditingQuality(r);
                  setQualityMode("edit");
                  setQualityForm(
                    Object.fromEntries(
                      Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])
                    )
                  );
                  setQualityOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setDeleteQualityId(Number(r.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 text-red-500" }) })
          ] })
        ] }, Number(r.id))) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: additiveOpen,
        onOpenChange: (o) => {
          setAdditiveOpen(o);
          if (!o) {
            setEditingAdditive(null);
            setAdditiveForm({});
            saveAdditiveMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingAdditive ? "Edit Additive Record" : "Add Silage Additive / Inoculant Record" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "date",
                  max: today,
                  value: additiveForm.applicationDate ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, applicationDate: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store / Clamp" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: additiveForm.storeId ?? "",
                  onValueChange: (v) => setAdditiveForm((f) => ({ ...f, storeId: v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select clamp…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: String(s.storeName) }, String(s.id))) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: additiveForm.cropType ?? "",
                  onValueChange: (v) => setAdditiveForm((f) => ({ ...f, cropType: v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Grass Silage", children: "Grass Silage" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Maize Silage", children: "Maize Silage" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Wholecrop", children: "Wholecrop" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Haylage", children: "Haylage" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: additiveForm.productName ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, productName: e.target.value })),
                  placeholder: "e.g. Ecosyl, Magniva, propionic acid"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Additive Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: additiveForm.additiveType ?? "",
                  onValueChange: (v) => setAdditiveForm((f) => ({ ...f, additiveType: v })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Bacterial Inoculant", children: "Bacterial Inoculant" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Acid-based", children: "Acid-based" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Enzyme", children: "Enzyme" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other" })
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Rate" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: additiveForm.applicationRate ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, applicationRate: e.target.value })),
                  placeholder: "e.g. 3L/tonne"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch / Lot Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: additiveForm.batchNumber ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, batchNumber: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applied By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: additiveForm.appliedBy ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, appliedBy: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: additiveForm.notes ?? "",
                  onChange: (e) => setAdditiveForm((f) => ({ ...f, notes: e.target.value })),
                  rows: 2
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveAdditiveMut, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAdditiveOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !additiveForm.applicationDate || !additiveForm.productName || saveAdditiveMut.isPending,
                onClick: () => saveAdditiveMut.mutate(additiveForm),
                children: editingAdditive ? "Save Changes" : "Save Record"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: qualityOpen,
        onOpenChange: (o) => {
          setQualityOpen(o);
          if (!o) {
            setEditingQuality(null);
            setQualityForm({});
            saveQualityMut.reset();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: qualityMode === "log" ? "Log Silage Quality Sample" : qualityMode === "result" ? "Enter Silage Quality Results" : "Edit Silage Quality Test" }) }),
          qualityMode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sampling event now. Return to enter laboratory results once the report arrives." }),
          qualityMode === "result" && editingQuality && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
            "Sample from ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(editingQuality.testDate) }),
            " · ",
            String(editingQuality.storeName ?? storeName(editingQuality.storeId)),
            ". Enter results from your lab report."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            qualityMode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "date",
                    max: today,
                    value: qualityForm.testDate ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, testDate: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store / Clamp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: qualityForm.storeId ?? "",
                    onValueChange: (v) => setQualityForm((f) => ({ ...f, storeId: v })),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select clamp…" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stores.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: String(s.storeName) }, String(s.id))) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab / Analyser" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: qualityForm.labName ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, labName: e.target.value })),
                    placeholder: "e.g. Trouw Nutrition, NIRS on-farm"
                  }
                )
              ] })
            ] }),
            qualityMode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry Matter %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.1",
                    value: qualityForm.dryMatterPct ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, dryMatterPct: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "pH" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.1",
                    value: qualityForm.ph ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, ph: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Metabolisable Energy (MJ/kg DM)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.1",
                    value: qualityForm.metabolisableEnergy ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, metabolisableEnergy: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crude Protein %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.1",
                    value: qualityForm.crudeProteinPct ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, crudeProteinPct: e.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ammonia-N (% of total N)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    step: "0.1",
                    value: qualityForm.ammoniaN ?? "",
                    onChange: (e) => setQualityForm((f) => ({ ...f, ammoniaN: e.target.value }))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: qualityForm.notes ?? "",
                  onChange: (e) => setQualityForm((f) => ({ ...f, notes: e.target.value })),
                  rows: 2
                }
              )
            ] }),
            qualityMode !== "log" && (() => {
              const ph = qualityForm.ph ? parseFloat(String(qualityForm.ph)) : null;
              const ammoniaN = qualityForm.ammoniaN ? parseFloat(String(qualityForm.ammoniaN)) : null;
              const dryMatterPct = qualityForm.dryMatterPct ? parseFloat(String(qualityForm.dryMatterPct)) : null;
              const flags = [];
              if (ph !== null && !isNaN(ph) && ph > 4.5) flags.push("pH above 4.5 — fermentation/listeria risk");
              if (ammoniaN !== null && !isNaN(ammoniaN) && ammoniaN > 15) flags.push("Ammonia-N above 15% — spoilage risk");
              if (dryMatterPct !== null && !isNaN(dryMatterPct) && dryMatterPct < 25) flags.push("DM below 25% — effluent/pollution risk");
              if (flags.length === 0) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-800", children: "Out of normal range — a task will be raised on the Task Board when you save." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs text-amber-700 mt-1 list-disc pl-4", children: flags.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: f }, f)) })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveQualityMut, message: "Failed to save — your entries are still here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setQualityOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                disabled: !qualityForm.testDate || saveQualityMut.isPending,
                onClick: () => saveQualityMut.mutate(qualityForm),
                children: qualityMode === "log" ? "Log Sample" : qualityMode === "result" ? "Save Results" : "Save Changes"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: stockOpen, onOpenChange: (v) => {
      if (!v) {
        setStockOpen(false);
        setEditingStock(null);
        setStockForm({});
        saveStockMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingStock ? "Edit Batch" : "Log Silage / Haylage Batch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.cropType ?? "", onValueChange: (v) => setStockForm((p) => ({ ...p, cropType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Grass Silage", "Maize Silage", "Wholecrop", "Haylage", "Hay", "Other"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cut Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockForm.cutNumber ? String(stockForm.cutNumber) : "", onValueChange: (v) => setStockForm((p) => ({ ...p, cutNumber: Number(v) })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: n }, n)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stockForm.harvestDate ?? "", onChange: (e) => setStockForm((p) => ({ ...p, harvestDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Field name or reference", value: stockForm.fieldOfOrigin ?? "", onChange: (e) => setStockForm((p) => ({ ...p, fieldOfOrigin: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 120", value: stockForm.quantityTonnes ?? "", onChange: (e) => setStockForm((p) => ({ ...p, quantityTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Bales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "for baled crops", value: stockForm.quantityBales ?? "", onChange: (e) => setStockForm((p) => ({ ...p, quantityBales: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bale Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 550", value: stockForm.baleWeightKg ?? "", onChange: (e) => setStockForm((p) => ({ ...p, baleWeightKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry Matter %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 30", value: stockForm.dryMatterPercent ?? "", onChange: (e) => setStockForm((p) => ({ ...p, dryMatterPercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clamp / Store Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Main clamp, North yard", value: stockForm.storeName ?? "", onChange: (e) => setStockForm((p) => ({ ...p, storeName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: stockForm.notes ?? "", onChange: (e) => setStockForm((p) => ({ ...p, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveStockMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setStockOpen(false);
          setEditingStock(null);
          setStockForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: saveStockMut.isPending || !stockForm.cropType, onClick: () => saveStockMut.mutate({ cropType: stockForm.cropType, cutNumber: stockForm.cutNumber ? Number(stockForm.cutNumber) : null, harvestDate: stockForm.harvestDate || null, fieldOfOrigin: stockForm.fieldOfOrigin || null, quantityTonnes: stockForm.quantityTonnes ? parseFloat(stockForm.quantityTonnes) : null, quantityBales: stockForm.quantityBales ? parseInt(stockForm.quantityBales) : null, baleWeightKg: stockForm.baleWeightKg ? parseFloat(stockForm.baleWeightKg) : null, dryMatterPercent: stockForm.dryMatterPercent ? parseFloat(stockForm.dryMatterPercent) : null, storeName: stockForm.storeName || null, status: stockForm.status || "in-store", notes: stockForm.notes || null }), children: [
          saveStockMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1 animate-spin" }),
          editingStock ? "Save Changes" : "Log Batch"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: usageOpen, onOpenChange: (v) => {
      if (!v) {
        setUsageOpen(false);
        setUsageForStock(null);
        setUsageForm({});
        saveUsageMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Drawdown — ",
        usageForStock?.cropType ?? "Batch"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: usageForm.usageDate ?? "", onChange: (e) => setUsageForm((p) => ({ ...p, usageDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: usageForm.quantityTonnes ?? "", onChange: (e) => setUsageForm((p) => ({ ...p, quantityTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (bales)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: usageForm.quantityBales ?? "", onChange: (e) => setUsageForm((p) => ({ ...p, quantityBales: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: usageForm.purpose ?? "", onValueChange: (v) => setUsageForm((p) => ({ ...p, purpose: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select purpose" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["feeding", "bedding", "sold", "waste"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p.charAt(0).toUpperCase() + p.slice(1) }, p)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Livestock Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Dairy herd, Flock 1", value: usageForm.herdName ?? "", onChange: (e) => setUsageForm((p) => ({ ...p, herdName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: usageForm.notes ?? "", onChange: (e) => setUsageForm((p) => ({ ...p, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveUsageMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setUsageOpen(false);
          setUsageForStock(null);
          setUsageForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saveUsageMut.isPending, onClick: () => saveUsageMut.mutate({ stockId: usageForStock?.id, usageDate: usageForm.usageDate || null, quantityTonnes: usageForm.quantityTonnes ? parseFloat(usageForm.quantityTonnes) : null, quantityBales: usageForm.quantityBales ? parseInt(usageForm.quantityBales) : null, purpose: usageForm.purpose || null, herdName: usageForm.herdName || null, notes: usageForm.notes || null }), children: "Record Drawdown" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteStockId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteStockId(null);
        deleteStockMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Stock Batch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this silage / haylage batch? All drawdown records for this batch will also be removed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteStockMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteStockId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteStockMut.isPending, onClick: () => deleteStockId !== null && deleteStockMut.mutate(deleteStockId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteAdditiveId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteAdditiveId(null);
        deleteAdditiveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Additive Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this additive record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteAdditiveMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteAdditiveId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: () => deleteAdditiveId !== null && deleteAdditiveMut.mutate(deleteAdditiveId),
            disabled: deleteAdditiveMut.isPending,
            children: "Delete"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteQualityId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteQualityId(null);
        deleteQualityMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Quality Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Delete this quality test record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteQualityMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteQualityId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            onClick: () => deleteQualityId !== null && deleteQualityMut.mutate(deleteQualityId),
            disabled: deleteQualityMut.isPending,
            children: "Delete"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: raiseTaskOpen,
        onClose: () => {
          setRaiseTaskOpen(false);
          setPendingTask(null);
        },
        defaultTitle: pendingTask?.title ?? "",
        defaultDescription: pendingTask?.description ?? "",
        taskType: "silage_quality_out_of_range",
        module: "Silage & Haylage"
      }
    )
  ] });
}
export {
  EnvironmentalPageFull as default
};
