import { s as createLucideIcon, b as useAppStore, c as useQueryClient, a as useToast, m as useQuery, r as reactExports, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, N as DialogMutationError, L as Label } from "./index-CDukCNha.js";
import { a as usePersistedFilter } from "./use-persisted-filter-BlZwb5ik.js";
import { p as printProReport } from "./print-report-ClU8-1P0.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-CcF0mXKK.js";
import { T as Textarea } from "./textarea-DIvtomjZ.js";
import { u as useUpload } from "./use-upload-BPoi9DLT.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-C2WN5o9s.js";
import { P as Printer } from "./printer-C46G2sGo.js";
import { P as Phone } from "./phone-D1s8nMh9.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cmi2RjiA.js";
import { C as ChevronUp } from "./chevron-up-DbU10X3h.js";
import { E as ExternalLink } from "./external-link-Dfwa3vp3.js";
import { F as File } from "./file-TUNeUC3n.js";
import { C as Camera } from "./camera-M0uRaxpm.js";
import "./use-safe-clerk-DFK3tOiq.js";
import "./database-CCTTbwNA.js";
import "./shield-alert-BdARTvO8.js";
import "./triangle-alert-CbSmXkg4.js";
import "./shield-check-SpObG-tw.js";
import "./tractor-DBLqaPPG.js";
import "./select-Dkg4sueF.js";
import "./index-BVVHEFnd.js";
import "./index-BHuKXUMm.js";
const __iconNode = [
  ["path", { d: "M3.5 21 14 3", key: "1szst5" }],
  ["path", { d: "M20.5 21 10 3", key: "1310c3" }],
  ["path", { d: "M15.5 21 12 15l-3.5 6", key: "1ddtfw" }],
  ["path", { d: "M2 21h20", key: "1nyx9w" }]
];
const Tent = createLucideIcon("tent", __iconNode);
const STATUSES = [
  { value: "active", label: "Active", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  { value: "legal_action", label: "Legal Action", bg: "#fefce8", color: "#92400e", border: "#fde68a" },
  { value: "resolved", label: "Resolved", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" }
];
const POLICE_ACTIONS = [
  "Section 61 direction served (CJPOA 1994 / PCSC Act 2022)",
  "Section 62A direction served — alternative site",
  "Declined to act — civil matter",
  "Officers attended — verbal warning only",
  "Criminal investigation opened",
  "Arrests made",
  "Other — see notes"
];
const LEGAL_NOTICE_TYPES = [
  "Section 61 CJPOA direction",
  "Notice to Quit served",
  "Injunction obtained (High Court)",
  "Possession order (Part 55 CPR)",
  "Trespass notice served",
  "Emergency injunction ex parte"
];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const LAND_CONDITIONS = [
  "No damage observed — land in good order",
  "Minor soiling or waste — removed by farm staff",
  "Damage to fencing or gates",
  "Crop damage or soil compaction",
  "Significant land damage — remediation underway",
  "Fully remediated"
];
function claimStatusLabel(status) {
  const labels = { draft: "Draft", reported: "Reported", acknowledged: "Acknowledged", under_investigation: "Under Investigation", settled: "Settled", rejected: "Rejected", withdrawn: "Withdrawn" };
  return labels[status] ?? status;
}
function PhotoPanel({ incidentId, farmId, photos }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const deleteMut = useMutation({
    mutationFn: (photoId) => fetch(`/api/farms/${farmId}/encampments/${incidentId}/photos/${photoId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["encampments", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/encampments/${incidentId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      qc.invalidateQueries({ queryKey: ["encampments", farmId] });
      toast({ title: "Photo uploaded" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 14px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }, children: "Evidence Photos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }, children: photos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(File, { size: 12, style: { color: "#2563eb" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/api/storage${p.objectPath}`, target: "_blank", rel: "noopener noreferrer", style: { fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }, children: p.fileName ?? "photo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteMut.mutate(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
    ] }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }, children: [
      isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 13 }),
      isUploading ? `Uploading… ${progress}%` : "Add Photo",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: "image/*,application/pdf",
          style: { display: "none" },
          onChange: (e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }
        }
      )
    ] })
  ] });
}
const EMPTY = {
  discoveredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  locationDescription: "",
  fieldId: null,
  fieldParcel: "",
  latitude: "",
  longitude: "",
  entryPoint: "",
  vehicleCount: null,
  personCount: null,
  caravanCount: null,
  vehicleDescriptions: "",
  landDamageDescription: "",
  cropsAffected: false,
  estimatedDamage: "",
  policeNotified: false,
  policeRefNumber: "",
  policeAction: "",
  councilNotified: false,
  councilRefNumber: "",
  legalActionTaken: false,
  legalActionDetails: "",
  solicitorInstructed: false,
  courtOrderObtained: false,
  courtOrderRef: "",
  vacatedAt: "",
  landConditionAfter: "",
  insuranceClaimMade: false,
  insurancePolicyId: null,
  insuranceClaimRef: "",
  remediationRequired: false,
  remediationNotes: "",
  remediationCost: "",
  status: "active",
  notes: ""
};
function EncampmentPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: farmData } = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmData?.record;
  const q = useQuery({
    queryKey: ["encampments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/encampments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const incidents = q.data?.records ?? [];
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fields = fieldsQ.data?.records ?? [];
  const insuranceQ = useQuery({
    queryKey: ["insurance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance`).then((r) => r.json()),
    enabled: !!farmId
  });
  const policies = insuranceQ.data?.records ?? [];
  const claimsQ = useQuery({
    queryKey: ["insurance-claims", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/insurance-claims`).then((r) => r.json()),
    enabled: !!farmId
  });
  const allClaims = claimsQ.data?.claims ?? [];
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "encampment", filter: "status", farmId, defaultValue: "all" });
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ ...EMPTY });
  const [claimDropdownVal, setClaimDropdownVal] = reactExports.useState("");
  function openAdd() {
    setForm({ ...EMPTY, discoveredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setAddOpen(true);
  }
  function openEdit(r) {
    setForm({
      discoveredAt: r.discoveredAt,
      locationDescription: r.locationDescription,
      fieldId: r.fieldId ?? null,
      fieldParcel: r.fieldParcel ?? "",
      latitude: r.latitude ?? "",
      longitude: r.longitude ?? "",
      entryPoint: r.entryPoint ?? "",
      vehicleCount: r.vehicleCount,
      personCount: r.personCount,
      caravanCount: r.caravanCount,
      vehicleDescriptions: r.vehicleDescriptions ?? "",
      landDamageDescription: r.landDamageDescription ?? "",
      cropsAffected: r.cropsAffected,
      estimatedDamage: r.estimatedDamage ?? "",
      policeNotified: r.policeNotified,
      policeRefNumber: r.policeRefNumber ?? "",
      policeAction: r.policeAction ?? "",
      councilNotified: r.councilNotified,
      councilRefNumber: r.councilRefNumber ?? "",
      legalActionTaken: r.legalActionTaken,
      legalActionDetails: r.legalActionDetails ?? "",
      solicitorInstructed: r.solicitorInstructed,
      courtOrderObtained: r.courtOrderObtained,
      courtOrderRef: r.courtOrderRef ?? "",
      vacatedAt: r.vacatedAt ?? "",
      landConditionAfter: r.landConditionAfter ?? "",
      insuranceClaimMade: r.insuranceClaimMade,
      insurancePolicyId: r.insurancePolicyId ?? null,
      insuranceClaimRef: r.insuranceClaimRef ?? "",
      remediationRequired: r.remediationRequired,
      remediationNotes: r.remediationNotes ?? "",
      remediationCost: r.remediationCost ?? "",
      status: r.status,
      notes: r.notes ?? ""
    });
    const matchedClaim = allClaims.find((c) => c.claimRef === r.insuranceClaimRef && !["settled", "rejected", "withdrawn"].includes(c.status));
    setClaimDropdownVal(matchedClaim ? String(matchedClaim.id) : r.insuranceClaimRef ? "manual" : "");
    setEditItem(r);
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/encampments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["encampments", farmId] });
      setAddOpen(false);
      toast({ title: "Encampment logged" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/encampments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["encampments", farmId] });
      setEditItem(null);
      toast({ title: "Record updated" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/encampments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["encampments", farmId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSave() {
    const body = { ...form };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }
  const filtered = statusFilter === "all" ? incidents : incidents.filter((i) => i.status === statusFilter);
  const activeCount = incidents.filter((i) => i.status !== "resolved").length;
  function statusStyle(status) {
    const s = STATUSES.find((x) => x.value === status);
    return s ? { background: s.bg, color: s.color, border: `1px solid ${s.border}` } : {};
  }
  function statusLabel(status) {
    return STATUSES.find((x) => x.value === status)?.label ?? status;
  }
  function handlePrint() {
    const printList = statusFilter === "all" ? incidents : filtered;
    const rows = printList.map((r) => `<tr>
      <td style="white-space:nowrap">${fmt(r.discoveredAt)}</td>
      <td>${r.locationDescription}${r.fieldParcel ? ` — ${r.fieldParcel}` : ""}</td>
      <td>${r.vehicleCount ?? "—"} vehicles / ${r.personCount ?? "—"} persons / ${r.caravanCount ?? "—"} caravans</td>
      <td>${r.policeNotified ? `Yes — ${r.policeRefNumber || "ref TBC"}` : "No"}</td>
      <td>${r.legalActionTaken ? r.legalActionDetails || "Yes" : "No"}</td>
      <td style="white-space:nowrap">${r.vacatedAt ? fmt(r.vacatedAt) : "—"}</td>
      <td>${statusLabel(r.status)}</td>
    </tr>`).join("");
    const tableHtml = `<table><thead><tr>
      <th>Discovered</th><th>Location / Field</th><th>Persons &amp; Vehicles</th>
      <th>Police Ref</th><th>Legal Action</th><th>Vacated</th><th>Status</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Unauthorized Encampments Register",
      subtitle: "Criminal Justice and Public Order Act 1994",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      recordCount: printList.length,
      recordLabel: "incident",
      extraMeta: `Active / In Legal Process: ${printList.filter((r) => r.status !== "resolved").length}  ·  Resolved: ${printList.filter((r) => r.status === "resolved").length}`,
      tableHtml,
      footerNote: "Retain all documentation relating to legal action and police involvement. Keep records securely as evidence for any future proceedings."
    });
  }
  const isDialogOpen = addOpen || !!editItem;
  const isSaving = createMut.isPending || updateMut.isPending;
  const ff = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const validPolicies = policies.filter((p) => !p.supersededByRenewal && (!p.expiryDate || p.expiryDate >= today));
  const selectedPolicy = policies.find((p) => p.id === form.insurancePolicyId) ?? null;
  const openClaims = allClaims.filter(
    (c) => !["settled", "rejected", "withdrawn"].includes(c.status) && (!selectedPolicy?.insurer || !c.insurer || c.insurer.toLowerCase().includes(selectedPolicy.insurer.toLowerCase()) || selectedPolicy.insurer.toLowerCase().includes(c.insurer.toLowerCase()))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Unauthorized Encampments", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 900, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tent, { size: 22, style: { color: "#b91c1c" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#6b7280", margin: 0 }, children: activeCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, color: "#b91c1c" }, children: activeCount }),
          " active or in legal process"
        ] }) : "No active encampments" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1.5" }),
          " Log Encampment"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 15, style: { color: "#92400e", flexShrink: 0, marginTop: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.82rem", color: "#78350f" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Immediate action:" }),
        " Call police on 101 (or 999 if violence threatened) and request a Section 61 CJPOA / PCSC Act 2022 direction. Contact your solicitor if a court injunction or possession order (Part 55 CPR) may be needed. Document everything contemporaneously — evidence is time-critical for legal proceedings."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }, children: [{ v: "all", l: "All" }, ...STATUSES.map((s) => ({ v: s.value, l: s.label }))].map(({ v, l }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setStatusFilter(v),
        style: {
          padding: "4px 14px",
          borderRadius: 20,
          fontSize: "0.82rem",
          fontWeight: 500,
          cursor: "pointer",
          background: statusFilter === v ? "#1a3d2b" : "#f3f4f6",
          color: statusFilter === v ? "#fff" : "#374151",
          border: statusFilter === v ? "1px solid #1a3d2b" : "1px solid #e5e7eb"
        },
        children: [
          l,
          " ",
          v !== "all" && `(${incidents.filter((i) => i.status === v).length})`
        ]
      },
      v
    )) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", padding: 40 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin", size: 28, style: { color: "#9ca3af" } }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: 48, background: "#f9fafb", borderRadius: 12, border: "1px dashed #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tent, { size: 36, style: { color: "#d1d5db", margin: "0 auto 12px" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#9ca3af", fontSize: "0.9rem" }, children: [
        "No encampment records",
        statusFilter !== "all" ? ` with status "${statusLabel(statusFilter)}"` : "",
        "."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: filtered.map((r) => {
      const expanded = expandedId === r.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: { padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" },
            onClick: () => setExpandedId(expanded ? null : r.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tent, { size: 18, style: { color: "#b91c1c", flexShrink: 0, marginTop: 2 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontSize: "0.9rem" }, children: r.locationDescription }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", padding: "2px 8px", borderRadius: 12, fontWeight: 600, ...statusStyle(r.status) }, children: statusLabel(r.status) }),
                  r.cropsAffected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", padding: "2px 8px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: 12, fontWeight: 600 }, children: "Crops Affected" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.8rem", color: "#6b7280" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Discovered: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(r.discoveredAt) })
                  ] }),
                  r.vehicleCount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    r.vehicleCount,
                    " vehicles · ",
                    r.personCount ?? "?",
                    " persons · ",
                    r.caravanCount ?? "?",
                    " caravans"
                  ] }),
                  r.policeNotified && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#1d4ed8" }, children: [
                    "Police: ",
                    r.policeRefNumber || "Ref TBC"
                  ] }),
                  r.legalActionTaken && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#92400e" }, children: "Legal action taken" }),
                  r.vacatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#15803d" }, children: [
                    "Vacated: ",
                    fmt(r.vacatedAt)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                  e.stopPropagation();
                  setViewItem(r);
                }, children: "View" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: (e) => {
                      e.stopPropagation();
                      setDeleteId(r.id);
                    },
                    style: { color: "#ef4444", borderColor: "#fecaca" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                  }
                ),
                r.status !== "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: (e) => {
                      e.stopPropagation();
                      setRaiseTaskFor(r);
                    },
                    style: { color: "#f59e0b", borderColor: "#fde68a" },
                    title: "Raise Task",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 13 })
                  }
                ),
                expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16, style: { color: "#9ca3af" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, style: { color: "#9ca3af" } })
              ] })
            ]
          }
        ),
        expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "12px 16px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px 20px", fontSize: "0.82rem" }, children: [
            r.fieldParcel && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Field / Parcel", value: r.fieldParcel }),
            (r.latitude || r.longitude) && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "GPS", value: `${r.latitude}, ${r.longitude}` }),
            r.entryPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Entry Point", value: r.entryPoint }),
            r.vehicleDescriptions && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Vehicle Descriptions", value: r.vehicleDescriptions, span: true }),
            r.landDamageDescription && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Land Damage", value: r.landDamageDescription, span: true }),
            r.estimatedDamage && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Estimated Damage", value: r.estimatedDamage }),
            r.policeNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Police Action", value: r.policeAction || "—", span: true }),
            r.councilNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Council Ref", value: r.councilRefNumber || "—" }),
            r.legalActionTaken && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Legal Action Details", value: r.legalActionDetails || "—", span: true }),
            r.courtOrderObtained && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Court Order Ref", value: r.courtOrderRef || "—" }),
            r.landConditionAfter && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Land Condition After", value: r.landConditionAfter, span: true }),
            r.insuranceClaimMade && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Insurance", value: [
              r.insurancePolicyId ? policies.find((p) => p.id === r.insurancePolicyId)?.policyType ?? null : null,
              r.insurancePolicyId && policies.find((p) => p.id === r.insurancePolicyId)?.policyNumber ? `No. ${policies.find((p) => p.id === r.insurancePolicyId)?.policyNumber}` : null,
              r.insuranceClaimRef ? `Ref: ${r.insuranceClaimRef}` : null
            ].filter(Boolean).join(" · ") || "Claim made" }),
            r.remediationRequired && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Remediation", value: `${r.remediationNotes || "Required"}${r.remediationCost ? ` — £${r.remediationCost}` : ""}`, span: true }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Notes", value: r.notes, span: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoPanel, { incidentId: r.id, farmId, photos: r.photos })
        ] })
      ] }, r.id);
    }) }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620, maxHeight: "88vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tent, { size: 17, style: { color: "#b91c1c", flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flex: 1, minWidth: 0 }, children: viewItem.locationDescription })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 18 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "3px 10px", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, ...statusStyle(viewItem.status) }, children: statusLabel(viewItem.status) }),
          viewItem.cropsAffected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "3px 10px", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }, children: "Crops Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.82rem", color: "#6b7280" }, children: [
            "Discovered: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(viewItem.discoveredAt) })
          ] }),
          viewItem.vacatedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.82rem", color: "#15803d" }, children: [
            "Vacated: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(viewItem.vacatedAt) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
          viewItem.fieldParcel && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Field / Parcel", value: viewItem.fieldParcel }),
          (viewItem.latitude || viewItem.longitude) && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "GPS", value: `${viewItem.latitude ?? ""}, ${viewItem.longitude ?? ""}` }),
          viewItem.entryPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Entry Point", value: viewItem.entryPoint, span: true })
        ] }),
        (viewItem.vehicleCount != null || viewItem.personCount != null || viewItem.caravanCount != null || viewItem.vehicleDescriptions) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Persons & Vehicles" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.vehicleCount != null && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Vehicles", value: String(viewItem.vehicleCount) }),
            viewItem.personCount != null && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Persons (approx)", value: String(viewItem.personCount) }),
            viewItem.caravanCount != null && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Caravans", value: String(viewItem.caravanCount) }),
            viewItem.vehicleDescriptions && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Descriptions", value: viewItem.vehicleDescriptions, span: true })
          ] })
        ] }),
        (viewItem.landDamageDescription || viewItem.estimatedDamage) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Land Damage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.landDamageDescription && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Description", value: viewItem.landDamageDescription, span: true }),
            viewItem.estimatedDamage && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Estimated Damage Value", value: viewItem.estimatedDamage })
          ] })
        ] }),
        (viewItem.policeNotified || viewItem.councilNotified) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Authority Reports" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.policeNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Police Reference", value: viewItem.policeRefNumber || "No ref recorded" }),
            viewItem.policeAction && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Police Action", value: viewItem.policeAction, span: true }),
            viewItem.councilNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Council Reference", value: viewItem.councilRefNumber || "No ref recorded" })
          ] })
        ] }),
        viewItem.legalActionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Legal Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.legalActionDetails && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Details", value: viewItem.legalActionDetails, span: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Solicitor Instructed", value: viewItem.solicitorInstructed ? "Yes" : "No" }),
            viewItem.courtOrderObtained && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Court Order Reference", value: viewItem.courtOrderRef || "Obtained" })
          ] })
        ] }),
        viewItem.landConditionAfter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Land Condition After Vacation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", color: "#374151" }, children: viewItem.landConditionAfter })
        ] }),
        viewItem.insuranceClaimMade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Insurance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.insurancePolicyId && (() => {
              const pol = policies.find((p) => p.id === viewItem.insurancePolicyId);
              return pol ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Policy", value: pol.policyType + (pol.insurer ? ` — ${pol.insurer}` : "") }),
                pol.policyNumber && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Policy Number", value: pol.policyNumber })
              ] }) : null;
            })(),
            viewItem.insuranceClaimRef && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Claim Reference", value: viewItem.insuranceClaimRef })
          ] }),
          viewItem.insurancePolicyId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `/dashboard/insurance?open=${viewItem.insurancePolicyId}`,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", fontWeight: 500 },
              children: [
                "View policy & documents ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 })
              ]
            }
          )
        ] }),
        viewItem.remediationRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }, children: "Remediation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px 20px" }, children: [
            viewItem.remediationNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Notes", value: viewItem.remediationNotes, span: true }),
            viewItem.remediationCost && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoRow, { label: "Estimated Cost", value: `£${viewItem.remediationCost}` })
          ] })
        ] }),
        viewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 4 }, children: "Additional Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", color: "#374151", whiteSpace: "pre-wrap" }, children: viewItem.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoPanel, { incidentId: viewItem.id, farmId, photos: viewItem.photos })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewItem(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewItem;
          setViewItem(null);
          openEdit(r);
        }, children: "Edit Encampment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDialogOpen, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Encampment Record" : "Log Unauthorized Encampment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Incident Details", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date Discovered *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.discoveredAt, onChange: (e) => ff("discoveredAt", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
                value: form.status,
                onChange: (e) => ff("status", e.target.value),
                children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.value, children: s.label }, s.value))
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Location Description *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.locationDescription, onChange: (e) => ff("locationDescription", e.target.value), placeholder: "e.g. Lower Meadow, off Elm Lane" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Field / Parcel Reference", children: [
              fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 mb-2",
                  value: form.fieldId ?? "",
                  onChange: (e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    const found = fields.find((f) => f.id === id);
                    ff("fieldId", id);
                    if (found) ff("fieldParcel", [found.name, found.fieldReference].filter(Boolean).join(" — "));
                    else if (!id) ff("fieldParcel", "");
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select registered field…" }),
                    fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
                      f.name,
                      f.fieldReference ? ` (${f.fieldReference})` : ""
                    ] }, f.id))
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fieldParcel ?? "", onChange: (e) => ff("fieldParcel", e.target.value), placeholder: fields.length > 0 ? "Or enter manually — e.g. OS 1234 / Field 7" : "e.g. OS 1234 / Field 7" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Entry Point", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.entryPoint ?? "", onChange: (e) => ff("entryPoint", e.target.value), placeholder: "e.g. Cut hedge on north boundary" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Latitude", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.latitude ?? "", onChange: (e) => ff("latitude", e.target.value), placeholder: "51.5074" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Longitude", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.longitude ?? "", onChange: (e) => ff("longitude", e.target.value), placeholder: "-1.8043" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Persons & Vehicles", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row3, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "No. of Vehicles", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.vehicleCount ?? "", onChange: (e) => ff("vehicleCount", e.target.value ? parseInt(e.target.value) : null) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "No. of Persons (approx)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.personCount ?? "", onChange: (e) => ff("personCount", e.target.value ? parseInt(e.target.value) : null) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "No. of Caravans", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.caravanCount ?? "", onChange: (e) => ff("caravanCount", e.target.value ? parseInt(e.target.value) : null) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vehicle Descriptions (make, colour, registration if visible)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.vehicleDescriptions ?? "", onChange: (e) => ff("vehicleDescriptions", e.target.value), placeholder: "e.g. White Transit van DP12 XYZ, Silver Audi estate..." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Land Damage", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description of Damage", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.landDamageDescription ?? "", onChange: (e) => ff("landDamageDescription", e.target.value), placeholder: "Gates damaged, fencing cut, soil compaction, waste left, crops driven over..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Crops affected?", checked: form.cropsAffected, onChange: (v) => ff("cropsAffected", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estimated Damage Value (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", border: "2px solid hsl(var(--border))", borderRadius: "0.75rem", overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "0 10px", color: "#6b7280", fontSize: "0.95rem", flexShrink: 0 }, children: "£" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  style: { flex: 1, border: "none", outline: "none", padding: "0 12px 0 0", height: "3rem", fontSize: "1rem", background: "transparent" },
                  value: form.estimatedDamage ?? "",
                  onChange: (e) => ff("estimatedDamage", e.target.value),
                  placeholder: "0.00"
                }
              )
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Police", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Police notified?", checked: form.policeNotified, onChange: (v) => ff("policeNotified", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Police Incident / Crime Ref", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.policeRefNumber ?? "", onChange: (e) => ff("policeRefNumber", e.target.value), placeholder: "e.g. 01/CRI-2025-12345" }) })
          ] }),
          form.policeNotified && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Police Action Taken", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
              value: form.policeAction ?? "",
              onChange: (e) => ff("policeAction", e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select action…" }),
                POLICE_ACTIONS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a, children: a }, a))
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Local Council", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Council notified?", checked: form.councilNotified, onChange: (v) => ff("councilNotified", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Council Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.councilRefNumber ?? "", onChange: (e) => ff("councilRefNumber", e.target.value), placeholder: "e.g. ENF-2025-0042" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Legal Action", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Legal action taken?", checked: form.legalActionTaken, onChange: (v) => ff("legalActionTaken", v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Solicitor instructed?", checked: form.solicitorInstructed, onChange: (v) => ff("solicitorInstructed", v) })
          ] }),
          form.legalActionTaken && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Legal Action Details", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 mb-2",
              value: form.legalActionDetails ?? "",
              onChange: (e) => ff("legalActionDetails", e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select notice / order type…" }),
                LEGAL_NOTICE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Court order obtained?", checked: form.courtOrderObtained, onChange: (v) => ff("courtOrderObtained", v) }),
            form.courtOrderObtained && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Court Order Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.courtOrderRef ?? "", onChange: (e) => ff("courtOrderRef", e.target.value), placeholder: "e.g. HC-2025-001234" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Resolution", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date Vacated", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.vacatedAt ?? "", onChange: (e) => ff("vacatedAt", e.target.value) }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Land Condition After Vacation", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
              value: form.landConditionAfter ?? "",
              onChange: (e) => ff("landConditionAfter", e.target.value),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select condition…" }),
                LAND_CONDITIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Insurance & Remediation", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Insurance claim made?", checked: form.insuranceClaimMade, onChange: (v) => {
            ff("insuranceClaimMade", v);
            if (!v) {
              ff("insurancePolicyId", null);
              ff("insuranceClaimRef", "");
              setClaimDropdownVal("");
            }
          } }),
          form.insuranceClaimMade && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Linked Insurance Policy", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                  value: form.insurancePolicyId ?? "",
                  onChange: (e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    ff("insurancePolicyId", val);
                    ff("insuranceClaimRef", "");
                    setClaimDropdownVal("");
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select current policy…" }),
                    validPolicies.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
                      p.policyType,
                      p.insurer ? ` — ${p.insurer}` : ""
                    ] }, p.id)),
                    form.insurancePolicyId && !validPolicies.find((p) => p.id === form.insurancePolicyId) && policies.filter((p) => p.id === form.insurancePolicyId).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
                      p.policyType,
                      " — expired / superseded"
                    ] }, p.id))
                  ]
                }
              ),
              selectedPolicy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: "0.8rem", flexWrap: "wrap" }, children: [
                selectedPolicy.policyNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                  "Policy No: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 600, color: "#374151" }, children: selectedPolicy.policyNumber })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontStyle: "italic" }, children: "No policy number recorded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `/dashboard/insurance?open=${selectedPolicy.id}`, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 3, color: "#2563eb", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }, children: [
                  "View policy & documents ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Claim Reference", children: openClaims.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                  value: claimDropdownVal,
                  onChange: (e) => {
                    const val = e.target.value;
                    setClaimDropdownVal(val);
                    if (val !== "" && val !== "manual") {
                      const claim = openClaims.find((c) => String(c.id) === val);
                      if (claim?.claimRef) ff("insuranceClaimRef", claim.claimRef);
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Link to an open claim from register…" }),
                    openClaims.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(c.id), children: [
                      c.claimRef ? `${c.claimRef} — ` : "",
                      (c.description ?? "No description").slice(0, 55),
                      (c.description?.length ?? 0) > 55 ? "…" : "",
                      " [",
                      claimStatusLabel(c.status),
                      "]"
                    ] }, c.id)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manual", children: "Enter reference manually…" })
                  ]
                }
              ),
              (claimDropdownVal === "" || claimDropdownVal === "manual") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { style: { marginTop: 8 }, value: form.insuranceClaimRef ?? "", onChange: (e) => ff("insuranceClaimRef", e.target.value), placeholder: "e.g. CLM-2025-00123" }),
              claimDropdownVal !== "" && claimDropdownVal !== "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
                "Ref ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 600, color: "#374151" }, children: form.insuranceClaimRef || "—" }),
                " linked from Claims Register."
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.insuranceClaimRef ?? "", onChange: (e) => ff("insuranceClaimRef", e.target.value), placeholder: "e.g. CLM-2025-00123" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: form.insurancePolicyId ? "No open claims on record for this insurer — enter the reference manually once issued." : "Select a policy above to see matching open claims, or enter the reference manually." })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row2, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckField, { label: "Remediation required?", checked: form.remediationRequired, onChange: (v) => ff("remediationRequired", v) }),
            form.remediationRequired && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Remediation Cost (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", border: "2px solid hsl(var(--border))", borderRadius: "0.75rem", overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "0 10px", color: "#6b7280", fontSize: "0.95rem", flexShrink: 0 }, children: "£" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  style: { flex: 1, border: "none", outline: "none", padding: "0 12px 0 0", height: "3rem", fontSize: "1rem", background: "transparent" },
                  value: form.remediationCost ?? "",
                  onChange: (e) => ff("remediationCost", e.target.value),
                  placeholder: "0.00"
                }
              )
            ] }) })
          ] }),
          form.remediationRequired && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Remediation Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.remediationNotes ?? "", onChange: (e) => ff("remediationNotes", e.target.value), placeholder: "What remediation work is required or has been carried out?" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Additional Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes ?? "", onChange: (e) => ff("notes", e.target.value), placeholder: "Any further details about the incident, interactions with occupants, etc." }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !form.locationDescription || !form.discoveredAt || isSaving, children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1.5" }),
          "Saving…"
        ] }) : editItem ? "Save Changes" : "Log Encampment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteId, onOpenChange: (open) => {
      if (!open) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Encampment Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will permanently remove this record and all associated photos." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteId && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: [
          deleteMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1.5" }) : null,
          " Delete"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Encampment ${raiseTaskFor.status === "legal_action" ? "Legal Follow-up" : "Action"} — ${raiseTaskFor.locationDescription}` : "",
        defaultDescription: raiseTaskFor ? `Discovered: ${fmt(raiseTaskFor.discoveredAt)}. Status: ${statusLabel(raiseTaskFor.status)}.${raiseTaskFor.remediationRequired ? " Remediation required." : ""}` : "",
        module: "environment"
      }
    )
  ] }) });
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 10 }, children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold text-foreground/70", children: label }),
    children
  ] });
}
function Row2({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children });
}
function Row3({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children });
}
function CheckField({ label, checked, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: (e) => onChange(e.target.checked), className: "rounded border-gray-300 accent-green-700" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: label })
  ] });
}
function InfoRow({ label, value, span }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: span ? { gridColumn: "1 / -1" } : {}, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.82rem", color: "#374151" }, children: value })
  ] });
}
export {
  EncampmentPage as default
};
