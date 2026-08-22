import { b as useAppStore, j as jsxRuntimeExports, B as Building2, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, d as Button, T as Plus, A as ArrowRight, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter, X } from "./index-uoBfD7uJ.js";
import { O as OtherSelect } from "./other-select-DhITh1_C.js";
import { u as useLookupStrings } from "./use-lookup-DJh9EODN.js";
import { u as usePersistedTab } from "./use-persisted-tab-CDNPMQ_h.js";
import { u as usePersistedNumberFilter } from "./use-persisted-filter-DSGukHQi.js";
import { A as AppLayout, c as ClipboardList, a as Wheat, j as Truck } from "./AppLayout-Th9yEQgX.js";
import { T as Textarea } from "./textarea-DgGI5Ulj.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BAzxQJMw.js";
import { B as Badge } from "./badge-Bbth6g0q.js";
import { T as TabBar, a as TabButton } from "./tab-button-DJP0Ypp_.js";
import { u as useUpload } from "./use-upload-Bs6x-Xk1.js";
import { u as useFarmMembers } from "./use-farm-members-D8WJgweX.js";
import { S as StaffSelect } from "./staff-select-CpPeUlvo.js";
import { B as BuyerCombobox } from "./BuyerCombobox-CUvkOJtm.js";
import { A as ArrowUpRight } from "./arrow-up-right-40KhuPY-.js";
import { A as ArrowLeftRight } from "./arrow-left-right-DNmMUcHi.js";
import { R as Receipt } from "./receipt-Cs84LF87.js";
import { C as CircleCheck } from "./circle-check-DMjE0lB2.js";
import { F as FileText } from "./shield-alert-CBn4jDFy.js";
import { C as ChevronUp } from "./chevron-up-BROwJheH.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-CxXONSuN.js";
import { P as Pencil } from "./pencil-ChPyIfdL.js";
import { P as Paperclip } from "./paperclip-DzcYvN8H.js";
import { E as Eye } from "./eye-B4a4zbq1.js";
import { I as Image } from "./image-BN0TtDsx.js";
import { F as FileDown } from "./file-down-D5YLtDxm.js";
import "./use-safe-clerk-D3Lbsmpk.js";
import "./database-BlGS8vws.js";
import "./triangle-alert-CGAkeA0A.js";
import "./shield-check-B0_-StyV.js";
import "./tractor-DuPAW5hT.js";
import "./index-BrcKlao2.js";
import "./index-CWdiWDrJ.js";
import "./popover--uLYU1Az.js";
import "./command-Bf2QByDC.js";
import "./search-1glHRZZ6.js";
import "./chevrons-up-down-BhpJfWK8.js";
import "./user-plus-CBdJnQoS.js";
const DISPATCH_STATUSES = [
  { value: "booked", label: "Booked", bg: "#eff6ff", color: "#1e40af" },
  { value: "in-transit", label: "In Transit", bg: "#fef3c7", color: "#92400e" },
  { value: "dispatched", label: "Dispatched", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  { value: "cancelled", label: "Cancelled", bg: "#f3f4f6", color: "#6b7280" }
];
const GRAIN_COMMODITIES = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Malting Barley",
  "Winter Oats",
  "Spring Oats",
  "Oilseed Rape",
  "Winter Beans",
  "Spring Beans",
  "Peas",
  "Maize",
  "Rye",
  "Triticale",
  "Linseed",
  "Other"
];
const LOAD_TYPES = ["Grain", "Straw", "Silage", "Fertiliser", "Machinery", "Waste", "Other"];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtCost = (pence) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};
const F = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
] });
function StatusBadge({ status }) {
  const s = DISPATCH_STATUSES.find((d) => d.value === status) ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: s.bg, color: s.color, border: "none", fontSize: "0.7rem" }, children: s.label });
}
function BuyerSelect({ farmId, valueId, valueName, onChange }) {
  const q = useQuery({
    queryKey: ["buyers", farmId, "grain_merchant,merchant,customer"],
    queryFn: () => fetch(`/api/farms/${farmId}/buyers?types=grain_merchant,merchant,customer`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const buyers = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Select,
    {
      value: valueId ? String(valueId) : "__none__",
      onValueChange: (v) => {
        if (v === "__none__") {
          onChange(null, "");
          return;
        }
        const buyer = buyers.find((b) => String(b.id) === v);
        onChange(buyer?.id ?? null, buyer?.name ?? "");
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select buyer / merchant..." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select buyer —" }),
          buyers.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.id), children: b.name }, b.id))
        ] })
      ]
    }
  );
}
function BinSelect({ farmId, value, onChange, placeholder }) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.rows ?? d.records ?? []
  });
  const bins = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Select,
    {
      value: value ? String(value) : "__none__",
      onValueChange: (v) => {
        if (v === "__none__") {
          onChange(null, "");
          return;
        }
        const bin = bins.find((b) => String(b.id) === v);
        onChange(bin?.id ?? null, bin?.binName ?? "");
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: placeholder ?? "Select bin / store..." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
          bins.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(b.id), children: [
            b.binName,
            b.binType ? ` (${b.binType})` : ""
          ] }, b.id))
        ] })
      ]
    }
  );
}
function LinkedMovementsPanel({ farmId, recordId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["linked-livestock-movements", farmId, recordId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage/${recordId}/linked-livestock-movements`).then((r) => r.json())
  });
  const records = data?.records ?? [];
  if (isLoading || records.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", fontWeight: 700, color: "#1e40af", marginBottom: 8 }, children: [
      "Linked Livestock Movements (",
      records.length,
      ")"
    ] }),
    records.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 4, borderBottom: "1px solid #dbeafe", marginBottom: 4 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#1d4ed8" }, children: [
          m.species || "Livestock",
          " — ",
          m.numberOfAnimals ?? "?",
          " animals"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280", marginLeft: 8 }, children: [
          m.fromLocation || "?",
          " → ",
          m.toLocation || "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: m.checklistCompletedAt ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#dcfce7", color: "#166534", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }, children: "✓ Checklist signed" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", borderRadius: 10, padding: "1px 7px" }, children: "Checklist pending" }) })
    ] }, m.id))
  ] });
}
function DispatchesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", GRAIN_COMMODITIES);
  const loadTypes = useLookupStrings("load_types", LOAD_TYPES);
  const [yearFilter, setYearFilter] = usePersistedNumberFilter({ page: "haulage-dispatches", filter: "year", farmId, defaultValue: (/* @__PURE__ */ new Date()).getFullYear() });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [confirmId, setConfirmId] = reactExports.useState(null);
  const [confirmRecord, setConfirmRecord] = reactExports.useState(null);
  const [confirmForm, setConfirmForm] = reactExports.useState({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" });
  const [proofFile, setProofFile] = reactExports.useState(null);
  const proofInputRef = reactExports.useRef(null);
  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onSuccess: (res) => {
      setConfirmForm((f) => ({ ...f, proofOfDeliveryUrl: res.objectPath }));
    },
    onError: () => toast({ title: "File upload failed", variant: "destructive" })
  });
  const emptyForm = {
    movementType: "farm_exit_dispatch",
    loadType: "",
    loadDescription: "",
    commodity: "",
    variety: "",
    grade: "",
    moisturePercent: "",
    specificWeightKgHl: "",
    weighbridgeTicketNo: "",
    binId: null,
    binName: "",
    buyerId: null,
    buyerName: "",
    customerRef: "",
    haulierRegisteredId: null,
    haulierCompany: "",
    haulierSupplierId: null,
    deliveryStatus: "booked",
    weightTonnes: "",
    vehicleRegistration: "",
    driverName: "",
    origin: "",
    destination: "",
    departureDate: "",
    arrivalDate: "",
    waybillNumber: "",
    invoiceRef: "",
    costPence: "",
    notes: "",
    dispatchPlanId: null
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((r) => r.movementType !== "on_farm_transfer")
  });
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const plansQ = useQuery({
    queryKey: ["dispatch-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((p) => p.status !== "cancelled" && p.status !== "complete")
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });
  const { data: dispMembersData, isLoading: dispMembersLoading } = useFarmMembers(farmId);
  const dispStaffNames = (dispMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const saveMut = useMutation({
    mutationFn: (body) => {
      const payload = {
        ...body,
        movementType: "farm_exit_dispatch",
        costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null,
        weightTonnes: body.weightTonnes || null,
        moisturePercent: body.moisturePercent || null,
        specificWeightKgHl: body.specificWeightKgHl || null,
        binId: body.binId || null,
        buyerId: body.buyerId || null,
        haulierRegisteredId: body.haulierRegisteredId || null
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/haulage/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/haulage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Dispatch updated" : "Dispatch recorded" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }).then(async (r) => {
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
  const confirmMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/haulage/${id}/confirm-dispatch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Dispatch confirmed — stock deducted from bin" });
      invalidate();
      setConfirmId(null);
      setConfirmRecord(null);
      setConfirmForm({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" });
      setProofFile(null);
    },
    onError: () => toast({ title: "Failed to confirm dispatch", variant: "destructive" })
  });
  const allRecords = q.data ?? [];
  const hauliers = hauliersQ.data ?? [];
  const activePlans = plansQ.data ?? [];
  const years = reactExports.useMemo(() => {
    const ys = new Set(allRecords.map((r) => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add((/* @__PURE__ */ new Date()).getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [allRecords]);
  const records = reactExports.useMemo(
    () => allRecords.filter((r) => r.departureDate?.startsWith(String(yearFilter))),
    [allRecords, yearFilter]
  );
  const totalWeightT = reactExports.useMemo(
    () => records.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0),
    [records]
  );
  const totalCostPence = reactExports.useMemo(
    () => records.reduce((s, r) => s + (r.costPence ?? 0), 0),
    [records]
  );
  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ ...r, departureDate: r.departureDate?.slice(0, 10) ?? "", arrivalDate: r.arrivalDate?.slice(0, 10) ?? "", costPence: r.costPence ? (r.costPence / 100).toFixed(2) : "" });
    setAddOpen(true);
  };
  const isGrain = (f) => f.loadType === "Grain" || GRAIN_COMMODITIES.includes(f.commodity);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Crop and commodity dispatches leaving the farm — stock deducted on confirmation." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(yearFilter), onValueChange: (v) => setYearFilter(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 96 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 14, className: "mr-1" }),
          "Record Dispatch"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : allRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No dispatches recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record crop dispatches leaving the farm — grain, straw, or other commodities sent to merchants or customers." })
    ] }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, color: "#374151" }, children: [
        "No dispatches in ",
        yearFilter
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Try selecting a different year, or record a new dispatch." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Load", "Commodity", "Buyer / Merchant", "Weight (t)", "Source Bin", "Waybill", "Vehicle", "Status", "Cost", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.departureDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: r.loadType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: r.commodity || r.loadDescription || "—" }),
          r.variety && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: r.variety })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
          r.destination ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: r.destination }) : "—",
          r.customerRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
            "Ref: ",
            r.customerRef
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.weightTonnes ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.storageLocation || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.waybillNumber || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.vehicleRegistration || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.deliveryStatus ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.deliveryStatus }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmtCost(r.costPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }, children: [
          !r.deliveryConfirmedAt && r.deliveryStatus !== "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setConfirmId(r.id);
                setConfirmRecord(r);
                setConfirmForm({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" });
                setProofFile(null);
              },
              style: { display: "inline-flex", alignItems: "center", gap: 4, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", padding: "3px 8px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" },
              title: "Confirm receipt at destination & deduct stock",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
                "Confirm Receipt"
              ]
            }
          ),
          r.deliveryConfirmedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              title: `Confirmed ${new Date(r.deliveryConfirmedAt).toLocaleDateString("en-GB")}${r.deliveryConfirmedBy ? ` by ${r.deliveryConfirmedBy}` : ""}${r.proofOfDeliveryUrl ? " · Proof attached" : ""}`,
              style: { display: "inline-flex", alignItems: "center", gap: 3, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 7px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
                "Stock Deducted",
                r.proofOfDeliveryUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 11, style: { marginLeft: 2 } })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] }) })
      ] }, r.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderTop: "2px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 4, style: { padding: "0.625rem 0.875rem", fontWeight: 600, fontSize: "0.8rem", color: "#6b7280" }, children: [
          records.length,
          " dispatch",
          records.length !== 1 ? "es" : "",
          " · ",
          yearFilter
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }, children: totalWeightT > 0 ? `${totalWeightT.toFixed(2)} t` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }, children: totalCostPence > 0 ? fmtCost(totalCostPence) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setConfirmId(null);
        setConfirmRecord(null);
        setProofFile(null);
        confirmMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirm Receipt at Destination" }) }),
      confirmRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600 }, children: confirmRecord.commodity || confirmRecord.loadType }),
        confirmRecord.destination ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " → ",
          confirmRecord.destination
        ] }) : null,
        confirmRecord.weightTonnes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
          " · ",
          parseFloat(confirmRecord.weightTonnes).toFixed(2),
          " t (estimated)"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: "This will record delivery confirmation and deduct stock from the source bin. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Confirmed By ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your name", value: confirmForm.confirmedBy, onChange: (e) => setConfirmForm((f) => ({ ...f, confirmedBy: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weighbridge Weight (t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "Actual delivered", value: confirmForm.weighbridgeWeightTonnes, onChange: (e) => setConfirmForm((f) => ({ ...f, weighbridgeWeightTonnes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "e.g. Weighbridge ticket ref, any discrepancies…", value: confirmForm.notes, onChange: (e) => setConfirmForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Proof of Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginBottom: 6 }, children: "Attach a photo of the weighbridge ticket, text message, or any confirmation received from the destination." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: proofInputRef,
              type: "file",
              accept: "image/*,application/pdf,.jpg,.jpeg,.png,.pdf,.heic,.webp",
              style: { display: "none" },
              onChange: async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setProofFile(file);
                await uploadFile(file);
              }
            }
          ),
          !proofFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => proofInputRef.current?.click(),
              style: { width: "100%", border: "2px dashed #d1d5db", borderRadius: 8, padding: "0.875rem", background: "#fafafa", cursor: "pointer", color: "#6b7280", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 14 }),
                " Click to attach file"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #d1fae5", borderRadius: 8, padding: "0.625rem 0.875rem", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#374151", minWidth: 0 }, children: [
              proofFile.type.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 14, style: { color: "#16a34a", flexShrink: 0 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14, style: { color: "#16a34a", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: proofFile.name }),
              isUploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", flexShrink: 0 }, children: [
                "(",
                uploadProgress,
                "%)"
              ] }),
              !isUploading && confirmForm.proofOfDeliveryUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#16a34a", flexShrink: 0 }, children: "✓ Uploaded" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setProofFile(null);
              setConfirmForm((f) => ({ ...f, proofOfDeliveryUrl: "" }));
              if (proofInputRef.current) proofInputRef.current.value = "";
            }, style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2, flexShrink: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: confirmMut, message: "Failed to confirm — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setConfirmId(null);
          setConfirmRecord(null);
          setProofFile(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            style: { background: "#16a34a", color: "#fff" },
            onClick: () => confirmId !== null && confirmMut.mutate({
              id: confirmId,
              body: {
                confirmedBy: confirmForm.confirmedBy,
                notes: confirmForm.notes,
                ...confirmForm.weighbridgeWeightTonnes ? { weighbridgeWeightTonnes: parseFloat(confirmForm.weighbridgeWeightTonnes) } : {},
                ...confirmForm.proofOfDeliveryUrl ? { proofOfDeliveryUrl: confirmForm.proofOfDeliveryUrl } : {}
              }
            }),
            disabled: !confirmForm.confirmedBy || isUploading || confirmMut.isPending,
            children: confirmMut.isPending ? "Confirming…" : isUploading ? `Uploading… ${uploadProgress}%` : "Confirm Receipt"
          }
        )
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Dispatch Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Departure Date", value: fmt(viewRecord.departureDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Load Type", value: viewRecord.loadType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Status", value: viewRecord.deliveryStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Commodity", value: viewRecord.commodity || viewRecord.loadDescription }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Variety", value: viewRecord.variety }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Grade", value: viewRecord.grade })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Weight (t)", value: viewRecord.weightTonnes != null ? String(viewRecord.weightTonnes) : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Moisture %", value: viewRecord.moisturePercent != null ? `${viewRecord.moisturePercent}%` : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Sp. Weight (kg/hl)", value: viewRecord.specificWeightKgHl != null ? String(viewRecord.specificWeightKgHl) : null })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Buyer / Destination", value: viewRecord.destination }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Customer Ref", value: viewRecord.customerRef })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Source Bin / Store", value: viewRecord.storageLocation }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Weighbridge Ticket", value: viewRecord.weighbridgeTicketNo })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Vehicle Reg.", value: viewRecord.vehicleRegistration }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Driver", value: viewRecord.driverName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Haulier", value: viewRecord.haulierCompany })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Waybill", value: viewRecord.waybillNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Invoice Ref", value: viewRecord.invoiceRef }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Cost", value: fmtCost(viewRecord.costPence) })
        ] }),
        viewRecord.deliveryConfirmedAt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dcfce7", borderRadius: 8, padding: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, style: { color: "#16a34a", flexShrink: 0, marginTop: 2 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#166534", fontWeight: 600 }, children: [
              "Stock Deducted — confirmed ",
              fmt(viewRecord.deliveryConfirmedAt),
              viewRecord.deliveryConfirmedBy ? ` by ${viewRecord.deliveryConfirmedBy}` : ""
            ] }),
            viewRecord.weighbridgeWeightTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#16a34a", marginTop: 2 }, children: [
              "Weighbridge weight: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                parseFloat(viewRecord.weighbridgeWeightTonnes).toFixed(2),
                " t"
              ] }),
              viewRecord.weightTonnes && Math.abs(parseFloat(viewRecord.weighbridgeWeightTonnes) - parseFloat(viewRecord.weightTonnes)) > 0.01 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#92400e" }, children: [
                " (estimated was ",
                parseFloat(viewRecord.weightTonnes).toFixed(2),
                " t)"
              ] }) : null
            ] }),
            viewRecord.deliveryConfirmationNotes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151", marginTop: 2 }, children: viewRecord.deliveryConfirmationNotes }),
            viewRecord.proofOfDeliveryUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", fontWeight: 600, color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }, children: "Proof of Delivery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `/api/storage${viewRecord.proofOfDeliveryUrl}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", color: "#166534", textDecoration: "none", fontWeight: 500 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { size: 13 }),
                    " View attachment"
                  ]
                }
              )
            ] })
          ] })
        ] }) }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Notes", value: viewRecord.notes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LinkedMovementsPanel, { farmId, recordId: viewRecord.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", style: { gap: 6 }, onClick: async () => {
          const win = window.open("", "_blank");
          try {
            const resp = await fetch(`/api/farms/${farmId}/haulage/${viewRecord.id}/dispatch-note`);
            if (!resp.ok) throw new Error("failed");
            const html = await resp.text();
            if (win) {
              win.document.write(html);
              win.document.close();
              win.addEventListener("afterprint", () => win.close());
              win.print();
            }
          } catch {
            if (win) win.close();
          }
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { size: 14 }),
          " Dispatch Note"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEdit(r);
        }, children: "Edit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Dispatch" : "Record Dispatch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        activePlans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { color: "#166534" }, children: "Link to Dispatch Plan (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.dispatchPlanId ? String(form.dispatchPlanId) : "__none__",
              onValueChange: (v) => {
                if (v === "__none__") {
                  setForm((f) => ({ ...f, dispatchPlanId: null }));
                  return;
                }
                const plan = activePlans.find((p) => String(p.id) === v);
                if (!plan) return;
                setForm((f) => ({
                  ...f,
                  dispatchPlanId: plan.id,
                  loadType: plan.loadType || f.loadType,
                  commodity: plan.commodity || f.commodity,
                  destination: plan.destination || f.destination,
                  haulierRegisteredId: plan.haulierId || f.haulierRegisteredId,
                  haulierCompany: plan.haulierName || (plan.haulierId ? hauliers.find((h) => h.id === plan.haulierId)?.companyName : f.haulierCompany) || f.haulierCompany,
                  customerRef: plan.buyerRef || f.customerRef
                }));
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { marginTop: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a plan to link this load…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No plan (standalone load) —" }),
                  activePlans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
                    p.planRef ? `[${p.planRef}] ` : "",
                    p.title,
                    " — ",
                    p.plannedDate
                  ] }, p.id))
                ] })
              ]
            }
          ),
          form.dispatchPlanId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#166534", marginTop: 4 }, children: "Destination, haulier, and commodity pre-filled from plan where available." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Departure Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.departureDate, onChange: (e) => setForm((f) => ({ ...f, departureDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Arrival / Expected Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.arrivalDate, onChange: (e) => setForm((f) => ({ ...f, arrivalDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Load Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              OtherSelect,
              {
                options: loadTypes,
                value: form.loadType,
                onValueChange: (v) => setForm((f) => ({ ...f, loadType: v })),
                placeholder: "Select type...",
                specifyPlaceholder: "Specify load type…"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weight (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.weightTonnes, onChange: (e) => setForm((f) => ({ ...f, weightTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.deliveryStatus, onValueChange: (v) => setForm((f) => ({ ...f, deliveryStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DISPATCH_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] })
        ] }),
        isGrain(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }, children: "Crop Quality" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.commodity, onValueChange: (v) => setForm((f) => ({ ...f, commodity: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select commodity..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: commodityTypes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. KWS Zyatt, Skyfall", value: form.variety, onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Group 1, Feed", value: form.grade, onChange: (e) => setForm((f) => ({ ...f, grade: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", max: "40", value: form.moisturePercent, onChange: (e) => setForm((f) => ({ ...f, moisturePercent: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sp. Weight (kg/hl)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.specificWeightKgHl, onChange: (e) => setForm((f) => ({ ...f, specificWeightKgHl: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weighbridge Ticket No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WB-2025-00123", value: form.weighbridgeTicketNo, onChange: (e) => setForm((f) => ({ ...f, weighbridgeTicketNo: e.target.value })), style: { fontFamily: "monospace" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Bin / Store Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: form.binId, onChange: (id, name) => setForm((f) => ({ ...f, binId: id, storageLocation: name })) })
            ] })
          ] })
        ] }),
        !isGrain(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Load Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 200 bales barley straw", value: form.loadDescription, onChange: (e) => setForm((f) => ({ ...f, loadDescription: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Bin / Store" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: form.binId, onChange: (id, name) => setForm((f) => ({ ...f, binId: id, storageLocation: name })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }, children: "Buyer / Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer / Merchant" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerSelect, { farmId, valueId: form.buyerId, valueName: form.buyerName, onChange: (id, name) => setForm((f) => ({ ...f, buyerId: id, buyerName: name, destination: name || f.destination })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Contract / order ref", value: form.customerRef, onChange: (e) => setForm((f) => ({ ...f, customerRef: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3", style: { marginTop: "0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination (merchant store / location)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Gleadell Agriculture Ltd — Bury St Edmunds", value: form.destination, onChange: (e) => setForm((f) => ({ ...f, destination: e.target.value })) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }, children: "Transport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Driver Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.driverName, onChange: (v) => setForm((f) => ({ ...f, driverName: v })), staffNames: dispStaffNames, loading: dispMembersLoading })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier Company" }),
              hauliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.haulierCompany || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, haulierCompany: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select haulier..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                  hauliers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.companyName, children: h.companyName }, h.id))
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.haulierSupplierId ?? null, valueName: form.haulierCompany, onChange: (id, name) => setForm((f) => ({ ...f, haulierSupplierId: id, haulierCompany: name })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waybill / Docket Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.waybillNumber, onChange: (e) => setForm((f) => ({ ...f, waybillNumber: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Origin (farm / field)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Home Farm, Barn 2", value: form.origin, onChange: (e) => setForm((f) => ({ ...f, origin: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-1234", value: form.invoiceRef ?? "", onChange: (e) => setForm((f) => ({ ...f, invoiceRef: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulage Cost (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.costPence, onChange: (e) => setForm((f) => ({ ...f, costPence: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.departureDate || !form.loadType || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Dispatch" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Dispatch?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This cannot be undone. Any confirmed stock movements will not be reversed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function TransfersTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", GRAIN_COMMODITIES);
  useLookupStrings("load_types", LOAD_TYPES);
  const [yearFilter, setYearFilter] = usePersistedNumberFilter({ page: "haulage-transfers", filter: "year", farmId, defaultValue: (/* @__PURE__ */ new Date()).getFullYear() });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [confirmId, setConfirmId] = reactExports.useState(null);
  const [confirmForm, setConfirmForm] = reactExports.useState({ confirmedBy: "", notes: "" });
  const { data: transMembersData, isLoading: transMembersLoading } = useFarmMembers(farmId);
  const transStaffNames = (transMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const emptyForm = {
    movementType: "on_farm_transfer",
    loadType: "Grain",
    commodity: "",
    variety: "",
    binId: null,
    fromBinName: "",
    destinationBinId: null,
    toBinName: "",
    weightTonnes: "",
    vehicleRegistration: "",
    driverName: "",
    departureDate: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyForm);
  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((r) => r.movementType === "on_farm_transfer")
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });
  const saveMut = useMutation({
    mutationFn: (body) => {
      const payload = {
        ...body,
        movementType: "on_farm_transfer",
        weightTonnes: body.weightTonnes || null,
        binId: body.binId || null,
        destinationBinId: body.destinationBinId || null,
        deliveryStatus: "booked"
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/haulage/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/haulage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editRecord ? "Transfer updated" : "Transfer recorded" });
      invalidate();
      setAddOpen(false);
      setEditRecord(null);
      setForm(emptyForm);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }).then(async (r) => {
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
  const confirmMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/haulage/${id}/confirm-dispatch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Transfer confirmed — stock moved between bins" });
      invalidate();
      setConfirmId(null);
      setConfirmForm({ confirmedBy: "", notes: "" });
    },
    onError: () => toast({ title: "Failed to confirm transfer", variant: "destructive" })
  });
  const allRecords = q.data ?? [];
  const years = reactExports.useMemo(() => {
    const ys = new Set(allRecords.map((r) => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add((/* @__PURE__ */ new Date()).getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [allRecords]);
  const records = reactExports.useMemo(
    () => allRecords.filter((r) => r.departureDate?.startsWith(String(yearFilter))),
    [allRecords, yearFilter]
  );
  const totalWeightT = reactExports.useMemo(
    () => records.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0),
    [records]
  );
  const openAdd = () => {
    setEditRecord(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ ...r, departureDate: r.departureDate?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "On-farm movements between bins or storage locations — stock is deducted from source and added to destination." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(yearFilter), onValueChange: (v) => setYearFilter(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 96 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 14, className: "mr-1" }),
          "Record Transfer"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : allRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No on-farm transfers recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record internal movements of crop between grain bins, stores, or field heaps." })
    ] }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, color: "#374151" }, children: [
        "No transfers in ",
        yearFilter
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Try selecting a different year, or record a new transfer." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Commodity", "From Bin / Store", "To Bin / Store", "Weight (t)", "Confirmed", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(r.departureDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.875rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: r.commodity || r.loadType || "—" }),
          r.variety && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: r.variety })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.storageLocation || r.origin || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.destination || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.weightTonnes ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem" }, children: r.deliveryConfirmedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#16a34a", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }),
          " ",
          new Date(r.deliveryConfirmedAt).toLocaleDateString("en-GB")
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.8rem" }, children: "Pending" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
          !r.deliveryConfirmedAt && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setConfirmId(r.id);
            setConfirmForm({ confirmedBy: "", notes: "" });
          }, style: { background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4 }, title: "Confirm transfer complete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] }) })
      ] }, r.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderTop: "2px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 4, style: { padding: "0.625rem 0.875rem", fontWeight: 600, fontSize: "0.8rem", color: "#6b7280" }, children: [
          records.length,
          " transfer",
          records.length !== 1 ? "s" : "",
          " · ",
          yearFilter
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }, children: totalWeightT > 0 ? `${totalWeightT.toFixed(2)} t` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2 })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmId !== null, onOpenChange: (o) => {
      if (!o) {
        setConfirmId(null);
        confirmMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirm Transfer Complete" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Stock will be deducted from the source bin and added to the destination bin." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your name", value: confirmForm.confirmedBy, onChange: (e) => setConfirmForm((f) => ({ ...f, confirmedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: confirmForm.notes, onChange: (e) => setConfirmForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: confirmMut, message: "Failed to confirm — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#16a34a", color: "#fff" }, onClick: () => confirmId !== null && confirmMut.mutate({ id: confirmId, body: confirmForm }), disabled: confirmMut.isPending, children: confirmMut.isPending ? "Confirming…" : "Confirm Transfer" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRecord(null);
        setForm(emptyForm);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Transfer" : "Record On-Farm Transfer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.departureDate, onChange: (e) => setForm((f) => ({ ...f, departureDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Weight (tonnes) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.weightTonnes, onChange: (e) => setForm((f) => ({ ...f, weightTonnes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.commodity || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, commodity: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select commodity..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                commodityTypes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. KWS Zyatt", value: form.variety, onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "From Bin / Store ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: form.binId, onChange: (id, name) => setForm((f) => ({ ...f, binId: id, fromBinName: name, storageLocation: name, origin: name })), placeholder: "Source bin..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "To Bin / Store ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BinSelect, { farmId, value: form.destinationBinId, onChange: (id, name) => setForm((f) => ({ ...f, destinationBinId: id, toBinName: name, destination: name })), placeholder: "Destination bin..." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Reg (if applicable)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Driver / Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.driverName, onChange: (v) => setForm((f) => ({ ...f, driverName: v })), staffNames: transStaffNames, loading: transMembersLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditRecord(null);
          setForm(emptyForm);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.departureDate || !form.weightTonnes || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Transfer" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Transfer?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This cannot be undone. Confirmed stock movements will not be reversed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function GrainPositionTab({ farmId, onGoToDispatches }) {
  const curYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = usePersistedNumberFilter({ page: "haulage-grain-position", filter: "year", farmId, defaultValue: curYear });
  const stockQ = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const haulageQ = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((r) => r.movementType !== "on_farm_transfer")
  });
  const stockLevels = stockQ.data ?? [];
  const allHaulageRecords = haulageQ.data ?? [];
  const dispatchYears = reactExports.useMemo(() => {
    const ys = new Set(allHaulageRecords.map((r) => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add(curYear);
    return Array.from(ys).sort((a, b) => b - a);
  }, [allHaulageRecords, curYear]);
  const haulageInYear = reactExports.useMemo(
    () => allHaulageRecords.filter((r) => r.departureDate?.startsWith(String(yearFilter))),
    [allHaulageRecords, yearFilter]
  );
  const confirmedInYear = reactExports.useMemo(() => haulageInYear.filter((r) => r.deliveryConfirmedAt), [haulageInYear]);
  const pendingInYear = reactExports.useMemo(() => haulageInYear.filter((r) => !r.deliveryConfirmedAt), [haulageInYear]);
  const totalDispatchedT = reactExports.useMemo(() => confirmedInYear.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0), [confirmedInYear]);
  const totalPendingT = reactExports.useMemo(() => pendingInYear.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0), [pendingInYear]);
  const totalStockTonnes = stockLevels.reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);
  const commodityTotals = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const r of stockLevels) {
      const key = r.commodity || "Unknown";
      map.set(key, (map.get(key) ?? 0) + parseFloat(r.quantityTonnes ?? "0"));
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [stockLevels]);
  const cardClick = { cursor: "pointer", transition: "box-shadow 0.15s" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: "Dispatch year:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(yearFilter), onValueChange: (v) => setYearFilter(Number(v)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 100, height: 32, fontSize: "0.85rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: dispatchYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#16a34a", marginBottom: 4 }, children: "Live Stock in Store" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.75rem", fontWeight: 700, color: "#14532d" }, children: [
          totalStockTonnes.toFixed(1),
          " t"
        ] }),
        commodityTotals.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }, children: commodityTotals.map(([commodity, tonnes]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#374151" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: commodity }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600 }, children: [
            tonnes.toFixed(1),
            " t"
          ] })
        ] }, commodity)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }, children: stockLevels.length === 0 ? "No stock records yet" : `across ${stockLevels.length} bin/commodity row${stockLevels.length !== 1 ? "s" : ""}` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", ...cardClick },
          onClick: onGoToDispatches,
          title: "Click to view confirmed dispatches",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#92400e", marginBottom: 4 }, children: "Total Dispatched (confirmed)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.75rem", fontWeight: 700, color: "#78350f" }, children: [
              totalDispatchedT.toFixed(1),
              " t"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
              confirmedInYear.length,
              " confirmed in ",
              yearFilter,
              " — click to view ↗"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1rem", ...cardClick },
          onClick: onGoToDispatches,
          title: "Click to view pending dispatches",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#1e40af", marginBottom: 4 }, children: "Pending Dispatches" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.75rem", fontWeight: 700, color: "#1e3a8a" }, children: [
              totalPendingT.toFixed(1),
              " t"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
              pendingInYear.length,
              " booked/in-transit in ",
              yearFilter,
              " — click to view ↗"
            ] })
          ]
        }
      )
    ] }),
    stockLevels.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", fontSize: "0.875rem" }, children: "Live Stock Levels" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "Updated automatically when dispatches and transfers are confirmed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #e5e7eb" }, children: ["Commodity", "Variety", "Crop Year", "Quantity (t)", "Last Updated"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: stockLevels.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < stockLevels.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", fontWeight: 500 }, children: r.commodity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", color: "#6b7280" }, children: r.variety || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", color: "#6b7280" }, children: r.cropYear || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: parseFloat(r.quantityTonnes) > 0 ? "#16a34a" : "#dc2626" }, children: [
            parseFloat(r.quantityTonnes ?? "0").toFixed(2),
            " t"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 1rem", color: "#6b7280", fontSize: "0.8rem" }, children: fmt(r.lastUpdated) })
        ] }, r.id)) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No live stock data yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Stock levels are updated automatically when dispatches and transfers are confirmed. Add harvest-in records via the Crop Stock page to initialise your position." })
    ] })
  ] });
}
const PLAN_LOAD_TYPES = ["Grain", "Livestock", "Machinery / Equipment", "Straw / Forage", "Other"];
const PLAN_STATUSES = [
  { value: "draft", label: "Draft", bg: "#f1f5f9", color: "#475569" },
  { value: "confirmed", label: "Confirmed", bg: "#eff6ff", color: "#1e40af" },
  { value: "in_progress", label: "In Progress", bg: "#fef3c7", color: "#92400e" },
  { value: "complete", label: "Complete", bg: "#dcfce7", color: "#166534" },
  { value: "cancelled", label: "Cancelled", bg: "#fee2e2", color: "#991b1b" }
];
function planStatus(s) {
  return PLAN_STATUSES.find((x) => x.value === s) ?? PLAN_STATUSES[0];
}
function planLoadTypeBadge(t) {
  if (t === "Grain") return { bg: "#fef9c3", color: "#854d0e" };
  if (t === "Livestock") return { bg: "#dcfce7", color: "#166534" };
  if (t?.startsWith("Machinery")) return { bg: "#eff6ff", color: "#1e40af" };
  return { bg: "#f1f5f9", color: "#475569" };
}
const LOAD_TYPE_STORAGE_TYPES = {
  "Grain": ["grain_store"],
  "Straw / Forage": ["grain_store"]
  // Livestock, Machinery, Other → no filter, show all
};
const COMMODITY_SUGGESTIONS = {
  "Grain": ["Feed Wheat", "Milling Wheat", "Premium Wheat", "Distilling Wheat", "Winter Barley", "Spring Barley", "Feed Barley", "Malting Barley", "Oilseed Rape (OSR)", "Winter Beans", "Spring Beans", "Peas", "Oats", "Linseed", "Rye"],
  "Livestock": ["Finished Beef Cattle", "Store Cattle", "Dairy Heifers", "Beef Cows", "Finished Lambs", "Store Lambs", "Breeding Ewes", "Rams", "Finished Pigs", "Weaners", "Breeding Sows", "Broilers", "Point-of-Lay Hens"],
  "Straw / Forage": ["Wheat Straw", "Barley Straw", "Oat Straw", "Big Bale Silage", "Wholecrop Silage", "Grass Silage", "Hay", "Haylage", "Maize Silage"],
  "Machinery / Equipment": ["Combine Harvester", "Tractor", "Baler", "Sprayer", "Drill", "Plough", "Cultivator", "Trailer", "Loader", "Mower", "Forager"],
  "Other": []
};
const emptyPlanForm = () => ({
  title: "",
  loadType: "Grain",
  commodity: "",
  commodityCustom: "",
  sourceLocation: "",
  binId: "",
  destination: "",
  haulierId: "",
  haulierName: "",
  useHaulierDir: true,
  buyerId: "",
  buyerRef: "",
  contractId: "",
  plannedDate: "",
  plannedDateEnd: "",
  estimatedLoads: "",
  estimatedVehicles: "",
  estimatedTonnes: "",
  status: "draft",
  notes: "",
  decisionMadeByMemberId: ""
});
function planToForm(p) {
  const suggestions = COMMODITY_SUGGESTIONS[p.loadType ?? "Grain"] ?? [];
  const isCustom = p.commodity && !suggestions.includes(p.commodity);
  return {
    title: p.title ?? "",
    loadType: p.loadType ?? "Grain",
    commodity: isCustom ? "__custom__" : p.commodity ?? "",
    commodityCustom: isCustom ? p.commodity ?? "" : "",
    sourceLocation: p.sourceLocation ?? "",
    binId: p.binId ? String(p.binId) : "",
    destination: p.destination ?? "",
    haulierId: p.haulierId ? String(p.haulierId) : "",
    haulierName: p.haulierName ?? "",
    useHaulierDir: !!p.haulierId,
    buyerId: p.buyerId ? String(p.buyerId) : "",
    buyerRef: p.buyerRef ?? "",
    contractId: p.linkedContractId ? String(p.linkedContractId) : "",
    plannedDate: p.plannedDate ?? "",
    plannedDateEnd: p.plannedDateEnd ?? "",
    estimatedLoads: p.estimatedLoads != null ? String(p.estimatedLoads) : "",
    estimatedVehicles: p.estimatedVehicles != null ? String(p.estimatedVehicles) : "",
    estimatedTonnes: p.estimatedTonnes != null ? String(parseFloat(p.estimatedTonnes).toFixed(2)) : "",
    status: p.status ?? "draft",
    notes: p.notes ?? "",
    decisionMadeByMemberId: p.decisionMadeByMemberId ? String(p.decisionMadeByMemberId) : ""
  };
}
function DispatchPlansTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editPlan, setEditPlan] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyPlanForm());
  const plansQ = useQuery({
    queryKey: ["dispatch-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const buyersQ = useQuery({
    queryKey: ["buyers-directory", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/buyers?types=buyer,trader,merchant,grain_merchant,customer`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const loadsQ = useQuery({
    queryKey: ["dispatch-plan-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans/${expandedId}/loads`).then((r) => r.json()),
    enabled: !!expandedId,
    select: (d) => d.loads ?? []
  });
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => (d.members ?? []).filter((m) => m.isActive !== false)
  });
  const storageQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const contractsQ = useQuery({
    queryKey: ["crop-contracts-for-buyer", farmId, form.buyerId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts?buyerId=${form.buyerId}&status=open,active`).then((r) => r.json()),
    enabled: !!farmId && !!form.buyerId,
    select: (d) => d.records ?? []
  });
  const saveMut = useMutation({
    mutationFn: (body) => {
      if (editPlan) return fetch(`/api/farms/${farmId}/dispatch-plans/${editPlan.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
      return fetch(`/api/farms/${farmId}/dispatch-plans`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: (data) => {
      const ref = data?.record?.planRef;
      toast({ title: editPlan ? "Dispatch plan updated" : `Dispatch plan created${ref ? ` — ${ref}` : ""}` });
      qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] });
      setAddOpen(false);
      setEditPlan(null);
      setForm(emptyPlanForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const notifyMut = useMutation({
    mutationFn: (planId) => fetch(`/api/farms/${farmId}/dispatch-plans/${planId}/notify-haulier`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] });
      toast({ title: data?.smsSent ? "Haulier notified — SMS sent" : "Haulier marked as notified" });
    },
    onError: () => toast({ title: "Failed to notify haulier", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/dispatch-plans/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Plan deleted" });
      qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status }) => fetch(`/api/farms/${farmId}/dispatch-plans/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] }),
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const plans = plansQ.data ?? [];
  const hauliers = hauliersQ.data ?? [];
  const buyers = buyersQ.data ?? [];
  const members = membersQ.data ?? [];
  const storageLocations = storageQ.data ?? [];
  const filteredStorageLocations = (() => {
    const preferredTypes = LOAD_TYPE_STORAGE_TYPES[form.loadType];
    if (!preferredTypes || preferredTypes.length === 0) return storageLocations;
    const preferred = storageLocations.filter((s) => preferredTypes.includes(s.type));
    return preferred.length > 0 ? preferred : storageLocations;
  })();
  const openAdd = () => {
    setEditPlan(null);
    setForm(emptyPlanForm());
    setAddOpen(true);
  };
  const openEdit = (p) => {
    setEditPlan(p);
    setForm(planToForm(p));
    setAddOpen(true);
  };
  const resolvedCommodity = form.commodity === "__custom__" ? form.commodityCustom : form.commodity;
  const contracts = contractsQ.data ?? [];
  const destIsKnownBuyer = !!buyers.find((b) => b.name === form.destination);
  const destSelectVal = destIsKnownBuyer ? form.destination : form.destination ? "__custom__" : "__none__";
  const destShowTextInput = destSelectVal === "__custom__" || !!form.destination && !destIsKnownBuyer && form.destination !== "__custom__";
  const handleSave = () => {
    saveMut.mutate({
      title: form.title,
      loadType: form.loadType,
      commodity: resolvedCommodity || null,
      sourceLocation: form.sourceLocation || null,
      binId: form.binId ? parseInt(form.binId) : null,
      destination: form.destination && form.destination !== "__custom__" ? form.destination : null,
      haulierId: form.useHaulierDir && form.haulierId ? parseInt(form.haulierId) : null,
      haulierName: !form.useHaulierDir && form.haulierName ? form.haulierName : form.useHaulierDir && form.haulierId ? hauliers.find((h) => String(h.id) === form.haulierId)?.companyName : null,
      buyerId: form.buyerId ? parseInt(form.buyerId) : null,
      buyerRef: form.buyerRef || null,
      plannedDate: form.plannedDate,
      plannedDateEnd: form.plannedDateEnd || null,
      estimatedLoads: form.estimatedLoads ? parseInt(form.estimatedLoads) : null,
      estimatedVehicles: form.estimatedVehicles ? parseInt(form.estimatedVehicles) : null,
      estimatedTonnes: form.estimatedTonnes || null,
      status: form.status,
      notes: form.notes || null,
      decisionMadeByMemberId: form.decisionMadeByMemberId ? parseInt(form.decisionMadeByMemberId) : null,
      linkedContractId: form.contractId ? parseInt(form.contractId) : null
    });
  };
  const activePlans = plans.filter((p) => p.status !== "cancelled" && p.status !== "complete");
  const archivedPlans = plans.filter((p) => p.status === "cancelled" || p.status === "complete");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const visiblePlans = showArchived ? plans : activePlans;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Plan and co-ordinate dispatch movements before execution. Confirmed plans appear in the Week Ahead planner." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "New Plan"
      ] })
    ] }),
    plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No dispatch plans yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Create a plan to co-ordinate a movement — grain dispatch, livestock transport, machinery movement, or anything else." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 10 }, children: visiblePlans.map((plan) => {
        const st = planStatus(plan.status);
        const lt = planLoadTypeBadge(plan.loadType);
        const isExpanded = expandedId === plan.id;
        const haulierLabel = plan.haulierName || hauliers.find((h) => h.id === plan.haulierId)?.companyName || null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1rem", display: "flex", alignItems: "flex-start", gap: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }, children: [
                plan.planRef && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontFamily: "monospace", color: "#6b7280", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }, children: plan.planRef }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, padding: "1px 8px", borderRadius: 10 }, children: st.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: lt.bg, color: lt.color, fontSize: "0.7rem", fontWeight: 600, padding: "1px 8px", borderRadius: 10 }, children: plan.loadType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: plan.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.8rem", color: "#6b7280", alignItems: "center" }, children: [
                plan.commodity && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500, color: "#374151" }, children: plan.commodity }),
                plan.estimatedLoads ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: plan.loadCount >= plan.estimatedLoads ? "#166534" : "#374151" }, children: plan.loadCount ?? 0 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
                    "/ ",
                    plan.estimatedLoads
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "load",
                    plan.estimatedLoads !== 1 ? "s" : ""
                  ] }),
                  plan.loadCount >= plan.estimatedLoads && plan.estimatedLoads > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12, style: { color: "#16a34a" } })
                ] }) : plan.loadCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  plan.loadCount,
                  " load",
                  plan.loadCount !== 1 ? "s" : "",
                  " recorded"
                ] }) : null,
                plan.estimatedVehicles && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 11, style: { display: "inline", marginRight: 2 } }),
                  plan.estimatedVehicles,
                  " vehicle",
                  plan.estimatedVehicles !== 1 ? "s" : ""
                ] }),
                plan.actualTonnes > 0 || plan.estimatedTonnes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  plan.actualTonnes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: { color: "#374151" }, children: [
                      plan.actualTonnes.toFixed(1),
                      " t"
                    ] }),
                    " ",
                    plan.estimatedTonnes ? `of ${parseFloat(plan.estimatedTonnes).toFixed(1)} t est.` : "dispatched"
                  ] }),
                  !plan.actualTonnes && plan.estimatedTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    parseFloat(plan.estimatedTonnes).toFixed(1),
                    " t est."
                  ] })
                ] }) : null
              ] }),
              (haulierLabel || plan.destination) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: "0.8rem" }, children: [
                haulierLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#374151" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 11, style: { display: "inline", marginRight: 3 } }),
                  haulierLabel
                ] }),
                haulierLabel && plan.destination && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 11, style: { color: "#9ca3af" } }),
                plan.destination && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151" }, children: plan.destination })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#9ca3af", margin: 0 }, children: [
                  "Planned: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: plan.plannedDate }),
                  plan.plannedDateEnd && plan.plannedDateEnd !== plan.plannedDate ? ` — ${plan.plannedDateEnd}` : "",
                  plan.buyerRef && !plan.linkedContractId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 10 }, children: [
                    "Ref: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: plan.buyerRef })
                  ] })
                ] }),
                plan.linkedContractId && plan.buyerRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 8px", borderRadius: 10 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 10 }),
                  "Contract: ",
                  plan.buyerRef
                ] }),
                plan.haulierNotifiedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#166534", background: "#dcfce7", padding: "1px 8px", borderRadius: 10 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 10, style: { display: "inline", marginRight: 3 } }),
                  "Haulier notified ",
                  new Date(plan.haulierNotifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                ] }) : (plan.haulierId || plan.haulierName) && plan.status !== "draft" && plan.status !== "cancelled" && plan.status !== "complete" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => notifyMut.mutate(plan.id), disabled: notifyMut.isPending, style: { fontSize: "0.72rem", color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 8px", borderRadius: 10, cursor: "pointer" }, children: "Notify haulier" }) : null
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: isExpanded ? "Hide loads" : "View linked loads", onClick: () => setExpandedId(isExpanded ? null : plan.id), children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit plan", onClick: () => openEdit(plan), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", style: { color: "#ef4444" }, onClick: () => setDeleteTarget(plan), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] }),
              plan.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.72rem", height: 24, padding: "0 8px" }, onClick: () => statusMut.mutate({ id: plan.id, status: "confirmed" }), children: "Confirm Plan" }),
              plan.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.72rem", height: 24, padding: "0 8px" }, onClick: () => statusMut.mutate({ id: plan.id, status: "in_progress" }), children: "Start Moving" }),
              plan.status === "in_progress" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", style: { fontSize: "0.72rem", height: 24, padding: "0 8px", background: "#166534" }, onClick: () => statusMut.mutate({ id: plan.id, status: "complete" }), children: "Mark Complete" })
            ] })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "10px 16px" }, children: loadsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: "Loading loads…" }) : (loadsQ.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: 'No dispatch records linked to this plan yet. When recording a dispatch, select this plan from the "Link to Plan" dropdown to connect it here.' }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: [
              (loadsQ.data ?? []).length,
              " load",
              (loadsQ.data ?? []).length !== 1 ? "s" : "",
              " recorded against this plan"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { color: "#6b7280" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Commodity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Vehicle" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 8px" }, children: "Weight (t)" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (loadsQ.data ?? []).map((load) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "1px solid #e5e7eb" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.departureDate?.slice(0, 10) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.commodity || load.loadType || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.vehicleRegistration || load.haulierCompany || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.deliveryConfirmedAt ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#166534", fontWeight: 500 }, children: "Confirmed" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#92400e" }, children: load.deliveryStatus || "Pending" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", textAlign: "right" }, children: load.weightTonnes ? parseFloat(load.weightTonnes).toFixed(2) : "—" })
              ] }, load.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #e5e7eb", fontWeight: 600 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 4, style: { padding: "4px 8px" }, children: [
                  (loadsQ.data ?? []).filter((l) => l.deliveryConfirmedAt).length,
                  " of ",
                  (loadsQ.data ?? []).length,
                  " confirmed"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 8px", textAlign: "right" }, children: [
                  (loadsQ.data ?? []).reduce((s, l) => s + parseFloat(l.weightTonnes ?? "0"), 0).toFixed(2),
                  " t"
                ] })
              ] }) })
            ] })
          ] }) })
        ] }, plan.id);
      }) }),
      archivedPlans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 12, textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowArchived((a) => !a), style: { fontSize: "0.8rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }, children: showArchived ? "Hide" : `Show ${archivedPlans.length} completed / cancelled plan${archivedPlans.length !== 1 ? "s" : ""}` }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditPlan(null);
        setForm(emptyPlanForm());
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 660, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editPlan ? "Edit Dispatch Plan" : "New Dispatch Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        editPlan?.planRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#64748b" }, children: "Plan Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: "monospace", fontWeight: 700, color: "#1e40af", fontSize: "0.9rem", letterSpacing: "0.04em" }, children: editPlan.planRef }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#94a3b8", marginLeft: 4 }, children: "— assigned by system, cannot be changed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Title ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Feed wheat to Frontier — 5 loads", value: form.title, onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Load Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.loadType, onValueChange: (v) => setForm((f) => ({ ...f, loadType: v, commodity: "", commodityCustom: "" })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLAN_LOAD_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity" }),
            (COMMODITY_SUGGESTIONS[form.loadType] ?? []).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.commodity || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, commodity: v, commodityCustom: "" })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select commodity…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
                  (COMMODITY_SUGGESTIONS[form.loadType] ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Other / enter manually…" })
                ] })
              ] }),
              form.commodity === "__custom__" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: `Describe the ${form.loadType.toLowerCase()} being moved`, value: form.commodityCustom, onChange: (e) => setForm((f) => ({ ...f, commodityCustom: e.target.value })) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Describe what's being moved", value: form.commodityCustom, onChange: (e) => setForm((f) => ({ ...f, commodityCustom: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Movement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From (source location)" }),
              filteredStorageLocations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sourceLocation || "__custom__", onValueChange: (v) => setForm((f) => ({ ...f, sourceLocation: v === "__custom__" ? "" : v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select farm location…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    filteredStorageLocations.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, children: [
                      s.name,
                      s.binType ? ` — ${s.binType}` : "",
                      s.capacityTonnes ? ` (${parseFloat(s.capacityTonnes).toFixed(0)}t)` : ""
                    ] }, s.id)),
                    filteredStorageLocations.length < storageLocations.length && storageLocations.filter((s) => !filteredStorageLocations.includes(s)).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, style: { color: "#6b7280" }, children: [
                      s.name,
                      " (other)"
                    ] }, `other-${s.id}`)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Other / type manually…" })
                  ] })
                ] }),
                (!form.sourceLocation || form.sourceLocation === "__custom__") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. Home Farm, Barn 2, Field 7", value: form.sourceLocation === "__custom__" ? "" : form.sourceLocation, onChange: (e) => setForm((f) => ({ ...f, sourceLocation: e.target.value })) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Home Farm, Barn 2, Field 7", value: form.sourceLocation, onChange: (e) => setForm((f) => ({ ...f, sourceLocation: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To (destination)" }),
              buyers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: destSelectVal,
                    onValueChange: (v) => {
                      if (v === "__none__") {
                        setForm((f) => ({ ...f, destination: "" }));
                        return;
                      }
                      if (v === "__custom__") {
                        setForm((f) => ({ ...f, destination: "__custom__" }));
                        return;
                      }
                      const b = buyers.find((bx) => bx.name === v);
                      setForm((f) => ({
                        ...f,
                        destination: v,
                        buyerId: f.buyerId || (b ? String(b.id) : f.buyerId)
                      }));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select known trader / merchant…" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                        buyers.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: b.name, children: [
                          b.name,
                          b.address ? ` — ${b.address.split(",")[0]}` : ""
                        ] }, b.id)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Other / type manually…" })
                      ] })
                    ]
                  }
                ),
                destShowTextInput && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    className: "mt-1",
                    placeholder: "e.g. Frontier Grain, Stowmarket",
                    value: form.destination === "__custom__" ? "" : form.destination,
                    onChange: (e) => setForm((f) => ({ ...f, destination: e.target.value }))
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Frontier Grain, Stowmarket", value: form.destination, onChange: (e) => setForm((f) => ({ ...f, destination: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm((f) => ({ ...f, useHaulierDir: !f.useHaulierDir, haulierId: "", haulierName: "" })), style: { fontSize: "0.75rem", color: "#1a6b3a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }, children: form.useHaulierDir ? "Enter name manually" : "Use directory" })
          ] }),
          form.useHaulierDir ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.haulierId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select haulier from directory" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No haulier selected —" }),
              hauliers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.companyName }, h.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Haulier company name", value: form.haulierName, onChange: (e) => setForm((f) => ({ ...f, haulierName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer / Merchant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.buyerId || "__none__",
                onValueChange: (v) => {
                  const b = v === "__none__" ? null : buyers.find((bx) => String(bx.id) === v);
                  setForm((f) => ({
                    ...f,
                    buyerId: v === "__none__" ? "" : v,
                    // Auto-fill destination if it's empty or was "None"
                    destination: (!f.destination || f.destination === "__custom__") && b ? b.name : f.destination
                  }));
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select or leave blank" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                    buyers.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.id), children: b.name }, b.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contract / TASQ Ref" }),
            contracts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.contractId || "__none__",
                  onValueChange: (v) => {
                    if (v === "__none__") {
                      setForm((f) => ({ ...f, contractId: "", buyerRef: "" }));
                      return;
                    }
                    const c = contracts.find((cx) => String(cx.id) === v);
                    setForm((f) => ({
                      ...f,
                      contractId: v,
                      buyerRef: c?.contractReference ?? "",
                      // Auto-fill commodity if blank and contract has one
                      commodity: (!f.commodity || f.commodity === "__none__") && c?.commodity ? COMMODITY_SUGGESTIONS[f.loadType]?.includes(c.commodity) ? c.commodity : "__custom__" : f.commodity,
                      commodityCustom: (!f.commodity || f.commodity === "__none__") && c?.commodity ? !COMMODITY_SUGGESTIONS[f.loadType]?.includes(c.commodity) ? c.commodity : f.commodityCustom : f.commodityCustom
                    }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select open contract…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No contract linked —" }),
                      contracts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                        c.contractReference ? `${c.contractReference} — ` : "",
                        c.commodity,
                        c.quantityTonnes ? ` · ${parseFloat(c.remainingTonnes ?? c.quantityTonnes).toFixed(0)}t remaining` : ""
                      ] }, c.id)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "Enter ref manually…" })
                    ] })
                  ]
                }
              ),
              (form.contractId === "__custom__" || form.buyerRef && !contracts.find((c) => c.contractReference === form.buyerRef)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "e.g. TASQ-12345", value: form.buyerRef, onChange: (e) => setForm((f) => ({ ...f, buyerRef: e.target.value, contractId: "__custom__" })) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. TASQ-12345", value: form.buyerRef, onChange: (e) => setForm((f) => ({ ...f, buyerRef: e.target.value })) }),
            form.buyerId && !contractsQ.isFetched && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: "Loading contracts…" }),
            form.buyerId && contractsQ.isFetched && contracts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }, children: "No open contracts for this buyer" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Schedule & Quantities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Planned Date ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.plannedDate, onChange: (e) => setForm((f) => ({ ...f, plannedDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date (if multi-day)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.plannedDateEnd, onChange: (e) => setForm((f) => ({ ...f, plannedDateEnd: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-3", style: { marginTop: "0.75rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Est. Loads (trips)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", placeholder: "e.g. 20", value: form.estimatedLoads, onChange: (e) => setForm((f) => ({ ...f, estimatedLoads: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Est. Vehicles" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", placeholder: "e.g. 4", value: form.estimatedVehicles, onChange: (e) => setForm((f) => ({ ...f, estimatedVehicles: e.target.value })) }),
              form.estimatedLoads && form.estimatedVehicles && parseInt(form.estimatedVehicles) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.68rem", color: "#6b7280", marginTop: 2 }, children: [
                "≈ ",
                Math.ceil(parseInt(form.estimatedLoads) / parseInt(form.estimatedVehicles)),
                " trips/vehicle"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Est. Tonnes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "e.g. 250.00", value: form.estimatedTonnes, onChange: (e) => setForm((f) => ({ ...f, estimatedTonnes: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLAN_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision made by" }),
          members.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.decisionMadeByMemberId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, decisionMadeByMemberId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select team member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
              members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                m.firstName,
                " ",
                m.lastName,
                m.jobTitle ? ` (${m.jobTitle})` : ""
              ] }, m.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. James Barnett", value: form.decisionMadeByMemberId, onChange: (e) => setForm((f) => ({ ...f, decisionMadeByMemberId: e.target.value })) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditPlan(null);
          setForm(emptyPlanForm());
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !form.title || !form.plannedDate || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editPlan ? "Save Changes" : "Create Plan" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: (o) => {
      if (!o) {
        setDeleteTarget(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Dispatch Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#374151" }, children: [
        "Delete plan ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget?.title }),
        "? Any dispatch records linked to it will remain, but the link will be removed."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteTarget.id), disabled: deleteMut.isPending, children: deleteMut.isPending ? "Deleting…" : "Delete Plan" })
      ] })
    ] }) })
  ] });
}
const VEHICLE_TYPES = [
  "Articulated lorry",
  "Articulated tipper",
  "Rigid tipper",
  "Grain trailer",
  "Livestock wagon",
  "Double-deck livestock wagon",
  "Tanker",
  "Flatbed / dropsider",
  "Curtain-sider",
  "Refrigerated lorry",
  "Container lorry",
  "Low-loader"
];
const CONTACT_ROLES = ["Office / Admin", "Driver", "Emergency / Out-of-hours", "Accounts", "Other"];
const emptyContact = () => ({ name: "", role: "Office / Admin", phone: "", email: "" });
const emptyHaulierForm = () => ({
  companyName: "",
  operatorLicence: "",
  notes: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  town: "",
  county: "",
  postcode: "",
  vehicleTypes: [],
  contacts: [emptyContact()]
});
function parseVehicleTypes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw ? [raw] : [];
  }
}
function parseContacts(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function haulierToForm(h) {
  return {
    companyName: h.companyName ?? "",
    operatorLicence: h.operatorLicence ?? "",
    notes: h.notes ?? "",
    email: h.email ?? "",
    addressLine1: h.addressLine1 ?? "",
    addressLine2: h.addressLine2 ?? "",
    town: h.town ?? "",
    county: h.county ?? "",
    postcode: h.postcode ?? "",
    vehicleTypes: parseVehicleTypes(h.vehicleTypes),
    contacts: parseContacts(h.contacts).length > 0 ? parseContacts(h.contacts) : [emptyContact()]
  };
}
function addressOneLine(h) {
  return [h.addressLine1, h.town, h.postcode].filter(Boolean).join(", ") || "";
}
function primaryContact(h) {
  const contacts = parseContacts(h.contacts);
  return contacts[0] ?? null;
}
function HaulierDirectoryTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editHaulier, setEditHaulier] = reactExports.useState(null);
  const [viewHaulier, setViewHaulier] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyHaulierForm());
  const q = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const saveMut = useMutation({
    mutationFn: (body) => {
      if (editHaulier) return fetch(`/api/farms/${farmId}/hauliers/${editHaulier.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/hauliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editHaulier ? "Haulier updated" : "Haulier added" });
      qc.invalidateQueries({ queryKey: ["hauliers", farmId] });
      setAddOpen(false);
      setEditHaulier(null);
      setForm(emptyHaulierForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/hauliers/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Haulier removed" });
      qc.invalidateQueries({ queryKey: ["hauliers", farmId] });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const records = q.data ?? [];
  const openAdd = () => {
    setEditHaulier(null);
    setForm(emptyHaulierForm());
    setAddOpen(true);
  };
  const openEdit = (h) => {
    setEditHaulier(h);
    setForm(haulierToForm(h));
    setAddOpen(true);
  };
  const setContact = (i, field, value) => setForm((f) => {
    const cs = [...f.contacts];
    cs[i] = { ...cs[i], [field]: value };
    return { ...f, contacts: cs };
  });
  const addContact = () => setForm((f) => ({ ...f, contacts: [...f.contacts, emptyContact()] }));
  const removeContact = (i) => setForm((f) => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));
  const toggleVehicle = (v) => setForm((f) => ({
    ...f,
    vehicleTypes: f.vehicleTypes.includes(v) ? f.vehicleTypes.filter((x) => x !== v) : [...f.vehicleTypes, v]
  }));
  const handleSave = () => {
    saveMut.mutate({
      ...form,
      vehicleTypes: JSON.stringify(form.vehicleTypes),
      contacts: JSON.stringify(form.contacts.filter((c) => c.name || c.phone || c.email))
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Haulier"
    ] }) }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No hauliers registered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add your approved hauliers to select them quickly when recording dispatches." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 10 }, children: records.map((h) => {
      const vts = parseVehicleTypes(h.vehicleTypes);
      const pc = primaryContact(h);
      const addr = addressOneLine(h);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#111827", fontSize: "0.95rem" }, children: h.companyName }),
            h.operatorLicence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", background: "#eff6ff", color: "#1e40af", padding: "1px 7px", borderRadius: 4 }, children: [
              "O Licence: ",
              h.operatorLicence
            ] })
          ] }),
          addr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: addr }),
          pc && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: [
            pc.name,
            pc.role ? ` · ${pc.role}` : "",
            pc.phone ? ` · ${pc.phone}` : ""
          ] }),
          vts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }, children: vts.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: 4 }, children: v }, v)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View", onClick: () => setViewHaulier(h), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit", onClick: () => openEdit(h), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", style: { color: "#ef4444" }, onClick: () => setDeleteTarget(h), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] })
      ] }, h.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewHaulier, onOpenChange: (o) => {
      if (!o) setViewHaulier(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: viewHaulier?.companyName }) }),
      viewHaulier && (() => {
        const vts = parseVehicleTypes(viewHaulier.vehicleTypes);
        const cs = parseContacts(viewHaulier.contacts);
        const addr = [viewHaulier.addressLine1, viewHaulier.addressLine2, viewHaulier.town, viewHaulier.county, viewHaulier.postcode].filter(Boolean).join(", ");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          viewHaulier.operatorLicence && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Operator Licence" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500 }, children: viewHaulier.operatorLicence })
          ] }),
          addr && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { whiteSpace: "pre-line" }, children: [viewHaulier.addressLine1, viewHaulier.addressLine2, viewHaulier.town, viewHaulier.county, viewHaulier.postcode].filter(Boolean).join("\n") })
          ] }),
          vts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }, children: "Vehicle Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: vts.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 4 }, children: v }, v)) })
          ] }),
          cs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: "Contacts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: cs.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, fontSize: "0.875rem" }, children: [
                c.name,
                " ",
                c.role && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 400, color: "#6b7280" }, children: [
                  "· ",
                  c.role
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, marginTop: 2 }, children: [
                c.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151" }, children: c.phone }),
                c.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#374151" }, children: c.email })
              ] })
            ] }, i)) })
          ] }),
          viewHaulier.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: viewHaulier.notes })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewHaulier(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewHaulier);
          setViewHaulier(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditHaulier(null);
        setForm(emptyHaulierForm());
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editHaulier ? "Edit Haulier" : "Add Haulier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Company Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Smith Agricultural Haulage Ltd", value: form.companyName, onChange: (e) => setForm((f) => ({ ...f, companyName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Licence No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "O-XXXXXX", value: form.operatorLicence, onChange: (e) => setForm((f) => ({ ...f, operatorLicence: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "General Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email, onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Address line 1", value: form.addressLine1, onChange: (e) => setForm((f) => ({ ...f, addressLine1: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Address line 2 (optional)", value: form.addressLine2, onChange: (e) => setForm((f) => ({ ...f, addressLine2: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Town / City", value: form.town, onChange: (e) => setForm((f) => ({ ...f, town: e.target.value })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "County", value: form.county, onChange: (e) => setForm((f) => ({ ...f, county: e.target.value })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Postcode", value: form.postcode, onChange: (e) => setForm((f) => ({ ...f, postcode: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Vehicle Types" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 12px" }, children: VEHICLE_TYPES.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer", padding: "3px 0" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.vehicleTypes.includes(v), onChange: () => toggleVehicle(v), style: { accentColor: "#1a6b3a" } }),
            v
          ] }, v)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151" }, children: "Contacts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", type: "button", onClick: addContact, style: { height: 26, fontSize: "0.75rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12, className: "mr-1" }),
              "Add Contact"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: form.contacts.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                "Contact ",
                i + 1
              ] }),
              form.contacts.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", type: "button", onClick: () => removeContact(i), style: { height: 22, padding: "0 6px", color: "#ef4444" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name", value: c.name, onChange: (e) => setContact(i, "name", e.target.value), style: { fontSize: "0.85rem" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: c.role, onValueChange: (v) => setContact(i, "role", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.85rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTACT_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Phone number", value: c.phone, onChange: (e) => setContact(i, "phone", e.target.value), style: { fontSize: "0.85rem" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Email address", type: "email", value: c.email, onChange: (e) => setContact(i, "email", e.target.value), style: { fontSize: "0.85rem" } })
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditHaulier(null);
          setForm(emptyHaulierForm());
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: !form.companyName || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editHaulier ? "Save Changes" : "Add Haulier" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: (o) => {
      if (!o) {
        setDeleteTarget(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Haulier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#374151" }, children: [
        "Remove ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget?.companyName }),
        " from the directory? This haulier will no longer appear in dropdown lists, but existing dispatch records that reference them will be preserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to remove — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteTarget.id), disabled: deleteMut.isPending, children: deleteMut.isPending ? "Removing…" : "Remove Haulier" })
      ] })
    ] }) })
  ] });
}
const INV_STATUSES = [
  { value: "received", label: "Received", bg: "#fef3c7", color: "#92400e" },
  { value: "queried", label: "Queried", bg: "#fee2e2", color: "#991b1b" },
  { value: "reconciled", label: "Reconciled", bg: "#eff6ff", color: "#1e40af" },
  { value: "paid", label: "Paid", bg: "#dcfce7", color: "#166534" }
];
function fmtGBP(pence) {
  if (pence == null) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const emptyInvoiceForm = () => ({
  haulierId: "",
  haulierName: "",
  invoiceNumber: "",
  invoiceDate: "",
  periodFrom: "",
  periodTo: "",
  amountNetPence: "",
  vatPence: "",
  amountGrossPence: "",
  status: "received",
  notes: ""
});
function HaulierInvoicesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editInv, setEditInv] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyInvoiceForm());
  const [useDirectory, setUseDirectory] = reactExports.useState(true);
  const [assignOpen, setAssignOpen] = reactExports.useState(false);
  const [selectedLoadIds, setSelectedLoadIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const invQ = useQuery({
    queryKey: ["haulier-invoices", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const loadsQ = useQuery({
    queryKey: ["haulier-invoice-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices/${expandedId}/loads`).then((r) => r.json()),
    enabled: !!expandedId,
    select: (d) => d.loads ?? []
  });
  const eligibleLoadsQ = useQuery({
    queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices/${expandedId}/eligible-loads`).then((r) => r.json()),
    enabled: !!expandedId && assignOpen,
    select: (d) => d.loads ?? []
  });
  const saveMut = useMutation({
    mutationFn: (body) => {
      if (editInv) return fetch(`/api/farms/${farmId}/haulier-invoices/${editInv.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      return fetch(`/api/farms/${farmId}/haulier-invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      toast({ title: editInv ? "Invoice updated" : "Invoice added" });
      qc.invalidateQueries({ queryKey: ["haulier-invoices", farmId] });
      setAddOpen(false);
      setEditInv(null);
      setForm(emptyInvoiceForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/haulier-invoices/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Invoice deleted" });
      qc.invalidateQueries({ queryKey: ["haulier-invoices", farmId] });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const assignMut = useMutation({
    mutationFn: ({ invId, loadIds }) => fetch(`/api/farms/${farmId}/haulier-invoices/${invId}/assign-loads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loadIds })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, { loadIds }) => {
      toast({ title: `${loadIds.length} load${loadIds.length !== 1 ? "s" : ""} assigned to invoice` });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-loads", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId] });
      setAssignOpen(false);
      setSelectedLoadIds(/* @__PURE__ */ new Set());
    },
    onError: () => toast({ title: "Failed to assign loads", variant: "destructive" })
  });
  const unassignMut = useMutation({
    mutationFn: ({ invId, loadIds }) => fetch(`/api/farms/${farmId}/haulier-invoices/${invId}/unassign-loads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loadIds })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Load removed from invoice" });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-loads", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId] });
    },
    onError: () => toast({ title: "Failed to remove load", variant: "destructive" })
  });
  const invoices = invQ.data ?? [];
  const hauliers = hauliersQ.data ?? [];
  const openAdd = () => {
    setEditInv(null);
    setForm(emptyInvoiceForm());
    setUseDirectory(true);
    setAddOpen(true);
  };
  const openEdit = (inv) => {
    setEditInv(inv);
    setUseDirectory(!!inv.haulierId);
    setForm({
      haulierId: inv.haulierId ? String(inv.haulierId) : "",
      haulierName: inv.haulierName ?? "",
      invoiceNumber: inv.invoiceNumber ?? "",
      invoiceDate: inv.invoiceDate ?? "",
      periodFrom: inv.periodFrom ?? "",
      periodTo: inv.periodTo ?? "",
      amountNetPence: inv.amountNetPence != null ? (inv.amountNetPence / 100).toFixed(2) : "",
      vatPence: inv.vatPence != null ? (inv.vatPence / 100).toFixed(2) : "",
      amountGrossPence: inv.amountGrossPence != null ? (inv.amountGrossPence / 100).toFixed(2) : "",
      status: inv.status ?? "received",
      notes: inv.notes ?? ""
    });
    setAddOpen(true);
  };
  const autoGross = () => {
    const net = parseFloat(form.amountNetPence) || 0;
    const vat = parseFloat(form.vatPence) || 0;
    if (net || vat) setForm((f) => ({ ...f, amountGrossPence: (net + vat).toFixed(2) }));
  };
  const invStatus = (s) => INV_STATUSES.find((x) => x.value === s) ?? INV_STATUSES[0];
  const outstanding = invoices.filter((i) => i.status === "received" || i.status === "queried").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Invoices received from hauliers — reconcile against dispatches for accurate records." }),
        outstanding > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }, children: [
          outstanding,
          " outstanding"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Record Invoice"
      ] })
    ] }),
    invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No haulier invoices recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record invoices received from hauliers and reconcile them against individual loads." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 8 }, children: invoices.map((inv) => {
      const st = invStatus(inv.status);
      const isExpanded = expandedId === inv.id;
      const haulierLabel = inv.haulierName || hauliers.find((h) => h.id === inv.haulierId)?.companyName || "Unknown haulier";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#111827" }, children: inv.invoiceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: st.bg, color: st.color, padding: "1px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600 }, children: st.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, marginTop: 2, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: haulierLabel }),
              inv.invoiceDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                "Dated ",
                inv.invoiceDate
              ] }),
              (inv.periodFrom || inv.periodTo) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
                "Period: ",
                inv.periodFrom ?? "?",
                " — ",
                inv.periodTo ?? "?"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, fontSize: "0.95rem", color: "#111827" }, children: fmtGBP(inv.amountGrossPence) }),
            inv.amountNetPence != null && inv.vatPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
              "Net ",
              fmtGBP(inv.amountNetPence),
              " + VAT ",
              fmtGBP(inv.vatPence)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, flexShrink: 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: isExpanded ? "Hide loads" : "View matched loads", onClick: () => setExpandedId(isExpanded ? null : inv.id), children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Edit", onClick: () => openEdit(inv), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "Delete", style: { color: "#ef4444" }, onClick: () => setDeleteTarget(inv), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "10px 16px" }, children: [
          loadsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: "Loading loads…" }) : (loadsQ.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 10 }, children: "No dispatch records linked to this invoice yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 12 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#374151", fontWeight: 600, marginBottom: 6 }, children: [
              (loadsQ.data ?? []).length,
              " load",
              (loadsQ.data ?? []).length !== 1 ? "s" : "",
              " linked to this invoice"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { color: "#6b7280" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Commodity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "3px 8px" }, children: "Destination" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 8px" }, children: "Weight (t)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "3px 8px" }, children: "Cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { width: 28 } })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (loadsQ.data ?? []).map((load) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "1px solid #e5e7eb" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.departureDate?.slice(0, 10) ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.commodity || load.loadType || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px" }, children: load.destination || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", textAlign: "right" }, children: load.weightTonnes ? parseFloat(load.weightTonnes).toFixed(2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", textAlign: "right" }, children: fmtGBP(load.costPence) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 4px", textAlign: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    title: "Remove from invoice",
                    onClick: () => unassignMut.mutate({ invId: inv.id, loadIds: [load.id] }),
                    style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", lineHeight: 1 },
                    children: "×"
                  }
                ) })
              ] }, load.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tfoot", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #e5e7eb", fontWeight: 600 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, style: { padding: "4px 8px" }, children: "Total linked" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 8px", textAlign: "right" }, children: [
                    (loadsQ.data ?? []).reduce((s, l) => s + parseFloat(l.weightTonnes ?? "0"), 0).toFixed(2),
                    " t"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", textAlign: "right" }, children: fmtGBP((loadsQ.data ?? []).reduce((s, l) => s + (l.costPence ?? 0), 0)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
                ] }),
                inv.amountGrossPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, style: { padding: "2px 8px" }, children: "Invoice gross" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "2px 8px", textAlign: "right" }, children: fmtGBP(inv.amountGrossPence) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
                ] }),
                inv.amountGrossPence != null && (() => {
                  const matched = (loadsQ.data ?? []).reduce((s, l) => s + (l.costPence ?? 0), 0);
                  const diff = matched - inv.amountGrossPence;
                  if (diff === 0) return null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { fontSize: "0.75rem", color: diff > 0 ? "#b45309" : "#dc2626" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, style: { padding: "2px 8px" }, children: "Variance" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "2px 8px", textAlign: "right" }, children: [
                      diff > 0 ? "+" : "",
                      fmtGBP(Math.abs(diff)),
                      diff > 0 ? " over" : " under"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
                  ] });
                })()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, paddingTop: (loadsQ.data ?? []).length > 0 ? 8 : 0, borderTop: (loadsQ.data ?? []).length > 0 ? "1px dashed #e5e7eb" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
              setAssignOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
              "Find loads to assign"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: inv.haulierId || inv.haulierName ? "Shows dispatch records from this haulier not yet linked to any invoice." : "Set the Invoice Ref on individual dispatch records to link them manually." })
          ] })
        ] })
      ] }, inv.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditInv(null);
        setForm(emptyInvoiceForm());
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editInv ? "Edit Invoice" : "Record Haulier Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setUseDirectory((d) => !d), style: { fontSize: "0.75rem", color: "#1a6b3a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }, children: useDirectory ? "Enter name manually" : "Use directory" })
          ] }),
          useDirectory ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.haulierId || "__none__", onValueChange: (v) => {
            const h = hauliers.find((x) => String(x.id) === v);
            setForm((f) => ({ ...f, haulierId: v === "__none__" ? "" : v, haulierName: h ? h.companyName : "" }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select haulier from directory" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select haulier —" }),
              hauliers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.companyName }, h.id))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Haulier company name", value: form.haulierName, onChange: (e) => setForm((f) => ({ ...f, haulierName: e.target.value, haulierId: "" })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Invoice Number ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-1234", value: form.invoiceNumber, onChange: (e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.invoiceDate, onChange: (e) => setForm((f) => ({ ...f, invoiceDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Billing Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.periodFrom, onChange: (e) => setForm((f) => ({ ...f, periodFrom: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.periodTo, onChange: (e) => setForm((f) => ({ ...f, periodTo: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }, children: "Amounts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: form.amountNetPence, onChange: (e) => setForm((f) => ({ ...f, amountNetPence: e.target.value })), onBlur: autoGross })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: form.vatPence, onChange: (e) => setForm((f) => ({ ...f, vatPence: e.target.value })), onBlur: autoGross })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", placeholder: "0.00", value: form.amountGrossPence, onChange: (e) => setForm((f) => ({ ...f, amountGrossPence: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }, children: "Tab out of Net or VAT to auto-calculate Gross." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INV_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditInv(null);
          setForm(emptyInvoiceForm());
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(form), disabled: !form.invoiceNumber || saveMut.isPending, children: saveMut.isPending ? "Saving…" : editInv ? "Save Changes" : "Record Invoice" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: (o) => {
      if (!o) {
        setDeleteTarget(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 420 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", color: "#374151" }, children: [
        "Delete invoice ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget?.invoiceNumber }),
        "? This will not affect the dispatch records linked to it."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTarget(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMut.mutate(deleteTarget.id), disabled: deleteMut.isPending, children: deleteMut.isPending ? "Deleting…" : "Delete Invoice" })
      ] })
    ] }) }),
    expandedId && (() => {
      const inv = invoices.find((i) => i.id === expandedId);
      if (!inv) return null;
      const eligible = eligibleLoadsQ.data ?? [];
      const allSelected = eligible.length > 0 && eligible.every((l) => selectedLoadIds.has(l.id));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: assignOpen, onOpenChange: (o) => {
        if (!o) {
          setAssignOpen(false);
          setSelectedLoadIds(/* @__PURE__ */ new Set());
          assignMut.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Assign dispatch loads — ",
          inv.invoiceNumber
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: [
          "Showing unlinked dispatch records from ",
          inv.haulierName || hauliers.find((h) => h.id === inv.haulierId)?.companyName || "this haulier",
          inv.periodFrom || inv.periodTo ? ` between ${inv.periodFrom ?? "?"} and ${inv.periodTo ?? "?"}` : "",
          ". Tick the loads covered by this invoice, then click Assign."
        ] }),
        eligibleLoadsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", color: "#6b7280", padding: "1rem 0" }, children: "Searching for loads…" }) : eligible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "2rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No unlinked loads found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", marginTop: 4 }, children: inv.haulierId || inv.haulierName ? "All loads from this haulier in the billing period are already linked to an invoice." : "Add a haulier to this invoice to find matching dispatch records automatically." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: allSelected,
                onChange: () => {
                  if (allSelected) setSelectedLoadIds(/* @__PURE__ */ new Set());
                  else setSelectedLoadIds(new Set(eligible.map((l) => l.id)));
                },
                style: { accentColor: "#1a6b3a", width: 15, height: 15 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", color: "#374151", fontWeight: 600 }, children: [
              "Select all (",
              eligible.length,
              " load",
              eligible.length !== 1 ? "s" : "",
              ")"
            ] }),
            selectedLoadIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }, children: [
              selectedLoadIds.size,
              " selected"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 4 }, children: eligible.map((load) => {
            const checked = selectedLoadIds.has(load.id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                style: { display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: checked ? "#f0fdf4" : "#fff", border: `1px solid ${checked ? "#86efac" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked,
                      onChange: () => setSelectedLoadIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(load.id)) next.delete(load.id);
                        else next.add(load.id);
                        return next;
                      }),
                      style: { accentColor: "#1a6b3a", width: 15, height: 15, flexShrink: 0 }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, fontSize: "0.82rem", fontWeight: 500, color: "#111827" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: load.departureDate?.slice(0, 10) ?? "—" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: load.commodity || load.loadType || "—" }),
                      load.destination && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                        "→ ",
                        load.destination
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }, children: [
                      load.weightTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        parseFloat(load.weightTonnes).toFixed(2),
                        " t"
                      ] }),
                      load.costPence != null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmtGBP(load.costPence) }),
                      load.waybillNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Waybill ",
                        load.waybillNumber
                      ] }),
                      load.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#b45309" }, children: [
                        "Currently on: ",
                        load.invoiceRef
                      ] })
                    ] })
                  ] })
                ]
              },
              load.id
            );
          }) }),
          selectedLoadIds.size > 0 && (() => {
            const sel = eligible.filter((l) => selectedLoadIds.has(l.id));
            const totalT = sel.reduce((s, l) => s + parseFloat(l.weightTonnes ?? "0"), 0);
            const totalCost = sel.reduce((s, l) => s + (l.costPence ?? 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, padding: "8px 10px", marginTop: 8, background: "#f9fafb", borderRadius: 8, fontSize: "0.8rem", color: "#374151" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedLoadIds.size }),
                " loads selected"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                totalT.toFixed(2),
                " t"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtGBP(totalCost) }) }),
              inv.amountGrossPence != null && totalCost !== inv.amountGrossPence && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", color: totalCost > inv.amountGrossPence ? "#b45309" : "#6b7280" }, children: [
                "vs invoice ",
                fmtGBP(inv.amountGrossPence),
                " (",
                totalCost > inv.amountGrossPence ? "+" : "",
                fmtGBP(Math.abs(totalCost - inv.amountGrossPence)),
                " ",
                totalCost > inv.amountGrossPence ? "over" : "under",
                ")"
              ] })
            ] });
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: assignMut, message: "Failed to assign — please try again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setAssignOpen(false);
            setSelectedLoadIds(/* @__PURE__ */ new Set());
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => assignMut.mutate({ invId: inv.id, loadIds: Array.from(selectedLoadIds) }),
              disabled: selectedLoadIds.size === 0 || assignMut.isPending,
              children: assignMut.isPending ? "Assigning…" : `Assign ${selectedLoadIds.size > 0 ? selectedLoadIds.size + " load" + (selectedLoadIds.size !== 1 ? "s" : "") : "loads"} to invoice`
            }
          )
        ] })
      ] }) });
    })()
  ] });
}
const HAULAGE_TAB_IDS = ["plans", "dispatches", "transfers", "grain-position", "invoices", "directory"];
function HaulagePageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "haulage", farmId, validIds: HAULAGE_TAB_IDS, defaultTab: "dispatches", urlOverride: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Haulage & Transport", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "plans", onClick: () => setTab("plans"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 14, className: "mr-1" }),
        "Dispatch Plans"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "dispatches", onClick: () => setTab("dispatches"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 14, className: "mr-1" }),
        "Dispatches"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "transfers", onClick: () => setTab("transfers"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 14, className: "mr-1" }),
        "On-Farm Transfers"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "grain-position", onClick: () => setTab("grain-position"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 14, className: "mr-1" }),
        "Grain Position"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "invoices", onClick: () => setTab("invoices"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { size: 14, className: "mr-1" }),
        "Haulier Invoices"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "directory", onClick: () => setTab("directory"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 14, className: "mr-1" }),
        "Haulier Directory"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 20 }, children: [
      farmId && tab === "plans" && /* @__PURE__ */ jsxRuntimeExports.jsx(DispatchPlansTab, { farmId }),
      farmId && tab === "dispatches" && /* @__PURE__ */ jsxRuntimeExports.jsx(DispatchesTab, { farmId }),
      farmId && tab === "transfers" && /* @__PURE__ */ jsxRuntimeExports.jsx(TransfersTab, { farmId }),
      farmId && tab === "grain-position" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainPositionTab, { farmId, onGoToDispatches: () => setTab("dispatches") }),
      farmId && tab === "invoices" && /* @__PURE__ */ jsxRuntimeExports.jsx(HaulierInvoicesTab, { farmId }),
      farmId && tab === "directory" && /* @__PURE__ */ jsxRuntimeExports.jsx(HaulierDirectoryTab, { farmId })
    ] })
  ] });
}
export {
  HaulagePageFull as default
};
