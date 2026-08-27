import React, { useState } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Flame, Plus, Printer, Download, ChevronDown, ChevronUp, Trash2, Pencil, Eye,
  AlertTriangle, ShieldCheck, ClipboardList, Camera
} from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Link } from "wouter";
import { useAppStore } from "@/hooks/use-app-store";
import { printProReport } from "@/lib/print-report";
import { PhotoPanel } from "@/pages/fly-tipping/PhotoPanel";
import { useRawFarmName } from "@/hooks/use-farm-name";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Field { id: number; name: string; fieldReference: string | null; }
interface IncidentPhoto { id: number; objectPath: string; fileName: string | null; }
interface InsurancePolicy { id: number; policyType: string; insurer: string | null; policyNumber: string | null; expiryDate: string | null; supersededByRenewal: boolean; }

interface Incident {
  id: number;
  farmId: number;
  dateDiscovered: string;
  dateOccurred: string | null;
  incidentType: string;
  fieldId: number | null;
  locationDescription: string;
  description: string;
  estimatedLossValue: string | null;
  areaQuantityAffected: string | null;
  policeAttended: boolean;
  policeRefNumber: string | null;
  fireAttended: boolean;
  fireRefNumber: string | null;
  eaAttended: boolean;
  eaRefNumber: string | null;
  crimeReference: string | null;
  status: string;
  insurancePolicyId: number | null;
  insuranceClaimRef: string | null;
  insuranceClaimDate: string | null;
  settlementAmount: string | null;
  settlementDate: string | null;
  insurerContact: string | null;
  notes: string | null;
  createdAt: string;
  photos: IncidentPhoto[];
}

interface TaskAssignment {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  module: string | null;
  taskType: string | null;
  taskSourceId: string | null;
}

const TASK_STATUS_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending:     { label: "Pending",     bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  in_progress: { label: "In Progress", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  completed:   { label: "Completed",   bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelled:   { label: "Cancelled",   bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
};

function taskStatusBadge(status: string) {
  const s = TASK_STATUS_STYLES[status] ?? TASK_STATUS_STYLES.pending;
  return (
    <span style={{
      display: "inline-block", padding: "1px 8px", borderRadius: 9999, fontSize: "0.68rem", fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, flexShrink: 0,
    }}>{s.label}</span>
  );
}

/** Compact list of tasks raised for an incident, each linking to the Task Board. */
function IncidentTaskList({ tasks }: { tasks: TaskAssignment[] }) {
  if (tasks.length === 0) return null;
  const open = tasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length;
  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#92400e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardList style={{ width: 14, height: 14 }} />
        Raised Tasks ({tasks.length}){open > 0 ? ` — ${open} open` : ""}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {tasks.map(t => (
          <Link key={t.id} href={`/task-board?id=${t.id}`} onClick={e => e.stopPropagation()}
            style={{
              display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
              background: "#fff", border: "1px solid #f3e8c0", borderRadius: 6, padding: "6px 10px",
            }}
            title="Open this task on the Task Board">
            <span style={{
              flex: 1, minWidth: 0, fontSize: "0.82rem", fontWeight: 600, color: "#1f2937",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textDecoration: t.status === "completed" ? "line-through" : "none",
            }}>{t.title}</span>
            {t.dueDate && <span style={{ fontSize: "0.72rem", color: "#6b7280", flexShrink: 0 }}>Due {fmt(t.dueDate)}</span>}
            {taskStatusBadge(t.status)}
          </Link>
        ))}
      </div>
    </div>
  );
}

const isImagePhoto = (p: IncidentPhoto) => /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(p.fileName ?? p.objectPath);

// ─── Constants ────────────────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  "Fire",
  "Wildfire",
  "Theft",
  "Criminal Damage",
  "Crop Damage — Weather",
  "Crop Damage — Pest",
  "Livestock Loss",
  "Equipment Damage",
  "Flood",
  "Other",
];

const STATUSES = [
  { value: "reported", label: "Reported", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "under_investigation", label: "Under Investigation", bg: "#fef9c3", color: "#a16207", border: "#fde047" },
  { value: "claim_raised", label: "Claim Raised", bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  { value: "settled", label: "Settled", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  { value: "closed", label: "Closed", bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" },
];

const CRIME_TYPES = new Set(["Theft", "Criminal Damage"]);

/** Types visually flagged as high-risk (red badge, warning icon). */
const HIGH_RISK_TYPES = ["Fire", "Wildfire", "Flood"];
/** Types where insurers usually require photo evidence ("no photos" hint). */
const EVIDENCE_REQUIRED_TYPES = ["Fire", "Theft", "Criminal Damage"];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length === 3) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = parseInt(parts[1]) - 1;
    return `${parseInt(parts[2])} ${months[m]} ${parts[0]}`;
  }
  return d;
};

const fmtGBP = (v: string | null | undefined) => {
  if (!v) return "—";
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function statusBadge(status: string) {
  const s = STATUSES.find(x => x.value === status) ?? STATUSES[0];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: "0.03em",
    }}>{s.label}</span>
  );
}

function incidentTypeBadge(type: string) {
  const isHighRisk = HIGH_RISK_TYPES.includes(type);
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 700,
      background: isHighRisk ? "#fff1f2" : "#f3f4f6",
      color: isHighRisk ? "#be123c" : "#374151",
      border: `1px solid ${isHighRisk ? "#fecdd3" : "#e5e7eb"}`,
    }}>{type}</span>
  );
}

function viewField(label: string, value?: string | null | boolean) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>
        {value === true ? "Yes" : value === false ? "No" : (value as string) || "—"}
      </div>
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────

function emptyForm(): Omit<Incident, "id"|"farmId"|"createdAt"|"photos"> {
  return {
    dateDiscovered: new Date().toISOString().split("T")[0],
    dateOccurred: null,
    incidentType: "",
    fieldId: null,
    locationDescription: "",
    description: "",
    estimatedLossValue: null,
    areaQuantityAffected: null,
    policeAttended: false,
    policeRefNumber: null,
    fireAttended: false,
    fireRefNumber: null,
    eaAttended: false,
    eaRefNumber: null,
    crimeReference: null,
    status: "reported",
    insurancePolicyId: null,
    insuranceClaimRef: null,
    insuranceClaimDate: null,
    settlementAmount: null,
    settlementDate: null,
    insurerContact: null,
    notes: null,
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FarmIncidentsPage() {
  const { farmId } = useAppStore();
  const rawFarmName = useRawFarmName(farmId ?? 0);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "farm-incidents", filter: "status", farmId, defaultValue: "all" });
  const [evidenceFilter, setEvidenceFilter] = usePersistedFilter({ page: "farm-incidents", filter: "evidence", farmId, defaultValue: "all" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Incident | null>(null);
  const [form, setForm] = useState<Omit<Incident, "id"|"farmId"|"createdAt"|"photos">>(emptyForm());

  // ── Queries ──

  const { data: incData } = useQuery<{ records: Incident[] }>({
    queryKey: ["farm-incidents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/incidents`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const incidents = incData?.records ?? [];

  const { data: fieldsData } = useQuery<{ fields: Field[] }>({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const fields = fieldsData?.fields ?? [];

  const { data: policiesData } = useQuery<{ records: InsurancePolicy[] }>({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const allPolicies = policiesData?.records ?? [];
  const validPolicies = allPolicies.filter(p => !p.supersededByRenewal);

  const { data: tasksData } = useQuery<{ records: TaskAssignment[] }>({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  // Map incidentId → tasks via the structured taskType/taskSourceId link.
  // (Older tasks are backfilled by a startup migration, so no description parsing.)
  const incidentTasks = React.useMemo(() => {
    const map = new Map<number, TaskAssignment[]>();
    for (const t of (tasksData?.records ?? [])) {
      if (t.taskType !== "incident" || !t.taskSourceId || isNaN(Number(t.taskSourceId))) continue;
      const id = Number(t.taskSourceId);
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(t);
    }
    return map;
  }, [tasksData]);

  // ── Mutations ──

  const mutOpts = {
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["farm-incidents", farmId] }); },
  };

  const createMut = useMutation({
    mutationFn: (body: object) => fetch(`/api/farms/${farmId}/incidents`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    ...mutOpts,
    onSuccess: () => { mutOpts.onSuccess(); setAddOpen(false); setForm(emptyForm()); toast({ title: "Incident recorded" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => fetch(`/api/farms/${farmId}/incidents/${id}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    ...mutOpts,
    onSuccess: () => { mutOpts.onSuccess(); setEditId(null); toast({ title: "Incident updated" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/incidents/${id}`, {
      method: "DELETE", credentials: "include",
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    ...mutOpts,
    onSuccess: () => { mutOpts.onSuccess(); setDeleteId(null); toast({ title: "Incident deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Helpers ──

  const setF = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v ?? null }));

  const formToBody = (f: typeof form) => ({
    ...f,
    dateOccurred: f.dateOccurred || null,
    fieldId: f.fieldId ? Number(f.fieldId) : null,
    estimatedLossValue: f.estimatedLossValue || null,
    areaQuantityAffected: f.areaQuantityAffected || null,
    policeRefNumber: f.policeRefNumber || null,
    fireRefNumber: f.fireRefNumber || null,
    eaRefNumber: f.eaRefNumber || null,
    crimeReference: f.crimeReference || null,
    insurancePolicyId: f.insurancePolicyId ? Number(f.insurancePolicyId) : null,
    insuranceClaimRef: f.insuranceClaimRef || null,
    insuranceClaimDate: f.insuranceClaimDate || null,
    settlementAmount: f.settlementAmount || null,
    settlementDate: f.settlementDate || null,
    insurerContact: f.insurerContact || null,
    notes: f.notes || null,
  });

  const openEdit = (inc: Incident) => {
    setForm({
      dateDiscovered: inc.dateDiscovered,
      dateOccurred: inc.dateOccurred,
      incidentType: inc.incidentType,
      fieldId: inc.fieldId,
      locationDescription: inc.locationDescription,
      description: inc.description,
      estimatedLossValue: inc.estimatedLossValue,
      areaQuantityAffected: inc.areaQuantityAffected,
      policeAttended: inc.policeAttended,
      policeRefNumber: inc.policeRefNumber,
      fireAttended: inc.fireAttended,
      fireRefNumber: inc.fireRefNumber,
      eaAttended: inc.eaAttended,
      eaRefNumber: inc.eaRefNumber,
      crimeReference: inc.crimeReference,
      status: inc.status,
      insurancePolicyId: inc.insurancePolicyId,
      insuranceClaimRef: inc.insuranceClaimRef,
      insuranceClaimDate: inc.insuranceClaimDate,
      settlementAmount: inc.settlementAmount,
      settlementDate: inc.settlementDate,
      insurerContact: inc.insurerContact,
      notes: inc.notes,
    });
    setEditId(inc.id);
  };

  const statusFiltered = statusFilter === "all" ? incidents : incidents.filter(i => i.status === statusFilter);
  const filtered = evidenceFilter === "all"
    ? statusFiltered
    : statusFiltered.filter(i =>
        (i.photos ?? []).length === 0 &&
        (evidenceFilter === "missing" || HIGH_RISK_TYPES.includes(i.incidentType)));
  const missingCount = incidents.filter(i => (i.photos ?? []).length === 0).length;
  const missingHighRiskCount = incidents.filter(i => (i.photos ?? []).length === 0 && HIGH_RISK_TYPES.includes(i.incidentType)).length;

  // ── CSV Export ──

  const handleCsvExport = () => {
    const header = ["Date Discovered","Date Occurred","Incident Type","Location","Description",
      "Estimated Loss (£)","Area/Quantity Affected","Police Attended","Police Ref",
      "Fire Service Attended","Fire Ref","EA Attended","EA Ref","Crime Reference",
      "Status","Insurance Policy ID","Claim Ref","Claim Date","Settlement Amount","Settlement Date","Insurer Contact","Notes","Photo Evidence"];
    const rows = filtered.map(i => [
      i.dateDiscovered, i.dateOccurred ?? "", i.incidentType, i.locationDescription, i.description,
      i.estimatedLossValue ?? "", i.areaQuantityAffected ?? "",
      i.policeAttended ? "Yes" : "No", i.policeRefNumber ?? "",
      i.fireAttended ? "Yes" : "No", i.fireRefNumber ?? "",
      i.eaAttended ? "Yes" : "No", i.eaRefNumber ?? "",
      i.crimeReference ?? "", STATUSES.find(s => s.value === i.status)?.label ?? i.status,
      i.insurancePolicyId?.toString() ?? "", i.insuranceClaimRef ?? "", i.insuranceClaimDate ?? "",
      i.settlementAmount ?? "", i.settlementDate ?? "", i.insurerContact ?? "", i.notes ?? "",
      (i.photos ?? []).map(p => p.fileName ?? p.objectPath.split("/").pop() ?? "Photo").join("; "),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`));
    const csv = [header.map(h => `"${h}"`).join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const filterParts: string[] = [];
    if (statusFilter !== "all") {
      filterParts.push(slugify(STATUSES.find(s => s.value === statusFilter)?.label ?? statusFilter));
    }
    if (evidenceFilter === "missing") filterParts.push("missing-evidence");
    else if (evidenceFilter === "missing_high_risk") filterParts.push("high-risk-no-photos");
    const filterSuffix = filterParts.length ? `-${filterParts.join("-")}` : "";
    a.href = url; a.download = `farm-incidents${filterSuffix}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Print single incident ──

  const handlePrintIncident = (inc: Incident) => {
    const policyLabel = inc.insurancePolicyId
      ? allPolicies.find(p => p.id === inc.insurancePolicyId)
        ? `${allPolicies.find(p => p.id === inc.insurancePolicyId)!.policyType} — ${allPolicies.find(p => p.id === inc.insurancePolicyId)!.insurer ?? ""} (${allPolicies.find(p => p.id === inc.insurancePolicyId)!.policyNumber ?? ""})`
        : `Policy #${inc.insurancePolicyId}`
      : "None";
    const fieldLabel = inc.fieldId ? (fields.find(f => f.id === inc.fieldId)?.name ?? `Field #${inc.fieldId}`) : null;
    const statusLabel = STATUSES.find(s => s.value === inc.status)?.label ?? inc.status;

    const rows = [
      ["Date Discovered", fmt(inc.dateDiscovered)],
      ["Date Occurred", fmt(inc.dateOccurred)],
      ["Incident Type", inc.incidentType],
      ["Status", statusLabel],
      ["Field", fieldLabel ?? "—"],
      ["Location", inc.locationDescription],
      ["Description", inc.description],
      ["Estimated Loss", fmtGBP(inc.estimatedLossValue)],
      ["Area / Quantity Affected", inc.areaQuantityAffected ?? "—"],
      ["Police Attended", inc.policeAttended ? "Yes" : "No"],
      ["Police Reference", inc.policeRefNumber ?? "—"],
      ["Fire Service Attended", inc.fireAttended ? "Yes" : "No"],
      ["Fire Service Reference", inc.fireRefNumber ?? "—"],
      ["Environment Agency Attended", inc.eaAttended ? "Yes" : "No"],
      ["EA Reference", inc.eaRefNumber ?? "—"],
      ...(CRIME_TYPES.has(inc.incidentType) ? [["Crime Reference", inc.crimeReference ?? "—"]] : []),
      ["Insurance Policy", policyLabel],
      ["Claim Reference", inc.insuranceClaimRef ?? "—"],
      ["Claim Date", fmt(inc.insuranceClaimDate)],
      ["Settlement Amount", fmtGBP(inc.settlementAmount)],
      ["Settlement Date", fmt(inc.settlementDate)],
      ["Insurer Contact", inc.insurerContact ?? "—"],
      ["Notes", inc.notes ?? "—"],
    ] as [string, string][];

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    const photos = inc.photos ?? [];
    const imagePhotos = photos.filter(isImagePhoto);
    const otherPhotos = photos.filter(p => !isImagePhoto(p));
    const photosHtml = photos.length ? `
      <div class="section-head">Evidence Photos (${photos.length})</div>
      ${imagePhotos.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px">${
        imagePhotos.map(p => `<div style="page-break-inside:avoid"><img src="/api/storage${esc(p.objectPath)}" style="max-width:220px;max-height:160px;border:1px solid #d1d5db;border-radius:4px;display:block" /><div style="font-size:6.5px;color:#555;margin-top:2px">${esc(p.fileName ?? "Photo")}</div></div>`).join("")
      }</div>` : ""}
      ${otherPhotos.length ? `<div style="font-size:7.5px;color:#374151">Attached files: ${otherPhotos.map(p => esc(p.fileName ?? "File")).join(", ")}</div>` : ""}
    ` : "";
    const tableHtml = `<table><thead><tr><th>Field</th><th>Detail</th></tr></thead><tbody>${
      rows.map(([label, value]) => `<tr><td style="font-weight:600;white-space:nowrap;width:200px">${esc(label)}</td><td>${esc(value)}</td></tr>`).join("")
    }</tbody></table>${photosHtml}`;
    printProReport({
      title: `Farm Incident Report — ${inc.incidentType}`,
      subtitle: `Reported: ${fmt(inc.dateDiscovered)}`,
      farmName: rawFarmName,
      authority: inc.policeAttended ? "Police" : inc.fireAttended ? "Fire & Rescue Service" : inc.eaAttended ? "Environment Agency" : undefined,
      authorityReferenceLabel: inc.policeAttended ? "Police reference" : inc.fireAttended ? "Fire reference" : inc.eaAttended ? "Environment Agency reference" : undefined,
      authorityReference: inc.policeAttended ? inc.policeRefNumber : inc.fireAttended ? inc.fireRefNumber : inc.eaAttended ? inc.eaRefNumber : null,
      additionalReferences: [
        ...(inc.crimeReference ? [{ label: "Crime reference", value: inc.crimeReference }] : []),
        ...(inc.insuranceClaimRef ? [{ label: "Insurance claim reference", value: inc.insuranceClaimRef }] : []),
      ],
      tableHtml,
    });
  };

  // ── Form dialog body (shared add/edit) ──

  const renderForm = () => (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Core details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label>Date Discovered *</Label>
          <Input type="date" value={form.dateDiscovered} onChange={e => setF("dateDiscovered", e.target.value)} />
        </div>
        <div>
          <Label>Date Occurred</Label>
          <Input type="date" value={form.dateOccurred ?? ""} onChange={e => setF("dateOccurred", e.target.value || null)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label>Incident Type *</Label>
          <Select value={form.incidentType} onValueChange={v => setF("incidentType", v)}>
            <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
            <SelectContent>
              {INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setF("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div>
        <Label>Field (optional)</Label>
        <Select value={form.fieldId?.toString() ?? ""} onValueChange={v => setF("fieldId", v ? Number(v) : null)}>
          <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">— None —</SelectItem>
            {fields.map(f => (
              <SelectItem key={f.id} value={f.id.toString()}>
                {f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Location Description *</Label>
        <Input value={form.locationDescription} onChange={e => setF("locationDescription", e.target.value)} placeholder="e.g. North barn, Top field gate…" />
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea rows={3} value={form.description} onChange={e => setF("description", e.target.value)} placeholder="What happened?" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label>Estimated Loss Value (£)</Label>
          <Input type="number" min={0} step="0.01" value={form.estimatedLossValue ?? ""} onChange={e => setF("estimatedLossValue", e.target.value || null)} placeholder="0.00" />
        </div>
        <div>
          <Label>Area / Quantity Affected</Label>
          <Input value={form.areaQuantityAffected ?? ""} onChange={e => setF("areaQuantityAffected", e.target.value || null)} placeholder="e.g. 12 ha, 50 bales…" />
        </div>
      </div>

      {/* Emergency services */}
      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#374151", marginBottom: 12 }}>Emergency Services</div>
        <div style={{ display: "grid", gap: 10 }}>
          {/* Police */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.policeAttended} onChange={e => setF("policeAttended", e.target.checked)} />
              Police attended
            </label>
            {form.policeAttended && (
              <Input size={1} value={form.policeRefNumber ?? ""} onChange={e => setF("policeRefNumber", e.target.value || null)} placeholder="Police reference number" />
            )}
          </div>
          {/* Fire */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.fireAttended} onChange={e => setF("fireAttended", e.target.checked)} />
              Fire service attended
            </label>
            {form.fireAttended && (
              <Input size={1} value={form.fireRefNumber ?? ""} onChange={e => setF("fireRefNumber", e.target.value || null)} placeholder="Fire service reference" />
            )}
          </div>
          {/* EA */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.eaAttended} onChange={e => setF("eaAttended", e.target.checked)} />
              EA attended
            </label>
            {form.eaAttended && (
              <Input size={1} value={form.eaRefNumber ?? ""} onChange={e => setF("eaRefNumber", e.target.value || null)} placeholder="Environment Agency reference" />
            )}
          </div>
        </div>
      </div>

      {/* Crime reference — only for theft / criminal damage */}
      {CRIME_TYPES.has(form.incidentType) && (
        <div>
          <Label>Crime Reference Number</Label>
          <Input value={form.crimeReference ?? ""} onChange={e => setF("crimeReference", e.target.value || null)} placeholder="e.g. 01/12345/24" />
        </div>
      )}

      {/* Insurance */}
      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#374151", marginBottom: 12 }}>
          <ShieldCheck style={{ display: "inline", width: 14, height: 14, marginRight: 6, verticalAlign: "middle" }} />
          Insurance Claim (optional)
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <Label>Link to Insurance Policy</Label>
            <Select value={form.insurancePolicyId?.toString() ?? ""} onValueChange={v => setF("insurancePolicyId", v ? Number(v) : null)}>
              <SelectTrigger><SelectValue placeholder="Select policy…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                {validPolicies.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.policyType}{p.insurer ? ` — ${p.insurer}` : ""}{p.policyNumber ? ` (${p.policyNumber})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <Label>Claim Reference</Label>
              <Input value={form.insuranceClaimRef ?? ""} onChange={e => setF("insuranceClaimRef", e.target.value || null)} placeholder="e.g. CLM-2024-001" />
            </div>
            <div>
              <Label>Claim Date</Label>
              <Input type="date" value={form.insuranceClaimDate ?? ""} onChange={e => setF("insuranceClaimDate", e.target.value || null)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <Label>Settlement Amount (£)</Label>
              <Input type="number" min={0} step="0.01" value={form.settlementAmount ?? ""} onChange={e => setF("settlementAmount", e.target.value || null)} placeholder="0.00" />
            </div>
            <div>
              <Label>Settlement Date</Label>
              <Input type="date" value={form.settlementDate ?? ""} onChange={e => setF("settlementDate", e.target.value || null)} />
            </div>
          </div>
          <div>
            <Label>Insurer Contact</Label>
            <Input value={form.insurerContact ?? ""} onChange={e => setF("insurerContact", e.target.value || null)} placeholder="Name, phone or email…" />
          </div>
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea rows={3} value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} placeholder="Any additional notes…" />
      </div>
    </div>
  );

  // ── View dialog ──

  const viewInc = viewId !== null ? incidents.find(i => i.id === viewId) ?? null : null;

  const renderViewDialog = () => {
    if (!viewInc) return null;
    const fieldLabel = viewInc.fieldId ? (fields.find(f => f.id === viewInc.fieldId)?.name ?? `Field #${viewInc.fieldId}`) : null;
    const policy = viewInc.insurancePolicyId ? allPolicies.find(p => p.id === viewInc.insurancePolicyId) : null;

    return (
      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent style={{ maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Flame style={{ width: 20, height: 20, color: "#dc2626" }} />
              {viewInc.incidentType}
              <span style={{ marginLeft: 8 }}>{statusBadge(viewInc.status)}</span>
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {viewField("Date Discovered", fmt(viewInc.dateDiscovered))}
              {viewField("Date Occurred", fmt(viewInc.dateOccurred))}
              {viewField("Status", STATUSES.find(s => s.value === viewInc.status)?.label ?? viewInc.status)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {viewField("Field", fieldLabel ?? "—")}
              {viewField("Location", viewInc.locationDescription)}
            </div>
            {viewField("Description", viewInc.description)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {viewField("Estimated Loss", fmtGBP(viewInc.estimatedLossValue))}
              {viewField("Area / Quantity Affected", viewInc.areaQuantityAffected)}
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }}>Emergency Services</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  {viewField("Police", viewInc.policeAttended)}
                  {viewInc.policeAttended && <div style={{ fontSize: "0.8rem", color: "#374151", marginTop: 2 }}>{viewInc.policeRefNumber ?? "—"}</div>}
                </div>
                <div>
                  {viewField("Fire Service", viewInc.fireAttended)}
                  {viewInc.fireAttended && <div style={{ fontSize: "0.8rem", color: "#374151", marginTop: 2 }}>{viewInc.fireRefNumber ?? "—"}</div>}
                </div>
                <div>
                  {viewField("EA", viewInc.eaAttended)}
                  {viewInc.eaAttended && <div style={{ fontSize: "0.8rem", color: "#374151", marginTop: 2 }}>{viewInc.eaRefNumber ?? "—"}</div>}
                </div>
              </div>
            </div>

            {CRIME_TYPES.has(viewInc.incidentType) && viewField("Crime Reference", viewInc.crimeReference)}

            {(viewInc.insurancePolicyId || viewInc.insuranceClaimRef) && (
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }}>Insurance Claim</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {viewField("Policy", policy ? `${policy.policyType} — ${policy.insurer ?? ""} (${policy.policyNumber ?? ""})` : "—")}
                  {viewField("Claim Ref", viewInc.insuranceClaimRef)}
                  {viewField("Claim Date", fmt(viewInc.insuranceClaimDate))}
                  {viewField("Settlement Amount", fmtGBP(viewInc.settlementAmount))}
                  {viewField("Settlement Date", fmt(viewInc.settlementDate))}
                  {viewField("Insurer Contact", viewInc.insurerContact)}
                </div>
              </div>
            )}

            {viewInc.notes && viewField("Notes", viewInc.notes)}

            <IncidentTaskList tasks={incidentTasks.get(viewInc.id) ?? []} />

            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #f3f4f6" }}>
              <PhotoPanel incidentId={viewInc.id} farmId={farmId!} photos={viewInc.photos ?? []}
                resource="incidents" queryKey={["farm-incidents", farmId!]} />
            </div>
          </div>

          <DialogFooter style={{ marginTop: 12 }}>
            <Button variant="outline" size="sm" onClick={() => handlePrintIncident(viewInc)}>
              <Printer style={{ width: 14, height: 14, marginRight: 6 }} /> Print Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setViewId(null); setRaiseTaskFor(viewInc); }}>
              <ClipboardList style={{ width: 14, height: 14, marginRight: 6 }} /> Raise Task
            </Button>
            <Button size="sm" onClick={() => { setViewId(null); openEdit(viewInc); }}>
              <Pencil style={{ width: 14, height: 14, marginRight: 6 }} /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ── Render ──

  return (
    <AppLayout title="Farm Incidents">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ value: "all", label: "All" }, ...STATUSES].map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              style={{
                padding: "4px 14px", borderRadius: 9999, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                background: statusFilter === s.value ? "#111827" : "#f3f4f6",
                color: statusFilter === s.value ? "#fff" : "#374151",
                border: "1px solid transparent",
              }}
            >{"label" in s ? s.label : "All"}</button>
          ))}
          <span style={{ width: 1, alignSelf: "stretch", background: "#e5e7eb", margin: "0 4px" }} />
          {([
            { value: "missing", label: `Missing evidence${missingCount ? ` (${missingCount})` : ""}` },
            { value: "missing_high_risk", label: `High-risk, no photos${missingHighRiskCount ? ` (${missingHighRiskCount})` : ""}` },
          ] as const).map(o => {
            const active = evidenceFilter === o.value;
            return (
              <button
                key={o.value}
                onClick={() => setEvidenceFilter(active ? "all" : o.value)}
                title={o.value === "missing"
                  ? "Show only incidents with zero evidence photos"
                  : "Show only high-risk (Fire, Wildfire, Flood) incidents with zero evidence photos"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 14px", borderRadius: 9999, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  background: active ? "#b45309" : "#fffbeb",
                  color: active ? "#fff" : "#b45309",
                  border: `1px ${active ? "solid" : "dashed"} ${active ? "#b45309" : "#fcd34d"}`,
                }}
              ><Camera style={{ width: 13, height: 13 }} />{o.label}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" size="sm" onClick={handleCsvExport} disabled={filtered.length === 0}>
            <Download style={{ width: 14, height: 14, marginRight: 6 }} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm()); setAddOpen(true); }}>
            <Plus style={{ width: 14, height: 14, marginRight: 6 }} /> Log Incident
          </Button>
        </div>
      </div>

      {/* Summary counts */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        {STATUSES.map(s => {
          const count = incidents.filter(i => i.status === s.value).length;
          if (!count) return null;
          return (
            <div key={s.value} style={{
              padding: "6px 14px", borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`,
              color: s.color, fontSize: "0.8rem", fontWeight: 600,
            }}>
              {count} {s.label}
            </div>
          );
        })}
      </div>

      {/* Incident list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
          <Flame style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.3 }} />
          {evidenceFilter !== "all" && incidents.length > 0 ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No incidents missing photo evidence</div>
              <div style={{ fontSize: "0.875rem" }}>Every matching incident has at least one photo attached.</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No incidents recorded</div>
              <div style={{ fontSize: "0.875rem" }}>Use "Log Incident" to record a fire, theft, or other event.</div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map(inc => {
            const expanded = expandedId === inc.id;
            const fieldLabel = inc.fieldId ? (fields.find(f => f.id === inc.fieldId)?.name ?? "") : null;
            const isHighRisk = HIGH_RISK_TYPES.includes(inc.incidentType);

            return (
              <div key={inc.id} style={{
                border: "1px solid", borderColor: isHighRisk ? "#fecdd3" : "#e5e7eb",
                borderRadius: 10, background: "#fff", overflow: "hidden",
                boxShadow: isHighRisk ? "0 0 0 2px #fff1f2" : undefined,
              }}>
                {/* Card header */}
                <div
                  style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, cursor: "pointer" }}
                  onClick={() => setExpandedId(expanded ? null : inc.id)}
                >
                  {isHighRisk && <AlertTriangle style={{ width: 16, height: 16, color: "#dc2626", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {incidentTypeBadge(inc.incidentType)}
                      {statusBadge(inc.status)}
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{fmt(inc.dateDiscovered)}</span>
                      {fieldLabel && <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>· {fieldLabel}</span>}
                      {(inc.photos ?? []).length > 0 ? (
                        <span title={`${inc.photos.length} evidence photo${inc.photos.length === 1 ? "" : "s"} attached`} style={{
                          display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999,
                          fontSize: "0.72rem", fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                        }}>
                          <Camera style={{ width: 12, height: 12 }} />{inc.photos.length}
                        </span>
                      ) : EVIDENCE_REQUIRED_TYPES.includes(inc.incidentType) ? (
                        <span title="No photo evidence attached — insurers usually require photos for this incident type" style={{
                          display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999,
                          fontSize: "0.72rem", fontWeight: 600, background: "#fffbeb", color: "#b45309", border: "1px dashed #fcd34d",
                        }}>
                          <Camera style={{ width: 12, height: 12 }} />no photos
                        </span>
                      ) : null}
                      {(incidentTasks.get(inc.id) ?? []).length > 0 && (() => {
                        const ts = incidentTasks.get(inc.id)!;
                        const open = ts.filter(t => t.status !== "completed" && t.status !== "cancelled").length;
                        return (
                          <span title={`${ts.length} task${ts.length === 1 ? "" : "s"} raised — ${open} open`} style={{
                            display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 9999,
                            fontSize: "0.72rem", fontWeight: 700,
                            background: open > 0 ? "#fffbeb" : "#f0fdf4",
                            color: open > 0 ? "#b45309" : "#16a34a",
                            border: `1px solid ${open > 0 ? "#fcd34d" : "#bbf7d0"}`,
                          }}>
                            <ClipboardList style={{ width: 12, height: 12 }} />{open > 0 ? `${open} open` : "tasks done"}
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#374151", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {inc.locationDescription}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {inc.estimatedLossValue && (
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#dc2626" }}>{fmtGBP(inc.estimatedLossValue)}</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setViewId(inc.id); }}>
                      <Eye style={{ width: 14, height: 14 }} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openEdit(inc); }}>
                      <Pencil style={{ width: 14, height: 14 }} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handlePrintIncident(inc); }}>
                      <Printer style={{ width: 14, height: 14 }} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Raise Task" onClick={e => { e.stopPropagation(); setRaiseTaskFor(inc); }}>
                      <ClipboardList style={{ width: 14, height: 14, color: "#f59e0b" }} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDeleteId(inc.id); }}>
                      <Trash2 style={{ width: 14, height: 14, color: "#dc2626" }} />
                    </Button>
                    {expanded ? <ChevronUp style={{ width: 16, height: 16, color: "#9ca3af" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#9ca3af" }} />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 16px", background: "#fafafa" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                      {viewField("Date Occurred", fmt(inc.dateOccurred))}
                      {viewField("Estimated Loss", fmtGBP(inc.estimatedLossValue))}
                      {viewField("Area / Qty Affected", inc.areaQuantityAffected)}
                      {inc.policeAttended && viewField("Police Ref", inc.policeRefNumber)}
                      {inc.fireAttended && viewField("Fire Service Ref", inc.fireRefNumber)}
                      {inc.eaAttended && viewField("EA Ref", inc.eaRefNumber)}
                      {CRIME_TYPES.has(inc.incidentType) && viewField("Crime Reference", inc.crimeReference)}
                      {inc.insuranceClaimRef && viewField("Claim Ref", inc.insuranceClaimRef)}
                      {inc.settlementAmount && viewField("Settlement", fmtGBP(inc.settlementAmount))}
                    </div>
                    {inc.description && (
                      <div style={{ marginTop: 10, fontSize: "0.875rem", color: "#374151" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }}>DESCRIPTION: </span>
                        {inc.description}
                      </div>
                    )}
                    {inc.notes && (
                      <div style={{ marginTop: 6, fontSize: "0.875rem", color: "#374151" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }}>NOTES: </span>
                        {inc.notes}
                      </div>
                    )}
                    {(incidentTasks.get(inc.id) ?? []).length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <IncidentTaskList tasks={incidentTasks.get(inc.id)!} />
                      </div>
                    )}
                    {(inc.photos ?? []).length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <span style={{ fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }}>EVIDENCE PHOTOS ({inc.photos.length})</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                          {inc.photos.map(p => isImagePhoto(p) ? (
                            <a key={p.id} href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                              <img src={`/api/storage${p.objectPath}`} alt={p.fileName ?? "Evidence photo"}
                                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", display: "block" }} />
                            </a>
                          ) : (
                            <a key={p.id} href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px" }}>
                              {p.fileName ?? "File"}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) createMut.reset(); }}>
        <DialogContent style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>Log New Incident</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter style={{ marginTop: 16 }}>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMut.mutate(formToBody(form))}
              disabled={!form.dateDiscovered || !form.incidentType || !form.locationDescription || !form.description || createMut.isPending}
            >
              {createMut.isPending ? "Saving…" : "Save Incident"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editId !== null} onOpenChange={o => { if (!o) { setEditId(null); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
          </DialogHeader>
          {renderForm()}
          {editId !== null && (
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #f3f4f6", marginTop: 12 }}>
              <PhotoPanel incidentId={editId} farmId={farmId!} photos={incidents.find(i => i.id === editId)?.photos ?? []}
                resource="incidents" queryKey={["farm-incidents", farmId!]} />
            </div>
          )}
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter style={{ marginTop: 16 }}>
            <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
            <Button
              onClick={() => editId !== null && updateMut.mutate({ id: editId, body: formToBody(form) })}
              disabled={!form.dateDiscovered || !form.incidentType || !form.locationDescription || !form.description || updateMut.isPending}
            >
              {updateMut.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      {renderViewDialog()}

      {/* Raise Task dialog */}
      <RaiseTaskDialog
        farmId={farmId!}
        open={!!raiseTaskFor}
        onClose={() => setRaiseTaskFor(null)}
        defaultTitle={raiseTaskFor ? `Incident Follow-up — ${raiseTaskFor.incidentType} (${fmt(raiseTaskFor.dateDiscovered)})` : ""}
        defaultDescription={raiseTaskFor ? `Incident #${raiseTaskFor.id}: ${raiseTaskFor.incidentType} discovered ${fmt(raiseTaskFor.dateDiscovered)} at ${raiseTaskFor.locationDescription}. Status: ${STATUSES.find(s => s.value === raiseTaskFor.status)?.label ?? raiseTaskFor.status}.` : ""}
        allowEditTitle
        taskType="incident"
        taskSourceId={raiseTaskFor ? String(raiseTaskFor.id) : undefined}
        module="incidents"
      />

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader>
            <DialogTitle>Delete Incident?</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>This will permanently remove the incident record. This action cannot be undone.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
