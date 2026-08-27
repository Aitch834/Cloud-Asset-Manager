import { b as useAppStore, r as reactExports, a as useToast, c as useQueryClient, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, M as MapPin, e as LoaderCircle, O as React, X, A as ArrowRight, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter, C as Checkbox } from "./index-DnpqOjPK.js";
import { u as usePersistedTab } from "./use-persisted-tab-DsCx_GXI.js";
import { a as usePersistedFilter } from "./use-persisted-filter-B7ldAiRe.js";
import { A as AppLayout, a as Wheat, G as Gauge, e as ChartColumn, j as Truck, I as Info, E as Flame, Z as Zap, c as ClipboardList, f as Scale, T as TrendingUp, J as CloudSun } from "./AppLayout-BBNHxsBD.js";
import { T as Textarea } from "./textarea-DGhj0Pjo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DJGVynMA.js";
import { C as ConfirmDialog } from "./confirm-dialog-CYjQ1kcW.js";
import { T as TabBar, a as TabButton } from "./tab-button-C7uYDg6u.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-BellotHN.js";
import { B as BuyerCombobox } from "./BuyerCombobox-BcZqUjtU.js";
import { a as printElementReport } from "./print-report-ClU8-1P0.js";
import { T as Tractor, C as ChevronRight } from "./tractor-DlKKq-lf.js";
import { P as Package } from "./use-safe-clerk-BNWpY-DW.js";
import { P as PoundSterling, F as FileText } from "./shield-alert-CcEMaYOh.js";
import { T as TriangleAlert } from "./triangle-alert-C8gD2uC3.js";
import { T as Thermometer } from "./thermometer-CzO4nHXm.js";
import { C as Calendar } from "./calendar-DfXX67bg.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B8E7ZM2V.js";
import { P as Pencil } from "./pencil-CccSh8D2.js";
import { S as ShieldCheck } from "./shield-check-DUT5dxRP.js";
import { P as Printer } from "./printer-mP-m1fpf.js";
import { F as FileCheck } from "./file-check-YY0cHe3d.js";
import { B as BadgeCheck } from "./badge-check-BR5dvDmj.js";
import { C as CircleCheck } from "./circle-check-CZauFmgc.js";
import { C as CircleAlert } from "./database-CM9mLyE3.js";
import { H as HardHat } from "./hard-hat-BbCAJ6pB.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-CKGGa4c8.js";
import { B as BarChart } from "./BarChart-C-UaHbRp.js";
import { C as CartesianGrid } from "./CartesianGrid-CzA77U_X.js";
import { P as PieChart, a as Pie } from "./PieChart-C6aI0c_T.js";
import { L as LineChart } from "./LineChart-U1gMffXL.js";
import { L as Line } from "./Line-BIOhfVoj.js";
import "./index-DEyNxU4N.js";
import "./index-Bn3K7hzk.js";
import "./chevron-up-CMf_33HZ.js";
import "./popover-C8WXm4N5.js";
import "./command-xO1OYFIC.js";
import "./search-D2ZCxRH5.js";
import "./chevrons-up-down-DPPKRCTf.js";
import "./user-plus-J_o7rm9r.js";
const STRAW_TYPES = ["Wheat Straw", "Barley Straw", "Oat Straw", "Oilseed Rape Straw"];
const BALE_FORMATS = ["Small Rectangular", "Big Round", "Big Square"];
const STORAGE_TYPES = ["Indoor", "Outdoor Covered", "Outdoor Uncovered"];
const PPP_RISKS = ["Low", "Medium", "High"];
const INTENDED_USES = ["Animal Feed", "Bedding", "Horticultural / Composting", "Unknown"];
const BUYER_TYPES = ["Farmer", "Merchant / Trader", "Market Gardener", "Contractor", "Other"];
const TRANSPORT_OPTIONS = ["Buyer Collects", "Own Transport", "Third-Party Haulier"];
const PAYMENT_STATUSES = ["unpaid", "paid", "overdue"];
const CONDITION_OPTIONS = ["Good", "Monitor", "Action Required", "Unsafe"];
const WEATHER_CONDITIONS = ["Sunny", "Dry & Windy", "Overcast", "Light Rain", "Humid", "Cloudy", "Hot & Dry", "Showery"];
const SOIL_CONDITIONS = ["Dry", "Slightly Moist", "Moist", "Wet"];
const BIOMASS_SCHEMES = [
  "Drax Power",
  "MGT Power (Teesside)",
  "Lynemouth Power",
  "EPH Biomass",
  "BECS (Biomass Energy Crop Scheme)",
  "RHI — Own installation",
  "AD Plant (Anaerobic Digestion)",
  "SARIA / Organic Processors",
  "ENplus Certified Scheme",
  "Straw to Energy — Direct Offtake",
  "Other"
];
const FUSARIUM_METHODS = [
  "Visual inspection",
  "DON lateral flow test (e.g. Romer QuickScan)",
  "NIR analysis",
  "Third-party laboratory test"
];
const CHART_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];
function deriveVatClassification(use) {
  if (use === "Animal Feed") return { classification: "Zero-rated (0%)", rate: "0%" };
  if (use === "Bedding") return { classification: "Standard-rated (20%)", rate: "20%", warning: "Straw sold as bedding is standard-rated for VAT (20%). Ensure this is reflected on your invoice." };
  if (use === "Horticultural / Composting") return { classification: "Standard-rated (20%)", rate: "20%", warning: "Straw sold for horticultural or composting use is standard-rated for VAT (20%) per HMRC VAT Notice 701/15." };
  return { classification: "To be confirmed", rate: "TBC", warning: "Confirm intended use with buyer before invoicing. VAT rate depends on how straw is held out for sale (HMRC VAT Notice 701/15)." };
}
function getMoistureRisk(pct, format) {
  if (pct == null) return { status: "Unknown", colour: "gray", message: "Record moisture at baling for fire risk assessment." };
  const limit = format === "Small Rectangular" ? 22 : 18;
  const warning = format === "Small Rectangular" ? 18 : 16;
  if (pct > limit) return { status: "Action Required", colour: "red", message: `Moisture ${pct}% exceeds safe limit (${limit}% for ${format}). Risk of spontaneous combustion. Monitor daily and consider moving/selling immediately.` };
  if (pct > warning) return { status: "Warning", colour: "amber", message: `Moisture ${pct}% is elevated (safe limit: ${limit}% for ${format}). Monitor closely for first 14 days.` };
  return { status: "Safe", colour: "green", message: `Moisture ${pct}% is within safe limits for ${format} (max ${limit}%).` };
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const pToGBP = (p) => p == null ? "—" : `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
const num = (v) => v == null || v === "" ? null : Number(v);
const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
function meterCalStatus(nextDue) {
  if (!nextDue) return { label: "No Cal", colour: "gray" };
  const days = Math.floor((new Date(nextDue).getTime() - Date.now()) / 864e5);
  if (days < 0) return { label: "Overdue", colour: "red" };
  if (days <= 30) return { label: `Due ${fmtDate(nextDue)}`, colour: "amber" };
  return { label: "Current", colour: "green" };
}
function StatusBadge({ status }) {
  const map = {
    in_stock: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-700",
    used_on_farm: "bg-blue-100 text-blue-800",
    disposed: "bg-red-100 text-red-700",
    unpaid: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800"
  };
  const label = {
    in_stock: "In Stock",
    sold: "Sold",
    used_on_farm: "Used On-Farm",
    disposed: "Disposed",
    unpaid: "Unpaid",
    paid: "Paid",
    overdue: "Overdue"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`, children: label[status] ?? status });
}
function ConditionBadge({ cond }) {
  const map = { Good: "bg-green-100 text-green-800", Monitor: "bg-amber-100 text-amber-800", "Action Required": "bg-orange-100 text-orange-800", Unsafe: "bg-red-100 text-red-800" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[cond] ?? "bg-gray-100 text-gray-700"}`, children: cond });
}
function BalingStatusBadge({ status, balance }) {
  if (status === "complete") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800", children: "Complete" });
  if (balance > 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800", children: [
    balance,
    " in field"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700", children: "Open" });
}
function BalingDialog({ open, onClose, farmId, editRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    operationDate: today(),
    fieldId: "",
    fieldOfOrigin: "",
    cropVariety: "",
    strawType: "Wheat Straw",
    baleFormat: "Big Round",
    areaHa: "",
    totalBalesProduced: "",
    baleWeightKg: "",
    tractorDescription: "",
    balerDescription: "",
    operatorName: "",
    operatorSupplierId: null,
    machineHours: "",
    labourHours: "",
    weatherConditions: "",
    temperatureC: "",
    windSpeedKmh: "",
    soilConditions: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const { data: fields = [] } = useQuery({
    queryKey: ["fields", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/fields`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const { data: fieldCrops = [] } = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/field-crops`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const tractors = equipment.filter((e) => /tractor|power unit/i.test(e.type ?? ""));
  const balers = equipment.filter((e) => /baler|implement/i.test(e.type ?? ""));
  React.useEffect(() => {
    if (open) {
      setForm(editRow ? {
        operationDate: editRow.operationDate ?? today(),
        fieldId: editRow.fieldId != null ? String(editRow.fieldId) : "",
        fieldOfOrigin: editRow.fieldOfOrigin ?? "",
        cropVariety: editRow.cropVariety ?? "",
        strawType: editRow.strawType ?? "Wheat Straw",
        baleFormat: editRow.baleFormat ?? "Big Round",
        areaHa: editRow.areaHa ?? "",
        totalBalesProduced: editRow.totalBalesProduced ?? "",
        baleWeightKg: editRow.baleWeightKg ?? "",
        tractorDescription: editRow.tractorDescription ?? "",
        balerDescription: editRow.balerDescription ?? "",
        operatorName: editRow.operatorName ?? "",
        operatorSupplierId: editRow.operatorSupplierId ?? null,
        machineHours: editRow.machineHours ?? "",
        labourHours: editRow.labourHours ?? "",
        weatherConditions: editRow.weatherConditions ?? "",
        temperatureC: editRow.temperatureC ?? "",
        windSpeedKmh: editRow.windSpeedKmh ?? "",
        soilConditions: editRow.soilConditions ?? "",
        notes: editRow.notes ?? ""
      } : init);
    }
  }, [open, editRow]);
  React.useEffect(() => {
    if (!form.fieldId) return;
    const fid = Number(form.fieldId);
    const field = fields.find((fld) => fld.id === fid);
    if (!field) return;
    const assignments = fieldCrops.filter((fc) => fc.fieldId === fid);
    const latest = assignments.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )[0];
    const cropName = latest?.cropName ?? "";
    const strawTypeFromCrop = (() => {
      const n = cropName.toLowerCase();
      if (n.includes("wheat")) return "Wheat Straw";
      if (n.includes("barley")) return "Barley Straw";
      if (n.includes("oat")) return "Oat Straw";
      if (n.includes("oilseed") || n.includes("rape") || n.includes("osr")) return "Oilseed Rape Straw";
      return null;
    })();
    setForm((p) => ({
      ...p,
      fieldOfOrigin: field.name ?? p.fieldOfOrigin,
      areaHa: p.areaHa || String(field.computedFarmableAreaHa ?? field.areaHectares ?? "") || p.areaHa,
      strawType: p.strawType === "Wheat Straw" && strawTypeFromCrop ? strawTypeFromCrop : strawTypeFromCrop ?? p.strawType,
      cropVariety: p.cropVariety || (latest?.variety ?? "") || p.cropVariety
    }));
  }, [form.fieldId, fields, fieldCrops]);
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-baling-operations/${editRow.id}` : `/api/farms/${farmId}/straw-baling-operations`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      qc.invalidateQueries({ queryKey: ["field-operations"] });
      toast({ title: isEdit ? "Baling operation updated" : "Baling operation recorded" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => {
    if (!form.operationDate || !form.totalBalesProduced) {
      toast({ title: "Required fields missing", description: "Date and bale count are required.", variant: "destructive" });
      return;
    }
    mut.mutate({
      operationDate: form.operationDate,
      fieldId: form.fieldId ? Number(form.fieldId) : null,
      fieldOfOrigin: form.fieldOfOrigin || null,
      cropVariety: form.cropVariety || null,
      strawType: form.strawType,
      baleFormat: form.baleFormat,
      areaHa: form.areaHa || null,
      totalBalesProduced: num(form.totalBalesProduced) ?? 0,
      baleWeightKg: form.baleWeightKg || null,
      tractorDescription: form.tractorDescription || null,
      balerDescription: form.balerDescription || null,
      operatorName: form.operatorName || null,
      operatorSupplierId: form.operatorSupplierId,
      machineHours: form.machineHours || null,
      labourHours: form.labourHours || null,
      weatherConditions: form.weatherConditions || null,
      temperatureC: form.temperatureC || null,
      windSpeedKmh: form.windSpeedKmh || null,
      soilConditions: form.soilConditions || null,
      notes: form.notes || null
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? "Edit" : "Record",
      " Baling Operation"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 16, className: "shrink-0 mt-0.5 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "This records the baling machine's output for the session. Once saved, use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Journey" }),
          " to track each trailer load moved to storage."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operation Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.operationDate, onChange: (e) => f("operationDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field of Origin" }),
        fields.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__other__", onValueChange: (v) => {
          if (v === "__other__") setForm((p) => ({ ...p, fieldId: "", fieldOfOrigin: "" }));
          else f("fieldId")(v);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            fields.map((fld) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(fld.id), children: [
              fld.name,
              fld.fieldReference ? ` (${fld.fieldReference})` : ""
            ] }, fld.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not in list" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Field", value: form.fieldOfOrigin, onChange: (e) => f("fieldOfOrigin")(e.target.value) }),
        fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", placeholder: "Field name (auto-filled or enter)", value: form.fieldOfOrigin, onChange: (e) => f("fieldOfOrigin")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Straw Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.strawType, onValueChange: f("strawType"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STRAW_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bale Format *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baleFormat, onValueChange: f("baleFormat"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BALE_FORMATS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Variety" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Skyfall, Crusoe", value: form.cropVariety, onChange: (e) => f("cropVariety")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Baled (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.1, placeholder: "ha", value: form.areaHa, onChange: (e) => f("areaHa")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Bales Produced *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, placeholder: "e.g. 320", value: form.totalBalesProduced, onChange: (e) => f("totalBalesProduced")(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Total count produced by the baler on this day / session" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approx. Weight / Bale (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 1, placeholder: "e.g. 300", value: form.baleWeightKg, onChange: (e) => f("baleWeightKg")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3", children: "Machine & Labour" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tractor / Power Unit" }),
            tractors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tractorDescription, onValueChange: (v) => f("tractorDescription")(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tractor…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
                tractors.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `${e.name}${e.registrationNumber ? ` (${e.registrationNumber})` : ""}`, children: [
                  e.name,
                  e.registrationNumber ? ` — ${e.registrationNumber}` : ""
                ] }, e.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. JD 6175R — AB23 XYZ", value: form.tractorDescription, onChange: (e) => f("tractorDescription")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Baler / Implement" }),
            balers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.balerDescription, onValueChange: (v) => f("balerDescription")(v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select baler…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
                balers.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: e.name, children: [
                  e.name,
                  e.make ? ` — ${e.make}` : ""
                ] }, e.id))
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Claas Variant 460", value: form.balerDescription, onChange: (e) => f("balerDescription")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.operatorSupplierId, valueName: form.operatorName, onChange: (id, name) => setForm((p) => ({ ...p, operatorSupplierId: id, operatorName: name })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Machine Hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.5, placeholder: "0.0", value: form.machineHours, onChange: (e) => f("machineHours")(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Labour Hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.5, placeholder: "0.0", value: form.labourHours, onChange: (e) => f("labourHours")(e.target.value) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudSun, { size: 13 }),
          "Weather Conditions"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conditions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.weatherConditions, onValueChange: f("weatherConditions"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not recorded" }),
                WEATHER_CONDITIONS.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: w, children: w }, w))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: 0.5, placeholder: "e.g. 22", value: form.temperatureC, onChange: (e) => f("temperatureC")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Speed (km/h)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 1, placeholder: "e.g. 15", value: form.windSpeedKmh, onChange: (e) => f("windSpeedKmh")(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.soilConditions, onValueChange: f("soilConditions"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not recorded" }),
              SOIL_CONDITIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending || !form.operationDate || !form.totalBalesProduced, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save Changes" : "Record Baling Operation"
      ] })
    ] })
  ] }) });
}
function CartageDialog({ open, onClose, farmId, balingOp, editRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    journeyDate: today(),
    journeyTime: "",
    operatorName: "",
    operatorSupplierId: null,
    tractorDescription: "",
    trailerDescription: "",
    balesMoved: "",
    fromLocation: balingOp?.fieldOfOrigin ?? "",
    toLocation: "",
    toStorageType: "Indoor",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const tractors = equipment.filter((e) => /tractor|power unit/i.test(e.type ?? ""));
  const trailers = equipment.filter((e) => /trailer/i.test(e.type ?? ""));
  React.useEffect(() => {
    if (open) {
      setForm(editRow ? {
        journeyDate: editRow.journeyDate ?? today(),
        journeyTime: editRow.journeyTime ?? "",
        operatorName: editRow.operatorName ?? "",
        operatorSupplierId: editRow.operatorSupplierId ?? null,
        tractorDescription: editRow.tractorDescription ?? "",
        trailerDescription: editRow.trailerDescription ?? "",
        balesMoved: editRow.balesMoved ?? "",
        fromLocation: editRow.fromLocation ?? balingOp?.fieldOfOrigin ?? "",
        toLocation: editRow.toLocation ?? "",
        toStorageType: editRow.toStorageType ?? "Indoor",
        notes: editRow.notes ?? ""
      } : { ...init, fromLocation: balingOp?.fieldOfOrigin ?? "" });
    }
  }, [open, editRow, balingOp]);
  const balance = balingOp ? balingOp.balingBalance ?? 0 : 0;
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-cartage-journeys/${editRow.id}` : `/api/farms/${farmId}/straw-baling-operations/${balingOp.id}/journeys`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-journeys", balingOp?.id] });
      toast({ title: isEdit ? "Journey updated" : "Journey recorded" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => {
    if (!form.balesMoved || !form.toLocation) {
      toast({ title: "Required fields missing", description: "Bales moved and destination are required.", variant: "destructive" });
      return;
    }
    const moved = num(form.balesMoved) ?? 0;
    if (!isEdit && moved > balance) {
      toast({ title: "Exceeds balance", description: `Only ${balance} bales remain in field. You cannot move ${moved}.`, variant: "destructive" });
      return;
    }
    mut.mutate({
      journeyDate: form.journeyDate,
      journeyTime: form.journeyTime || null,
      operatorName: form.operatorName || null,
      operatorSupplierId: form.operatorSupplierId,
      tractorDescription: form.tractorDescription || null,
      trailerDescription: form.trailerDescription || null,
      balesMoved: moved,
      fromLocation: form.fromLocation || null,
      toLocation: form.toLocation,
      toStorageType: form.toStorageType,
      notes: form.notes || null
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        isEdit ? "Edit" : "Record",
        " Cartage Journey"
      ] }),
      balingOp && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
        balingOp.fieldOfOrigin || "Field",
        " → Storage  |  ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${balance > 0 ? "text-amber-700" : "text-green-700"}`, children: [
          balance,
          " bales remaining in field"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Journey Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.journeyDate, onChange: (e) => f("journeyDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Time (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.journeyTime, onChange: (e) => f("journeyTime")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.operatorSupplierId, valueName: form.operatorName, onChange: (id, name) => setForm((p) => ({ ...p, operatorSupplierId: id, operatorName: name })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bales This Journey *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, placeholder: "e.g. 40", value: form.balesMoved, onChange: (e) => f("balesMoved")(e.target.value) }),
        !isEdit && balance > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          balance,
          " bales still to move"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tractor" }),
        tractors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tractorDescription, onValueChange: (v) => f("tractorDescription")(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tractor…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
            tractors.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: `${e.name}${e.registrationNumber ? ` (${e.registrationNumber})` : ""}`, children: [
              e.name,
              e.registrationNumber ? ` — ${e.registrationNumber}` : ""
            ] }, e.id))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. JD 6175R", value: form.tractorDescription, onChange: (e) => f("tractorDescription")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trailer" }),
        trailers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.trailerDescription, onValueChange: (v) => f("trailerDescription")(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select trailer…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
            trailers.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: e.name, children: e.name }, e.id))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 14T grain trailer", value: form.trailerDescription, onChange: (e) => f("trailerDescription")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From (Field / Area)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Auto-filled from baling op", value: form.fromLocation, onChange: (e) => f("fromLocation")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To (Storage Location) *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Home Farm Barn 2", value: form.toLocation, onChange: (e) => f("toLocation")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.toStorageType, onValueChange: f("toStorageType"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-[220px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STORAGE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending || !form.balesMoved || !form.toLocation, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save Changes" : "Record Journey"
      ] })
    ] })
  ] }) });
}
function CartageJourneysPanel({ farmId, balingOp, onAddJourney }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editJourney, setEditJourney] = reactExports.useState(null);
  const [pendingDeleteJourney, setPendingDeleteJourney] = reactExports.useState(null);
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["straw-journeys", balingOp.id],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-baling-operations/${balingOp.id}/journeys`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId && !!balingOp.id
  });
  const delMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/straw-cartage-journeys/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-journeys", balingOp.id] });
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      toast({ title: "Journey deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const runningBalance = balingOp.totalBalesProduced ?? 0;
  let remaining = runningBalance;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border-t border-amber-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 px-6 py-3 border-b border-amber-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Produced: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
          (balingOp.totalBalesProduced ?? 0).toLocaleString(),
          " bales"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Moved to storage: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-700", children: (balingOp.balesMoved ?? 0).toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14, className: "text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Still in field: " }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${(balingOp.balingBalance ?? 0) > 0 ? "text-amber-700" : "text-green-700"}`, children: (balingOp.balingBalance ?? 0).toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "ml-auto", onClick: onAddJourney, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 13, className: "mr-1" }),
        "Add Journey"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin mx-auto" }) }) : journeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 text-sm text-gray-500 italic", children: [
      "No cartage journeys recorded yet. Click ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Journey" }),
      " to record the first trailer load."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-amber-200", children: ["Date", "Time", "Operator", "Tractor", "Trailer", "Bales", "From", "To", "Storage Type", "Running Balance", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold text-gray-600", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: journeys.map((j) => {
        remaining -= j.balesMoved ?? 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-amber-100 hover:bg-amber-100/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: fmtDate(j.journeyDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-500", children: j.journeyTime || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: j.operatorName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-600", children: j.tractorDescription || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-600", children: j.trailerDescription || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 font-semibold text-green-700", children: [
            "+",
            j.balesMoved
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-600", children: j.fromLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: j.toLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-500", children: j.toStorageType || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${remaining > 0 ? "text-amber-700" : "text-green-700"}`, children: [
            remaining,
            " in field"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditJourney(j), className: "p-1 rounded hover:bg-amber-200 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDeleteJourney(j.id), className: "p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
          ] }) })
        ] }, j.id);
      }) })
    ] }) }),
    editJourney && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CartageDialog,
      {
        open: !!editJourney,
        onClose: () => setEditJourney(null),
        farmId,
        balingOp,
        editRow: editJourney
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteJourney !== null,
        title: "Delete journey",
        message: "Delete this journey?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delMut,
        onConfirm: () => {
          if (pendingDeleteJourney !== null) delMut.mutate(pendingDeleteJourney, { onSuccess: () => setPendingDeleteJourney(null) });
        },
        onCancel: () => {
          setPendingDeleteJourney(null);
          delMut.reset();
        }
      }
    )
  ] });
}
function InventoryDialog({ open, onClose, farmId, editRow, existingInventory, balingOp }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    batchRef: "",
    strawType: "Wheat Straw",
    baleFormat: "Big Round",
    harvestDate: today(),
    fieldId: "",
    fieldOfOrigin: "",
    cropVariety: "",
    quantityBales: "",
    baleWeightKg: "",
    moistureAtBaling: "",
    storageLocation: "",
    storageType: "Indoor",
    stackingStartDate: today(),
    redTractorCertified: false,
    combinableCropsPassportRef: "",
    pppResidueRisk: "Low",
    fusariumRiskAssessed: false,
    fusariumAssessmentDate: today(),
    fusariumAssessmentMethod: "Visual inspection",
    fusariumRiskLevel: "Low",
    fusariumAssessorName: "",
    fusariumKitStockId: "",
    fusariumKitSupplier: "",
    fusariumKitBatchNumber: "",
    fusariumKitLotNumber: "",
    biomassContract: false,
    biomassScheme: "",
    biomassUniqueBaleRef: "",
    status: "in_stock",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const { data: fields = [] } = useQuery({
    queryKey: ["fields", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/fields`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const { data: fieldCrops = [] } = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/field-crops`, { credentials: "include" });
      return r.ok ? r.json() : [];
    },
    select: (d) => Array.isArray(d) ? d : d?.records ?? [],
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const { data: fusariumKitStock = [] } = useQuery({
    queryKey: ["straw-fusarium-kit-stock", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/straw/fusarium-test-kit-stock`, { credentials: "include" });
      return r.ok ? (await r.json()).stock : [];
    },
    enabled: open && !!farmId,
    staleTime: 6e4
  });
  const knownLocations = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const row of existingInventory) {
      if (row.storageLocation && !map.has(row.storageLocation)) map.set(row.storageLocation, row.storageType ?? "Indoor");
    }
    return Array.from(map.entries()).map(([name, type]) => ({ name, type }));
  }, [existingInventory]);
  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          batchRef: editRow.batchRef ?? "",
          strawType: editRow.strawType ?? "Wheat Straw",
          baleFormat: editRow.baleFormat ?? "Big Round",
          harvestDate: editRow.harvestDate ?? today(),
          fieldId: editRow.fieldId != null ? String(editRow.fieldId) : "",
          fieldOfOrigin: editRow.fieldOfOrigin ?? "",
          cropVariety: editRow.cropVariety ?? "",
          quantityBales: editRow.quantityBales ?? "",
          baleWeightKg: editRow.baleWeightKg ?? "",
          moistureAtBaling: editRow.moistureAtBaling ?? "",
          storageLocation: editRow.storageLocation ?? "",
          storageType: editRow.storageType ?? "Indoor",
          stackingStartDate: editRow.stackingStartDate ?? today(),
          redTractorCertified: editRow.redTractorCertified ?? false,
          combinableCropsPassportRef: editRow.combinableCropsPassportRef ?? "",
          pppResidueRisk: editRow.pppResidueRisk ?? "Low",
          fusariumRiskAssessed: editRow.fusariumRiskAssessed ?? false,
          fusariumAssessmentDate: editRow.fusariumAssessmentDate ?? today(),
          fusariumAssessmentMethod: editRow.fusariumAssessmentMethod ?? "Visual inspection",
          fusariumRiskLevel: editRow.fusariumRiskLevel ?? "Low",
          fusariumAssessorName: editRow.fusariumAssessorName ?? "",
          fusariumKitStockId: editRow.fusariumKitStockId != null ? String(editRow.fusariumKitStockId) : "",
          fusariumKitSupplier: editRow.fusariumKitSupplier ?? "",
          fusariumKitBatchNumber: editRow.fusariumKitBatchNumber ?? "",
          fusariumKitLotNumber: editRow.fusariumKitLotNumber ?? "",
          biomassContract: editRow.biomassContract ?? false,
          biomassScheme: editRow.biomassSchemeName ?? "",
          biomassUniqueBaleRef: editRow.biomassUniqueBaleRef ?? "",
          status: editRow.status ?? "in_stock",
          notes: editRow.notes ?? ""
        });
      } else if (balingOp) {
        setForm({
          ...init,
          strawType: balingOp.strawType ?? "Wheat Straw",
          baleFormat: balingOp.baleFormat ?? "Big Round",
          harvestDate: balingOp.operationDate ?? today(),
          fieldId: balingOp.fieldId != null ? String(balingOp.fieldId) : "",
          fieldOfOrigin: balingOp.fieldOfOrigin ?? "",
          cropVariety: balingOp.cropVariety ?? "",
          quantityBales: String(balingOp.totalBalesProduced ?? ""),
          baleWeightKg: balingOp.baleWeightKg ?? "",
          stackingStartDate: today()
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow, balingOp]);
  React.useEffect(() => {
    if (!form.fieldId) return;
    const fid = Number(form.fieldId);
    const field = fields.find((fld) => fld.id === fid);
    if (!field) return;
    const crops = fieldCrops.filter((c) => c.fieldId === fid);
    const latest = crops.sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )[0];
    const cropName = latest?.cropName ?? "";
    const strawTypeFromCrop = (() => {
      const n = cropName.toLowerCase();
      if (n.includes("wheat")) return "Wheat Straw";
      if (n.includes("barley")) return "Barley Straw";
      if (n.includes("oat")) return "Oat Straw";
      if (n.includes("oilseed") || n.includes("rape") || n.includes("osr")) return "Oilseed Rape Straw";
      return null;
    })();
    const variety = latest?.varietyName || latest?.cropVariety || latest?.variety || "";
    setForm((p) => ({
      ...p,
      fieldOfOrigin: field.name ?? p.fieldOfOrigin,
      ...strawTypeFromCrop ? { strawType: strawTypeFromCrop } : {},
      ...variety && !p.cropVariety ? { cropVariety: variety } : {}
    }));
  }, [form.fieldId, fields, fieldCrops]);
  const moisture = num(form.moistureAtBaling);
  const risk = getMoistureRisk(moisture, form.baleFormat);
  const handleStorageLocation = (val) => {
    const known = knownLocations.find((l) => l.name === val);
    setForm((p) => ({ ...p, storageLocation: val, ...known ? { storageType: known.type } : {} }));
  };
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-bale-inventory/${editRow.id}` : `/api/farms/${farmId}/straw-bale-inventory`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: isEdit ? "Batch updated" : "Batch added" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => mut.mutate({
    batchRef: form.batchRef || null,
    strawType: form.strawType,
    baleFormat: form.baleFormat,
    harvestDate: form.harvestDate || null,
    fieldId: form.fieldId ? Number(form.fieldId) : null,
    fieldOfOrigin: form.fieldOfOrigin || null,
    cropVariety: form.cropVariety || null,
    quantityBales: num(form.quantityBales) ?? 0,
    quantityRemaining: num(form.quantityBales) ?? 0,
    baleWeightKg: form.baleWeightKg || null,
    moistureAtBaling: form.moistureAtBaling || null,
    moistureStatus: moisture != null ? risk.status : null,
    storageLocation: form.storageLocation || null,
    storageType: form.storageType,
    stackingStartDate: form.stackingStartDate || null,
    redTractorCertified: form.redTractorCertified,
    combinableCropsPassportRef: form.combinableCropsPassportRef || null,
    pppResidueRisk: form.pppResidueRisk,
    fusariumRiskAssessed: form.fusariumRiskAssessed,
    fusariumAssessmentDate: form.fusariumRiskAssessed ? form.fusariumAssessmentDate || null : null,
    fusariumAssessmentMethod: form.fusariumRiskAssessed ? form.fusariumAssessmentMethod || null : null,
    fusariumRiskLevel: form.fusariumRiskAssessed ? form.fusariumRiskLevel || null : null,
    fusariumAssessorName: form.fusariumRiskAssessed ? form.fusariumAssessorName || null : null,
    fusariumKitStockId: form.fusariumRiskAssessed && form.fusariumKitStockId ? Number(form.fusariumKitStockId) : null,
    fusariumKitSupplier: form.fusariumRiskAssessed ? form.fusariumKitSupplier || null : null,
    fusariumKitBatchNumber: form.fusariumRiskAssessed ? form.fusariumKitBatchNumber || null : null,
    fusariumKitLotNumber: form.fusariumRiskAssessed ? form.fusariumKitLotNumber || null : null,
    biomassContract: form.biomassContract,
    biomassSchemeName: form.biomassScheme || null,
    biomassUniqueBaleRef: form.biomassUniqueBaleRef || null,
    status: form.status,
    balingOperationId: balingOp?.id ?? null,
    notes: form.notes || null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        isEdit ? "Edit" : "Add",
        " Straw Bale Batch"
      ] }),
      balingOp && !isEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 mt-1 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
        "Pre-filled from baling operation — ",
        fmtDate(balingOp.operationDate),
        " · ",
        balingOp.fieldOfOrigin
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      !balingOp && !isEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16, className: "shrink-0 mt-0.5 text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "This registers a batch of straw bales in your inventory. If you've already recorded a ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Baling Operation" }),
          " for this harvest, click ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Batch" }),
          " from that row instead — it will pre-fill this form automatically. Use this standalone form for bales already in storage that have no linked baling record."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WS-2026-001", value: form.batchRef, onChange: (e) => f("batchRef")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Straw Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.strawType, onValueChange: f("strawType"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STRAW_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bale Format *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baleFormat, onValueChange: f("baleFormat"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BALE_FORMATS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.harvestDate, onChange: (e) => f("harvestDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field of Origin" }),
        fields.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__other__", onValueChange: (v) => {
          if (v === "__other__") setForm((p) => ({ ...p, fieldId: "", fieldOfOrigin: "" }));
          else f("fieldId")(v);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            fields.map((fld) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(fld.id), children: [
              fld.name,
              fld.fieldReference ? ` (${fld.fieldReference})` : ""
            ] }, fld.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not in field list" })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Field", value: form.fieldOfOrigin, onChange: (e) => f("fieldOfOrigin")(e.target.value) }),
        fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", placeholder: form.fieldId ? "Field name (auto-filled)" : "Enter field name", value: form.fieldOfOrigin, onChange: (e) => f("fieldOfOrigin")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Variety" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Skyfall, Crusoe", value: form.cropVariety, onChange: (e) => f("cropVariety")(e.target.value) }),
        form.fieldId && form.cropVariety && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 11 }),
          "Auto-populated from field crop records."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Batch Size (Bales) *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.quantityBales, onChange: (e) => f("quantityBales")(e.target.value) }),
        balingOp && !isEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 11 }),
          "From baling operation — edit if only part going to this location"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approx. Weight / Bale (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.1, placeholder: "e.g. 250", value: form.baleWeightKg, onChange: (e) => f("baleWeightKg")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture at Baling (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 60, step: 0.1, placeholder: "%", value: form.moistureAtBaling, onChange: (e) => f("moistureAtBaling")(e.target.value) }),
        moisture != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`, children: [
          risk.colour === "red" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0" }) : risk.colour === "amber" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 13, className: "mt-0.5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              risk.status,
              ":"
            ] }),
            " ",
            risk.message
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            list: "straw-locations-list",
            className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            placeholder: knownLocations.length > 0 ? "Select or type a location…" : "e.g. Barn 2, Home Farm Yard",
            value: form.storageLocation,
            onChange: (e) => handleStorageLocation(e.target.value)
          }
        ),
        knownLocations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "straw-locations-list", children: knownLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l.name }, l.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.storageType, onValueChange: f("storageType"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STORAGE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] }),
        knownLocations.some((l) => l.name === form.storageLocation) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 11 }),
          "Auto-set from previous records for this location."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stacking Start Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.stackingStartDate, onChange: (e) => f("stackingStartDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: f("status"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in_stock", children: "In Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sold", children: "Sold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "used_on_farm", children: "Used On-Farm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disposed", children: "Disposed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Red Tractor / Compliance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "rt", checked: form.redTractorCertified, onCheckedChange: (v) => f("redTractorCertified")(!!v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rt", className: "cursor-pointer", children: "Red Tractor Certified" })
          ] }),
          form.redTractorCertified ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Combinable Crops Passport Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BRM-2026-XXXX", value: form.combinableCropsPassportRef, onChange: (e) => f("combinableCropsPassportRef")(e.target.value) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PPP Residue Risk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.pppResidueRisk, onValueChange: f("pppResidueRisk"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PPP_RISKS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
            ] })
          ] }),
          form.strawType === "Wheat Straw" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1 col-span-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "fus", checked: form.fusariumRiskAssessed, onCheckedChange: (v) => f("fusariumRiskAssessed")(!!v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fus", className: "cursor-pointer", children: "Fusarium Risk Assessed" })
          ] })
        ] }),
        form.strawType === "Wheat Straw" && !form.fusariumRiskAssessed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 13, className: "mt-0.5 shrink-0" }),
          "Red Tractor requires a Fusarium mycotoxin risk assessment for wheat straw. Tick once the assessment (visual inspection, DON test, NIR, or third-party lab) has been completed and recorded below."
        ] }),
        form.strawType === "Wheat Straw" && form.fusariumRiskAssessed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-green-800 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
            "Fusarium Risk Assessment Details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Assessment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fusariumAssessmentMethod, onValueChange: f("fusariumAssessmentMethod"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FUSARIUM_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Risk Outcome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fusariumRiskLevel, onValueChange: f("fusariumRiskLevel"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Low", children: "Low" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "High", children: "High" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Assessment Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "h-8 text-xs", value: form.fusariumAssessmentDate, onChange: (e) => f("fusariumAssessmentDate")(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Assessor Name / Organisation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "e.g. John Smith, BASIS agronomist", value: form.fusariumAssessorName, onChange: (e) => f("fusariumAssessorName")(e.target.value) })
            ] })
          ] }),
          form.fusariumAssessmentMethod !== "Visual inspection" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-green-200 pt-3 mt-1 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800", children: "Test Kit Traceability" }),
            fusariumKitStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Link Kit Batch (from stock)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.fusariumKitStockId,
                  onValueChange: (v) => {
                    const kit = fusariumKitStock.find((k) => String(k.id) === v);
                    setForm((p) => ({
                      ...p,
                      fusariumKitStockId: v,
                      fusariumKitSupplier: kit?.supplier ?? p.fusariumKitSupplier,
                      fusariumKitBatchNumber: kit?.batchNumber ?? p.fusariumKitBatchNumber,
                      fusariumKitLotNumber: kit?.lotNumber ?? p.fusariumKitLotNumber
                    }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select logged kit batch…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— Enter manually —" }),
                      fusariumKitStock.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(k.id), children: [
                        k.productName,
                        k.lotNumber ? ` · Lot ${k.lotNumber}` : "",
                        k.batchNumber ? ` · Batch ${k.batchNumber}` : "",
                        " (",
                        k.quantityRemaining,
                        " remaining)"
                      ] }, k.id))
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "e.g. Romer Labs UK", value: form.fusariumKitSupplier, onChange: (e) => f("fusariumKitSupplier")(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Kit Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs font-mono", placeholder: "From kit box", value: form.fusariumKitBatchNumber, onChange: (e) => f("fusariumKitBatchNumber")(e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Kit Lot Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs font-mono", placeholder: "From kit box", value: form.fusariumKitLotNumber, onChange: (e) => f("fusariumKitLotNumber")(e.target.value) })
              ] })
            ] }),
            fusariumKitStock.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700 bg-blue-50 rounded px-2 py-1.5", children: [
              "💡 No kit batches logged yet — add them via the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fusarium Test Kit Stock" }),
              " panel on the Inventory tab to enable auto-fill and stock tracking."
            ] })
          ] }),
          form.fusariumRiskLevel === "High" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 flex gap-1.5 items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12, className: "mt-0.5 shrink-0" }),
            "High Fusarium risk — consider whether this straw is suitable for animal feed. Seek veterinary or nutritional advice before supplying to livestock."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Biomass / Energy Contract" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "bmc", checked: form.biomassContract, onCheckedChange: (v) => f("biomassContract")(!!v) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bmc", className: "cursor-pointer", children: "Biomass / Energy Contract" })
          ] }),
          form.biomassContract && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheme / Buyer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  list: "biomass-schemes-list",
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  placeholder: "Select or type scheme / buyer…",
                  value: form.biomassScheme,
                  onChange: (e) => f("biomassScheme")(e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "biomass-schemes-list", children: BIOMASS_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s }, s)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unique Bale / Scheme Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Scheme batch ID or reference", value: form.biomassUniqueBaleRef, onChange: (e) => f("biomassUniqueBaleRef")(e.target.value) })
            ] })
          ] })
        ] }),
        form.biomassContract && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1.5 flex gap-1.5 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 13, className: "mt-0.5 shrink-0" }),
          "Straw supplied under a biomass or energy contract may be subject to sustainability criteria and scheme traceability requirements. Ensure the unique bale reference matches your contract documentation."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save Changes" : "Add Batch"
      ] })
    ] })
  ] }) });
}
function StrawSaleInvoicePrint({ sale, farmId, onClose }) {
  const invoiceRef = React.useRef(null);
  const { data: farm } = useQuery({
    queryKey: ["farm-for-straw-invoice", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 6e4
  });
  const vatInfo = deriveVatClassification(sale.intendedUse);
  const net = sale.totalValuePence ?? 0;
  const vat = sale.vatAmountPence ?? 0;
  const gross = net + vat;
  const termsDays = sale.paymentTermsDays;
  const dueDate = sale.saleDate && termsDays != null && Number(termsDays) > 0 ? (() => {
    const d = new Date(sale.saleDate);
    d.setDate(d.getDate() + Number(termsDays));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  })() : null;
  const fmtD = (s) => s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16 }),
      "Invoice Preview — ",
      sale.invoiceRef
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: invoiceRef, className: "p-6 border rounded-lg bg-white text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-900", children: farm?.name || "—" }),
          farm?.address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1 whitespace-pre-line text-xs", children: farm.address }),
          farm?.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: farm.phone }),
          farm?.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: farm.email }),
          farm?.vatNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700 font-medium mt-1 text-xs", children: [
            "VAT Reg No: ",
            farm.vatNumber
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800 uppercase tracking-widest", children: "Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-bold text-lg text-gray-700 mt-1", children: sale.invoiceRef }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 text-xs mt-1", children: [
            "Date: ",
            fmtD(sale.saleDate)
          ] }),
          dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 text-xs", children: [
            "Payment due: ",
            dueDate
          ] }),
          termsDays === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: "Terms: Cash on Delivery" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase mb-1", children: "Bill To" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: sale.buyerName }),
        sale.buyerAddress && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: sale.buyerAddress }),
        sale.buyerPostcode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: sale.buyerPostcode }),
        sale.buyerPhone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: sale.buyerPhone }),
        sale.buyerEmail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-xs", children: sale.buyerEmail })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full mb-4 text-sm border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-semibold text-gray-700 border border-gray-200", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2 px-3 font-semibold text-gray-700 border border-gray-200", children: "Qty (Bales)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-3 font-semibold text-gray-700 border border-gray-200", children: "Unit Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-3 font-semibold text-gray-700 border border-gray-200", children: "Net Amount" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              sale.strawType,
              " — ",
              sale.baleFormat
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
              sale.intendedUse,
              sale.batchRef ? ` · Batch: ${sale.batchRef}` : ""
            ] }),
            sale.deliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
              "Delivery: ",
              fmtD(sale.deliveryDate)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center border border-gray-200", children: sale.quantitySold }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right border border-gray-200", children: sale.pricePerBalePence ? pToGBP(sale.pricePerBalePence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right font-medium border border-gray-200", children: pToGBP(net) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-52", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1.5 text-gray-600 border-b border-gray-200 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Net Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: pToGBP(net) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1.5 text-gray-600 border-b border-gray-200 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "VAT (",
            vatInfo.rate,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: pToGBP(vat) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-2.5 font-bold text-gray-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pToGBP(gross || net) })
        ] })
      ] }) }),
      (sale.transportedBy || sale.passportIssued) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 text-xs text-gray-500 border-t pt-2 space-y-0.5", children: [
        sale.transportedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Transport: ",
          sale.transportedBy,
          sale.haulierName ? ` (${sale.haulierName})` : "",
          sale.vehicleReg ? ` — Reg: ${sale.vehicleReg}` : ""
        ] }),
        sale.passportIssued && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Combinable Crops Passport Ref: ",
          sale.passportRef || "Issued"
        ] })
      ] }),
      (farm?.bankAccountName || farm?.bankAccountNumber || farm?.invoiceFooterText) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 text-xs text-gray-500 space-y-0.5", children: [
        (farm?.bankAccountName || farm?.bankAccountNumber) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Payment: ",
          [farm.bankAccountName, farm.bankAccountNumber].filter(Boolean).join(" · ")
        ] }),
        farm?.invoiceFooterText && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 italic", children: farm.invoiceFooterText })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => printElementReport(invoiceRef.current, {
        title: `Straw Sale Invoice ${sale.invoiceRef ?? ""}`,
        farmName: farm?.name,
        farmAddress: farm?.address,
        contactPhone: farm?.phone,
        cphNumber: farm?.cphNumber,
        sbiNumber: farm?.sbiNumber,
        redTractorId: farm?.redTractorId,
        recordCount: 1,
        recordLabel: "invoice",
        landscape: false
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
        "Print / Save as PDF"
      ] })
    ] })
  ] }) });
}
function SalesDialog({ open, onClose, farmId, editRow, inventory }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const [showPrint, setShowPrint] = reactExports.useState(false);
  const init = {
    baleInventoryId: "",
    saleDate: today(),
    deliveryDate: "",
    strawType: "Wheat Straw",
    baleFormat: "Big Round",
    quantitySold: "",
    batchRef: "",
    intendedUse: "Animal Feed",
    pricePerBalePence: "",
    isCashSale: false,
    buyerSupplierId: null,
    buyerName: "",
    buyerAddress: "",
    buyerPostcode: "",
    buyerPhone: "",
    buyerEmail: "",
    buyerType: "Farmer",
    paymentTermsDays: null,
    transportedBy: "Buyer Collects",
    haulierName: "",
    haulierSupplierId: null,
    vehicleReg: "",
    passportIssued: false,
    passportRef: "",
    paymentStatus: "unpaid",
    paymentDate: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "",
          saleDate: editRow.saleDate ?? today(),
          deliveryDate: editRow.deliveryDate ?? "",
          strawType: editRow.strawType ?? "Wheat Straw",
          baleFormat: editRow.baleFormat ?? "Big Round",
          quantitySold: editRow.quantitySold ?? "",
          batchRef: editRow.batchRef ?? "",
          intendedUse: editRow.intendedUse ?? "Animal Feed",
          pricePerBalePence: editRow.pricePerBalePence ? (editRow.pricePerBalePence / 100).toFixed(2) : "",
          isCashSale: editRow.buyerType === "Cash",
          buyerSupplierId: editRow.buyerSupplierId ?? null,
          buyerName: editRow.buyerName ?? "",
          buyerAddress: editRow.buyerAddress ?? "",
          buyerPostcode: editRow.buyerPostcode ?? "",
          buyerPhone: editRow.buyerPhone ?? "",
          buyerEmail: editRow.buyerEmail ?? "",
          buyerType: editRow.buyerType ?? "Farmer",
          paymentTermsDays: editRow.paymentTermsDays ?? null,
          transportedBy: editRow.transportedBy ?? "Buyer Collects",
          haulierName: editRow.haulierName ?? "",
          haulierSupplierId: editRow.haulierSupplierId ?? null,
          vehicleReg: editRow.vehicleReg ?? "",
          passportIssued: editRow.passportIssued ?? false,
          passportRef: editRow.passportRef ?? "",
          paymentStatus: editRow.paymentStatus ?? "unpaid",
          paymentDate: editRow.paymentDate ?? "",
          notes: editRow.notes ?? ""
        });
      } else {
        setForm(init);
      }
      setShowPrint(false);
    }
  }, [open, editRow]);
  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r) => r.id === Number(form.baleInventoryId));
      if (row) setForm((p) => ({
        ...p,
        strawType: row.strawType ?? p.strawType,
        baleFormat: row.baleFormat ?? p.baleFormat,
        batchRef: row.batchRef ?? p.batchRef,
        passportRef: p.passportRef || row.batchRef || p.passportRef
      }));
    }
  }, [form.baleInventoryId]);
  const vatInfo = deriveVatClassification(form.intendedUse);
  const qty = num(form.quantitySold) ?? 0;
  const pricePence = form.pricePerBalePence ? Math.round(Number(form.pricePerBalePence) * 100) : null;
  const totalPence = pricePence && qty ? pricePence * qty : null;
  const vatPence = vatInfo.rate === "20%" && totalPence ? Math.round(totalPence * 0.2) : null;
  const dueDate = React.useMemo(() => {
    if (!form.saleDate || form.paymentTermsDays === null || form.paymentTermsDays === 0) return null;
    const d = new Date(form.saleDate);
    d.setDate(d.getDate() + Number(form.paymentTermsDays));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }, [form.saleDate, form.paymentTermsDays]);
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-sales/${editRow.id}` : `/api/farms/${farmId}/straw-sales`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      toast({ title: isEdit ? "Sale updated" : "Sale recorded", description: saved.invoiceRef ? `Invoice ${saved.invoiceRef}` : void 0 });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    saleDate: form.saleDate,
    deliveryDate: form.deliveryDate || null,
    strawType: form.strawType,
    baleFormat: form.baleFormat,
    quantitySold: num(form.quantitySold) ?? 0,
    batchRef: form.batchRef || null,
    intendedUse: form.intendedUse,
    vatClassification: vatInfo.classification,
    pricePerBalePence: pricePence,
    totalValuePence: totalPence,
    vatAmountPence: vatPence,
    buyerSupplierId: form.isCashSale ? null : form.buyerSupplierId ?? null,
    buyerName: form.isCashSale ? "Cash Sale" : form.buyerName,
    buyerAddress: form.isCashSale ? null : form.buyerAddress || null,
    buyerPostcode: form.isCashSale ? null : form.buyerPostcode || null,
    buyerPhone: form.isCashSale ? null : form.buyerPhone || null,
    buyerEmail: form.isCashSale ? null : form.buyerEmail || null,
    buyerType: form.isCashSale ? "Cash" : form.buyerType || null,
    paymentTermsDays: form.isCashSale ? 0 : form.paymentTermsDays ?? null,
    transportedBy: form.transportedBy || null,
    haulierName: form.haulierName || null,
    haulierSupplierId: form.haulierSupplierId ?? null,
    vehicleReg: form.vehicleReg || null,
    passportIssued: form.passportIssued,
    passportRef: form.passportRef || null,
    paymentStatus: form.paymentStatus,
    paymentDate: form.paymentDate || null,
    notes: form.notes || null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      if (!v) {
        onClose();
        mut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        isEdit ? "Edit" : "Record",
        " Straw Sale"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Bale Batch (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baleInventoryId?.toString() ?? "", onValueChange: f("baleInventoryId"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select batch or leave blank" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not linked" }),
              inventory.filter((r) => r.status === "in_stock").map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                r.batchRef || `Batch #${r.id}`,
                " — ",
                r.strawType,
                " ",
                r.baleFormat,
                " (",
                r.quantityRemaining ?? r.quantityBales,
                " remaining)"
              ] }, r.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: isEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13, className: "text-gray-400 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Invoice Reference:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-gray-800", children: editRow.invoiceRef || "—" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13, className: "shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Invoice reference auto-generated on save — e.g. ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              "STR-",
              (/* @__PURE__ */ new Date()).getFullYear(),
              "-0001"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.saleDate, onChange: (e) => f("saleDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Delivery Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.deliveryDate, onChange: (e) => f("deliveryDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Straw Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.strawType, onValueChange: f("strawType"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STRAW_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bale Format *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baleFormat, onValueChange: f("baleFormat"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BALE_FORMATS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Sold *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.quantitySold, onChange: (e) => f("quantitySold")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price per Bale (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: 0.01, placeholder: "0.00", value: form.pricePerBalePence, onChange: (e) => f("pricePerBalePence")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intended Use *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.intendedUse, onValueChange: f("intendedUse"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INTENDED_USES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${vatInfo.rate === "0%" ? "bg-green-50 text-green-700" : vatInfo.rate === "20%" ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-600"}`, children: [
            vatInfo.rate === "0%" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "mt-0.5 shrink-0" }) : vatInfo.rate === "20%" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 13, className: "mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                "VAT: ",
                vatInfo.classification
              ] }),
              vatInfo.warning ? ` — ${vatInfo.warning}` : " — no VAT to charge."
            ] })
          ] }),
          totalPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 grid grid-cols-3 gap-2 text-sm bg-gray-50 rounded p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Net Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: pToGBP(totalPence) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500 text-xs", children: [
                "VAT (",
                vatInfo.rate,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: pToGBP(vatPence ?? 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs", children: "Gross Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: pToGBP((totalPence ?? 0) + (vatPence ?? 0)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase", children: "Buyer Details (EC Reg 178/2002 Traceability)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  const next = !form.isCashSale;
                  setForm((p) => ({ ...p, isCashSale: next, buyerSupplierId: null, buyerName: next ? "Cash Sale" : "", buyerAddress: "", buyerPostcode: "", buyerPhone: "", buyerEmail: "", buyerType: next ? "Cash" : "Farmer", paymentTermsDays: next ? 0 : null }));
                },
                className: `text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${form.isCashSale ? "bg-green-100 border-green-500 text-green-800" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`,
                children: [
                  "💰 ",
                  form.isCashSale ? "✓ Cash Sale" : "Cash Sale"
                ]
              }
            )
          ] }),
          form.isCashSale ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "mt-0.5 shrink-0 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Cash Sale / Farm Gate" }),
              " — no buyer account required. EC Reg 178/2002 traceability is maintained via the straw type, quantity, and intended use recorded on this sale."
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                BuyerCombobox,
                {
                  farmId,
                  types: ["merchant", "farmer", "contractor", "other", "general"],
                  valueId: form.buyerSupplierId,
                  valueName: form.buyerName,
                  onChange: (id, name) => setForm((p) => ({ ...p, buyerSupplierId: id, buyerName: name })),
                  onChangeFull: (rec) => {
                    if (rec) setForm((p) => ({
                      ...p,
                      buyerAddress: rec.address || p.buyerAddress,
                      buyerPhone: rec.phone || p.buyerPhone,
                      buyerEmail: rec.email || p.buyerEmail
                    }));
                  },
                  placeholder: "Search Trade Contacts or quick-add...",
                  typeLabel: "Buyer",
                  postAddNavigatePath: "/trade-contacts"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buyerType, onValueChange: f("buyerType"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BUYER_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Terms" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.paymentTermsDays === null ? "" : String(form.paymentTermsDays),
                  onValueChange: (v) => setForm((p) => ({ ...p, paymentTermsDays: v === "" ? null : Number(v) })),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select terms" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "0", children: "Cash on Delivery (COD)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "7", children: "Net 7 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "14", children: "Net 14 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "21", children: "Net 21 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "28", children: "Net 28 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "30", children: "Net 30 days" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "60", children: "Net 60 days" })
                    ] })
                  ]
                }
              ),
              dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                "Payment due: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dueDate })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerAddress, onChange: (e) => f("buyerAddress")(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postcode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerPostcode, onChange: (e) => f("buyerPostcode")(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerPhone, onChange: (e) => f("buyerPhone")(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.buyerEmail, onChange: (e) => f("buyerEmail")(e.target.value) })
            ] }),
            form.buyerType === "Market Gardener" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5 items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0" }),
              "Sales to market gardeners are treated as horticultural use by HMRC — standard-rated at 20% VAT (HMRC VAT Notice 701/15)."
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-2", children: "Transport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transported By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.transportedBy, onValueChange: f("transportedBy"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TRANSPORT_OPTIONS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            form.transportedBy === "Third-Party Haulier" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Haulier Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.haulierSupplierId ?? null, valueName: form.haulierName, onChange: (id, name) => setForm((p) => ({ ...p, haulierSupplierId: id, haulierName: name })), typeLabel: "Haulier" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Reg" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-9", value: form.vehicleReg, onChange: (e) => f("vehicleReg")(e.target.value) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "passport", checked: form.passportIssued, onCheckedChange: (v) => {
              const checked = !!v;
              setForm((p) => ({
                ...p,
                passportIssued: checked,
                passportRef: checked && !p.passportRef ? p.batchRef || "" : p.passportRef
              }));
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "passport", className: "cursor-pointer font-medium", children: "Combinable Crops Passport Issued" })
          ] }),
          form.passportIssued && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Passport Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.passportRef, onChange: (e) => f("passportRef")(e.target.value), placeholder: "e.g. batch ref or crop lot number" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex gap-1.5 items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 13, className: "mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "The Combinable Crops Passport is issued ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "by your farm (the seller)" }),
                " and accompanies each consignment of straw to the buyer. The reference should match the crop batch or lot — if a bale batch is linked above, the batch reference has been pre-filled. Passports are required for plant health compliance under UK Plant Health legislation (retained EU Reg. 2016/2031) when moving regulated plant material between holdings. Contact APHA or your Red Tractor adviser if unsure."
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentStatus, onValueChange: f("paymentStatus"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PAYMENT_STATUSES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t.charAt(0).toUpperCase() + t.slice(1) }, t)) })
          ] })
        ] }),
        form.paymentStatus === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate, onChange: (e) => f("paymentDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        isEdit && editRow?.invoiceRef && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", type: "button", onClick: () => setShowPrint(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
          "Print Invoice"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending || !form.isCashSale && !form.buyerName || !form.quantitySold, children: [
          mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
          isEdit ? "Save Changes" : "Record Sale"
        ] })
      ] })
    ] }) }),
    showPrint && editRow && /* @__PURE__ */ jsxRuntimeExports.jsx(StrawSaleInvoicePrint, { sale: editRow, farmId, onClose: () => setShowPrint(false) })
  ] });
}
function MeterCalHistory({ farmId, meter, onLogCal, onEdit, deleteMutation }) {
  const [pendingDeleteCal, setPendingDeleteCal] = reactExports.useState(null);
  const { data: cals = [], isLoading } = useQuery({
    queryKey: ["straw-meter-cals", farmId, meter.id],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-meters/${meter.id}/calibrations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-12 py-3 text-center text-xs text-gray-400", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin inline mr-1" }),
    "Loading…"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border-t px-5 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-600", children: "Calibration History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onLogCal, className: "text-xs text-blue-600 hover:underline flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 11 }),
        "Log Calibration"
      ] })
    ] }),
    cals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No calibrations recorded yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-gray-500", children: ["Date", "Performed By", "Method", "Result", "Cert Ref", "Next Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left pb-1 pr-3 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: cals.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3", children: fmtDate(c.calibrationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-gray-600", children: c.performedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-gray-600", children: c.method || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-xs font-medium ${c.result === "Pass" ? "bg-green-100 text-green-700" : c.result === "Fail" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: c.result }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3 text-gray-600", children: c.certificateRef || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 pr-3", children: fmtDate(c.nextDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(c), className: "p-0.5 rounded hover:bg-gray-200 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 11 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDeleteCal(c.id), className: "p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 }) })
        ] }) })
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDeleteCal !== null,
        title: "Delete calibration record",
        message: "Delete this calibration record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: deleteMutation,
        onConfirm: () => {
          if (pendingDeleteCal !== null) deleteMutation.mutate(pendingDeleteCal, { onSuccess: () => setPendingDeleteCal(null) });
        },
        onCancel: () => {
          setPendingDeleteCal(null);
          deleteMutation.reset();
        }
      }
    )
  ] });
}
function MeterDialog({ open, onClose, farmId, editRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    deviceName: "",
    make: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    lastCalibrationDate: "",
    nextCalibrationDue: "",
    calibrationIntervalMonths: "12",
    notes: "",
    isActive: true
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          deviceName: editRow.deviceName ?? "",
          make: editRow.make ?? "",
          model: editRow.model ?? "",
          serialNumber: editRow.serialNumber ?? "",
          purchaseDate: editRow.purchaseDate ?? "",
          lastCalibrationDate: editRow.lastCalibrationDate ?? "",
          nextCalibrationDue: editRow.nextCalibrationDue ?? "",
          calibrationIntervalMonths: editRow.calibrationIntervalMonths != null ? String(editRow.calibrationIntervalMonths) : "12",
          notes: editRow.notes ?? "",
          isActive: editRow.isActive ?? true
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow]);
  React.useEffect(() => {
    if (form.lastCalibrationDate && form.calibrationIntervalMonths) {
      const d = new Date(form.lastCalibrationDate);
      d.setMonth(d.getMonth() + Number(form.calibrationIntervalMonths));
      setForm((p) => ({ ...p, nextCalibrationDue: d.toISOString().slice(0, 10) }));
    }
  }, [form.lastCalibrationDate, form.calibrationIntervalMonths]);
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-meters/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-meters`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      toast({ title: isEdit ? "Meter updated" : "Meter added to register" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => {
    if (!form.deviceName.trim()) {
      toast({ title: "Device name is required", variant: "destructive" });
      return;
    }
    mut.mutate({
      deviceName: form.deviceName.trim(),
      make: form.make || null,
      model: form.model || null,
      serialNumber: form.serialNumber || null,
      purchaseDate: form.purchaseDate || null,
      lastCalibrationDate: form.lastCalibrationDate || null,
      nextCalibrationDue: form.nextCalibrationDue || null,
      calibrationIntervalMonths: form.calibrationIntervalMonths ? Number(form.calibrationIntervalMonths) : 12,
      notes: form.notes || null,
      isActive: form.isActive
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? "Edit" : "Add",
      " Moisture Meter"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Device Name / Label *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Barn Meter 1, Field Kit", value: form.deviceName, onChange: (e) => f("deviceName")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Make" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Wile, Protimeter", value: form.make, onChange: (e) => f("make")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Wile 55", value: form.model, onChange: (e) => f("model")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber, onChange: (e) => f("serialNumber")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purchase Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.purchaseDate, onChange: (e) => f("purchaseDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cal. Interval (months)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 120, value: form.calibrationIntervalMonths, onChange: (e) => f("calibrationIntervalMonths")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Calibration Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastCalibrationDate, onChange: (e) => f("lastCalibrationDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Calibration Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextCalibrationDue, onChange: (e) => f("nextCalibrationDue")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "mtr-active", checked: form.isActive, onCheckedChange: (v) => f("isActive")(!!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "mtr-active", className: "cursor-pointer", children: "Active (available for selection in moisture checks)" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save" : "Add Meter"
      ] })
    ] })
  ] }) });
}
const CAL_METHODS = ["Internal", "External Lab", "Manufacturer Service"];
const CAL_RESULTS = ["Pass", "Fail", "Advisory"];
function CalibrationDialog({ open, onClose, farmId, meter, editRow }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = { calibrationDate: today(), performedBy: "", method: "Internal", result: "Pass", certificateRef: "", nextDue: "", notes: "" };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          calibrationDate: editRow.calibrationDate ?? today(),
          performedBy: editRow.performedBy ?? "",
          method: editRow.method ?? "Internal",
          result: editRow.result ?? "Pass",
          certificateRef: editRow.certificateRef ?? "",
          nextDue: editRow.nextDue ?? "",
          notes: editRow.notes ?? ""
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow]);
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-meter-calibrations/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-meters/${meter?.id}/calibrations`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-meter-cals", farmId, meter?.id] });
      toast({ title: isEdit ? "Calibration updated" : "Calibration recorded" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => mut.mutate({
    calibrationDate: form.calibrationDate,
    performedBy: form.performedBy || null,
    method: form.method || null,
    result: form.result,
    certificateRef: form.certificateRef || null,
    nextDue: form.nextDue || null,
    notes: form.notes || null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? "Edit" : "Log",
      " Calibration",
      meter ? ` — ${meter.deviceName}` : ""
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calibration Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.calibrationDate, onChange: (e) => f("calibrationDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.result, onValueChange: f("result"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CAL_RESULTS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Performed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.performedBy, onChange: (e) => f("performedBy")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.method, onValueChange: f("method"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CAL_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificateRef, onChange: (e) => f("certificateRef")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextDue, onChange: (e) => f("nextDue")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save" : "Log Calibration"
      ] })
    ] })
  ] }) });
}
function MoistureDialog({ open, onClose, farmId, editRow, inventory, activeMeters }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    baleInventoryId: "",
    batchRef: "",
    checkDate: today(),
    daysFromStacking: "",
    moisturePercent: "",
    temperatureCelsius: "",
    odourObserved: false,
    odourDescription: "",
    deviceUsed: "",
    overallCondition: "Good",
    actionTaken: "",
    checkedBy: "",
    nextCheckDue: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(init);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const nextCheckManual = React.useRef(false);
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  React.useEffect(() => {
    if (open) {
      nextCheckManual.current = false;
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "",
          batchRef: editRow.batchRef ?? "",
          checkDate: editRow.checkDate ?? today(),
          daysFromStacking: editRow.daysFromStacking ?? "",
          moisturePercent: editRow.moisturePercent ?? "",
          temperatureCelsius: editRow.temperatureCelsius ?? "",
          odourObserved: editRow.odourObserved ?? false,
          odourDescription: editRow.odourDescription ?? "",
          deviceUsed: editRow.deviceUsed ?? "",
          overallCondition: editRow.overallCondition ?? "Good",
          actionTaken: editRow.actionTaken ?? "",
          checkedBy: editRow.checkedBy ?? "",
          nextCheckDue: editRow.nextCheckDue ?? "",
          notes: editRow.notes ?? ""
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow]);
  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r) => r.id === Number(form.baleInventoryId));
      if (row) {
        const days2 = row.stackingStartDate ? Math.floor((new Date(form.checkDate).getTime() - new Date(row.stackingStartDate).getTime()) / 864e5) : null;
        setForm((p) => ({ ...p, batchRef: row.batchRef ?? p.batchRef, daysFromStacking: days2 != null ? String(days2) : p.daysFromStacking }));
      }
    }
  }, [form.baleInventoryId, form.checkDate]);
  React.useEffect(() => {
    if (!open || isEdit || nextCheckManual.current || !form.checkDate) return;
    const moisture = form.moisturePercent ? Number(form.moisturePercent) : null;
    const daysFromStack = form.daysFromStacking ? Number(form.daysFromStacking) : null;
    let addDays = 14;
    if (moisture != null && moisture > 18) addDays = 1;
    else if (moisture != null && moisture > 16) addDays = 3;
    else if (daysFromStack != null && daysFromStack <= 14) addDays = 1;
    else if (daysFromStack != null && daysFromStack <= 21) addDays = 3;
    else if (moisture != null) addDays = 7;
    const next = new Date(form.checkDate);
    next.setDate(next.getDate() + addDays);
    setForm((p) => ({ ...p, nextCheckDue: next.toISOString().slice(0, 10) }));
  }, [open, isEdit, form.checkDate, form.moisturePercent, form.daysFromStacking]);
  const m = num(form.moisturePercent);
  const selectedBatch = inventory.find((r) => r.id === Number(form.baleInventoryId));
  const risk = m != null && selectedBatch ? getMoistureRisk(m, selectedBatch.baleFormat) : null;
  const days = num(form.daysFromStacking);
  const willAlert = !isEdit && (form.odourObserved || m != null && m > 18);
  const suggestedDaysLabel = (() => {
    const moisture = form.moisturePercent ? Number(form.moisturePercent) : null;
    const daysFromStack = form.daysFromStacking ? Number(form.daysFromStacking) : null;
    if (moisture != null && moisture > 18) return "daily — red risk";
    if (moisture != null && moisture > 16) return "every 3 days — amber risk";
    if (daysFromStack != null && daysFromStack <= 14) return "daily — critical window";
    if (daysFromStack != null && daysFromStack <= 21) return "every 3 days — post-critical";
    if (moisture != null) return "weekly";
    return null;
  })();
  const mut = useMutation({
    mutationFn: async (body) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-checks/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-checks`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      toast({ title: isEdit ? "Check updated" : "Check recorded" });
      onClose();
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });
  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    batchRef: form.batchRef || null,
    checkDate: form.checkDate,
    daysFromStacking: form.daysFromStacking ? num(form.daysFromStacking) : null,
    moisturePercent: form.moisturePercent || null,
    temperatureCelsius: form.temperatureCelsius || null,
    odourObserved: form.odourObserved,
    odourDescription: form.odourDescription || null,
    deviceUsed: form.deviceUsed || null,
    overallCondition: form.overallCondition,
    actionTaken: form.actionTaken || null,
    checkedBy: form.checkedBy || null,
    nextCheckDue: form.nextCheckDue || null,
    notes: form.notes || null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      mut.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? "Edit" : "Record",
      " Moisture / Condition Check"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bale Batch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baleInventoryId?.toString() ?? "", onValueChange: f("baleInventoryId"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select batch" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not linked" }),
            inventory.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
              r.batchRef || `Batch #${r.id}`,
              " — ",
              r.strawType,
              " ",
              r.baleFormat
            ] }, r.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchRef, onChange: (e) => f("batchRef")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Check Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.checkDate, onChange: (e) => f("checkDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days from Stacking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.daysFromStacking, onChange: (e) => f("daysFromStacking")(e.target.value) })
      ] }),
      days != null && days <= 14 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-amber-50 text-amber-800 text-xs rounded p-2 flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 13, className: "mt-0.5 shrink-0" }),
        "Day ",
        days,
        " from stacking — within the critical 14-day spontaneous combustion window. Daily monitoring recommended (HSE INDG125)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 60, step: 0.1, value: form.moisturePercent, onChange: (e) => f("moisturePercent")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature (°C)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: 0.1, value: form.temperatureCelsius, onChange: (e) => f("temperatureCelsius")(e.target.value) })
      ] }),
      risk && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-2 p-2 rounded text-xs flex gap-1.5 items-start ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`, children: [
        risk.colour === "red" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 13, className: "mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            risk.status,
            ":"
          ] }),
          " ",
          risk.message
        ] })
      ] }),
      willAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2 flex gap-1.5 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0" }),
        "SMS alert will be sent to farm managers on save."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "odour", checked: form.odourObserved, onCheckedChange: (v) => f("odourObserved")(!!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "odour", className: "cursor-pointer", children: "Odour Observed (caramel / musty = heating)" })
      ] }),
      form.odourObserved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Odour Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.odourDescription, onChange: (e) => f("odourDescription")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Device Used" }),
        activeMeters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: activeMeters.some((mtr) => mtr.deviceName === form.deviceUsed) ? form.deviceUsed : "",
            onValueChange: (v) => {
              if (v) f("deviceUsed")(v);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mb-1.5 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Quick-fill from registered meter…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMeters.map((mtr) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: mtr.deviceName, children: [
                mtr.deviceName,
                mtr.make ? ` (${mtr.make}${mtr.model ? ` ${mtr.model}` : ""})` : ""
              ] }, mtr.id)) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Wile 55, Protimeter BLD5800", value: form.deviceUsed, onChange: (e) => f("deviceUsed")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Condition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallCondition, onValueChange: f("overallCondition"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONDITION_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionTaken, onChange: (e) => f("actionTaken")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checked By" }),
        members.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.checkedBy, onValueChange: f("checkedBy"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— Not specified —" }),
            members.filter((mbr) => mbr.isActive).map((mbr) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: memberFullName(mbr), children: [
              memberFullName(mbr),
              mbr.jobTitle ? ` — ${mbr.jobTitle}` : ""
            ] }, mbr.id))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.checkedBy, onChange: (e) => f("checkedBy")(e.target.value), placeholder: "Name" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          "Next Check Due",
          suggestedDaysLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 font-normal ml-1", children: [
            "(",
            suggestedDaysLabel,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: form.nextCheckDue,
            onChange: (e) => {
              nextCheckManual.current = true;
              f("nextCheckDue")(e.target.value);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: mut, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: mut.isPending, children: [
        mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        isEdit ? "Save" : "Record Check"
      ] })
    ] })
  ] }) });
}
const STRAW_TAB_IDS = ["baling", "inventory", "sales", "monitoring", "analytics"];
function StrawManagementPage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId;
  const [tab, setTab] = usePersistedTab({ page: "straw-management", farmId: rawFarmId, validIds: STRAW_TAB_IDS, defaultTab: "baling" });
  const [balingDlg, setBalingDlg] = reactExports.useState({ open: false });
  const [journeyDlg, setJourneyDlg] = reactExports.useState({ open: false });
  const [invDlg, setInvDlg] = reactExports.useState({ open: false });
  const [printDlg, setPrintDlg] = reactExports.useState({ open: false });
  const [saleDlg, setSaleDlg] = reactExports.useState({ open: false });
  const [moistDlg, setMoistDlg] = reactExports.useState({ open: false });
  const [meterDlg, setMeterDlg] = reactExports.useState({ open: false });
  const [calDlg, setCalDlg] = reactExports.useState({ open: false });
  const [complianceDlg, setComplianceDlg] = reactExports.useState(false);
  const [equipDlg, setEquipDlg] = reactExports.useState({ open: false });
  const [permitDlg, setPermitDlg] = reactExports.useState({ open: false });
  const [expandedOpId, setExpandedOpId] = reactExports.useState(null);
  const [expandedMeterId, setExpandedMeterId] = reactExports.useState(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "straw-management", filter: "year", farmId, defaultValue: "all" });
  const [pendingDelRecord, setPendingDelRecord] = reactExports.useState(null);
  const [pendingDelEquip, setPendingDelEquip] = reactExports.useState(null);
  const [pendingDelPermit, setPendingDelPermit] = reactExports.useState(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: farmDetail } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`, { credentials: "include" }).then((r) => r.ok ? r.json() : null),
    enabled: !!farmId,
    staleTime: 3e5
  });
  const rawFarmName = typeof farmDetail?.name === "string" ? farmDetail.name : typeof farmDetail?.farmName === "string" ? farmDetail.farmName : void 0;
  const farmName = rawFarmName ?? `Farm ${farmId}`;
  const { data: balingOps = [], isLoading: loadBaling } = useQuery({
    queryKey: ["straw-baling-ops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-baling-operations`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: inventory = [], isLoading: loadInv } = useQuery({
    queryKey: ["straw-inventory", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-bale-inventory`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: sales = [], isLoading: loadSales } = useQuery({
    queryKey: ["straw-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-sales`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: moisture = [], isLoading: loadMoist } = useQuery({
    queryKey: ["straw-moisture", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-checks`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: meters = [] } = useQuery({
    queryKey: ["straw-meters", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-meters`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: analytics } = useQuery({
    queryKey: ["straw-analytics", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-analytics`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: fireComplianceRec } = useQuery({
    queryKey: ["straw-fire-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-fire-compliance`, { credentials: "include" }).then((r) => r.json()).then((d) => d.record),
    enabled: !!farmId
  });
  const { data: fireEquipment = [] } = useQuery({
    queryKey: ["straw-fire-equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-fire-equipment`, { credentials: "include" }).then((r) => r.json()).then((d) => d.items ?? []),
    enabled: !!farmId
  });
  const { data: hotWorksPermits = [] } = useQuery({
    queryKey: ["straw-hot-works-permits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-hot-works-permits`, { credentials: "include" }).then((r) => r.json()).then((d) => d.permits ?? []),
    enabled: !!farmId
  });
  const saveComplianceMut = useMutation({
    mutationFn: async (body) => {
      const r = await fetch(`/api/farms/${farmId}/straw-fire-compliance`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-fire-compliance", farmId] });
      setComplianceDlg(false);
      toast({ title: "Fire compliance record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const saveEquipMut = useMutation({
    mutationFn: async ({ id, body }) => {
      const url = id ? `/api/farms/${farmId}/straw-fire-equipment/${id}` : `/api/farms/${farmId}/straw-fire-equipment`;
      const r = await fetch(url, { method: id ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-fire-equipment", farmId] });
      setEquipDlg({ open: false });
      toast({ title: "Equipment record saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delEquipMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/straw-fire-equipment/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-fire-equipment", farmId] });
      toast({ title: "Equipment removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const savePermitMut = useMutation({
    mutationFn: async ({ id, body }) => {
      const url = id ? `/api/farms/${farmId}/straw-hot-works-permits/${id}` : `/api/farms/${farmId}/straw-hot-works-permits`;
      const r = await fetch(url, { method: id ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-hot-works-permits", farmId] });
      setPermitDlg({ open: false });
      toast({ title: "Hot works permit saved" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delPermitMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/straw-hot-works-permits/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-hot-works-permits", farmId] });
      toast({ title: "Permit deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const delCalMut = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/straw-moisture-meter-calibrations/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meter-cals", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      toast({ title: "Calibration record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: async ({ type, id }) => {
      const r = await fetch(`/api/farms/${farmId}/${type}/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, { type }) => {
      if (type === "straw-baling-operations") {
        qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
        setExpandedOpId(null);
      }
      if (type === "straw-bale-inventory") qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      if (type === "straw-sales") qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      if (type === "straw-moisture-checks") qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      if (type === "straw-moisture-meters") qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const availableYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set();
    const thisYear = (/* @__PURE__ */ new Date()).getFullYear();
    for (let y = thisYear; y >= thisYear - 4; y--) years.add(y.toString());
    balingOps.forEach((op) => {
      if (op.operationDate) years.add(new Date(op.operationDate).getFullYear().toString());
    });
    inventory.forEach((r) => {
      if (r.harvestDate) years.add(new Date(r.harvestDate).getFullYear().toString());
    });
    sales.forEach((r) => {
      if (r.saleDate) years.add(new Date(r.saleDate).getFullYear().toString());
    });
    moisture.forEach((r) => {
      if (r.checkDate) years.add(new Date(r.checkDate).getFullYear().toString());
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [balingOps, inventory, sales, moisture]);
  const filteredBalingOps = reactExports.useMemo(
    () => yearFilter === "all" ? balingOps : balingOps.filter((op) => op.operationDate && new Date(op.operationDate).getFullYear().toString() === yearFilter),
    [balingOps, yearFilter]
  );
  const filteredInventory = reactExports.useMemo(
    () => yearFilter === "all" ? inventory : inventory.filter((r) => r.harvestDate && new Date(r.harvestDate).getFullYear().toString() === yearFilter),
    [inventory, yearFilter]
  );
  const filteredSales = reactExports.useMemo(
    () => yearFilter === "all" ? sales : sales.filter((r) => r.saleDate && new Date(r.saleDate).getFullYear().toString() === yearFilter),
    [sales, yearFilter]
  );
  const filteredMoisture = reactExports.useMemo(
    () => yearFilter === "all" ? moisture : moisture.filter((r) => r.checkDate && new Date(r.checkDate).getFullYear().toString() === yearFilter),
    [moisture, yearFilter]
  );
  const totalBalesInField = reactExports.useMemo(() => filteredBalingOps.filter((op) => op.status === "open").reduce((s, op) => s + (op.balingBalance ?? 0), 0), [filteredBalingOps]);
  const totalBalesInStock = reactExports.useMemo(() => filteredInventory.filter((r) => r.status === "in_stock").reduce((s, r) => s + (r.quantityRemaining ?? r.quantityBales ?? 0), 0), [filteredInventory]);
  const totalSalesValue = reactExports.useMemo(() => filteredSales.reduce((s, r) => s + (r.totalValuePence ?? 0), 0), [filteredSales]);
  reactExports.useMemo(() => filteredSales.filter((r) => r.paymentStatus === "unpaid" || r.paymentStatus === "overdue").reduce((s, r) => s + (r.totalValuePence ?? 0), 0), [filteredSales]);
  const actionRequired = reactExports.useMemo(() => filteredInventory.filter((r) => r.moistureStatus === "Action Required" || r.moistureStatus === "Warning").length, [filteredInventory]);
  const openOps = reactExports.useMemo(() => filteredBalingOps.filter((op) => op.status === "open").length, [filteredBalingOps]);
  const allStrawTypes = reactExports.useMemo(() => {
    const types = /* @__PURE__ */ new Set();
    balingOps.forEach((op) => {
      if (op.strawType) types.add(op.strawType);
    });
    return Array.from(types).sort();
  }, [balingOps]);
  const annualSummary = reactExports.useMemo(() => {
    const byYear = {};
    balingOps.forEach((op) => {
      if (!op.operationDate) return;
      const year = new Date(op.operationDate).getFullYear().toString();
      if (!byYear[year]) byYear[year] = { balesByType: {}, totalBales: 0, revenuePence: 0, soldBales: 0 };
      const type = op.strawType || "Unknown";
      byYear[year].balesByType[type] = (byYear[year].balesByType[type] ?? 0) + (op.totalBalesProduced ?? 0);
      byYear[year].totalBales += op.totalBalesProduced ?? 0;
    });
    sales.forEach((s) => {
      if (!s.saleDate) return;
      const year = new Date(s.saleDate).getFullYear().toString();
      if (!byYear[year]) byYear[year] = { balesByType: {}, totalBales: 0, revenuePence: 0, soldBales: 0 };
      byYear[year].revenuePence += s.totalValuePence ?? 0;
      byYear[year].soldBales += s.quantitySold ?? 0;
    });
    return Object.entries(byYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, data]) => ({ year, ...data }));
  }, [balingOps, sales]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 24, className: "text-amber-600" }),
            " Straw Management"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Baling operations, cartage journeys, batch inventory, sales and fire safety" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          tab === "baling" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setBalingDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Record Baling Op"
          ] }),
          tab === "inventory" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setInvDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Add Batch"
          ] }),
          tab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setSaleDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Record Sale"
          ] }),
          tab === "monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setMeterDlg({ open: true }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { size: 15, className: "mr-1" }),
              "Add Meter"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setMoistDlg({ open: true }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
              "Record Check"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-xl border p-4 ${openOps > 0 ? "border-amber-300" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 16, className: "text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Open Baling Ops" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${openOps > 0 ? "text-amber-600" : ""}`, children: openOps })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-xl border p-4 ${totalBalesInField > 0 ? "border-amber-300" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 16, className: totalBalesInField > 0 ? "text-amber-500" : "text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Bales in Field" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${totalBalesInField > 0 ? "text-amber-600" : ""}`, children: totalBalesInField.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16, className: "text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Bales in Storage" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: totalBalesInStock.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 16, className: "text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: yearFilter !== "all" ? `${yearFilter} Sales (net)` : "Total Sales (net)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: pToGBP(totalSalesValue) }),
          yearFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 mt-0.5", children: "all years" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-xl border p-4 ${actionRequired > 0 ? "border-red-300" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: actionRequired > 0 ? "text-red-600" : "text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Fire Risk Alerts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${actionRequired > 0 ? "text-red-600" : ""}`, children: actionRequired })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-4 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "baling", onClick: () => setTab("baling"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 14, className: "mr-1" }),
            "Baling"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "inventory", onClick: () => setTab("inventory"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 14, className: "mr-1" }),
            "Inventory (Batches)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "sales", onClick: () => setTab("sales"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 14, className: "mr-1" }),
            "Sales"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "monitoring", onClick: () => setTab("monitoring"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { size: 14, className: "mr-1" }),
            "Fire Safety"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 14, className: "mr-1" }),
            "Analytics"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14, className: "text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "Harvest year:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: (v) => setYearFilter(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: y, children: [
                y,
                " harvest"
              ] }, y))
            ] })
          ] }),
          yearFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter("all"), className: "text-xs text-blue-600 hover:underline", children: "Clear" })
        ] })
      ] }),
      tab === "baling" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 18, className: "shrink-0 mt-0.5 text-amber-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Three-phase straw workflow:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: "① Record baling operation (machine output per field)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-amber-500", children: "→" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "② Log each cartage journey (field to storage, with running balance)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 text-amber-500", children: "→" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "③ Create inventory batch for each storage location" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border overflow-hidden", children: loadBaling ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin mx-auto mb-2" }),
          "Loading…"
        ] }) : filteredBalingOps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 36, className: "mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: yearFilter !== "all" ? `No baling operations for ${yearFilter} harvest` : "No baling operations recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: yearFilter !== "all" ? "Try 'All years' or select a different harvest year." : "Start by recording your first baling session on a field." }),
          yearFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", onClick: () => setBalingDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Record First Baling Op"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["", "Date", "Field", "Type / Format", "Produced", "Moved", "In Field", "Status", "Weather", "Operator", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: h }, i)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredBalingOps.map((op) => {
            const isExpanded = expandedOpId === op.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t hover:bg-gray-50 ${isExpanded ? "bg-amber-50/40" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setExpandedOpId(isExpanded ? null : op.id),
                    className: "p-1 rounded hover:bg-amber-100 text-gray-500",
                    title: isExpanded ? "Hide journeys" : "Show journeys",
                    children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: fmtDate(op.operationDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium max-w-[140px] truncate", children: op.fieldOfOrigin || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-gray-600", children: [
                  op.strawType,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: op.baleFormat })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold", children: (op.totalBalesProduced ?? 0).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-green-700 font-semibold", children: (op.balesMoved ?? 0).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-bold ${(op.balingBalance ?? 0) > 0 ? "text-amber-600" : "text-green-600"}`, children: (op.balingBalance ?? 0).toLocaleString() }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BalingStatusBadge, { status: op.status, balance: op.balingBalance ?? 0 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-gray-500 text-xs", children: [
                  op.weatherConditions || "—",
                  op.temperatureC ? ` · ${Number(op.temperatureC).toFixed(0)}°C` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: op.operatorName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-nowrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setJourneyDlg({ open: true, balingOp: op }),
                      title: "Add cartage journey",
                      className: "p-1.5 rounded hover:bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 13 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setInvDlg({ open: true, balingOp: op }),
                      title: "Create inventory batch from this op",
                      className: "p-1.5 rounded hover:bg-green-100 text-green-700 flex items-center gap-1",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 13 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBalingDlg({ open: true, row: op }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelRecord({ type: "straw-baling-operations", id: op.id, title: "Delete baling operation", message: "Delete this baling operation and all its journeys?", confirmLabel: "Delete" }), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
                ] }) })
              ] }),
              isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 11, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                CartageJourneysPanel,
                {
                  farmId,
                  balingOp: op,
                  onAddJourney: () => setJourneyDlg({ open: true, balingOp: op })
                }
              ) }) })
            ] }, op.id);
          }) })
        ] }) }) })
      ] }),
      tab === "inventory" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 18, className: "shrink-0 mt-0.5 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Multi-year storage:" }),
              " Straw bales stored dry and covered routinely carry over one or two harvests — this is normal practice. Each batch retains its own harvest year in the records so you can track age and traceability separately."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Red Tractor / EC 178/2002 mixing rules:" }),
              " There is no rule against holding different harvest years in the same building, but if bales from different ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "types" }),
              " (e.g. wheat vs. barley straw) or harvest years are physically combined into one stack they can no longer be sold with individual identity claims. Keep separate stacks or bays and record each as a distinct batch. For seed-crop straw, variety identity must be maintained throughout."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border overflow-hidden", children: loadInv ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin mx-auto mb-2" }),
          "Loading…"
        ] }) : filteredInventory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 36, className: "mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: yearFilter !== "all" ? `No straw batches for ${yearFilter} harvest` : "No straw batches recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: yearFilter !== "all" ? "Try 'All years' — prior-year batches still in stock will appear there." : "Batches are typically created from a baling operation via the Baling tab — or add one manually here." }),
          yearFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", onClick: () => setInvDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Add Batch"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Batch Ref", "Type", "Format", "Harvest Date", "Qty (Total)", "Remaining", "Moisture", "Storage", "Status", "RT", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredInventory.map((r) => {
            const risk = getMoistureRisk(r.moistureAtBaling ? Number(r.moistureAtBaling) : null, r.baleFormat);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: r.batchRef || /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                "#",
                r.id
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.strawType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.baleFormat }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtDate(r.harvestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold", children: r.quantityBales?.toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.quantityRemaining ?? r.quantityBales }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.moistureAtBaling ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-medium ${risk.colour === "red" ? "text-red-600" : risk.colour === "amber" ? "text-amber-600" : "text-green-600"}`, children: [
                Number(r.moistureAtBaling).toFixed(1),
                "%",
                risk.colour !== "green" && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11, className: "inline ml-1" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600 max-w-[140px] truncate", children: r.storageLocation || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.redTractorCertified ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Red Tractor Certified", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 15, className: "text-green-600" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14, className: "text-gray-300" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPrintDlg({ open: true, row: r }), className: "p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600", title: "Print batch sheet / label", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setInvDlg({ open: true, row: r }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelRecord({ type: "straw-bale-inventory", id: r.id, title: "Delete batch", message: "Delete this batch?", confirmLabel: "Delete" }), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] }) })
            ] }, r.id);
          }) })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FusariumKitStockSection, { farmId })
      ] }),
      tab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border overflow-hidden", children: loadSales ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin mx-auto mb-2" }),
        "Loading…"
      ] }) : filteredSales.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-gray-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 36, className: "mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: yearFilter !== "all" ? `No sales for ${yearFilter} harvest` : "No straw sales recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: yearFilter !== "all" ? "Try 'All years' to see sales from all harvests." : "Record your first sale to track revenue, VAT, and buyer traceability." }),
        yearFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", onClick: () => setSaleDlg({ open: true }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
          "Record First Sale"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Invoice", "Date", "Type / Format", "Qty", "Buyer", "Use / VAT", "Net Value", "VAT", "Gross", "Transport", "Payment", "Passport", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredSales.map((r) => {
          const vat = deriveVatClassification(r.intendedUse);
          const gross = (r.totalValuePence ?? 0) + (r.vatAmountPence ?? 0);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-mono text-xs", children: r.invoiceRef || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: fmtDate(r.saleDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3", children: [
              r.strawType,
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.baleFormat })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-semibold", children: r.quantitySold }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 max-w-[140px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: r.buyerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: r.buyerType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: r.intendedUse }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-semibold ${vat.rate === "0%" ? "text-green-700" : "text-amber-700"}`, children: [
                vat.rate,
                " VAT"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: pToGBP(r.totalValuePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: pToGBP(r.vatAmountPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-semibold", children: pToGBP(gross || r.totalValuePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-xs text-gray-600", children: r.transportedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: r.paymentStatus }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: r.passportIssued ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: r.passportRef || "Passport issued", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { size: 15, className: "text-green-600" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14, className: "text-gray-300" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSaleDlg({ open: true, row: r }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelRecord({ type: "straw-sales", id: r.id, title: "Delete sale record", message: "Delete this sale record?", confirmLabel: "Delete" }), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) }) }),
      tab === "monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "shrink-0 mt-0.5 text-amber-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "HSE INDG125 — Fire Safety Monitoring" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Monitor straw bales for the first ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "10–14 days" }),
            " from stacking (spontaneous combustion window). Safe moisture limits: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "≤22%" }),
            " for small rectangular bales, ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "≤18%" }),
            " for large round or square. Record checks daily initially, then every 2–3 days. SMS alerts fire automatically to farm managers on red moisture or odour events."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border overflow-hidden", children: loadMoist ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin mx-auto mb-2" }),
          "Loading…"
        ] }) : filteredMoisture.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { size: 36, className: "mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: yearFilter !== "all" ? `No monitoring checks for ${yearFilter} harvest` : "No monitoring checks recorded" }),
          yearFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "mt-4", onClick: () => setMoistDlg({ open: true }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15, className: "mr-1" }),
            "Record First Check"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Batch", "Date", "Day #", "Moisture", "Temp (°C)", "Odour", "Condition", "Action Taken", "Checked By", "Device", "Next Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredMoisture.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: r.batchRef || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtDate(r.checkDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.daysFromStacking != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `${r.daysFromStacking <= 14 ? "font-semibold text-amber-700" : "text-gray-600"}`, children: [
              "Day ",
              r.daysFromStacking
            ] }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.moisturePercent ? `${Number(r.moisturePercent).toFixed(1)}%` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.temperatureCelsius ? `${Number(r.temperatureCelsius).toFixed(1)}°C` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.odourObserved ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 font-medium text-xs", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "No" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConditionBadge, { cond: r.overallCondition }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 max-w-[160px] truncate text-gray-600", children: r.actionTaken || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: r.checkedBy || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-gray-500", children: r.deviceUsed || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtDate(r.nextCheckDue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMoistDlg({ open: true, row: r }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelRecord({ type: "straw-moisture-checks", id: r.id, title: "Delete check", message: "Delete this check?", confirmLabel: "Delete" }), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
            ] }) })
          ] }, r.id)) })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { size: 16, className: "text-blue-600" }),
              "Moisture Meter Register"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setMeterDlg({ open: true }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
              "Add Meter"
            ] })
          ] }),
          meters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { size: 28, className: "mx-auto mb-2 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No meters registered. Add your moisture measurement devices to maintain a calibration audit trail." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: meters.map((mtr) => {
            const calSt = meterCalStatus(mtr.nextCalibrationDue);
            const isExpanded = expandedMeterId === mtr.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 flex items-center gap-3 hover:bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpandedMeterId(isExpanded ? null : mtr.id), className: "text-gray-400 hover:text-gray-600", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 15 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
                    mtr.deviceName,
                    !mtr.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-400", children: "(inactive)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: [mtr.make, mtr.model, mtr.serialNumber ? `S/N: ${mtr.serialNumber}` : null].filter(Boolean).join(" · ") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 hidden sm:block", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 11, className: "inline mr-1" }),
                  "Last cal: ",
                  fmtDate(mtr.lastCalibrationDate) || "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${calSt.colour === "green" ? "bg-green-100 text-green-700" : calSt.colour === "amber" ? "bg-amber-100 text-amber-700" : calSt.colour === "red" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`, children: calSt.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCalDlg({ open: true, meter: mtr }), title: "Log Calibration", className: "p-1.5 rounded hover:bg-blue-50 text-blue-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { size: 14 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMeterDlg({ open: true, row: mtr }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelRecord({ type: "straw-moisture-meters", id: mtr.id, title: "Remove meter", message: "Remove this meter from the register?", confirmLabel: "Remove" }), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
                ] })
              ] }),
              isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
                MeterCalHistory,
                {
                  farmId,
                  meter: mtr,
                  onLogCal: () => setCalDlg({ open: true, meter: mtr }),
                  onEdit: (row) => setCalDlg({ open: true, meter: mtr, editRow: row }),
                  deleteMutation: delCalMut
                }
              )
            ] }, mtr.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 18, className: "shrink-0 mt-0.5 text-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Straw Store Fire Compliance — RT FA.10 & FSO 2005" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Red Tractor requires a current fire risk assessment for all straw stores, with annual review. Records below provide the audit evidence trail for RT FA.10, the Regulatory Reform (Fire Safety) Order 2005, and your insurer."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 15, className: "text-red-500" }),
                "Fire Risk Assessment ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-400", children: "(RT FA.10)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setComplianceDlg(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
                fireComplianceRec ? "Update" : "Record"
              ] })
            ] }),
            fireComplianceRec?.lastFireRiskAssessmentDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Last assessment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(fireComplianceRec.lastFireRiskAssessmentDate) })
              ] }),
              fireComplianceRec.assessmentConductedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Conducted by" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fireComplianceRec.assessmentConductedBy })
              ] }),
              fireComplianceRec.assessmentRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: fireComplianceRec.assessmentRef })
              ] }),
              fireComplianceRec.nextFireRiskAssessmentDue && (() => {
                const due = new Date(fireComplianceRec.nextFireRiskAssessmentDue);
                const today2 = /* @__PURE__ */ new Date();
                today2.setHours(0, 0, 0, 0);
                const daysLeft = Math.ceil((due.getTime() - today2.getTime()) / 864e5);
                const colour = daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Next review due" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${colour === "red" ? "bg-red-100 text-red-700" : colour === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: [
                    fmtDate(fireComplianceRec.nextFireRiskAssessmentDue),
                    daysLeft < 0 ? " — OVERDUE" : daysLeft <= 30 ? ` — due in ${daysLeft}d` : ""
                  ] })
                ] });
              })()
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 text-gray-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 24, className: "mx-auto mb-2 opacity-30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
                "No fire risk assessment recorded.",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Red Tractor requires annual assessment."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 15, className: "text-yellow-500" }),
                "Electrical Inspection ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-400", children: "(Electricity at Work Regs 1989)" })
              ] }),
              !fireComplianceRec && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setComplianceDlg(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
                "Record"
              ] })
            ] }),
            fireComplianceRec?.lastElectricalInspectionDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Last inspection" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(fireComplianceRec.lastElectricalInspectionDate) })
              ] }),
              fireComplianceRec.electricalInspectorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Inspector" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fireComplianceRec.electricalInspectorName })
              ] }),
              fireComplianceRec.electricalCertificateRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Certificate ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: fireComplianceRec.electricalCertificateRef })
              ] }),
              fireComplianceRec.nextElectricalInspectionDue && (() => {
                const due = new Date(fireComplianceRec.nextElectricalInspectionDue);
                const today2 = /* @__PURE__ */ new Date();
                today2.setHours(0, 0, 0, 0);
                const daysLeft = Math.ceil((due.getTime() - today2.getTime()) / 864e5);
                const colour = daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Next inspection due" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${colour === "red" ? "bg-red-100 text-red-700" : colour === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: [
                    fmtDate(fireComplianceRec.nextElectricalInspectionDue),
                    daysLeft < 0 ? " — OVERDUE" : daysLeft <= 30 ? ` — due in ${daysLeft}d` : ""
                  ] })
                ] });
              })()
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 text-gray-400", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 24, className: "mx-auto mb-2 opacity-30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
                "No electrical inspection recorded.",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                "Annual inspection required for buildings storing straw."
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 15, className: "text-blue-600" }),
              "HSE INDG125 Safety Checklist"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              fireComplianceRec?.checklistLastReviewedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "Last reviewed: ",
                fmtDate(fireComplianceRec.checklistLastReviewedDate),
                fireComplianceRec.checklistReviewedBy ? ` by ${fireComplianceRec.checklistReviewedBy}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setComplianceDlg(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
                "Update"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3", children: [
            { key: "separationDistancesOk", label: "Separation distances ≥6 m from buildings/boundaries", ref: "INDG125 §3" },
            { key: "smokingSignsDisplayed", label: "No smoking signs displayed at all straw store entrances", ref: "INDG125 §5" },
            { key: "vehicleExhaustRuleInPlace", label: "Vehicle/machinery exhaust rule in place near straw", ref: "INDG125 §6" },
            { key: "hotWorksPermitSystemInPlace", label: "Hot works permit system in place (no work within 10 m)", ref: "INDG125 §7" },
            { key: "emergencyAccessClear", label: "Emergency vehicle access to all stacks kept clear", ref: "INDG125 §8" }
          ].map(({ key, label, ref }) => {
            const checked = !!fireComplianceRec?.[key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-2 p-3 rounded-lg border ${checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`, children: [
              checked ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-green-600 shrink-0 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 16, className: "text-gray-400 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-medium leading-snug ${checked ? "text-green-800" : "text-gray-600"}`, children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: ref })
              ] })
            ] }, key);
          }) }),
          !fireComplianceRec && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-gray-400 mt-3", children: [
            "Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Update" }),
            " to record your checklist confirmations."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-gray-700 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 16, className: "text-orange-500" }),
              "Firefighting Equipment Register ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-400 ml-1", children: "(RT FA.10)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEquipDlg({ open: true }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
              "Add Equipment"
            ] })
          ] }),
          fireEquipment.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 28, className: "mx-auto mb-2 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No firefighting equipment registered. Record extinguishers, hose reels and sand bins to maintain your RT FA.10 audit trail." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Type", "Location", "Description / S/N", "Last Service", "Next Service Due", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: fireEquipment.map((eq) => {
              const svcDue = eq.nextServiceDue ? new Date(eq.nextServiceDue) : null;
              const today2 = /* @__PURE__ */ new Date();
              today2.setHours(0, 0, 0, 0);
              const daysLeft = svcDue ? Math.ceil((svcDue.getTime() - today2.getTime()) / 864e5) : null;
              const svcColour = daysLeft == null ? "gray" : daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-gray-50 ${!eq.isActive ? "opacity-50" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: eq.equipmentType }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: eq.location }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500 text-xs", children: [eq.description, eq.serialNumber ? `S/N: ${eq.serialNumber}` : null].filter(Boolean).join(" · ") || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtDate(eq.lastServiceDate) || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: fmtDate(eq.nextServiceDue) || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: !eq.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Inactive" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${svcColour === "red" ? "bg-red-100 text-red-700" : svcColour === "amber" ? "bg-amber-100 text-amber-700" : svcColour === "green" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`, children: daysLeft == null ? "No date set" : daysLeft < 0 ? "Service overdue" : daysLeft <= 30 ? `Due in ${daysLeft}d` : "Current" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEquipDlg({ open: true, row: eq }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelEquip(eq.id), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
                ] }) })
              ] }, eq.id);
            }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-gray-700 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { size: 16, className: "text-orange-600" }),
              "Hot Works Permit Log ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-400 ml-1", children: "(HSE INDG125 — no hot work within 10 m of straw without permit)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setPermitDlg({ open: true }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
              "Issue Permit"
            ] })
          ] }),
          hotWorksPermits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center text-gray-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { size: 28, className: "mx-auto mb-2 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No hot works permits recorded. Issue a permit before any grinding, welding, or cutting work near straw stores." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Work Description", "Location", "Conducted By", "Supervisor", "Fire Watch", "Post-Work Check", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: hotWorksPermits.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: fmtDate(p.permitDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 max-w-[180px] truncate", children: p.workDescription }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-500", children: p.location || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: p.conductedBy || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-600", children: p.supervisorName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.fireWatchDurationMins ? `${p.fireWatchDurationMins} min` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.postWorkInspectionDone ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 font-medium", children: "Done" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Pending" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPermitDlg({ open: true, row: p }), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelPermit(p.id), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
              ] }) })
            ] }, p.id)) })
          ] }) })
        ] })
      ] }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        annualSummary.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 16, className: "text-amber-600" }),
              "Annual Production & Revenue Summary"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Bales produced on-holding by harvest year and crop type, with total sales revenue booked in that calendar year" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left text-xs font-semibold text-gray-600", children: "Year" }),
              allStrawTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold text-gray-600", children: t.replace(" Straw", "").replace("Oilseed Rape", "OSR") }, t)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold text-gray-600", children: "Total Bales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold text-gray-600", children: "Bales Sold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right text-xs font-semibold text-gray-600", children: "Sales Revenue (net)" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: annualSummary.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-amber-50 cursor-pointer", onClick: () => setYearFilter(row.year), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-700", children: row.year }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-1", children: "harvest" })
              ] }),
              allStrawTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-gray-700", children: row.balesByType[t] ? row.balesByType[t].toLocaleString() : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }, t)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold", children: row.totalBales.toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-gray-600", children: row.soldBales > 0 ? row.soldBales.toLocaleString() : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold text-blue-700", children: row.revenuePence > 0 ? pToGBP(row.revenuePence) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) })
            ] }, row.year)) }),
            annualSummary.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-gray-50 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-xs text-gray-500 uppercase", children: "All years" }),
              allStrawTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold text-xs", children: annualSummary.reduce((s, r) => s + (r.balesByType[t] ?? 0), 0).toLocaleString() }, t)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold", children: annualSummary.reduce((s, r) => s + r.totalBales, 0).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-semibold", children: annualSummary.reduce((s, r) => s + r.soldBales, 0).toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-bold text-blue-700", children: pToGBP(annualSummary.reduce((s, r) => s + r.revenuePence, 0)) })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-2.5 bg-gray-50 border-t text-xs text-gray-400", children: "Click a row to filter the whole page to that harvest year" })
        ] }),
        !analytics ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 24, className: "animate-spin mx-auto" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          analytics.inventoryByType?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }),
              "Current Inventory by Straw Type"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.inventoryByType, margin: { left: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "strawType", tick: { fontSize: 12 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 12 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} bales`, "In Stock"] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "totalBales", fill: "#d97706", radius: [4, 4, 0, 0], name: "Bales" })
            ] }) })
          ] }),
          analytics.salesByUse?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 mb-4 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 16 }),
                "Sales Revenue by Intended Use (Net)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: analytics.salesByUse, dataKey: "totalNetPence", nameKey: "intendedUse", cx: "50%", cy: "50%", outerRadius: 75, label: ({ intendedUse, percent }) => `${intendedUse} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: analytics.salesByUse.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: CHART_COLORS[i % CHART_COLORS.length] }, i)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => pToGBP(v) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 mb-4 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { size: 16 }),
                "VAT Summary"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: analytics.vatSummary?.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center p-3 rounded-lg bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: v.vatClassification }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                    v.count,
                    " sale",
                    v.count !== 1 ? "s" : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: pToGBP(v.totalNetPence) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                    "VAT: ",
                    pToGBP(v.totalVatPence)
                  ] })
                ] })
              ] }, v.vatClassification)) })
            ] })
          ] }),
          analytics.monthlySales?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 16 }),
              "Monthly Sales (Net Revenue)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: analytics.monthlySales, margin: { left: 10 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [pToGBP(v), "Net Revenue"] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "totalPence", stroke: "#16a34a", strokeWidth: 2, dot: { r: 3 } })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border p-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-700 mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 16 }),
              "Compliance Summary"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
              { label: "RT Certified Batches", value: analytics.redTractorCount ?? 0, total: filteredInventory.length, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 16, className: "text-green-600" }) },
              { label: "Passports Issued", value: analytics.passportCount ?? 0, total: filteredSales.length, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { size: 16, className: "text-blue-600" }) },
              { label: "Fusarium Assessed", value: analytics.fusariumCount ?? 0, total: filteredInventory.filter((r) => r.strawType === "Wheat Straw").length, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-amber-600" }) },
              { label: "Fire Risk Alerts", value: actionRequired, total: filteredInventory.length, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: actionRequired > 0 ? "text-red-600" : "text-gray-400" }) }
            ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                c.icon,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600 font-medium", children: c.label })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold", children: [
                c.value,
                c.total > 0 ? ` / ${c.total}` : ""
              ] })
            ] }, c.label)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BalingDialog, { open: balingDlg.open, onClose: () => setBalingDlg({ open: false }), farmId, editRow: balingDlg.row }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CartageDialog,
      {
        open: journeyDlg.open,
        onClose: () => setJourneyDlg({ open: false }),
        farmId,
        balingOp: journeyDlg.balingOp
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InventoryDialog,
      {
        open: invDlg.open,
        onClose: () => setInvDlg({ open: false }),
        farmId,
        editRow: invDlg.row,
        existingInventory: inventory,
        balingOp: invDlg.balingOp
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SalesDialog, { open: saleDlg.open, onClose: () => setSaleDlg({ open: false }), farmId, editRow: saleDlg.row, inventory }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MoistureDialog, { open: moistDlg.open, onClose: () => setMoistDlg({ open: false }), farmId, editRow: moistDlg.row, inventory, activeMeters: meters.filter((m) => m.isActive !== false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MeterDialog, { open: meterDlg.open, onClose: () => setMeterDlg({ open: false }), farmId, editRow: meterDlg.row }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CalibrationDialog, { open: calDlg.open, onClose: () => setCalDlg({ open: false }), farmId, meter: calDlg.meter, editRow: calDlg.editRow }),
    complianceDlg && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FireComplianceDialog,
      {
        open: complianceDlg,
        initial: fireComplianceRec,
        onClose: () => setComplianceDlg(false),
        onSave: (body) => saveComplianceMut.mutate(body),
        saving: saveComplianceMut.isPending,
        farmId
      }
    ),
    equipDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FireEquipmentDialog,
      {
        open: equipDlg.open,
        row: equipDlg.row,
        onClose: () => setEquipDlg({ open: false }),
        onSave: (body) => saveEquipMut.mutate({ id: equipDlg.row?.id, body }),
        saving: saveEquipMut.isPending,
        farmId
      }
    ),
    printDlg.open && printDlg.row && /* @__PURE__ */ jsxRuntimeExports.jsx(BatchPrintDialog, { open: printDlg.open, onClose: () => setPrintDlg({ open: false }), batch: printDlg.row, farmName, rawFarmName }),
    permitDlg.open && /* @__PURE__ */ jsxRuntimeExports.jsx(
      HotWorksDialog,
      {
        open: permitDlg.open,
        row: permitDlg.row,
        onClose: () => setPermitDlg({ open: false }),
        onSave: (body) => savePermitMut.mutate({ id: permitDlg.row?.id, body }),
        saving: savePermitMut.isPending,
        farmId
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelRecord !== null,
        title: pendingDelRecord?.title ?? "Delete record",
        message: pendingDelRecord?.message ?? "Delete this record?",
        confirmLabel: pendingDelRecord?.confirmLabel ?? "Delete",
        confirmVariant: "destructive",
        mutation: delMut,
        onConfirm: () => {
          if (pendingDelRecord) delMut.mutate({ type: pendingDelRecord.type, id: pendingDelRecord.id }, { onSuccess: () => setPendingDelRecord(null) });
        },
        onCancel: () => {
          setPendingDelRecord(null);
          delMut.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelEquip !== null,
        title: "Remove equipment record",
        message: "Remove this equipment record?",
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: delEquipMut,
        onConfirm: () => {
          if (pendingDelEquip !== null) delEquipMut.mutate(pendingDelEquip, { onSuccess: () => setPendingDelEquip(null) });
        },
        onCancel: () => {
          setPendingDelEquip(null);
          delEquipMut.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelPermit !== null,
        title: "Delete permit record",
        message: "Delete this permit record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delPermitMut,
        onConfirm: () => {
          if (pendingDelPermit !== null) delPermitMut.mutate(pendingDelPermit, { onSuccess: () => setPendingDelPermit(null) });
        },
        onCancel: () => {
          setPendingDelPermit(null);
          delPermitMut.reset();
        }
      }
    )
  ] });
}
function FusariumKitStockSection({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editingItem, setEditingItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const [pendingDelKit, setPendingDelKit] = reactExports.useState(null);
  const stockQ = useQuery({
    queryKey: ["straw-fusarium-kit-stock", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw/fusarium-test-kit-stock`, { credentials: "include" }).then((r) => r.json())
  });
  const stock = stockQ.data?.stock ?? [];
  const lowStock = stock.filter((s) => s.quantityRemaining <= s.lowStockThreshold && s.quantityRemaining >= 0);
  const save = useMutation({
    mutationFn: (body) => {
      const url = editingItem ? `/api/farms/${farmId}/straw/fusarium-test-kit-stock/${editingItem.id}` : `/api/farms/${farmId}/straw/fusarium-test-kit-stock`;
      return fetch(url, { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-fusarium-kit-stock", farmId] });
      setOpen(false);
      setEditingItem(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/straw/fusarium-test-kit-stock/${id}`, { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["straw-fusarium-kit-stock", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditingItem(null);
    setForm({ quantityPurchased: 0, quantityUsed: 0, lowStockThreshold: 5 });
    setOpen(true);
  }
  function openEdit(s) {
    setEditingItem(s);
    setForm({ ...s });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setPanelOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 15, className: "text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "Fusarium Test Kit Stock (",
              stock.length,
              " product",
              stock.length !== 1 ? "s" : "",
              ")"
            ] }),
            lowStock.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
              lowStock.length,
              " low stock"
            ] })
          ] }),
          panelOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16, className: "text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, className: "text-gray-500" })
        ]
      }
    ),
    panelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Track DON lateral flow test kits, NIR cartridges, and other on-site Fusarium testing consumables by supplier, batch number, lot number, and expiry date. When linked to a batch assessment, stock decrements automatically — giving you full traceability for Red Tractor audits." }),
      stockQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin text-gray-400" }) : stock.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No kit batches logged yet. Add your first batch below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stock.map((s) => {
        const isOut = s.quantityRemaining === 0;
        const isLow = s.quantityRemaining <= s.lowStockThreshold && !isOut;
        const isExpired = s.expiryDate && new Date(s.expiryDate) < /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-lg border px-3 py-2.5 ${isOut ? "bg-red-50 border-red-200" : isLow ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.productName }),
              s.supplier && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: s.supplier }),
              isOut ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full", children: "Out of stock" }) : isLow ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
                "Low stock"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 10 }),
                "In stock"
              ] }),
              isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full", children: "Expired" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-gray-500", children: [
              s.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Lot: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.lotNumber })
              ] }),
              s.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Batch: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-gray-700", children: s.batchNumber })
              ] }),
              s.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Expires: ",
                new Date(s.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                s.quantityRemaining,
                " of ",
                s.quantityPurchased,
                " remaining"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "(",
                s.quantityUsed,
                " used)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(s), className: "p-1.5 rounded hover:bg-gray-100 text-gray-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingDelKit(s.id), className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] })
        ] }, s.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
        "Add Kit Batch"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingItem ? "Edit Kit Batch" : "Add Fusarium Test Kit Batch" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product / Kit Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Romer QuickScan DON 5/2, Neogen Reveal Q+", value: form.productName || "", onChange: (e) => set("productName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Romer Labs UK, Neogen Europe", value: form.supplier || "", onChange: (e) => set("supplier", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate || "", onChange: (e) => set("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "font-mono", placeholder: "From kit box", value: form.lotNumber || "", onChange: (e) => set("lotNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "font-mono", placeholder: "From kit box", value: form.batchNumber || "", onChange: (e) => set("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Purchased" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityPurchased ?? "", onChange: (e) => set("quantityPurchased", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Qty Used (to date)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.quantityUsed ?? "", onChange: (e) => set("quantityUsed", parseInt(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Low Stock Alert Threshold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.lowStockThreshold ?? 5, onChange: (e) => set("lowStockThreshold", parseInt(e.target.value) || 5) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Alert when remaining ≤ this number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Storage conditions, approved test result range, etc.", value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.productName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
          editingItem ? "Save Changes" : "Add Batch"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelKit !== null,
        title: "Remove kit batch",
        message: "Remove this kit batch?",
        confirmLabel: "Remove",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDelKit !== null) del.mutate(pendingDelKit, { onSuccess: () => setPendingDelKit(null) });
        },
        onCancel: () => {
          setPendingDelKit(null);
          del.reset();
        }
      }
    )
  ] });
}
function BatchPrintDialog({ open, onClose, batch, farmName, rawFarmName }) {
  const printDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const handlePrint = () => {
    const el = document.getElementById("batch-print-content");
    if (!el) return;
    printElementReport(el, {
      title: `Straw Batch Sheet — ${batch.batchRef || `#${batch.id}`}`,
      farmName: rawFarmName,
      recordCount: 1,
      recordLabel: "batch",
      landscape: false
    });
  };
  const row = (label, value) => `<div class="row"><div class="label">${label}</div><div class="value">${value || "—"}</div></div>`;
  const htmlContent = `
    <div class="header-bar">
      <div>
        <h1>Straw Batch Sheet</h1>
        <div style="font-size:10pt;color:#555;">${farmName}</div>
      </div>
      <div style="text-align:right;font-size:9pt;color:#555;">
        <div>Printed: ${printDate}</div>
        <div style="font-size:14pt;font-weight:700;color:#111;margin-top:1mm;">${batch.batchRef || `Batch #${batch.id}`}</div>
      </div>
    </div>

    <h2>Batch Identity</h2>
    <div class="grid">
      ${row("Batch Reference", batch.batchRef || `#${batch.id}`)}
      ${row("Status", batch.status?.replace(/_/g, " ") ?? "—")}
      ${row("Straw Type", batch.strawType)}
      ${row("Bale Format", batch.baleFormat)}
    </div>

    <h2>Origin &amp; Harvest</h2>
    <div class="grid">
      ${row("Harvest Date", batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString("en-GB") : "—")}
      ${row("Field of Origin", batch.fieldOfOrigin || "—")}
      ${row("Crop Variety", batch.cropVariety || "—")}
      ${row("Baling Operation Ref", batch.balingOperationId ? `Op #${batch.balingOperationId}` : "—")}
    </div>

    <h2>Quantity &amp; Condition</h2>
    <div class="grid3">
      ${row("Quantity (Bales)", batch.quantityBales?.toLocaleString() ?? "—")}
      ${row("Remaining (Bales)", (batch.quantityRemaining ?? batch.quantityBales)?.toLocaleString() ?? "—")}
      ${row("Bale Weight (kg)", batch.baleWeightKg ?? "—")}
      ${row("Moisture at Baling", batch.moistureAtBaling ? `${Number(batch.moistureAtBaling).toFixed(1)}%` : "—")}
      ${row("Moisture Risk Status", batch.moistureStatus || "—")}
    </div>

    <h2>Storage</h2>
    <div class="grid">
      ${row("Storage Location", batch.storageLocation || "—")}
      ${row("Storage Type", batch.storageType || "—")}
      ${row("Stacking Start Date", batch.stackingStartDate ? new Date(batch.stackingStartDate).toLocaleDateString("en-GB") : "—")}
    </div>

    <h2>Red Tractor &amp; Compliance</h2>
    <div class="grid">
      ${row("Red Tractor Certified", batch.redTractorCertified ? "✓ Yes" : "No")}
      ${row("Combinable Crops Passport Ref", batch.combinableCropsPassportRef || "—")}
      ${row("PPP Residue Risk", batch.pppResidueRisk || "—")}
      ${row("Fusarium Risk Assessed", batch.fusariumRiskAssessed ? "✓ Yes" : "No")}
    </div>
    ${batch.fusariumRiskAssessed ? `
    <div class="grid" style="margin-top:2mm;">
      ${row("Fusarium Assessment Method", batch.fusariumAssessmentMethod || "—")}
      ${row("Risk Outcome", batch.fusariumRiskLevel || "—")}
      ${row("Assessment Date", batch.fusariumAssessmentDate ? new Date(batch.fusariumAssessmentDate).toLocaleDateString("en-GB") : "—")}
      ${row("Assessor Name", batch.fusariumAssessorName || "—")}
    </div>` : ""}

    ${batch.biomassContract ? `
    <h2>Biomass / Energy Contract</h2>
    <div class="grid">
      ${row("Biomass Scheme", batch.biomassSchemeName || "—")}
      ${row("Unique Bale Reference", batch.biomassUniqueBaleRef || "—")}
    </div>` : ""}

    ${batch.notes ? `<h2>Notes</h2><div class="notes">${batch.notes}</div>` : ""}

    <div style="margin-top:8mm;display:grid;grid-template-columns:1fr 1fr;gap:8mm;">
      <div><div class="label">Authorised By (signature)</div><div class="sig-box"></div></div>
      <div><div class="label">Date</div><div class="sig-box"></div></div>
    </div>

    <div class="footer">
      <span>BDE Farm Trac — Straw Management Module</span>
      <span>${batch.batchRef || `Batch #${batch.id}`} | ${farmName} | ${printDate}</span>
    </div>`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16 }),
      "Batch Sheet — ",
      batch.batchRef || `#${batch.id}`
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "batch-print-content", style: { display: "none" }, dangerouslySetInnerHTML: { __html: htmlContent } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border-b px-4 py-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium", children: "PRINT PREVIEW" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Opens in a new window for printing" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-sm space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start border-b-2 border-green-700 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: "Straw Batch Sheet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-xs", children: farmName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
              "Printed: ",
              printDate
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: batch.batchRef || `Batch #${batch.id}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Batch Identity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Straw Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: batch.strawType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Bale Format" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: batch.baleFormat })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: batch.status?.replace(/_/g, " ") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Origin & Harvest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Harvest Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString("en-GB") : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Field of Origin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.fieldOfOrigin || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Crop Variety" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.cropVariety || "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Quantity & Condition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-x-4 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Total Bales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base", children: batch.quantityBales?.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Remaining" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-base", children: (batch.quantityRemaining ?? batch.quantityBales)?.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Bale Weight" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.baleWeightKg ? `${batch.baleWeightKg} kg` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Moisture at Baling" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.moistureAtBaling ? `${Number(batch.moistureAtBaling).toFixed(1)}%` : "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Storage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-x-4 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.storageLocation || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.storageType || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Stacking Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.stackingStartDate ? new Date(batch.stackingStartDate).toLocaleDateString("en-GB") : "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Red Tractor & Compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Red Tractor Certified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: batch.redTractorCertified ? "text-green-700 font-semibold" : "text-gray-500", children: batch.redTractorCertified ? "✓ Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Passport Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: batch.combinableCropsPassportRef || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "PPP Residue Risk" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.pppResidueRisk || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Fusarium Assessed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: batch.fusariumRiskAssessed ? "text-green-700 font-semibold" : "text-amber-600", children: batch.fusariumRiskAssessed ? "✓ Yes" : "Not recorded" })
            ] })
          ] }),
          batch.fusariumRiskAssessed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 pl-3 border-l-2 border-green-300 grid grid-cols-2 gap-x-8 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: batch.fusariumAssessmentMethod || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Risk Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-semibold ${batch.fusariumRiskLevel === "High" ? "text-red-600" : batch.fusariumRiskLevel === "Medium" ? "text-amber-600" : "text-green-700"}`, children: batch.fusariumRiskLevel || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: batch.fusariumAssessmentDate ? new Date(batch.fusariumAssessmentDate).toLocaleDateString("en-GB") : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Assessor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: batch.fusariumAssessorName || "—" })
            ] })
          ] })
        ] }),
        batch.biomassContract && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Biomass / Energy Contract" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Scheme" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: batch.biomassSchemeName || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase", children: "Unique Bale Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs", children: batch.biomassUniqueBaleRef || "—" })
            ] })
          ] })
        ] }),
        batch.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-green-800 uppercase tracking-wider border-b border-green-700 pb-0.5 mb-2", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 whitespace-pre-wrap", children: batch.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase mb-1", children: "Authorised By (signature)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-300 h-12 rounded" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase mb-1", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-gray-300 h-12 rounded" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-gray-400 border-t pt-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "BDE Farm Trac — Straw Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            batch.batchRef || `Batch #${batch.id}`,
            " | ",
            farmName
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 15 }),
        "Print Batch Sheet"
      ] })
    ] })
  ] }) });
}
function MemberOrManualInput({ label, value, onChange, members, placeholder, required }) {
  const memberNames = members.map((m) => memberFullName(m));
  const [manual, setManual] = reactExports.useState(() => !!(value && !memberNames.includes(value)));
  const selectVal = manual ? "__manual__" : value || "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
      label,
      required ? " *" : ""
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectVal, onValueChange: (v) => {
      if (v === "__manual__") {
        setManual(true);
        onChange("");
      } else {
        setManual(false);
        onChange(v);
      }
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: members.length ? "Select person…" : "Loading…" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: memberFullName(m), children: [
          memberFullName(m),
          m.jobTitle ? ` — ${m.jobTitle}` : ""
        ] }, m.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Not listed (enter below) —" })
      ] })
    ] }),
    manual && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", placeholder: placeholder ?? "Name / company", value, onChange: (e) => onChange(e.target.value) })
  ] });
}
function FireComplianceDialog({ open, initial, onClose, onSave, saving, farmId }) {
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  const blank = {
    lastFireRiskAssessmentDate: "",
    nextFireRiskAssessmentDue: "",
    assessmentConductedBy: "",
    assessmentConductedBySupplierId: null,
    assessmentRef: "",
    separationDistancesOk: false,
    smokingSignsDisplayed: false,
    vehicleExhaustRuleInPlace: false,
    hotWorksPermitSystemInPlace: false,
    emergencyAccessClear: false,
    checklistLastReviewedDate: "",
    checklistReviewedBy: "",
    lastElectricalInspectionDate: "",
    nextElectricalInspectionDue: "",
    electricalInspectorName: "",
    electricalInspectorSupplierId: null,
    electricalCertificateRef: "",
    notes: ""
  };
  const toStr = (v) => v ? String(v).slice(0, 10) : "";
  const [form, setForm] = reactExports.useState(() => initial ? {
    lastFireRiskAssessmentDate: toStr(initial.lastFireRiskAssessmentDate),
    nextFireRiskAssessmentDue: toStr(initial.nextFireRiskAssessmentDue),
    assessmentConductedBy: initial.assessmentConductedBy ?? "",
    assessmentConductedBySupplierId: initial.assessmentConductedBySupplierId ?? null,
    assessmentRef: initial.assessmentRef ?? "",
    separationDistancesOk: !!initial.separationDistancesOk,
    smokingSignsDisplayed: !!initial.smokingSignsDisplayed,
    vehicleExhaustRuleInPlace: !!initial.vehicleExhaustRuleInPlace,
    hotWorksPermitSystemInPlace: !!initial.hotWorksPermitSystemInPlace,
    emergencyAccessClear: !!initial.emergencyAccessClear,
    checklistLastReviewedDate: toStr(initial.checklistLastReviewedDate),
    checklistReviewedBy: initial.checklistReviewedBy ?? "",
    lastElectricalInspectionDate: toStr(initial.lastElectricalInspectionDate),
    nextElectricalInspectionDue: toStr(initial.nextElectricalInspectionDue),
    electricalInspectorName: initial.electricalInspectorName ?? "",
    electricalInspectorSupplierId: initial.electricalInspectorSupplierId ?? null,
    electricalCertificateRef: initial.electricalCertificateRef ?? "",
    notes: initial.notes ?? ""
  } : blank);
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const fb = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => onSave(form);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Fire Compliance Record — RT FA.10 & FSO 2005" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { size: 13, className: "text-red-500" }),
          "Fire Risk Assessment"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Assessment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastFireRiskAssessmentDate, onChange: (e) => f("lastFireRiskAssessmentDate")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextFireRiskAssessmentDue, onChange: (e) => f("nextFireRiskAssessmentDue")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.assessmentConductedBySupplierId ?? null, valueName: form.assessmentConductedBy, onChange: (id, name) => setForm((p) => ({ ...p, assessmentConductedBySupplierId: id, assessmentConductedBy: name })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. FRA-2026-01", value: form.assessmentRef, onChange: (e) => f("assessmentRef")(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { size: 13, className: "text-blue-500" }),
          "HSE INDG125 Checklist Confirmations"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5", children: [
          { key: "separationDistancesOk", label: "Separation distances ≥6 m maintained from buildings, other stacks, and boundaries" },
          { key: "smokingSignsDisplayed", label: "No smoking signs displayed at all straw store entrances" },
          { key: "vehicleExhaustRuleInPlace", label: "Rule in place — no parking vehicles/machinery with hot exhausts near straw" },
          { key: "hotWorksPermitSystemInPlace", label: "Hot works permit system in place (no grinding/welding within 10 m without permit)" },
          { key: "emergencyAccessClear", label: "Emergency vehicle access route to all stacks kept clear at all times" }
        ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2.5 rounded-lg border bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form[key], onCheckedChange: (v) => fb(key)(!!v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: label })
        ] }, key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checklist Last Reviewed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.checklistLastReviewedDate, onChange: (e) => f("checklistLastReviewedDate")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MemberOrManualInput, { label: "Reviewed By", value: form.checklistReviewedBy, onChange: (v) => f("checklistReviewedBy")(v), members, placeholder: "Name" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 13, className: "text-yellow-500" }),
          "Electrical Inspection (Electricity at Work Regulations 1989)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Inspection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastElectricalInspectionDate, onChange: (e) => f("lastElectricalInspectionDate")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextElectricalInspectionDue, onChange: (e) => f("nextElectricalInspectionDue")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Name / Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: form.electricalInspectorSupplierId ?? null, valueName: form.electricalInspectorName, onChange: (id, name) => setForm((p) => ({ ...p, electricalInspectorSupplierId: id, electricalInspectorName: name })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. EICR-2026-Farm", value: form.electricalCertificateRef, onChange: (e) => f("electricalCertificateRef")(e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: saving, children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        "Save Record"
      ] })
    ] })
  ] }) });
}
const EQUIP_TYPES = ["CO₂ Extinguisher", "Water Extinguisher", "Dry Powder Extinguisher", "Foam Extinguisher", "Sand Bin", "Hose Reel", "Fire Blanket", "Other"];
const SERVICE_INTERVAL_OPTIONS = [
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months (annual)" },
  { value: 24, label: "24 months (2 years)" },
  { value: 36, label: "36 months (3 years)" },
  { value: 48, label: "48 months (4 years)" }
];
function FireEquipmentDialog({ open, row, onClose, onSave, saving, farmId: _farmId }) {
  const [form, setForm] = reactExports.useState({
    equipmentType: row?.equipmentType ?? "",
    location: row?.location ?? "",
    description: row?.description ?? "",
    serialNumber: row?.serialNumber ?? "",
    lastServiceDate: row?.lastServiceDate ? String(row.lastServiceDate).slice(0, 10) : "",
    nextServiceDue: row?.nextServiceDue ? String(row.nextServiceDue).slice(0, 10) : "",
    serviceIntervalMonths: row?.serviceIntervalMonths ?? 12,
    isActive: row ? !!row.isActive : true,
    notes: row?.notes ?? ""
  });
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.equipmentType || !form.location) return;
    onSave(form);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      row ? "Edit" : "Add",
      " Firefighting Equipment"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.equipmentType, onValueChange: (v) => f("equipmentType")(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EQUIP_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Main Straw Barn — entrance door", value: form.location, onChange: (e) => f("location")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description / Brand" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 6 kg Britannia CO₂", value: form.description, onChange: (e) => f("description")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Serial / ID number", value: form.serialNumber, onChange: (e) => f("serialNumber")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Service Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.lastServiceDate, onChange: (e) => f("lastServiceDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Service Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextServiceDue, onChange: (e) => f("nextServiceDue")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Service Interval" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.serviceIntervalMonths), onValueChange: (v) => f("serviceIntervalMonths")(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select interval…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SERVICE_INTERVAL_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(o.value), children: o.label }, o.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isActive, onCheckedChange: (v) => f("isActive")(!!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active / in service" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: saving || !form.equipmentType || !form.location, children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        row ? "Save" : "Add Equipment"
      ] })
    ] })
  ] }) });
}
const FIRE_WATCH_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes (HSE minimum)" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes (2 hours)" }
];
const STD_PRECAUTIONS = [
  "Area cleared of loose straw and combustible material within 10 m",
  "Dry powder extinguisher (min. 9 kg) positioned within 3 m of work area",
  "Straw stacks covered with fire blanket where practicable",
  "Water source / hose available nearby",
  "Hot surfaces and spark zone inspected immediately after work stops",
  "Mobile phone / radio carried for emergency contact"
];
function parsePrecautions(raw) {
  if (!raw) return { checked: /* @__PURE__ */ new Set(), additional: "" };
  const lines = raw.split("\n").map((l) => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
  const checked = /* @__PURE__ */ new Set();
  const extra = [];
  for (const line of lines) {
    if (STD_PRECAUTIONS.includes(line)) checked.add(line);
    else extra.push(line);
  }
  return { checked, additional: extra.join("\n") };
}
function HotWorksDialog({ open, row, onClose, onSave, saving, farmId }) {
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  const parsed = parsePrecautions(row?.precautionsTaken ?? "");
  const [checkedPrecautions, setCheckedPrecautions] = reactExports.useState(() => parsed.checked);
  const [additionalPrecautions, setAdditionalPrecautions] = reactExports.useState(() => parsed.additional);
  const [form, setForm] = reactExports.useState({
    permitDate: row?.permitDate ? String(row.permitDate).slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    workDescription: row?.workDescription ?? "",
    location: row?.location ?? "",
    conductedBy: row?.conductedBy ?? "",
    supervisorName: row?.supervisorName ?? "",
    fireWatchDurationMins: row?.fireWatchDurationMins ?? 60,
    postWorkInspectionDone: !!row?.postWorkInspectionDone,
    postWorkInspectionNotes: row?.postWorkInspectionNotes ?? "",
    workCompletedAt: row?.workCompletedAt ?? "",
    closedBy: row?.closedBy ?? "",
    notes: row?.notes ?? ""
  });
  const f = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const togglePrecaution = (item) => {
    setCheckedPrecautions((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };
  const submit = () => {
    if (!form.permitDate || !form.workDescription) return;
    const precautionLines = STD_PRECAUTIONS.filter((p) => checkedPrecautions.has(p)).map((p) => `• ${p}`);
    if (additionalPrecautions.trim()) precautionLines.push(additionalPrecautions.trim());
    onSave({ ...form, precautionsTaken: precautionLines.join("\n") });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      row ? "Edit" : "Issue",
      " Hot Works Permit"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HardHat, { size: 16, className: "shrink-0 mt-0.5 text-orange-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "HSE INDG125 requires no grinding, welding or cutting within ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "10 m" }),
          " of straw stores without formal authorisation. Complete this permit before work begins."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Permit Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.permitDate, onChange: (e) => f("permitDate")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Work Completed At (time)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.workCompletedAt, onChange: (e) => f("workCompletedAt")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Work Description *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Welding barn door hinge, 8 m from straw stack", value: form.workDescription, onChange: (e) => f("workDescription")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North straw barn — west gable end", value: form.location, onChange: (e) => f("location")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MemberOrManualInput, { label: "Conducted By", value: form.conductedBy, onChange: (v) => f("conductedBy")(v), members, placeholder: "Operator name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MemberOrManualInput, { label: "Authorised / Supervised By", value: form.supervisorName, onChange: (v) => f("supervisorName")(v), members, placeholder: "Responsible person" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Precautions Taken" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: STD_PRECAUTIONS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-2.5 rounded-lg border bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: checkedPrecautions.has(item), onCheckedChange: () => togglePrecaution(item), className: "mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: item })
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-gray-500", children: "Additional precautions (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Any other precautions taken…", value: additionalPrecautions, onChange: (e) => setAdditionalPrecautions(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Post-Work Fire Watch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.fireWatchDurationMins), onValueChange: (v) => f("fireWatchDurationMins")(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select duration…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FIRE_WATCH_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(o.value), children: o.label }, o.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.postWorkInspectionDone, onCheckedChange: (v) => f("postWorkInspectionDone")(!!v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Post-work inspection completed" })
      ] }),
      form.postWorkInspectionDone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Post-Inspection Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.postWorkInspectionNotes, onChange: (e) => f("postWorkInspectionNotes")(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MemberOrManualInput, { label: "Closed By", value: form.closedBy, onChange: (v) => f("closedBy")(v), members, placeholder: "Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes, onChange: (e) => f("notes")(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, disabled: saving || !form.permitDate || !form.workDescription, children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "mr-1 animate-spin" }),
        row ? "Save" : "Issue Permit"
      ] })
    ] })
  ] }) });
}
export {
  StrawManagementPage as default
};
