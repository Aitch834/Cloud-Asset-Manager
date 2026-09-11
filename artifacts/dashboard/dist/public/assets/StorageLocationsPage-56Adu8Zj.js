import { s as createLucideIcon, b as useAppStore, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, B as Building2, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, e as LoaderCircle, L as Label, I as Input, N as DialogMutationError, U as FlaskConical } from "./index-B1C3mzZ2.js";
import { o as openPrintWindow } from "./print-report-ClU8-1P0.js";
import { g as gradeLabel } from "./harvestGrades-CRosQIUs.js";
import { Q as QRCodeSVG } from "./index-CRHJiM7F.js";
import { A as AppLayout, W as Warehouse, b as Layers, E as Flame, j as Truck, a as Wheat } from "./AppLayout-A41ldoN7.js";
import { T as Textarea } from "./textarea-yS7Volkz.js";
import { B as Badge } from "./badge-DSdwtcO4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-czwnzKqB.js";
import { u as usePersistedTab } from "./use-persisted-tab-D_js0Bgr.js";
import { a as usePersistedFilter } from "./use-persisted-filter--cWt7Zs0.js";
import { u as useSafeUser } from "./use-safe-clerk-CzOCyT8S.js";
import { S as StorageLocationMapPicker } from "./StorageLocationMapPicker-YLPmHV5i.js";
import { T as TabBar, a as TabButton } from "./tab-button-Ch0SVhLC.js";
import { u as useFarmMembers } from "./use-farm-members-kbeBE3DZ.js";
import { S as StaffSelect } from "./staff-select-DmFmWwBD.js";
import { R as ResponsiveContainer, C as Cell, T as Tooltip, X as XAxis, Y as YAxis, B as Bar } from "./generateCategoricalChart-Btlyd3np.js";
import { P as PieChart, a as Pie } from "./PieChart-wYdQ-9yq.js";
import { B as BarChart } from "./BarChart-UpInjRUL.js";
import { C as CartesianGrid } from "./CartesianGrid-CQ6rluh2.js";
import { C as CircleCheckBig } from "./circle-check-big-CJybT-9c.js";
import { C as CircleX } from "./circle-x-DXL3NU-C.js";
import { C as ChevronUp } from "./chevron-up-CGPzC4VH.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-DEs9ufEd.js";
import { Q as QrCode } from "./qr-code-O659hWal.js";
import { P as Pencil } from "./pencil-DFqelcaR.js";
import { P as Printer } from "./printer-IZ6kvxrN.js";
import { R as Receipt } from "./receipt-B6-lx6tR.js";
import { T as Thermometer } from "./thermometer-B8OTYggw.js";
import { W as Wind } from "./wind-BpyzmG8D.js";
import { E as Eye } from "./eye-Bg_-g5xP.js";
import { L as Link2 } from "./link-2-Ci4Yb_z6.js";
import { S as ShoppingCart } from "./shopping-cart-B5d8RpqD.js";
import "./database-DkcUwp1r.js";
import "./shield-alert-sO4r6egV.js";
import "./triangle-alert-BUadPAGV.js";
import "./shield-check-BBN7XEcX.js";
import "./tractor-CA-CFIge.js";
import "./index-BW-_jTh5.js";
import "./index-BJQbCAmV.js";
const __iconNode$1 = [
  ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M6 12h.01M18 12h.01", key: "113zkx" }]
];
const Banknote = createLucideIcon("banknote", __iconNode$1);
const __iconNode = [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
];
const Calculator = createLucideIcon("calculator", __iconNode);
const LOCATION_TYPES = [
  { value: "grain_store", label: "Grain Store" },
  { value: "silo", label: "Silo" },
  { value: "bin", label: "Bin" },
  { value: "temporary", label: "Temporary / Field Heap" },
  { value: "merchant", label: "Merchant / Off-farm" },
  { value: "cold_store", label: "Cold Store" },
  { value: "chemical_store", label: "Chemical Store" },
  { value: "seed_store", label: "Seed Store" },
  { value: "other", label: "Other" }
];
const GRAIN_TYPES = ["grain_store", "silo", "bin"];
const BIN_SUBTYPES = ["Bin", "Flat Store", "Grain Silo", "Bag Store", "Tower Silo", "Bunker"];
const DRYING_SYSTEMS = ["None", "Hot Air Batch", "Continuous Flow", "In-Situ", "Ambient Aeration"];
const CROP_TYPES = ["Wheat", "Barley", "Oilseed Rape", "Oats", "Rye", "Triticale", "Peas", "Beans", "Linseed", "Other"];
function typeLabel(type) {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
}
function typeBadgeVariant(type) {
  if (type === "grain_store" || type === "silo") return "default";
  if (type === "bin") return "secondary";
  return "outline";
}
function locToLatLng(loc) {
  if (loc.latitude && loc.longitude) {
    return { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
  }
  return null;
}
const emptyForm = () => ({
  name: "",
  type: "grain_store",
  capacityTonnes: "",
  locationDescription: "",
  notes: "",
  isActive: true,
  pin: null,
  binType: "Bin",
  dryingSystem: "None",
  aerationSystem: false,
  temperatureMonitoring: false,
  sensorCount: "",
  merchantName: "",
  merchantContact: "",
  merchantContractRef: "",
  storageRatePptWeek: "",
  intakeChargePpt: "",
  outloadingChargePpt: "",
  dryingChargePpt: "",
  insuranceRatePptWeek: ""
});
const emptyCharge = () => ({
  chargeDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  chargeType: "storage",
  description: "",
  quantityTonnes: "",
  rateUsed: "",
  amountPence: "",
  statementReference: "",
  statementDate: "",
  notes: ""
});
const emptyAutoGen = () => ({
  periodStart: new Date((/* @__PURE__ */ new Date()).setDate(1)).toISOString().slice(0, 10),
  periodEnd: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  quantityTonnes: "",
  chargeTypes: ["storage", "intake"]
});
const CHARGE_TYPE_LABELS = {
  storage: "Storage",
  intake: "Intake",
  outloading: "Outloading",
  drying: "Drying",
  insurance: "Insurance",
  other: "Other"
};
const MOVEMENT_TYPES = [
  { value: "intake", label: "Intake", direction: "in" },
  { value: "dispatch", label: "Dispatch", direction: "out" },
  { value: "transfer_in", label: "Transfer In", direction: "in" },
  { value: "transfer_out", label: "Transfer Out", direction: "out" },
  { value: "sample", label: "Sample Out", direction: "out" },
  { value: "drying_loss", label: "Drying Loss", direction: "out" },
  { value: "adjustment", label: "Adjustment", direction: "either" }
];
const movTypeDirection = (type) => MOVEMENT_TYPES.find((m) => m.value === type)?.direction ?? "in";
const emptyMovement = () => ({
  movementDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  movementType: "intake",
  direction: "in",
  commodity: "",
  variety: "",
  cropYear: "",
  quantityTonnes: "",
  reference: "",
  notes: ""
});
function fmtPence(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}
function LinkedRecordDetailDialog({
  farmId,
  linkedRecordType,
  linkedRecordId,
  onClose
}) {
  const haulQ = useQuery({
    queryKey: ["linked-haulage", farmId, linkedRecordId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage/${linkedRecordId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: linkedRecordType === "haulage_record"
  });
  const saleQ = useQuery({
    queryKey: ["linked-grain-sale", farmId, linkedRecordId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-sales/${linkedRecordId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: linkedRecordType === "grain_sale"
  });
  const harvestQ = useQuery({
    queryKey: ["linked-harvest", farmId, linkedRecordId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests/${linkedRecordId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: linkedRecordType === "harvest_record"
  });
  const isLoading = haulQ.isLoading || saleQ.isLoading || harvestQ.isLoading;
  function Row({ label, value }) {
    return value != null && value !== "" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[120px_1fr] gap-1 py-1 border-b border-muted/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: value })
    ] }) : null;
  }
  const recordLabel = linkedRecordType === "haulage_record" ? "Haulage Record" : linkedRecordType === "grain_sale" ? "Grain Sale" : linkedRecordType === "harvest_record" ? "Harvest Record" : "Linked Record";
  const RecordIcon = linkedRecordType === "haulage_record" ? Truck : linkedRecordType === "grain_sale" ? ShoppingCart : linkedRecordType === "harvest_record" ? Wheat : Link2;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 440 }, "aria-describedby": void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RecordIcon, { className: "h-4 w-4 text-muted-foreground" }),
      recordLabel
    ] }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "Loading…" }),
    linkedRecordType === "haulage_record" && haulQ.data?.record && (() => {
      const r = haulQ.data.record;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Ticket No", value: r.weighbridgeTicketNo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Date", value: r.departureDate ? r.departureDate.slice(0, 10) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Movement", value: r.movementType === "farm_exit_dispatch" ? "Farm exit / dispatch" : r.movementType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Commodity", value: [r.commodity, r.variety].filter(Boolean).join(" — ") || null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Weight", value: r.weightTonnes ? `${r.weightTonnes} t` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Destination", value: r.destination }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Vehicle", value: r.vehicleRegistration }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Driver", value: r.driverName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Haulier", value: r.haulierCompany }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Customer ref", value: r.customerRef })
      ] });
    })(),
    linkedRecordType === "grain_sale" && saleQ.data?.record && (() => {
      const r = saleQ.data.record;
      const price = r.pricePerTonnePence != null ? `£${(r.pricePerTonnePence / 100).toFixed(2)}/t` : null;
      const net = r.netValuePence != null ? `£${(r.netValuePence / 100).toFixed(2)}` : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Merchant ref", value: r.merchantRef }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Sale date", value: r.saleDate ? r.saleDate.slice(0, 10) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Sale type", value: r.saleType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Buyer", value: r.buyer }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Commodity", value: [r.commodity, r.variety].filter(Boolean).join(" — ") || null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Crop year", value: r.cropYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Tonnage", value: r.tonnage ? `${r.tonnage} t` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Price/tonne", value: price }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Net value", value: net }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Invoice No", value: r.invoiceNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Delivery date", value: r.deliveryDate ? r.deliveryDate.slice(0, 10) : null })
      ] });
    })(),
    linkedRecordType === "harvest_record" && harvestQ.data?.record && (() => {
      const r = harvestQ.data.record;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Harvest date", value: r.harvestDate ? r.harvestDate.slice(0, 10) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Field", value: r.field?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Crop", value: [r.crop?.cropType, r.crop?.variety].filter(Boolean).join(" — ") || null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Yield", value: r.yieldTonnes ? `${r.yieldTonnes} t` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Area harvested", value: r.areaHarvestedHa ? `${r.areaHarvestedHa} ha` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Moisture", value: r.moisturePercent ? `${r.moisturePercent}%` : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Grade", value: gradeLabel(r.qualityGrade) })
      ] });
    })(),
    !isLoading && (haulQ.isError || saleQ.isError || harvestQ.isError) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive py-4 text-center", children: "Could not load record. It may belong to a different module." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })
  ] }) });
}
const LINKED_RECORD_LABELS = {
  haulage_record: "Haulage",
  grain_sale: "Grain Sale",
  harvest_record: "Harvest"
};
function StockMovementsTab({ farmId, locationId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editMovement, setEditMovement] = reactExports.useState(null);
  const [viewMovement, setViewMovement] = reactExports.useState(null);
  const [movForm, setMovForm] = reactExports.useState(emptyMovement());
  const [deleteMovId, setDeleteMovId] = reactExports.useState(null);
  const [filterYear, setFilterYear] = usePersistedFilter({ page: "storage-stock-movements", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear()) });
  const [linkType, setLinkType] = reactExports.useState("");
  const [linkId, setLinkId] = reactExports.useState(null);
  const [viewLinked, setViewLinked] = reactExports.useState(null);
  const movQ = useQuery({
    queryKey: ["location-movements", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations/${locationId}/movements`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const movements = movQ.data?.records ?? [];
  const currentYear = String((/* @__PURE__ */ new Date()).getFullYear());
  const availableYears = Array.from(new Set(movements.map((m) => m.movementDate.slice(0, 4)))).sort((a, b) => b.localeCompare(a));
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear);
  const visible = filterYear === "__all__" ? movements : movements.filter((m) => m.movementDate.startsWith(filterYear));
  const totalIn = visible.filter((m) => m.direction === "in").reduce((s, m) => s + parseFloat(m.quantityTonnes || "0"), 0);
  const totalOut = visible.filter((m) => m.direction === "out").reduce((s, m) => s + parseFloat(m.quantityTonnes || "0"), 0);
  const balance = totalIn - totalOut;
  const saveMov = useMutation({
    mutationFn: (body) => {
      const url = editMovement ? `/api/farms/${farmId}/storage-locations/${locationId}/movements/${editMovement.id}` : `/api/farms/${farmId}/storage-locations/${locationId}/movements`;
      return fetch(url, { method: editMovement ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["location-movements", farmId, locationId] });
      setAddOpen(false);
      setEditMovement(null);
      setMovForm(emptyMovement());
      setLinkType("");
      setLinkId(null);
      toast({ title: editMovement ? "Movement updated" : "Movement saved" });
    },
    onError: () => toast({ title: "Failed to save movement", variant: "destructive" })
  });
  const deleteMov = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/storage-locations/${locationId}/movements/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["location-movements", farmId, locationId] });
      setDeleteMovId(null);
      toast({ title: "Movement deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const haulPickerQ = useQuery({
    queryKey: ["picker-haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`, { credentials: "include" }).then((r) => r.json()),
    enabled: addOpen && linkType === "haulage_record"
  });
  const salePickerQ = useQuery({
    queryKey: ["picker-grain-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-sales`, { credentials: "include" }).then((r) => r.json()),
    enabled: addOpen && linkType === "grain_sale"
  });
  const harvestPickerQ = useQuery({
    queryKey: ["picker-harvests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests`, { credentials: "include" }).then((r) => r.json()),
    enabled: addOpen && linkType === "harvest_record"
  });
  function printStockMovements() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const rows = visible.map((m) => `<tr>
      <td>${fmtD(m.movementDate)}</td>
      <td>${m.direction === "in" ? "IN" : "OUT"}</td>
      <td>${m.movementType ?? "—"}</td>
      <td>${m.commodity ?? "—"}</td>
      <td>${m.variety ?? "—"}</td>
      <td>${m.cropYear ?? "—"}</td>
      <td style="text-align:right">${parseFloat(m.quantityTonnes || "0").toFixed(3)}</td>
      <td>${m.reference ?? "—"}</td>
      <td>${m.notes ?? "—"}</td>
    </tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Stock Movements Register</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}tfoot td{font-weight:700;border-top:2px solid #d1d5db;padding:4px 6px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Stock Movements Register</h1>
<h2>${visible.length} movement${visible.length !== 1 ? "s" : ""}${filterYear !== "__all__" ? ` · ${filterYear}` : ""} · In: ${totalIn.toFixed(3)}t · Out: ${totalOut.toFixed(3)}t · Balance: ${balance.toFixed(3)}t · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Direction</th><th>Type</th><th>Commodity</th><th>Variety</th><th>Crop Year</th><th>Quantity (t)</th><th>Reference</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="6">Balance</td><td style="text-align:right">${balance.toFixed(3)}</td><td colspan="2"></td></tr></tfoot>
</table>
</body></html>`);
  }
  function openAdd() {
    setEditMovement(null);
    setMovForm(emptyMovement());
    setLinkType("");
    setLinkId(null);
    setAddOpen(true);
  }
  function openEdit(m) {
    setEditMovement(m);
    setMovForm({
      movementDate: m.movementDate,
      movementType: m.movementType,
      direction: m.direction,
      commodity: m.commodity ?? "",
      variety: m.variety ?? "",
      cropYear: m.cropYear ?? "",
      quantityTonnes: m.quantityTonnes,
      reference: m.reference ?? "",
      notes: m.notes ?? ""
    });
    setLinkType(m.linkedRecordType ?? "");
    setLinkId(m.linkedRecordId ?? null);
    setAddOpen(true);
  }
  function handleTypeChange(type) {
    const dir = movTypeDirection(type);
    setMovForm((f) => ({ ...f, movementType: type, direction: dir === "either" ? f.direction : dir }));
  }
  function handleSubmit() {
    saveMov.mutate({
      movementDate: movForm.movementDate,
      movementType: movForm.movementType,
      direction: movForm.direction,
      commodity: movForm.commodity || null,
      variety: movForm.variety || null,
      cropYear: movForm.cropYear || null,
      quantityTonnes: movForm.quantityTonnes,
      reference: movForm.reference || null,
      notes: movForm.notes || null,
      linkedRecordType: linkType || null,
      linkedRecordId: linkId || null
    });
  }
  function closeDialog() {
    setAddOpen(false);
    setEditMovement(null);
    setMovForm(emptyMovement());
    setLinkType("");
    setLinkId(null);
    saveMov.reset();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Year:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterYear,
            onChange: (e) => setFilterYear(e.target.value),
            className: "h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring",
            children: [
              availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All years" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        visible.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5 text-xs h-8", onClick: printStockMovements, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5 text-xs h-8", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Record Movement"
        ] })
      ] })
    ] }),
    visible.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-green-50 px-3 py-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-green-700 font-medium uppercase tracking-wide", children: "Total In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-green-800 tabular-nums", children: [
          totalIn.toFixed(2),
          " t"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-amber-50 px-3 py-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-amber-700 font-medium uppercase tracking-wide", children: "Total Out" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-amber-800 tabular-nums", children: [
          totalOut.toFixed(2),
          " t"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2 text-center ${balance >= 0 ? "bg-blue-50" : "bg-red-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[10px] font-medium uppercase tracking-wide ${balance >= 0 ? "text-blue-700" : "text-red-700"}`, children: "Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-sm font-bold tabular-nums ${balance >= 0 ? "text-blue-800" : "text-red-800"}`, children: [
          balance.toFixed(2),
          " t"
        ] })
      ] })
    ] }),
    movQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading movements…" }),
    !movQ.isLoading && movements.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No stock movements recorded yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: 'Use "Record Movement" to log intake, dispatch, or transfers.' })
    ] }),
    !movQ.isLoading && movements.length > 0 && visible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
      "No movements for ",
      filterYear,
      '. Select a different year or "All years".'
    ] }),
    visible.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium hidden sm:table-cell", children: "Commodity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium hidden md:table-cell", children: "Crop Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium hidden lg:table-cell", children: "Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2 font-medium", children: "Dir" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2 font-medium", children: "Qty (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2 w-14" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: visible.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 tabular-nums", children: m.movementDate }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium", children: MOVEMENT_TYPES.find((t) => t.value === m.movementType)?.label ?? m.movementType }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 hidden sm:table-cell text-muted-foreground", children: [
          m.commodity || "—",
          m.variety ? ` — ${m.variety}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell text-muted-foreground", children: m.cropYear || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden lg:table-cell max-w-[140px]", children: m.linkedRecordId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setViewLinked({ type: m.linkedRecordType, id: m.linkedRecordId }),
            className: "group flex items-center gap-1 text-blue-600 hover:text-blue-800",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[100px] text-xs underline underline-offset-2", children: m.reference || `#${m.linkedRecordId}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs truncate", children: m.reference || "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${m.direction === "in" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`, children: m.direction === "in" ? "IN" : "OUT" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-medium tabular-nums", children: parseFloat(m.quantityTonnes).toFixed(3) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewMovement(m), className: "p-1 rounded hover:bg-muted/50 text-muted-foreground", title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(m), className: "p-1 rounded hover:bg-muted/50", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteMovId(m.id), className: "p-1 rounded hover:bg-muted/50 text-destructive", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewMovement !== null, onOpenChange: (o) => {
      if (!o) setViewMovement(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Stock Movement" }) }),
      viewMovement && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-1 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewMovement.movementDate })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: MOVEMENT_TYPES.find((t) => t.value === viewMovement.movementType)?.label ?? viewMovement.movementType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Direction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${viewMovement.direction === "in" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`, children: viewMovement.direction === "in" ? "IN" : "OUT" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quantity (t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium tabular-nums", children: parseFloat(viewMovement.quantityTonnes).toFixed(3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Commodity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMovement.commodity || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMovement.variety || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crop Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMovement.cropYear || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMovement.reference || "—" })
        ] }),
        viewMovement.linkedRecordId && viewMovement.linkedRecordType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Linked Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setViewMovement(null);
                setViewLinked({ type: viewMovement.linkedRecordType, id: viewMovement.linkedRecordId });
              },
              className: "inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2 mt-0.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3.5 w-3.5 flex-shrink-0" }),
                LINKED_RECORD_LABELS[viewMovement.linkedRecordType] ?? viewMovement.linkedRecordType,
                " #",
                viewMovement.linkedRecordId
              ]
            }
          )
        ] }),
        viewMovement.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewMovement.notes })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewMovement(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) closeDialog();
      else setAddOpen(true);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editMovement ? "Edit Movement" : "Record Stock Movement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: movForm.movementDate, onChange: (e) => setMovForm((f) => ({ ...f, movementDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Movement type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: movForm.movementType, onValueChange: handleTypeChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MOVEMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        movTypeDirection(movForm.movementType) === "either" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: movForm.direction, onValueChange: (v) => setMovForm((f) => ({ ...f, direction: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in", children: "In (stock increase)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "out", children: "Out (stock decrease)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Commodity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "crop-types-list", placeholder: "e.g. Wheat", value: movForm.commodity, onChange: (e) => setMovForm((f) => ({ ...f, commodity: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "crop-types-list", children: CROP_TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c }, c)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Skyscraper", value: movForm.variety, onChange: (e) => setMovForm((f) => ({ ...f, variety: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 2024/25", value: movForm.cropYear, onChange: (e) => setMovForm((f) => ({ ...f, cropYear: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Quantity (tonnes) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", placeholder: "0.000", value: movForm.quantityTonnes, onChange: (e) => setMovForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Haulage ticket, contract ref, etc.", value: movForm.reference, onChange: (e) => setMovForm((f) => ({ ...f, reference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Optional notes", value: movForm.notes, onChange: (e) => setMovForm((f) => ({ ...f, notes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 border-t pt-3 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
            "Link to existing record ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Record type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: linkType || "__none__", onValueChange: (v) => {
              setLinkType(v === "__none__" ? "" : v);
              setLinkId(null);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— None —" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "haulage_record", children: "Haulage record" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "grain_sale", children: "Grain sale" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "harvest_record", children: "Harvest record" })
              ] })
            ] })
          ] }),
          linkType === "haulage_record" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Select haulage record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: linkId ? String(linkId) : "__none__", onValueChange: (v) => {
              if (v === "__none__") {
                setLinkId(null);
                return;
              }
              const id = parseInt(v);
              setLinkId(id);
              const rec = (haulPickerQ.data?.records ?? []).find((r) => r.id === id);
              if (rec) setMovForm((f) => ({ ...f, reference: rec.weighbridgeTicketNo || `HAU-${id}` }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                (haulPickerQ.data?.records ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  r.weighbridgeTicketNo || `HAU-${r.id}`,
                  r.commodity ? ` · ${r.commodity}` : "",
                  r.weightTonnes ? ` · ${r.weightTonnes}t` : "",
                  r.destination ? ` → ${r.destination}` : ""
                ] }, r.id))
              ] })
            ] })
          ] }),
          linkType === "grain_sale" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Select grain sale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: linkId ? String(linkId) : "__none__", onValueChange: (v) => {
              if (v === "__none__") {
                setLinkId(null);
                return;
              }
              const id = parseInt(v);
              setLinkId(id);
              const rec = (salePickerQ.data?.records ?? []).find((r) => r.id === id);
              if (rec) setMovForm((f) => ({ ...f, reference: rec.merchantRef || `SALE-${id}` }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                (salePickerQ.data?.records ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  r.merchantRef || `SALE-${r.id}`,
                  " · ",
                  r.buyer,
                  " · ",
                  r.commodity,
                  " ",
                  r.tonnage,
                  "t"
                ] }, r.id))
              ] })
            ] })
          ] }),
          linkType === "harvest_record" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Select harvest record" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: linkId ? String(linkId) : "__none__", onValueChange: (v) => {
              if (v === "__none__") {
                setLinkId(null);
                return;
              }
              const id = parseInt(v);
              setLinkId(id);
              const rec = (harvestPickerQ.data?.records ?? []).find((r) => r.id === id);
              if (rec) setMovForm((f) => ({ ...f, reference: `${rec.harvestDate?.slice(0, 10) ?? ""} ${rec.field?.name ?? ""} ${rec.crop?.cropType ?? ""}`.trim() }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                (harvestPickerQ.data?.records ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  r.harvestDate?.slice(0, 10) ?? "?",
                  " · ",
                  r.field?.name ?? "?",
                  " · ",
                  r.crop?.cropType ?? "?",
                  r.yieldTonnes ? ` ${r.yieldTonnes}t` : ""
                ] }, r.id))
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMov, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !movForm.movementDate || !movForm.quantityTonnes || saveMov.isPending, onClick: handleSubmit, children: saveMov.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editMovement ? "Save Changes" : "Save Movement" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteMovId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteMovId(null);
        deleteMov.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Movement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMov, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteMovId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMov.isPending, onClick: () => deleteMovId !== null && deleteMov.mutate(deleteMovId), children: deleteMov.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) }),
    viewLinked && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LinkedRecordDetailDialog,
      {
        farmId,
        linkedRecordType: viewLinked.type,
        linkedRecordId: viewLinked.id,
        onClose: () => setViewLinked(null)
      }
    )
  ] });
}
function MerchantChargesPanel({ farmId, locationId, location }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editCharge, setEditCharge] = reactExports.useState(null);
  const [chargeForm, setChargeForm] = reactExports.useState(emptyCharge());
  const [deleteChargeId, setDeleteChargeId] = reactExports.useState(null);
  const [autoGenOpen, setAutoGenOpen] = reactExports.useState(false);
  const [autoGenForm, setAutoGenForm] = reactExports.useState(emptyAutoGen());
  const [filterYear, setFilterYear] = usePersistedFilter({ page: "storage-merchant-charges", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear()) });
  const chargesQ = useQuery({
    queryKey: ["merchant-charges", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations/${locationId}/charges`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const charges = chargesQ.data?.records ?? [];
  const availableYears = Array.from(
    new Set(charges.map((c) => c.chargeDate.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a));
  const currentYear = String((/* @__PURE__ */ new Date()).getFullYear());
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear);
  const visibleCharges = filterYear === "__all__" ? charges : charges.filter((c) => c.chargeDate.startsWith(filterYear));
  const totalPence = visibleCharges.reduce((s, c) => s + c.amountPence, 0);
  const saveCharge = useMutation({
    mutationFn: (body) => {
      const url = editCharge ? `/api/farms/${farmId}/storage-locations/${locationId}/charges/${editCharge.id}` : `/api/farms/${farmId}/storage-locations/${locationId}/charges`;
      return fetch(url, { method: editCharge ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-charges", farmId, locationId] });
      setAddOpen(false);
      setEditCharge(null);
      setChargeForm(emptyCharge());
      toast({ title: editCharge ? "Charge updated" : "Charge saved" });
    },
    onError: () => toast({ title: "Failed to save charge", variant: "destructive" })
  });
  const deleteCharge = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/storage-locations/${locationId}/charges/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-charges", farmId, locationId] });
      setDeleteChargeId(null);
      toast({ title: "Charge deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const autoGenMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/storage-locations/${locationId}/charges/auto-generate`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["merchant-charges", farmId, locationId] });
      setAutoGenOpen(false);
      setAutoGenForm(emptyAutoGen());
      toast({ title: `${data.records?.length ?? 0} charge line(s) generated` });
    },
    onError: () => toast({ title: "Auto-generate failed", variant: "destructive" })
  });
  function openAdd() {
    setEditCharge(null);
    setChargeForm(emptyCharge());
    setAddOpen(true);
  }
  function openEdit(c) {
    setEditCharge(c);
    setChargeForm({
      chargeDate: c.chargeDate,
      chargeType: c.chargeType,
      description: c.description ?? "",
      quantityTonnes: c.quantityTonnes ?? "",
      rateUsed: c.rateUsed ?? "",
      amountPence: String(c.amountPence / 100),
      statementReference: c.statementReference ?? "",
      statementDate: c.statementDate ?? "",
      notes: c.notes ?? ""
    });
    setAddOpen(true);
  }
  const hasRates = !!(location.storageRatePptWeek || location.intakeChargePpt || location.outloadingChargePpt || location.dryingChargePpt || location.insuranceRatePptWeek);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-0 py-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/20 border-t px-6 py-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-amber-600" }),
        "Merchant Storage Charges",
        location.merchantName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-xs", children: [
          "— ",
          location.merchantName
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground whitespace-nowrap", children: "Year:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterYear,
              onChange: (e) => setFilterYear(e.target.value),
              className: "h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring",
              children: [
                availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All years" })
              ]
            }
          )
        ] }),
        hasRates && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5 text-xs h-8", onClick: () => {
          setAutoGenForm(emptyAutoGen());
          setAutoGenOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-3.5 w-3.5" }),
          " Auto-generate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5 text-xs h-8", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Manual Charge"
        ] })
      ] })
    ] }),
    chargesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Loading charges…" }),
    !chargesQ.isLoading && charges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
      "No charges recorded yet.",
      hasRates ? " Use Auto-generate to create charges from the rate card, or add a manual charge." : " Add a manual charge or set up rate card fields in Edit Location."
    ] }),
    !chargesQ.isLoading && charges.length > 0 && visibleCharges.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
      "No charges for ",
      filterYear,
      '. Select a different year or choose "All years".'
    ] }),
    visibleCharges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 pr-3 font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 pr-3 font-medium", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1.5 pr-3 font-medium", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5 pr-3 font-medium", children: "Qty (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5 pr-3 font-medium", children: "Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1.5 pr-3 font-medium", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-1.5 w-14" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-muted/30", children: visibleCharges.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 tabular-nums", children: c.chargeDate }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium", children: [
          CHARGE_TYPE_LABELS[c.chargeType] ?? c.chargeType,
          c.isAutoGenerated && /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-2.5 w-2.5" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-muted-foreground max-w-[200px] truncate", children: c.description || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-right tabular-nums", children: c.quantityTonnes || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-right tabular-nums", children: c.rateUsed ? `£${parseFloat(c.rateUsed).toFixed(4)}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-right font-medium tabular-nums", children: fmtPence(c.amountPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(c), className: "p-1 rounded hover:bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteChargeId(c.id), className: "p-1 rounded hover:bg-muted/50 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
        ] }) })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "py-2 pr-3 text-right font-semibold text-xs", children: filterYear === "__all__" ? "Total (all years):" : `Total ${filterYear}:` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right font-bold text-sm text-amber-800", children: fmtPence(totalPence) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        setEditCharge(null);
        setChargeForm(emptyCharge());
        saveCharge.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editCharge ? "Edit Charge" : "Add Manual Charge" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: chargeForm.chargeDate, onChange: (e) => setChargeForm((f) => ({ ...f, chargeDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Charge type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: chargeForm.chargeType, onValueChange: (v) => setChargeForm((f) => ({ ...f, chargeType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(CHARGE_TYPE_LABELS).map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: l }, v)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Storage Oct–Nov 2024", value: chargeForm.description, onChange: (e) => setChargeForm((f) => ({ ...f, description: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "250", value: chargeForm.quantityTonnes, onChange: (e) => setChargeForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate (£/t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "0.50", value: chargeForm.rateUsed, onChange: (e) => setChargeForm((f) => ({ ...f, rateUsed: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Amount (£) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "125.00", value: chargeForm.amountPence, onChange: (e) => setChargeForm((f) => ({ ...f, amountPence: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "INV-2024-001", value: chargeForm.statementReference, onChange: (e) => setChargeForm((f) => ({ ...f, statementReference: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Statement date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: chargeForm.statementDate, onChange: (e) => setChargeForm((f) => ({ ...f, statementDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional notes", value: chargeForm.notes, onChange: (e) => setChargeForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCharge, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: saveCharge.isPending || !chargeForm.chargeDate || !chargeForm.amountPence,
            onClick: () => saveCharge.mutate({
              chargeDate: chargeForm.chargeDate,
              chargeType: chargeForm.chargeType,
              description: chargeForm.description || null,
              quantityTonnes: chargeForm.quantityTonnes || null,
              rateUsed: chargeForm.rateUsed || null,
              amountPence: Math.round(parseFloat(chargeForm.amountPence || "0") * 100),
              statementReference: chargeForm.statementReference || null,
              statementDate: chargeForm.statementDate || null,
              notes: chargeForm.notes || null
            }),
            children: saveCharge.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editCharge ? "Save Changes" : "Add Charge"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: autoGenOpen, onOpenChange: (o) => {
      setAutoGenOpen(o);
      if (!o) {
        setAutoGenForm(emptyAutoGen());
        autoGenMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-4 w-4 text-amber-600" }),
        " Auto-generate Charges"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Generate charge lines from the rate card configured for this location." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Period start ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: autoGenForm.periodStart, onChange: (e) => setAutoGenForm((f) => ({ ...f, periodStart: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Period end ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: autoGenForm.periodEnd, onChange: (e) => setAutoGenForm((f) => ({ ...f, periodEnd: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Quantity (tonnes) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 250", value: autoGenForm.quantityTonnes, onChange: (e) => setAutoGenForm((f) => ({ ...f, quantityTonnes: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Charge types to include" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["storage", "intake", "outloading", "drying", "insurance"].map((ct) => {
            const rateKey = ct === "storage" ? "storageRatePptWeek" : ct === "intake" ? "intakeChargePpt" : ct === "outloading" ? "outloadingChargePpt" : ct === "drying" ? "dryingChargePpt" : "insuranceRatePptWeek";
            const hasRate = !!location[rateKey];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-colors ${autoGenForm.chargeTypes.includes(ct) ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-muted/30 text-muted-foreground"} ${!hasRate ? "opacity-40" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  className: "sr-only",
                  checked: autoGenForm.chargeTypes.includes(ct),
                  disabled: !hasRate,
                  onChange: (e) => setAutoGenForm((f) => ({ ...f, chargeTypes: e.target.checked ? [...f.chargeTypes, ct] : f.chargeTypes.filter((x) => x !== ct) }))
                }
              ),
              CHARGE_TYPE_LABELS[ct],
              hasRate && location[rateKey] && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono opacity-60", children: [
                "£",
                parseFloat(location[rateKey]).toFixed(4)
              ] }),
              !hasRate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-60", children: "no rate" })
            ] }, ct);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: autoGenMut, message: "Failed to generate charges — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAutoGenOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: autoGenMut.isPending || !autoGenForm.periodStart || !autoGenForm.periodEnd || !autoGenForm.quantityTonnes || autoGenForm.chargeTypes.length === 0,
            onClick: () => autoGenMut.mutate({ periodStart: autoGenForm.periodStart, periodEnd: autoGenForm.periodEnd, quantityTonnes: parseFloat(autoGenForm.quantityTonnes), chargeTypes: autoGenForm.chargeTypes }),
            children: autoGenMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Generate Charges"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteChargeId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteChargeId(null);
        deleteCharge.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Charge" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteCharge, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteChargeId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteCharge.isPending, onClick: () => deleteChargeId !== null && deleteCharge.mutate(deleteChargeId), children: deleteCharge.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] }) });
}
const emptyQualityTest = () => ({
  testDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  cropType: "Wheat",
  variety: "",
  harvestYear: String((/* @__PURE__ */ new Date()).getFullYear()),
  moisturePercent: "",
  specificWeightKgHl: "",
  proteinPercent: "",
  hagbergFallingNumber: "",
  screeningsPercent: "",
  overallGrade: "",
  testingLab: "",
  certificateReference: "",
  notes: ""
});
const emptyTempLog = () => ({
  logDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  logTime: "",
  temperatureC: "",
  sensorPosition: "",
  moisturePercent: "",
  aerationRunning: false,
  dryingRunning: false,
  recordedBy: "",
  notes: ""
});
function GrainDryingTab({ farmId, locationId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const { data: dryMembersData, isLoading: dryMembersLoading } = useFarmMembers(farmId);
  const dryStaffNames = (dryMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm2 = { dryingDate: "", cropType: "", moistureIn: "", moistureOut: "", tempC: "", durationHours: "", fuelLitres: "", operatorName: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...emptyForm2 });
  const q = useQuery({
    queryKey: ["grain-drying", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-drying?locationId=${locationId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = Array.isArray(q.data?.records) ? q.data.records : [];
  const saveMut = useMutation({
    mutationFn: (data) => {
      const id = editItem?.id;
      return fetch(id ? `/api/farms/${farmId}/grain-drying/${id}` : `/api/farms/${farmId}/grain-drying`, {
        method: id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locationId })
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-drying", farmId, locationId] });
      setOpen(false);
      toast({ title: "Drying record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-drying/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-drying", farmId, locationId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm2, operatorName: myName });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditItem(r);
    setForm({ dryingDate: r.dryingDate?.slice(0, 10) ?? "", cropType: r.cropType ?? "", moistureIn: r.moistureIn ?? "", moistureOut: r.moistureOut ?? "", tempC: r.tempC ?? "", durationHours: r.durationHours ?? "", fuelLitres: r.fuelLitres ?? "", operatorName: r.operatorName ?? "", notes: r.notes ?? "" });
    setOpen(true);
  };
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      "Log Drying Run"
    ] }) }),
    q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !q.isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No drying records for this location yet." })
    ] }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Crop" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden sm:table-cell", children: "Moisture In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden sm:table-cell", children: "Moisture Out" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Temp (°C)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Hours" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtD(r.dryingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.cropType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell", children: r.moistureIn != null ? `${r.moistureIn}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell", children: r.moistureOut != null ? `${r.moistureOut}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell", children: r.tempC ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell", children: r.durationHours ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteId(r.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editItem ? "Edit" : "Log",
        " Drying Run"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.dryingDate, onChange: (e) => f("dryingDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cropType, onChange: (e) => f("cropType")(e.target.value), placeholder: "e.g. Winter Wheat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture In (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.moistureIn, onChange: (e) => f("moistureIn")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture Out (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.moistureOut, onChange: (e) => f("moistureOut")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drying Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: form.tempC, onChange: (e) => f("tempC")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration (hours)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: form.durationHours, onChange: (e) => f("durationHours")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fuel Used (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.fuelLitres, onChange: (e) => f("fuelLitres")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.operatorName, onChange: f("operatorName"), staffNames: dryStaffNames, loading: dryMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: (e) => f("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.dryingDate || !form.cropType || saveMut.isPending, onClick: () => saveMut.mutate(form), children: saveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewItem !== null, onOpenChange: (o) => {
      if (!o) setViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Drying Record" }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtD(viewItem.dryingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.cropType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Moisture In" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.moistureIn != null ? `${viewItem.moistureIn}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Moisture Out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.moistureOut != null ? `${viewItem.moistureOut}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.tempC ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Duration (hrs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.durationHours ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fuel (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.fuelLitres ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.operatorName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.notes || "—" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Drying Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: deleteMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
function GrainConditioningTab({ farmId, locationId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const { data: condMembersData, isLoading: condMembersLoading } = useFarmMembers(farmId);
  const condStaffNames = (condMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewItem, setViewItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const emptyForm2 = { conditioningDate: "", cropType: "", treatmentType: "", productUsed: "", rateKgT: "", totalKg: "", targetMoisture: "", operatorName: "", notes: "" };
  const [form, setForm] = reactExports.useState({ ...emptyForm2 });
  const q = useQuery({
    queryKey: ["grain-conditioning", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-conditioning?locationId=${locationId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const records = Array.isArray(q.data?.records) ? q.data.records : [];
  const saveMut = useMutation({
    mutationFn: (data) => {
      const id = editItem?.id;
      return fetch(id ? `/api/farms/${farmId}/grain-conditioning/${id}` : `/api/farms/${farmId}/grain-conditioning`, {
        method: id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locationId })
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-conditioning", farmId, locationId] });
      setOpen(false);
      toast({ title: "Conditioning record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-conditioning/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-conditioning", farmId, locationId] });
      setDeleteId(null);
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm2, operatorName: myName });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditItem(r);
    setForm({ conditioningDate: r.conditioningDate?.slice(0, 10) ?? "", cropType: r.cropType ?? "", treatmentType: r.treatmentType ?? "", productUsed: r.productUsed ?? "", rateKgT: r.rateKgT ?? "", totalKg: r.totalKg ?? "", targetMoisture: r.targetMoisture ?? "", operatorName: r.operatorName ?? "", notes: r.notes ?? "" });
    setOpen(true);
  };
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const TREATMENT_TYPES = ["Aeration", "Ambient aeration", "Insecticide treatment", "Fungicide treatment", "Blending", "Turning", "Other"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
      "Log Conditioning"
    ] }) }),
    q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
    !q.isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No conditioning records for this location yet." })
    ] }),
    records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Crop" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden sm:table-cell", children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtD(r.conditioningDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.cropType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell", children: r.treatmentType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell", children: r.productUsed || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewItem(r), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteId(r.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editItem ? "Edit" : "Log",
        " Conditioning"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.conditioningDate, onChange: (e) => f("conditioningDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cropType, onChange: (e) => f("cropType")(e.target.value), placeholder: "e.g. Winter Wheat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.treatmentType, onValueChange: (v) => f("treatmentType")(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TREATMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productUsed, onChange: (e) => f("productUsed")(e.target.value), placeholder: "e.g. Actellic 50 EC" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate (kg/t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.rateKgT, onChange: (e) => f("rateKgT")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Applied (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.totalKg, onChange: (e) => f("totalKg")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.targetMoisture, onChange: (e) => f("targetMoisture")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.operatorName, onChange: f("operatorName"), staffNames: condStaffNames, loading: condMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: (e) => f("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.conditioningDate || !form.cropType || saveMut.isPending, onClick: () => saveMut.mutate(form), children: saveMut.isPending ? "Saving…" : "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewItem !== null, onOpenChange: (o) => {
      if (!o) setViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Conditioning Record" }) }),
      viewItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtD(viewItem.conditioningDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewItem.cropType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Treatment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.treatmentType || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.productUsed || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rate (kg/t)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.rateKgT ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.totalKg ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Target Moisture" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.targetMoisture != null ? `${viewItem.targetMoisture}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.operatorName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewItem.notes || "—" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Conditioning Record?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: deleteMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
function GrainMonitoringPanel({ farmId, locationId, locationType }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: clerkUser } = useSafeUser();
  const myName = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "";
  const { data: monMembersData, isLoading: monMembersLoading } = useFarmMembers(farmId);
  const monStaffNames = (monMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const [tab, setTab] = reactExports.useState("stock");
  const [testOpen, setTestOpen] = reactExports.useState(false);
  const [editTest, setEditTest] = reactExports.useState(null);
  const [viewTest, setViewTest] = reactExports.useState(null);
  const [testForm, setTestForm] = reactExports.useState(emptyQualityTest());
  const [deleteTestId, setDeleteTestId] = reactExports.useState(null);
  const [tempOpen, setTempOpen] = reactExports.useState(false);
  const [editTemp, setEditTemp] = reactExports.useState(null);
  const [viewTemp, setViewTemp] = reactExports.useState(null);
  const [tempForm, setTempForm] = reactExports.useState(emptyTempLog());
  const [deleteTempId, setDeleteTempId] = reactExports.useState(null);
  const testsQ = useQuery({
    queryKey: ["grain-quality-tests", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-quality-tests?locationId=${locationId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && tab === "quality"
  });
  const tests = Array.isArray(testsQ.data) ? testsQ.data : [];
  const tempsQ = useQuery({
    queryKey: ["grain-temperature-logs", farmId, locationId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-temperature-logs?locationId=${locationId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && tab === "temperature"
  });
  const temps = Array.isArray(tempsQ.data) ? tempsQ.data : [];
  const saveTest = useMutation({
    mutationFn: (body) => {
      const url = editTest ? `/api/farms/${farmId}/grain-quality-tests/${editTest.id}` : `/api/farms/${farmId}/grain-quality-tests`;
      return fetch(url, { method: editTest ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-quality-tests", farmId, locationId] });
      setTestOpen(false);
      setEditTest(null);
      setTestForm(emptyQualityTest());
      toast({ title: editTest ? "Test updated" : "Test saved" });
    },
    onError: () => toast({ title: "Failed to save test", variant: "destructive" })
  });
  const deleteTest = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-quality-tests/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-quality-tests", farmId, locationId] });
      setDeleteTestId(null);
      toast({ title: "Test deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveTemp = useMutation({
    mutationFn: (body) => {
      const url = editTemp ? `/api/farms/${farmId}/grain-temperature-logs/${editTemp.id}` : `/api/farms/${farmId}/grain-temperature-logs`;
      return fetch(url, { method: editTemp ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-temperature-logs", farmId, locationId] });
      setTempOpen(false);
      setEditTemp(null);
      setTempForm(emptyTempLog());
      toast({ title: editTemp ? "Log updated" : "Log saved" });
    },
    onError: () => toast({ title: "Failed to save log", variant: "destructive" })
  });
  const deleteTemp = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/grain-temperature-logs/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grain-temperature-logs", farmId, locationId] });
      setDeleteTempId(null);
      toast({ title: "Log deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAddTest() {
    setEditTest(null);
    setTestForm(emptyQualityTest());
    setTestOpen(true);
  }
  function openEditTest(t) {
    setEditTest(t);
    setTestForm({
      testDate: t.testDate,
      cropType: t.cropType,
      variety: t.variety ?? "",
      harvestYear: t.harvestYear != null ? String(t.harvestYear) : "",
      moisturePercent: t.moisturePercent ?? "",
      specificWeightKgHl: t.specificWeightKgHl ?? "",
      proteinPercent: t.proteinPercent ?? "",
      hagbergFallingNumber: t.hagbergFallingNumber != null ? String(t.hagbergFallingNumber) : "",
      screeningsPercent: t.screeningsPercent ?? "",
      overallGrade: t.overallGrade ?? "",
      testingLab: t.testingLab ?? "",
      certificateReference: t.certificateReference ?? "",
      notes: t.notes ?? ""
    });
    setTestOpen(true);
  }
  function openAddTemp() {
    setEditTemp(null);
    setTempForm({ ...emptyTempLog(), recordedBy: myName });
    setTempOpen(true);
  }
  function openEditTemp(l) {
    setEditTemp(l);
    setTempForm({
      logDate: l.logDate,
      logTime: l.logTime ?? "",
      temperatureC: l.temperatureC,
      sensorPosition: l.sensorPosition ?? "",
      moisturePercent: l.moisturePercent ?? "",
      aerationRunning: l.aerationRunning ?? false,
      dryingRunning: l.dryingRunning ?? false,
      recordedBy: l.recordedBy ?? "",
      notes: l.notes ?? ""
    });
    setTempOpen(true);
  }
  const isGrainMonitored = GRAIN_TYPES.includes(locationType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 7, className: "px-0 py-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/20 border-t px-6 py-4 space-y-3", children: isGrainMonitored ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "stock", onClick: () => setTab("stock"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3.5 w-3.5" }),
          " Stock Movements"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "quality", onClick: () => setTab("quality"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-3.5 w-3.5" }),
          " Quality Tests"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "temperature", onClick: () => setTab("temperature"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "h-3.5 w-3.5" }),
          " Temperature Logs"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "drying", onClick: () => setTab("drying"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-3.5 w-3.5" }),
          " Drying Records"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "conditioning", onClick: () => setTab("conditioning"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { className: "h-3.5 w-3.5" }),
          " Conditioning"
        ] }) })
      ] }),
      tab === "stock" && /* @__PURE__ */ jsxRuntimeExports.jsx(StockMovementsTab, { farmId, locationId }),
      tab === "quality" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddTest, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Record Quality Test"
        ] }) }),
        testsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading tests…" }),
        !testsQ.isLoading && tests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No quality tests for this location yet." })
        ] }),
        tests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden sm:table-cell", children: "Moisture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Protein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden lg:table-cell", children: "Hagberg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden lg:table-cell", children: "Grade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: tests.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 font-mono text-xs", children: t.testDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5", children: [
              t.cropType,
              t.variety ? ` — ${t.variety}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden sm:table-cell text-muted-foreground", children: t.moisturePercent ? `${t.moisturePercent}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden md:table-cell text-muted-foreground", children: t.proteinPercent ? `${t.proteinPercent}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden lg:table-cell text-muted-foreground", children: t.hagbergFallingNumber ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden lg:table-cell text-muted-foreground", children: t.overallGrade || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewTest(t), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEditTest(t), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteTestId(t.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
            ] }) })
          ] }, t.id)) })
        ] }) })
      ] }),
      tab === "temperature" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAddTemp, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Log Temperature"
        ] }) }),
        tempsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading logs…" }),
        !tempsQ.isLoading && temps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-8 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No temperature readings for this location yet." })
        ] }),
        temps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Date / Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Temp (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden sm:table-cell", children: "Sensor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Moisture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden lg:table-cell", children: "Systems" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: temps.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 font-mono text-xs", children: [
              l.logDate,
              l.logTime ? ` ${l.logTime}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2.5 font-semibold", children: [
              l.temperatureC,
              "°C"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden sm:table-cell text-muted-foreground", children: l.sensorPosition || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden md:table-cell text-muted-foreground", children: l.moisturePercent ? `${l.moisturePercent}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 hidden lg:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 text-xs", children: [
              l.aerationRunning && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5", children: "Aeration" }),
              l.dryingRunning && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-orange-50 text-orange-700 border border-orange-200 rounded px-1.5 py-0.5", children: "Drying" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setViewTemp(l), title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEditTemp(l), title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteTempId(l.id), title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
            ] }) })
          ] }, l.id)) })
        ] }) })
      ] }),
      tab === "drying" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainDryingTab, { farmId, locationId }),
      tab === "conditioning" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainConditioningTab, { farmId, locationId })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StockMovementsTab, { farmId, locationId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewTest !== null, onOpenChange: (o) => {
      if (!o) setViewTest(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Quality Test" }) }),
      viewTest && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-1 text-sm max-h-[70vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewTest.testDate })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crop Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewTest.cropType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.variety || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Harvest Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.harvestYear ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.moisturePercent ? `${viewTest.moisturePercent}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Specific Weight (kg/hl)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.specificWeightKgHl ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Protein (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.proteinPercent ? `${viewTest.proteinPercent}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hagberg Falling No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.hagbergFallingNumber ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Screenings (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.screeningsPercent ? `${viewTest.screeningsPercent}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Overall Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.overallGrade || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Testing Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.testingLab || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Certificate Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.certificateReference || "—" })
        ] }),
        viewTest.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTest.notes })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewTest(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewTemp !== null, onOpenChange: (o) => {
      if (!o) setViewTemp(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Temperature Log" }) }),
      viewTemp && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-1 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewTemp.logDate })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.logTime || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
            viewTemp.temperatureC,
            "°C"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sensor Position" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.sensorPosition || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.moisturePercent ? `${viewTemp.moisturePercent}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.recordedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Aeration Running" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.aerationRunning ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Drying Running" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.dryingRunning ? "Yes" : "No" })
        ] }),
        viewTemp.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewTemp.notes })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewTemp(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: testOpen, onOpenChange: (o) => {
      setTestOpen(o);
      if (!o) {
        setEditTest(null);
        setTestForm(emptyQualityTest());
        saveTest.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 580 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTest ? "Edit Quality Test" : "Record Quality Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Test Date ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: testForm.testDate, onChange: (e) => setTestForm((f) => ({ ...f, testDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Crop Type ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: testForm.cropType, onValueChange: (v) => setTestForm((f) => ({ ...f, cropType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CROP_TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Crusoe", value: testForm.variety, onChange: (e) => setTestForm((f) => ({ ...f, variety: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 2024", value: testForm.harvestYear, onChange: (e) => setTestForm((f) => ({ ...f, harvestYear: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 14.5", value: testForm.moisturePercent, onChange: (e) => setTestForm((f) => ({ ...f, moisturePercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Specific Weight (kg/hl)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 76.5", value: testForm.specificWeightKgHl, onChange: (e) => setTestForm((f) => ({ ...f, specificWeightKgHl: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 12.5", value: testForm.proteinPercent, onChange: (e) => setTestForm((f) => ({ ...f, proteinPercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hagberg Falling Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 250", value: testForm.hagbergFallingNumber, onChange: (e) => setTestForm((f) => ({ ...f, hagbergFallingNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Screenings (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 2.1", value: testForm.screeningsPercent, onChange: (e) => setTestForm((f) => ({ ...f, screeningsPercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Group 1, Feed", value: testForm.overallGrade, onChange: (e) => setTestForm((f) => ({ ...f, overallGrade: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. NRM Laboratories", value: testForm.testingLab, onChange: (e) => setTestForm((f) => ({ ...f, testingLab: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. NRM-2024-001234", value: testForm.certificateReference, onChange: (e) => setTestForm((f) => ({ ...f, certificateReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: testForm.notes, onChange: (e) => setTestForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveTest, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTestOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !testForm.testDate || !testForm.cropType || saveTest.isPending,
            onClick: () => saveTest.mutate({
              locationId,
              testDate: testForm.testDate,
              cropType: testForm.cropType,
              variety: testForm.variety || null,
              harvestYear: testForm.harvestYear ? parseInt(testForm.harvestYear) : null,
              moisturePercent: testForm.moisturePercent || null,
              specificWeightKgHl: testForm.specificWeightKgHl || null,
              proteinPercent: testForm.proteinPercent || null,
              hagbergFallingNumber: testForm.hagbergFallingNumber ? parseInt(testForm.hagbergFallingNumber) : null,
              screeningsPercent: testForm.screeningsPercent || null,
              overallGrade: testForm.overallGrade || null,
              testingLab: testForm.testingLab || null,
              certificateReference: testForm.certificateReference || null,
              notes: testForm.notes || null
            }),
            children: saveTest.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editTest ? "Save Changes" : "Save Test"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteTestId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteTestId(null);
        deleteTest.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Quality Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteTest, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTestId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteTest.isPending, onClick: () => deleteTestId !== null && deleteTest.mutate(deleteTestId), children: deleteTest.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tempOpen, onOpenChange: (o) => {
      setTempOpen(o);
      if (!o) {
        setEditTemp(null);
        setTempForm(emptyTempLog());
        saveTemp.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTemp ? "Edit Temperature Log" : "Log Temperature Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 pt-2 max-h-[70vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Date ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: tempForm.logDate, onChange: (e) => setTempForm((f) => ({ ...f, logDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: tempForm.logTime, onChange: (e) => setTempForm((f) => ({ ...f, logTime: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Temperature (°C) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 15.5", value: tempForm.temperatureC, onChange: (e) => setTempForm((f) => ({ ...f, temperatureC: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sensor Position" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Top centre, Bay 2", value: tempForm.sensorPosition, onChange: (e) => setTempForm((f) => ({ ...f, sensorPosition: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "e.g. 14.0", value: tempForm.moisturePercent, onChange: (e) => setTempForm((f) => ({ ...f, moisturePercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: tempForm.recordedBy, onChange: (v) => setTempForm((f) => ({ ...f, recordedBy: v })), staffNames: monStaffNames, loading: monMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: `tmp-aer-${locationId}`, type: "checkbox", checked: tempForm.aerationRunning, onChange: (e) => setTempForm((f) => ({ ...f, aerationRunning: e.target.checked })), className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `tmp-aer-${locationId}`, className: "cursor-pointer font-normal", children: "Aeration running" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: `tmp-dry-${locationId}`, type: "checkbox", checked: tempForm.dryingRunning, onChange: (e) => setTempForm((f) => ({ ...f, dryingRunning: e.target.checked })), className: "h-4 w-4 ml-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `tmp-dry-${locationId}`, className: "cursor-pointer font-normal", children: "Drying running" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: tempForm.notes, onChange: (e) => setTempForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveTemp, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTempOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !tempForm.logDate || !tempForm.temperatureC || saveTemp.isPending,
            onClick: () => saveTemp.mutate({
              locationId,
              logDate: tempForm.logDate,
              logTime: tempForm.logTime || null,
              temperatureC: tempForm.temperatureC,
              sensorPosition: tempForm.sensorPosition || null,
              moisturePercent: tempForm.moisturePercent || null,
              aerationRunning: tempForm.aerationRunning,
              dryingRunning: tempForm.dryingRunning,
              recordedBy: tempForm.recordedBy || null,
              notes: tempForm.notes || null
            }),
            children: saveTemp.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : editTemp ? "Save Changes" : "Save Log"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteTempId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteTempId(null);
        deleteTemp.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Temperature Log" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteTemp, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTempId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteTemp.isPending, onClick: () => deleteTempId !== null && deleteTemp.mutate(deleteTempId), children: deleteTemp.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
function StorageLocationsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm());
  const [qrLocation, setQrLocation] = reactExports.useState(null);
  const [isSavingStorageCode, setIsSavingStorageCode] = reactExports.useState(false);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const qrPrintRef = reactExports.useRef(null);
  const locationsQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: farmData } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.record?.name ?? "BDE Farm";
  const locations = locationsQ.data?.records ?? [];
  const [mainTab, setMainTab] = usePersistedTab({ page: "storage-locations", farmId, validIds: ["locations", "analytics"], defaultTab: "locations" });
  const saveMut = useMutation({
    mutationFn: async (body) => {
      const url = editId ? `/api/farms/${farmId}/storage-locations/${editId}` : `/api/farms/${farmId}/storage-locations`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm());
      toast({ title: editId ? "Location updated" : "Location added", description: "Storage location saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save storage location.", variant: "destructive" });
    }
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/farms/${farmId}/storage-locations/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
      setDeleteId(null);
      toast({ title: "Deleted", description: "Storage location removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete storage location.", variant: "destructive" });
    }
  });
  function openAdd() {
    setEditId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }
  function openEdit(loc) {
    setEditId(loc.id);
    setForm({
      name: loc.name,
      type: loc.type,
      capacityTonnes: loc.capacityTonnes ?? "",
      locationDescription: loc.locationDescription ?? "",
      notes: loc.notes ?? "",
      isActive: loc.isActive,
      pin: locToLatLng(loc),
      binType: loc.binType ?? "Bin",
      dryingSystem: loc.dryingSystem ?? "None",
      aerationSystem: loc.aerationSystem ?? false,
      temperatureMonitoring: loc.temperatureMonitoring ?? false,
      sensorCount: loc.sensorCount != null ? String(loc.sensorCount) : "",
      merchantName: loc.merchantName ?? "",
      merchantContact: loc.merchantContact ?? "",
      merchantContractRef: loc.merchantContractRef ?? "",
      storageRatePptWeek: loc.storageRatePptWeek ?? "",
      intakeChargePpt: loc.intakeChargePpt ?? "",
      outloadingChargePpt: loc.outloadingChargePpt ?? "",
      dryingChargePpt: loc.dryingChargePpt ?? "",
      insuranceRatePptWeek: loc.insuranceRatePptWeek ?? ""
    });
    setDialogOpen(true);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const isGrain = GRAIN_TYPES.includes(form.type);
    const isMerchant = form.type === "merchant";
    saveMut.mutate({
      name: form.name,
      type: form.type,
      capacityTonnes: form.capacityTonnes || null,
      locationDescription: form.locationDescription || null,
      latitude: form.pin ? String(form.pin.lat) : null,
      longitude: form.pin ? String(form.pin.lng) : null,
      notes: form.notes || null,
      isActive: form.isActive,
      binType: isGrain ? form.binType || null : null,
      dryingSystem: isGrain ? form.dryingSystem || null : null,
      aerationSystem: isGrain ? form.aerationSystem : null,
      temperatureMonitoring: isGrain ? form.temperatureMonitoring : null,
      sensorCount: isGrain && form.sensorCount ? parseInt(form.sensorCount) : null,
      merchantName: isMerchant ? form.merchantName || null : null,
      merchantContact: isMerchant ? form.merchantContact || null : null,
      merchantContractRef: isMerchant ? form.merchantContractRef || null : null,
      storageRatePptWeek: isMerchant ? form.storageRatePptWeek || null : null,
      intakeChargePpt: isMerchant ? form.intakeChargePpt || null : null,
      outloadingChargePpt: isMerchant ? form.outloadingChargePpt || null : null,
      dryingChargePpt: isMerchant ? form.dryingChargePpt || null : null,
      insuranceRatePptWeek: isMerchant ? form.insuranceRatePptWeek || null : null
    });
  }
  function openMapFor(loc) {
    const pin = locToLatLng(loc);
    if (!pin) return;
    window.open(`https://www.openstreetmap.org/?mlat=${pin.lat}&mlon=${pin.lng}#map=17/${pin.lat}/${pin.lng}`, "_blank");
  }
  function toggleExpand(id) {
    setExpandedId((prev) => prev === id ? null : id);
  }
  const isGrainForm = GRAIN_TYPES.includes(form.type);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "h-6 w-6 text-amber-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Storage Locations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "All on-farm and off-farm storage — grain stores, silos, bins and more. Expand a row to view quality tests and temperature logs." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Add Location"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 border-b border-gray-200 mb-2", children: ["locations", "analytics"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setMainTab(t),
        className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${mainTab === t ? "border-amber-600 text-amber-800" : "border-transparent text-gray-500 hover:text-gray-800"}`,
        children: t === "locations" ? `Locations (${locations.length})` : "Analytics"
      },
      t
    )) }),
    mainTab === "analytics" && (() => {
      const byType = Object.entries(
        locations.reduce((m, l) => {
          m[l.type] = (m[l.type] || 0) + 1;
          return m;
        }, {})
      ).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
      const capByName = locations.filter((l) => l.capacityTonnes && Number(l.capacityTonnes) > 0).sort((a, b) => Number(b.capacityTonnes) - Number(a.capacityTonnes)).slice(0, 10).map((l) => ({ name: l.name.length > 14 ? l.name.slice(0, 13) + "…" : l.name, capacity: Number(l.capacityTonnes) }));
      const activeCount = locations.filter((l) => l.isActive).length;
      const totalCapacity = locations.reduce((s, l) => s + (Number(l.capacityTonnes) || 0), 0);
      const STORE_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
          { label: "Total Locations", value: locations.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "Active", value: activeCount, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Inactive", value: locations.length - activeCount, bg: "bg-gray-50 border-gray-200", text: "text-gray-700", sub: "text-gray-500" },
          { label: "Total Capacity (t)", value: totalCapacity > 0 ? totalCapacity.toLocaleString() : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" }
        ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
        ] }, c.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
          byType.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Locations by Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: byType, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "count", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: byType.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: STORE_COLORS[i % STORE_COLORS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Locations"] })
            ] }) }) })
          ] }),
          capByName.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Capacity by Location (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: capByName, layout: "vertical", margin: { left: 4, right: 24, top: 4, bottom: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 80 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}t`, "Capacity"] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "capacity", fill: "#a16207", radius: [0, 3, 3, 0] })
            ] }) }) })
          ] })
        ] })
      ] });
    })(),
    mainTab === "locations" && locationsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Loading storage locations…" }),
    mainTab === "locations" && !locationsQ.isLoading && locations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "h-10 w-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No storage locations yet. Click ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Location" }),
        " to create your first entry."
      ] })
    ] }),
    mainTab === "locations" && locations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium min-w-[200px]", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-[130px]", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-[110px]", children: "Capacity (t)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden md:table-cell max-w-[200px]", children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium hidden lg:table-cell w-[130px]", children: "GPS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium w-[90px]", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-44" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: locations.map((loc) => {
        const pin = locToLatLng(loc);
        const isExpanded = expandedId === loc.id;
        const isGrain = GRAIN_TYPES.includes(loc.type);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: loc.name }),
              isGrain && loc.binType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5 flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: loc.binType }),
                loc.dryingSystem && loc.dryingSystem !== "None" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "· ",
                  loc.dryingSystem
                ] }),
                loc.aerationSystem && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600", children: "· Aeration" }),
                loc.temperatureMonitoring && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-600", children: [
                  "· Temp ×",
                  loc.sensorCount ?? 1
                ] })
              ] }),
              loc.type === "merchant" && loc.merchantName && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
                loc.merchantName
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: typeBadgeVariant(loc.type), children: typeLabel(loc.type) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: loc.capacityTonnes ? `${loc.capacityTonnes} t` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate", children: loc.locationDescription || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 hidden lg:table-cell", children: pin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => openMapFor(loc),
                title: "View on OpenStreetMap",
                className: "flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
                  pin.lat.toFixed(4),
                  ", ",
                  pin.lng.toFixed(4)
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Not set" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: loc.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-green-600 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
              " Active"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
              " Inactive"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  title: isExpanded ? "Collapse" : isGrain ? "Quality Tests & Temperature" : loc.type === "merchant" ? "Merchant Charges" : "Expand",
                  onClick: () => toggleExpand(loc.id),
                  className: `h-8 w-8 ${isGrain || loc.type === "merchant" ? "text-amber-600" : "text-muted-foreground"}`,
                  children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: "QR Code", onClick: () => setQrLocation(loc), children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "h-4 w-4 text-teal-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => openEdit(loc), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => setDeleteId(loc.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] }) })
          ] }, loc.id),
          isExpanded && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: loc.type === "merchant" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MerchantChargesPanel, { farmId, locationId: loc.id, location: loc }) : /* @__PURE__ */ jsxRuntimeExports.jsx(GrainMonitoringPanel, { farmId, locationId: loc.id, locationType: loc.type }) }, `${loc.id}-panel`)
        ] });
      }) })
    ] }) }),
    qrLocation && (() => {
      const autoCode = `STG-${String(qrLocation.id).padStart(4, "0")}`;
      const displayCode = qrLocation.storageCode || null;
      const qrValue = displayCode ? `BDE:F${farmId}:${displayCode}` : `BDE:F${farmId}:${autoCode}`;
      const LCSS = `@page{size:62mm 90mm;margin:0}body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}.brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em}.farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}svg{display:block;margin:0 auto}.code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}.iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}.hint{font-size:8px;color:#d1d5db;margin-top:4px}`;
      const saveStorageCode = async (code) => {
        setIsSavingStorageCode(true);
        try {
          await fetch(`/api/farms/${farmId}/storage-locations/${qrLocation.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ storageCode: code })
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
          qc.invalidateQueries({ queryKey: ["storage-locations", farmId] });
          setQrLocation((prev) => prev ? { ...prev, storageCode: code } : null);
        } finally {
          setIsSavingStorageCode(false);
        }
      };
      function handleQrPrint() {
        if (!qrPrintRef.current) return;
        openPrintWindow(`<html><head><title>Storage Label</title><style>${LCSS}</style></head><body>${qrPrintRef.current.innerHTML}</body></html>`);
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
        if (!o) setQrLocation(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, "aria-describedby": void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4 text-teal-600" }),
          " Storage Location QR Label"
        ] }) }),
        displayCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 border rounded-xl bg-white px-5 py-3 shadow-sm", ref: qrPrintRef, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold text-teal-700 tracking-widest mt-1", children: "🌿 BDE Farm Trac" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "w-full border-gray-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-gray-900 uppercase tracking-wider", children: farmName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(QRCodeSVG, { value: qrValue, size: 180, bgColor: "#ffffff", fgColor: "#0f766e", level: "M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xl font-bold tracking-widest text-teal-700 mt-1", children: displayCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700", children: qrLocation.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-gray-300 mb-1", children: "Scan to log deliveries & movements" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setQrLocation(null), children: "Close" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handleQrPrint, className: "gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
              " Print Label"
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed border-muted-foreground/30 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-16 h-16 text-muted-foreground/30" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground text-center", children: [
            "No QR code yet. Assign code ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: autoCode }),
            " to this location."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveStorageCode(autoCode), disabled: isSavingStorageCode, className: "gap-2", children: [
            isSavingStorageCode ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4" }),
            "Generate QR Code"
          ] })
        ] })
      ] }) });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      setDialogOpen(o);
      if (!o) {
        setEditId(null);
        setForm(emptyForm());
        saveMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 640 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editId ? "Edit Storage Location" : "Add Storage Location" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Name ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              required: true,
              placeholder: "e.g. Grain Store 1, North Silo, East Bin",
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.type, onValueChange: (v) => setForm((f) => ({ ...f, type: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LOCATION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (tonnes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.1",
                min: "0",
                placeholder: "e.g. 500",
                value: form.capacityTonnes,
                onChange: (e) => setForm((f) => ({ ...f, capacityTonnes: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. North yard, adjacent to main barn",
              value: form.locationDescription,
              onChange: (e) => setForm((f) => ({ ...f, locationDescription: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
            "GPS Pin Location"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StorageLocationMapPicker,
            {
              value: form.pin,
              onChange: (pin) => setForm((f) => ({ ...f, pin }))
            },
            dialogOpen ? "open" : "closed"
          )
        ] }),
        form.type === "merchant" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-amber-50/50 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
            " Merchant Details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Merchant name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Frontier Agriculture", value: form.merchantName, onChange: (e) => setForm((f) => ({ ...f, merchantName: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. John Smith, 07700 900000", value: form.merchantContact, onChange: (e) => setForm((f) => ({ ...f, merchantContact: e.target.value })) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contract reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. GS-2024-00142", value: form.merchantContractRef, onChange: (e) => setForm((f) => ({ ...f, merchantContractRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide flex items-center gap-1.5 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5" }),
            " Rate Card (£/tonne)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground -mt-1", children: "Leave blank for any charges you don't want to auto-generate." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage (£/t/week)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 0.50", value: form.storageRatePptWeek, onChange: (e) => setForm((f) => ({ ...f, storageRatePptWeek: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Insurance (£/t/week)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 0.05", value: form.insuranceRatePptWeek, onChange: (e) => setForm((f) => ({ ...f, insuranceRatePptWeek: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intake (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 1.50", value: form.intakeChargePpt, onChange: (e) => setForm((f) => ({ ...f, intakeChargePpt: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outloading (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 1.50", value: form.outloadingChargePpt, onChange: (e) => setForm((f) => ({ ...f, outloadingChargePpt: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drying (£/t)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", placeholder: "e.g. 8.00", value: form.dryingChargePpt, onChange: (e) => setForm((f) => ({ ...f, dryingChargePpt: e.target.value })) })
            ] })
          ] })
        ] }),
        isGrainForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-amber-50/50 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide", children: "Grain Storage Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store Sub-type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.binType, onValueChange: (v) => setForm((f) => ({ ...f, binType: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BIN_SUBTYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drying System" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.dryingSystem, onValueChange: (v) => setForm((f) => ({ ...f, dryingSystem: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DRYING_SYSTEMS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature Sensor Count" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  placeholder: "e.g. 4",
                  value: form.sensorCount,
                  onChange: (e) => setForm((f) => ({ ...f, sensorCount: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 flex flex-col justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "aer-sys", type: "checkbox", checked: form.aerationSystem, onChange: (e) => setForm((f) => ({ ...f, aerationSystem: e.target.checked })), className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "aer-sys", className: "cursor-pointer font-normal text-sm", children: "Aeration system fitted" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "temp-mon", type: "checkbox", checked: form.temperatureMonitoring, onChange: (e) => setForm((f) => ({ ...f, temperatureMonitoring: e.target.checked })), className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "temp-mon", className: "cursor-pointer font-normal text-sm", children: "Temperature monitoring" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "Any additional details…",
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "isActive",
              type: "checkbox",
              checked: form.isActive,
              onChange: (e) => setForm((f) => ({ ...f, isActive: e.target.checked })),
              className: "h-4 w-4"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isActive", className: "cursor-pointer", children: "Active (available for harvest transport runs)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => setDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saveMut.isPending, children: saveMut.isPending ? "Saving…" : editId ? "Save Changes" : "Add Location" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, "aria-describedby": void 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Storage Location" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure you want to delete this storage location? This cannot be undone. Associated quality tests and temperature logs will remain in the database but will no longer be linked." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            disabled: deleteMut.isPending,
            onClick: () => deleteId !== null && deleteMut.mutate(deleteId),
            children: deleteMut.isPending ? "Deleting…" : "Delete"
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  StorageLocationsPage as default
};
