import React, { useState, useRef, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, Leaf, TreePine, MapPin, Printer, ClipboardCheck, CalendarDays, Pencil, Eye, AlertTriangle, Droplets, MessageSquare } from "lucide-react";
import { StorageLocationMapPicker } from "@/components/storage/StorageLocationMapPicker";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

type Tab = "features" | "schemes" | "assessments" | "events" | "sfi" | "slurry" | "silage";
interface LatLng { lat: number; lng: number; }

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "#dcfce7", color: "#166534" },
    completed: { bg: "#eff6ff", color: "#1e40af" },
    expired: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }}>{status}</Badge>;
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pass: { bg: "#dcfce7", color: "#166534", label: "Pass" },
    advisory: { bg: "#fef3c7", color: "#92400e", label: "Pass with Advisories" },
    fail: { bg: "#fee2e2", color: "#991b1b", label: "Fail" },
  };
  const s = map[outcome] ?? { bg: "#f3f4f6", color: "#374151", label: outcome };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.75rem" }}>{s.label}</Badge>;
}

function FeatureTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    hedgerow: "Hedgerow",
    pond: "Pond",
    woodland: "Woodland",
    wetland: "Wetland",
    grassland: "Grassland",
    wildflower_margin: "Wildflower Margin",
    watercourse: "Watercourse",
    buffer_strip: "Buffer Strip",
    other: "Other",
  };
  return <span>{labels[type] ?? type}</span>;
}

function featureTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hedgerow: "Hedgerow", pond: "Pond", woodland: "Woodland", wetland: "Wetland",
    grassland: "Grassland", wildflower_margin: "Wildflower Margin",
    watercourse: "Watercourse", buffer_strip: "Buffer Strip", other: "Other",
  };
  return labels[type] ?? type;
}

function printFeatureRegister(features: any[], schemes: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const rows = features.map((r: any) => {
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

  const schemeRows = schemes.filter((s: any) => s.status === "active").map((s: any) => `
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

// ─── Report print functions ───────────────────────────────────────────────────

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

function openPrintWindow(title: string, html: string) {
  const w = window.open("", "_blank", "width=920,height=700");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS_BASE}</style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

function printAssessmentHistory(records: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...records].sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  const rows = sorted.map(r => {
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

const EVENT_TYPE_LABELS: Record<string, string> = {
  hedge_trimming: "Hedge Trimming", hedge_laying: "Hedge Laying", hedge_coppicing: "Hedge Coppicing",
  ditch_clearance: "Ditch Clearance", pond_management: "Pond Management", tree_planting: "Tree Planting",
  grass_cutting: "Grass Cutting", grazing_management: "Grazing Management", spraying: "Spraying",
  weed_control: "Weed Control", soil_sampling: "Soil Sampling", water_management: "Water Management",
  wildflower_seeding: "Wildflower Seeding", other: "Other",
};

function printManagementEventLog(records: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...records].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  const rows = sorted.map(r => `<tr>
    <td style="white-space:nowrap">${new Date(r.eventDate).toLocaleDateString("en-GB")}</td>
    <td>${EVENT_TYPE_LABELS[r.eventType] ?? r.eventType ?? "—"}</td>
    <td>${r.featureName || r.featureType || "—"}</td>
    <td>${r.description || "—"}</td>
    <td>${r.contractorUsed ? (r.contractorName || "Contractor") : (r.operator || "—")}</td>
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

function printSchemeSummary(records: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const active = records.filter(r => r.status === "active");
  const totalPence = active.reduce((s, r) => s + (r.annualPaymentPence ?? 0), 0);
  const rows = records.map(r => {
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

function printSFISummary(agreements: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const active = agreements.filter(r => (r.status as string) === "Active");
  const total = active.reduce((s, r) => s + (Number(r.totalAnnualPayment) || 0), 0);
  const rows = agreements.map(r => {
    const isActive = (r.status as string) === "Active";
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

function EnvironmentalFeaturesTab({ farmId, schemes }: { farmId: number; schemes: any[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pin, setPin] = useState<LatLng | null>(null);
  const emptyForm = () => ({
    featureType: "", description: "", areaHectares: "", lengthMetres: "",
    managementPractice: "", dateRecorded: "", notes: "", fieldId: "", isEnclosed: false,
  });
  const [form, setForm] = useState<any>(emptyForm());

  const fieldsQuery = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Array<{ id: number; name: string; areaHectares?: string | null }>,
  });
  const fields = fieldsQuery.data ?? [];

  const q = useQuery({
    queryKey: ["environmental-features", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-features`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["environmental-features", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/environmental-features`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Feature saved" }); invalidate(); setAddOpen(false); setForm(emptyForm()); setPin(null); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/environmental-features/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Feature updated" }); invalidate(); setEditRecord(null); setForm(emptyForm()); setPin(null); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/environmental-features/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openEdit(r: any) {
    setForm({
      featureType: r.featureType ?? "",
      description: r.description ?? "",
      areaHectares: r.areaHectares != null ? String(parseFloat(r.areaHectares)) : "",
      lengthMetres: r.lengthMetres != null ? String(parseFloat(r.lengthMetres)) : "",
      managementPractice: r.managementPractice ?? "",
      dateRecorded: r.dateRecorded ? new Date(r.dateRecorded).toISOString().slice(0, 10) : "",
      notes: r.notes ?? "",
      fieldId: r.fieldId != null ? String(r.fieldId) : "",
      isEnclosed: !!r.isEnclosed,
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
  const records: any[] = q.data ?? [];
  const totalHa = records.reduce((s, r) => s + (r.areaHectares ? parseFloat(r.areaHectares) : 0), 0);
  const totalM = records.reduce((s, r) => s + (r.lengthMetres ? parseFloat(r.lengthMetres) : 0), 0);

  return (
    <div>
      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Features</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{records.length}</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Area</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{totalHa.toFixed(2)} ha</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Length</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{totalM > 1000 ? `${(totalM / 1000).toFixed(1)} km` : `${Math.round(totalM)} m`}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => printFeatureRegister(records, schemes, farmId)}>
          <Printer size={14} />Print Feature Register
        </Button>
        <Button size="sm" onClick={() => { setForm(emptyForm()); setPin(null); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Add Feature
        </Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Leaf size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No environmental features recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Map hedgerows, ponds, woodland and other habitats on your farm.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Feature Type", "Description", "Area (ha)", "Length (m)", "Management Practice", "GPS", "Date Recorded", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => {
                const hasGps = r.latitude && r.longitude;
                return (
                  <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}><FeatureTypeLabel type={r.featureType} /></td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }}>{r.description || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.areaHectares != null ? parseFloat(r.areaHectares).toFixed(2) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.lengthMetres != null ? parseFloat(r.lengthMetres).toFixed(0) : "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.managementPractice || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {hasGps ? (
                        <a href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`}
                          target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#2563eb", fontFamily: "monospace", textDecoration: "none" }}>
                          <MapPin size={11} />{parseFloat(r.latitude).toFixed(4)}, {parseFloat(r.longitude).toFixed(4)}
                        </a>
                      ) : <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Not set</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.dateRecorded)}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                        <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm()); setPin(null); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: "56rem" }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Environmental Feature" : "Add Environmental Feature"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="space-y-3">
              <div><Label>Feature Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.featureType} onValueChange={v => setForm((f: any) => ({ ...f, featureType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {["hedgerow", "pond", "woodland", "wetland", "grassland", "wildflower_margin", "watercourse", "buffer_strip", "other"].map(t => (
                      <SelectItem key={t} value={t}><FeatureTypeLabel type={t} /></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date Recorded <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.dateRecorded} onChange={e => setForm((f: any) => ({ ...f, dateRecorded: e.target.value }))} /></div>
              <div><Label>Description</Label><Input placeholder="e.g. Northern boundary hedgerow" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Area (hectares)</Label><Input type="number" step="0.0001" min="0" value={form.areaHectares} onChange={e => setForm((f: any) => ({ ...f, areaHectares: e.target.value }))} /></div>
                <div><Label>Length (metres)</Label><Input type="number" step="0.1" min="0" value={form.lengthMetres} onChange={e => setForm((f: any) => ({ ...f, lengthMetres: e.target.value }))} /></div>
              </div>
              <div><Label>Management Practice</Label><Input placeholder="e.g. Annual trim, no autumn cutting" value={form.managementPractice} onChange={e => setForm((f: any) => ({ ...f, managementPractice: e.target.value }))} /></div>
              <div>
                <Label>Associated Field <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></Label>
                <Select value={form.fieldId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, fieldId: v === "__none__" ? "" : v, isEnclosed: v === "__none__" ? false : f.isEnclosed }))}>
                  <SelectTrigger><SelectValue placeholder="None — farm-wide feature" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None — farm-wide feature</SelectItem>
                    {fields.map((fld: any) => (
                      <SelectItem key={fld.id} value={String(fld.id)}>{fld.name}{fld.areaHectares ? ` (${parseFloat(String(fld.areaHectares)).toFixed(2)} ha)` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.fieldId && form.fieldId !== "__none__" && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7 }}>
                  <input type="checkbox" id="isEnclosed" checked={!!form.isEnclosed} onChange={e => setForm((f: any) => ({ ...f, isEnclosed: e.target.checked }))} style={{ width: 15, height: 15, marginTop: 2 }} />
                  <label htmlFor="isEnclosed" style={{ cursor: "pointer", fontSize: "0.875rem", color: "#111827" }}>
                    <strong>Wholly enclosed within this field</strong>
                    <p style={{ fontWeight: 400, fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }}>
                      Tick this if the feature (e.g. copse, pond) sits entirely within the field boundary. Its area will be deducted from the field's farmable area, affecting yield and rate calculations.
                    </p>
                  </label>
                </div>
              )}
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              {editRecord ? (
                <div>
                  <Label className="block mb-1.5">Photos &amp; Attachments</Label>
                  <RecordAttachments farmId={farmId} recordType="environmental_feature" recordId={editRecord.id} compact />
                </div>
              ) : (
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                  📎 Save the feature first, then re-open it to attach photos or documents.
                </p>
              )}
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-2"><MapPin size={14} className="text-muted-foreground" />GPS Pin Location</Label>
              <StorageLocationMapPicker key={dialogOpen ? "open" : "closed"} value={pin} onChange={setPin} mapHeight={400} />
            </div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm()); setPin(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.featureType || !form.dateRecorded || createMut.isPending || updateMut.isPending}>
              {editRecord ? "Save Changes" : "Save Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Leaf size={16} className="text-green-600" />Environmental Feature</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                {([
                  { label: "Feature Type", value: <FeatureTypeLabel type={viewRecord.featureType} /> },
                  { label: "Date Recorded", value: fmt(viewRecord.dateRecorded) },
                  { label: "Description", value: viewRecord.description || "—", full: true },
                  { label: "Area", value: viewRecord.areaHectares ? `${parseFloat(viewRecord.areaHectares).toFixed(2)} ha` : "—" },
                  { label: "Length", value: viewRecord.lengthMetres ? `${parseFloat(viewRecord.lengthMetres).toFixed(0)} m` : "—" },
                  { label: "Management Practice", value: viewRecord.managementPractice || "—", full: true },
                  { label: "GPS Location", value: viewRecord.latitude && viewRecord.longitude ? `${parseFloat(viewRecord.latitude).toFixed(5)}, ${parseFloat(viewRecord.longitude).toFixed(5)}` : "Not set" },
                  { label: "Notes", value: viewRecord.notes || "—", full: true },
                ] as { label: string; value: React.ReactNode; full?: boolean }[]).map(({ label, value, full }) => (
                  <div key={label} style={full ? { gridColumn: "1 / -1" } : {}}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 3 }}>{label}</p>
                    <div style={{ fontSize: "0.875rem", color: "#111827" }}>{value}</div>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>Photos &amp; Attachments</p>
                <RecordAttachments farmId={farmId} recordType="environmental_feature" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Feature</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Feature</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this environmental feature record? This cannot be undone.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgriEnvSchemesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewScheme, setViewScheme] = useState<any | null>(null);
  const [schemeTab, setSchemeTab] = useState<"details" | "communications">("details");
  const [schemeCommOpen, setSchemeCommOpen] = useState(false);
  const [schemeCommForm, setSchemeCommForm] = useState<any>({ commDate: new Date().toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" });
  const [form, setForm] = useState<any>({
    schemeName: "", agreementNumber: "", startDate: "", endDate: "",
    annualPaymentPence: "", obligations: "", status: "active", notes: "",
  });

  const q = useQuery({
    queryKey: ["agri-schemes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["agri-schemes", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/agri-schemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, annualPaymentPence: body.annualPaymentPence ? Math.round(parseFloat(body.annualPaymentPence) * 100) : null }),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Scheme saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/agri-schemes/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ schemeName: "", agreementNumber: "", startDate: "", endDate: "", annualPaymentPence: "", obligations: "", status: "active", notes: "" });

  const schemeCommsQ = useQuery({
    queryKey: ["scheme-comms", farmId, viewScheme?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme!.id}/communications`).then(r => r.json()),
    enabled: !!viewScheme,
  });
  const addSchemeCommMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme?.id}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheme-comms", farmId, viewScheme?.id] }); setSchemeCommOpen(false); setSchemeCommForm({ commDate: new Date().toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" }); toast({ title: "Communication logged" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const delSchemeCommMut = useMutation({
    mutationFn: (commId: number) => fetch(`/api/farms/${farmId}/agri-schemes/${viewScheme?.id}/communications/${commId}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheme-comms", farmId, viewScheme?.id] }); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const activeSchemes = records.filter(r => r.status === "active");
  const totalAnnual = activeSchemes.reduce((s, r) => s + (r.annualPaymentPence ?? 0), 0);

  return (
    <div>
      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Active Schemes</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>{activeSchemes.length}</p>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Annual Payment</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>{fmtAmt(totalAnnual)}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        {records.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => printSchemeSummary(records, farmId)}>
            <Printer size={14} className="mr-1" />Print Summary
          </Button>
        )}
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Scheme</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <TreePine size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No agri-environment schemes</p>
          <p style={{ fontSize: "0.875rem" }}>Record Countryside Stewardship, SFI, and other agri-environment scheme agreements.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Scheme Name", "Agreement No.", "Start Date", "End Date", "Annual Payment", "Status", "Obligations", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.schemeName}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.agreementNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.startDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.endDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtAmt(r.annualPaymentPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><StatusBadge status={r.status || "active"} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, fontSize: "0.8rem" }}>{r.obligations || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => { setViewScheme(r); setSchemeTab("details"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) { resetForm(); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Agri-Environment Scheme</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Scheme Name <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input placeholder="e.g. Countryside Stewardship, SFI, HLS" value={form.schemeName} onChange={e => setForm((f: any) => ({ ...f, schemeName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Agreement Number</Label><Input value={form.agreementNumber} onChange={e => setForm((f: any) => ({ ...f, agreementNumber: e.target.value }))} /></div>
              <div><Label>Annual Payment (£)</Label><Input type="number" step="0.01" min="0" value={form.annualPaymentPence} onChange={e => setForm((f: any) => ({ ...f, annualPaymentPence: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.startDate} onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm((f: any) => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Obligations</Label><Textarea placeholder="Key obligations and actions required under this scheme..." value={form.obligations} onChange={e => setForm((f: any) => ({ ...f, obligations: e.target.value }))} rows={3} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.schemeName || !form.startDate || createMut.isPending}>Save Scheme</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Scheme Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this agri-environment scheme record?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheme detail + Communications dialog */}
      {viewScheme && (
        <Dialog open onOpenChange={() => { setViewScheme(null); setSchemeTab("details"); }}>
          <DialogContent style={{ maxWidth: 600 }}>
            <DialogHeader><DialogTitle>{viewScheme.schemeName}</DialogTitle></DialogHeader>
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
              {(["details", "communications"] as const).map(t => (
                <button key={t} onClick={() => setSchemeTab(t)} style={{ border: "none", background: "none", padding: "8px 14px", fontSize: "0.8125rem", fontWeight: schemeTab === t ? 600 : 400, color: schemeTab === t ? "#166534" : "#6b7280", borderBottom: schemeTab === t ? "2px solid #166534" : "2px solid transparent", cursor: "pointer" }}>
                  {t === "details" ? "Details" : `Communications${(schemeCommsQ.data as any[])?.length > 0 ? ` (${(schemeCommsQ.data as any[]).length})` : ""}`}
                </button>
              ))}
            </div>
            {schemeTab === "details" ? (
              (() => {
                const s = viewScheme;
                const F = ({ label, value }: { label: string; value?: string | null }) => (
                  <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
                );
                return (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="Agreement Number" value={s.agreementNumber} />
                      <div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Status</div>
                        <StatusBadge status={s.status || "active"} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <F label="Start Date" value={s.startDate ? fmt(s.startDate) : null} />
                      <F label="End Date" value={s.endDate ? fmt(s.endDate) : null} />
                    </div>
                    <F label="Annual Payment" value={s.annualPaymentPence ? fmtAmt(s.annualPaymentPence) : null} />
                    {s.obligations && <F label="Obligations" value={s.obligations} />}
                    {s.notes && <F label="Notes" value={s.notes} />}
                  </div>
                );
              })()
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <Button size="sm" onClick={() => { setSchemeCommForm({ commDate: new Date().toISOString().slice(0, 10), commType: "", direction: "outbound", subject: "", summary: "" }); setSchemeCommOpen(true); }}><Plus size={14} className="mr-1" />Log Communication</Button>
                </div>
                {schemeCommsQ.isLoading ? <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>Loading…</p> : (schemeCommsQ.data as any[])?.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    <MessageSquare size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, color: "#374151" }}>No correspondence logged</p>
                    <p style={{ fontSize: "0.8rem" }}>Log emails, letters, calls, and meetings with scheme administrators (Natural England, RPA, etc.).</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(schemeCommsQ.data as any[]).map((c: any) => (
                      <div key={c.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem", background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 20, background: c.direction === "inbound" ? "#eff6ff" : "#f0fdf4", color: c.direction === "inbound" ? "#1d4ed8" : "#15803d" }}>{c.direction === "inbound" ? "Received" : "Sent"}</span>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>{c.comm_type}</span>
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>·</span>
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.comm_date ? new Date(c.comm_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
                          </div>
                          <button onClick={() => delSchemeCommMut.mutate(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }} title="Delete"><Trash2 size={13} /></button>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111827", marginTop: 6, marginBottom: c.summary ? 4 : 0 }}>{c.subject}</p>
                        {c.summary && <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>{c.summary}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setViewScheme(null); setSchemeTab("details"); }}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {schemeCommOpen && (
        <Dialog open onOpenChange={o => { setSchemeCommOpen(o); if (!o) addSchemeCommMut.reset(); }}>
          <DialogContent style={{ maxWidth: 480 }}>
            <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={schemeCommForm.commDate} onChange={e => setSchemeCommForm((f: any) => ({ ...f, commDate: e.target.value }))} /></div>
                <div><Label>Direction</Label>
                  <Select value={schemeCommForm.direction} onValueChange={v => setSchemeCommForm((f: any) => ({ ...f, direction: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Sent / Outgoing</SelectItem>
                      <SelectItem value="inbound">Received / Incoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Type</Label>
                <Select value={schemeCommForm.commType} onValueChange={v => setSchemeCommForm((f: any) => ({ ...f, commType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {["Email", "Letter", "Phone call", "Meeting", "Site visit", "Video call", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Subject <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Annual payment query" value={schemeCommForm.subject} onChange={e => setSchemeCommForm((f: any) => ({ ...f, subject: e.target.value }))} /></div>
              <div><Label>Notes / Summary</Label><Textarea rows={3} value={schemeCommForm.summary} onChange={e => setSchemeCommForm((f: any) => ({ ...f, summary: e.target.value }))} /></div>
            </div>
            <DialogMutationError mutation={addSchemeCommMut} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSchemeCommOpen(false)}>Cancel</Button>
              <Button onClick={() => addSchemeCommMut.mutate(schemeCommForm)} disabled={!schemeCommForm.subject || !schemeCommForm.commType || addSchemeCommMut.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
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
  "Pasture for Life",
];

function AssessmentsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raiseTaskOpen, setRaiseTaskOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ title: string; description: string } | null>(null);
  const [taskAssigneeId, setTaskAssigneeId] = useState<string>("");
  const [taskDueDate, setTaskDueDate] = useState<string>("");
  const { data: membersData } = useFarmMembers(farmId);
  const activeMembers = membersData?.members.filter(m => m.isActive) ?? [];
  const emptyForm = () => ({
    assessorName: "", assessorOrganisation: "", assessmentDate: new Date().toISOString().slice(0, 10),
    outcome: "pass", conditions: "", nextAssessmentDue: "", notes: "",
  });
  const [form, setForm] = useState<any>(emptyForm());

  const q = useQuery({
    queryKey: ["environmental-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-assessments`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["environmental-assessments", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/environmental-assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: (_data: unknown, variables: any) => {
      toast({ title: "Assessment record saved" });
      invalidate();
      setAddOpen(false);
      setForm(emptyForm());
      if ((variables.outcome === "advisory" || variables.outcome === "fail") && variables.conditions?.trim()) {
        const outcomeLabel = variables.outcome === "fail" ? "Fail" : "Pass with Advisories";
        const dateStr = variables.assessmentDate
          ? new Date(variables.assessmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : "";
        const orgPart = variables.assessorOrganisation ? ` — ${variables.assessorOrganisation}` : "";
        setPendingTask({
          title: `Remedial actions required: ${outcomeLabel}${orgPart} (${dateStr})`,
          description: variables.conditions.trim(),
        });
        setTaskAssigneeId("");
        setTaskDueDate("");
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const raiseMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/environmental-assessments/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const plannerMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/planner-events`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => toast({ title: "Added to Week Ahead Planner" }),
    onError: () => toast({ title: "Failed to add to planner", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const lastPass = records.find(r => r.outcome === "pass" || r.outcome === "advisory");

  return (
    <div>
      {lastPass && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <ClipboardCheck size={20} color="#166534" />
          <div>
            <p style={{ fontWeight: 600, color: "#166534", fontSize: "0.875rem" }}>Last successful assessment: {fmt(lastPass.assessmentDate)}</p>
            <p style={{ color: "#374151", fontSize: "0.8rem" }}>{lastPass.assessorName}{lastPass.assessorOrganisation ? ` — ${lastPass.assessorOrganisation}` : ""}</p>
          </div>
          {lastPass.nextAssessmentDue && (
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Next assessment due</p>
              <p style={{ fontWeight: 600, color: "#374151", fontSize: "0.875rem" }}>{fmt(lastPass.nextAssessmentDue)}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 16, padding: "0.875rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
        <p style={{ fontSize: "0.8rem", color: "#92400e" }}>
          <strong>Red Tractor requirement:</strong> The Combinable Crops standard requires that you hold an Environmental Features Register and that it is inspected during your farm assessment. Record each assessor visit here to maintain a full inspection history.
        </p>
      </div>

      {(() => {
        const outstanding = records.filter((r: any) =>
          (r.outcome === "advisory" || r.outcome === "fail") && r.conditions
        );
        if (!outstanding.length) return null;
        return (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "0.875rem 1rem", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} color="#92400e" />
              <p style={{ fontWeight: 600, color: "#92400e", fontSize: "0.875rem", margin: 0 }}>
                {outstanding.length === 1 ? "1 assessment has outstanding remedial actions" : `${outstanding.length} assessments have outstanding remedial actions`}
              </p>
            </div>
            <div className="space-y-2">
              {outstanding.map((r: any) => (
                <div key={r.id} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                    {fmt(r.assessmentDate)}
                    {r.outcome === "fail" ? " — Fail" : " — Pass with Advisories"}
                    {r.assessorOrganisation ? ` · ${r.assessorOrganisation}` : ""}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#92400e", margin: 0 }}>{r.conditions}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#78350f", marginTop: 8, marginBottom: 0 }}>
              Ensure all relevant personnel on the holding are made aware of these requirements. Once complete, note the action taken in the record.
            </p>
          </div>
        );
      })()}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        {records.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => printAssessmentHistory(records, farmId)}>
            <Printer size={14} className="mr-1" />Print History
          </Button>
        )}
        <Button size="sm" onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Log Assessment Visit
        </Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ClipboardCheck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No assessment records yet</p>
          <p style={{ fontSize: "0.875rem" }}>Log Red Tractor assessor visits and their outcomes here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Assessment Date", "Assessor", "Organisation", "Outcome", "Conditions / Actions", "Next Due", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontWeight: 500 }}>{fmt(r.assessmentDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{r.assessorName}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assessorOrganisation || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><OutcomeBadge outcome={r.outcome} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, fontSize: "0.8rem" }}>{r.conditions || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                    {r.nextAssessmentDue ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {fmt(r.nextAssessmentDue)}
                        <button
                          onClick={() => plannerMut.mutate({ title: "Environmental Assessment Due", eventDate: r.nextAssessmentDue, colour: "blue", description: r.assessorOrganisation ? `Assessor: ${r.assessorOrganisation}` : undefined })}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 2, lineHeight: 1 }}
                          title="Add to Week Ahead Planner"
                        >
                          <CalendarDays size={12} />
                        </button>
                      </div>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160, fontSize: "0.8rem" }}>{r.notes || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) { setForm(emptyForm()); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Log Assessment Visit</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessor Name <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. John Smith" value={form.assessorName} onChange={e => setForm((f: any) => ({ ...f, assessorName: e.target.value }))} />
              </div>
              <div><Label>Assessment Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.assessmentDate} onChange={e => setForm((f: any) => ({ ...f, assessmentDate: e.target.value }))} />
              </div>
            </div>
            <div><Label>Assessor Organisation</Label>
              {(() => {
                const selectVal = KNOWN_ASSESSOR_ORGS.includes(form.assessorOrganisation)
                  ? form.assessorOrganisation
                  : form.assessorOrganisation ? "Other" : "";
                return (
                  <>
                    <Select value={selectVal} onValueChange={v => {
                      if (v === "Other") setForm((f: any) => ({ ...f, assessorOrganisation: "" }));
                      else setForm((f: any) => ({ ...f, assessorOrganisation: v }));
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select organisation…" /></SelectTrigger>
                      <SelectContent>
                        {KNOWN_ASSESSOR_ORGS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        <SelectItem value="Other">Other (please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectVal === "Other" && (
                      <Input className="mt-1.5" placeholder="Organisation name" value={form.assessorOrganisation}
                        onChange={e => setForm((f: any) => ({ ...f, assessorOrganisation: e.target.value }))} />
                    )}
                  </>
                );
              })()}
            </div>
            <div><Label>Outcome <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={form.outcome} onValueChange={v => setForm((f: any) => ({ ...f, outcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="advisory">Pass with Advisories</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Conditions / Required Actions</Label>
              <Textarea placeholder="Any conditions placed on the pass, or corrective actions required..." value={form.conditions} onChange={e => setForm((f: any) => ({ ...f, conditions: e.target.value }))} rows={3} />
            </div>
            <div><Label>Next Assessment Due</Label>
              <Input type="date" min={new Date().toISOString().slice(0, 10)} value={form.nextAssessmentDue} onChange={e => setForm((f: any) => ({ ...f, nextAssessmentDue: e.target.value }))} />
            </div>
            <div><Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.assessorName || !form.assessmentDate || createMut.isPending}>
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Assessment Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this assessment record? This cannot be undone.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={raiseTaskOpen} onOpenChange={o => { if (!o) { setRaiseTaskOpen(false); setPendingTask(null); raiseMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Raise a Task for Remedial Actions?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "0.625rem 0.875rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Actions recorded:</p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>{pendingTask?.description}</p>
            </div>
            <div>
              <Label>Assign to <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={taskAssigneeId} onValueChange={setTaskAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                <SelectContent>
                  {activeMembers.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" min={new Date().toISOString().slice(0, 10)} value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              The assignee will receive an SMS notification. The task will appear on the Task Board and stay open until marked complete.
            </p>
          </div>
          <DialogMutationError mutation={raiseMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRaiseTaskOpen(false); setPendingTask(null); }}>Skip for now</Button>
            <Button
              disabled={!taskAssigneeId || raiseMut.isPending}
              onClick={() => {
                if (!pendingTask || !taskAssigneeId) return;
                raiseMut.mutate({
                  assignedToMemberId: Number(taskAssigneeId),
                  title: pendingTask.title,
                  description: pendingTask.description,
                  module: "Environmental",
                  taskType: "compliance",
                  href: "/environmental-management?tab=assessments",
                  ...(taskDueDate ? { dueDate: taskDueDate } : {}),
                });
              }}
            >
              Raise Task &amp; Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Event type definitions ──────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: "hedge_trimming",          label: "Hedge Trimming / Laying" },
  { value: "scrub_clearance",         label: "Scrub Clearance" },
  { value: "mowing",                  label: "Mowing / Cutting" },
  { value: "pond_clearance",          label: "Pond Clearance" },
  { value: "ditch_clearance",         label: "Ditch Clearance" },
  { value: "vegetation_management",   label: "Vegetation Management" },
  { value: "tree_work",               label: "Tree Work / Coppicing" },
  { value: "grazing",                 label: "Grazing / Livestock Management" },
  { value: "spraying",                label: "Spraying" },
  { value: "cultivation",             label: "Cultivation" },
  { value: "planting",                label: "Planting / Seeding" },
  { value: "water_management",        label: "Water / Irrigation Management" },
  { value: "pest_control",            label: "Pest / Invasive Species Control" },
  { value: "other",                   label: "Other" },
];

const eventTypeLabel = (v: string) => EVENT_TYPES.find(t => t.value === v)?.label ?? v;

const EVENT_TYPE_COLORS: Record<string, string> = {
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
  other: "bg-gray-100 text-gray-700",
};

function ManagementEventsTab({ farmId, features, schemes }: { farmId: number; features: any[]; schemes: any[] }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m: any) => memberFullName(m));
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterFeature, setFilterFeature] = usePersistedFilter({ page: "environmental-management-events", filter: "feature", farmId, defaultValue: "__all__" });
  const [filterType, setFilterType] = usePersistedFilter({ page: "environmental-management-events", filter: "type", farmId, defaultValue: "__all__" });
  const [raiseTaskOpen, setRaiseTaskOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ title: string; description: string } | null>(null);
  const [taskAssigneeId, setTaskAssigneeId] = useState<string>("");
  const [taskDueDate, setTaskDueDate] = useState<string>("");

  const { data: contractorsData } = useQuery({
    queryKey: ["contractors-hs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contractors`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => (d.records ?? []).filter((c: any) => c.isActive),
  });
  const contractors: { id: number; companyName: string }[] = contractorsData ?? [];
  const activeMembers = membersData?.members.filter((m: any) => m.isActive) ?? [];

  const emptyForm = () => ({
    featureId: "", featureName: "", featureType: "",
    eventDate: new Date().toISOString().slice(0, 10),
    eventType: "", description: "", operator: "",
    contractorUsed: false, contractorName: "",
    fulfilsSchemeObligation: false, schemeId: "", schemeName: "", notes: "",
    followUpActionsNeeded: "",
  });
  const [form, setForm] = useState<any>(emptyForm());

  const q = useQuery({
    queryKey: ["env-management-events", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-management-events`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["env-management-events", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/environmental-management-events`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (_data: unknown, variables: any) => {
      toast({ title: "Event logged" });
      invalidate();
      setAddOpen(false);
      maybeRaiseTask(variables);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/environmental-management-events/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: (_data: unknown, variables: any) => {
      toast({ title: "Event updated" });
      invalidate();
      setEditRecord(null);
      maybeRaiseTask(variables.body);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const raiseMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/task-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" }),
  });

  function maybeRaiseTask(payload: any) {
    if (!payload?.followUpActionsNeeded?.trim()) return;
    const eventLabel = payload.eventType ? ` — ${eventTypeLabel(payload.eventType)}` : "";
    const dateStr = payload.eventDate
      ? new Date(payload.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "";
    setPendingTask({
      title: `Follow-up required: Management Event${eventLabel} (${dateStr})`,
      description: payload.followUpActionsNeeded.trim(),
    });
    setTaskAssigneeId("");
    setTaskDueDate("");
    setRaiseTaskOpen(true);
  }

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/environmental-management-events/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setForm(emptyForm()); setAddOpen(true); }
  function openEdit(r: any) {
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
      followUpActionsNeeded: r.followUpActionsNeeded ?? "",
    });
    setEditRecord(r);
  }

  function handleFeatureSelect(fid: string) {
    if (fid === "__none__") { setForm((f: any) => ({ ...f, featureId: "", featureName: "", featureType: "" })); return; }
    const feat = features.find((f: any) => f.id.toString() === fid);
    setForm((f: any) => ({ ...f, featureId: fid, featureName: feat?.description || featureTypeLabel(feat?.featureType || ""), featureType: feat?.featureType ?? "" }));
  }

  function handleSchemeSelect(sid: string) {
    if (sid === "__none__") { setForm((f: any) => ({ ...f, schemeId: "", schemeName: "" })); return; }
    const scheme = schemes.find((s: any) => s.id.toString() === sid);
    setForm((f: any) => ({ ...f, schemeId: sid, schemeName: scheme?.schemeName ?? "" }));
  }

  function handleSubmit() {
    if (!form.eventDate || !form.eventType) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    const payload = {
      ...form,
      featureId: form.featureId && form.featureId !== "__none__" ? parseInt(form.featureId) : null,
      schemeId: form.schemeId && form.schemeId !== "__none__" ? parseInt(form.schemeId) : null,
    };
    if (editRecord) { updateMut.mutate({ id: editRecord.id, body: payload }); }
    else { createMut.mutate(payload); }
  }

  const allRecords: any[] = q.data ?? [];
  const filtered = allRecords.filter(r => {
    if (filterFeature !== "__all__" && r.featureId?.toString() !== filterFeature && r.featureName !== filterFeature) return false;
    if (filterType !== "__all__" && r.eventType !== filterType) return false;
    return true;
  });

  const thisYear = new Date().getFullYear();
  const eventsThisYear = allRecords.filter(r => new Date(r.eventDate).getFullYear() === thisYear).length;
  const schemeLinked = allRecords.filter(r => r.fulfilsSchemeObligation).length;

  const dialogOpen = addOpen || !!editRecord;
  const dialogTitle = editRecord ? "Edit Management Event" : "Log Management Event";

  function featureDisplayName(r: any) {
    if (r.featureName) return r.featureName;
    if (r.featureType) return featureTypeLabel(r.featureType);
    return "—";
  }

  return (
    <div>
      {/* Stats strip */}
      {allRecords.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Events Logged</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{allRecords.length}</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>This Year ({thisYear})</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{eventsThisYear}</p>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Scheme-Linked Events</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>{schemeLinked}</p>
          </div>
        </div>
      )}

      {/* Red Tractor notice */}
      <div style={{ marginBottom: 16, padding: "0.875rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
        <p style={{ fontSize: "0.8rem", color: "#92400e" }}>
          <strong>Red Tractor requirement:</strong> You must be able to demonstrate that environmental features are actively managed. This log provides the dated evidence trail that management is actually taking place — not just intended. Log every management activity here, even small ones.
        </p>
      </div>

      {/* Filters + Add button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {features.length > 0 && (
          <Select value={filterFeature} onValueChange={setFilterFeature}>
            <SelectTrigger style={{ width: 200 }}><SelectValue placeholder="All features" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All features</SelectItem>
              {features.map((f: any) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.description || featureTypeLabel(f.featureType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: 210 }}><SelectValue placeholder="All event types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All event types</SelectItem>
            {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {allRecords.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => printManagementEventLog(allRecords, farmId)}>
              <Printer size={14} className="mr-1" />Print Event Log
            </Button>
          )}
          <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Log Event</Button>
        </div>
      </div>

      {/* Table */}
      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Leaf size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>
            {allRecords.length === 0 ? "No management events logged yet" : "No events match the current filter"}
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            {allRecords.length === 0 ? "Start building your evidence trail — log every hedge trim, pond clearance, or mowing event." : "Try clearing the filter to see all events."}
          </p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Feature", "Event Type", "Description", "Operator", "Scheme", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: any, i: number) => {
                const badgeCls = EVENT_TYPE_COLORS[r.eventType] ?? "bg-gray-100 text-gray-700";
                return (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CalendarDays size={13} color="#9ca3af" />
                        {fmt(r.eventDate)}
                      </div>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500, color: "#111827" }}>
                        <Leaf size={13} color="#16a34a" />
                        {featureDisplayName(r)}
                      </div>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
                        {eventTypeLabel(r.eventType)}
                      </span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 200, fontSize: "0.8rem" }}>{r.description || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>
                      {r.contractorUsed ? (
                        <span>{r.contractorName || "Contractor"} <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>(contractor)</span></span>
                      ) : (r.operator || "—")}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.fulfilsSchemeObligation ? (
                        <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1e40af", borderRadius: 4, padding: "2px 6px" }}>
                          {r.schemeName || "Scheme"}
                        </span>
                      ) : <span style={{ color: "#9ca3af" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160, fontSize: "0.8rem" }}>{r.notes || "—"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 540 }}>
            <DialogHeader><DialogTitle>Management Event</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Feature" value={r.featureName || r.featureType} />
                    <F label="Feature Type" value={r.featureType} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Event Date" value={fmt(r.eventDate)} />
                    <F label="Event Type" value={r.eventType} />
                  </div>
                  {r.description && <F label="Description" value={r.description} />}
                  <F label="Operator" value={r.contractorUsed ? `${r.contractorName || "Contractor"} (contractor)` : r.operator} />
                  {r.fulfilsSchemeObligation && <F label="Scheme Obligation" value={r.schemeName || "Yes"} />}
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 6 }}>Photos &amp; Attachments</div>
              <RecordAttachments farmId={farmId} recordType="environmental_management_event" recordId={viewRecord.id} />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm()); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-1">

            {/* Date + Event Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Date <span style={{ color: "#ef4444" }}>*</span></Label>
                <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.eventDate} onChange={e => setForm((f: any) => ({ ...f, eventDate: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }} />
              </div>
              <div className="space-y-1.5">
                <Label>Event Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.eventType || "__none__"} onValueChange={v => v !== "__none__" && setForm((f: any) => ({ ...f, eventType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" disabled>Select type…</SelectItem>
                    {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feature */}
            <div className="space-y-1.5">
              <Label>Feature</Label>
              {features.length > 0 ? (
                <Select value={form.featureId || "__none__"} onValueChange={handleFeatureSelect}>
                  <SelectTrigger><SelectValue placeholder="Select feature…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not linked to a specific feature —</SelectItem>
                    {features.map((f: any) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.description ? `${featureTypeLabel(f.featureType)} — ${f.description}` : featureTypeLabel(f.featureType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input value={form.featureName} onChange={e => setForm((f: any) => ({ ...f, featureName: e.target.value }))}
                  placeholder="Feature name or description"
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }} />
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description of work carried out</Label>
              <Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. North boundary hedge trimmed to 1.5m height on both sides, arisings left on field side" rows={2} />
            </div>

            {/* Operator / Contractor */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Carried out by</Label>
                <StaffSelect
                  value={form.operator}
                  onChange={(v) => setForm((f: any) => ({ ...f, operator: v }))}
                  staffNames={staffNames}
                  loading={membersLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", marginTop: "1.4rem" }}>
                  <input type="checkbox" checked={form.contractorUsed}
                    onChange={e => setForm((f: any) => ({ ...f, contractorUsed: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Carried out by contractor
                </label>
                {form.contractorUsed && (
                  contractors.length > 0 ? (
                    (() => {
                      const knownNames = contractors.map((c: any) => c.companyName);
                      const selectVal = knownNames.includes(form.contractorName)
                        ? form.contractorName
                        : form.contractorName ? "Other" : "";
                      return (
                        <>
                          <Select value={selectVal} onValueChange={v => {
                            if (v === "Other") setForm((f: any) => ({ ...f, contractorName: "" }));
                            else setForm((f: any) => ({ ...f, contractorName: v }));
                          }}>
                            <SelectTrigger><SelectValue placeholder="Select contractor…" /></SelectTrigger>
                            <SelectContent>
                              {contractors.map((c: any) => (
                                <SelectItem key={c.id} value={c.companyName}>{c.companyName}</SelectItem>
                              ))}
                              <SelectItem value="Other">Other (not in register)</SelectItem>
                            </SelectContent>
                          </Select>
                          {selectVal === "Other" && (
                            <input value={form.contractorName} onChange={e => setForm((f: any) => ({ ...f, contractorName: e.target.value }))}
                              placeholder="Contractor name / company"
                              style={{ marginTop: 6, width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }} />
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <input value={form.contractorName} onChange={e => setForm((f: any) => ({ ...f, contractorName: e.target.value }))}
                      placeholder="Contractor name / company"
                      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.375rem 0.75rem", fontSize: "0.875rem" }} />
                  )
                )}
              </div>
            </div>

            {/* Scheme obligation */}
            <div className="space-y-1.5">
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                <input type="checkbox" checked={form.fulfilsSchemeObligation}
                  onChange={e => setForm((f: any) => ({ ...f, fulfilsSchemeObligation: e.target.checked }))} style={{ width: 16, height: 16 }} />
                This event fulfils an agri-environment scheme obligation
              </label>
              {form.fulfilsSchemeObligation && schemes.length > 0 && (
                <Select value={form.schemeId || "__none__"} onValueChange={handleSchemeSelect}>
                  <SelectTrigger><SelectValue placeholder="Link to scheme…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No specific scheme —</SelectItem>
                    {schemes.filter((s: any) => s.status === "active").map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.schemeName}{s.agreementNumber ? ` (${s.agreementNumber})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes / Observations</Label>
              <Textarea value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                placeholder="Soil / weather conditions, observations…" rows={2} />
            </div>

            {/* Follow-up actions */}
            <div className="space-y-1.5">
              <Label>Follow-up Actions Required</Label>
              <Textarea value={form.followUpActionsNeeded} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, followUpActionsNeeded: e.target.value }))}
                placeholder="Describe any actions that need to be completed as a result of this event…" rows={2} />
              {form.followUpActionsNeeded?.trim() && (
                <p style={{ fontSize: "0.75rem", color: "#92400e" }}>
                  A task will be raised on the Task Board when you save — you can assign it to the relevant person.
                </p>
              )}
            </div>
          </div>

          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm()); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {editRecord ? "Save Changes" : "Log Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Event</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this management event record? This cannot be undone.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={raiseTaskOpen} onOpenChange={o => { if (!o) { setRaiseTaskOpen(false); setPendingTask(null); raiseMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Raise a Task for Follow-up Actions?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "0.625rem 0.875rem" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Actions required:</p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>{pendingTask?.description}</p>
            </div>
            <div>
              <Label>Assign to <span style={{ color: "#ef4444" }}>*</span></Label>
              <Select value={taskAssigneeId} onValueChange={setTaskAssigneeId}>
                <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                <SelectContent>
                  {activeMembers.map((m: any) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" min={new Date().toISOString().slice(0, 10)} value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              The assignee will receive an SMS notification. The task will appear on the Task Board and stay open until marked complete.
            </p>
          </div>
          <DialogMutationError mutation={raiseMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRaiseTaskOpen(false); setPendingTask(null); }}>Skip for now</Button>
            <Button
              disabled={!taskAssigneeId || raiseMut.isPending}
              onClick={() => {
                if (!pendingTask || !taskAssigneeId) return;
                raiseMut.mutate({
                  assignedToMemberId: Number(taskAssigneeId),
                  title: pendingTask.title,
                  description: pendingTask.description,
                  module: "Environmental",
                  taskType: "compliance",
                  href: "/environmental-management?tab=events",
                  ...(taskDueDate ? { dueDate: taskDueDate } : {}),
                });
              }}
            >
              Raise Task &amp; Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SFI Actions Tab ────────────────────────────────────────────────────────────

const SFI_SCHEME_NAMES = [
  "SFI 2023", "SFI 2024", "SFI Pilot",
  "Countryside Stewardship (Higher Tier)",
  "Countryside Stewardship (Mid Tier)",
  "England Woodland Creation Offer (EWCO)",
  "Farming in Protected Landscapes (FiPL)",
  "ELMs Pilot",
];

const SFI_MANAGING_BODIES = [
  "Rural Payments Agency (RPA)",
  "Natural England",
  "Forestry Commission",
];

const COMMON_ACTION_CODES: { code: string; title: string }[] = [
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
  { code: "OFC1", title: "Manage or create traditional farm orchards" },
];

interface SFIActionRow {
  id?: number;
  actionCode: string;
  actionTitle: string;
  landParcelReference: string;
  eligibleAreaHa: string;
  annualPaymentPerHa: string;
  annualPaymentAmount: string;
  complianceStatus: string;
  notes: string;
}

function emptySFIAction(): SFIActionRow {
  return { actionCode: "", actionTitle: "", landParcelReference: "", eligibleAreaHa: "", annualPaymentPerHa: "", annualPaymentAmount: "", complianceStatus: "compliant", notes: "" };
}

function SFIActionsTab({ farmId, openId }: { farmId: number; openId?: number | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ status: "Active" });
  const [actions, setActions] = useState<SFIActionRow[]>([]);
  const [deletedActionIds, setDeletedActionIds] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [hlId, setHlId] = useState<number | null>(openId ?? null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [pendingPlannerDates, setPendingPlannerDates] = useState<{ start: string | null; end: string | null; schemeName: string } | null>(null);
  const rowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["sfi-agreements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-agreements`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => Array.isArray(d) ? d : (d.records ?? []),
  });

  const { data: allActions = [] } = useQuery({
    queryKey: ["sfi-actions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sfi-actions`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => Array.isArray(d) ? d : (d.records ?? []),
  });

  const plannerMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/planner-events`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => toast({ title: "Date added to Week Ahead Planner" }),
    onError: () => toast({ title: "Failed to add to planner", variant: "destructive" }),
  });

  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/sfi-agreements/${editing.id}` : `/api/farms/${farmId}/sfi-agreements`;
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const agreement = await res.json();
      const agreementId = agreement.id;
      await Promise.all(deletedActionIds.map(id =>
        fetch(`/api/farms/${farmId}/sfi-actions/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
      ));
      await Promise.all(actions.map(action =>
        action.id
          ? fetch(`/api/farms/${farmId}/sfi-actions/${action.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...action, agreementId, farmId }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
          : fetch(`/api/farms/${farmId}/sfi-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...action, agreementId, farmId }) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })
      ));
      return { startDate: body.agreementStartDate as string | null, endDate: body.agreementEndDate as string | null, schemeName: String(body.schemeName ?? body.agreementNumber ?? "") };
    },
    onSuccess: ({ startDate, endDate, schemeName }) => {
      qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] });
      qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] });
      setOpen(false); setForm({ status: "Active" }); setEditing(null); setActions([]); setDeletedActionIds([]);
      toast({ title: "Agreement saved" });
      if (startDate || endDate) {
        setPendingPlannerDates({ start: startDate || null, end: endDate || null, schemeName });
        setPlannerOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      const acts = (allActions as any[]).filter((a: any) => a.agreementId === id);
      await Promise.all(acts.map((a: any) => fetch(`/api/farms/${farmId}/sfi-actions/${a.id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; })));
      await fetch(`/api/farms/${farmId}/sfi-agreements/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sfi-agreements", farmId] }); qc.invalidateQueries({ queryKey: ["sfi-actions", farmId] }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const rows = agreements as Record<string, unknown>[];

  useEffect(() => {
    if (!openId || autoOpened.current || rows.length === 0) return;
    const target = rows.find(r => Number(r.id) === openId);
    if (target) { autoOpened.current = true; setTimeout(() => setViewRecord(target), 100); }
  }, [openId, rows]);

  function openAdd() {
    setEditing(null); setForm({ status: "Active" }); setActions([]); setDeletedActionIds([]); setOpen(true);
  }

  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v != null ? String(v) : ""])));
    const agreementActions = (allActions as any[]).filter((a: any) => a.agreementId === Number(r.id));
    setActions(agreementActions.map((a: any): SFIActionRow => ({
      id: a.id, actionCode: a.actionCode ?? "", actionTitle: a.actionTitle ?? "",
      landParcelReference: a.landParcelReference ?? "",
      eligibleAreaHa: a.eligibleAreaHa != null ? String(a.eligibleAreaHa) : "",
      annualPaymentPerHa: a.annualPaymentPerHa != null ? String(a.annualPaymentPerHa) : "",
      annualPaymentAmount: a.annualPaymentAmount != null ? String(a.annualPaymentAmount) : "",
      complianceStatus: a.complianceStatus ?? "compliant", notes: a.notes ?? "",
    })));
    setDeletedActionIds([]); setOpen(true);
  }

  function updateActionRow(idx: number, field: keyof SFIActionRow, value: string) {
    setActions(prev => prev.map((a, i) => {
      if (i !== idx) return a;
      const updated = { ...a, [field]: value };
      if ((field === "eligibleAreaHa" || field === "annualPaymentPerHa") && !updated.annualPaymentAmount) {
        const area = parseFloat(updated.eligibleAreaHa); const rate = parseFloat(updated.annualPaymentPerHa);
        if (!isNaN(area) && !isNaN(rate)) updated.annualPaymentAmount = (area * rate).toFixed(2);
      }
      if (field === "actionCode" && !updated.actionTitle) {
        const known = COMMON_ACTION_CODES.find(c => c.code.toUpperCase() === value.toUpperCase());
        if (known) updated.actionTitle = known.title;
      }
      return updated;
    }));
  }

  function removeActionRow(idx: number) {
    const action = actions[idx];
    if (action.id) setDeletedActionIds(prev => [...prev, action.id!]);
    setActions(prev => prev.filter((_, i) => i !== idx));
  }

  const calcTotal = actions.reduce((s, a) => { const v = parseFloat(a.annualPaymentAmount); return s + (isNaN(v) ? 0 : v); }, 0);

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700", Applied: "bg-blue-100 text-blue-700",
    Withdrawn: "bg-gray-100 text-gray-600", Expired: "bg-red-100 text-red-600",
    "Under Query": "bg-amber-100 text-amber-700",
  };
  const complianceColors: Record<string, string> = {
    compliant: "bg-green-100 text-green-700", "non-compliant": "bg-red-100 text-red-700",
    "under-review": "bg-amber-100 text-amber-700", "pending-assessment": "bg-blue-100 text-blue-700",
  };

  const isSchemeNameCustom = !SFI_SCHEME_NAMES.includes(form.schemeName ?? "");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">SFI / ELMs Actions &amp; Agreements</h3>
          <p className="text-sm text-muted-foreground">Record Sustainable Farming Incentive and Environmental Land Management agreements, action codes, areas and annual payments.</p>
        </div>
        <div className="flex gap-2">
          {rows.length > 0 && <Button variant="outline" onClick={() => printSFISummary(rows, farmId)}><Printer className="w-4 h-4 mr-2" />Print Summary</Button>}
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Agreement</Button>
        </div>
      </div>

      {isLoading ? <div className="py-8 text-center text-muted-foreground text-sm">Loading…</div> : (
        <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-8 text-center">No SFI / ELMs agreements recorded yet. Add your first agreement above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>{["Scheme", "Agreement No.", "Start", "End", "Status", "Actions", "Annual Payment", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => {
                    const agreementActions = (allActions as any[]).filter((a: any) => a.agreementId === Number(r.id));
                    return (
                      <tr key={Number(r.id)} ref={(el) => { if (el) rowRefs.current.set(Number(r.id), el as HTMLElement); }}
                        className={`transition-colors${hlId === Number(r.id) ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2" : " hover:bg-black/5"}`}>
                        <td className="px-4 py-3 font-medium">{String(r.schemeName ?? "—")}</td>
                        <td className="px-4 py-3 font-mono text-xs">{String(r.agreementNumber ?? "—")}</td>
                        <td className="px-4 py-3 text-sm">{r.agreementStartDate ? new Date(r.agreementStartDate as string).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-4 py-3 text-sm">{r.agreementEndDate ? new Date(r.agreementEndDate as string).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[String(r.status)] ?? "bg-gray-100 text-gray-600"}`}>{String(r.status ?? "—")}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{agreementActions.length > 0 ? `${agreementActions.length} code${agreementActions.length !== 1 ? "s" : ""}` : "—"}</td>
                        <td className="px-4 py-3">{r.totalAnnualPayment ? `£${Number(r.totalAnnualPayment).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—"}</td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <Button size="icon" variant="ghost" onClick={() => setViewRecord(r)} title="View"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setPendingDelete(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600" />SFI / ELMs Agreement</DialogTitle></DialogHeader>
            <div className="space-y-4 text-sm py-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {!!viewRecord.schemeName && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Scheme</p><p className="font-semibold">{String(viewRecord.schemeName)}</p></div>}
                {!!viewRecord.agreementNumber && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Agreement No.</p><p className="font-mono">{String(viewRecord.agreementNumber)}</p></div>}
                {!!viewRecord.agreementStartDate && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Start Date</p><p>{new Date(viewRecord.agreementStartDate as string).toLocaleDateString("en-GB")}</p></div>}
                {!!viewRecord.agreementEndDate && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">End Date</p><p>{new Date(viewRecord.agreementEndDate as string).toLocaleDateString("en-GB")}</p></div>}
                <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Status</p><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[String(viewRecord.status)] ?? "bg-gray-100 text-gray-600"}`}>{String(viewRecord.status ?? "—")}</span></div>
                {!!viewRecord.totalAnnualPayment && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Annual Payment</p><p className="font-semibold">£{Number(viewRecord.totalAnnualPayment).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p></div>}
                {!!viewRecord.managingBody && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Managing Body</p><p>{String(viewRecord.managingBody)}</p></div>}
                {!!viewRecord.agentOrAdvisorName && <div><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Agent / Advisor</p><p>{String(viewRecord.agentOrAdvisorName)}</p></div>}
                {!!viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">Notes</p><p className="text-muted-foreground">{String(viewRecord.notes)}</p></div>}
              </div>
              {(() => {
                const acts = (allActions as any[]).filter((a: any) => a.agreementId === Number(viewRecord.id));
                if (!acts.length) return null;
                return (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Action Codes ({acts.length})</p>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 border-b">
                          <tr>{["Code", "Action Title", "Parcel Ref", "Area (ha)", "Rate (£/ha)", "Annual (£)", "Status"].map(h => <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y">
                          {acts.map((a: any) => (
                            <tr key={a.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono font-semibold text-green-700">{a.actionCode}</td>
                              <td className="px-3 py-2 text-muted-foreground max-w-48">{a.actionTitle}</td>
                              <td className="px-3 py-2 font-mono">{a.landParcelReference || "—"}</td>
                              <td className="px-3 py-2">{a.eligibleAreaHa ? Number(a.eligibleAreaHa).toFixed(2) : "—"}</td>
                              <td className="px-3 py-2">{a.annualPaymentPerHa ? `£${Number(a.annualPaymentPerHa).toFixed(2)}` : "—"}</td>
                              <td className="px-3 py-2 font-semibold">{a.annualPaymentAmount ? `£${Number(a.annualPaymentAmount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—"}</td>
                              <td className="px-3 py-2"><span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${complianceColors[a.complianceStatus] ?? "bg-gray-100 text-gray-600"}`}>{(a.complianceStatus ?? "").replace(/-/g, " ")}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({ status: "Active" }); setActions([]); setDeletedActionIds([]); save.reset(); } }}>
        <DialogContent style={{ maxWidth: "56rem", maxHeight: "90vh", overflow: "auto" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit SFI / ELMs Agreement" : "Add SFI / ELMs Agreement"}</DialogTitle></DialogHeader>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">Agreement Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Scheme Name <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={SFI_SCHEME_NAMES.includes(form.schemeName ?? "") ? (form.schemeName ?? "") : "Other"}
                  onValueChange={v => setForm(f => ({ ...f, schemeName: v === "Other" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select scheme…" /></SelectTrigger>
                  <SelectContent>
                    {SFI_SCHEME_NAMES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    <SelectItem value="Other">Other…</SelectItem>
                  </SelectContent>
                </Select>
                {isSchemeNameCustom && (
                  <Input className="mt-1.5" placeholder="Enter scheme name" value={form.schemeName ?? ""} onChange={e => setForm(f => ({ ...f, schemeName: e.target.value }))} />
                )}
              </div>
              <div><Label>Agreement Number <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. AG00012345" value={form.agreementNumber ?? ""} onChange={e => setForm(f => ({ ...f, agreementNumber: e.target.value }))} /></div>
              <div><Label>Start Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.agreementStartDate ?? ""} onChange={e => setForm(f => ({ ...f, agreementStartDate: e.target.value }))} /></div>
              <div><Label>End Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.agreementEndDate ?? ""} onChange={e => setForm(f => ({ ...f, agreementEndDate: e.target.value }))} /></div>
              <div>
                <Label>Status <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.status ?? "Active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Active", "Applied", "Withdrawn", "Expired", "Under Query"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Total Annual Payment (£)</Label>
                <Input type="number" step="0.01" placeholder={calcTotal > 0 ? `${calcTotal.toFixed(2)} (calculated)` : "e.g. 5000.00"} value={form.totalAnnualPayment ?? ""} onChange={e => setForm(f => ({ ...f, totalAnnualPayment: e.target.value }))} />
                {calcTotal > 0 && !form.totalAnnualPayment && (
                  <p className="text-xs text-muted-foreground mt-0.5">From action codes: <span className="font-medium text-green-700">£{calcTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>{" "}
                    <button type="button" className="text-blue-600 underline" onClick={() => setForm(f => ({ ...f, totalAnnualPayment: calcTotal.toFixed(2) }))}>Use this</button>
                  </p>
                )}
              </div>
              <div>
                <Label>Managing Body</Label>
                <Select value={SFI_MANAGING_BODIES.includes(form.managingBody ?? "") ? (form.managingBody ?? "") : form.managingBody ? "Other" : ""}
                  onValueChange={v => setForm(f => ({ ...f, managingBody: v === "Other" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="e.g. Rural Payments Agency…" /></SelectTrigger>
                  <SelectContent>
                    {SFI_MANAGING_BODIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    <SelectItem value="Other">Other…</SelectItem>
                  </SelectContent>
                </Select>
                {form.managingBody !== undefined && !SFI_MANAGING_BODIES.includes(form.managingBody) && (
                  <Input className="mt-1.5" placeholder="Managing body name" value={form.managingBody ?? ""} onChange={e => setForm(f => ({ ...f, managingBody: e.target.value }))} />
                )}
              </div>
              <div><Label>Agent / Advisor Name</Label><Input placeholder="Name of agent or farm advisor" value={form.agentOrAdvisorName ?? ""} onChange={e => setForm(f => ({ ...f, agentOrAdvisorName: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} placeholder="Any additional notes or conditions…" value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-3 pb-1 border-b">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action Codes</p>
              <Button size="sm" variant="outline" type="button" onClick={() => setActions(prev => [...prev, emptySFIAction()])}>
                <Plus className="w-3.5 h-3.5 mr-1" />Add Action Code
              </Button>
            </div>
            {actions.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 italic text-center py-3">No action codes added yet. Click "Add Action Code" to record the SFI actions under this agreement.</p>
            ) : (
              <div className="space-y-2">
                {actions.map((a, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50/50">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-2">
                        <Label className="text-xs">Code <span style={{ color: "#ef4444" }}>*</span></Label>
                        <input list={`sfi-codes-${idx}`} value={a.actionCode}
                          onChange={e => updateActionRow(idx, "actionCode", e.target.value.toUpperCase())}
                          placeholder="e.g. SAM1"
                          className="w-full border border-input rounded-md px-2 py-1.5 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-ring" />
                        <datalist id={`sfi-codes-${idx}`}>
                          {COMMON_ACTION_CODES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.title}</option>)}
                        </datalist>
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs">Action Title <span style={{ color: "#ef4444" }}>*</span></Label>
                        <Input className="h-8 text-xs" placeholder="Description of the action" value={a.actionTitle} onChange={e => updateActionRow(idx, "actionTitle", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Parcel Ref</Label>
                        <Input className="h-8 text-xs font-mono" placeholder="e.g. TL1234" value={a.landParcelReference} onChange={e => updateActionRow(idx, "landParcelReference", e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Area (ha)</Label>
                        <Input type="number" step="0.01" className="h-8 text-xs" value={a.eligibleAreaHa} onChange={e => updateActionRow(idx, "eligibleAreaHa", e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">£/ha</Label>
                        <Input type="number" step="0.01" className="h-8 text-xs" value={a.annualPaymentPerHa} onChange={e => updateActionRow(idx, "annualPaymentPerHa", e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Annual (£)</Label>
                        <Input type="number" step="0.01" className="h-8 text-xs" value={a.annualPaymentAmount} onChange={e => updateActionRow(idx, "annualPaymentAmount", e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={a.complianceStatus} onValueChange={v => updateActionRow(idx, "complianceStatus", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliant">Compliant</SelectItem>
                            <SelectItem value="non-compliant">Non-compliant</SelectItem>
                            <SelectItem value="under-review">Under review</SelectItem>
                            <SelectItem value="pending-assessment">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-12 flex justify-end">
                        <button type="button" onClick={() => removeActionRow(idx)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1">
                          <Trash2 className="w-3 h-3" />Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {calcTotal > 0 && (
                  <div className="flex justify-end pr-1">
                    <p className="text-sm font-semibold text-green-700">Total from action codes: £{calcTotal.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({ status: "Active" }); setActions([]); setDeletedActionIds([]); }}>Cancel</Button>
            <Button
              onClick={() => {
                const payload = { ...form };
                if (!payload.totalAnnualPayment && calcTotal > 0) payload.totalAnnualPayment = calcTotal.toFixed(2);
                save.mutate(payload as Record<string, unknown>);
              }}
              disabled={save.isPending || !form.schemeName || !form.agreementNumber || !form.agreementStartDate || !form.agreementEndDate}
            >
              {save.isPending ? "Saving…" : "Save Agreement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Planner offer dialog */}
      <Dialog open={plannerOpen} onOpenChange={o => { if (!o) { setPlannerOpen(false); plannerMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-600" />Add Dates to Week Ahead Planner?</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1 text-sm text-muted-foreground">
            <p>Add the agreement start and/or end dates to the Week Ahead Planner as diary reminders?</p>
            {pendingPlannerDates?.start && (
              <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-green-50">
                <span>Agreement starts: <strong>{new Date(pendingPlannerDates.start).toLocaleDateString("en-GB")}</strong></span>
                <Button size="sm" variant="outline" onClick={() => plannerMut.mutate({ title: `SFI starts: ${pendingPlannerDates!.schemeName}`, eventDate: pendingPlannerDates!.start, colour: "green" })}>Add</Button>
              </div>
            )}
            {pendingPlannerDates?.end && (
              <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-amber-50">
                <span>Agreement ends: <strong>{new Date(pendingPlannerDates.end).toLocaleDateString("en-GB")}</strong></span>
                <Button size="sm" variant="outline" onClick={() => plannerMut.mutate({ title: `SFI ends: ${pendingPlannerDates!.schemeName}`, eventDate: pendingPlannerDates!.end, colour: "amber" })}>Add</Button>
              </div>
            )}
          </div>
          <DialogMutationError mutation={plannerMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlannerOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Agreement"
        message="Delete this SFI/ELMs agreement and all its action codes? This cannot be undone."
        mutation={del}
        onConfirm={() => { if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) }); }}
        onCancel={() => { setPendingDelete(null); del.reset(); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}


export default function EnvironmentalPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "environmental", farmId, validIds: ["features", "schemes", "assessments", "events", "sfi", "slurry", "silage"], defaultTab: "features", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const openId = (() => { const n = Number(new URLSearchParams(window.location.search).get("open")); return n > 0 ? n : null; })();
  const schemesQ = useQuery({
    queryKey: ["agri-schemes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const featuresQ = useQuery({
    queryKey: ["environmental-features", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-features`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  return (
    <AppLayout title="Environmental Management">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Record environmental features, manage agri-environment scheme agreements, log assessor visits, and maintain a dated evidence trail of all management activities.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "features"} onClick={() => setTab("features")}>Environmental Features</TabButton>
          <TabButton active={tab === "schemes"} onClick={() => setTab("schemes")}>Agri-Env Schemes</TabButton>
          <TabButton active={tab === "assessments"} onClick={() => setTab("assessments")}>Assessment Records</TabButton>
          <TabButton active={tab === "events"} onClick={() => setTab("events")}>Management Events</TabButton>
          <TabButton active={tab === "sfi"} onClick={() => setTab("sfi")}>SFI / ELMs Actions</TabButton>
          <TabButton active={tab === "slurry"} onClick={() => setTab("slurry")}>Slurry & Manure</TabButton>
          <TabButton active={tab === "silage"} onClick={() => setTab("silage")}>Silage & Haylage</TabButton>
        </TabBar>
        {farmId && tab === "features" && <EnvironmentalFeaturesTab farmId={farmId} schemes={schemesQ.data ?? []} />}
        {farmId && tab === "schemes" && <AgriEnvSchemesTab farmId={farmId} />}
        {farmId && tab === "assessments" && <AssessmentsTab farmId={farmId} />}
        {farmId && tab === "events" && <ManagementEventsTab farmId={farmId} features={featuresQ.data ?? []} schemes={schemesQ.data ?? []} />}
        {farmId && tab === "sfi" && <SFIActionsTab farmId={farmId} openId={openId} />}
        {farmId && tab === "slurry" && <SlurryTab farmId={farmId} openId={openId} />}
        {farmId && tab === "silage" && <SilageTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
// ── Print helpers ──────────────────────────────────────────────────────────

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

function openPrint(title: string, body: string) {
  const w = window.open("", "_blank", "width=920,height=700");
  if (!w) return;
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${CSS_PRINT}</style></head><body>${body}</body></html>`
  );
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

function doSSAFOPrint(stores: any[], inspections: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const storeRows = stores
    .map(
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
    )
    .join("");
  const inspRows = [...inspections]
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
    .map(
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
    )
    .join("");
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

function doSpreadingPrint(spreadings: any[], farmId: number) {
  const now = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const rows = [...spreadings]
    .sort(
      (a, b) =>
        new Date(b.spreadingDate ?? 0).getTime() - new Date(a.spreadingDate ?? 0).getTime()
    )
    .map(
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
    )
    .join("");
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

// ── Option lists ───────────────────────────────────────────────────────────

const STORE_TYPES = [
  "Slurry Lagoon",
  "Slurry Tank",
  "Reception Pit",
  "Silage Clamp",
  "Dung Pad",
  "Manure Store",
  "Earth Bank Store",
];

const MATERIALS = [
  "Cattle Slurry",
  "Pig Slurry",
  "Poultry Slurry",
  "FYM (Cattle)",
  "FYM (Pig)",
  "FYM (Poultry)",
  "Digestate",
  "Mixed",
];

const SPREAD_MATERIALS = [
  "Cattle Slurry",
  "Pig Slurry",
  "Poultry Slurry",
  "FYM (Cattle)",
  "FYM (Pig)",
  "FYM (Poultry)",
  "Digestate",
];

const APPLICATION_METHODS = [
  "Broadcast",
  "Trailing shoe",
  "Shallow injection",
  "Deep injection",
  "Band spread",
  "Splash plate",
];

const INCORPORATION_METHODS = [
  "Not applicable",
  "Ploughed in (6 hrs)",
  "Cultivated (12 hrs)",
  "Applied to bare soil",
];

const STORE_STATUSES = ["Compliant", "Non-Compliant", "Under Repair", "Decommissioned"];

// ── Component ──────────────────────────────────────────────────────────────

type Row = Record<string, unknown>;
type Form = Record<string, string>;

function SlurryTab({ farmId, openId }: { farmId: number; openId?: number | null }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).map((m) => memberFullName(m));
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);

  // Store dialog state
  const [storeOpen, setStoreOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Row | null>(null);
  const [storeForm, setStoreForm] = useState<Form>({});
  const [viewStore, setViewStore] = useState<Row | null>(null);

  // Spreading dialog state
  const [spreadOpen, setSpreadOpen] = useState(false);
  const [spreadForm, setSpreadForm] = useState<Form>({});

  // Inspection dialog state
  const [inspOpen, setInspOpen] = useState(false);
  const [editingInsp, setEditingInsp] = useState<Row | null>(null);
  const [inspForm, setInspForm] = useState<Form>({});
  const [inspStoreId, setInspStoreId] = useState("");
  const [deleteInspId, setDeleteInspId] = useState<number | null>(null);

  // Fill event dialog state
  const [fillOpen, setFillOpen] = useState(false);
  const [fillStoreId, setFillStoreId] = useState("");
  const [fillForm, setFillForm] = useState<Form>({});

  // Raise task dialog state
  const [raiseTaskOpen, setRaiseTaskOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ title: string; description: string } | null>(
    null
  );
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Highlight + auto-open for deep-link
  const [hlId, setHlId] = useState<number | null>(openId ?? null);
  const storeRowRefs = useRef<Map<number, HTMLElement>>(new Map());
  const autoOpened = useRef(false);

  // ── Queries ──────────────────────────────────────────────────────────────

  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/fields`, { credentials: "include" })
        .then((r) => r.json()),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Array<{ id: number; name: string; areaHectares?: string | null }>,
  });

  const storesQ = useQuery({
    queryKey: ["slurry-stores", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-stores`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const spreadQ = useQuery({
    queryKey: ["slurry-spreading", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-spreading-records`, { credentials: "include" }).then(
        (r) => r.json()
      ),
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const inspQ = useQuery({
    queryKey: ["slurry-inspections", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-store-inspections`, { credentials: "include" }).then(
        (r) => r.json()
      ),
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const fillEventsQ = useQuery({
    queryKey: ["slurry-fill-events", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-fill-events`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const inspectorOrgsQ = useQuery({
    queryKey: ["lookup", "inspector_organisations"],
    queryFn: () => fetch(`/api/lookups/inspector_organisations`).then((r) => r.json()),
    select: (d: any) => (d.items ?? []).map((i: any) => String(i.value)),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const saveStoreMut = useMutation({
    mutationFn: (body: Form) => {
      const url = editingStore
        ? `/api/farms/${farmId}/slurry-stores/${editingStore.id}`
        : `/api/farms/${farmId}/slurry-stores`;
      return fetch(url, {
        method: editingStore ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-stores", farmId] });
      setStoreOpen(false);
      setStoreForm({});
      setEditingStore(null);
      toast({ title: "Store saved" });
    },
    onError: () => toast({ title: "Failed to save store", variant: "destructive" }),
  });

  const saveSpreadMut = useMutation({
    mutationFn: (body: Form) =>
      fetch(`/api/farms/${farmId}/slurry-spreading-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-spreading", farmId] });
      setSpreadOpen(false);
      setSpreadForm({});
      toast({ title: "Spreading record saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const saveFillMut = useMutation({
    mutationFn: async (body: Form) => {
      const res = await fetch(`/api/farms/${farmId}/slurry-fill-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
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
    onError: (err: Error) =>
      toast({ title: err.message || "Failed to record fill event", variant: "destructive" }),
  });

  const deleteFillMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/slurry-fill-events/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-fill-events", farmId] });
      toast({ title: "Fill event deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const saveInspMut = useMutation({
    mutationFn: (body: Form) => {
      const url = editingInsp
        ? `/api/farms/${farmId}/slurry-store-inspections/${editingInsp.id}`
        : `/api/farms/${farmId}/slurry-store-inspections`;
      return fetch(url, {
        method: editingInsp ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => r.json());
    },
    onSuccess: (_data: unknown, variables: Form) => {
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
        const dateStr = variables.inspectionDate
          ? new Date(variables.inspectionDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "";
        const parts: string[] = [];
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
        if (hasDeficiencies) parts.push(`Deficiencies noted: ${variables.deficiencies!.trim()}`);
        if (hasActions) parts.push(`Actions required: ${variables.actionsRequired!.trim()}`);
        setPendingTask({
          title: `${hasLeaks || effluentFailed ? "[URGENT] " : ""}${isSilageClamp ? "Silage Clamp" : "Slurry Store"} Inspection — ${storeName} (${dateStr})`,
          description: parts.join("\n\n"),
        });
        setTaskAssigneeId("");
        setTaskDueDate("");
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save inspection", variant: "destructive" }),
  });

  const deleteInspMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/slurry-store-inspections/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["slurry-inspections", farmId] });
      setDeleteInspId(null);
      toast({ title: "Inspection deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const raiseTaskMut = useMutation({
    mutationFn: (body: object) =>
      fetch(`/api/farms/${farmId}/task-assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Task raised — assignee will be notified by SMS" });
      setRaiseTaskOpen(false);
      setPendingTask(null);
    },
    onError: () => toast({ title: "Failed to raise task", variant: "destructive" }),
  });

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!openId || autoOpened.current || (storesQ.data ?? []).length === 0) return;
    const target = (storesQ.data ?? []).find((r) => Number(r.id) === openId);
    if (target) {
      autoOpened.current = true;
      setTimeout(() => setViewStore(target), 100);
    }
  }, [openId, storesQ.data]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const stores = storesQ.data ?? [];
  const spreadings = spreadQ.data ?? [];
  const inspections = inspQ.data ?? [];
  const fillEvents = fillEventsQ.data ?? [];

  const storeCapacity = useMemo(() => {
    const cap: Record<number, { filled: number; spread: number; current: number; available: number | null; pct: number | null }> = {};
    for (const s of stores) {
      const id = Number(s.id);
      const maxM3 = Number(s.capacityM3) || 0;
      const filled = fillEvents
        .filter((f) => Number(f.storeId) === id)
        .reduce((sum, f) => sum + (Number(f.volumeM3) || 0), 0);
      const spread = spreadings
        .filter((r) => Number(r.storeId) === id)
        .reduce((sum, r) => sum + (Number(r.volumeAppliedM3) || 0), 0);
      const current = Math.max(0, filled - spread);
      cap[id] = {
        filled,
        spread,
        current,
        available: maxM3 > 0 ? Math.max(0, maxM3 - current) : null,
        pct: maxM3 > 0 ? Math.min(100, (current / maxM3) * 100) : null,
      };
    }
    return cap;
  }, [stores, fillEvents, spreadings]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openInspDialog(store: Row | null) {
    setEditingInsp(null);
    setInspForm({
      inspectionDate: new Date().toISOString().slice(0, 10),
      outcome: "Pass",
      storeId: store ? String(store.id) : "",
    });
    setInspStoreId(store ? String(store.id) : "");
    setInspOpen(true);
  }

  function statusBadge(status: unknown) {
    return String(status) === "Compliant"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  }

  function outcomeBadge(outcome: unknown) {
    return outcome === "Pass"
      ? "bg-green-100 text-green-700"
      : outcome === "Advisory"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";
  }

  function rowToForm(row: Row): Form {
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v ?? "")]));
  }

  const today = new Date().toISOString().slice(0, 10);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ══ Slurry & Manure Stores ════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Slurry &amp; Manure Stores</h3>
          <div className="flex gap-2">
            {stores.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => doSSAFOPrint(stores, inspections, farmId)}
              >
                <Printer className="w-4 h-4 mr-1" /> SSAFO Register
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setEditingStore(null);
                setStoreForm({ status: "Compliant" });
                setStoreOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Store
            </Button>
          </div>
        </div>

        {storesQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {stores.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No slurry stores recorded.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {[
                      "Store Name",
                      "Type",
                      "Capacity (m³)",
                      "Fill Level",
                      "Material",
                      "Last Inspection",
                      "Next Due",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.map((r) => (
                    <tr
                      key={Number(r.id)}
                      ref={(el) => {
                        if (el) storeRowRefs.current.set(Number(r.id), el as HTMLElement);
                      }}
                      className={`transition-colors${
                        hlId === Number(r.id)
                          ? " bg-amber-50 outline outline-2 outline-amber-400 -outline-offset-2"
                          : " hover:bg-black/5"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{String(r.storeName ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.storeType ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.capacityM3 ?? "—")}</td>
                      <td className="px-4 py-3" style={{ minWidth: 130 }}>
                        {(() => {
                          const cap = storeCapacity[Number(r.id)];
                          if (!cap || cap.pct === null)
                            return <span className="text-xs text-muted-foreground">—</span>;
                          const color = cap.pct >= 90 ? "#dc2626" : cap.pct >= 70 ? "#d97706" : "#16a34a";
                          return (
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", marginBottom: 2, color: "#6b7280" }}>
                                <span>{cap.current.toFixed(1)} m³</span>
                                <span style={{ color: cap.available! < 10 ? "#dc2626" : "#374151" }}>{cap.available!.toFixed(1)} free</span>
                              </div>
                              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${cap.pct}%`, background: color, borderRadius: 3, transition: "width 0.3s" }} />
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">{String(r.material ?? "—")}</td>
                      <td className="px-4 py-3">
                        {r.lastInspectionDate
                          ? new Date(r.lastInspectionDate as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.nextInspectionDue
                          ? new Date(r.nextInspectionDue as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(r.status)}`}
                        >
                          {String(r.status ?? "—")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View"
                            onClick={() => setViewStore(r)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            style={{ fontSize: "0.75rem", height: 28, padding: "0 10px" }}
                            onClick={() => openInspDialog(r)}
                          >
                            Inspect
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingStore(r);
                              setStoreForm(rowToForm(r));
                              setStoreOpen(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ══ View Store dialog ════════════════════════════════════════════════ */}
      {viewStore && (
        <Dialog open onOpenChange={() => setViewStore(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Slurry / Manure Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                    Store Name
                  </p>
                  <p className="font-semibold">{String(viewStore.storeName ?? "—")}</p>
                </div>
                {!!viewStore.storeType && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Type
                    </p>
                    <p>{String(viewStore.storeType)}</p>
                  </div>
                )}
                {!!viewStore.capacityM3 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Capacity (m³)
                    </p>
                    <p>{String(viewStore.capacityM3)}</p>
                  </div>
                )}
                {!!viewStore.material && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Material
                    </p>
                    <p>{String(viewStore.material)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                    Status
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(viewStore.status)}`}
                  >
                    {String(viewStore.status ?? "—")}
                  </span>
                </div>
                {!!viewStore.lastInspectionDate && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Last Inspection
                    </p>
                    <p>
                      {new Date(viewStore.lastInspectionDate as string).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                )}
                {!!viewStore.nextInspectionDue && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium mb-0.5">
                      Next Inspection Due
                    </p>
                    <p>
                      {new Date(viewStore.nextInspectionDue as string).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                )}
              </div>
              {/* Capacity gauge */}
              {(() => {
                const cap = storeCapacity[Number(viewStore.id)];
                const maxM3 = Number(viewStore.capacityM3) || 0;
                if (!cap || maxM3 === 0) return null;
                const color = cap.pct! >= 90 ? "#dc2626" : cap.pct! >= 70 ? "#d97706" : "#16a34a";
                const bgColor = cap.pct! >= 90 ? "#fef2f2" : cap.pct! >= 70 ? "#fffbeb" : "#f0fdf4";
                return (
                  <div style={{ marginTop: 12, padding: "12px 14px", background: bgColor, borderRadius: 8, border: `1px solid ${color}33` }}>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Current Fill Level</p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: 8 }}>
                      <span><strong>{cap.current.toFixed(1)}</strong> m³ stored</span>
                      <span style={{ color: cap.available! < maxM3 * 0.1 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                        {cap.available!.toFixed(1)} m³ free
                      </span>
                    </div>
                    <div style={{ height: 14, background: "#e5e7eb", borderRadius: 7, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cap.pct}%`, background: color, borderRadius: 7, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#6b7280", marginTop: 4 }}>
                      <span>0</span>
                      <span style={{ fontWeight: 500 }}>{cap.pct!.toFixed(0)}% full</span>
                      <span>{maxM3} m³ max</span>
                    </div>
                    {cap.filled > 0 && (
                      <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 6 }}>
                        Total filled: {cap.filled.toFixed(1)} m³ · Total spread: {cap.spread.toFixed(1)} m³
                      </p>
                    )}
                    {cap.pct! >= 90 && (
                      <p style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, marginTop: 4 }}>
                        ⚠ Near capacity — do not add further material without spreading first.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const s = viewStore;
                  setViewStore(null);
                  setEditingStore(s);
                  setStoreForm(rowToForm(s));
                  setStoreOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setViewStore(null);
                  setFillForm({ eventDate: new Date().toISOString().slice(0, 10), storeId: String(viewStore!.id) });
                  setFillStoreId(String(viewStore!.id));
                  setFillOpen(true);
                }}
              >
                Log Fill Event
              </Button>
              <Button variant="ghost" onClick={() => setViewStore(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ══ Fill / Intake Events ══════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Fill &amp; Intake Events</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record when slurry or manure is added into a store — used to calculate available capacity.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setFillForm({ eventDate: new Date().toISOString().slice(0, 10) });
              setFillStoreId("");
              setFillOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Log Fill Event
          </Button>
        </div>
        {fillEventsQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {fillEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No fill events recorded. Log an event each time slurry or manure is added to a store.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {["Date", "Store", "Material", "Volume (m³)", "Source / Origin", "Notes", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fillEvents.map((r: any) => (
                    <tr key={r.id} className="hover:bg-black/5">
                      <td className="px-4 py-3">
                        {r.eventDate ? new Date(r.eventDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.storeName ?? stores.find((s) => Number(s.id) === Number(r.storeId))?.storeName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.materialType ? (
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "2px 7px", borderRadius: 10 }}>
                            {String(r.materialType)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">{r.volumeM3 ? Number(r.volumeM3).toFixed(1) : "—"}</td>
                      <td className="px-4 py-3">{String(r.sourceDescription ?? "—")}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{String(r.notes ?? "—")}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteFillMut.mutate(Number(r.id))}
                        >
                          <span style={{ fontSize: "0.75rem" }}>✕</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ══ Spreading Records ════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Spreading Records</h3>
          <div className="flex gap-2">
            {spreadings.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => doSpreadingPrint(spreadings, farmId)}
              >
                <Printer className="w-4 h-4 mr-1" /> Print Log
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setSpreadForm({});
                setSpreadOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Log Spreading
            </Button>
          </div>
        </div>

        {spreadQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {spreadings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No spreading records yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {[
                      "Date",
                      "Source Store",
                      "Field",
                      "Area (ha)",
                      "Material",
                      "Volume (m³)",
                      "Method",
                      "Operator",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {spreadings.map((r, i) => (
                    <tr key={r.id != null ? Number(r.id) : i} className="hover:bg-black/5">
                      <td className="px-4 py-3">
                        {r.spreadingDate
                          ? new Date(r.spreadingDate as string).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {String(r.storeName ?? (r.storeId ? (stores.find((s) => Number(s.id) === Number(r.storeId))?.storeName ?? "—") : "—"))}
                      </td>
                      <td className="px-4 py-3">{String(r.fieldDescription ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.fieldAreaHa ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.manureType ?? "—")}</td>
                      <td className="px-4 py-3">{r.volumeAppliedM3 ? `${Number(r.volumeAppliedM3).toFixed(1)}` : "—"}</td>
                      <td className="px-4 py-3">{String(r.applicationMethod ?? "—")}</td>
                      <td className="px-4 py-3">{String(r.operatorName ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ══ Store Inspection Records ══════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Store Inspection Records</h3>
          <Button size="sm" onClick={() => openInspDialog(null)}>
            <Plus className="w-4 h-4 mr-2" /> Log Inspection
          </Button>
        </div>

        {inspQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
            {inspections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-6 text-center">
                No inspections recorded. Use the "Inspect" button on a store row to log one.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/5 border-b">
                  <tr>
                    {[
                      "Date",
                      "Store",
                      "Inspector",
                      "Outcome",
                      "Leaks / Damage",
                      "Next Due",
                      "Actions",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-medium text-muted-foreground text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {inspections.map((r: any) => (
                    <tr key={r.id} className="hover:bg-black/5">
                      <td className="px-4 py-3">
                        {r.inspectionDate
                          ? new Date(r.inspectionDate).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{r.storeName ?? "—"}</td>
                      <td className="px-4 py-3">
                        {[r.inspectorName, r.inspectorOrganisation].filter(Boolean).join(", ") ||
                          "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${outcomeBadge(r.outcome)}`}
                        >
                          {r.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.leaksOrDamageFound ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.nextInspectionDue
                          ? new Date(r.nextInspectionDue).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-600 text-xs"
                        style={{ maxWidth: 200 }}
                      >
                        {r.actionsRequired || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingInsp(r);
                              setInspForm(rowToForm(r));
                              setInspStoreId(String(r.storeId));
                              setInspOpen(true);
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteInspId(Number(r.id))}
                          >
                            <span style={{ fontSize: "0.75rem" }}>✕</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ══ Add / Edit Store dialog ═══════════════════════════════════════════ */}
      <Dialog open={storeOpen} onOpenChange={o => { setStoreOpen(o); if (!o) saveStoreMut.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{editingStore ? "Edit Store" : "Add Slurry / Manure Store"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Store Name *</Label>
              <Input
                value={storeForm.storeName ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, storeName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Store Type *</Label>
              <Select
                value={storeForm.storeType ?? ""}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, storeType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_TYPES.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Capacity (m³)</Label>
              <Input
                type="number"
                value={storeForm.capacityM3 ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, capacityM3: e.target.value }))}
              />
            </div>
            <div>
              <Label>Material</Label>
              <Select
                value={storeForm.material ?? ""}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, material: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Design Standard</Label>
              <Input
                value={storeForm.designStandard ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, designStandard: e.target.value }))}
                placeholder="e.g. CIRIA 126"
              />
            </div>
            <div>
              <Label>Required Storage (months)</Label>
              <Input
                type="number"
                value={storeForm.requiredStorage ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, requiredStorage: e.target.value }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={storeForm.status ?? "Compliant"}
                onValueChange={(v) => setStoreForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STORE_STATUSES.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agency Ref / Permit No.</Label>
              <Input
                value={storeForm.agencyRegistrationNumber ?? ""}
                onChange={(e) =>
                  setStoreForm((f) => ({ ...f, agencyRegistrationNumber: e.target.value }))
                }
                placeholder="EA permit or RPID ref"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={storeForm.notes ?? ""}
                onChange={(e) => setStoreForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="General notes about this store…"
              />
            </div>
          </div>
          <DialogMutationError mutation={saveStoreMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoreOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveStoreMut.mutate(storeForm)}
              disabled={saveStoreMut.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Spreading dialog ══════════════════════════════════════════════════ */}
      <Dialog open={spreadOpen} onOpenChange={o => { setSpreadOpen(o); if (!o) saveSpreadMut.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>Log Slurry / Manure Spreading</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Spreading Date *</Label>
              <Input
                type="date"
                max={today}
                value={spreadForm.spreadingDate ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, spreadingDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Source Store</Label>
              <Select
                value={spreadForm.storeId || "__none__"}
                onValueChange={(v) => {
                  if (v === "__none__") {
                    setSpreadForm((f) => ({ ...f, storeId: "" }));
                    return;
                  }
                  const store = stores.find((s: any) => String(s.id) === v);
                  setSpreadForm((f) => ({
                    ...f,
                    storeId: v,
                    manureType: store?.material ? String(store.material) : f.manureType,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store (optional)…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None / unspecified</SelectItem>
                  {stores.map((s: any) => {
                    const cap = storeCapacity[Number(s.id)];
                    const avail = cap?.available != null ? ` (${cap.available.toFixed(0)} m³ free)` : "";
                    const mat = s.material ? ` · ${s.material}` : "";
                    return (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {String(s.storeName)}{mat}{avail}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {spreadForm.storeId && spreadForm.storeId !== "__none__" && (() => {
                const store = stores.find((s: any) => String(s.id) === spreadForm.storeId);
                if (!store?.material) return null;
                return (
                  <p style={{ fontSize: "0.72rem", color: "#059669", marginTop: 4 }}>
                    ✓ Material type set to <strong>{String(store.material)}</strong> from store configuration.
                  </p>
                );
              })()}
            </div>
            <div>
              <Label>Field *</Label>
              <Select
                value={spreadForm.fieldId || "__select__"}
                onValueChange={(v) => {
                  if (v === "__select__" || v === "__noop__") return;
                  const field = (fieldsQ.data ?? []).find((f: any) => f.id.toString() === v);
                  setSpreadForm((f) => ({
                    ...f,
                    fieldId: v,
                    fieldDescription: field?.name ?? "",
                    fieldAreaHa:
                      f.fieldAreaHa ||
                      (field?.areaHectares ? parseFloat(field.areaHectares).toFixed(2) : ""),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__select__" disabled>
                    Select field…
                  </SelectItem>
                  {(fieldsQ.data ?? []).length === 0 && (
                    <SelectItem value="__noop__" disabled>
                      No fields registered — add in Fields &amp; Crops
                    </SelectItem>
                  )}
                  {(fieldsQ.data ?? []).map((f: any) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Field Area (ha)</Label>
              <Input
                type="number"
                step="0.01"
                value={spreadForm.fieldAreaHa ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, fieldAreaHa: e.target.value }))}
              />
            </div>
            <div>
              <Label>Manure / Material Type *</Label>
              {(() => {
                const sourceStore = stores.find((s: any) => String(s.id) === spreadForm.storeId);
                const locked = !!sourceStore?.material;
                if (locked) {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 6,
                        fontSize: "0.875rem",
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>🔒</span>
                      <div>
                        <strong>{String(sourceStore!.material)}</strong>
                        <p style={{ fontSize: "0.68rem", color: "#166534", margin: 0 }}>
                          Locked to store configuration — species-specific storage enforced
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <Select
                    value={spreadForm.manureType ?? ""}
                    onValueChange={(v) => setSpreadForm((f) => ({ ...f, manureType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPREAD_MATERIALS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
            <div>
              <Label>Volume Applied (m³)</Label>
              <Input
                type="number"
                step="0.1"
                value={spreadForm.volumeAppliedM3 ?? ""}
                onChange={(e) =>
                  setSpreadForm((f) => ({ ...f, volumeAppliedM3: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Application Method</Label>
              <Select
                value={spreadForm.applicationMethod ?? ""}
                onValueChange={(v) => setSpreadForm((f) => ({ ...f, applicationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_METHODS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Incorporation Method</Label>
              <Select
                value={spreadForm.incorporationMethod ?? ""}
                onValueChange={(v) =>
                  setSpreadForm((f) => ({ ...f, incorporationMethod: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {INCORPORATION_METHODS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operator Name</Label>
              <StaffSelect
                value={spreadForm.operatorName ?? ""}
                onChange={(v) => setSpreadForm((f) => ({ ...f, operatorName: v }))}
                staffNames={staffNames}
                loading={membersLoading}
              />
            </div>
            <div>
              <Label>Soil Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                value={spreadForm.soilTemp ?? ""}
                onChange={(e) =>
                  setSpreadForm((f) => ({ ...f, soilTemp: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Ground / Weather Conditions</Label>
              <Input
                value={spreadForm.groundConditions ?? ""}
                onChange={(e) =>
                  setSpreadForm((f) => ({ ...f, groundConditions: e.target.value }))
                }
                placeholder="e.g. dry, frozen, waterlogged"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={spreadForm.notes ?? ""}
                onChange={(e) => setSpreadForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogMutationError mutation={saveSpreadMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpreadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveSpreadMut.mutate(spreadForm)}
              disabled={saveSpreadMut.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Inspection dialog ═════════════════════════════════════════════════ */}
      <Dialog
        open={inspOpen}
        onOpenChange={(o) => {
          if (!o) {
            setInspOpen(false);
            setEditingInsp(null);
            setInspForm({});
            saveInspMut.reset();
          }
        }}
      >
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader>
            <DialogTitle>
              {editingInsp ? "Edit Inspection Record" : "Log Store Inspection"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Store *</Label>
              <Select
                value={inspForm.storeId ?? inspStoreId}
                onValueChange={(v) => {
                  setInspForm((f) => ({ ...f, storeId: v }));
                  setInspStoreId(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store…" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {String(s.storeName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Inspection Date *</Label>
              <Input
                type="date"
                max={today}
                value={inspForm.inspectionDate ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, inspectionDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Inspector Name</Label>
              <Input
                value={inspForm.inspectorName ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, inspectorName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Inspector Organisation</Label>
              <Input
                list="inspector-org-options"
                value={inspForm.inspectorOrganisation ?? ""}
                onChange={(e) =>
                  setInspForm((f) => ({ ...f, inspectorOrganisation: e.target.value }))
                }
                placeholder="e.g. Internal, AHDB, EA"
              />
              <datalist id="inspector-org-options">
                {(inspectorOrgsQ.data ?? []).map((org: string) => (
                  <option key={org} value={org} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Outcome *</Label>
              <Select
                value={inspForm.outcome ?? "Pass"}
                onValueChange={(v) => setInspForm((f) => ({ ...f, outcome: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pass">Pass — No deficiencies</SelectItem>
                  <SelectItem value="Advisory">Advisory — Minor issues noted</SelectItem>
                  <SelectItem value="Fail">Fail — Deficiencies requiring action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Inspection Due</Label>
              <Input
                type="date"
                value={inspForm.nextInspectionDue ?? ""}
                onChange={(e) =>
                  setInspForm((f) => ({ ...f, nextInspectionDue: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={inspForm.freeboardOk === "true"}
                  onChange={(e) =>
                    setInspForm((f) => ({
                      ...f,
                      freeboardOk: e.target.checked ? "true" : "false",
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                Freeboard adequate
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={inspForm.leaksOrDamageFound === "true"}
                  onChange={(e) =>
                    setInspForm((f) => ({
                      ...f,
                      leaksOrDamageFound: e.target.checked ? "true" : "false",
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                <span
                  style={{
                    color: inspForm.leaksOrDamageFound === "true" ? "#dc2626" : "inherit",
                  }}
                >
                  Leaks or structural damage found
                </span>
              </label>
            </div>
            <div>
              <Label>Freeboard Measured (mm)</Label>
              <Input
                type="number"
                value={inspForm.freeboardMm ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, freeboardMm: e.target.value }))}
                placeholder="Distance from slurry surface to top of wall"
              />
            </div>
            <div className="col-span-2">
              <Label>Deficiencies Found</Label>
              <Textarea
                value={inspForm.deficiencies ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, deficiencies: e.target.value }))}
                rows={2}
                placeholder="Describe any deficiencies observed…"
              />
            </div>
            <div className="col-span-2">
              <Label>Actions Required</Label>
              <Textarea
                value={inspForm.actionsRequired ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, actionsRequired: e.target.value }))}
                rows={2}
                placeholder="Describe actions needed to remedy deficiencies…"
              />
              {(inspForm.actionsRequired?.trim() ||
                inspForm.deficiencies?.trim() ||
                inspForm.leaksOrDamageFound === "true") && (
                <p style={{ fontSize: "0.75rem", color: "#92400e", marginTop: 4 }}>
                  A task will be raised on the Task Board when you save — you can assign it to the
                  responsible person.
                  {inspForm.leaksOrDamageFound === "true" && (
                    <strong style={{ display: "block", color: "#dc2626", marginTop: 2 }}>
                      ⚠ Leaks / damage: an URGENT task will be created.
                    </strong>
                  )}
                </p>
              )}
            </div>
            {(() => {
              const selectedStore = stores.find(
                (s: any) => String(s.id) === String(inspForm.storeId ?? inspStoreId)
              );
              if (String(selectedStore?.storeType ?? "") !== "Silage Clamp") return null;
              return (
                <div className="col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                  <p className="col-span-2 text-xs font-medium text-amber-800">
                    Silage Clamp — additional checks (SSAFO)
                  </p>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={inspForm.effluentContained === "true"}
                      onChange={(e) =>
                        setInspForm((f) => ({
                          ...f,
                          effluentContained: e.target.checked ? "true" : "false",
                        }))
                      }
                      style={{ width: 16, height: 16 }}
                    />
                    Effluent contained (no runoff)
                  </label>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={inspForm.coverSheetIntact === "true"}
                      onChange={(e) =>
                        setInspForm((f) => ({
                          ...f,
                          coverSheetIntact: e.target.checked ? "true" : "false",
                        }))
                      }
                      style={{ width: 16, height: 16 }}
                    />
                    Cover sheet intact &amp; weighted
                  </label>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={inspForm.wallsSound === "true"}
                      onChange={(e) =>
                        setInspForm((f) => ({
                          ...f,
                          wallsSound: e.target.checked ? "true" : "false",
                        }))
                      }
                      style={{ width: 16, height: 16 }}
                    />
                    Clamp walls sound (no cracks/leans)
                  </label>
                </div>
              );
            })()}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={inspForm.notes ?? ""}
                onChange={(e) => setInspForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Any other observations…"
              />
            </div>
          </div>
          <DialogMutationError mutation={saveInspMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInspOpen(false);
                setEditingInsp(null);
                setInspForm({});
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !inspForm.storeId ||
                !inspForm.inspectionDate ||
                !inspForm.outcome ||
                saveInspMut.isPending
              }
              onClick={() =>
                saveInspMut.mutate({
                  ...inspForm,
                  storeId: inspForm.storeId ?? inspStoreId,
                })
              }
            >
              {editingInsp ? "Save Changes" : "Save Inspection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Fill event dialog ════════════════════════════════════════════════ */}
      <Dialog open={fillOpen} onOpenChange={(o) => { if (!o) { setFillOpen(false); setFillForm({}); saveFillMut.reset(); } }}>
        <DialogContent style={{ maxWidth: "34rem" }}>
          <DialogHeader>
            <DialogTitle>Log Slurry / Manure Fill Event</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Record each time slurry or manure is added into a storage store. This updates the
              calculated fill level shown in the store table.
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                max={today}
                value={fillForm.eventDate ?? ""}
                onChange={(e) => setFillForm((f) => ({ ...f, eventDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Store *</Label>
              <Select
                value={fillForm.storeId || fillStoreId || "__select__"}
                onValueChange={(v) => {
                  setFillStoreId(v);
                  setFillForm((f) => ({ ...f, storeId: v }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select store…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__select__" disabled>Select store…</SelectItem>
                  {stores.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {String(s.storeName)}{s.material ? ` · ${s.material}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const sid = fillForm.storeId || fillStoreId;
                if (!sid || sid === "__select__") return null;
                const store = stores.find((s: any) => String(s.id) === sid);
                if (!store) return null;
                const mat = store.material ? String(store.material) : null;
                const cap = storeCapacity[Number(store.id)];
                return (
                  <div style={{ marginTop: 6, padding: "6px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: "0.72rem", color: "#166534" }}>
                    {mat && <span>Accepts: <strong>{mat}</strong>{" "}</span>}
                    {cap && cap.pct !== null && (
                      <span style={{ color: cap.pct >= 90 ? "#dc2626" : "#166534" }}>
                        · Currently {cap.current.toFixed(1)} m³ stored
                        {cap.available !== null ? ` (${cap.available.toFixed(1)} m³ free)` : ""}
                        {cap.pct >= 90 ? " ⚠ Near capacity" : ""}
                      </span>
                    )}
                    {!mat && !cap && <span>No material type configured for this store.</span>}
                  </div>
                );
              })()}
            </div>
            <div>
              <Label>Material Type *</Label>
              {(() => {
                const sid = fillForm.storeId || fillStoreId;
                const store = sid ? stores.find((s: any) => String(s.id) === sid) : null;
                const locked = !!store?.material;
                if (locked) {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 6,
                        fontSize: "0.875rem",
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>🔒</span>
                      <div>
                        <strong>{String(store!.material)}</strong>
                        <p style={{ fontSize: "0.68rem", color: "#166534", margin: 0 }}>
                          Locked — this store accepts {String(store!.material)} only
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <Select
                    value={fillForm.materialType ?? ""}
                    onValueChange={(v) => setFillForm((f) => ({ ...f, materialType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPREAD_MATERIALS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
            <div>
              <Label>Volume Added (m³) *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={fillForm.volumeM3 ?? ""}
                onChange={(e) => setFillForm((f) => ({ ...f, volumeM3: e.target.value }))}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label>Source / Origin</Label>
              <Input
                value={fillForm.sourceDescription ?? ""}
                onChange={(e) => setFillForm((f) => ({ ...f, sourceDescription: e.target.value }))}
                placeholder="e.g. cattle housing, dirty water, import"
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={fillForm.notes ?? ""}
                onChange={(e) => setFillForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Any additional information…"
              />
            </div>
          </div>
          <DialogMutationError mutation={saveFillMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFillOpen(false); setFillForm({}); }}>
              Cancel
            </Button>
            <Button
              disabled={
                !fillForm.eventDate ||
                !(fillForm.storeId || fillStoreId) ||
                !fillForm.volumeM3 ||
                saveFillMut.isPending
              }
              onClick={() => {
                const sid = fillForm.storeId || fillStoreId;
                const store = sid ? stores.find((s: any) => String(s.id) === sid) : null;
                saveFillMut.mutate({
                  ...fillForm,
                  storeId: sid,
                  materialType: fillForm.materialType || (store?.material ? String(store.material) : ""),
                });
              }}
            >
              Log Fill Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Raise task dialog ═════════════════════════════════════════════════ */}
      <Dialog
        open={raiseTaskOpen}
        onOpenChange={(o) => {
          if (!o) {
            setRaiseTaskOpen(false);
            setPendingTask(null);
            raiseTaskMut.reset();
          }
        }}
      >
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Raise a Task for Inspection Actions?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: 6,
                padding: "0.625rem 0.875rem",
              }}
            >
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
                Actions required:
              </p>
              <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>
                {pendingTask?.description}
              </p>
            </div>
            <div>
              <Label>
                Assign to <span style={{ color: "#ef4444" }}>*</span>
              </Label>
              <Select value={taskAssigneeId} onValueChange={setTaskAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member…" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {memberFullName(m)}
                      {m.jobTitle ? ` — ${m.jobTitle}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                min={today}
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              The assignee will receive an SMS notification. The task will appear on the Task Board
              and stay open until marked complete.
            </p>
          </div>
          <DialogMutationError mutation={raiseTaskMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRaiseTaskOpen(false);
                setPendingTask(null);
              }}
            >
              Skip for now
            </Button>
            <Button
              disabled={!taskAssigneeId || raiseTaskMut.isPending}
              onClick={() => {
                if (!pendingTask || !taskAssigneeId) return;
                raiseTaskMut.mutate({
                  assignedToMemberId: Number(taskAssigneeId),
                  title: pendingTask.title,
                  description: pendingTask.description,
                  module: "Environmental",
                  taskType: "compliance",
                  href: "/environmental-management?tab=slurry",
                  ...(taskDueDate ? { dueDate: taskDueDate } : {}),
                });
              }}
            >
              Raise Task &amp; Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete inspection confirm ══════════════════════════════════════════ */}
      <Dialog
        open={deleteInspId !== null}
        onOpenChange={(o) => {
          if (!o) { setDeleteInspId(null); deleteInspMut.reset(); }
        }}
      >
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Delete Inspection Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Delete this inspection record? This cannot be undone.
          </p>
          <DialogMutationError mutation={deleteInspMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInspId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteInspId !== null && deleteInspMut.mutate(deleteInspId)}
              disabled={deleteInspMut.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Silage & Haylage Tab ─────────────────────────────────────────────────────

function SilageTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const [additiveOpen, setAdditiveOpen] = useState(false);
  const [editingAdditive, setEditingAdditive] = useState<Row | null>(null);
  const [additiveForm, setAdditiveForm] = useState<Form>({});
  const [deleteAdditiveId, setDeleteAdditiveId] = useState<number | null>(null);

  const [qualityOpen, setQualityOpen] = useState(false);
  const [qualityMode, setQualityMode] = useState<"log" | "result" | "edit">("log");
  const [editingQuality, setEditingQuality] = useState<Row | null>(null);
  const [qualityForm, setQualityForm] = useState<Form>({});
  const [deleteQualityId, setDeleteQualityId] = useState<number | null>(null);

  const [raiseTaskOpen, setRaiseTaskOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<{ title: string; description: string } | null>(null);

  const storesQ = useQuery({
    queryKey: ["slurry-stores", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/slurry-stores`, { credentials: "include" }).then((r) => r.json()),
    select: (d: any) => (d.records ?? []) as Row[],
  });
  const stores = (storesQ.data ?? []).filter(
    (s: any) => String(s.storeType ?? "") === "Silage Clamp"
  );

  const additivesQ = useQuery({
    queryKey: ["silage-additives", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/silage-additive-records`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const qualityQ = useQuery({
    queryKey: ["silage-quality-tests", farmId],
    queryFn: () =>
      fetch(`/api/farms/${farmId}/silage-quality-tests`, { credentials: "include" }).then((r) =>
        r.json()
      ),
    enabled: !!farmId,
    select: (d: any) => (d.records ?? []) as Row[],
  });

  const saveAdditiveMut = useMutation({
    mutationFn: (body: Form) => {
      const url = editingAdditive
        ? `/api/farms/${farmId}/silage-additive-records/${editingAdditive.id}`
        : `/api/farms/${farmId}/silage-additive-records`;
      return fetch(url, {
        method: editingAdditive ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-additives", farmId] });
      setAdditiveOpen(false);
      setEditingAdditive(null);
      setAdditiveForm({});
      toast({ title: "Additive record saved" });
    },
    onError: () => toast({ title: "Failed to save additive record", variant: "destructive" }),
  });

  const deleteAdditiveMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/silage-additive-records/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-additives", farmId] });
      setDeleteAdditiveId(null);
      toast({ title: "Additive record deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const saveQualityMut = useMutation({
    mutationFn: (body: Form) => {
      const url = editingQuality
        ? `/api/farms/${farmId}/silage-quality-tests/${editingQuality.id}`
        : `/api/farms/${farmId}/silage-quality-tests`;
      return fetch(url, {
        method: editingQuality ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_data: unknown, variables: Form) => {
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
        const store = (storesQ.data ?? []).find((s: any) => String(s.id) === String(variables.storeId));
        const storeName = store ? String((store as any).storeName ?? "clamp") : "clamp";
        const dateStr = variables.testDate
          ? new Date(variables.testDate as string).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : "";
        const parts: string[] = [];
        if (phFailed)
          parts.push(`pH is ${ph} (above 4.5) — poor fermentation, elevated listeria/clostridial risk. Review before feeding.`);
        if (ammoniaFailed)
          parts.push(`Ammonia-N is ${ammoniaN}% of total N (above 15%) — indicates spoilage/proteolysis. May be unsuitable to feed; seek nutritionist/vet advice.`);
        if (dmFailed)
          parts.push(`Dry Matter is ${dryMatterPct}% (below 25%) — high effluent risk. Check clamp drainage/effluent containment (SSAFO).`);
        setPendingTask({
          title: `[Silage Quality] ${storeName} test out of range (${dateStr})`,
          description: parts.join("\n\n"),
        });
        setRaiseTaskOpen(true);
      }
    },
    onError: () => toast({ title: "Failed to save quality test", variant: "destructive" }),
  });

  const deleteQualityMut = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/farms/${farmId}/silage-quality-tests/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["silage-quality-tests", farmId] });
      setDeleteQualityId(null);
      toast({ title: "Quality test deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // ── Stock tracking state ──
  const [stockOpen, setStockOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [stockForm, setStockForm] = useState<any>({});
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null);
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageForStock, setUsageForStock] = useState<any>(null);
  const [usageForm, setUsageForm] = useState<any>({});

  const stockQ = useQuery({
    queryKey: ["silage-haylage-balance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/silage-haylage-balance`, { credentials: "include" }).then(r => r.json()),
    select: (d: any) => (d.records ?? []) as any[],
  });
  const stockRows = stockQ.data ?? [];

  const saveStockMut = useMutation({
    mutationFn: async (body: any) => {
      const url = editingStock
        ? `/api/farms/${farmId}/silage-haylage-stock/${editingStock.id}`
        : `/api/farms/${farmId}/silage-haylage-stock`;
      const r = await fetch(url, { method: editingStock ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] }); setStockOpen(false); setEditingStock(null); setStockForm({}); toast({ title: editingStock ? "Stock updated" : "Batch logged" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteStockMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/silage-haylage-stock/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] }); setDeleteStockId(null); toast({ title: "Batch deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const saveUsageMut = useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch(`/api/farms/${farmId}/silage-haylage-usage`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["silage-haylage-balance", farmId] }); setUsageOpen(false); setUsageForStock(null); setUsageForm({}); toast({ title: "Drawdown recorded" }); },
    onError: () => toast({ title: "Failed to record drawdown", variant: "destructive" }),
  });

  const additives = additivesQ.data ?? [];
  const qualityTests = qualityQ.data ?? [];

  const storeName = (id: unknown) =>
    (storesQ.data ?? []).find((s: any) => Number(s.id) === Number(id))?.storeName ?? "—";

  return (
    <div className="space-y-6">
      {/* ══ Silage & Haylage Stock ════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Silage &amp; Haylage Stock</h3>
          <Button size="sm" onClick={() => { setEditingStock(null); setStockForm({ harvestDate: today, status: "in-store" }); setStockOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Log Batch
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          {stockQ.isLoading ? (
            <div className="text-sm text-muted-foreground p-4">Loading…</div>
          ) : stockRows.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">No silage or haylage batches logged yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/5 border-b">
                <tr>
                  {["Type", "Cut", "Source Field", "Harvest Date", "Qty In", "Used", "Remaining", "DM%", "Clamp", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {stockRows.map((r: any) => {
                  const isBales = r.quantityBales != null;
                  const qtyIn = isBales ? `${r.quantityBales ?? 0} bales` : r.quantityTonnes != null ? `${parseFloat(String(r.quantityTonnes)).toFixed(1)} t` : "—";
                  const usedDisplay = isBales ? `${r.usedBales ?? 0} bales` : `${(r.usedTonnes ?? 0).toFixed(1)} t`;
                  const rem = isBales
                    ? (r.remainingBales != null ? `${r.remainingBales} bales` : "—")
                    : (r.remainingTonnes != null ? `${parseFloat(String(r.remainingTonnes)).toFixed(1)} t` : "—");
                  const remPct = isBales && r.quantityBales
                    ? Math.max(0, Math.min(100, ((r.remainingBales ?? r.quantityBales) / r.quantityBales) * 100))
                    : !isBales && r.quantityTonnes
                    ? Math.max(0, Math.min(100, ((r.remainingTonnes ?? r.quantityTonnes) / parseFloat(String(r.quantityTonnes))) * 100))
                    : null;
                  return (
                    <tr key={r.id} className="hover:bg-black/5">
                      <td className="px-4 py-3 font-medium">{r.cropType ?? "—"}</td>
                      <td className="px-4 py-3">{r.cutNumber ? `${r.cutNumber}` : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.fieldOfOrigin ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.harvestDate ? new Date(r.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                      <td className="px-4 py-3">{qtyIn}</td>
                      <td className="px-4 py-3 text-amber-700">{usedDisplay}</td>
                      <td className="px-4 py-3">
                        <span className={remPct != null && remPct < 20 ? "text-red-700 font-semibold" : remPct != null && remPct < 40 ? "text-amber-700" : "text-green-700"}>{rem}</span>
                      </td>
                      <td className="px-4 py-3">{r.dryMatterPercent != null ? `${r.dryMatterPercent}%` : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.storeName ?? "—"}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button size="icon" variant="ghost" title="Record drawdown" onClick={() => { setUsageForStock(r); setUsageForm({ stockId: r.id, usageDate: today }); setUsageOpen(true); }}>
                          <Droplets className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditingStock(r); setStockForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setStockOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteStockId(r.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ Silage Additive Records ═══════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Silage / Haylage Additive Records</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingAdditive(null);
              setAdditiveForm({ applicationDate: today });
              setAdditiveOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          {additivesQ.isLoading ? (
            <div className="text-sm text-muted-foreground p-4">Loading…</div>
          ) : additives.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">
              No additive / inoculant records yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/5 border-b">
                <tr>
                  {["Date", "Store", "Crop", "Product", "Rate", "Applied By", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {additives.map((r) => (
                  <tr key={Number(r.id)} className="hover:bg-black/5">
                    <td className="px-4 py-3">{fmt(r.applicationDate as string)}</td>
                    <td className="px-4 py-3">{String(r.storeName ?? storeName(r.storeId))}</td>
                    <td className="px-4 py-3">{String(r.cropType ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.productName ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.applicationRate ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.appliedBy ?? "—")}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingAdditive(r);
                          setAdditiveForm(
                            Object.fromEntries(
                              Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])
                            )
                          );
                          setAdditiveOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteAdditiveId(Number(r.id))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ Silage Quality / DM% Tests ════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Silage Quality &amp; Dry Matter Tests</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingQuality(null);
              setQualityMode("log");
              setQualityForm({ testDate: today });
              setQualityOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Log Sample
          </Button>
        </div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          {qualityQ.isLoading ? (
            <div className="text-sm text-muted-foreground p-4">Loading…</div>
          ) : qualityTests.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">
              No quality test records yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/5 border-b">
                <tr>
                  {["Date", "Store", "DM %", "pH", "ME (MJ/kg)", "Crude Protein %", "Lab", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {qualityTests.map((r) => (
                  <tr key={Number(r.id)} className="hover:bg-black/5">
                    <td className="px-4 py-3">{fmt(r.testDate as string)}</td>
                    <td className="px-4 py-3">{String(r.storeName ?? storeName(r.storeId))}</td>
                    <td className="px-4 py-3">
                      {!r.dryMatterPct ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Awaiting results</span>
                      ) : String(r.dryMatterPct)}
                    </td>
                    <td className="px-4 py-3">{String(r.ph ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.metabolisableEnergy ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.crudeProteinPct ?? "—")}</td>
                    <td className="px-4 py-3">{String(r.labName ?? "—")}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {!r.dryMatterPct && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-1 h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => {
                            setEditingQuality(r);
                            setQualityMode("result");
                            setQualityForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
                            setQualityOpen(true);
                          }}
                        >
                          Enter results
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingQuality(r);
                          setQualityMode("edit");
                          setQualityForm(
                            Object.fromEntries(
                              Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])
                            )
                          );
                          setQualityOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteQualityId(Number(r.id))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══ Additive dialog ═══════════════════════════════════════════════════ */}
      <Dialog
        open={additiveOpen}
        onOpenChange={(o) => {
          setAdditiveOpen(o);
          if (!o) {
            setEditingAdditive(null);
            setAdditiveForm({});
            saveAdditiveMut.reset();
          }
        }}
      >
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>
              {editingAdditive ? "Edit Additive Record" : "Add Silage Additive / Inoculant Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Application Date *</Label>
              <Input
                type="date"
                max={today}
                value={additiveForm.applicationDate ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, applicationDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Store / Clamp</Label>
              <Select
                value={additiveForm.storeId ?? ""}
                onValueChange={(v) => setAdditiveForm((f) => ({ ...f, storeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clamp…" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s: any) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {String(s.storeName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Crop Type</Label>
              <Select
                value={additiveForm.cropType ?? ""}
                onValueChange={(v) => setAdditiveForm((f) => ({ ...f, cropType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grass Silage">Grass Silage</SelectItem>
                  <SelectItem value="Maize Silage">Maize Silage</SelectItem>
                  <SelectItem value="Wholecrop">Wholecrop</SelectItem>
                  <SelectItem value="Haylage">Haylage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product Name *</Label>
              <Input
                value={additiveForm.productName ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, productName: e.target.value }))}
                placeholder="e.g. Ecosyl, Magniva, propionic acid"
              />
            </div>
            <div>
              <Label>Additive Type</Label>
              <Select
                value={additiveForm.additiveType ?? ""}
                onValueChange={(v) => setAdditiveForm((f) => ({ ...f, additiveType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bacterial Inoculant">Bacterial Inoculant</SelectItem>
                  <SelectItem value="Acid-based">Acid-based</SelectItem>
                  <SelectItem value="Enzyme">Enzyme</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Application Rate</Label>
              <Input
                value={additiveForm.applicationRate ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, applicationRate: e.target.value }))}
                placeholder="e.g. 3L/tonne"
              />
            </div>
            <div>
              <Label>Batch / Lot Number</Label>
              <Input
                value={additiveForm.batchNumber ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, batchNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label>Applied By</Label>
              <Input
                value={additiveForm.appliedBy ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, appliedBy: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={additiveForm.notes ?? ""}
                onChange={(e) => setAdditiveForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogMutationError mutation={saveAdditiveMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdditiveOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!additiveForm.applicationDate || !additiveForm.productName || saveAdditiveMut.isPending}
              onClick={() => saveAdditiveMut.mutate(additiveForm)}
            >
              {editingAdditive ? "Save Changes" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Quality test dialog ═══════════════════════════════════════════════ */}
      <Dialog
        open={qualityOpen}
        onOpenChange={(o) => {
          setQualityOpen(o);
          if (!o) {
            setEditingQuality(null);
            setQualityForm({});
            saveQualityMut.reset();
          }
        }}
      >
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>
              {qualityMode === "log" ? "Log Silage Quality Sample" : qualityMode === "result" ? "Enter Silage Quality Results" : "Edit Silage Quality Test"}
            </DialogTitle>
          </DialogHeader>
          {qualityMode === "log" && <p className="text-xs text-muted-foreground -mt-1">Record the sampling event now. Return to enter laboratory results once the report arrives.</p>}
          {qualityMode === "result" && editingQuality && <p className="text-xs text-muted-foreground -mt-1">Sample from <strong>{fmt(editingQuality.testDate as string)}</strong> · {String(editingQuality.storeName ?? storeName(editingQuality.storeId))}. Enter results from your lab report.</p>}
          <div className="grid grid-cols-2 gap-3">
            {qualityMode !== "result" && <>
              <div>
                <Label>Test Date *</Label>
                <Input
                  type="date"
                  max={today}
                  value={qualityForm.testDate ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, testDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Store / Clamp</Label>
                <Select
                  value={qualityForm.storeId ?? ""}
                  onValueChange={(v) => setQualityForm((f) => ({ ...f, storeId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select clamp…" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s: any) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {String(s.storeName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lab / Analyser</Label>
                <Input
                  value={qualityForm.labName ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, labName: e.target.value }))}
                  placeholder="e.g. Trouw Nutrition, NIRS on-farm"
                />
              </div>
            </>}
            {qualityMode !== "log" && <>
              <div>
                <Label>Dry Matter %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={qualityForm.dryMatterPct ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, dryMatterPct: e.target.value }))}
                />
              </div>
              <div>
                <Label>pH</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={qualityForm.ph ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, ph: e.target.value }))}
                />
              </div>
              <div>
                <Label>Metabolisable Energy (MJ/kg DM)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={qualityForm.metabolisableEnergy ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, metabolisableEnergy: e.target.value }))}
                />
              </div>
              <div>
                <Label>Crude Protein %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={qualityForm.crudeProteinPct ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, crudeProteinPct: e.target.value }))}
                />
              </div>
              <div>
                <Label>Ammonia-N (% of total N)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={qualityForm.ammoniaN ?? ""}
                  onChange={(e) => setQualityForm((f) => ({ ...f, ammoniaN: e.target.value }))}
                />
              </div>
            </>}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={qualityForm.notes ?? ""}
                onChange={(e) => setQualityForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>
            {qualityMode !== "log" && (() => {
              const ph = qualityForm.ph ? parseFloat(String(qualityForm.ph)) : null;
              const ammoniaN = qualityForm.ammoniaN ? parseFloat(String(qualityForm.ammoniaN)) : null;
              const dryMatterPct = qualityForm.dryMatterPct ? parseFloat(String(qualityForm.dryMatterPct)) : null;
              const flags: string[] = [];
              if (ph !== null && !isNaN(ph) && ph > 4.5) flags.push("pH above 4.5 — fermentation/listeria risk");
              if (ammoniaN !== null && !isNaN(ammoniaN) && ammoniaN > 15) flags.push("Ammonia-N above 15% — spoilage risk");
              if (dryMatterPct !== null && !isNaN(dryMatterPct) && dryMatterPct < 25) flags.push("DM below 25% — effluent/pollution risk");
              if (flags.length === 0) return null;
              return (
                <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                  <p className="text-xs font-medium text-amber-800">
                    Out of normal range — a task will be raised on the Task Board when you save.
                  </p>
                  <ul className="text-xs text-amber-700 mt-1 list-disc pl-4">
                    {flags.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              );
            })()}
          </div>
          <DialogMutationError mutation={saveQualityMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setQualityOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!qualityForm.testDate || saveQualityMut.isPending}
              onClick={() => saveQualityMut.mutate(qualityForm)}
            >
              {qualityMode === "log" ? "Log Sample" : qualityMode === "result" ? "Save Results" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Stock Log / Edit Dialog ═══════════════════════════════════════════ */}
      <Dialog open={stockOpen} onOpenChange={v => { if (!v) { setStockOpen(false); setEditingStock(null); setStockForm({}); saveStockMut.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingStock ? "Edit Batch" : "Log Silage / Haylage Batch"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Crop Type *</Label>
              <Select value={stockForm.cropType ?? ""} onValueChange={v => setStockForm((p: any) => ({ ...p, cropType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {["Grass Silage", "Maize Silage", "Wholecrop", "Haylage", "Hay", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cut Number</Label>
              <Select value={stockForm.cutNumber ? String(stockForm.cutNumber) : ""} onValueChange={v => setStockForm((p: any) => ({ ...p, cutNumber: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Harvest Date</Label><Input type="date" value={stockForm.harvestDate ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, harvestDate: e.target.value }))} /></div>
            <div><Label>Source Field</Label><Input placeholder="Field name or reference" value={stockForm.fieldOfOrigin ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, fieldOfOrigin: e.target.value }))} /></div>
            <div><Label>Quantity (tonnes)</Label><Input type="number" step="0.1" placeholder="e.g. 120" value={stockForm.quantityTonnes ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, quantityTonnes: e.target.value }))} /></div>
            <div><Label>Number of Bales</Label><Input type="number" placeholder="for baled crops" value={stockForm.quantityBales ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, quantityBales: e.target.value }))} /></div>
            <div><Label>Bale Weight (kg)</Label><Input type="number" placeholder="e.g. 550" value={stockForm.baleWeightKg ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, baleWeightKg: e.target.value }))} /></div>
            <div><Label>Dry Matter %</Label><Input type="number" step="0.1" placeholder="e.g. 30" value={stockForm.dryMatterPercent ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, dryMatterPercent: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Clamp / Store Name</Label><Input placeholder="e.g. Main clamp, North yard" value={stockForm.storeName ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, storeName: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={stockForm.notes ?? ""} onChange={e => setStockForm((p: any) => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={saveStockMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setStockOpen(false); setEditingStock(null); setStockForm({}); }}>Cancel</Button>
            <Button disabled={saveStockMut.isPending || !stockForm.cropType} onClick={() => saveStockMut.mutate({ cropType: stockForm.cropType, cutNumber: stockForm.cutNumber ? Number(stockForm.cutNumber) : null, harvestDate: stockForm.harvestDate || null, fieldOfOrigin: stockForm.fieldOfOrigin || null, quantityTonnes: stockForm.quantityTonnes ? parseFloat(stockForm.quantityTonnes) : null, quantityBales: stockForm.quantityBales ? parseInt(stockForm.quantityBales) : null, baleWeightKg: stockForm.baleWeightKg ? parseFloat(stockForm.baleWeightKg) : null, dryMatterPercent: stockForm.dryMatterPercent ? parseFloat(stockForm.dryMatterPercent) : null, storeName: stockForm.storeName || null, status: stockForm.status || "in-store", notes: stockForm.notes || null })}>
              {saveStockMut.isPending && <Plus className="w-4 h-4 mr-1 animate-spin" />}{editingStock ? "Save Changes" : "Log Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Drawdown Dialog ═══════════════════════════════════════════════════ */}
      <Dialog open={usageOpen} onOpenChange={v => { if (!v) { setUsageOpen(false); setUsageForStock(null); setUsageForm({}); saveUsageMut.reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Drawdown — {usageForStock?.cropType ?? "Batch"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div><Label>Date</Label><Input type="date" value={usageForm.usageDate ?? ""} onChange={e => setUsageForm((p: any) => ({ ...p, usageDate: e.target.value }))} /></div>
            <div><Label>Quantity (tonnes)</Label><Input type="number" step="0.1" value={usageForm.quantityTonnes ?? ""} onChange={e => setUsageForm((p: any) => ({ ...p, quantityTonnes: e.target.value }))} /></div>
            <div><Label>Quantity (bales)</Label><Input type="number" value={usageForm.quantityBales ?? ""} onChange={e => setUsageForm((p: any) => ({ ...p, quantityBales: e.target.value }))} /></div>
            <div><Label>Purpose</Label>
              <Select value={usageForm.purpose ?? ""} onValueChange={v => setUsageForm((p: any) => ({ ...p, purpose: v }))}>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>
                  {["feeding", "bedding", "sold", "waste"].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Herd / Livestock Group</Label><Input placeholder="e.g. Dairy herd, Flock 1" value={usageForm.herdName ?? ""} onChange={e => setUsageForm((p: any) => ({ ...p, herdName: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={usageForm.notes ?? ""} onChange={e => setUsageForm((p: any) => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={saveUsageMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUsageOpen(false); setUsageForStock(null); setUsageForm({}); }}>Cancel</Button>
            <Button disabled={saveUsageMut.isPending} onClick={() => saveUsageMut.mutate({ stockId: usageForStock?.id, usageDate: usageForm.usageDate || null, quantityTonnes: usageForm.quantityTonnes ? parseFloat(usageForm.quantityTonnes) : null, quantityBales: usageForm.quantityBales ? parseInt(usageForm.quantityBales) : null, purpose: usageForm.purpose || null, herdName: usageForm.herdName || null, notes: usageForm.notes || null })}>Record Drawdown</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete Stock confirm ══════════════════════════════════════════════ */}
      <Dialog open={deleteStockId !== null} onOpenChange={o => { if (!o) { setDeleteStockId(null); deleteStockMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Stock Batch</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this silage / haylage batch? All drawdown records for this batch will also be removed.</p>
          <DialogMutationError mutation={deleteStockMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStockId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteStockMut.isPending} onClick={() => deleteStockId !== null && deleteStockMut.mutate(deleteStockId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete confirms ═══════════════════════════════════════════════════ */}
      <Dialog open={deleteAdditiveId !== null} onOpenChange={(o) => { if (!o) { setDeleteAdditiveId(null); deleteAdditiveMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Delete Additive Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this additive record? This cannot be undone.</p>
          <DialogMutationError mutation={deleteAdditiveMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdditiveId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAdditiveId !== null && deleteAdditiveMut.mutate(deleteAdditiveId)}
              disabled={deleteAdditiveMut.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteQualityId !== null} onOpenChange={(o) => { if (!o) { setDeleteQualityId(null); deleteQualityMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Delete Quality Test</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this quality test record? This cannot be undone.</p>
          <DialogMutationError mutation={deleteQualityMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQualityId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteQualityId !== null && deleteQualityMut.mutate(deleteQualityId)}
              disabled={deleteQualityMut.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RaiseTaskDialog
        farmId={farmId}
        open={raiseTaskOpen}
        onClose={() => { setRaiseTaskOpen(false); setPendingTask(null); }}
        defaultTitle={pendingTask?.title ?? ""}
        defaultDescription={pendingTask?.description ?? ""}
        taskType="silage_quality_out_of_range"
        module="Silage & Haylage"
      />
    </div>
  );
}
