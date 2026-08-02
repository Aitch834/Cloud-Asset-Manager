import { b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, j as jsxRuntimeExports, M as MapPin, O as useMutation, I as Input, c as Button, S as Plus, Q as React, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, J as DialogFooter, o as Link } from "./index-DLA6iXYW.js";
import { a as printFromRef } from "./print-report-B_FwCCVJ.js";
import { Q as QUALITY_GRADE_OPTIONS, g as gradeLabel, a as gradeColors } from "./harvestGrades-CRosQIUs.js";
import { C as CropYearSelector } from "./CropYearSelector-BL9muK7w.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { T as TabBar, a as TabButton } from "./tab-button-UVa2yvFv.js";
import { A as AppLayout, a as Wheat, f as Scale, u as useUserRole, j as Truck, W as Warehouse } from "./AppLayout-BxeI_OmO.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-i1WIPIXB.js";
import { S as StaffSelect } from "./staff-select-CpcM6FNa.js";
import { V as VEHICLE_TYPES } from "./equipmentTypes-DkOagSn9.js";
import { T as Textarea } from "./textarea-C3wTE8h3.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, e as SelectGroup, f as SelectLabel } from "./select-B8hQbSQ-.js";
import { R as RecordAttachments } from "./RecordAttachments-Zy4YfuMN.js";
import { B as Badge } from "./badge-7XPGGA-L.js";
import { S as Search } from "./search-CHbeTELu.js";
import { T as TriangleAlert } from "./triangle-alert-zyrGe5W-.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-u-VjGNMa.js";
import { C as ChevronRight, T as Tractor } from "./tractor-DugFneth.js";
import { C as CircleCheck } from "./circle-check-CtLz-fM5.js";
import { P as Pencil } from "./pencil-BPraY6hr.js";
import { P as Printer } from "./printer-b4_1miKq.js";
import "./use-safe-clerk-DV16OsDs.js";
import "./database-BXgoiQqx.js";
import "./shield-alert-C77k0FMN.js";
import "./shield-check-CvlF33EW.js";
import "./index-rCfZKOBm.js";
import "./index-CzdsWrK0.js";
import "./chevron-up-kfcAZVY0.js";
import "./use-upload-DJ5Jkyep.js";
import "./paperclip-DlNbcYXC.js";
import "./upload-DzWX0fqT.js";
import "./image-D7WO1D9q.js";
import "./download-Bxz4emkU.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
function HarvestPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("log");
  const harvestQ = useQuery({
    queryKey: ["harvests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const transportQ = useQuery({
    queryKey: ["harvest-transport", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvest-transport`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const storageQ = useQuery({
    queryKey: ["harvest-storage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvest-storage`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fieldCropQ = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-crops`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const farmQ = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmRecord = farmQ.data?.record ?? null;
  const harvests = harvestQ.data ?? [];
  const transports = transportQ.data ?? [];
  const storages = storageQ.data ?? [];
  const equipment = equipmentQ.data ?? [];
  const fieldCrops = fieldCropQ.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Harvest Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Complete harvest audit trail — machinery used, operator, yield, transport legs, and storage intake. Required for Red Tractor Combinable Crops assessments." }) }),
    (() => {
      const yr = currentCropYear();
      const thisSeasonHarvests = harvests.filter((r) => isInCropYear(r.harvestDate, yr));
      const thisSeasonFields = new Set(thisSeasonHarvests.map((r) => r.field?.name).filter(Boolean)).size;
      const cropYieldMap = {};
      for (const r of thisSeasonHarvests) {
        const cropName = r.crop?.name || "Unknown Crop";
        const variety = r.crop?.variety;
        const key = variety ? `${cropName} (${variety})` : cropName;
        cropYieldMap[key] = (cropYieldMap[key] || 0) + (parseFloat(r.yieldTonnes) || 0);
      }
      const cropYieldEntries = Object.entries(cropYieldMap).sort((a, b) => b[1] - a[1]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 18, color: "#15803d" }), label: `Harvests — ${cropYearLabel(yr)}`, value: thisSeasonHarvests.length, bg: "#f0fdf4", iconBg: "#dcfce7" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dbeafe", borderRadius: 8, padding: 8, flexShrink: 0, alignSelf: "flex-start" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { size: 18, color: "#1d4ed8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 6 }, children: "Yield This Season" }),
            cropYieldEntries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 110, overflowY: "auto" }, children: cropYieldEntries.map(([crop, tonnes]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: crop }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }, children: [
                tonnes.toFixed(1),
                " t"
              ] })
            ] }, crop)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 18, color: "#7c3aed" }), label: "Fields Harvested", value: thisSeasonFields > 0 ? thisSeasonFields : "—", bg: "#f5f3ff", iconBg: "#ede9fe" })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "log", onClick: () => setTab("log"), children: "Harvest Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "dayview", onClick: () => setTab("dayview"), children: "Day View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "transport", onClick: () => setTab("transport"), children: "Transport Legs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "storage", onClick: () => setTab("storage"), children: "Storage Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "print", onClick: () => setTab("print"), children: "Print / Export" })
    ] }),
    tab === "dayview" && /* @__PURE__ */ jsxRuntimeExports.jsx(DayViewTab, { harvests, fieldCrops, loading: harvestQ.isLoading }),
    tab === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      HarvestLogTab,
      {
        harvests,
        transports,
        storages,
        farmRecord,
        equipment,
        fieldCrops,
        farmId,
        loading: harvestQ.isLoading,
        onRefresh: () => qc.invalidateQueries({ queryKey: ["harvests", farmId] }),
        toast
      }
    ),
    tab === "transport" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TransportTab,
      {
        transports,
        harvests,
        farmId,
        loading: transportQ.isLoading,
        onRefresh: () => qc.invalidateQueries({ queryKey: ["harvest-transport", farmId] }),
        toast
      }
    ),
    tab === "storage" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      StorageTab,
      {
        storages,
        harvests,
        farmId,
        loading: storageQ.isLoading,
        onRefresh: () => qc.invalidateQueries({ queryKey: ["harvest-storage", farmId] }),
        toast
      }
    ),
    tab === "print" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrintTab, { harvests, transports, storages, farm: farmRecord })
  ] }) });
}
function StatCard({ icon, label, value, bg, iconBg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8 }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: value })
    ] })
  ] });
}
function HarvestLogTab({ harvests, transports, storages, farmRecord, equipment, fieldCrops, farmId, loading, onRefresh, toast }) {
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map(memberFullName);
  const { displayName: currentUserName } = useUserRole();
  const [search, setSearch] = reactExports.useState("");
  const [filterField, setFilterField] = reactExports.useState("__all__");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [reconcileOpen, setReconcileOpen] = reactExports.useState(true);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const emptyForm = {
    fieldCropAssignmentId: "",
    harvestDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    startTime: "",
    endTime: "",
    equipmentId: "",
    operatorName: "",
    yieldTonnes: "",
    areaHarvestedHa: "",
    moisturePercent: "",
    qualityGrade: "",
    recordedBy: "",
    notes: "",
    isOrganicCertified: false,
    organicCertRef: "",
    salePricePerTonnePence: ""
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const formOpen = addOpen || !!editRecord;
  function openEdit(r) {
    setEditRecord(r);
    setForm({
      fieldCropAssignmentId: r.fieldCropAssignmentId ? String(r.fieldCropAssignmentId) : "",
      harvestDate: r.harvestDate ? r.harvestDate.slice(0, 10) : "",
      startTime: r.startTime || "",
      endTime: r.endTime || "",
      equipmentId: r.equipmentId ? String(r.equipmentId) : "",
      operatorName: r.operatorName || "",
      yieldTonnes: r.yieldTonnes != null ? String(r.yieldTonnes) : "",
      areaHarvestedHa: r.areaHarvestedHa != null ? String(r.areaHarvestedHa) : "",
      moisturePercent: r.moisturePercent != null ? String(r.moisturePercent) : "",
      qualityGrade: r.qualityGrade || "",
      recordedBy: r.recordedBy || "",
      notes: r.notes || "",
      isOrganicCertified: r.isOrganicCertified ?? false,
      organicCertRef: r.organicCertRef ?? "",
      salePricePerTonnePence: r.salePricePerTonnePence ?? ""
    });
  }
  function closeForm() {
    setAddOpen(false);
    setEditRecord(null);
    setForm(emptyForm);
  }
  const [phiViolations, setPhiViolations] = reactExports.useState(null);
  const [pendingPhiBody, setPendingPhiBody] = reactExports.useState(null);
  const createMut = useMutation({
    mutationFn: async (body) => {
      const resp = await fetch(`/api/farms/${farmId}/harvests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (resp.status === 422 && data.error === "phi_violation") {
        return { __phiViolation: true, violations: data.activePhiViolations, pendingBody: body };
      }
      if (!resp.ok) throw new Error("Failed to save");
      return data;
    },
    onSuccess: (data) => {
      if (data?.__phiViolation) {
        setPhiViolations(data.violations);
        setPendingPhiBody(data.pendingBody);
        return;
      }
      toast({ title: "Harvest record saved" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to save harvest record", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/harvests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),
    onSuccess: () => {
      toast({ title: "Harvest record updated" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to update harvest record", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/harvests/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const vehicleEquipment = equipment.filter((e) => VEHICLE_TYPES.has(e.type));
  const strictStorage = !!farmRecord?.harvestStrictStorage;
  const yearHarvests = harvests.filter((r) => isInCropYear(r.harvestDate, cropYear));
  const transportOrphans = yearHarvests.filter((r) => {
    const hasTransport = transports.some((t) => t.harvestRecordId === r.id);
    const hasStorage = storages.some((s) => s.harvestRecordId === r.id);
    return hasTransport && !hasStorage;
  });
  const noMovement = yearHarvests.filter((r) => {
    const hasTransport = transports.some((t) => t.harvestRecordId === r.id);
    const hasStorage = storages.some((s) => s.harvestRecordId === r.id);
    return !hasTransport && !hasStorage;
  });
  const strictNoStorage = strictStorage ? yearHarvests.filter((r) => !storages.some((s) => s.harvestRecordId === r.id)) : [];
  const orphanCount = strictStorage ? strictNoStorage.length : transportOrphans.length + noMovement.length;
  const fieldNamesInYear = Array.from(
    new Set(
      harvests.filter((r) => isInCropYear(r.harvestDate, cropYear)).map((r) => r.field?.name).filter(Boolean)
    )
  ).sort();
  const filtered = harvests.filter((r) => {
    if (!isInCropYear(r.harvestDate, cropYear)) return false;
    if (filterField !== "__all__" && r.field?.name !== filterField) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.field?.name?.toLowerCase().includes(s) || r.crop?.name?.toLowerCase().includes(s) || r.operatorName?.toLowerCase().includes(s) || r.equipment?.name?.toLowerCase().includes(s) || r.qualityGrade?.toLowerCase().includes(s);
  });
  const harvestCropYear = form.harvestDate ? (() => {
    const d = new Date(form.harvestDate);
    return d.getMonth() + 1 >= 8 ? d.getFullYear() + 1 : d.getFullYear();
  })() : null;
  const relevantFieldCrops = harvestCropYear ? fieldCrops.filter((fc) => !fc.year || fc.year === harvestCropYear) : fieldCrops;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 220 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search harvests...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterField, onValueChange: (v) => {
        setFilterField(v);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All fields" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All fields" }),
          fieldNamesInYear.map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: (v) => {
        setCropYear(v);
        setFilterField("__all__");
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm({ ...emptyForm, recordedBy: currentUserName || "" });
        setEditRecord(null);
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Harvest"
      ] })
    ] }),
    yearHarvests.length > 0 && (orphanCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem", border: "1px solid #fcd34d", borderRadius: 10, background: "#fffbeb", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setReconcileOpen((o) => !o),
          style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "none", border: "none", cursor: "pointer", textAlign: "left" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, color: "#d97706" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#92400e" }, children: [
                orphanCount,
                " harvest",
                orphanCount !== 1 ? "s" : "",
                " may be missing records — review needed"
              ] })
            ] }),
            reconcileOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, color: "#92400e" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, color: "#92400e" })
          ]
        }
      ),
      reconcileOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #fde68a", padding: "0.75rem 1rem" }, children: [
        strictStorage ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", marginBottom: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Strict mode is on" }),
            " — every harvest must have a storage record. The following harvests do not:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: strictNoStorage.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#92400e" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { minWidth: 90, color: "#78350f", fontWeight: 500 }, children: fmt(r.harvestDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.field?.name ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#a16207" }, children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.crop?.name ?? "—" }),
            r.yieldTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", color: "#78350f" }, children: [
              Number(r.yieldTonnes).toFixed(2),
              " t"
            ] })
          ] }, r.id)) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          transportOrphans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: noMovement.length > 0 ? "0.75rem" : 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", fontWeight: 600, marginBottom: "0.4rem" }, children: [
              "Transport recorded — no storage intake (",
              transportOrphans.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#92400e", marginBottom: "0.4rem" }, children: "A transport leg has been logged for these harvests but no storage record has been entered. If the crop went direct to a buyer, this can be dismissed. Otherwise, add a storage intake record." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: transportOrphans.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#92400e" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { minWidth: 90, color: "#78350f", fontWeight: 500 }, children: fmt(r.harvestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.field?.name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#a16207" }, children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.crop?.name ?? "—" }),
              r.yieldTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", color: "#78350f" }, children: [
                Number(r.yieldTonnes).toFixed(2),
                " t"
              ] })
            ] }, r.id)) })
          ] }),
          noMovement.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", fontWeight: 600, marginBottom: "0.4rem" }, children: [
              "No movement records at all (",
              noMovement.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#92400e", marginBottom: "0.4rem" }, children: "These harvests have no transport legs and no storage intake — there is no record of where the crop went." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: noMovement.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#92400e" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { minWidth: 90, color: "#78350f", fontWeight: 500 }, children: fmt(r.harvestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.field?.name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#a16207" }, children: "·" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.crop?.name ?? "—" }),
              r.yieldTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", color: "#78350f" }, children: [
                Number(r.yieldTonnes).toFixed(2),
                " t"
              ] })
            ] }, r.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#a16207", marginTop: "0.75rem" }, children: [
          "Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Storage Records" }),
          " tab to log intake, or the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Transport Legs" }),
          " tab to review dispatches.",
          !strictStorage && " If all crop for a harvest went direct to a buyer with no on-farm storage, no action is needed.",
          " ",
          "To change when this warning triggers, adjust ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Require storage record for every harvest" }),
          " in Farm Settings."
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem", padding: "0.625rem 1rem", border: "1px solid #bbf7d0", borderRadius: 10, background: "#f0fdf4" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, color: "#16a34a" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#15803d", fontWeight: 500 }, children: "All harvests in this crop year are reconciled" })
    ] })),
    !loading && filtered.length > 0 && (() => {
      const totalYield = filtered.reduce((s, r) => s + parseFloat(String(r.yieldTonnes || 0)), 0);
      const totalArea = filtered.reduce((s, r) => s + parseFloat(String(r.areaHarvestedHa || 0)), 0);
      const avgYieldPerHa = totalArea > 0 ? totalYield / totalArea : null;
      const moistureRows = filtered.filter((r) => r.moisturePercent);
      const avgMoisture = moistureRows.length > 0 ? moistureRows.reduce((s, r) => s + parseFloat(String(r.moisturePercent)), 0) / moistureRows.length : null;
      const byCrop = {};
      filtered.forEach((r) => {
        const key = r.crop?.name ?? "Unknown";
        if (!byCrop[key]) byCrop[key] = { tonnes: 0, ha: 0 };
        byCrop[key].tonnes += parseFloat(String(r.yieldTonnes || 0));
        byCrop[key].ha += parseFloat(String(r.areaHarvestedHa || 0));
      });
      const cropRows = Object.entries(byCrop).sort((a, b) => b[1].tonnes - a[1].tonnes);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: cropRows.length > 1 ? 10 : 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
              totalYield.toFixed(2),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Area" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
              totalArea.toFixed(2),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "ha" })
            ] })
          ] }),
          avgYieldPerHa !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
              avgYieldPerHa.toFixed(2),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "t/ha" })
            ] })
          ] }),
          avgMoisture !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef9c3", border: "1px solid #fef08a", borderRadius: 8, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#854d0e", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Avg Moisture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: [
              avgMoisture.toFixed(1),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "%" })
            ] })
          ] })
        ] }),
        cropRows.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "6px 14px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em", margin: 0 }, children: "By Crop" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "Crop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#78350f", fontSize: "0.7rem" }, children: "Yield (t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#78350f", fontSize: "0.7rem" }, children: "Area (ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 14px", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.7rem" }, children: "t/ha" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cropRows.map(([crop, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f9fafb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", fontWeight: 500 }, children: crop }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right" }, children: v.tonnes > 0 ? `${v.tonnes.toFixed(2)} t` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right" }, children: v.ha > 0 ? `${v.ha.toFixed(2)} ha` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 14px", textAlign: "right", fontWeight: 600, color: "#92400e" }, children: v.ha > 0 ? (v.tonnes / v.ha).toFixed(2) : "—" })
            ] }, crop)) })
          ] })
        ] })
      ] });
    })(),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 28, color: "#9ca3af" }), title: "No harvests recorded yet", subtitle: "Log your first harvest to begin your Red Tractor audit trail." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["", "Date", "Field", "Crop", "Machinery", "Operator", "Yield (t)", "Moisture %", "Grade", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            style: { borderBottom: "1px solid #f3f4f6", cursor: "pointer" },
            onClick: () => setExpandedId(expandedId === r.id ? null : r.id),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.5rem 0.5rem 0.75rem", width: 24, color: "#9ca3af" }, children: expandedId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }, children: fmt(r.harvestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.field?.name || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.75rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: r.crop?.name || "—" }),
                r.crop?.variety ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75rem" }, children: [
                  " (",
                  r.crop.variety,
                  ")"
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151" }, children: r.equipment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 12, color: "#6b7280" }),
                r.equipment.name,
                r.equipment.registrationNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.7rem" }, children: [
                  "(",
                  r.equipment.registrationNumber,
                  ")"
                ] }) : null
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.operatorName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 600, color: "#166534" }, children: r.yieldTonnes ? `${r.yieldTonnes}t` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.moisturePercent ? `${r.moisturePercent}%` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.qualityGrade ? /* @__PURE__ */ jsxRuntimeExports.jsx(GradeBadge, { grade: r.qualityGrade }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] }) })
            ]
          }
        ),
        expandedId === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#fafafa" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, style: { padding: "0.75rem 1.25rem", borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, fontSize: "0.8rem" }, children: [
          ["Field Ref", r.field?.fieldReference],
          ["Area Harvested", r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : null],
          ["Start Time", r.startTime],
          ["End Time", r.endTime],
          ["Season / Year", r.fieldCropAssignment?.season && r.fieldCropAssignment?.year ? `${r.fieldCropAssignment.season} ${r.fieldCropAssignment.year}` : null],
          ["Equipment Type", r.equipment?.type],
          ["Equipment Serial", r.equipment?.serialNumber],
          ["Recorded By", r.recordedBy],
          ["Notes", r.notes]
        ].map(([k, v]) => v ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", display: "block", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.03em" }, children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151", fontWeight: 500 }, children: v })
        ] }, k) : null) }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) closeForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Harvest Record" : "Log Harvest Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Harvest Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.harvestDate,
                onChange: (e) => {
                  const newDate = e.target.value;
                  const newYear = newDate ? (() => {
                    const d = new Date(newDate);
                    return d.getMonth() + 1 >= 8 ? d.getFullYear() + 1 : d.getFullYear();
                  })() : null;
                  const validIds = newYear ? new Set(fieldCrops.filter((fc) => !fc.year || fc.year === newYear).map((fc) => String(fc.id))) : null;
                  setForm((f) => {
                    const keepSelection = !validIds || validIds.has(f.fieldCropAssignmentId);
                    return {
                      ...f,
                      harvestDate: newDate,
                      fieldCropAssignmentId: keepSelection ? f.fieldCropAssignmentId : "",
                      areaHarvestedHa: keepSelection ? f.areaHarvestedHa : ""
                    };
                  });
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Field & Crop ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.fieldCropAssignmentId,
                onValueChange: (v) => {
                  const fc = relevantFieldCrops.find((x) => String(x.id) === v);
                  const area = fc?.areaHectares ? parseFloat(String(fc.areaHectares)).toFixed(2) : "";
                  setForm((f) => ({ ...f, fieldCropAssignmentId: v, areaHarvestedHa: area }));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: harvestCropYear ? "Select field / crop..." : "Set harvest date first…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: relevantFieldCrops.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-4 text-sm text-muted-foreground text-center", children: [
                    "No crops recorded for the ",
                    harvestCropYear ? `${harvestCropYear - 1}/${String(harvestCropYear).slice(2)} season` : "selected period"
                  ] }) : relevantFieldCrops.map((fc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(fc.id), children: [
                    fc.fieldName || `Field #${fc.fieldId}`,
                    " — ",
                    fc.cropName || `Crop #${fc.cropId}`,
                    fc.year ? ` (${fc.year - 1}/${String(fc.year).slice(2)})` : ""
                  ] }, fc.id)) })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", placeholder: "e.g. 09:30", value: form.startTime, onChange: (e) => setForm((f) => ({ ...f, startTime: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", placeholder: "e.g. 18:00", value: form.endTime, onChange: (e) => setForm((f) => ({ ...f, endTime: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Machinery Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.equipmentId, onValueChange: (v) => setForm((f) => ({ ...f, equipmentId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select machinery..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / not recorded" }),
                vehicleEquipment.map((eq) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(eq.id), children: [
                  eq.name,
                  " ",
                  eq.registrationNumber ? `(${eq.registrationNumber})` : ""
                ] }, eq.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StaffSelect,
              {
                value: form.operatorName,
                onChange: (v) => setForm((f) => ({ ...f, operatorName: v })),
                staffNames,
                loading: membersLoading
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.yieldTonnes, onChange: (e) => setForm((f) => ({ ...f, yieldTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Harvested (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.areaHarvestedHa, onChange: (e) => setForm((f) => ({ ...f, areaHarvestedHa: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: form.moisturePercent, onChange: (e) => setForm((f) => ({ ...f, moisturePercent: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quality Grade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.qualityGrade, onValueChange: (v) => setForm((f) => ({ ...f, qualityGrade: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: QUALITY_GRADE_OPTIONS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.value, children: g.label }, g.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of person completing record", value: form.recordedBy, onChange: (e) => setForm((f) => ({ ...f, recordedBy: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Conditions on day, issues encountered, etc.", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Sale Price (£/tonne) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs font-normal", children: "— optional, for gross margin reporting" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "e.g. 185.00",
                className: "pl-7",
                value: form.salePricePerTonnePence != null && form.salePricePerTonnePence !== "" ? (Number(form.salePricePerTonnePence) / 100).toFixed(2) : "",
                onChange: (e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, salePricePerTonnePence: v === "" ? "" : Math.round(parseFloat(v) * 100) }));
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Used to calculate revenue and gross margin in the Season Production Report." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border-2 p-3 transition-colors ${form.isOrganicCertified ? "border-green-400 bg-green-50" : "border-dashed border-border"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: form.isOrganicCertified ?? false,
                onChange: (e) => setForm((f) => ({ ...f, isOrganicCertified: e.target.checked })),
                className: "w-4 h-4 accent-green-600"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Organic Certified Harvest" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mark this yield as organic — required for Red Tractor organic produce traceability." })
            ] })
          ] }),
          form.isOrganicCertified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Certification Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. SA-CERT-12345 or OF&G operator number",
                value: form.organicCertRef,
                onChange: (e) => setForm((f) => ({ ...f, organicCertRef: e.target.value })),
                className: "mt-1 border-green-300 focus:border-green-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your certifier's reference number for this organic crop — links this harvest to your organic certification record." })
          ] })
        ] })
      ] }),
      editRecord && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "harvest_record", recordId: editRecord.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeForm, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form),
            disabled: !form.fieldCropAssignmentId || !form.harvestDate || createMut.isPending || updateMut.isPending,
            children: editRecord ? updateMut.isPending ? "Saving…" : "Save Changes" : createMut.isPending ? "Saving…" : "Save Harvest Record"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Harvest Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete the harvest record. Transport and storage records linked to it may also be affected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: phiViolations !== null, onOpenChange: (o) => {
      if (!o) {
        setPhiViolations(null);
        setPendingPhiBody(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-amber-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18 }),
        "Pre-Harvest Interval (PHI) Warning"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: "The harvest date falls within the PHI of the following spray applications. Harvesting before the interval expires may breach food safety regulations." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 text-xs font-medium text-gray-500", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 text-xs font-medium text-gray-500", children: "Applied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 text-xs font-medium text-gray-500", children: "PHI (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 text-xs font-medium text-gray-500", children: "Safe From" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: (phiViolations ?? []).map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-red-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-red-800", children: v.productName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-red-700", children: v.applicationDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-red-700", children: v.phiDays }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-semibold text-red-900", children: v.phiExpiry })
          ] }, i)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "If you are certain this harvest is safe (e.g. different crop part, testing done), you may override and save. This will be flagged in your records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setPhiViolations(null);
          setPendingPhiBody(null);
        }, children: "Go Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => {
          if (pendingPhiBody) {
            createMut.mutate({ ...pendingPhiBody, phiOverrideAcknowledged: true });
            setPhiViolations(null);
            setPendingPhiBody(null);
          }
        }, children: "Override & Save Anyway" })
      ] })
    ] }) })
  ] });
}
function TransportTab({ transports, harvests, farmId, loading, onRefresh, toast }) {
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm = {
    harvestRecordId: "",
    vehicleRegistration: "",
    driverName: "",
    weightTonnes: "",
    departureTime: "",
    arrivalTime: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/harvest-transport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),
    onSuccess: () => {
      toast({ title: "Transport leg saved" });
      onRefresh();
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save transport record", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/harvest-transport/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Transport record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(emptyForm);
      setAddOpen(true);
    }, disabled: harvests.length === 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Transport Leg"
    ] }) }),
    harvests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#92400e" }, children: "Log a harvest record first before adding transport legs." }),
    !loading && transports.length > 0 && (() => {
      const totalWeight = transports.reduce((s, r) => s + (r.weightTonnes ? parseFloat(r.weightTonnes) : 0), 0);
      const uniqueVehicles = new Set(transports.map((r) => r.vehicleRegistration).filter(Boolean)).size;
      const uniqueDrivers = new Set(transports.map((r) => r.driverName).filter(Boolean)).size;
      const hasWeight = transports.some((r) => r.weightTonnes);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }, children: [
        { label: "Transport Legs", value: String(transports.length), color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
        ...hasWeight ? [{ label: "Total Weight", value: `${totalWeight.toFixed(2)} t`, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : [],
        ...uniqueVehicles > 0 ? [{ label: "Vehicles", value: String(uniqueVehicles), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }] : [],
        ...uniqueDrivers > 0 ? [{ label: "Drivers", value: String(uniqueDrivers), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }] : []
      ].map(({ label, value, color, bg, border }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 16px", minWidth: 110 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }, children: value })
      ] }, label)) });
    })(),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : transports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 28, color: "#9ca3af" }), title: "No transport legs recorded", subtitle: "Record each vehicle movement from field to store or buyer." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Harvest", "Field", "Crop", "Vehicle Reg.", "Driver", "Weight (t)", "Departure", "Arrival", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: transports.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < transports.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.harvest?.harvestDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.field?.name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151" }, children: r.crop?.name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.vehicleRegistration ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#f3f4f6", color: "#374151", border: "none", fontFamily: "monospace", fontSize: "0.8rem" }, children: r.vehicleRegistration.toUpperCase() }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.driverName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 600, color: "#166534" }, children: r.weightTonnes ? `${r.weightTonnes}t` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }, children: fmtDateTime(r.departureTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }, children: fmtDateTime(r.arrivalTime) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) setForm(emptyForm);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Transport Leg" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Harvest Record ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harvestRecordId, onValueChange: (v) => setForm((f) => ({ ...f, harvestRecordId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select harvest..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: harvests.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
              fmt(h.harvestDate),
              " — ",
              h.field?.name || "Field",
              " / ",
              h.crop?.name || "Crop"
            ] }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Driver Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. John Smith", value: form.driverName, onChange: (e) => setForm((f) => ({ ...f, driverName: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weight Loaded (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.weightTonnes, onChange: (e) => setForm((f) => ({ ...f, weightTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Departure Date / Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.departureTime, onChange: (e) => setForm((f) => ({ ...f, departureTime: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Arrival Date / Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.arrivalTime, onChange: (e) => setForm((f) => ({ ...f, arrivalTime: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Destination, haulier details, etc.", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.harvestRecordId || createMut.isPending, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Transport Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this transport leg?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function StorageTab({ storages, harvests, farmId, loading, onRefresh, toast }) {
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const locationsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const activeLocations = (locationsQ.data?.records ?? []).filter((l) => l.isActive);
  const binsQ = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const bins = Array.isArray(binsQ.data) ? binsQ.data : [];
  const emptyForm = {
    harvestRecordId: "",
    storageFacility: "",
    quantityTonnes: "",
    dateIn: "",
    dateOut: "",
    temperatureC: "",
    moisturePercent: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/harvest-storage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }),
    onSuccess: () => {
      toast({ title: "Storage record saved" });
      onRefresh();
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save storage record", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/harvest-storage/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Storage record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(emptyForm);
      setAddOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Storage Record"
    ] }) }),
    !loading && storages.length > 0 && (() => {
      const totalIntake = storages.reduce((s, r) => s + (r.quantityTonnes ? parseFloat(r.quantityTonnes) : 0), 0);
      const inStore = storages.filter((r) => !r.dateOut).reduce((s, r) => s + (r.quantityTonnes ? parseFloat(r.quantityTonnes) : 0), 0);
      const facilities = new Set(storages.map((r) => r.storageFacility).filter(Boolean)).size;
      const hasQty = storages.some((r) => r.quantityTonnes);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }, children: [
        { label: "Records", value: String(storages.length), color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
        ...hasQty ? [{ label: "Total Intake", value: `${totalIntake.toFixed(2)} t`, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }] : [],
        ...hasQty && inStore > 0 ? [{ label: "Still In Store", value: `${inStore.toFixed(2)} t`, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }] : [],
        ...facilities > 0 ? [{ label: "Facilities Used", value: String(facilities), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }] : []
      ].map(({ label, value, color, bg, border }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 16px", minWidth: 110 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", margin: "0 0 2px" }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 800, color, margin: 0, lineHeight: 1.1 }, children: value })
      ] }, label)) });
    })(),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : storages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { size: 28, color: "#9ca3af" }), title: "No storage records yet", subtitle: "Record where harvested grain or produce is stored, including intake moisture and temperature." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Facility", "Crop", "Quantity (t)", "Date In", "Date Out", "Moisture %", "Temp (°C)", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: storages.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < storages.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.storageFacility }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151" }, children: r.crop?.name || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 600, color: "#7c3aed" }, children: r.quantityTonnes ? `${r.quantityTonnes}t` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.dateIn) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }, children: r.dateOut ? fmt(r.dateOut) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "In store" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.moisturePercent ? `${r.moisturePercent}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.temperatureC != null ? `${r.temperatureC}°C` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) setForm(emptyForm);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Storage Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Harvest (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harvestRecordId, onValueChange: (v) => setForm((f) => ({ ...f, harvestRecordId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select harvest to link..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked to a specific harvest" }),
              harvests.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                fmt(h.harvestDate),
                " — ",
                h.field?.name || "Field",
                " / ",
                h.crop?.name || "Crop"
              ] }, h.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Storage Facility / Location ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.storageFacility || "__none__",
              onValueChange: (v) => setForm((f) => ({ ...f, storageFacility: v === "__none__" ? "" : v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a storage location or bin…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Select a location…" }),
                  activeLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-xs text-muted-foreground font-semibold px-2 py-1", children: "Storage Locations" }),
                    activeLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l.name, children: l.name }, `loc-${l.id}`))
                  ] }),
                  bins.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectGroup, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectLabel, { className: "text-xs text-muted-foreground font-semibold px-2 py-1", children: "Grain Storage Bins" }),
                    bins.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b.binName, children: b.binName }, `bin-${b.id}`))
                  ] }),
                  activeLocations.length === 0 && bins.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__loading__", disabled: true, children: "No locations set up yet" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Manage locations in",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { href: "/storage-locations", className: "underline hover:text-foreground", children: "Storage Locations" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.quantityTonnes, onChange: (e) => setForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture at Intake %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: form.moisturePercent, onChange: (e) => setForm((f) => ({ ...f, moisturePercent: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date In ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.dateIn, onChange: (e) => setForm((f) => ({ ...f, dateIn: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Out (leave blank if still in store)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.dateOut, onChange: (e) => setForm((f) => ({ ...f, dateOut: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature at Intake (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 14.5", value: form.temperatureC, onChange: (e) => setForm((f) => ({ ...f, temperatureC: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Any treatment applied, pest observations, etc.", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(form), disabled: !form.storageFacility || !form.dateIn || createMut.isPending, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Storage Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this storage record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function PrintTab({ harvests, transports, storages, farm }) {
  const printRef = reactExports.useRef(null);
  const [reportType, setReportType] = reactExports.useState("summary");
  const isDetail = reportType === "detail";
  const handlePrint = () => {
    printFromRef(printRef, "Harvest Records — Red Tractor Audit", !isDetail);
  };
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const SECTION_HEAD = {
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#fff",
    background: "#1a3a1a",
    padding: "3px 8px",
    marginBottom: 6,
    borderRadius: 3
  };
  const FIELD_LABEL = { fontSize: "0.68rem", color: "#6b7280", display: "block", marginBottom: 1 };
  const FIELD_VALUE = { fontSize: "0.8rem", fontWeight: 500, color: "#111827" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151" }, children: "Format" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: "1px solid #d1d5db" }, children: ["summary", "detail"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setReportType(type),
            style: {
              padding: "5px 14px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              background: reportType === type ? "#1a3a1a" : "#fff",
              color: reportType === type ? "#fff" : "#374151",
              border: "none",
              borderRight: type === "summary" ? "1px solid #d1d5db" : "none"
            },
            children: type === "summary" ? "Summary Table" : "Full Detail Report"
          },
          type
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: isDetail ? "Portrait A4 · full card per harvest record (includes equipment serial, season, notes)" : "Landscape A4 · one row per harvest record" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handlePrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        "Print / Export PDF"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "2rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: "1.125rem", fontWeight: 700, borderBottom: "2px solid #333", paddingBottom: 8, marginBottom: 4 }, children: [
        "Harvest Records — Red Tractor Compliance Report",
        isDetail ? " (Full Detail)" : ""
      ] }),
      farm && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#111827", marginBottom: 2 }, children: [
        farm.name,
        farm.cphNumber ? ` · CPH: ${farm.cphNumber}` : "",
        farm.redTractorId ? ` · Red Tractor ID: ${farm.redTractorId}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: "1.5rem" }, children: [
        "Printed: ",
        today,
        "  |  BDE Farm Trac"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "0.9rem", fontWeight: 600, color: "#166534", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }, children: [
        "Harvest Log (",
        harvests.length,
        " records)"
      ] }),
      harvests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }, children: "No harvests recorded." }) : isDetail ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: harvests.map((r, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "record-card", style: {
        border: "1px solid #d1d5db",
        borderRadius: 6,
        marginBottom: 14,
        pageBreakInside: "avoid",
        breakInside: "avoid",
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f3f4f6", borderBottom: "1px solid #d1d5db", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.85rem", color: "#111827" }, children: [
            "#",
            idx + 1,
            "  ",
            fmt(r.harvestDate),
            " — ",
            r.field?.name || "Unknown Field",
            " — ",
            r.crop?.name || "Unknown Crop",
            r.crop?.variety ? ` (${r.crop.variety})` : ""
          ] }),
          r.qualityGrade && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: gradeColors(r.qualityGrade).bg, color: gradeColors(r.qualityGrade).color, border: "1px solid #e5e7eb" }, children: [
            "Grade: ",
            gradeLabel(r.qualityGrade)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: SECTION_HEAD, children: "Harvest Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }, children: [
              ["Date", fmt(r.harvestDate)],
              ["Field", r.field?.name || "—"],
              ["Field Reference", r.field?.fieldReference || "—"],
              ["Season / Year", r.fieldCropAssignment?.season && r.fieldCropAssignment?.year ? `${r.fieldCropAssignment.season} ${r.fieldCropAssignment.year}` : "—"],
              ["Crop", r.crop?.name || "—"],
              ["Variety", r.crop?.variety || "—"]
            ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_LABEL, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_VALUE, children: value })
            ] }, label)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: SECTION_HEAD, children: "Harvest Results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }, children: [
              ["Yield (t)", r.yieldTonnes ? `${r.yieldTonnes} t` : "—"],
              ["Area Harvested", r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : "—"],
              ["Start Time", r.startTime || "—"],
              ["End Time", r.endTime || "—"],
              ["Moisture %", r.moisturePercent ? `${r.moisturePercent}%` : "—"],
              ["Quality Grade", gradeLabel(r.qualityGrade)]
            ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_LABEL, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_VALUE, children: value })
            ] }, label)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: SECTION_HEAD, children: "Equipment Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }, children: [
              ["Machine Name", r.equipment?.name || "—"],
              ["Type", r.equipment?.type || "—"],
              ["Registration", r.equipment?.registrationNumber || "—"],
              ["Serial Number", r.equipment?.serialNumber || "—"]
            ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_LABEL, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_VALUE, children: value })
            ] }, label)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: SECTION_HEAD, children: "Personnel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }, children: [
              ["Operator", r.operatorName || "—"],
              ["Recorded By", r.recordedBy || "—"]
            ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_LABEL, children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: FIELD_VALUE, children: value })
            ] }, label)) }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: SECTION_HEAD, children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.5 }, children: r.notes })
            ] })
          ] })
        ] })
      ] }, r.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f3f4f6" }, children: ["Date", "Field", "Crop / Variety", "Machinery", "Operator", "Yield (t)", "Area (ha)", "Moisture %", "Grade", "Recorded By"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #d1d5db" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: harvests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb", whiteSpace: "nowrap" }, children: fmt(r.harvestDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: [
            r.field?.name,
            r.field?.fieldReference ? ` (${r.field.fieldReference})` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: [
            r.crop?.name,
            r.crop?.variety ? ` — ${r.crop.variety}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.equipment ? `${r.equipment.name}${r.equipment.registrationNumber ? ` (${r.equipment.registrationNumber})` : ""}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.operatorName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.yieldTonnes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.areaHarvestedHa || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.moisturePercent ? `${r.moisturePercent}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: gradeLabel(r.qualityGrade) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #e5e7eb" }, children: r.recordedBy || "—" })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "0.9rem", fontWeight: 600, color: "#1d4ed8", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }, children: [
        "Transport Records (",
        transports.length,
        " legs)"
      ] }),
      transports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }, children: "No transport legs recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#eff6ff" }, children: ["Harvest Date", "Field / Crop", "Vehicle Reg.", "Driver", "Weight (t)", "Departure", "Arrival", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #bfdbfe" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: transports.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }, children: fmt(r.harvest?.harvestDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe" }, children: [
            r.field?.name,
            " / ",
            r.crop?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe", fontFamily: "monospace" }, children: r.vehicleRegistration?.toUpperCase() || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe" }, children: r.driverName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe" }, children: r.weightTonnes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }, children: fmtDateTime(r.departureTime) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe", whiteSpace: "nowrap" }, children: fmtDateTime(r.arrivalTime) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #dbeafe" }, children: r.notes || "—" })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "0.9rem", fontWeight: 600, color: "#7c3aed", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8, marginTop: 20 }, children: [
        "Storage Records (",
        storages.length,
        " entries)"
      ] }),
      storages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#9ca3af", marginBottom: 16 }, children: "No storage records recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.8rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f5f3ff" }, children: ["Facility", "Crop", "Quantity (t)", "Moisture %", "Temp (°C)", "Date In", "Date Out", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 8px", textAlign: "left", fontSize: "0.72rem", border: "1px solid #ddd6fe" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: storages.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.storageFacility }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.crop?.name || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.quantityTonnes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.moisturePercent ? `${r.moisturePercent}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.temperatureC != null ? `${r.temperatureC}°C` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe", whiteSpace: "nowrap" }, children: fmt(r.dateIn) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe", whiteSpace: "nowrap" }, children: r.dateOut ? fmt(r.dateOut) : "In store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", border: "1px solid #ede9fe" }, children: r.notes || "—" })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 32, fontSize: "0.72rem", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 8 }, children: [
        "Generated by BDE Farm Trac — Red Tractor Compliance Platform  |  Printed ",
        today
      ] })
    ] })
  ] });
}
function DayViewTab({ harvests, fieldCrops, loading }) {
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = reactExports.useState(todayStr);
  const dayRecords = harvests.filter((r) => {
    if (!r.harvestDate) return false;
    return new Date(r.harvestDate).toISOString().slice(0, 10) === selectedDate;
  });
  const totalHa = dayRecords.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const totalTonnes = dayRecords.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const avgMoisture = dayRecords.filter((r) => r.moisturePercent).length ? dayRecords.filter((r) => r.moisturePercent).reduce((s, r) => s + parseFloat(r.moisturePercent), 0) / dayRecords.filter((r) => r.moisturePercent).length : null;
  const avgYieldHa = totalHa > 0 ? totalTonnes / totalHa : null;
  const displayDate = (/* @__PURE__ */ new Date(selectedDate + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isToday = selectedDate === todayStr;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }, children: "Select Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: selectedDate,
            onChange: (e) => setSelectedDate(e.target.value),
            style: { border: "1px solid #d1d5db", borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: "0.875rem", background: "#fff", color: "#111827" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { paddingTop: 18 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedDate(todayStr),
          style: {
            background: isToday ? "#dcfce7" : "#f3f4f6",
            color: isToday ? "#166534" : "#374151",
            border: "none",
            borderRadius: 8,
            padding: "0.4rem 0.9rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer"
          },
          children: "Today"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { paddingTop: 18, marginLeft: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: displayDate }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : dayRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 28, color: "#9ca3af" }),
        title: `No harvest activity on ${displayDate}`,
        subtitle: "Select a different date or log a harvest for this day."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "Fields Cut", value: dayRecords.length.toString(), color: "#15803d", bg: "#f0fdf4", iconBg: "#dcfce7" },
        { label: "Total Area", value: `${totalHa.toFixed(1)} ha`, color: "#1d4ed8", bg: "#eff6ff", iconBg: "#dbeafe" },
        { label: "Total Yield", value: `${totalTonnes.toFixed(1)} t`, color: "#7c3aed", bg: "#f5f3ff", iconBg: "#ede9fe" },
        { label: avgMoisture !== null ? "Avg Moisture" : "Yield / ha", value: avgMoisture !== null ? `${avgMoisture.toFixed(1)}%` : avgYieldHa !== null ? `${avgYieldHa.toFixed(2)} t/ha` : "—", color: "#92400e", bg: "#fffbeb", iconBg: "#fef3c7" }
      ].map(({ label, value, color, bg, iconBg }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color }, children: value })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }, children: dayRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, color: "#111827", fontSize: "0.95rem" }, children: r.field?.name || "Unknown Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }, children: [
              r.crop?.name || "Unknown Crop",
              r.crop?.variety ? ` · ${r.crop.variety}` : ""
            ] })
          ] }),
          r.qualityGrade && /* @__PURE__ */ jsxRuntimeExports.jsx(GradeBadge, { grade: r.qualityGrade })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          ["Area Harvested", r.areaHarvestedHa ? `${parseFloat(r.areaHarvestedHa).toFixed(2)} ha` : "—"],
          ["Yield", r.yieldTonnes ? `${r.yieldTonnes} t` : "—"],
          ["Moisture", r.moisturePercent ? `${r.moisturePercent}%` : "—"],
          ["Yield / ha", r.yieldTonnes && r.areaHarvestedHa ? `${(parseFloat(r.yieldTonnes) / parseFloat(r.areaHarvestedHa)).toFixed(2)} t/ha` : "—"],
          ["Operator", r.operatorName || "—"],
          ["Machinery", r.equipment?.name || "—"]
        ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af", display: "block", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }, children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#374151", fontWeight: 500 }, children: v })
        ] }, k)) }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 10, fontSize: "0.78rem", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 8 }, children: r.notes })
      ] }, r.id)) })
    ] })
  ] });
}
function GradeBadge({ grade }) {
  const { bg, color } = gradeColors(grade);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: bg, color, border: "none", fontSize: "0.72rem" }, children: gradeLabel(grade) });
}
function EmptyState({ icon, title, subtitle }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400 }, children: subtitle })
  ] });
}
export {
  HarvestPage as default
};
