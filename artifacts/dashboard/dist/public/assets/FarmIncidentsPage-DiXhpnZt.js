import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, O as React, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter, L as Label, I as Input, p as Link } from "./index-CnPMRsi2.js";
import { A as AppLayout, E as Flame, c as ClipboardList } from "./AppLayout-DO1Qj-LS.js";
import { T as Textarea } from "./textarea-Uek8Hn90.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-GWAiOeyf.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-DwwJ5RmY.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { P as PhotoPanel } from "./PhotoPanel-Cjt5Sl3k.js";
import { C as Camera } from "./camera-HrFLRQ03.js";
import { D as Download } from "./download-Cc1pzWHK.js";
import { T as TriangleAlert } from "./triangle-alert-BdSfMpvF.js";
import { E as Eye } from "./eye-Ck1VPN67.js";
import { P as Pencil } from "./pencil-Bv8a1VVz.js";
import { P as Printer } from "./printer-B9vyeLHw.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-0Uo4hwB8.js";
import { C as ChevronUp } from "./chevron-up-BVbjvmU1.js";
import { S as ShieldCheck } from "./shield-check-BG0AfMsd.js";
import "./use-safe-clerk-_i6GmcQS.js";
import "./database-CExeTER3.js";
import "./shield-alert-xBDV0U9g.js";
import "./tractor-Dy2DsQHg.js";
import "./index-B3dt8mGQ.js";
import "./index-5vETOCi8.js";
import "./file-BJm1xDK2.js";
const TASK_STATUS_STYLES = {
  pending: { label: "Pending", bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  in_progress: { label: "In Progress", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  cancelled: { label: "Cancelled", bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" }
};
function taskStatusBadge(status) {
  const s = TASK_STATUS_STYLES[status] ?? TASK_STATUS_STYLES.pending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
    display: "inline-block",
    padding: "1px 8px",
    borderRadius: 9999,
    fontSize: "0.68rem",
    fontWeight: 700,
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
    flexShrink: 0
  }, children: s.label });
}
function IncidentTaskList({ tasks }) {
  if (tasks.length === 0) return null;
  const open = tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 14px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 600, fontSize: "0.8rem", color: "#92400e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 14, height: 14 } }),
      "Raised Tasks (",
      tasks.length,
      ")",
      open > 0 ? ` — ${open} open` : ""
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 6 }, children: tasks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        href: `/task-board?id=${t.id}`,
        onClick: (e) => e.stopPropagation(),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          background: "#fff",
          border: "1px solid #f3e8c0",
          borderRadius: 6,
          padding: "6px 10px"
        },
        title: "Open this task on the Task Board",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            flex: 1,
            minWidth: 0,
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#1f2937",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textDecoration: t.status === "completed" ? "line-through" : "none"
          }, children: t.title }),
          t.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280", flexShrink: 0 }, children: [
            "Due ",
            fmt(t.dueDate)
          ] }),
          taskStatusBadge(t.status)
        ]
      },
      t.id
    )) })
  ] });
}
const isImagePhoto = (p) => /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(p.fileName ?? p.objectPath);
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
  "Other"
];
const STATUSES = [
  { value: "reported", label: "Reported", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "under_investigation", label: "Under Investigation", bg: "#fef9c3", color: "#a16207", border: "#fde047" },
  { value: "claim_raised", label: "Claim Raised", bg: "#fdf4ff", color: "#9333ea", border: "#e9d5ff" },
  { value: "settled", label: "Settled", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  { value: "closed", label: "Closed", bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" }
];
const CRIME_TYPES = /* @__PURE__ */ new Set(["Theft", "Criminal Damage"]);
const HIGH_RISK_TYPES = ["Fire", "Wildfire", "Flood"];
const EVIDENCE_REQUIRED_TYPES = ["Fire", "Theft", "Criminal Damage"];
const fmt = (d) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = parseInt(parts[1]) - 1;
    return `${parseInt(parts[2])} ${months[m]} ${parts[0]}`;
  }
  return d;
};
const fmtGBP = (v) => {
  if (!v) return "—";
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
function statusBadge(status) {
  const s = STATUSES.find((x) => x.value === status) ?? STATUSES[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 9999,
    fontSize: "0.72rem",
    fontWeight: 700,
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
    letterSpacing: "0.03em"
  }, children: s.label });
}
function incidentTypeBadge(type) {
  const isHighRisk = HIGH_RISK_TYPES.includes(type);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 9999,
    fontSize: "0.72rem",
    fontWeight: 700,
    background: isHighRisk ? "#fff1f2" : "#f3f4f6",
    color: isHighRisk ? "#be123c" : "#374151",
    border: `1px solid ${isHighRisk ? "#fecdd3" : "#e5e7eb"}`
  }, children: type });
}
function viewField(label, value) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value === true ? "Yes" : value === false ? "No" : value || "—" })
  ] });
}
function emptyForm() {
  return {
    dateDiscovered: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
    notes: null
  };
}
function FarmIncidentsPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [evidenceFilter, setEvidenceFilter] = reactExports.useState("all");
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [viewId, setViewId] = reactExports.useState(null);
  const [editId, setEditId] = reactExports.useState(null);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm());
  const { data: incData } = useQuery({
    queryKey: ["farm-incidents", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/incidents`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const incidents = incData?.records ?? [];
  const { data: fieldsData } = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const fields = fieldsData?.fields ?? [];
  const { data: policiesData } = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allPolicies = policiesData?.records ?? [];
  const validPolicies = allPolicies.filter((p) => !p.supersededByRenewal);
  const { data: tasksData } = useQuery({
    queryKey: ["task-assignments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/task-assignments`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const incidentTasks = React.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const t of tasksData?.records ?? []) {
      if (t.taskType !== "incident" || !t.taskSourceId || isNaN(Number(t.taskSourceId))) continue;
      const id = Number(t.taskSourceId);
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(t);
    }
    return map;
  }, [tasksData]);
  const mutOpts = {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-incidents", farmId] });
    }
  };
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/incidents`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    ...mutOpts,
    onSuccess: () => {
      mutOpts.onSuccess();
      setAddOpen(false);
      setForm(emptyForm());
      toast({ title: "Incident recorded" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/incidents/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    ...mutOpts,
    onSuccess: () => {
      mutOpts.onSuccess();
      setEditId(null);
      toast({ title: "Incident updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/incidents/${id}`, {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    ...mutOpts,
    onSuccess: () => {
      mutOpts.onSuccess();
      setDeleteId(null);
      toast({ title: "Incident deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v ?? null }));
  const formToBody = (f) => ({
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
    notes: f.notes || null
  });
  const openEdit = (inc) => {
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
      notes: inc.notes
    });
    setEditId(inc.id);
  };
  const statusFiltered = statusFilter === "all" ? incidents : incidents.filter((i) => i.status === statusFilter);
  const filtered = evidenceFilter === "all" ? statusFiltered : statusFiltered.filter((i) => (i.photos ?? []).length === 0 && (evidenceFilter === "missing" || HIGH_RISK_TYPES.includes(i.incidentType)));
  const missingCount = incidents.filter((i) => (i.photos ?? []).length === 0).length;
  const missingHighRiskCount = incidents.filter((i) => (i.photos ?? []).length === 0 && HIGH_RISK_TYPES.includes(i.incidentType)).length;
  const handleCsvExport = () => {
    const header = [
      "Date Discovered",
      "Date Occurred",
      "Incident Type",
      "Location",
      "Description",
      "Estimated Loss (£)",
      "Area/Quantity Affected",
      "Police Attended",
      "Police Ref",
      "Fire Service Attended",
      "Fire Ref",
      "EA Attended",
      "EA Ref",
      "Crime Reference",
      "Status",
      "Insurance Policy ID",
      "Claim Ref",
      "Claim Date",
      "Settlement Amount",
      "Settlement Date",
      "Insurer Contact",
      "Notes",
      "Photo Evidence"
    ];
    const rows = filtered.map((i) => [
      i.dateDiscovered,
      i.dateOccurred ?? "",
      i.incidentType,
      i.locationDescription,
      i.description,
      i.estimatedLossValue ?? "",
      i.areaQuantityAffected ?? "",
      i.policeAttended ? "Yes" : "No",
      i.policeRefNumber ?? "",
      i.fireAttended ? "Yes" : "No",
      i.fireRefNumber ?? "",
      i.eaAttended ? "Yes" : "No",
      i.eaRefNumber ?? "",
      i.crimeReference ?? "",
      STATUSES.find((s) => s.value === i.status)?.label ?? i.status,
      i.insurancePolicyId?.toString() ?? "",
      i.insuranceClaimRef ?? "",
      i.insuranceClaimDate ?? "",
      i.settlementAmount ?? "",
      i.settlementDate ?? "",
      i.insurerContact ?? "",
      i.notes ?? "",
      (i.photos ?? []).map((p) => p.fileName ?? p.objectPath.split("/").pop() ?? "Photo").join("; ")
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`));
    const csv = [header.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const filterParts = [];
    if (statusFilter !== "all") {
      filterParts.push(slugify(STATUSES.find((s) => s.value === statusFilter)?.label ?? statusFilter));
    }
    if (evidenceFilter === "missing") filterParts.push("missing-evidence");
    else if (evidenceFilter === "missing_high_risk") filterParts.push("high-risk-no-photos");
    const filterSuffix = filterParts.length ? `-${filterParts.join("-")}` : "";
    a.href = url;
    a.download = `farm-incidents${filterSuffix}-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrintIncident = (inc) => {
    const policyLabel = inc.insurancePolicyId ? allPolicies.find((p) => p.id === inc.insurancePolicyId) ? `${allPolicies.find((p) => p.id === inc.insurancePolicyId).policyType} — ${allPolicies.find((p) => p.id === inc.insurancePolicyId).insurer ?? ""} (${allPolicies.find((p) => p.id === inc.insurancePolicyId).policyNumber ?? ""})` : `Policy #${inc.insurancePolicyId}` : "None";
    const fieldLabel = inc.fieldId ? fields.find((f) => f.id === inc.fieldId)?.name ?? `Field #${inc.fieldId}` : null;
    const statusLabel = STATUSES.find((s) => s.value === inc.status)?.label ?? inc.status;
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
      ...CRIME_TYPES.has(inc.incidentType) ? [["Crime Reference", inc.crimeReference ?? "—"]] : [],
      ["Insurance Policy", policyLabel],
      ["Claim Reference", inc.insuranceClaimRef ?? "—"],
      ["Claim Date", fmt(inc.insuranceClaimDate)],
      ["Settlement Amount", fmtGBP(inc.settlementAmount)],
      ["Settlement Date", fmt(inc.settlementDate)],
      ["Insurer Contact", inc.insurerContact ?? "—"],
      ["Notes", inc.notes ?? "—"]
    ];
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    const photos = inc.photos ?? [];
    const imagePhotos = photos.filter(isImagePhoto);
    const otherPhotos = photos.filter((p) => !isImagePhoto(p));
    const photosHtml = photos.length ? `
      <div class="section-head">Evidence Photos (${photos.length})</div>
      ${imagePhotos.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px">${imagePhotos.map((p) => `<div style="page-break-inside:avoid"><img src="/api/storage${esc(p.objectPath)}" style="max-width:220px;max-height:160px;border:1px solid #d1d5db;border-radius:4px;display:block" /><div style="font-size:6.5px;color:#555;margin-top:2px">${esc(p.fileName ?? "Photo")}</div></div>`).join("")}</div>` : ""}
      ${otherPhotos.length ? `<div style="font-size:7.5px;color:#374151">Attached files: ${otherPhotos.map((p) => esc(p.fileName ?? "File")).join(", ")}</div>` : ""}
    ` : "";
    const tableHtml = `<table><thead><tr><th>Field</th><th>Detail</th></tr></thead><tbody>${rows.map(([label, value]) => `<tr><td style="font-weight:600;white-space:nowrap;width:200px">${esc(label)}</td><td>${esc(value)}</td></tr>`).join("")}</tbody></table>${photosHtml}`;
    printProReport({
      title: `Farm Incident Report — ${inc.incidentType}`,
      subtitle: `Reported: ${fmt(inc.dateDiscovered)}`,
      tableHtml
    });
  };
  const renderForm = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 18 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Discovered *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateDiscovered, onChange: (e) => setF("dateDiscovered", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Occurred" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateOccurred ?? "", onChange: (e) => setF("dateOccurred", e.target.value || null) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incident Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.incidentType, onValueChange: (v) => setF("incidentType", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INCIDENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setF("status", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId?.toString() ?? "", onValueChange: (v) => setF("fieldId", v ? Number(v) : null), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
          fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: f.id.toString(), children: [
            f.name,
            f.fieldReference ? ` (${f.fieldReference})` : ""
          ] }, f.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location Description *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.locationDescription, onChange: (e) => setF("locationDescription", e.target.value), placeholder: "e.g. North barn, Top field gate…" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.description, onChange: (e) => setF("description", e.target.value), placeholder: "What happened?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated Loss Value (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.01", value: form.estimatedLossValue ?? "", onChange: (e) => setF("estimatedLossValue", e.target.value || null), placeholder: "0.00" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area / Quantity Affected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.areaQuantityAffected ?? "", onChange: (e) => setF("areaQuantityAffected", e.target.value || null), placeholder: "e.g. 12 ha, 50 bales…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "14px 16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.82rem", color: "#374151", marginBottom: 12 }, children: "Emergency Services" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.policeAttended, onChange: (e) => setF("policeAttended", e.target.checked) }),
            "Police attended"
          ] }),
          form.policeAttended && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { size: 1, value: form.policeRefNumber ?? "", onChange: (e) => setF("policeRefNumber", e.target.value || null), placeholder: "Police reference number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.fireAttended, onChange: (e) => setF("fireAttended", e.target.checked) }),
            "Fire service attended"
          ] }),
          form.fireAttended && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { size: 1, value: form.fireRefNumber ?? "", onChange: (e) => setF("fireRefNumber", e.target.value || null), placeholder: "Fire service reference" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.eaAttended, onChange: (e) => setF("eaAttended", e.target.checked) }),
            "EA attended"
          ] }),
          form.eaAttended && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { size: 1, value: form.eaRefNumber ?? "", onChange: (e) => setF("eaRefNumber", e.target.value || null), placeholder: "Environment Agency reference" })
        ] })
      ] })
    ] }),
    CRIME_TYPES.has(form.incidentType) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crime Reference Number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.crimeReference ?? "", onChange: (e) => setF("crimeReference", e.target.value || null), placeholder: "e.g. 01/12345/24" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", borderRadius: 8, padding: "14px 16px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontWeight: 600, fontSize: "0.82rem", color: "#374151", marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { style: { display: "inline", width: 14, height: 14, marginRight: 6, verticalAlign: "middle" } }),
        "Insurance Claim (optional)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Insurance Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.insurancePolicyId?.toString() ?? "", onValueChange: (v) => setF("insurancePolicyId", v ? Number(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select policy…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
              validPolicies.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id.toString(), children: [
                p.policyType,
                p.insurer ? ` — ${p.insurer}` : "",
                p.policyNumber ? ` (${p.policyNumber})` : ""
              ] }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Claim Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.insuranceClaimRef ?? "", onChange: (e) => setF("insuranceClaimRef", e.target.value || null), placeholder: "e.g. CLM-2024-001" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Claim Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.insuranceClaimDate ?? "", onChange: (e) => setF("insuranceClaimDate", e.target.value || null) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Amount (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.01", value: form.settlementAmount ?? "", onChange: (e) => setF("settlementAmount", e.target.value || null), placeholder: "0.00" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Settlement Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.settlementDate ?? "", onChange: (e) => setF("settlementDate", e.target.value || null) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurer Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.insurerContact ?? "", onChange: (e) => setF("insurerContact", e.target.value || null), placeholder: "Name, phone or email…" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes ?? "", onChange: (e) => setF("notes", e.target.value || null), placeholder: "Any additional notes…" })
    ] })
  ] });
  const viewInc = viewId !== null ? incidents.find((i) => i.id === viewId) ?? null : null;
  const renderViewDialog = () => {
    if (!viewInc) return null;
    const fieldLabel = viewInc.fieldId ? fields.find((f) => f.id === viewInc.fieldId)?.name ?? `Field #${viewInc.fieldId}` : null;
    const policy = viewInc.insurancePolicyId ? allPolicies.find((p) => p.id === viewInc.insurancePolicyId) : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewId, onOpenChange: () => setViewId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { style: { width: 20, height: 20, color: "#dc2626" } }),
        viewInc.incidentType,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8 }, children: statusBadge(viewInc.status) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }, children: [
          viewField("Date Discovered", fmt(viewInc.dateDiscovered)),
          viewField("Date Occurred", fmt(viewInc.dateOccurred)),
          viewField("Status", STATUSES.find((s) => s.value === viewInc.status)?.label ?? viewInc.status)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          viewField("Field", fieldLabel ?? "—"),
          viewField("Location", viewInc.locationDescription)
        ] }),
        viewField("Description", viewInc.description),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          viewField("Estimated Loss", fmtGBP(viewInc.estimatedLossValue)),
          viewField("Area / Quantity Affected", viewInc.areaQuantityAffected)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }, children: "Emergency Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              viewField("Police", viewInc.policeAttended),
              viewInc.policeAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#374151", marginTop: 2 }, children: viewInc.policeRefNumber ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              viewField("Fire Service", viewInc.fireAttended),
              viewInc.fireAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#374151", marginTop: 2 }, children: viewInc.fireRefNumber ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              viewField("EA", viewInc.eaAttended),
              viewInc.eaAttended && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#374151", marginTop: 2 }, children: viewInc.eaRefNumber ?? "—" })
            ] })
          ] })
        ] }),
        CRIME_TYPES.has(viewInc.incidentType) && viewField("Crime Reference", viewInc.crimeReference),
        (viewInc.insurancePolicyId || viewInc.insuranceClaimRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", borderRadius: 8, padding: "12px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, fontSize: "0.8rem", color: "#6b7280", marginBottom: 8 }, children: "Insurance Claim" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
            viewField("Policy", policy ? `${policy.policyType} — ${policy.insurer ?? ""} (${policy.policyNumber ?? ""})` : "—"),
            viewField("Claim Ref", viewInc.insuranceClaimRef),
            viewField("Claim Date", fmt(viewInc.insuranceClaimDate)),
            viewField("Settlement Amount", fmtGBP(viewInc.settlementAmount)),
            viewField("Settlement Date", fmt(viewInc.settlementDate)),
            viewField("Insurer Contact", viewInc.insurerContact)
          ] })
        ] }),
        viewInc.notes && viewField("Notes", viewInc.notes),
        /* @__PURE__ */ jsxRuntimeExports.jsx(IncidentTaskList, { tasks: incidentTasks.get(viewInc.id) ?? [] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderRadius: 8, overflow: "hidden", border: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          PhotoPanel,
          {
            incidentId: viewInc.id,
            farmId,
            photos: viewInc.photos ?? [],
            resource: "incidents",
            queryKey: ["farm-incidents", farmId]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => handlePrintIncident(viewInc), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { style: { width: 14, height: 14, marginRight: 6 } }),
          " Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          setViewId(null);
          setRaiseTaskFor(viewInc);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 14, height: 14, marginRight: 6 } }),
          " Raise Task"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setViewId(null);
          openEdit(viewInc);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 14, height: 14, marginRight: 6 } }),
          " Edit"
        ] })
      ] })
    ] }) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Farm Incidents", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        [{ value: "all", label: "All" }, ...STATUSES].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusFilter(s.value),
            style: {
              padding: "4px 14px",
              borderRadius: 9999,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              background: statusFilter === s.value ? "#111827" : "#f3f4f6",
              color: statusFilter === s.value ? "#fff" : "#374151",
              border: "1px solid transparent"
            },
            children: "label" in s ? s.label : "All"
          },
          s.value
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 1, alignSelf: "stretch", background: "#e5e7eb", margin: "0 4px" } }),
        [
          { value: "missing", label: `Missing evidence${missingCount ? ` (${missingCount})` : ""}` },
          { value: "missing_high_risk", label: `High-risk, no photos${missingHighRiskCount ? ` (${missingHighRiskCount})` : ""}` }
        ].map((o) => {
          const active = evidenceFilter === o.value;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setEvidenceFilter(active ? "all" : o.value),
              title: o.value === "missing" ? "Show only incidents with zero evidence photos" : "Show only high-risk (Fire, Wildfire, Flood) incidents with zero evidence photos",
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 14px",
                borderRadius: 9999,
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                background: active ? "#b45309" : "#fffbeb",
                color: active ? "#fff" : "#b45309",
                border: `1px ${active ? "solid" : "dashed"} ${active ? "#b45309" : "#fcd34d"}`
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 13, height: 13 } }),
                o.label
              ]
            },
            o.value
          );
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleCsvExport, disabled: filtered.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { style: { width: 14, height: 14, marginRight: 6 } }),
          " Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(emptyForm());
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: { width: 14, height: 14, marginRight: 6 } }),
          " Log Incident"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }, children: STATUSES.map((s) => {
      const count = incidents.filter((i) => i.status === s.value).length;
      if (!count) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        padding: "6px 14px",
        borderRadius: 8,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: "0.8rem",
        fontWeight: 600
      }, children: [
        count,
        " ",
        s.label
      ] }, s.value);
    }) }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "60px 20px", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { style: { width: 36, height: 36, margin: "0 auto 12px", opacity: 0.3 } }),
      evidenceFilter !== "all" && incidents.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "No incidents missing photo evidence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem" }, children: "Every matching incident has at least one photo attached." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 600, marginBottom: 4 }, children: "No incidents recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem" }, children: 'Use "Log Incident" to record a fire, theft, or other event.' })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 10 }, children: filtered.map((inc) => {
      const expanded = expandedId === inc.id;
      const fieldLabel = inc.fieldId ? fields.find((f) => f.id === inc.fieldId)?.name ?? "" : null;
      const isHighRisk = HIGH_RISK_TYPES.includes(inc.incidentType);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        border: "1px solid",
        borderColor: isHighRisk ? "#fecdd3" : "#e5e7eb",
        borderRadius: 10,
        background: "#fff",
        overflow: "hidden",
        boxShadow: isHighRisk ? "0 0 0 2px #fff1f2" : void 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: { display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, cursor: "pointer" },
            onClick: () => setExpandedId(expanded ? null : inc.id),
            children: [
              isHighRisk && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: 16, height: 16, color: "#dc2626", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
                  incidentTypeBadge(inc.incidentType),
                  statusBadge(inc.status),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: fmt(inc.dateDiscovered) }),
                  fieldLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                    "· ",
                    fieldLabel
                  ] }),
                  (inc.photos ?? []).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: `${inc.photos.length} evidence photo${inc.photos.length === 1 ? "" : "s"} attached`, style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe"
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 12, height: 12 } }),
                    inc.photos.length
                  ] }) : EVIDENCE_REQUIRED_TYPES.includes(inc.incidentType) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: "No photo evidence attached — insurers usually require photos for this incident type", style: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 9999,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: "#fffbeb",
                    color: "#b45309",
                    border: "1px dashed #fcd34d"
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 12, height: 12 } }),
                    "no photos"
                  ] }) : null,
                  (incidentTasks.get(inc.id) ?? []).length > 0 && (() => {
                    const ts = incidentTasks.get(inc.id);
                    const open = ts.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { title: `${ts.length} task${ts.length === 1 ? "" : "s"} raised — ${open} open`, style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background: open > 0 ? "#fffbeb" : "#f0fdf4",
                      color: open > 0 ? "#b45309" : "#16a34a",
                      border: `1px solid ${open > 0 ? "#fcd34d" : "#bbf7d0"}`
                    }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 12, height: 12 } }),
                      open > 0 ? `${open} open` : "tasks done"
                    ] });
                  })()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: "#374151", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: inc.locationDescription })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                inc.estimatedLossValue && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", fontWeight: 700, color: "#dc2626" }, children: fmtGBP(inc.estimatedLossValue) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  setViewId(inc.id);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  openEdit(inc);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  handlePrintIncident(inc);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { style: { width: 14, height: 14 } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", title: "Raise Task", onClick: (e) => {
                  e.stopPropagation();
                  setRaiseTaskFor(inc);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { style: { width: 14, height: 14, color: "#f59e0b" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  setDeleteId(inc.id);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 14, height: 14, color: "#dc2626" } }) }),
                expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { style: { width: 16, height: 16, color: "#9ca3af" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { style: { width: 16, height: 16, color: "#9ca3af" } })
              ] })
            ]
          }
        ),
        expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", padding: "14px 16px", background: "#fafafa" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }, children: [
            viewField("Date Occurred", fmt(inc.dateOccurred)),
            viewField("Estimated Loss", fmtGBP(inc.estimatedLossValue)),
            viewField("Area / Qty Affected", inc.areaQuantityAffected),
            inc.policeAttended && viewField("Police Ref", inc.policeRefNumber),
            inc.fireAttended && viewField("Fire Service Ref", inc.fireRefNumber),
            inc.eaAttended && viewField("EA Ref", inc.eaRefNumber),
            CRIME_TYPES.has(inc.incidentType) && viewField("Crime Reference", inc.crimeReference),
            inc.insuranceClaimRef && viewField("Claim Ref", inc.insuranceClaimRef),
            inc.settlementAmount && viewField("Settlement", fmtGBP(inc.settlementAmount))
          ] }),
          inc.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10, fontSize: "0.875rem", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }, children: "DESCRIPTION: " }),
            inc.description
          ] }),
          inc.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, fontSize: "0.875rem", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }, children: "NOTES: " }),
            inc.notes
          ] }),
          (incidentTasks.get(inc.id) ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IncidentTaskList, { tasks: incidentTasks.get(inc.id) }) }),
          (inc.photos ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, color: "#6b7280", fontSize: "0.75rem" }, children: [
              "EVIDENCE PHOTOS (",
              inc.photos.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }, children: inc.photos.map((p) => isImagePhoto(p) ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: `/api/storage${p.objectPath}`,
                alt: p.fileName ?? "Evidence photo",
                style: { width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb", display: "block" }
              }
            ) }, p.id) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: `/api/storage${p.objectPath}`,
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: (e) => e.stopPropagation(),
                style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px" },
                children: p.fileName ?? "File"
              },
              p.id
            )) })
          ] })
        ] })
      ] }, inc.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) createMut.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log New Incident" }) }),
      renderForm(),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => createMut.mutate(formToBody(form)),
            disabled: !form.dateDiscovered || !form.incidentType || !form.locationDescription || !form.description || createMut.isPending,
            children: createMut.isPending ? "Saving…" : "Save Incident"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editId !== null, onOpenChange: (o) => {
      if (!o) {
        setEditId(null);
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Incident" }) }),
      renderForm(),
      editId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderRadius: 8, overflow: "hidden", border: "1px solid #f3f4f6", marginTop: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PhotoPanel,
        {
          incidentId: editId,
          farmId,
          photos: incidents.find((i) => i.id === editId)?.photos ?? [],
          resource: "incidents",
          queryKey: ["farm-incidents", farmId]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => editId !== null && updateMut.mutate({ id: editId, body: formToBody(form) }),
            disabled: !form.dateDiscovered || !form.incidentType || !form.locationDescription || !form.description || updateMut.isPending,
            children: updateMut.isPending ? "Saving…" : "Save Changes"
          }
        )
      ] })
    ] }) }),
    renderViewDialog(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Incident Follow-up — ${raiseTaskFor.incidentType} (${fmt(raiseTaskFor.dateDiscovered)})` : "",
        defaultDescription: raiseTaskFor ? `Incident #${raiseTaskFor.id}: ${raiseTaskFor.incidentType} discovered ${fmt(raiseTaskFor.dateDiscovered)} at ${raiseTaskFor.locationDescription}. Status: ${STATUSES.find((s) => s.value === raiseTaskFor.status)?.label ?? raiseTaskFor.status}.` : "",
        allowEditTitle: true,
        taskType: "incident",
        taskSourceId: raiseTaskFor ? String(raiseTaskFor.id) : void 0,
        module: "incidents"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Incident?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will permanently remove the incident record. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: deleteMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  FarmIncidentsPage as default
};
