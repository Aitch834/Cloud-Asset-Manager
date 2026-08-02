import { t as useQueryClient, a as useToast, l as useQuery, r as reactExports, O as useMutation, j as jsxRuntimeExports, c as Button, S as Plus, Q as React, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input } from "./index-CGbXBxot.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { C as CropYearSelector } from "./CropYearSelector-ChjvyvGM.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { A as AppLayout, c as ClipboardList } from "./AppLayout-putGuZWf.js";
import { T as Textarea } from "./textarea-frCBroO4.js";
import { B as Badge } from "./badge-DDfCXtS-.js";
import { P as PhotoPanel } from "./PhotoPanel-B9rC0YSi.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CF_TfOJO.js";
import { B as BuyerCombobox } from "./BuyerCombobox-Ph4noO0o.js";
import { T as TriangleAlert } from "./triangle-alert-BY938fC3.js";
import { P as Printer } from "./printer-EG2RK1UR.js";
import { C as Camera } from "./camera-CXOCEWjI.js";
import { C as ChevronUp } from "./chevron-up-BMbuihYt.js";
import { C as ChevronDown } from "./trash-2-CGl8zIE6.js";
import { E as ExternalLink } from "./external-link-B3MbhJFG.js";
import "./select-BE6IyvwX.js";
import "./index-DDMdvg-X.js";
import "./index-DxTzvEJA.js";
import "./use-safe-clerk-35QqXEZr.js";
import "./database-BirbkeE5.js";
import "./shield-alert-BiVgAjYh.js";
import "./shield-check-Dd9GE4mz.js";
import "./tractor-CI2t_SLv.js";
import "./file-B923WO99.js";
import "./popover-CceUTfvo.js";
import "./command-BVGrHaE6.js";
import "./search-DIassHl2.js";
import "./chevrons-up-down-DJIQwKe6.js";
import "./user-plus-mDKhoCfN.js";
function parseWasteTypes(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}
const WASTE_TYPES = [
  "Household waste (bags / loose)",
  "Commercial waste",
  "Construction / demolition debris",
  "Asbestos / fibrous material",
  "Tyres",
  "Electrical / WEEE",
  "Chemical containers / drums",
  "Clinical / medical waste",
  "Scrap metal / vehicles",
  "Garden / green waste",
  "Soil / hardcore",
  "Animal carcasses",
  "Fridges / white goods",
  "Mattresses / furniture",
  "Mixed waste"
];
const CLEARANCE_STATUSES = [
  { value: "pending", label: "Pending", bg: "#fef9c3", color: "#a16207", border: "#fde047" },
  { value: "arranged", label: "Clearance Arranged", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  { value: "cleared", label: "Cleared", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" }
];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
function claimStatusLabel(status) {
  const labels = { draft: "Draft", reported: "Reported", acknowledged: "Acknowledged", under_investigation: "Under Investigation", settled: "Settled", rejected: "Rejected", withdrawn: "Withdrawn" };
  return labels[status] ?? status;
}
function viewField(label, value) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value === true ? "Yes" : value === false ? "No" : value || "—" })
  ] });
}
function viewDialogContent(inc, policies = []) {
  const types = parseWasteTypes(inc.wasteTypes);
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
    inc.isHazardous && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 12px", color: "#dc2626", fontWeight: 700, fontSize: "0.875rem" }, children: "⚠ HAZARDOUS WASTE" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
      viewField("Date Discovered", fmtD(inc.discoveredAt)),
      viewField("Clearance Status", inc.clearanceStatus?.replace(/-/g, " "))
    ] }),
    viewField("Location", inc.locationDescription),
    inc.accessPoint && viewField("Access Point", inc.accessPoint),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }, children: "Waste Types" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: types.length ? "#111827" : "#d1d5db" }, children: types.length ? types.join(", ") : "—" })
    ] }),
    inc.estimatedQuantity && viewField("Estimated Quantity", inc.estimatedQuantity),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
      viewField("Police Reported", inc.policeReported ? `Yes${inc.policeRefNumber ? ` — ${inc.policeRefNumber}` : ""}` : "No"),
      viewField("Council Reported", inc.councilReported ? `Yes${inc.councilRefNumber ? ` — ${inc.councilRefNumber}` : ""}` : "No"),
      viewField("EA Reported", inc.eaReported ? `Yes${inc.eaRefNumber ? ` — ${inc.eaRefNumber}` : ""}` : "No")
    ] }),
    inc.clearanceContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
      viewField("Clearance Contractor", inc.clearanceContractor),
      viewField("Clearance Date", fmtD(inc.clearanceDate))
    ] }),
    inc.wasteTransferNoteRef && viewField("Waste Transfer Note Ref", inc.wasteTransferNoteRef),
    inc.insuranceClaimMade && viewField("Insurance", [
      inc.insurancePolicyId ? policies.find((p) => p.id === inc.insurancePolicyId)?.policyType ?? "Linked policy" : null,
      inc.insurancePolicyId && policies.find((p) => p.id === inc.insurancePolicyId)?.policyNumber ? `No. ${policies.find((p) => p.id === inc.insurancePolicyId)?.policyNumber}` : null,
      inc.insuranceClaimRef ? `Ref: ${inc.insuranceClaimRef}` : null
    ].filter(Boolean).join(" · ") || "Claim made"),
    inc.notes && viewField("Notes", inc.notes)
  ] });
}
const EMPTY = {
  discoveredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  locationDescription: "",
  latitude: null,
  longitude: null,
  wasteTypes: null,
  estimatedQuantity: null,
  isHazardous: false,
  accessPoint: null,
  policeReported: false,
  policeRefNumber: null,
  councilReported: false,
  councilRefNumber: null,
  eaReported: false,
  eaRefNumber: null,
  clearanceStatus: "pending",
  clearanceContractor: null,
  clearanceContractorSupplierId: null,
  clearanceDate: null,
  wasteTransferNoteRef: null,
  insuranceClaimMade: false,
  insurancePolicyId: null,
  insuranceClaimRef: null,
  notes: null
};
function FlyTippingPage({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farm = farmData?.record;
  const q = useQuery({
    queryKey: ["fly-tipping", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fly-tipping`).then((r) => r.json()),
    enabled: !!farmId
  });
  const incidents = q.data?.records ?? [];
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
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [selectedWasteTypes, setSelectedWasteTypes] = reactExports.useState([]);
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [form, setForm] = reactExports.useState({ ...EMPTY });
  const [claimDropdownVal, setClaimDropdownVal] = reactExports.useState("");
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const validPolicies = policies.filter((p) => !p.supersededByRenewal && (!p.expiryDate || p.expiryDate >= today));
  const selectedPolicy = policies.find((p) => p.id === form.insurancePolicyId) ?? null;
  const openClaims = allClaims.filter(
    (c) => !["settled", "rejected", "withdrawn"].includes(c.status) && (!selectedPolicy?.insurer || !c.insurer || c.insurer.toLowerCase().includes(selectedPolicy.insurer.toLowerCase()) || selectedPolicy.insurer.toLowerCase().includes(c.insurer.toLowerCase()))
  );
  function openAdd() {
    setEditItem(null);
    setSelectedWasteTypes([]);
    setClaimDropdownVal("");
    setForm({ ...EMPTY, discoveredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setAddOpen(true);
  }
  function openEdit(r) {
    setEditItem(r);
    const types = parseWasteTypes(r.wasteTypes);
    setSelectedWasteTypes(types);
    setForm({
      discoveredAt: r.discoveredAt?.slice(0, 10) ?? "",
      locationDescription: r.locationDescription ?? "",
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      wasteTypes: r.wasteTypes ?? null,
      estimatedQuantity: r.estimatedQuantity ?? null,
      isHazardous: r.isHazardous ?? false,
      accessPoint: r.accessPoint ?? null,
      policeReported: r.policeReported ?? false,
      policeRefNumber: r.policeRefNumber ?? null,
      councilReported: r.councilReported ?? false,
      councilRefNumber: r.councilRefNumber ?? null,
      eaReported: r.eaReported ?? false,
      eaRefNumber: r.eaRefNumber ?? null,
      clearanceStatus: r.clearanceStatus ?? "pending",
      clearanceContractor: r.clearanceContractor ?? null,
      clearanceContractorSupplierId: r.clearanceContractorSupplierId ?? null,
      clearanceDate: r.clearanceDate?.slice(0, 10) ?? null,
      wasteTransferNoteRef: r.wasteTransferNoteRef ?? null,
      insuranceClaimMade: r.insuranceClaimMade ?? false,
      insurancePolicyId: r.insurancePolicyId ?? null,
      insuranceClaimRef: r.insuranceClaimRef ?? null,
      notes: r.notes ?? null
    });
    const matchedClaim = allClaims.find((c) => c.claimRef === r.insuranceClaimRef && !["settled", "rejected", "withdrawn"].includes(c.status));
    setClaimDropdownVal(matchedClaim ? String(matchedClaim.id) : r.insuranceClaimRef ? "manual" : "");
    setAddOpen(true);
  }
  function toggleWasteType(t) {
    setSelectedWasteTypes((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      setForm((f) => ({ ...f, wasteTypes: next.length ? JSON.stringify(next) : null }));
      return next;
    });
  }
  const mut = useMutation({
    mutationFn: async (vars) => {
      if (vars.action === "create") return fetch(`/api/farms/${farmId}/fly-tipping`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vars.body) }).then((r) => r.json());
      if (vars.action === "update") return fetch(`/api/farms/${farmId}/fly-tipping/${vars.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vars.body) }).then((r) => r.json());
      return fetch(`/api/farms/${farmId}/fly-tipping/${vars.id}`, { method: "DELETE" });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["fly-tipping", farmId] });
      if (vars.action === "create") {
        toast({ title: "Incident recorded" });
        setAddOpen(false);
      }
      if (vars.action === "update") {
        toast({ title: "Incident updated" });
        setAddOpen(false);
        setEditItem(null);
      }
      if (vars.action === "delete") {
        toast({ title: "Incident deleted" });
        setDeleteId(null);
      }
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function handleSave() {
    const body = { ...form, wasteTypes: form.wasteTypes };
    if (editItem) mut.mutate({ action: "update", id: editItem.id, body });
    else mut.mutate({ action: "create", body });
  }
  const filtered = (statusFilter === "all" ? incidents : incidents.filter((i) => i.clearanceStatus === statusFilter)).filter((i) => isInCropYear(i.discoveredAt, cropYear));
  const openCount = incidents.filter((i) => i.clearanceStatus !== "cleared").length;
  function clearanceStyle(status) {
    const s = CLEARANCE_STATUSES.find((x) => x.value === status);
    return s ? { background: s.bg, color: s.color, border: `1px solid ${s.border}` } : {};
  }
  function clearanceLabel(status) {
    return CLEARANCE_STATUSES.find((x) => x.value === status)?.label ?? status;
  }
  function handlePrint() {
    const rows = filtered.map((i) => {
      const types = parseWasteTypes(i.wasteTypes).join(", ") || "—";
      const reports = [
        i.policeReported ? `Police${i.policeRefNumber ? ` (${i.policeRefNumber})` : ""}` : "",
        i.councilReported ? `Council${i.councilRefNumber ? ` (${i.councilRefNumber})` : ""}` : "",
        i.eaReported ? `Environment Agency${i.eaRefNumber ? ` (${i.eaRefNumber})` : ""}` : ""
      ].filter(Boolean).join("; ") || "Not yet reported";
      return `<tr>
        <td style="white-space:nowrap">${fmt(i.discoveredAt)}</td>
        <td>${i.locationDescription}</td>
        <td>${types}</td>
        <td style="${i.isHazardous ? "color:#dc2626;font-weight:700" : ""}">${i.isHazardous ? "⚠ YES" : "No"}</td>
        <td>${reports}</td>
        <td>${clearanceLabel(i.clearanceStatus)}</td>
        <td>${i.photos.length > 0 ? `${i.photos.length} photo(s)` : "—"}</td>
      </tr>`;
    }).join("");
    const tableHtml = `<table><thead><tr>
      <th>Date Found</th><th>Location</th><th>Waste Types</th><th>Hazardous</th><th>Reported To</th><th>Status</th><th>Photos</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Fly-Tipping Incident Log",
      subtitle: "Environmental Protection Act 1990",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      recordCount: filtered.length,
      recordLabel: "incident",
      extraMeta: `Crop Year: ${cropYearLabel(cropYear)}`,
      tableHtml,
      footerNote: "Under the Environmental Protection Act 1990, landowners are responsible for removing fly-tipped waste from their land. Report to local council and Environment Agency (0800 80 70 60) for hazardous waste."
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "0 8px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 22, style: { color: "#dc2626" } }),
          " Fly-Tipping Incident Log"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }, children: "Record and track illegal waste dumping on your land — evidence gathering, authority reporting, and clearance status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          " Report Incident"
        ] })
      ] })
    ] }),
    !farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { flexShrink: 0, marginTop: 1, color: "#d97706" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#92400e" }, children: "Select a farm from the dropdown in the sidebar to view and record fly-tipping incidents." })
    ] }),
    farmId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderRadius: 8, background: "#fff7ed", border: "1px solid #fed7aa", marginBottom: 20 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, style: { flexShrink: 0, marginTop: 2, color: "#ea580c" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#7c2d12" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Landowner responsibility:" }),
          " Under the Environmental Protection Act 1990, you are responsible for clearing fly-tipped waste from your private land at your own cost — even though you didn't dump it.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hazardous waste" }),
          " (asbestos, chemicals) must be removed by a licensed contractor — do not move or burn it.",
          " ",
          "Report all incidents to your local council, and the Environment Agency if hazardous (0800 80 70 60)."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }, children: [
        ["all", "pending", "arranged", "cleared"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusFilter(s),
            style: {
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontWeight: statusFilter === s ? 600 : 400,
              background: statusFilter === s ? "#111827" : "#f3f4f6",
              color: statusFilter === s ? "#fff" : "#374151",
              border: "1px solid " + (statusFilter === s ? "#111827" : "#e5e7eb")
            },
            children: s === "all" ? `All (${incidents.length})` : clearanceLabel(s)
          },
          s
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
        openCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", marginLeft: "auto" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11, className: "mr-1" }),
          " ",
          openCount,
          " open ",
          openCount === 1 ? "incident" : "incidents"
        ] })
      ] }),
      q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3, color: "#dc2626" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: statusFilter === "all" ? "No incidents recorded" : `No ${clearanceLabel(statusFilter).toLowerCase()} incidents` }),
        statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "If you find fly-tipped waste on your land, use this log to record the incident, track authority reports, and manage clearance." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Date Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Waste / Volume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Reported" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "10px 14px" } })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((inc, i) => {
          const types = parseWasteTypes(inc.wasteTypes);
          const reports = [inc.policeReported && "Police", inc.councilReported && "Council", inc.eaReported && "Env. Agency"].filter(Boolean);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: expandedId === inc.id ? void 0 : i < filtered.length - 1 ? "1px solid #f3f4f6" : void 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", whiteSpace: "nowrap" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: fmt(inc.discoveredAt) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "10px 14px", maxWidth: 200 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, style: { flexShrink: 0, marginTop: 2, color: "#6b7280" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inc.locationDescription })
                ] }),
                inc.isHazardous && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", marginTop: 4, padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }, children: "⚠ HAZARDOUS" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "10px 14px" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8125rem" }, children: types.length ? types.slice(0, 2).join(", ") + (types.length > 2 ? ` +${types.length - 2} more` : "") : "—" }),
                inc.estimatedQuantity && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2 }, children: inc.estimatedQuantity })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: reports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#ef4444" }, children: "Not reported" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: reports.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }, children: r }, r)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, ...clearanceStyle(inc.clearanceStatus) }, children: clearanceLabel(inc.clearanceStatus) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, display: "flex", alignItems: "center", gap: 3 }, onClick: () => setExpandedId(expandedId === inc.id ? null : inc.id), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 11 }),
                  inc.photos.length > 0 ? inc.photos.length : "",
                  " Photos",
                  expandedId === inc.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 11 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 11 })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => setViewItem(inc), children: "View" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#dc2626" }, onClick: () => setDeleteId(inc.id), children: "Del" }),
                inc.clearanceStatus !== "cleared" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#f59e0b", borderColor: "#fde68a" }, onClick: () => setRaiseTaskFor(inc), title: "Raise Task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 11 }) })
              ] }) })
            ] }),
            expandedId === inc.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : void 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, style: { padding: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhotoPanel, { incidentId: inc.id, farmId, photos: inc.photos }) }) })
          ] }, inc.id);
        }) })
      ] }) })
    ] }),
    viewItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewItem(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Fly-Tipping Incident" }) }),
      viewDialogContent(viewItem, policies),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewItem(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewItem;
          setViewItem(null);
          openEdit(r);
        }, children: "Edit Incident" })
      ] })
    ] }) }),
    addOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580, maxHeight: "85vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Incident" : "Report Fly-Tipping Incident" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Discovered *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.discoveredAt?.slice(0, 10) ?? "", onChange: (e) => setForm((f) => ({ ...f, discoveredAt: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated Volume / Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.estimatedQuantity ?? "", onChange: (e) => setForm((f) => ({ ...f, estimatedQuantity: e.target.value || null })), placeholder: "e.g. 2 transit van loads" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.locationDescription ?? "", onChange: (e) => setForm((f) => ({ ...f, locationDescription: e.target.value })), placeholder: "e.g. North-east corner of Top Field, adjacent to the public bridleway gate — OS grid ref TF123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GPS Latitude" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.latitude ?? "", onChange: (e) => setForm((f) => ({ ...f, latitude: e.target.value || null })), placeholder: "e.g. 53.2145" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GPS Longitude" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.longitude ?? "", onChange: (e) => setForm((f) => ({ ...f, longitude: e.target.value || null })), placeholder: "e.g. -0.5432" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Point / Entry Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.accessPoint ?? "", onChange: (e) => setForm((f) => ({ ...f, accessPoint: e.target.value || null })), placeholder: "e.g. Gate on Pottergate Road — padlock found cut" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Types *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }, children: WASTE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleWasteType(t),
              style: {
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: "0.8rem",
                cursor: "pointer",
                background: selectedWasteTypes.includes(t) ? "#dc2626" : "#f3f4f6",
                color: selectedWasteTypes.includes(t) ? "#fff" : "#374151",
                border: "1px solid " + (selectedWasteTypes.includes(t) ? "#dc2626" : "#e5e7eb")
              },
              children: t
            },
            t
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "hazardous",
              checked: !!form.isHazardous,
              onChange: (e) => setForm((f) => ({ ...f, isHazardous: e.target.checked })),
              style: { width: 16, height: 16 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "hazardous", style: { fontWeight: 600, color: "#dc2626", fontSize: "0.875rem", cursor: "pointer" }, children: "⚠ Hazardous waste present (asbestos, chemicals, clinical/medical, fuel/oil)" })
        ] }),
        form.isHazardous && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "8px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, fontSize: "0.8125rem", color: "#7c2d12" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Do not touch or move hazardous waste." }),
          " Contact the Environment Agency immediately on ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "0800 80 70 60" }),
          ". Removal must be carried out by a licensed waste contractor."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 8 }, children: "Authority Reports" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 10 }, children: [
            { key: "policeReported", refKey: "policeRefNumber", label: "Reported to Police", refLabel: "Crime Reference Number", hint: "Call 101 or report online" },
            { key: "councilReported", refKey: "councilRefNumber", label: "Reported to Local Council", refLabel: "Council Reference Number", hint: "Use your district council's fly-tipping report form" },
            { key: "eaReported", refKey: "eaRefNumber", label: "Reported to Environment Agency", refLabel: "EA Reference Number", hint: "Call 0800 80 70 60 — required for hazardous waste" }
          ].map(({ key, refKey, label, refLabel, hint }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 7, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: form[key] ? "#f0fdf4" : "#f9fafb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: key,
                  checked: !!form[key],
                  onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.checked })),
                  style: { width: 15, height: 15 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: key, style: { fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", flex: 1, color: "#111827" }, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: hint })
            ] }),
            form[key] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "8px 12px", borderTop: "1px solid #e5e7eb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form[refKey] ?? "",
                onChange: (e) => setForm((f) => ({ ...f, [refKey]: e.target.value || null })),
                placeholder: refLabel,
                style: { fontSize: "0.875rem" }
              }
            ) })
          ] }, key)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clearance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginTop: 6 }, children: CLEARANCE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setForm((f) => ({ ...f, clearanceStatus: s.value })),
              style: {
                flex: 1,
                padding: "6px 8px",
                borderRadius: 7,
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: form.clearanceStatus === s.value ? 600 : 400,
                background: form.clearanceStatus === s.value ? s.bg : "#f9fafb",
                color: form.clearanceStatus === s.value ? s.color : "#6b7280",
                border: `1px solid ${form.clearanceStatus === s.value ? s.border : "#e5e7eb"}`
              },
              children: s.label
            },
            s.value
          )) })
        ] }),
        form.clearanceStatus !== "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clearance Contractor" }),
            farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.clearanceContractorSupplierId ?? null, valueName: form.clearanceContractor ?? "", onChange: (id, name) => setForm((f) => ({ ...f, clearanceContractorSupplierId: id, clearanceContractor: name || null })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clearance Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.clearanceDate ?? "", onChange: (e) => setForm((f) => ({ ...f, clearanceDate: e.target.value || null })) })
          ] })
        ] }),
        form.clearanceStatus === "cleared" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.wasteTransferNoteRef ?? "", onChange: (e) => setForm((f) => ({ ...f, wasteTransferNoteRef: e.target.value || null })), placeholder: "WTN reference — keep the physical copy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: "A Waste Transfer Note is legally required for all collected waste under the Environmental Protection (Duty of Care) Regulations 1991." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: 8 }, children: "Insurance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: form.insuranceClaimMade ? "#eff6ff" : "#f9fafb", border: `1px solid ${form.insuranceClaimMade ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: 7, marginBottom: form.insuranceClaimMade ? 12 : 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "insuranceClaimMade",
                checked: !!form.insuranceClaimMade,
                onChange: (e) => {
                  setForm((f) => ({ ...f, insuranceClaimMade: e.target.checked, insurancePolicyId: null, insuranceClaimRef: null }));
                  setClaimDropdownVal("");
                },
                style: { width: 15, height: 15 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "insuranceClaimMade", style: { fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", color: "#111827" }, children: "Insurance claim made or intended against this incident" })
          ] }),
          form.insuranceClaimMade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Insurance Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  style: { width: "100%", height: 40, padding: "0 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.875rem", marginTop: 4 },
                  value: form.insurancePolicyId ?? "",
                  onChange: (e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setForm((f) => ({ ...f, insurancePolicyId: val, insuranceClaimRef: null }));
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Claim Reference" }),
              openClaims.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    style: { width: "100%", height: 40, padding: "0 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.875rem", marginTop: 4 },
                    value: claimDropdownVal,
                    onChange: (e) => {
                      const val = e.target.value;
                      setClaimDropdownVal(val);
                      if (val !== "" && val !== "manual") {
                        const claim = openClaims.find((c) => String(c.id) === val);
                        if (claim?.claimRef) setForm((f) => ({ ...f, insuranceClaimRef: claim.claimRef }));
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
                (claimDropdownVal === "" || claimDropdownVal === "manual") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    style: { width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.875rem", marginTop: 8, boxSizing: "border-box" },
                    value: form.insuranceClaimRef ?? "",
                    onChange: (e) => setForm((f) => ({ ...f, insuranceClaimRef: e.target.value || null })),
                    placeholder: "e.g. CLM-2025-00123"
                  }
                ),
                claimDropdownVal !== "" && claimDropdownVal !== "manual" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: [
                  "Ref ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 600, color: "#374151" }, children: form.insuranceClaimRef || "—" }),
                  " linked from Claims Register."
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    style: { width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", fontSize: "0.875rem", marginTop: 4, boxSizing: "border-box" },
                    value: form.insuranceClaimRef ?? "",
                    onChange: (e) => setForm((f) => ({ ...f, insuranceClaimRef: e.target.value || null })),
                    placeholder: "e.g. CLM-2025-00123"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }, children: form.insurancePolicyId ? "No open claims on record for this insurer — enter the reference once issued." : "Select a policy above to see matching open claims, or enter the reference manually." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value || null })), placeholder: "Vehicle descriptions, witness details, any identifying material found in the waste, etc." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSave,
            disabled: !form.locationDescription?.trim() || !form.discoveredAt || !form.wasteTypes,
            children: editItem ? "Update Incident" : "Record Incident"
          }
        )
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Incident Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will permanently remove this fly-tipping incident and all associated photos. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => mut.mutate({ action: "delete", id: deleteId }), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `Fly-Tipping ${raiseTaskFor.clearanceStatus === "pending" ? "Clearance" : "Follow-up"} — ${raiseTaskFor.locationDescription}` : "",
        defaultDescription: raiseTaskFor ? `Discovered: ${fmt(raiseTaskFor.discoveredAt)}. Status: ${raiseTaskFor.clearanceStatus}.${raiseTaskFor.isHazardous ? " ⚠ HAZARDOUS waste — special disposal rules apply." : ""}` : "",
        module: "environment"
      }
    )
  ] }) });
}
export {
  FlyTippingPage as default
};
