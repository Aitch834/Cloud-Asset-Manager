import { b as useAppStore, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, j as jsxRuntimeExports, T as FlaskConical, O as useMutation, I as Input, d as Button, S as Plus, Q as React, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, e as LoaderCircle, M as MapPin, X as DialogMutationError, J as DialogFooter } from "./index-D6-mkgtr.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { u as useLookupStrings } from "./use-lookup-Cvzgl5z3.js";
import { C as CropYearSelector } from "./CropYearSelector-BqQUDowd.js";
import { c as currentCropYear, i as isInCropYear, b as cropYearLabel } from "./cropYear-Dmv-iNR6.js";
import { T as TabBar, a as TabButton } from "./tab-button-7hftT_89.js";
import { u as usePersistedTab } from "./use-persisted-tab-BZMfXE1Y.js";
import { u as useFarmMembers, m as memberFullName } from "./use-farm-members-BgGyH4yP.js";
import { A as AppLayout, j as Truck } from "./AppLayout-C98bwLR2.js";
import { T as Textarea } from "./textarea-DYpRkKMK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DY9mn6j_.js";
import { R as RecordAttachments } from "./RecordAttachments-giLoRTof.js";
import { B as Badge } from "./badge-Blv73SCx.js";
import { D as Droplets, S as ShieldAlert } from "./shield-alert-DddH24Jh.js";
import { S as Search } from "./search-DD2xhdDL.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-KdW68xZW.js";
import { C as ChevronRight } from "./tractor-C-FvAPGc.js";
import { W as Wind } from "./wind-CRt84SBQ.js";
import { T as Thermometer } from "./thermometer-DyL8e-Y6.js";
import { H as History } from "./history-rsZPzWP5.js";
import { P as Pencil } from "./pencil-BwbRwK2O.js";
import { T as TriangleAlert } from "./triangle-alert-DAbj0ite.js";
import { E as ExternalLink } from "./external-link-BRYnH7PV.js";
import { L as Link2 } from "./link-2-BNPmWe5L.js";
import { P as Printer } from "./printer-eUIVRgz0.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, a as LabelList, L as Legend, C as Cell } from "./generateCategoricalChart-CFC0hH1m.js";
import { B as BarChart } from "./BarChart-BaXQb9IL.js";
import { C as CartesianGrid } from "./CartesianGrid-D4O59fF-.js";
import { P as PieChart, a as Pie } from "./PieChart-7l7B7gT0.js";
import { C as CircleCheckBig } from "./circle-check-big-BLsFGxYd.js";
import { C as ChevronUp } from "./chevron-up-B-oS76L6.js";
import "./use-safe-clerk-DmBTKMAh.js";
import "./database-hlpLpUzS.js";
import "./shield-check-lLDXQmb9.js";
import "./index-CpMxnL0Z.js";
import "./index-CUOAdn2p.js";
import "./use-upload-G8_SWZns.js";
import "./paperclip-EEt2Fys4.js";
import "./upload-kaQ0Hy3f.js";
import "./image-BYLQPd_k.js";
import "./download-C8FmWlmj.js";
const SPRAY_PIE_COLOURS = ["#7c3aed", "#16a34a", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6", "#f97316", "#84cc16"];
function ProductBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs space-y-1 min-w-[180px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800 text-sm truncate max-w-[220px]", children: d.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Area sprayed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-purple-700", children: [
        d.totalHa.toFixed(2),
        " ha"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Applications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: d.count })
    ] }),
    d.totalQty != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Total qty used" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-blue-700", children: [
        d.totalQty % 1 === 0 ? d.totalQty : d.totalQty.toFixed(2),
        d.displayUnit ? ` ${d.displayUnit}` : ""
      ] })
    ] }),
    d.avgRate != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Avg rate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
        d.avgRate,
        d.rateUnit ? ` ${d.rateUnit}` : ""
      ] })
    ] }),
    d.totalSpendPence != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 border-t border-gray-100 pt-1 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Est. spend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-700", children: [
        "£",
        (d.totalSpendPence / 100).toFixed(2)
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 border-t border-gray-100 pt-1 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Est. spend" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 italic", children: "No price on record" })
    ] })
  ] });
}
function SprayAnalyticsTab({ applications, products, fields, cropYear, setCropYear }) {
  const fieldMap = new Map(fields.map((f) => [f.id, f.name]));
  const productMap = new Map(products.map((p) => [p.id, p]));
  const filtered = applications.filter(
    (a) => a.applicationDate && isInCropYear(a.applicationDate, cropYear)
  );
  const productUsage = /* @__PURE__ */ new Map();
  filtered.forEach((a) => {
    const prod = productMap.get(a.productId);
    const name = prod?.productName ?? `Product #${a.productId}`;
    const category = prod?.category ?? "Other";
    const ha = parseFloat(String(a.areaSprayedHa || 0));
    const rate = parseFloat(String(a.applicationRate || 0));
    const qty = isNaN(ha) || isNaN(rate) ? 0 : rate * ha;
    const unit = a.rateUnit ?? null;
    const unitCostPence = prod?.unitCostPence ?? null;
    if (!productUsage.has(a.productId)) {
      productUsage.set(a.productId, { name, category, totalHa: 0, count: 0, totalQty: 0, rateUnit: null, mixedUnits: false, totalSpendPence: null });
    }
    const b = productUsage.get(a.productId);
    b.totalHa += ha;
    b.count++;
    if (unit !== null) {
      if (b.rateUnit === null) {
        b.rateUnit = unit;
        b.totalQty = qty;
      } else if (b.rateUnit !== unit) {
        b.mixedUnits = true;
        b.totalQty = null;
      } else {
        b.totalQty = (b.totalQty ?? 0) + qty;
      }
    }
    if (unitCostPence != null && b.totalQty != null && !b.mixedUnits) {
      b.totalSpendPence = (b.totalSpendPence ?? 0) + qty * unitCostPence;
    }
  });
  const topProducts = [...productUsage.values()].sort((a, b) => b.totalHa - a.totalHa).slice(0, 12).map((p) => {
    const qty = p.mixedUnits ? null : p.totalQty != null ? parseFloat(p.totalQty.toFixed(3)) : null;
    const displayUnit = p.rateUnit ? p.rateUnit.replace(/\/ha$/i, "").trim() : null;
    const qtyLabel = qty != null && displayUnit ? `${qty % 1 === 0 ? qty : qty.toFixed(2)} ${displayUnit}` : null;
    const totalHaRounded = parseFloat(p.totalHa.toFixed(2));
    const avgRate = qty != null && totalHaRounded > 0 ? parseFloat((qty / totalHaRounded).toFixed(2)) : null;
    return {
      ...p,
      totalHa: totalHaRounded,
      totalQty: qty,
      totalQtyLabel: qtyLabel,
      displayUnit,
      avgRate,
      totalSpendPence: p.mixedUnits ? null : p.totalSpendPence
    };
  });
  const monthMap = /* @__PURE__ */ new Map();
  filtered.forEach((a) => {
    if (!a.applicationDate) return;
    const d = new Date(a.applicationDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    if (!monthMap.has(key)) monthMap.set(key, { label, count: 0, totalHa: 0 });
    const b = monthMap.get(key);
    b.count++;
    b.totalHa += parseFloat(String(a.areaSprayedHa || 0));
  });
  const monthData = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, totalHa: parseFloat(v.totalHa.toFixed(2)) }));
  const normaliseCategory = (c) => c.trim().length === 0 ? "Other" : c.trim().charAt(0).toUpperCase() + c.trim().slice(1).toLowerCase();
  const catMap = /* @__PURE__ */ new Map();
  filtered.forEach((a) => {
    const raw = productMap.get(a.productId)?.category ?? "Other";
    const cat = normaliseCategory(raw);
    catMap.set(cat, (catMap.get(cat) ?? 0) + parseFloat(String(a.areaSprayedHa || 0)));
  });
  const catData = [...catMap.entries()].sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  const fieldMap2 = /* @__PURE__ */ new Map();
  filtered.forEach((a) => {
    const fn = fieldMap.get(a.fieldId) ?? `Field #${a.fieldId}`;
    fieldMap2.set(fn, (fieldMap2.get(fn) ?? 0) + 1);
  });
  const fieldData = [...fieldMap2.entries()].sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count }));
  const totalHa = filtered.reduce((s, a) => s + parseFloat(String(a.areaSprayedHa || 0)), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Showing data for crop year:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-gray-600", children: [
        "No spray records for ",
        cropYearLabel(cropYear)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Try a different crop year or log some applications." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Applications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-purple-700", children: filtered.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Total Area Sprayed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-700", children: [
            totalHa.toFixed(1),
            " ha"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 uppercase font-medium mb-1", children: "Products Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: productUsage.size })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: [
          "Area Sprayed by Product (ha) — top ",
          topProducts.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(200, topProducts.length * 36), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: topProducts, layout: "vertical", margin: { top: 4, right: 90, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: (v) => `${v} ha`, tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 140 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductBarTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "totalHa", fill: "#7c3aed", radius: [0, 3, 3, 0], children: /* @__PURE__ */ jsxRuntimeExports.jsx(LabelList, { dataKey: "totalQtyLabel", position: "right", style: { fontSize: 11, fill: "#2563eb", fontWeight: 500 } }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Monthly Applications & Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 10 }, unit: " ha", width: 50 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 10 }, unit: " apps", width: 45 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "totalHa", fill: "#7c3aed", name: "Area (ha)", radius: [3, 3, 0, 0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "right", dataKey: "count", fill: "#0ea5e9", name: "Applications", radius: [3, 3, 0, 0] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: "Area by Product Category (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 240, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: catData, dataKey: "value", nameKey: "name", cx: "40%", cy: "50%", outerRadius: 90, label: false, children: catData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: SPRAY_PIE_COLOURS[i % SPRAY_PIE_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} ha`, ""] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { layout: "vertical", align: "right", verticalAlign: "middle", formatter: (n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11 }, children: n }) })
          ] }) })
        ] })
      ] }),
      fieldData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-700 mb-4", children: [
          "Applications by Field — top ",
          fieldData.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(160, fieldData.length * 34), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: fieldData, layout: "vertical", margin: { top: 4, right: 24, left: 0, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, unit: " apps" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 11 }, width: 120 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} application${v !== 1 ? "s" : ""}`, ""] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "#16a34a", radius: [0, 3, 3, 0] })
        ] }) })
      ] })
    ] })
  ] });
}
const SPRAY_EQUIPMENT_TYPES = ["sprayer", "spot-sprayer", "knapsack", "boom sprayer", "tractor", "uas", "drone", "other"];
function equipmentIsSprayRelevant(type) {
  const t = (type ?? "").toLowerCase();
  return SPRAY_EQUIPMENT_TYPES.some((k) => t.includes(k)) || t.includes("spray");
}
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const RATE_UNITS = ["L/ha", "kg/ha", "g/ha", "mL/ha", "kg/1000L", "L/1000L"];
const WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
function degreesToCompass(deg) {
  return WIND_DIRS[Math.round(deg / 45) % 8];
}
const PRODUCT_CATEGORIES_FALLBACK = ["Herbicide", "Fungicide", "Insecticide", "Molluscicide", "Growth Regulator", "Foliar Feed", "Adjuvant", "Other"];
const SPRAY_TAB_IDS = ["applications", "dayview", "products", "print", "analytics", "ipm", "lerap", "notifications", "disposal", "store", "stocktakes"];
function SprayPage() {
  const { farmId } = useAppStore();
  useLookupStrings("spray_product_categories", PRODUCT_CATEGORIES_FALLBACK);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab({ page: "spray", farmId, validIds: SPRAY_TAB_IDS, defaultTab: "applications" });
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const applicationsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const productsQ = useQuery({ queryKey: ["spray-products", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const fieldsQ = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()), enabled: !!farmId });
  const applications = applicationsQ.data ?? [];
  const products = productsQ.data ?? [];
  const fields = fieldsQ.data ?? [];
  const currentFarm = farmQ.data?.record ?? null;
  const initialFieldSearch = new URLSearchParams(window.location.search).get("field") ?? "";
  const yearApplications = applications.filter(
    (a) => a.applicationDate && isInCropYear(a.applicationDate, cropYear)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Spray Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Field spray application records, product register, and printable assessor log — required for Red Tractor Crop Inputs compliance." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: cropYearLabel(cropYear) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 18, color: "#0369a1" }), label: "Applications", value: yearApplications.length, bg: "#f0f9ff", iconBg: "#e0f2fe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 18, color: "#7c3aed" }), label: "Products Registered", value: products.length, bg: "#f5f3ff", iconBg: "#ede9fe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 18, color: "#166534" }), label: "Fields Treated", value: new Set(yearApplications.map((a) => a.fieldId)).size, bg: "#f0fdf4", iconBg: "#dcfce7" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "#b45309", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3 9h18M9 21V9" })
          ] }),
          label: "Area Treated (ha)",
          value: yearApplications.reduce((s, a) => s + parseFloat(String(a.areaSprayedHa || 0)), 0).toFixed(2) + " ha",
          bg: "#fffbeb",
          iconBg: "#fef3c7"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "applications", onClick: () => setTab("applications"), children: "Applications Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "dayview", onClick: () => setTab("dayview"), children: "Day View" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "products", onClick: () => setTab("products"), children: "Product Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "print", onClick: () => setTab("print"), children: "Print / Export" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "ipm", onClick: () => setTab("ipm"), children: "IPM Plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "lerap", onClick: () => setTab("lerap"), children: "LERAP" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "notifications", onClick: () => setTab("notifications"), children: "Notifications Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "disposal", onClick: () => setTab("disposal"), children: "Container Disposal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "store", onClick: () => setTab("store"), children: "Store Inspections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "stocktakes", onClick: () => setTab("stocktakes"), children: "Stocktakes" })
    ] }),
    tab === "applications" && /* @__PURE__ */ jsxRuntimeExports.jsx(ApplicationsTab, { applications, products, fields, farmId, loading: applicationsQ.isLoading, onRefresh: () => qc.invalidateQueries({ queryKey: ["spray-applications", farmId] }), toast, initialSearch: initialFieldSearch, cropYear, setCropYear }),
    tab === "dayview" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayDayViewTab, { applications, loading: applicationsQ.isLoading }),
    tab === "products" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsTab, { products, farmId, loading: productsQ.isLoading, onRefresh: () => qc.invalidateQueries({ queryKey: ["spray-products", farmId] }), toast }),
    tab === "print" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrintTab, { applications, farm: currentFarm, cropYear, setCropYear }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayAnalyticsTab, { applications, products, fields, cropYear, setCropYear }),
    tab === "ipm" && /* @__PURE__ */ jsxRuntimeExports.jsx(IpmPlanTab, { farmId }),
    tab === "lerap" && /* @__PURE__ */ jsxRuntimeExports.jsx(LerapTab, { farmId, products, fields }),
    tab === "notifications" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayNotificationsTab, { farmId, applications, fields }),
    tab === "disposal" && /* @__PURE__ */ jsxRuntimeExports.jsx(ContainerDisposalTab, { farmId, products }),
    tab === "store" && /* @__PURE__ */ jsxRuntimeExports.jsx(StoreInspectionTab, { farmId }),
    tab === "stocktakes" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayStocktakesTab, { farmId, products })
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
function FieldSprayHistoryDialog({ field, applications, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const [expandedId, setExpandedId] = React.useState(null);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const fieldApps = applications.filter((a) => a.fieldId === field.id);
  const sorted = [...fieldApps].sort((a, b) => new Date(b.applicationDate ?? 0).getTime() - new Date(a.applicationDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((a) => a.applicationDate && new Date(a.applicationDate).getFullYear() === yearFilter);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  function handlePrint() {
    const rows = filtered.map((r) => `<tr><td>${fmtDate(r.applicationDate)}</td><td>${r.productName || "—"}</td><td>${r.targetCrop || "—"}</td><td>${r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—"}</td><td>${r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—"}</td><td>${r.operatorName || "—"}</td><td>${r.reasonForApplication || "—"}</td><td>${r.batchNumber || "—"}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Spray History — ${field.name}</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Spray Application History — ${field.name}</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} · ${filtered.length} application${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Date</th><th>Product</th><th>Crop</th><th>Rate</th><th>Area</th><th>Operator</th><th>Reason</th><th>Batch No.</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">Red Tractor requirement: retain spray records for a minimum of 3 years.</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-green-700" }),
      "Spray History — ",
      field.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " application",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", color: "#9ca3af", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 32, color: "#d1d5db" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem" }, children: [
        "No spray applications",
        yearFilter !== "all" ? ` in ${yearFilter}` : "",
        " for ",
        field.name
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Product", "Crop", "Rate", "Area (ha)", "Operator", "Reason", "Batch", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => {
        const isExpanded = expandedId === r.id;
        const bg = i % 2 === 0 ? "#fff" : "#fafafa";
        const hasExtra = !!(r.reasonForApplication || r.notes || r.growthStage || r.waterVolumeLitres != null || r.windSpeedKmh != null || r.temperatureC != null || r.bufferZoneMetres != null || r.certificateNumber || r.lotNumber);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: isExpanded ? "none" : "1px solid #f3f4f6", background: bg }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }, children: fmtDate(r.applicationDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 600, color: "#1e40af" }, children: r.productName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#065f46" }, children: r.targetCrop || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#374151" }, children: r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.areaSprayedHa || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.operatorName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.reasonForApplication || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151" }, children: r.batchNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.5rem", textAlign: "center" }, children: hasExtra && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setExpandedId(isExpanded ? null : r.id),
                style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px", borderRadius: 4, display: "flex", alignItems: "center" },
                title: isExpanded ? "Collapse" : "Show full details",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 15, style: { transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" } })
              }
            ) })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: bg, borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, style: { padding: "0 0.75rem 0.75rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem 1.5rem" }, children: [
            r.reasonForApplication && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Reason for Application" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 }, children: r.reasonForApplication })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { gridColumn: "1 / -1" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", lineHeight: 1.5 }, children: r.notes })
            ] }),
            r.growthStage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Growth Stage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }, children: r.growthStage })
            ] }),
            r.waterVolumeLitres != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Water Volume" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }, children: [
                r.waterVolumeLitres,
                " L/ha"
              ] })
            ] }),
            r.temperatureC != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Temperature" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }, children: [
                r.temperatureC,
                "°C"
              ] })
            ] }),
            (r.windSpeedKmh != null || r.windDirection) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Wind" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }, children: [r.windSpeedKmh != null ? `${r.windSpeedKmh} km/h` : null, r.windDirection].filter(Boolean).join(" · ") })
            ] }),
            r.bufferZoneMetres != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Buffer Zone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151" }, children: [
                r.bufferZoneMetres,
                " m"
              ] })
            ] }),
            r.certificateNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Certificate No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", fontFamily: "monospace" }, children: r.certificateNumber })
            ] }),
            r.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }, children: "Lot No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.85rem", color: "#374151", fontFamily: "monospace" }, children: r.lotNumber })
            ] })
          ] }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "Red Tractor: retain spray records for a minimum of ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 years" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function ApplicationsTab({ applications, products, fields, farmId, loading, onRefresh, toast, initialSearch, cropYear, setCropYear }) {
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const activeMembers = (membersData?.members ?? []).filter((m) => m.isActive);
  const equipmentQ = useQuery({
    queryKey: ["equipment-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const sprayEquipment = (equipmentQ.data ?? []).filter((e) => equipmentIsSprayRelevant(e.type) && e.isActive !== false);
  const certificatesQ = useQuery({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/certificates`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allCerts = certificatesQ.data ?? [];
  const suppliersQ = useQuery({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allSuppliers = suppliersQ.data ?? [];
  const sprayReasons = useLookupStrings("spray_application_reasons");
  const bbchStages = useLookupStrings("spray_bbch_stages");
  const [search, setSearch] = reactExports.useState(initialSearch ?? "");
  const [filterField, setFilterField] = reactExports.useState("__all__");
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [historyField, setHistoryField] = reactExports.useState(null);
  const emptyForm = { fieldId: "", productId: "", applicationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), applicationRate: "", rateUnit: "L/ha", areaSprayedHa: "", waterVolumeLitres: "", windSpeedKmh: "", windDirection: "", temperatureC: "", operatorName: "", operatorMemberId: "", certificateNumber: "", equipmentUsed: "", equipmentId: "", supplierId: "", reasonForApplication: "", batchNumber: "", lotNumber: "", stockDeliveryId: "", bufferZoneMetres: "", waterSourceNearby: "", notes: "", targetCrop: "", growthStage: "", productCostPencePerUnit: "" };
  const [form, setForm] = reactExports.useState(emptyForm);
  const [weatherAutoFilled, setWeatherAutoFilled] = reactExports.useState(false);
  const [cropAutoFilled, setCropAutoFilled] = reactExports.useState(false);
  const [areaAutoFilled, setAreaAutoFilled] = reactExports.useState(false);
  const [vehicleStationFilled, setVehicleStationFilled] = reactExports.useState(null);
  const [weatherFetching, setWeatherFetching] = reactExports.useState(false);
  const [weatherFetchMsg, setWeatherFetchMsg] = reactExports.useState(null);
  const [deliveryStockItemId, setDeliveryStockItemId] = reactExports.useState(null);
  const formOpen = addOpen || !!editRecord;
  function openEdit(r) {
    setEditRecord(r);
    setDeliveryStockItemId(r.stockDeliveryId ? String(r.stockDeliveryId) : null);
    setWeatherAutoFilled(false);
    setForm({
      fieldId: r.fieldId ? String(r.fieldId) : "",
      productId: r.productId ? String(r.productId) : "",
      applicationDate: r.applicationDate ? r.applicationDate.slice(0, 10) : "",
      applicationRate: r.applicationRate != null ? String(r.applicationRate) : "",
      rateUnit: r.rateUnit || "L/ha",
      areaSprayedHa: r.areaSprayedHa != null ? String(r.areaSprayedHa) : "",
      waterVolumeLitres: r.waterVolumeLitres != null ? String(r.waterVolumeLitres) : "",
      windSpeedKmh: r.windSpeedKmh != null ? String(r.windSpeedKmh) : "",
      windDirection: r.windDirection || "",
      temperatureC: r.temperatureC != null ? String(r.temperatureC) : "",
      operatorName: r.operatorName || "",
      operatorMemberId: r.operatorMemberId ? String(r.operatorMemberId) : "",
      certificateNumber: r.certificateNumber || "",
      equipmentUsed: r.equipmentUsed || "",
      equipmentId: r.equipmentId ? String(r.equipmentId) : "",
      supplierId: r.supplierId ? String(r.supplierId) : "",
      reasonForApplication: r.reasonForApplication || "",
      batchNumber: r.batchNumber || "",
      lotNumber: r.lotNumber || "",
      stockDeliveryId: r.stockDeliveryId ? String(r.stockDeliveryId) : "",
      bufferZoneMetres: r.bufferZoneMetres != null ? String(r.bufferZoneMetres) : "",
      waterSourceNearby: r.waterSourceNearby || "",
      notes: r.notes || "",
      targetCrop: r.targetCrop || "",
      growthStage: r.growthStage || "",
      productCostPencePerUnit: r.productCostPencePerUnit ?? ""
    });
  }
  function closeForm() {
    setAddOpen(false);
    setEditRecord(null);
    setForm(emptyForm);
    setDeliveryStockItemId(null);
    setWeatherAutoFilled(false);
    setCropAutoFilled(false);
    setAreaAutoFilled(false);
    setVehicleStationFilled(null);
    setWeatherFetchMsg(null);
    setWeatherFetching(false);
  }
  reactExports.useEffect(() => {
    if (!formOpen || editRecord) return;
    if (!form.fieldId || !form.applicationDate) {
      setCropAutoFilled(false);
      return;
    }
    const fieldObj = fields.find((f) => String(f.id) === String(form.fieldId));
    if (!fieldObj) return;
    fetch(`/api/farms/${farmId}/crop-for-field?fieldName=${encodeURIComponent(fieldObj.name)}&date=${form.applicationDate}`).then((r) => r.json()).then((d) => {
      if (d.found && d.cropName) {
        setForm((f) => ({ ...f, targetCrop: d.cropName }));
        setCropAutoFilled(true);
      }
    }).catch(() => {
    });
  }, [form.fieldId, form.applicationDate, formOpen, editRecord]);
  const deliveriesQ = useQuery({
    queryKey: ["spray-batch-deliveries", farmId, deliveryStockItemId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries/by-product/${deliveryStockItemId}`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && !!deliveryStockItemId
  });
  const vehicleWeatherQ = useQuery({
    queryKey: ["vehicle-weather", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-readings`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const vehicleReadings = vehicleWeatherQ.data ?? [];
  const handleProductChange = (v) => {
    const product = products.find((p) => String(p.id) === v);
    setDeliveryStockItemId(product?.stockItemId ? String(product.stockItemId) : null);
    setForm((f) => ({ ...f, productId: v, batchNumber: "", lotNumber: "", stockDeliveryId: "" }));
  };
  const handleOperatorChange = (memberId) => {
    if (!memberId || memberId === "__manual__") {
      setForm((f) => ({ ...f, operatorMemberId: "", operatorName: "" }));
      return;
    }
    const member = activeMembers.find((m) => String(m.id) === memberId);
    if (!member) return;
    const fullName = memberFullName(member);
    let certNumber = "";
    const memberUserKeys = /* @__PURE__ */ new Set([String(member.id), fullName]);
    if (member.linkedUserId) memberUserKeys.add(member.linkedUserId);
    const paTypes = ["PA1", "PA2", "PA6", "PA4", "PA3"];
    const now = /* @__PURE__ */ new Date();
    for (const paType of paTypes) {
      const cert = allCerts.find(
        (c) => memberUserKeys.has(String(c.userId)) && (c.certificateType ?? "").toUpperCase().includes(paType) && (!c.expiryDate || new Date(c.expiryDate) > now)
      );
      if (cert) {
        certNumber = cert.certificateNumber ?? "";
        break;
      }
    }
    if (!certNumber) {
      const anyCert = allCerts.find(
        (c) => memberUserKeys.has(String(c.userId)) && (!c.expiryDate || new Date(c.expiryDate) > now)
      );
      if (anyCert) certNumber = anyCert.certificateNumber ?? "";
    }
    setForm((f) => ({ ...f, operatorMemberId: memberId, operatorName: fullName, certificateNumber: certNumber }));
  };
  const handleDeliveryChange = (v) => {
    if (v === "__none__") {
      setForm((f) => ({ ...f, stockDeliveryId: "", batchNumber: "", lotNumber: "", supplierId: "" }));
    } else {
      const del = (deliveriesQ.data ?? []).find((d) => String(d.id) === v);
      const unitPricePence = del?.costPence && del?.quantity && parseFloat(String(del.quantity)) > 0 ? Math.round(Number(del.costPence) / parseFloat(String(del.quantity))) : null;
      setForm((f) => ({
        ...f,
        stockDeliveryId: v,
        batchNumber: del?.batchNumber || f.batchNumber,
        lotNumber: del?.lotNumber || f.lotNumber,
        supplierId: del?.supplierId ? String(del.supplierId) : f.supplierId,
        productCostPencePerUnit: unitPricePence != null ? String(unitPricePence) : f.productCostPencePerUnit
      }));
    }
  };
  async function fetchWeatherForDate(date) {
    if (!date || !farmId) return;
    const target = new Date(date).getTime();
    try {
      try {
        const sensorData = await fetch(`/api/farms/${farmId}/sensor-readings?category=weather&limit=200`).then((r) => r.json());
        const sensorReadings = sensorData.readings ?? [];
        if (sensorReadings.length > 0) {
          const sorted = [...sensorReadings].sort(
            (a, b) => Math.abs(new Date(a.recordedAt).getTime() - target) - Math.abs(new Date(b.recordedAt).getTime() - target)
          );
          const closestTs = new Date(sorted[0].recordedAt).getTime();
          if (Math.abs(closestTs - target) < 864e5 * 2) {
            const window2 = sensorReadings.filter((r) => Math.abs(new Date(r.recordedAt).getTime() - closestTs) < 30 * 6e4);
            const getVal = (param) => window2.find((r) => r.parameter === param)?.value;
            const temp = getVal("air_temperature") ?? getVal("temperature");
            const wind = getVal("wind_speed");
            const windDir = getVal("wind_direction");
            if (temp != null || wind != null) {
              setForm((f) => ({
                ...f,
                temperatureC: temp != null ? String(Math.round(Number(temp) * 10) / 10) : f.temperatureC,
                windSpeedKmh: wind != null ? String(Math.round(Number(wind))) : f.windSpeedKmh,
                windDirection: windDir != null ? degreesToCompass(Number(windDir)) : f.windDirection
              }));
              setWeatherAutoFilled(true);
              return;
            }
          }
        }
      } catch {
      }
      const data = await fetch(`/api/farms/${farmId}/weather-readings`).then((r) => r.json());
      const readings = data.records ?? [];
      if (readings.length === 0) return;
      let closest = null;
      let closestDiff = Infinity;
      for (const r of readings) {
        if (!r.readingTimestamp) continue;
        const diff = Math.abs(new Date(r.readingTimestamp).getTime() - target);
        if (diff < closestDiff) {
          closestDiff = diff;
          closest = r;
        }
      }
      if (closest && closestDiff < 864e5 * 2) {
        setForm((f) => ({
          ...f,
          windSpeedKmh: closest.windSpeedKmh != null ? String(closest.windSpeedKmh) : f.windSpeedKmh,
          windDirection: closest.windDirection || f.windDirection,
          temperatureC: closest.temperatureC != null ? String(closest.temperatureC) : f.temperatureC
        }));
        setWeatherAutoFilled(true);
      }
    } catch {
    }
  }
  function checkVehicleWeather(equipmentId, date) {
    if (!equipmentId || !date || equipmentId === "__other__") {
      setVehicleStationFilled(null);
      return;
    }
    const target = new Date(date).getTime();
    const forEq = vehicleReadings.filter((r) => r.equipmentId && String(r.equipmentId) === equipmentId && r.readingTimestamp);
    if (forEq.length === 0) {
      setVehicleStationFilled(null);
      return;
    }
    let best = null, bestDiff = Infinity;
    for (const r of forEq) {
      const diff = Math.abs(new Date(r.readingTimestamp).getTime() - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = r;
      }
    }
    if (best && bestDiff < 864e5 * 2) {
      setVehicleStationFilled(best);
      setWeatherAutoFilled(false);
      setForm((f) => ({
        ...f,
        windSpeedKmh: best.windSpeedKmh != null ? String(best.windSpeedKmh) : f.windSpeedKmh,
        windDirection: best.windDirection || f.windDirection,
        temperatureC: best.temperatureC != null ? String(best.temperatureC) : f.temperatureC
      }));
    } else {
      setVehicleStationFilled(null);
    }
  }
  async function fetchLiveWeather() {
    setWeatherFetching(true);
    setWeatherFetchMsg(null);
    try {
      const pos = await new Promise(
        (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1e4 })
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Weather service error ${resp.status}`);
      const data = await resp.json();
      const c = data.current;
      setForm((f) => ({
        ...f,
        windSpeedKmh: c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m)) : f.windSpeedKmh,
        windDirection: c.wind_direction_10m != null ? degreesToCompass(c.wind_direction_10m) : f.windDirection,
        temperatureC: c.temperature_2m != null ? String(Math.round(c.temperature_2m * 10) / 10) : f.temperatureC
      }));
      setWeatherAutoFilled(false);
      setWeatherFetchMsg(`Live · ${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`);
    } catch (err) {
      setWeatherFetchMsg(`Could not fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setWeatherFetching(false);
    }
  }
  const buildPayload = (body) => ({
    ...body,
    growthStage: body.growthStage === "__other__" ? "" : body.growthStage || null,
    reasonForApplication: body.reasonForApplication === "__other__" ? "" : body.reasonForApplication || "",
    stockDeliveryId: body.stockDeliveryId ? Number(body.stockDeliveryId) : null,
    equipmentId: body.equipmentId ? Number(body.equipmentId) : null,
    supplierId: body.supplierId ? Number(body.supplierId) : null,
    operatorMemberId: body.operatorMemberId ? Number(body.operatorMemberId) : null,
    batchNumber: body.batchNumber || null,
    lotNumber: body.lotNumber || null,
    productCostPencePerUnit: body.productCostPencePerUnit !== "" && body.productCostPencePerUnit != null ? Number(body.productCostPencePerUnit) : null
  });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/spray-applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }).then((r) => {
      if (!r.ok) throw new Error(`Save failed (${r.status})`);
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Application recorded" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload(body)) }).then((r) => {
      if (!r.ok) throw new Error(`Update failed (${r.status})`);
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Application updated" });
      onRefresh();
      closeForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-applications/${id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error(`Delete failed (${r.status})`);
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      onRefresh();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const fieldNamesInYear = Array.from(
    new Set(
      applications.filter((r) => isInCropYear(r.applicationDate, cropYear)).map((r) => r.fieldName).filter(Boolean)
    )
  ).sort();
  const filtered = applications.filter((r) => {
    if (!isInCropYear(r.applicationDate, cropYear)) return false;
    if (filterField !== "__all__" && r.fieldName !== filterField) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.fieldName?.toLowerCase().includes(s) || r.productName?.toLowerCase().includes(s) || r.operatorName?.toLowerCase().includes(s) || r.reasonForApplication?.toLowerCase().includes(s);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    historyField && /* @__PURE__ */ jsxRuntimeExports.jsx(FieldSprayHistoryDialog, { field: historyField, applications, onClose: () => setHistoryField(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", flex: 1, minWidth: 220 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search applications...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterField, onValueChange: setFilterField, children: [
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
        setForm(emptyForm);
        setDeliveryStockItemId(null);
        setAddOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Application"
      ] })
    ] }),
    !loading && filtered.length > 0 && (() => {
      const totalArea = filtered.reduce((s, r) => s + parseFloat(String(r.areaSprayedHa || 0)), 0);
      const hasWater = filtered.some((r) => r.waterVolumeLitres);
      const totalWater = hasWater ? filtered.reduce((s, r) => s + parseFloat(String(r.waterVolumeLitres || 0)), 0) : 0;
      const uniqueProducts = new Set(filtered.map((r) => r.productName).filter(Boolean)).size;
      const uniqueFields = new Set(filtered.map((r) => r.fieldName).filter(Boolean)).size;
      const byProduct = {};
      filtered.forEach((r) => {
        const key = String(r.productName || "Unknown");
        if (!byProduct[key]) byProduct[key] = { count: 0, ha: 0 };
        byProduct[key].count++;
        byProduct[key].ha += parseFloat(String(r.areaSprayedHa || 0));
      });
      const productRows = Object.entries(byProduct).sort((a, b) => b[1].ha - a[1].ha);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: productRows.length > 1 ? 10 : 0, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Applications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }, children: filtered.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Area Treated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }, children: [
              totalArea.toFixed(2),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "ha" })
            ] })
          ] }),
          uniqueProducts > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Products Used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#4c1d95", lineHeight: 1, margin: 0 }, children: uniqueProducts })
          ] }),
          uniqueFields > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Fields Treated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: uniqueFields })
          ] }),
          hasWater && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 160 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Water Volume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: [
              totalWater.toFixed(0),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "L" })
            ] })
          ] })
        ] }),
        productRows.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 14px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#7c3aed", letterSpacing: "0.06em", margin: "0 0 8px" }, children: "By Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 20px" }, children: productRows.map(([product, vals]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", color: "#4c1d95" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700 }, children: product }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#7c3aed", marginLeft: 4 }, children: [
              vals.count,
              " app",
              vals.count !== 1 ? "s" : "",
              " — ",
              vals.ha.toFixed(2),
              " ha"
            ] })
          ] }, product)) })
        ] })
      ] });
    })(),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 28, color: "#9ca3af" }), title: "No spray applications recorded", subtitle: "Log each field application to build your Red Tractor crop inputs record." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["", "Date", "Field", "Crop", "Product", "Rate", "Area (ha)", "Operator", "Reason", "Weather", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", cursor: "pointer" }, onClick: () => setExpandedId(expandedId === r.id ? null : r.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.5rem 0.5rem 0.75rem", width: 24, color: "#9ca3af" }, children: expandedId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280" }, children: fmt(r.applicationDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: r.fieldName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#065f46", fontWeight: 500 }, children: r.targetCrop || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#fca5a5", fontSize: "0.75rem", fontWeight: 400 }, children: "Not recorded" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500, color: "#1e40af" }, children: r.productName || "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151" }, children: r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.operatorName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.reasonForApplication || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.windSpeedKmh || r.temperatureC ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#6b7280" }, children: [
            r.windSpeedKmh && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wind, { size: 11 }),
              r.windSpeedKmh,
              " km/h ",
              r.windDirection || ""
            ] }),
            r.temperatureC && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { size: 11 }),
              r.temperatureC,
              "°C"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 2, alignItems: "center" }, children: [
            r.fieldId != null && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setHistoryField({ id: r.fieldId, name: r.fieldName || "Field" }), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }, title: "Field spray history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] }) })
        ] }),
        expandedId === r.id && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#fafafa" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, style: { padding: "0.75rem 1.25rem", borderBottom: "1px solid #f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, fontSize: "0.8rem" }, children: [
          ["Target Crop", r.targetCrop],
          ["Growth Stage", r.growthStage],
          ["Water Volume", r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : null],
          ["Equipment Used", r.equipmentName ? `${r.equipmentName}${r.equipmentUsed && r.equipmentUsed !== r.equipmentName ? ` — ${r.equipmentUsed}` : ""}` : r.equipmentUsed],
          ["PA1/PA6 Certificate", r.certificateNumber],
          ["Supplier", r.supplierName || null],
          ["Batch Number", r.batchNumber],
          ["Lot Number", r.lotNumber],
          ["Wind Speed", r.windSpeedKmh ? `${r.windSpeedKmh} km/h` : null],
          ["Wind Direction", r.windDirection],
          ["Temperature", r.temperatureC ? `${r.temperatureC}°C` : null],
          ["Notes", r.notes]
        ].map(([k, v]) => v ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }, children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#374151", fontWeight: 500, fontFamily: k === "Batch Number" || k === "Lot Number" ? "monospace" : "inherit" }, children: v })
        ] }, k) : null) }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) {
        closeForm();
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Spray Application" : "Log Spray Application" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", style: { maxHeight: "70vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Field ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId, onValueChange: (v) => {
              const fieldObj = fields.find((f) => String(f.id) === v);
              const fieldArea = fieldObj ? fieldObj.computedFarmableAreaHa ?? fieldObj.areaHectares ?? "" : "";
              setForm((f) => ({ ...f, fieldId: v, areaSprayedHa: fieldArea ? String(parseFloat(String(fieldArea)).toFixed(2)) : f.areaSprayedHa }));
              if (fieldArea) setAreaAutoFilled(true);
              else setAreaAutoFilled(false);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
                f.name,
                f.areaHectares ? ` (${parseFloat(String(f.areaHectares)).toFixed(2)} ha)` : ""
              ] }, f.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Application Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate, onChange: (e) => {
              const d = e.target.value;
              setWeatherAutoFilled(false);
              setVehicleStationFilled(null);
              setForm((f) => ({ ...f, applicationDate: d }));
              fetchWeatherForDate(d);
              checkVehicleWeather(form.equipmentId, d);
            } })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Target Crop (being sprayed) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. Winter Wheat, OSR, Sugar Beet",
                  value: form.targetCrop,
                  onChange: (e) => {
                    setForm((f) => ({ ...f, targetCrop: e.target.value }));
                    setCropAutoFilled(false);
                  }
                }
              ),
              cropAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 600, borderRadius: 4, padding: "1px 6px", pointerEvents: "none" }, children: "Auto-filled" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Growth Stage (BBCH)" }),
            (() => {
              const isCustomGs = !!form.growthStage && bbchStages.length > 0 && !bbchStages.includes(form.growthStage);
              const gsSelectVal = isCustomGs ? "__other__" : form.growthStage || "";
              return bbchStages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. GS31, BBCH 31–32", value: form.growthStage, onChange: (e) => setForm((f) => ({ ...f, growthStage: e.target.value })) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: gsSelectVal, onValueChange: (v) => {
                  if (v === "__other__") {
                    setForm((f) => ({ ...f, growthStage: "__other__" }));
                    return;
                  }
                  setForm((f) => ({ ...f, growthStage: v }));
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select growth stage..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    bbchStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (specify below)" })
                  ] })
                ] }),
                (isCustomGs || gsSelectVal === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", style: { fontSize: "0.8rem" }, placeholder: "e.g. GS31, BBCH 31–32, flag leaf", value: form.growthStage === "__other__" ? "" : form.growthStage, onChange: (e) => setForm((f) => ({ ...f, growthStage: e.target.value })) })
              ] });
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Product ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productId, onValueChange: handleProductChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", disabled: true, children: "Add products in the Product Register tab first" }) : products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
              p.productName,
              p.activeIngredient ? ` (${p.activeIngredient})` : ""
            ] }, p.id)) })
          ] })
        ] }),
        (() => {
          const selectedProduct = form.productId ? products.find((p) => String(p.id) === String(form.productId)) : null;
          if (!selectedProduct?.stockItemId) return null;
          const qty = selectedProduct.currentStockQuantity;
          const unit = (selectedProduct.stockUnit || "").trim();
          const isOut = qty !== null && qty <= 0;
          const isLow = qty !== null && qty > 0 && qty < 10;
          const bg = isOut ? "#fef2f2" : isLow ? "#fffbeb" : "#f0fdf4";
          const border = isOut ? "#fecaca" : isLow ? "#fcd34d" : "#bbf7d0";
          const textColor = isOut ? "#991b1b" : isLow ? "#92400e" : "#166534";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.6rem 0.9rem", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: textColor, fontWeight: 600 }, children: "Current stock:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", fontWeight: 700, color: textColor }, children: qty !== null ? `${qty % 1 === 0 ? qty : qty.toFixed(2)}${unit ? ` ${unit}` : ""}` : "Not tracked" }),
            isOut && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", fontSize: "0.72rem", color: "#dc2626", fontWeight: 700 }, children: "⚠ OUT OF STOCK" }),
            isLow && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", fontSize: "0.72rem", color: "#b45309", fontWeight: 700 }, children: "⚠ LOW STOCK" })
          ] });
        })(),
        (() => {
          const selectedProduct = form.productId ? products.find((p) => String(p.id) === String(form.productId)) : null;
          if (!selectedProduct?.maxApplicationsPerSeason || !form.productId || !form.fieldId) return null;
          const selectedField = fields.find((f) => String(f.id) === String(form.fieldId));
          const seasonCount = applications.filter((a) => {
            if (String(a.productId) !== String(form.productId)) return false;
            if (String(a.fieldId) !== String(form.fieldId)) return false;
            if (editRecord && a.id === editRecord.id) return false;
            return isInCropYear(a.applicationDate, cropYear);
          }).length;
          if (seasonCount < Number(selectedProduct.maxApplicationsPerSeason)) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, style: { color: "#dc2626", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.8rem", color: "#991b1b" }, children: "Field Season Limit Reached" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#7f1d1d", margin: 0 }, children: [
              selectedProduct.productName,
              " has a maximum of ",
              selectedProduct.maxApplicationsPerSeason,
              " application",
              Number(selectedProduct.maxApplicationsPerSeason) !== 1 ? "s" : "",
              " per season per field.",
              selectedField ? ` ${selectedField.name} has` : " This field has",
              " already received ",
              seasonCount,
              " application",
              seasonCount !== 1 ? "s" : "",
              " this season."
            ] })
          ] });
        })(),
        (() => {
          const selectedProduct = form.productId ? products.find((p) => String(p.id) === String(form.productId)) : null;
          const coshh = selectedProduct?.coshhRecord;
          if (!coshh) return null;
          const ppeList = coshh.ppe ? coshh.ppe.split(",").map((s) => s.trim()).filter(Boolean) : [];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 15, style: { color: "#b45309", flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.8rem", color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Safety Reminder — COSHH" }),
              coshh.hazardClassification && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: "0.7rem", marginLeft: "auto" }, children: coshh.hazardClassification })
            ] }),
            ppeList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: "0 0 0.3rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "PPE required:" }),
              " ",
              ppeList.join(" · ")
            ] }),
            coshh.controlMeasures && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#92400e", margin: "0 0 0.3rem" }, children: coshh.controlMeasures }),
            coshh.emergencyProcedures && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#dc2626", margin: "0.3rem 0 0", fontWeight: 600 }, children: [
              "Emergency: ",
              coshh.emergencyProcedures
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#a16207", margin: "0.4rem 0 0" }, children: "Full COSHH assessment in Risk & Safety → Chemical Handling" })
          ] });
        })(),
        (() => {
          const selectedProduct = form.productId ? products.find((p) => String(p.id) === String(form.productId)) : null;
          if (!selectedProduct?.lerapCategory) return null;
          const isCatA = selectedProduct.lerapCategory === "A";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: isCatA ? "#fef2f2" : "#fffbeb", border: `1px solid ${isCatA ? "#fecaca" : "#fcd34d"}`, borderRadius: 8, padding: "0.75rem 1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.78rem", color: isCatA ? "#991b1b" : "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }, children: [
                "LERAP — Category ",
                selectedProduct.lerapCategory
              ] }),
              selectedProduct.lerapStandardBufferM != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", background: isCatA ? "#fee2e2" : "#fef3c7", color: isCatA ? "#991b1b" : "#92400e", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 7px" }, children: [
                selectedProduct.lerapStandardBufferM,
                "m standard buffer"
              ] })
            ] }),
            isCatA ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.77rem", color: "#7f1d1d", margin: 0 }, children: [
              "This product carries a ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Category A LERAP label" }),
              ". The buffer zone printed on the label is ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "fixed" }),
              " and cannot be reduced. Maintain the full buffer from any watercourse, ditch or drain."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.77rem", color: "#78350f", margin: 0 }, children: [
              "This product carries a ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Category B LERAP label" }),
              ". If spraying near surface water, a LERAP assessment must be completed before application — record it in the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LERAP tab" }),
              ". A valid assessment may allow a reduced buffer."
            ] })
          ] });
        })(),
        deliveryStockItemId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { marginBottom: 6, display: "block", color: "#166534", fontWeight: 600, fontSize: "0.8rem" }, children: "Batch / Lot Traceability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", color: "#4b5563" }, children: "Select Delivery (Batch/Lot)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.stockDeliveryId,
                  onValueChange: handleDeliveryChange,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem", height: 34 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from GRN deliveries..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No specific delivery" }),
                      deliveriesQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__loading__", disabled: true, children: "Loading..." }),
                      (deliveriesQ.data ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                        d.grnNumber ? `${d.grnNumber} — ` : "",
                        d.batchNumber ? `Batch: ${d.batchNumber}` : "",
                        d.lotNumber ? ` Lot: ${d.lotNumber}` : "",
                        " (",
                        new Date(d.deliveryDate).toLocaleDateString("en-GB"),
                        ")"
                      ] }, d.id))
                    ] })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", color: "#4b5563" }, children: "Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { style: { height: 34, fontSize: "0.8rem" }, placeholder: "e.g. BT240301", value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", color: "#4b5563" }, children: "Lot Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { style: { height: 34, fontSize: "0.8rem" }, placeholder: "e.g. LOT-2026-001", value: form.lotNumber, onChange: (e) => setForm((f) => ({ ...f, lotNumber: e.target.value })) })
              ] })
            ] })
          ] })
        ] }),
        !deliveryStockItemId && form.productId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BT240301", value: form.batchNumber, onChange: (e) => setForm((f) => ({ ...f, batchNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. LOT-2026-001", value: form.lotNumber, onChange: (e) => setForm((f) => ({ ...f, lotNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", placeholder: "0.00", value: form.applicationRate, onChange: (e) => setForm((f) => ({ ...f, applicationRate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rate Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rateUnit, onValueChange: (v) => setForm((f) => ({ ...f, rateUnit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RATE_UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Sprayed (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: form.areaSprayedHa, onChange: (e) => {
                setForm((f) => ({ ...f, areaSprayedHa: e.target.value }));
                setAreaAutoFilled(false);
              } }),
              areaAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 600, borderRadius: 4, padding: "1px 6px", pointerEvents: "none" }, children: "Auto-filled" })
            ] }),
            (() => {
              const fr = fields.find((f) => String(f.id) === String(form.fieldId));
              const area = form.areaSprayedHa ? parseFloat(String(form.areaSprayedHa)) : null;
              if (fr?.areaHectares && area && area > Number(fr.areaHectares)) {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-red-600 mt-1", children: [
                  "Exceeds ",
                  fr.name,
                  "'s total area (",
                  Number(fr.areaHectares).toFixed(2),
                  " ha) — please correct before saving."
                ] });
              }
              return null;
            })()
          ] })
        ] }),
        (() => {
          const rate = parseFloat(form.applicationRate);
          const area = parseFloat(form.areaSprayedHa);
          if (isNaN(rate) || isNaN(area) || rate <= 0 || area <= 0) return null;
          const qty = rate * area;
          const unit = (form.rateUnit ?? "L/ha").replace(/\/ha$/i, "").trim() || "units";
          const qtyDisplay = qty % 1 === 0 ? qty.toFixed(0) : qty < 10 ? qty.toFixed(3).replace(/\.?0+$/, "") : qty.toFixed(1);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.6rem 0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 600 }, children: "● Estimated product needed:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.88rem", color: "#1e3a8a", fontWeight: 700 }, children: [
              qtyDisplay,
              " ",
              unit
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#3b82f6", marginLeft: "auto" }, children: [
              rate,
              " ",
              form.rateUnit,
              " × ",
              area,
              " ha"
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Volume (L/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", placeholder: "e.g. 200", value: form.waterVolumeLitres, onChange: (e) => setForm((f) => ({ ...f, waterVolumeLitres: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment Used" }),
            sprayEquipment.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.equipmentId,
                onValueChange: (v) => {
                  if (v === "__other__") {
                    setForm((f) => ({ ...f, equipmentId: "", equipmentUsed: "" }));
                    setVehicleStationFilled(null);
                  } else {
                    const eq = sprayEquipment.find((e) => String(e.id) === v);
                    const label = eq ? [eq.name, eq.make, eq.model, eq.registrationNumber].filter(Boolean).join(" · ") : "";
                    setForm((f) => ({ ...f, equipmentId: v, equipmentUsed: label }));
                    checkVehicleWeather(v, form.applicationDate);
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select equipment..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    sprayEquipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
                      e.name,
                      e.make ? ` — ${e.make}` : "",
                      e.registrationNumber ? ` (${e.registrationNumber})` : ""
                    ] }, e.id)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not listed" })
                  ] })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Trailed sprayer, 24m boom", value: form.equipmentUsed, onChange: (e) => setForm((f) => ({ ...f, equipmentUsed: e.target.value, equipmentId: "" })) }),
            form.equipmentId === "" && sprayEquipment.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", style: { fontSize: "0.8rem" }, placeholder: "Describe equipment...", value: form.equipmentUsed, onChange: (e) => setForm((f) => ({ ...f, equipmentUsed: e.target.value })) })
          ] })
        ] }),
        vehicleStationFilled ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#166534", display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 13, style: { flexShrink: 0 } }),
          "Conditions loaded from vehicle-mounted weather station",
          vehicleStationFilled.vehicleName ? ` (${vehicleStationFilled.vehicleName})` : "",
          vehicleStationFilled.readingTimestamp ? ` · ${new Date(vehicleStationFilled.readingTimestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : "",
          ". You can adjust below if needed."
        ] }) : weatherAutoFilled ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "☁" }),
          " Weather conditions auto-filled from your nearest stored reading. You can adjust below."
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", fontWeight: 600, color: "#374151", letterSpacing: "0.01em" }, children: "Weather Conditions at Application" }),
          !vehicleStationFilled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            weatherFetchMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: weatherFetchMsg.startsWith("Could") ? "#991b1b" : "#166534" }, children: weatherFetchMsg }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: fetchLiveWeather,
                disabled: weatherFetching,
                style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 5, padding: "3px 8px", cursor: weatherFetching ? "default" : "pointer", opacity: weatherFetching ? 0.7 : 1 },
                children: weatherFetching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, className: "animate-spin" }),
                  " Fetching…"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 11 }),
                  " Get live conditions"
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Speed (km/h)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: form.windSpeedKmh, onChange: (e) => setForm((f) => ({ ...f, windSpeedKmh: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.windDirection, onValueChange: (v) => setForm((f) => ({ ...f, windDirection: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: WIND_DIRS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: form.temperatureC, onChange: (e) => setForm((f) => ({ ...f, temperatureC: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Operator Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            membersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { disabled: true, placeholder: "Loading staff…" }) : activeMembers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.operatorMemberId, onValueChange: handleOperatorChange, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: activeMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), children: [
                  memberFullName(m),
                  m.jobTitle ? ` — ${m.jobTitle}` : ""
                ] }, m.id)) })
              ] }),
              !form.operatorMemberId && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", style: { fontSize: "0.8rem" }, placeholder: "Or type a name if not in staff list…", value: form.operatorName, onChange: (e) => setForm((f) => ({ ...f, operatorName: e.target.value })) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Type staff member name…", value: form.operatorName, onChange: (e) => setForm((f) => ({ ...f, operatorName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate No. (PA1/PA6)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. PA1-123456", value: form.certificateNumber, onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })) }),
            form.operatorMemberId && form.certificateNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }, children: "✓ Auto-filled from staff certificate record" }),
            form.operatorMemberId && !form.certificateNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#f59e0b", marginTop: 3 }, children: "No in-date PA certificate on file for this operator" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            (() => {
              const agchemSuppliers = allSuppliers.filter((s) => s.supplierType === "agrochemicals");
              const currentSupplier = form.supplierId ? allSuppliers.find((s) => String(s.id) === form.supplierId) : null;
              const needsCurrentAdded = currentSupplier && currentSupplier.supplierType !== "agrochemicals";
              const listItems = needsCurrentAdded ? [...agchemSuppliers, currentSupplier] : agchemSuppliers;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId, onValueChange: (v) => setForm((f) => ({ ...f, supplierId: v === "__none__" ? "" : v })), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                    listItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "No agrochemical suppliers — add in Suppliers register" }) : listItems.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), children: s.name }, s.id))
                  ] })
                ] }),
                form.supplierId && form.stockDeliveryId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }, children: "✓ Auto-filled from delivery record" }),
                agchemSuppliers.length === 0 && !form.supplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginTop: 3 }, children: "Add agrochemical suppliers in the Suppliers register to enable this field." })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Reason for Application ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            (() => {
              const isCustom = !!form.reasonForApplication && sprayReasons.length > 0 && !sprayReasons.includes(form.reasonForApplication);
              const selectVal = isCustom ? "__other__" : form.reasonForApplication || "";
              return sprayReasons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Control of blackgrass, crop threshold exceeded", value: form.reasonForApplication, onChange: (e) => setForm((f) => ({ ...f, reasonForApplication: e.target.value })) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectVal, onValueChange: (v) => {
                  if (v === "__other__") {
                    setForm((f) => ({ ...f, reasonForApplication: "__other__" }));
                    return;
                  }
                  setForm((f) => ({ ...f, reasonForApplication: v }));
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason for application..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    sprayReasons.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (specify below)" })
                  ] })
                ] }),
                (isCustom || selectVal === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", style: { fontSize: "0.8rem" }, placeholder: "Describe the reason for application...", value: form.reasonForApplication === "__other__" ? "" : form.reasonForApplication, onChange: (e) => setForm((f) => ({ ...f, reasonForApplication: e.target.value })) })
              ] });
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source Nearby" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.waterSourceNearby ?? "", onValueChange: (v) => {
              const source = v === "__none__" ? "" : v;
              const suggested = { ditch: 5, stream: 5, pond: 5, borehole: 50 };
              const min = source ? suggested[source] : void 0;
              setForm((f) => ({
                ...f,
                waterSourceNearby: source,
                bufferZoneMetres: !f.bufferZoneMetres && min != null ? String(min) : f.bufferZoneMetres
              }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None / Not applicable" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / Not applicable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ditch", children: "Ditch / Drain" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stream", children: "Stream / River" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pond", children: "Pond / Lake" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borehole", children: "Borehole / Well" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buffer Zone Distance (m)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", placeholder: "e.g. 5, 10, 20", value: form.bufferZoneMetres ?? "", onChange: (e) => setForm((f) => ({ ...f, bufferZoneMetres: e.target.value })) }),
            form.bufferZoneMetres && form.waterSourceNearby && form.waterSourceNearby !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }, children: [
              "✓ ",
              form.bufferZoneMetres,
              "m recorded —",
              " ",
              form.waterSourceNearby === "borehole" ? "SPZ minimum 50m" : "CoP minimum 5m · check product label / LERAP rating"
            ] }),
            form.bufferZoneMetres && (!form.waterSourceNearby || form.waterSourceNearby === "__none__") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#16a34a", marginTop: 3 }, children: [
              "✓ Buffer zone of ",
              form.bufferZoneMetres,
              "m recorded"
            ] }),
            form.waterSourceNearby && form.waterSourceNearby !== "__none__" && !form.bufferZoneMetres && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#f59e0b", marginTop: 3 }, children: "⚠ Water source selected — enter the buffer zone maintained" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Conditions, observations, non-standard buffer justification...", value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Product Cost ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs font-normal", children: "(£/unit) — optional, for gross margin" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "e.g. 12.50",
                className: "pl-7",
                value: form.productCostPencePerUnit !== "" && form.productCostPencePerUnit != null ? (Number(form.productCostPencePerUnit) / 100).toFixed(2) : "",
                onChange: (e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, productCostPencePerUnit: v === "" ? "" : Math.round(parseFloat(v) * 100) }));
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Cost per litre/kg of this product. Used to calculate spray input costs in the Season Production Report." })
        ] })
      ] }),
      editRecord && farmId && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "spray_application", recordId: editRecord.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editRecord ? updateMut : createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeForm, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form),
            disabled: !form.fieldId || !form.applicationDate || !form.productId || !form.operatorName || !form.reasonForApplication || form.reasonForApplication === "__other__" || createMut.isPending || updateMut.isPending,
            children: editRecord ? updateMut.isPending ? "Saving…" : "Save Changes" : createMut.isPending ? "Saving…" : "Save Record"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Spray Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will permanently delete this spray application record. Note: any stock that was automatically deducted will not be reversed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function ProductsTab({ products, farmId, loading, onRefresh, toast }) {
  const productCategories = useLookupStrings("spray_product_categories", PRODUCT_CATEGORIES_FALLBACK);
  const coshhQ = useQuery({ queryKey: ["risk-coshh", farmId], queryFn: () => fetch(`/api/farms/${farmId}/risk-coshh`).then((r) => r.json()), enabled: !!farmId });
  const coshhRecords = coshhQ.data?.records ?? [];
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const emptyForm = { productName: "", activeIngredient: "", mappaNumber: "", manufacturer: "", category: "", harvestInterval: "", maxApplicationsPerSeason: "", storageRequirements: "", coshhRecordId: "__none__", lerapCategory: "__none__", lerapStandardBufferM: "", herbicideMoaGroup: "", expiryDate: "", beePrecaution: false };
  const [form, setForm] = reactExports.useState(emptyForm);
  function openAdd() {
    setEditRecord(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(p) {
    setEditRecord(p);
    setForm({
      productName: p.productName ?? "",
      activeIngredient: p.activeIngredient ?? "",
      mappaNumber: p.mappaNumber ?? "",
      manufacturer: p.manufacturer ?? "",
      category: p.category ?? "",
      harvestInterval: p.harvestInterval ?? "",
      maxApplicationsPerSeason: p.maxApplicationsPerSeason ?? "",
      storageRequirements: p.storageRequirements ?? "",
      coshhRecordId: p.coshhRecordId ? String(p.coshhRecordId) : "__none__",
      lerapCategory: p.lerapCategory ?? "__none__",
      lerapStandardBufferM: p.lerapStandardBufferM != null ? String(p.lerapStandardBufferM) : "",
      herbicideMoaGroup: p.herbicideMoaGroup ?? "",
      expiryDate: p.expiryDate ? String(p.expiryDate).slice(0, 10) : "",
      beePrecaution: p.beePrecaution ?? false
    });
    setDialogOpen(true);
  }
  const [mappaError, setMappaError] = reactExports.useState(null);
  function closeDialog() {
    setDialogOpen(false);
    setEditRecord(null);
    setForm(emptyForm);
    setMappaError(null);
  }
  function formBody() {
    const { coshhRecordId, mappaNumber, lerapCategory, lerapStandardBufferM, ...rest } = form;
    const paddedMappa = mappaNumber && /^\d{1,5}$/.test(mappaNumber) ? mappaNumber.padStart(5, "0") : mappaNumber;
    const lerap = lerapCategory && lerapCategory !== "__none__" ? lerapCategory : null;
    return {
      ...rest,
      mappaNumber: paddedMappa || null,
      coshhRecordId: coshhRecordId && coshhRecordId !== "__none__" ? Number(coshhRecordId) : null,
      lerapCategory: lerap,
      lerapStandardBufferM: lerap && lerapStandardBufferM ? lerapStandardBufferM : null,
      herbicideMoaGroup: rest.category?.toLowerCase() === "herbicide" && rest.herbicideMoaGroup ? rest.herbicideMoaGroup : null
    };
  }
  function hseMappUrl(mapp) {
    return `https://secure.pesticides.gov.uk/pestreg/prodresults.asp?reg=MAPP${mapp.padStart(5, "0")}`;
  }
  function handleMappaChange(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 5);
    setForm((f) => ({ ...f, mappaNumber: digits }));
    setMappaError(null);
  }
  function handleMappaBlur() {
    const val = form.mappaNumber ?? "";
    if (!val) return;
    if (/^\d{1,5}$/.test(val)) {
      const padded = val.padStart(5, "0");
      setForm((f) => ({ ...f, mappaNumber: padded }));
      setMappaError(null);
    } else {
      setMappaError("Must be up to 5 digits (numbers only)");
    }
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/spray-products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Product added" });
      onRefresh();
      closeDialog();
    },
    onError: () => toast({ title: "Failed to add product", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Product updated" });
      onRefresh();
      closeDialog();
      setViewRecord(null);
    },
    onError: () => toast({ title: "Failed to update product", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-products/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Product deleted" });
      onRefresh();
      setDeleteId(null);
      setViewRecord(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Product"
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 28, color: "#9ca3af" }), title: "No products registered", subtitle: "Add the pesticides, herbicides and fungicides you use. They'll be available to select when logging applications." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Product Name", "Active Ingredient", "MAPP No.", "Category", "LERAP", "🐝", "Manufacturer", "Harvest Interval", "Max Apps/Season", "Expiry Date", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: products.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < products.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }, onClick: () => setViewRecord(p), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 600, color: "#1e40af" }, children: p.productName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151" }, children: p.activeIngredient || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: p.mappaNumber ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem", fontFamily: "monospace" }, children: p.mappaNumber }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: p.category ? /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { cat: p.category }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: p.lerapCategory === "A" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: "#fee2e2", color: "#991b1b", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }, children: [
          "Cat A",
          p.lerapStandardBufferM ? ` · ${p.lerapStandardBufferM}m` : ""
        ] }) : p.lerapCategory === "B" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: "#fef3c7", color: "#92400e", fontSize: "0.7rem", fontWeight: 700, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }, children: [
          "Cat B",
          p.lerapStandardBufferM ? ` · ${p.lerapStandardBufferM}m` : ""
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", textAlign: "center" }, children: p.beePrecaution ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Harmful to bees — 48hr notification required", style: { fontSize: "1rem" }, children: "🐝" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: p.manufacturer || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: p.harvestInterval ? `${p.harvestInterval} days` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: p.maxApplicationsPerSeason || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: p.expiryDate ? (() => {
          const exp = new Date(p.expiryDate);
          const now = /* @__PURE__ */ new Date();
          const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 864e5);
          const isExpired = daysLeft < 0;
          const isSoon = daysLeft >= 0 && daysLeft <= 90;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: isExpired ? "#fee2e2" : isSoon ? "#fef3c7" : "#f0fdf4", color: isExpired ? "#991b1b" : isSoon ? "#92400e" : "#166534", fontSize: "0.72rem", fontWeight: 600, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" }, children: [
            isExpired ? "⚠ Expired" : isSoon ? "⚠ " : "",
            exp.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          ] });
        })() : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem" }, onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(p.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
        ] })
      ] }, p.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: viewRecord !== null && !dialogOpen, onOpenChange: (o) => {
      if (!o) setViewRecord(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 540 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { fontSize: "1.1rem" }, children: viewRecord?.productName }) }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        viewRecord.beePrecaution && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#fef3c7", border: "1px solid #fde68a", marginBottom: "0.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1rem" }, children: "🐝" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }, children: "Harmful to bees — 48-hour notification required before spraying" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: viewRecord.category ? /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { cat: viewRecord.category }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "MAPP Number" }),
            viewRecord.mappaNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem", fontFamily: "monospace" }, children: viewRecord.mappaNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `https://secure.pesticides.gov.uk/pestreg/prodresults.asp?reg=MAPP${viewRecord.mappaNumber}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", color: "#1d4ed8", textDecoration: "none" },
                  title: "Verify on HSE Pesticide Register",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 }),
                    "Verify on HSE"
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "Active Ingredient" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.activeIngredient || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "Manufacturer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.manufacturer || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "Harvest Interval" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.harvestInterval ? `${viewRecord.harvestInterval} days` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5", children: "Max Applications / Season" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: viewRecord.maxApplicationsPerSeason || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) })
          ] })
        ] }),
        viewRecord.lerapCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: viewRecord.lerapCategory === "A" ? "#fef2f2" : "#fffbeb", border: `1px solid ${viewRecord.lerapCategory === "A" ? "#fecaca" : "#fcd34d"}`, borderRadius: 8, padding: "0.75rem 1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: viewRecord.lerapCategory === "A" ? "#991b1b" : "#92400e" }, children: [
              "LERAP — Category ",
              viewRecord.lerapCategory
            ] }),
            viewRecord.lerapStandardBufferM != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", background: viewRecord.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: viewRecord.lerapCategory === "A" ? "#991b1b" : "#92400e", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "1px 7px" }, children: [
              viewRecord.lerapStandardBufferM,
              "m standard buffer"
            ] })
          ] }),
          viewRecord.lerapCategory === "A" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#7f1d1d", margin: 0 }, children: [
            "Category A — buffer zone printed on label is ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "fixed" }),
            ". A LERAP assessment cannot reduce it. Always maintain the full buffer when spraying near water."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#78350f", margin: 0 }, children: [
            "Category B — a LERAP assessment ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "may" }),
            " allow a reduced buffer zone. Record the assessment in the LERAP tab before spraying near surface water."
          ] })
        ] }),
        viewRecord.storageRequirements && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-green-700 uppercase tracking-wide mb-1", children: "Storage Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-900", children: viewRecord.storageRequirements })
        ] }),
        viewRecord.coshhRecord ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 14, style: { color: "#b45309" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide", style: { color: "#b45309" }, children: "Linked COSHH Record" }),
            viewRecord.coshhRecord.hazardClassification && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", fontSize: "0.7rem", marginLeft: "auto" }, children: viewRecord.coshhRecord.hazardClassification })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-900 mb-1", children: viewRecord.coshhRecord.substanceName }),
          viewRecord.coshhRecord.ppe && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#78350f", margin: "0 0 0.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "PPE:" }),
            " ",
            viewRecord.coshhRecord.ppe
          ] }),
          viewRecord.coshhRecord.controlMeasures && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#92400e", margin: "0 0 0.25rem" }, children: viewRecord.coshhRecord.controlMeasures }),
          viewRecord.coshhRecord.emergencyProcedures && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.78rem", color: "#dc2626", fontWeight: 600, margin: 0 }, children: [
            "Emergency: ",
            viewRecord.coshhRecord.emergencyProcedures
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px dashed #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 13, style: { color: "#d1d5db" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#9ca3af", margin: 0 }, children: "No COSHH record linked — use Edit to link one" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(viewRecord?.id), children: "Delete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: (o) => {
      if (!o) {
        closeDialog();
        createMut.reset();
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Spray Product" : "Add Spray Product" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Product Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Roundup ProActive", value: form.productName, onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, category: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None" }),
                productCategories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Glyphosate 360 g/L", value: form.activeIngredient, onChange: (e) => setForm((f) => ({ ...f, activeIngredient: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MAPP Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. 15026",
                value: form.mappaNumber,
                onChange: (e) => handleMappaChange(e.target.value),
                onBlur: handleMappaBlur,
                inputMode: "numeric",
                maxLength: 5,
                style: mappaError ? { borderColor: "#ef4444" } : void 0
              }
            ),
            mappaError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#ef4444", marginTop: 3 }, children: mappaError }),
            !mappaError && form.mappaNumber && /^\d{5}$/.test(form.mappaNumber) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: hseMappUrl(form.mappaNumber),
                target: "_blank",
                rel: "noopener noreferrer",
                style: { display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.72rem", color: "#1d4ed8", marginTop: 3, textDecoration: "none" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11 }),
                  "Verify on HSE Register"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Bayer, Syngenta", value: form.manufacturer, onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Interval (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 7", value: form.harvestInterval, onChange: (e) => setForm((f) => ({ ...f, harvestInterval: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max Applications per Season" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "e.g. 2", value: form.maxApplicationsPerSeason, onChange: (e) => setForm((f) => ({ ...f, maxApplicationsPerSeason: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate, onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: "Leave blank if not applicable. Expired products are flagged with a red badge in the product list." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "e.g. Store in original container, locked chemical store, above 5°C", value: form.storageRequirements, onChange: (e) => setForm((f) => ({ ...f, storageRequirements: e.target.value })), rows: 2 })
        ] }),
        form.category?.toLowerCase() === "herbicide" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herbicide MOA / HRAC Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Group 1 / A — ACCase inhibitor", value: form.herbicideMoaGroup, onChange: (e) => setForm((f) => ({ ...f, herbicideMoaGroup: e.target.value })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: "Used to flag herbicide mode-of-action repetition risk in the Black-grass Five-in-Five tracker." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: "0.6rem", padding: "0.6rem 0.75rem", borderRadius: 8, background: form.beePrecaution ? "#fef3c7" : "#f9fafb", border: `1px solid ${form.beePrecaution ? "#fde68a" : "#e5e7eb"}`, cursor: "pointer" }, onClick: () => setForm((f) => ({ ...f, beePrecaution: !f.beePrecaution })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!form.beePrecaution, onChange: (e) => setForm((f) => ({ ...f, beePrecaution: e.target.checked })), style: { marginTop: 2, accentColor: "#d97706", cursor: "pointer" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontWeight: 600, fontSize: "0.875rem", color: form.beePrecaution ? "#92400e" : "#374151" }, children: "🐝 Harmful to Bees (Bee Precaution)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "2px 0 0", fontSize: "0.72rem", color: "#6b7280" }, children: 'Tick if the product label carries a "harmful to bees" or bee precaution statement. This triggers a 48-hour notification reminder in the Week Ahead Planner whenever a spray with this product is logged.' })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }, children: "LERAP Label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", margin: "0 0 0.4rem" }, children: "Does this product carry a LERAP label? Sets the category shown in the product list and triggers a reminder in the Applications Log when spraying near water." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lerapCategory || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, lerapCategory: v, lerapStandardBufferM: v === "__none__" ? "" : f.lerapStandardBufferM })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No LERAP label" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No LERAP label" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "A", children: "Category A — fixed buffer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "B", children: "Category B — reducible via LERAP" })
              ] })
            ] }),
            form.lerapCategory && form.lerapCategory !== "__none__" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.5",
                min: "0",
                placeholder: "Standard buffer (m)",
                value: form.lerapStandardBufferM,
                onChange: (e) => setForm((f) => ({ ...f, lerapStandardBufferM: e.target.value }))
              }
            ) })
          ] }),
          form.lerapCategory === "A" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#991b1b", marginTop: 4 }, children: "Cat A: the buffer on the label is fixed — a LERAP cannot reduce it." }),
          form.lerapCategory === "B" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#92400e", marginTop: 4 }, children: "Cat B: a LERAP assessment may allow a reduced buffer near surface water." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem", marginTop: "0.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { style: { display: "flex", alignItems: "center", gap: "0.4rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { size: 13, style: { color: "#6b7280" } }),
            "Link COSHH Record"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", margin: "0.2rem 0 0.4rem" }, children: "Linking a COSHH record will show a safety reminder when this product is selected in the Applications Log." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.coshhRecordId, onValueChange: (v) => setForm((f) => ({ ...f, coshhRecordId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "No COSHH record linked" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No COSHH record linked" }),
              coshhRecords.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                c.substanceName,
                c.hazardClassification ? ` — ${c.hazardClassification}` : ""
              ] }, c.id)),
              coshhRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__empty__", disabled: true, children: "No COSHH records — add one in Risk & Safety first" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editRecord ? updateMut : createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeDialog, children: "Cancel" }),
        editRecord ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => updateMut.mutate({ id: editRecord.id, body: formBody() }), disabled: !form.productName || updateMut.isPending, children: "Save Changes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(formBody()), disabled: !form.productName || createMut.isPending, children: "Add Product" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Product" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure? Existing spray application records linked to this product will retain the product name but lose the product details." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function PrintTab({ applications, farm, cropYear, setCropYear }) {
  const [reportType, setReportType] = reactExports.useState("summary");
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const previewRef = reactExports.useRef(null);
  const printApplications = applications.filter((r) => isInCropYear(r.applicationDate, cropYear));
  const yearLabel = cropYearLabel(cropYear);
  const handlePrint = () => {
    if (!previewRef.current) return;
    const content = previewRef.current.innerHTML;
    const farmName2 = farm?.name || "Spray Records";
    const isDetail = reportType === "detail";
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Spray Records — ${farmName2} — ${yearLabel}</title>
      <style>
        @page { size: A4 ${isDetail ? "portrait" : "landscape"}; margin: ${isDetail ? "1.2cm 1.5cm" : "1cm 1.2cm"}; }
        *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; }
        div[style*="overflow"] { overflow: visible !important; }
        tr { page-break-inside: avoid; }
        div[style*="box-shadow"] { box-shadow: none !important; border-radius: 0 !important; }
        .record-card { page-break-inside: avoid; }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 600);
  };
  const farmName = farm?.name;
  const meta = [
    farm?.cphNumber ? `CPH: ${farm.cphNumber}` : null,
    farm?.redTractorId ? `RT ID: ${farm.redTractorId}` : null
  ].filter(Boolean).join(" · ");
  const COLS = ["Date", "Field", "Product", "Crop / Stage", "Rate", "Area", "Water Vol.", "Wind / Temp", "Operator", "PA Cert No.", "Reason / Notes"];
  const toggleBtnStyle = (active) => ({
    padding: "5px 14px",
    borderRadius: 6,
    border: "1px solid",
    borderColor: active ? "#1a3a1a" : "#d1d5db",
    background: active ? "#1a3a1a" : "#fff",
    color: active ? "#fff" : "#374151",
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s"
  });
  const docHeader = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1a3a1a", paddingBottom: 10, marginBottom: 14 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { style: { fontSize: "0.95rem", fontWeight: 700, color: "#1a3a1a", margin: "0 0 4px" }, children: [
        "Spray Application Records — ",
        yearLabel,
        reportType === "detail" ? " (Full Detail)" : ""
      ] }),
      farmName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#374151", margin: "4px 0", lineHeight: 1.5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: farmName }),
        meta ? `  ·  ${meta}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#444", margin: "4px 0", lineHeight: 1.5 }, children: "Red Tractor Crop Inputs Compliance Register" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", lineHeight: 1.8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "inline-block", background: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.05em", marginBottom: 4 }, children: "RED TRACTOR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", color: "#374151", margin: "4px 0" }, children: [
        "Printed: ",
        today
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.65rem", color: "#374151", margin: "4px 0" }, children: [
        printApplications.length,
        " record",
        printApplications.length !== 1 ? "s" : ""
      ] })
    ] })
  ] });
  const docFooter = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12, paddingTop: 8, borderTop: "1px solid #d1d5db", display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#555" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Retain records for a minimum of 3 years and make available at Red Tractor audit inspection." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      "BDE Farm Trac · ",
      today
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", gap: 12, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151" }, children: "Format:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: toggleBtnStyle(reportType === "summary"), onClick: () => setReportType("summary"), children: "Summary Table" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { style: toggleBtnStyle(reportType === "detail"), onClick: () => setReportType("detail"), children: "Full Detail Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }, children: reportType === "summary" ? "Landscape A4 · one row per application" : "Portrait A4 · full card per application" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: handlePrint, disabled: printApplications.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1.5" }),
          "Print / Export PDF"
        ] })
      ] })
    ] }),
    printApplications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", background: "#f9fafb", borderRadius: 10, border: "1px dashed #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#6b7280", margin: "0 0 4px" }, children: [
        "No records for ",
        yearLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", margin: 0 }, children: "Select a different crop year above, or log applications in the Applications Log tab." })
    ] }) : reportType === "summary" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#e5e7eb", padding: "1.5rem", borderRadius: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: previewRef, style: { background: "#fff", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "1.5rem 1.75rem", fontFamily: "Arial, Helvetica, sans-serif" }, children: [
      docHeader,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#1a3a1a" }, children: COLS.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 7px", color: "#fff", fontWeight: 700, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderRight: "1px solid #2d5a2d", whiteSpace: "nowrap" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: printApplications.map((r, i) => {
          const conditions = [
            r.windSpeedKmh ? `${r.windSpeedKmh} km/h ${r.windDirection || ""}`.trim() : null,
            r.temperatureC != null ? `${r.temperatureC}°C` : null
          ].filter(Boolean).join(" / ") || "—";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: i % 2 === 0 ? "#fff" : "#f8fafc" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }, children: fmt(r.applicationDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }, children: r.fieldName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#111827" }, children: r.productName || "—" }),
              r.productCategory && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "block", fontSize: "0.6rem", color: "#555" }, children: r.productCategory }),
              r.lerapCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-block", marginTop: 2, fontSize: "0.55rem", fontWeight: 700, padding: "1px 5px", borderRadius: 2, background: r.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: r.lerapCategory === "A" ? "#991b1b" : "#92400e", letterSpacing: "0.04em" }, children: [
                "LERAP ",
                r.lerapCategory
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }, children: [
              r.targetCrop && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "block", fontSize: "0.68rem" }, children: r.targetCrop }),
              r.growthStage && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "block", fontSize: "0.6rem", color: "#555" }, children: r.growthStage }),
              !r.targetCrop && !r.growthStage && "—"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }, children: r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }, children: r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }, children: r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap", color: "#374151" }, children: conditions }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151" }, children: r.operatorName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f0f0f0", color: "#374151", fontFamily: "monospace", fontSize: "0.65rem" }, children: r.certificateNumber || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 7px", borderBottom: "1px solid #e5e7eb", color: "#374151" }, children: r.reasonForApplication || "—" })
          ] }, r.id);
        }) })
      ] }) }),
      docFooter
    ] }) }) : (
      /* ── Full Detail Report ─────────────────────────────────── */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#e5e7eb", padding: "1.5rem", borderRadius: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: previewRef, style: { background: "#fff", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "1.5rem 1.75rem", fontFamily: "Arial, Helvetica, sans-serif" }, children: [
        docHeader,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: printApplications.map((r, i) => {
          const equipment = r.equipmentName ? `${r.equipmentName}${r.equipmentUsed && r.equipmentUsed !== r.equipmentName ? ` — ${r.equipmentUsed}` : ""}` : r.equipmentUsed || null;
          const traceability = [
            r.supplierName ? `Supplier: ${r.supplierName}` : null,
            r.batchNumber ? `Batch: ${r.batchNumber}` : null,
            r.lotNumber ? `Lot: ${r.lotNumber}` : null
          ].filter(Boolean);
          const cellLabel = { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", display: "block", marginBottom: 3 };
          const cellValue = { fontSize: "0.72rem", color: "#111827", fontWeight: 500 };
          const sectionHead = { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#fff", background: "#374151", padding: "3px 8px" };
          const sectionBody = { padding: "8px 10px" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "record-card", style: {
            border: "1px solid #d1d5db",
            borderRadius: 4,
            marginBottom: i < printApplications.length - 1 ? 16 : 0,
            overflow: "hidden",
            fontSize: "0.72rem"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#1a3a1a", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 24, alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }, children: "Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", fontWeight: 700, color: "#fff" }, children: fmt(r.applicationDate) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }, children: "Field" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", fontWeight: 700, color: "#fff" }, children: r.fieldName || "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#86efac", display: "block" }, children: "Product" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#fff" }, children: [
                    r.productName || "—",
                    r.productCategory ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.65rem", color: "#a3e635", marginLeft: 6 }, children: [
                      "(",
                      r.productCategory,
                      ")"
                    ] }) : null
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.6rem", color: "#86efac" }, children: [
                "Record #",
                i + 1,
                " of ",
                printApplications.length
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, borderRight: "1px solid #e5e7eb" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Application Details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Target Crop" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.targetCrop || "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Growth Stage (BBCH)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.growthStage || "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Rate" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.applicationRate ? `${r.applicationRate} ${r.rateUnit || ""}`.trim() : "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Area Sprayed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.areaSprayedHa ? `${r.areaSprayedHa} ha` : "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Water Volume" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.waterVolumeLitres ? `${r.waterVolumeLitres} L/ha` : "—" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Weather Conditions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Wind Speed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.windSpeedKmh ? `${r.windSpeedKmh} km/h` : "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Wind Direction" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.windDirection || "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Temperature" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.temperatureC != null ? `${r.temperatureC}°C` : "—" })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, borderRight: "1px solid #e5e7eb" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Operator" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...sectionBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.operatorName || "—" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "PA1/PA6 Certificate No." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { ...cellValue, fontFamily: "monospace", fontSize: "0.68rem" }, children: r.certificateNumber || "—" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Equipment Used" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionBody, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: equipment || "—" }) })
              ] })
            ] }),
            r.lerapCategory && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { ...sectionHead, background: r.lerapCategory === "A" ? "#991b1b" : "#92400e" }, children: "LERAP Classification" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...sectionBody, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Category" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { ...cellValue, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-block", padding: "1px 8px", borderRadius: 3, fontSize: "0.7rem", fontWeight: 700, background: r.lerapCategory === "A" ? "#fee2e2" : "#fef3c7", color: r.lerapCategory === "A" ? "#991b1b" : "#92400e" }, children: [
                      "Cat ",
                      r.lerapCategory
                    ] }),
                    r.lerapCategory === "A" ? "No-spray buffer required" : "Buffer may be reduced by LERAP assessment"
                  ] })
                ] }),
                r.lerapStandardBufferM != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Standard Buffer (label)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: cellValue, children: [
                    r.lerapStandardBufferM,
                    " m"
                  ] })
                ] }),
                r.bufferZoneMetres != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Recorded Buffer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: cellValue, children: [
                    r.bufferZoneMetres,
                    " m"
                  ] })
                ] }),
                r.waterSourceNearby != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Water Source Nearby" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.waterSourceNearby ? "Yes" : "No" })
                ] })
              ] })
            ] }),
            (traceability.length > 0 || r.supplierName || r.batchNumber || r.lotNumber) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Product Traceability" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { ...sectionBody, display: "flex", gap: 24, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Supplier" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.supplierName || "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Batch Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { ...cellValue, fontFamily: "monospace" }, children: r.batchNumber || "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellLabel, children: "Lot Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { ...cellValue, fontFamily: "monospace" }, children: r.lotNumber || "—" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: r.notes ? 1 : void 0, width: r.notes ? void 0 : "100%", borderRight: r.notes ? "1px solid #e5e7eb" : void 0 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Reason for Application" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionBody, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: cellValue, children: r.reasonForApplication || "—" }) })
              ] }),
              r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionHead, children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: sectionBody, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { ...cellValue, color: "#374151" }, children: r.notes }) })
              ] })
            ] })
          ] }, r.id);
        }) }),
        docFooter
      ] }) })
    )
  ] });
}
function SprayDayViewTab({ applications, loading }) {
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = reactExports.useState(todayStr);
  const dayApps = applications.filter((a) => {
    if (!a.applicationDate) return false;
    return new Date(a.applicationDate).toISOString().slice(0, 10) === selectedDate;
  });
  const totalArea = dayApps.reduce((s, a) => s + (parseFloat(a.areaSprayedHa) || 0), 0);
  const uniqueFields = new Set(dayApps.map((a) => a.fieldId)).size;
  const uniqueProducts = new Set(dayApps.map((a) => a.productId).filter(Boolean)).size;
  const operators = [...new Set(dayApps.map((a) => a.operatorName).filter(Boolean))];
  const displayDate = (/* @__PURE__ */ new Date(selectedDate + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isToday = selectedDate === todayStr;
  function windCondition(speed) {
    if (speed === null || speed === void 0) return null;
    if (speed <= 10) return { label: "Good", bg: "#dcfce7", color: "#166534" };
    if (speed <= 19) return { label: "Marginal", bg: "#fef3c7", color: "#92400e" };
    return { label: "Poor", bg: "#fee2e2", color: "#991b1b" };
  }
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
          style: { background: isToday ? "#e0f2fe" : "#f3f4f6", color: isToday ? "#0369a1" : "#374151", border: "none", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" },
          children: "Today"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { paddingTop: 18, marginLeft: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280" }, children: displayDate }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : dayApps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 28, color: "#9ca3af" }),
        title: `No spray activity on ${displayDate}`,
        subtitle: "Select a different date or log a spray application."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "Applications", value: dayApps.length.toString(), color: "#0369a1", bg: "#f0f9ff" },
        { label: "Fields Treated", value: uniqueFields.toString(), color: "#166534", bg: "#f0fdf4" },
        { label: "Total Area", value: `${totalArea.toFixed(1)} ha`, color: "#7c3aed", bg: "#f5f3ff" },
        { label: "Products Used", value: uniqueProducts.toString(), color: "#92400e", bg: "#fffbeb" }
      ].map(({ label, value, color, bg }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.5rem", fontWeight: 700, color }, children: value })
      ] }, label)) }),
      operators.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1rem", fontSize: "0.8rem", color: "#6b7280" }, children: [
        "Operators: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#374151" }, children: operators.join(", ") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }, children: dayApps.map((a) => {
        const wc = windCondition(parseFloat(a.windSpeedKmh));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, color: "#111827", fontSize: "0.95rem" }, children: a.fieldName || "Unknown Field" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 1 }, children: a.productName || "Unknown Product" }),
              a.productCategory && /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { cat: a.productCategory })
            ] }),
            wc && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", fontWeight: 700, color: wc.color, background: wc.bg, borderRadius: 6, padding: "2px 7px", flexShrink: 0 }, children: [
              "Wind: ",
              wc.label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
            ["Rate", a.applicationRate ? `${a.applicationRate} ${a.rateUnit || ""}`.trim() : "—"],
            ["Area", a.areaSprayedHa ? `${a.areaSprayedHa} ha` : "—"],
            ["Wind", a.windSpeedKmh ? `${a.windSpeedKmh} km/h ${a.windDirection || ""}`.trim() : "—"],
            ["Temp", a.temperatureC != null ? `${a.temperatureC}°C` : "—"],
            ["Operator", a.operatorName || "—"],
            ["Cert No.", a.certificateNumber || "—"]
          ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af", display: "block", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }, children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", color: "#374151", fontWeight: 500 }, children: v })
          ] }, k)) }),
          a.reasonForApplication && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginTop: 10, fontSize: "0.78rem", color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 8 }, children: [
            "Reason: ",
            a.reasonForApplication
          ] })
        ] }, a.id);
      }) })
    ] })
  ] });
}
function CategoryBadge({ cat }) {
  const colors = {
    "Herbicide": { bg: "#fef3c7", color: "#92400e" },
    "Fungicide": { bg: "#dcfce7", color: "#166534" },
    "Insecticide": { bg: "#fee2e2", color: "#991b1b" },
    "Growth Regulator": { bg: "#ede9fe", color: "#5b21b6" },
    "Foliar Feed": { bg: "#dbeafe", color: "#1e40af" }
  };
  const c = colors[cat] || { bg: "#f3f4f6", color: "#374151" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { style: { background: c.bg, color: c.color, border: "none", fontSize: "0.72rem" }, children: cat });
}
function EmptyState({ icon, title, subtitle }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400 }, children: subtitle })
  ] });
}
const IPM_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "archived", label: "Archived" }
];
const THRESHOLD_PESTS = [
  "Aphids (cereal)",
  "Black-grass",
  "Brome grass",
  "Cabbage stem flea beetle",
  "Canopy disease (septoria)",
  "Eyespot",
  "Fusarium",
  "Light leaf spot",
  "Orange blossom midge",
  "Pollen beetle",
  "Ramularia",
  "Rhynchosporium",
  "Slugs",
  "Stem canker (sclerotinia)",
  "Take-all",
  "Tan spot",
  "Yellow rust"
];
const MONITORING_METHODS = [
  { value: "field_walk", label: "Field Walk" },
  { value: "suction_trap", label: "Suction Trap" },
  { value: "pheromone_trap", label: "Pheromone Trap" },
  { value: "sticky_yellow_trap", label: "Sticky Yellow Trap" },
  { value: "weather_model", label: "Weather Model" },
  { value: "lab_test", label: "Lab Test" },
  { value: "other", label: "Other" }
];
const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
function ipmStatusBadge(status) {
  const cls = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    under_review: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-500"
  };
  const label = IPM_STATUSES.find((s) => s.value === status)?.label ?? status;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${cls[status] ?? "bg-gray-100 text-gray-600"}`, children: label });
}
function IpmPlanTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: ipmMembersData } = useFarmMembers(farmId);
  const ipmActiveMembers = (ipmMembersData?.members ?? []).filter((m) => m.isActive);
  const [planOpen, setPlanOpen] = reactExports.useState(false);
  const [threshOpen, setThreshOpen] = reactExports.useState(false);
  const [logOpen, setLogOpen] = reactExports.useState(false);
  const [editingPlan, setEditingPlan] = reactExports.useState(null);
  const [editingThresh, setEditingThresh] = reactExports.useState(null);
  const [editingLog, setEditingLog] = reactExports.useState(null);
  const [selectedPlan, setSelectedPlan] = reactExports.useState(null);
  const [planForm, setPlanForm] = reactExports.useState({});
  const [threshForm, setThreshForm] = reactExports.useState({});
  const [logForm, setLogForm] = reactExports.useState({});
  const [detailTab, setDetailTab] = reactExports.useState("thresholds");
  const [expandedLogId, setExpandedLogId] = reactExports.useState(null);
  const setP = (k, v) => setPlanForm((f) => ({ ...f, [k]: v }));
  const setT = (k, v) => setThreshForm((f) => ({ ...f, [k]: v }));
  const setL = (k, v) => setLogForm((f) => ({ ...f, [k]: v }));
  const thisYear = currentCropYear();
  const planYearOptions = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2];
  const { data: plansRaw = [], isLoading } = useQuery({
    queryKey: ["ipm-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans`).then((r) => r.json()).then((d) => d.plans ?? d.records ?? []),
    enabled: !!farmId
  });
  const plans = plansRaw;
  const { data: thresholds = [] } = useQuery({
    queryKey: ["ipm-thresholds", farmId, selectedPlan?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && !!selectedPlan
  });
  const { data: monitoringLogs = [] } = useQuery({
    queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId && !!selectedPlan
  });
  const { data: agronomists = [] } = useQuery({
    queryKey: ["suppliers-agronomist", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then((r) => r.json()).then((d) => (d.records ?? []).filter((s) => s.supplierType === "agronomist" && s.isActive !== false)),
    enabled: !!farmId
  });
  const { data: farmFields = [] } = useQuery({
    queryKey: ["fields-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()).then((d) => d.fields ?? d.records ?? []),
    enabled: !!farmId
  });
  const { data: farmCrops = [] } = useQuery({
    queryKey: ["crops-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crops`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const uniqueCropNames = Array.from(new Set(farmCrops.map((c) => c.name).filter(Boolean))).sort();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const fmtDate = (d) => d ? (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("en-GB") : "—";
  const now = /* @__PURE__ */ new Date();
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
  const alertPlans = plans.filter((p) => {
    if (p.status === "archived") return false;
    const expired = p.validTo && new Date(p.validTo) < now;
    const reviewDue = p.reviewDate && new Date(p.reviewDate) <= soon;
    return expired || reviewDue;
  });
  async function savePlan() {
    const url = editingPlan ? `/api/farms/${farmId}/ipm-plans/${editingPlan.id}` : `/api/farms/${farmId}/ipm-plans`;
    const res = await fetch(url, { method: editingPlan ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(planForm) });
    if (!res.ok) {
      toast({ title: "Error saving plan", variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["ipm-plans", farmId] });
    setPlanOpen(false);
    toast({ title: editingPlan ? "Plan updated" : "IPM Plan created" });
  }
  async function deletePlan(id) {
    if (!confirm("Delete this IPM Plan? All threshold entries and monitoring logs will also be deleted.")) return;
    await fetch(`/api/farms/${farmId}/ipm-plans/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["ipm-plans", farmId] });
    if (selectedPlan?.id === id) setSelectedPlan(null);
    toast({ title: "IPM Plan deleted" });
  }
  async function saveThreshold() {
    const url = editingThresh ? `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds/${editingThresh.id}` : `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds`;
    const res = await fetch(url, { method: editingThresh ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(threshForm) });
    if (!res.ok) {
      toast({ title: "Error saving threshold", variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["ipm-thresholds", farmId, selectedPlan?.id] });
    setThreshOpen(false);
    toast({ title: editingThresh ? "Threshold updated" : "Threshold added" });
  }
  async function deleteThreshold(id) {
    await fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/thresholds/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["ipm-thresholds", farmId, selectedPlan?.id] });
    toast({ title: "Threshold removed" });
  }
  async function saveLog() {
    const url = editingLog ? `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs/${editingLog.id}` : `/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs`;
    const res = await fetch(url, { method: editingLog ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(logForm) });
    if (!res.ok) {
      toast({ title: "Error saving log entry", variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id] });
    qc.invalidateQueries({ queryKey: ["notifications", farmId] });
    setLogOpen(false);
    toast({ title: editingLog ? "Log entry updated" : "Monitoring entry recorded" });
  }
  async function deleteLog(id) {
    await fetch(`/api/farms/${farmId}/ipm-plans/${selectedPlan.id}/monitoring-logs/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["ipm-monitoring-logs", farmId, selectedPlan?.id] });
  }
  function openNewPlan() {
    setEditingPlan(null);
    setPlanForm({ planYear: thisYear, status: "active", pestMonitoringFrequency: "weekly" });
    setPlanOpen(true);
  }
  function printIpmPlan() {
    if (!selectedPlan) return;
    const fmtD = (d) => d ? (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("en-GB") : "—";
    const threshRows = thresholds.map((t) => `<tr>
      <td>${t.pestOrDisease}</td>
      <td>${t.monitoringMethod ?? "—"}${t.monitoringFrequency ? ` / ${t.monitoringFrequency}` : ""}</td>
      <td>${t.actionThreshold ?? "—"}</td>
      <td>${t.chemicalThreshold ?? "—"}</td>
      <td>${t.nonChemicalOption ?? "—"}</td>
      <td>${t.resistanceManagementGroup ?? "—"}</td>
    </tr>`).join("");
    const logRows = monitoringLogs.map((l) => `<tr>
      <td>${fmtD(l.logDate)}</td>
      <td>${l.fieldName ?? l.fieldId ?? "—"}</td>
      <td>${l.pestOrDisease ?? "—"}</td>
      <td>${l.populationCount ?? l.infestation ?? "—"}</td>
      <td>${l.thresholdExceeded ? "Yes" : "No"}</td>
      <td>${l.actionTaken ?? "—"}</td>
      <td>${l.loggedBy ?? "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>IPM Plan — ${cropYearLabel(selectedPlan.planYear)}${selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}h3{font-size:11px;margin:14px 0 5px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}.meta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;font-size:10px}.meta span{color:#555}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<h1>IPM Plan — ${cropYearLabel(selectedPlan.planYear)}${selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""}</h1>
<h2>Integrated Pest Management — Red Tractor Combinable Crops</h2>
<div class="meta">
  ${selectedPlan.agronomistName ? `<span>Agronomist: <strong>${selectedPlan.agronomistName}</strong></span>` : ""}
  ${selectedPlan.basisNumber ? `<span>BASIS No.: <strong>${selectedPlan.basisNumber}</strong></span>` : ""}
  ${selectedPlan.validFrom ? `<span>Valid: <strong>${fmtD(selectedPlan.validFrom)} – ${fmtD(selectedPlan.validTo)}</strong></span>` : ""}
  ${selectedPlan.reviewDate ? `<span>Review Due: <strong>${fmtD(selectedPlan.reviewDate)}</strong></span>` : ""}
  <span>Status: <strong>${selectedPlan.status ?? "active"}</strong></span>
  <span>Printed: <strong>${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</strong></span>
</div>
${selectedPlan.cropManagementNotes ? `<p style="font-size:10px;margin-bottom:10px"><strong>Crop Management Notes:</strong> ${selectedPlan.cropManagementNotes}</p>` : ""}
<h3>Pest / Weed / Disease Thresholds &amp; Actions (${thresholds.length} ${thresholds.length === 1 ? "entry" : "entries"})</h3>
${thresholds.length === 0 ? "<p style='font-style:italic;color:#888'>No threshold entries recorded.</p>" : `<table><thead><tr><th>Pest / Weed / Disease</th><th>Method / Frequency</th><th>Action Threshold</th><th>Chemical Threshold</th><th>Non-Chemical Control</th><th>Resistance Group</th></tr></thead><tbody>${threshRows}</tbody></table>`}
<h3>Monitoring Log (${monitoringLogs.length} ${monitoringLogs.length === 1 ? "entry" : "entries"})</h3>
${monitoringLogs.length === 0 ? "<p style='font-style:italic;color:#888'>No monitoring log entries recorded.</p>" : `<table><thead><tr><th>Date</th><th>Field</th><th>Pest / Disease</th><th>Count / Level</th><th>Threshold Exceeded</th><th>Action Taken</th><th>Logged By</th></tr></thead><tbody>${logRows}</tbody></table>`}
<p class="footer">Red Tractor Combinable Crops: A written IPM plan per crop per year is required, covering monitoring protocols, economic thresholds, and preference for non-chemical controls. Records must be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const thresholdPestNames = thresholds.map((t) => t.pestOrDisease).filter(Boolean);
  const detailTabBtn = (tab, label, count) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: () => setDetailTab(tab),
      className: `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${detailTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`,
      children: [
        label,
        " ",
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs ${detailTab === tab ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`, children: count })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    alertPlans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Action required:" }),
        " ",
        alertPlans.map((p, i) => {
          const expired = p.validTo && new Date(p.validTo) < now;
          const label = `${cropYearLabel(p.planYear)}${p.cropName ? ` ${p.cropName}` : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            i > 0 ? ", " : "",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: label }),
            " — ",
            expired ? "plan has expired" : "review due"
          ] }, p.id);
        }),
        ". Visit the Week Ahead Planner once review date / validity reminders are wired in."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Integrated Pest Management (IPM) Plans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor requires a written IPM plan per crop per year, covering monitoring, economic thresholds, and non-chemical controls. Select a plan to log monitoring observations." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openNewPlan, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "New IPM Plan"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-1 border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 px-3 py-2 border-b text-xs font-medium text-gray-500 uppercase tracking-wide", children: "Plans" }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-sm text-gray-400", children: "Loading…" }) : plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-gray-400", children: "No IPM plans yet. Create your first plan above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: plans.map((p) => {
          const expired = p.validTo && new Date(p.validTo) < now;
          const reviewDue = p.reviewDate && new Date(p.reviewDate) <= soon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${selectedPlan?.id === p.id ? "bg-green-50 border-l-2 border-green-600" : ""}`, onClick: () => {
            setSelectedPlan(p);
            setDetailTab("thresholds");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm leading-tight", children: [
                  cropYearLabel(p.planYear),
                  p.cropName ? ` — ${p.cropName}` : ""
                ] }),
                p.agronomistName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mt-0.5", children: [
                  p.agronomistName,
                  p.basisNumber ? ` · BASIS ${p.basisNumber}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: ipmStatusBadge(p.status ?? "active") })
            ] }),
            (p.validFrom || p.validTo) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs mt-0.5 ${expired ? "text-red-600 font-medium" : "text-gray-400"}`, children: [
              "Valid: ",
              fmtDate(p.validFrom),
              " – ",
              fmtDate(p.validTo),
              expired ? " ⚠ Expired" : ""
            ] }),
            p.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs mt-0.5 ${reviewDue ? "text-amber-600 font-medium" : "text-gray-400"}`, children: [
              "Review: ",
              fmtDate(p.reviewDate),
              reviewDue ? " ⚠ Due" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1.5", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-blue-600 hover:underline", onClick: () => {
                setEditingPlan(p);
                setPlanForm({ ...p });
                setPlanOpen(true);
              }, children: "Edit" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "|" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs text-red-600 hover:underline", onClick: () => deletePlan(p.id), children: "Delete" })
            ] })
          ] }, p.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: !selectedPlan ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-2 border-dashed rounded-lg p-8 text-center text-sm text-gray-400", children: "Select a plan to view thresholds and log monitoring observations" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-4 py-3 border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-gray-900 text-sm", children: [
                cropYearLabel(selectedPlan.planYear),
                selectedPlan.cropName ? ` — ${selectedPlan.cropName}` : ""
              ] }),
              ipmStatusBadge(selectedPlan.status ?? "active")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: printIpmPlan, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3 h-3 mr-1" }),
                "Print Plan"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg", children: [
                detailTabBtn("thresholds", "Thresholds & Actions", thresholds.length),
                detailTabBtn("monitoring", "Monitoring Log", monitoringLogs.length)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500", children: [
            selectedPlan.agronomistName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Agronomist: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: selectedPlan.agronomistName })
            ] }),
            selectedPlan.basisNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "BASIS: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700 font-mono", children: selectedPlan.basisNumber })
            ] }),
            selectedPlan.pestMonitoringFrequency && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Monitoring: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-700", children: selectedPlan.pestMonitoringFrequency.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) })
            ] }),
            selectedPlan.validTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: new Date(selectedPlan.validTo) < now ? "text-red-600 font-medium" : "", children: [
              "Valid to: ",
              fmtDate(selectedPlan.validTo)
            ] }),
            selectedPlan.reviewDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: new Date(selectedPlan.reviewDate) <= soon ? "text-amber-600 font-medium" : "", children: [
              "Review: ",
              fmtDate(selectedPlan.reviewDate)
            ] })
          ] })
        ] }),
        detailTab === "thresholds" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-b flex items-center justify-between bg-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              thresholds.length,
              " pest / weed / disease entr",
              thresholds.length === 1 ? "y" : "ies"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
              setEditingThresh(null);
              setThreshForm({ monitoringMethod: "field_walk", actionTaken: "none" });
              setThreshOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-1" }),
              "Add Pest / Weed"
            ] })
          ] }),
          thresholds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-gray-400", children: "No threshold entries yet. Add the pests, weeds, or diseases you monitor for this crop." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Pest / Weed / Disease", "Method / Frequency", "Decision Threshold", "Chemical Threshold", "Non-Chemical Control", "Resistance Group", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium whitespace-nowrap", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: thresholds.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium text-xs", children: t.pestOrDisease }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-xs text-gray-500", children: [
                MONITORING_METHODS.find((m) => m.value === t.monitoringMethod)?.label ?? t.monitoringMethod ?? "—",
                t.monitoringFrequency && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400", children: t.monitoringFrequency })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: t.actionThreshold ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: t.chemicalThreshold ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs max-w-[140px] truncate", title: t.nonChemicalOption, children: t.nonChemicalOption ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: t.resistanceManagementGroup ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => {
                  setEditingThresh(t);
                  setThreshForm({ ...t });
                  setThreshOpen(true);
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => deleteThreshold(t.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] }) })
            ] }, t.id)) })
          ] }) }),
          (selectedPlan.overallStrategy || selectedPlan.rotationAndCulturalControls || selectedPlan.biologicalControls) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x bg-gray-50", children: [
            selectedPlan.overallStrategy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 mb-1", children: "Overall Strategy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-700", children: selectedPlan.overallStrategy })
            ] }),
            selectedPlan.rotationAndCulturalControls && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 mb-1", children: "Rotation / Cultural Controls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-700", children: selectedPlan.rotationAndCulturalControls })
            ] }),
            selectedPlan.biologicalControls && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 mb-1", children: "Biological Controls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-700", children: selectedPlan.biologicalControls })
            ] })
          ] })
        ] }),
        detailTab === "monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 border-b flex items-center justify-between bg-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              monitoringLogs.length,
              " monitoring entr",
              monitoringLogs.length === 1 ? "y" : "ies",
              " · Frequency: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedPlan.pestMonitoringFrequency?.replace(/_/g, " ") ?? "not set" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: () => {
              setEditingLog(null);
              setLogForm({ logDate: today, thresholdBreached: false });
              setLogOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3 mr-1" }),
              "Log Observation"
            ] })
          ] }),
          monitoringLogs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-sm text-gray-400", children: "No monitoring observations logged yet. Record field observations to track pest and disease pressure over the season." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Pest / Weed", "Severity", "Threshold?", "Observation / Count", "Action Taken", "Inspector", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium whitespace-nowrap", children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: monitoringLogs.map((l) => {
              const isExpanded = expandedLogId === l.id;
              const hasDetail = !!(l.observation || l.actionTaken);
              const baseBg = l.thresholdBreached ? "bg-red-50" : "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-gray-50 ${baseBg} ${isExpanded ? "border-b-0" : ""}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs whitespace-nowrap", children: fmtDate(l.logDate) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs font-medium", children: l.pestOrWeed }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: l.severity ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-xs font-medium ${l.severity === "Critical" ? "bg-red-100 text-red-700" : l.severity === "High" ? "bg-orange-100 text-orange-700" : l.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: l.severity }) : "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: l.thresholdBreached ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-medium", children: "⚠ Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "No" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs max-w-[140px] truncate", children: l.observation ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs max-w-[100px] truncate", children: l.actionTaken ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: l.inspector ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 items-center", children: [
                    hasDetail && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-1.5 text-gray-400", title: isExpanded ? "Collapse" : "Show full details", onClick: () => setExpandedLogId(isExpanded ? null : l.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}` }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => {
                      setEditingLog(l);
                      setLogForm({ ...l });
                      setLogOpen(true);
                    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => deleteLog(l.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
                  ] }) })
                ] }),
                isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: baseBg, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-3 pb-3 pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-3 grid grid-cols-1 gap-2", children: [
                  l.observation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5", children: "Observation / Count" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-700 leading-relaxed", children: l.observation })
                  ] }),
                  l.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5", children: "Action Taken" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-700 leading-relaxed", children: l.actionTaken })
                  ] })
                ] }) }) })
              ] }, l.id);
            }) })
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: planOpen, onOpenChange: setPlanOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editingPlan ? "Edit" : "New",
        " IPM Plan"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(planForm.planYear ?? thisYear), onValueChange: (v) => setP("planYear", Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: planYearOptions.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: cropYearLabel(y) }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: planForm.status || "active", onValueChange: (v) => setP("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: IPM_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop *" }),
          uniqueCropNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: planForm.cropName || "", onValueChange: (v) => setP("cropName", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: uniqueCropNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: planForm.cropName || "", onChange: (e) => setP("cropName", e.target.value), placeholder: "e.g. Winter Wheat, OSR, Spring Barley…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
            "IPM plans are per-crop — create a separate plan for each crop grown in this year.",
            uniqueCropNames.length === 0 && " Add crops in Field &amp; Crop Management to enable the lookup."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valid From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: planForm.validFrom || "", onChange: (e) => setP("validFrom", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valid To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: planForm.validTo || "", onChange: (e) => setP("validTo", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pest Monitoring Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: planForm.pestMonitoringFrequency || "weekly", onValueChange: (v) => setP("pestMonitoringFrequency", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["daily", "twice_weekly", "weekly", "fortnightly", "monthly", "as_needed"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f, children: f.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }, f)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: planForm.reviewDate || "", onChange: (e) => setP("reviewDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide", children: "Agronomist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            agronomists.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select Agronomist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: planForm.agronomistId ? String(planForm.agronomistId) : "__manual__",
                  onValueChange: (v) => {
                    if (v === "__manual__") {
                      setP("agronomistId", null);
                    } else {
                      const found = agronomists.find((a) => String(a.id) === v);
                      if (found) {
                        setP("agronomistId", found.id);
                        setP("agronomistName", found.name);
                        if (found.basisNumber) setP("basisNumber", found.basisNumber);
                      }
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select agronomist…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      agronomists.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(a.id), children: [
                        a.name,
                        a.basisNumber ? ` (${a.basisNumber})` : ""
                      ] }, a.id)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually" })
                    ] })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agronomist Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-1", children: 'Add suppliers with type "Agronomist" to enable lookup and auto-fill.' })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Agronomist Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: planForm.agronomistName || "", onChange: (e) => {
                setP("agronomistName", e.target.value);
                setP("agronomistId", null);
              }, placeholder: "Name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BASIS Registration No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: planForm.basisNumber || "", onChange: (e) => setP("basisNumber", e.target.value), placeholder: "e.g. 12345/6789", className: "font-mono" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide", children: "Plan Content" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall IPM Strategy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: planForm.overallStrategy || "", onChange: (e) => setP("overallStrategy", e.target.value), placeholder: "Describe your overall approach to integrated pest management…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rotation / Cultural Controls" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: planForm.rotationAndCulturalControls || "", onChange: (e) => setP("rotationAndCulturalControls", e.target.value), placeholder: "Crop rotation plan, variety selection rationale, drilling date adjustments, seed rates…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Biological Controls Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: planForm.biologicalControls || "", onChange: (e) => setP("biologicalControls", e.target.value), placeholder: "Beneficial insect habitat, biocontrol agents, beetle banks, buffer strips…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: planForm.notes || "", onChange: (e) => setP("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPlanOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: savePlan, disabled: !planForm.planYear || !planForm.cropName, children: editingPlan ? "Save Changes" : "Create Plan" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: threshOpen, onOpenChange: setThreshOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editingThresh ? "Edit" : "Add",
        " Pest / Weed Threshold"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pest / Weed / Disease *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: threshForm.pestOrDisease || "__custom__", onValueChange: (v) => {
            if (v !== "__custom__") setT("pestOrDisease", v);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select or type below" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              THRESHOLD_PESTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "— Other (type below)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", placeholder: "Or type pest / weed name", value: threshForm.pestOrDisease || "", onChange: (e) => setT("pestOrDisease", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: threshForm.monitoringMethod || "field_walk", onValueChange: (v) => setT("monitoringMethod", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MONITORING_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: threshForm.monitoringFrequency || "", onChange: (e) => setT("monitoringFrequency", e.target.value), placeholder: "e.g. Weekly from GS31" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision (Economic) Threshold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: threshForm.actionThreshold || "", onChange: (e) => setT("actionThreshold", e.target.value), placeholder: "e.g. 5 aphids/tiller at GS37–45" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chemical Spray Threshold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: threshForm.chemicalThreshold || "", onChange: (e) => setT("chemicalThreshold", e.target.value), placeholder: "e.g. 1 plant/m² black-grass" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Non-Chemical Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: threshForm.nonChemicalOption || "", onChange: (e) => setT("nonChemicalOption", e.target.value), placeholder: "Variety choice, delayed drilling, rotation, biocontrol, mechanical weeding…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resistance Management Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: threshForm.resistanceManagementGroup || "", onChange: (e) => setT("resistanceManagementGroup", e.target.value), placeholder: "e.g. SDHI (Group 7)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current Season Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: threshForm.actionTaken || "none", onValueChange: (v) => setT("actionTaken", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["none", "monitoring_only", "cultural_control", "biological_control", "chemical_control", "combination"].map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: a.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }, a)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: threshForm.notes || "", onChange: (e) => setT("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setThreshOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveThreshold, disabled: !threshForm.pestOrDisease, children: editingThresh ? "Save Changes" : "Add Entry" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: logOpen, onOpenChange: setLogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editingLog ? "Edit" : "Log",
        " Monitoring Observation"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: logForm.logDate || today, onChange: (e) => setL("logDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: logForm.fieldId ? String(logForm.fieldId) : "", onValueChange: (v) => setL("fieldId", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All fields / general" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "All fields / general" }),
              farmFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.name }, f.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pest / Weed / Disease *" }),
          thresholdPestNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: logForm.pestOrWeed || "__custom__", onValueChange: (v) => {
            if (v !== "__custom__") setL("pestOrWeed", v);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from plan thresholds" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              thresholdPestNames.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__custom__", children: "— Other (type below)" })
            ] })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: thresholdPestNames.length > 0 ? "mt-1" : "", placeholder: "Pest / weed observed", value: logForm.pestOrWeed || "", onChange: (e) => setL("pestOrWeed", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observation / Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: logForm.observation || "", onChange: (e) => setL("observation", e.target.value), placeholder: "e.g. 3 aphids/tiller, 5% leaf damage" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Severity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: logForm.severity || "", onValueChange: (v) => setL("severity", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "—" }),
              SEVERITY_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "threshBreached", checked: !!logForm.thresholdBreached, onChange: (e) => setL("thresholdBreached", e.target.checked), className: "w-4 h-4 accent-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "threshBreached", className: "text-sm font-medium text-gray-700 cursor-pointer", children: "Economic threshold breached — action required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: logForm.actionTaken || "", onChange: (e) => setL("actionTaken", e.target.value), placeholder: "e.g. Monitoring only, applied fungicide T1, cultural control…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector / Scout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: logForm.inspector || "", onValueChange: (v) => setL("inspector", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ipmActiveMembers.map((m) => {
              const name = memberFullName(m);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, m.id);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: logForm.notes || "", onChange: (e) => setL("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setLogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveLog, disabled: !logForm.logDate || !logForm.pestOrWeed, children: editingLog ? "Save Changes" : "Save Observation" })
      ] })
    ] }) })
  ] });
}
const LERAP_STEPS = [
  { value: "1", label: "Step 1 — Notify only (product registrant notified; no buffer reduction required)" },
  { value: "2", label: "Step 2 — Standard label buffer maintained (no reduction sought)" },
  { value: "3", label: "Step 3 — Full LERAP assessment performed (buffer reduction possible)" }
];
const LERAP_OUTCOMES = [
  { value: "full_buffer_maintained", label: "Full standard buffer maintained" },
  { value: "reduced_buffer", label: "Reduced buffer achieved via LERAP" },
  { value: "no_spray", label: "No spray — risk too high" },
  { value: "pending", label: "Pending review" }
];
const WATERCOURSE_TYPES = [
  { value: "river", label: "River / stream" },
  { value: "ditch", label: "Ditch (flow or dry)" },
  { value: "pond", label: "Pond / lake" },
  { value: "drain", label: "Drain" },
  { value: "coastal", label: "Coastal water" }
];
function LerapTab({ farmId, products, fields }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [cropAutoFilled, setCropAutoFilled] = reactExports.useState(false);
  const [soilAutoFilled, setSoilAutoFilled] = reactExports.useState(false);
  const [bufferAutoFilled, setBufferAutoFilled] = reactExports.useState(false);
  const [filterField, setFilterField] = reactExports.useState("__all__");
  const [reviewOpen, setReviewOpen] = reactExports.useState(false);
  const [reviewRecord, setReviewRecord] = reactExports.useState(null);
  const [reviewForm, setReviewForm] = reactExports.useState({ confirmedOutcome: "full_buffer_maintained", reviewNotes: "" });
  const reviewMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/lerap-assessments/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] });
      setReviewOpen(false);
      toast({ title: "Review recorded", description: "The LERAP assessment has been marked as reviewed and the Task Board task closed." });
    },
    onError: () => toast({ title: "Error recording review", variant: "destructive" })
  });
  reactExports.useEffect(() => {
    if (!form.fieldId || editing) {
      setCropAutoFilled(false);
      setSoilAutoFilled(false);
      return;
    }
    const field = fields.find((f) => f.id === Number(form.fieldId));
    if (!field?.name) return;
    if (field.soilType) {
      set("soilType", field.soilType);
      setSoilAutoFilled(true);
    } else {
      setSoilAutoFilled(false);
    }
    let cancelled = false;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    fetch(`/api/farms/${farmId}/crop-for-field?fieldName=${encodeURIComponent(field.name)}&date=${today}`, { credentials: "include" }).then((r) => r.json()).then((data) => {
      if (!cancelled && data.found && data.cropName) {
        set("cropType", data.cropName);
        setCropAutoFilled(true);
      }
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [form.fieldId]);
  reactExports.useEffect(() => {
    if (!form.productId || editing) {
      setBufferAutoFilled(false);
      return;
    }
    const product = products.find((p) => p.id === Number(form.productId));
    if (product?.lerapStandardBufferM != null) {
      set("standardBufferM", String(product.lerapStandardBufferM));
      setBufferAutoFilled(true);
    } else {
      setBufferAutoFilled(false);
    }
  }, [form.productId]);
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["lerap-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/lerap-assessments`).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const { data: staffList = [] } = useQuery({
    queryKey: ["staff-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`).then((r) => r.json()).then((d) => d.staff ?? []),
    enabled: !!farmId
  });
  const lerapFilterFields = (() => {
    const ids = Array.from(new Set(records.map((r) => r.fieldId).filter((id) => id != null)));
    return ids.map((id) => fields.find((f) => f.id === id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  })();
  function openAdd() {
    setEditing(null);
    setForm({ step: "3", outcome: "pending" });
    setCropAutoFilled(false);
    setSoilAutoFilled(false);
    setBufferAutoFilled(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setCropAutoFilled(false);
    setSoilAutoFilled(false);
    setBufferAutoFilled(false);
    setOpen(true);
  }
  async function save() {
    const url = editing ? `/api/farms/${farmId}/lerap-assessments/${editing.id}` : `/api/farms/${farmId}/lerap-assessments`;
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) {
      toast({ title: "Error saving assessment", variant: "destructive" });
      return;
    }
    const data = await res.json();
    qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] });
    setOpen(false);
    if (editing) {
      toast({ title: "Assessment updated" });
    } else {
      const docRef = `LERAP-${data.record?.id ?? ""}`;
      toast({ title: "LERAP assessment recorded", description: `Document reference: ${docRef}` });
    }
  }
  async function del(id) {
    if (!confirm("Delete this LERAP assessment?")) return;
    await fetch(`/api/farms/${farmId}/lerap-assessments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: ["lerap-assessments", farmId] });
    toast({ title: "Assessment deleted" });
  }
  function printLerapRegister() {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
    const outcomeLbl = (o) => ({ full_buffer_maintained: "Full Buffer Maintained", reduced_buffer: "Reduced Buffer", no_spray: "No Spray Zone", pending: "Pending Review" })[o] ?? o;
    const getF = (id) => id ? fields.find((f) => f.id === id)?.name ?? `Field #${id}` : "—";
    const getP = (id) => id ? products.find((p) => p.id === id)?.name ?? `Product #${id}` : "—";
    const rows = records.map((r) => `<tr>
      <td>LERAP-${r.id}</td>
      <td>${fmtD(r.assessmentDate)}</td>
      <td>${getF(r.fieldId)}</td>
      <td>${getP(r.productId)}</td>
      <td>Step ${r.step ?? "—"}</td>
      <td>${r.watercourseDescription ?? "—"}</td>
      <td>${r.standardBufferM != null ? r.standardBufferM + "m" : "—"}</td>
      <td>${r.lerapBufferM != null ? r.lerapBufferM + "m" : "—"}</td>
      <td>${r.outcome ? outcomeLbl(r.outcome) : "—"}</td>
      <td>${fmtD(r.validUntil)}</td>
      <td>${r.assessorName ?? "—"}</td>
      <td>${r.reviewedBy ? `${r.reviewedBy} (${fmtD(r.reviewedAt)})` : r.pendingReviewBy ? `Pending: ${r.pendingReviewBy}` : "—"}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>LERAP Assessments Register</title>
<style>body{font-family:Arial,sans-serif;font-size:9px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 5px;border:1px solid #e5e7eb;text-align:left}td{padding:3px 5px;border:1px solid #e5e7eb;font-size:9px}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>LERAP Assessments Register</h1>
<h2>Local Environmental Risk Assessment for Pesticides · ${records.length} record${records.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Ref</th><th>Date</th><th>Field</th><th>Product</th><th>Level</th><th>Watercourse</th><th>Std Buffer</th><th>LERAP Buffer</th><th>Outcome</th><th>Valid Until</th><th>Assessor</th><th>Review</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">LERAP assessments must be completed for each application of a product with a LERAP label near a surface watercourse. Red Tractor requires evidence of completed assessments and maintained buffer zones. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const getFieldName = (id) => id ? fields.find((f) => f.id === id)?.name ?? `Field #${id}` : "—";
  const getProductName = (id) => id ? products.find((p) => p.id === id)?.name ?? `Product #${id}` : "—";
  const outcomeBadge = (o) => {
    const colours = { full_buffer_maintained: "bg-green-100 text-green-800", reduced_buffer: "bg-blue-100 text-blue-800", no_spray: "bg-red-100 text-red-800", pending: "bg-amber-100 text-amber-800" };
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[o] ?? "bg-gray-100 text-gray-700"}`, children: LERAP_OUTCOMES.find((x) => x.value === o)?.label?.split("—")[1]?.trim() ?? o });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "LERAP Assessments Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Local Environmental Risk Assessment for Pesticides. Required when spraying products with a LERAP label near surface water. Red Tractor requires evidence of completed assessments and maintained buffer zones." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printLerapRegister, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-8 h-8 text-amber-400 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No LERAP assessments recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Record a LERAP assessment for each field/product combination near surface water." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
      lerapFilterFields.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterField, onValueChange: setFilterField, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All fields" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-64 overflow-y-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__all__", children: "All fields" }),
            lerapFilterFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.name }, f.id))
          ] })
        ] }),
        filterField !== "__all__" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Filtered to 1 field" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Ref", "Date", "Field", "Product", "Assessment Level", "Watercourse", "Std. Buffer", "LERAP Buffer", "Outcome", "Valid Until", "Assessor", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.filter((r) => filterField === "__all__" || r.fieldId === Number(filterField)).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-mono text-xs text-gray-500", children: [
            "LERAP-",
            r.id
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r.assessmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: getFieldName(r.fieldId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: getProductName(r.productId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-xs", children: [
            "Step ",
            r.step ?? "—"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.watercourseDescription ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.standardBufferM != null ? `${r.standardBufferM}m` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.lerapBufferM != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: r.lerapBufferM < r.standardBufferM ? "text-blue-700 font-medium" : "", children: [
            r.lerapBufferM,
            "m"
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
            r.outcome ? outcomeBadge(r.outcome) : "—",
            r.outcome === "pending" && r.pendingReviewBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-600 mt-0.5", children: [
              "Awaiting: ",
              r.pendingReviewBy
            ] }),
            r.reviewedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-green-700 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3" }),
              r.reviewedBy,
              " · ",
              fmtDate(r.reviewedAt)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: fmtDate(r.validUntil) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.assessorName ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            r.outcome === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50",
                title: "Mark as Reviewed",
                onClick: () => {
                  setReviewRecord(r);
                  setReviewForm({ confirmedOutcome: "full_buffer_maintained", reviewNotes: "" });
                  setReviewOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => del(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] }) })
        ] }, r.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " LERAP Assessment"
      ] }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1 py-2 bg-gray-50 rounded-md border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-medium uppercase tracking-wide", children: "Document Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold text-gray-800", children: [
          "LERAP-",
          editing.id
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(read-only)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate || "", onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CRD Assessment Step" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.step || "3", onValueChange: (v) => set("step", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LERAP_STEPS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Steps 1–3 are the CRD LERAP scheme levels, not sequential actions. Select the one that describes this assessment." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.fieldId || "__none__"), onValueChange: (v) => set("fieldId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.name }, f.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.productId || "__none__"), onValueChange: (v) => set("productId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.name }, p.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Watercourse Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.watercourseDescription || "", onChange: (e) => set("watercourseDescription", e.target.value), placeholder: "e.g. River Severn (main channel), drainage ditch on eastern boundary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Watercourse Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.watercourseType || "__none__", onValueChange: (v) => set("watercourseType", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              WATERCOURSE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Buffer (m)" }),
            bufferAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0", value: form.standardBufferM ?? "", onChange: (e) => {
            set("standardBufferM", e.target.value);
            setBufferAutoFilled(false);
          }, placeholder: "From product label" }),
          !bufferAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Auto-fills from the product's label data when a product is selected." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "LERAP Buffer Achieved (m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "0", value: form.lerapBufferM ?? "", onChange: (e) => set("lerapBufferM", e.target.value), placeholder: "After LERAP assessment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type" }),
            cropAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cropType || "", onChange: (e) => {
            set("cropType", e.target.value);
            setCropAutoFilled(false);
          }, placeholder: "e.g. Winter wheat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil Type" }),
            soilAutoFilled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200", children: "Auto-filled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.soilType || "", onChange: (e) => {
            set("soilType", e.target.value);
            setSoilAutoFilled(false);
          }, placeholder: "e.g. Sandy loam, clay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Record the soil type present in the field — this is a site characteristic for the assessment record. The CRD LERAP scheme takes soil type into account when evaluating run-off risk for Category B products; the actual buffer zone calculation is done using CRD tables or the product approval documents. Auto-fills from the field record if recorded there." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome || "pending", onValueChange: (v) => set("outcome", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LERAP_OUTCOMES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
          ] })
        ] }),
        form.outcome === "pending" && (() => {
          const reviewableStaff = staffList.filter((s) => s.email != null && s.email !== "");
          const selectedVal = form.pendingReviewByMemberId ? `m:${form.pendingReviewByMemberId}` : form.pendingReviewByEmail ? `u:${form.pendingReviewBy}` : "__none__";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pending Review By" }),
            reviewableStaff.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedVal, onValueChange: (v) => {
              if (v === "__none__") {
                set("pendingReviewBy", null);
                set("pendingReviewByMemberId", null);
                set("pendingReviewByEmail", null);
              } else if (v.startsWith("m:")) {
                const m = reviewableStaff.find((s) => s.memberId && `m:${s.memberId}` === v);
                if (m) {
                  set("pendingReviewBy", m.name);
                  set("pendingReviewByMemberId", m.memberId);
                  set("pendingReviewByEmail", null);
                }
              } else if (v.startsWith("u:")) {
                const m = reviewableStaff.find((s) => !s.memberId && `u:${s.name}` === v);
                if (m) {
                  set("pendingReviewBy", m.name);
                  set("pendingReviewByMemberId", null);
                  set("pendingReviewByEmail", m.email);
                }
              }
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reviewer…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not assigned" }),
                reviewableStaff.map((s) => {
                  const val = s.memberId ? `m:${s.memberId}` : `u:${s.name}`;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: val, children: [
                    s.name,
                    s.role ? ` — ${s.role}` : ""
                  ] }, val);
                })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800", children: "No staff with an email address found. Staff members and account holders with a registered email will appear here." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "The selected person will receive an email notification with the assessment reference. If they are a staff member (not just an account holder), a task will also be raised on the Task Board so progress can be tracked." })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.validUntil || "", onChange: (e) => set("validUntil", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Name *" }),
          staffList.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessorName || "__none__", onValueChange: (v) => set("assessorName", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select assessor…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select assessor" }),
              staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, children: [
                s.name,
                s.role ? ` — ${s.role}` : ""
              ] }, s.name))
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "No staff records found." }),
            " LERAP assessors must hold PA1 plus the relevant extension certificate (PA2 for boom sprayers, PA6 for hand-held). Add staff members in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/staff", className: "underline font-medium", children: "Staff & Training" }),
            " before recording an assessment."
          ] }),
          staffList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Only staff listed here may be selected. LERAP assessors must hold PA1 + relevant certificate (PA2, PA6 etc.). Record qualifications against each staff member to evidence compliance." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reduction Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.reductionJustification || "", onChange: (e) => set("reductionJustification", e.target.value), placeholder: "Why buffer was reduced — equipment type, weather conditions, field characteristics…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: editing ? "Save Changes" : "Record Assessment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: reviewOpen, onOpenChange: setReviewOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Complete LERAP Review — LERAP-",
        reviewRecord?.id
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        reviewRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-gray-50 rounded-md text-sm space-y-1 border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 w-20 shrink-0", children: "Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-semibold", children: [
              "LERAP-",
              reviewRecord.id
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 w-20 shrink-0", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getFieldName(reviewRecord.fieldId) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 w-20 shrink-0", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getProductName(reviewRecord.productId) })
          ] }),
          reviewRecord.pendingReviewBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 w-20 shrink-0", children: "Assigned to" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reviewRecord.pendingReviewBy })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Confirmed Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reviewForm.confirmedOutcome, onValueChange: (v) => setReviewForm((f) => ({ ...f, confirmedOutcome: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LERAP_OUTCOMES.filter((o) => o.value !== "pending").map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Confirm the LERAP outcome following your review. This replaces the Pending Review status." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: reviewForm.reviewNotes, onChange: (e) => setReviewForm((f) => ({ ...f, reviewNotes: e.target.value })), placeholder: "What was verified, any issues found, buffer zone changes confirmed…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800", children: "Your name and the current date/time will be stamped on this record as reviewer. The linked Task Board task will be automatically closed. This creates a permanent audit trail entry visible in the assessments register." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReviewOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: !reviewForm.confirmedOutcome || reviewMut.isPending,
            onClick: () => {
              if (reviewRecord) reviewMut.mutate({ id: reviewRecord.id, body: reviewForm });
            },
            children: reviewMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
              "Saving…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Mark as Reviewed"
            ] })
          }
        )
      ] })
    ] }) })
  ] });
}
function SprayNotificationsTab({ farmId, applications, fields }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRec, setEditRec] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [contactOpen, setContactOpen] = reactExports.useState(false);
  const [editContact, setEditContact] = reactExports.useState(null);
  const [deleteContactId, setDeleteContactId] = reactExports.useState(null);
  const [beeInfoOpen, setBeeInfoOpen] = reactExports.useState(true);
  const emptyForm = {
    sprayApplicationId: "",
    notificationDate: today,
    plannedSprayDate: "",
    recipientType: "beekeeper",
    recipientName: "",
    recipientContact: "",
    recipientAddress: "",
    contactMethod: "phone",
    productsNotified: "",
    fieldRefs: "",
    confirmed: false,
    confirmationDate: "",
    confirmationMethod: "",
    confirmationReference: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState({ ...emptyForm });
  const emptyContact = { recipientType: "beekeeper", recipientName: "", recipientContact: "", recipientAddress: "", notes: "" };
  const [contactForm, setContactForm] = reactExports.useState({ ...emptyContact });
  const farmQ = useQuery({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()), select: (d) => d.record });
  const farm = farmQ.data;
  const notifQ = useQuery({ queryKey: ["spray-notifications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-notifications`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.notifications ?? [] });
  const notifications = notifQ.data ?? [];
  const contactsQ = useQuery({ queryKey: ["spray-notification-contacts", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-notification-contacts`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.contacts ?? [] });
  const contacts = contactsQ.data ?? [];
  const createMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/spray-notifications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Notification logged" });
    qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] });
    setAddOpen(false);
    setForm({ ...emptyForm });
  }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/spray-notifications/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Notification updated" });
    qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] });
    setEditRec(null);
  }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-notifications/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => {
    toast({ title: "Notification deleted" });
    qc.invalidateQueries({ queryKey: ["spray-notifications", farmId] });
    setDeleteId(null);
  }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const createContactMut = useMutation({ mutationFn: (b) => fetch(`/api/farms/${farmId}/spray-notification-contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Contact saved" });
    qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] });
    setEditContact(null);
    setContactForm({ ...emptyContact });
  }, onError: () => toast({ title: "Failed to save contact", variant: "destructive" }) });
  const updateContactMut = useMutation({ mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/spray-notification-contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    toast({ title: "Contact updated" });
    qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] });
    setEditContact(null);
    setContactForm({ ...emptyContact });
  }, onError: () => toast({ title: "Failed to update contact", variant: "destructive" }) });
  const deleteContactMut = useMutation({ mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-notification-contacts/${id}`, { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => {
    toast({ title: "Contact deleted" });
    qc.invalidateQueries({ queryKey: ["spray-notification-contacts", farmId] });
    setDeleteContactId(null);
  }, onError: () => toast({ title: "Failed to delete contact", variant: "destructive" }) });
  const fmtD = (d) => d ? (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("en-GB") : "—";
  const fldName = (id) => fields.find((f) => String(f.id) === String(id))?.name || `Field #${id}`;
  const appLabel = (id) => {
    const a = applications.find((a2) => String(a2.id) === String(id));
    if (!a) return id ? `Application #${id}` : "—";
    return `${a.productName || "Spray"} · ${fmtD(a.applicationDate)}${a.fieldId ? ` · ${fldName(a.fieldId)}` : ""}`;
  };
  const rTypeLabel = { beekeeper: "Beekeeper", neighbour: "Neighbour", other: "Other" };
  const methodLabel = { phone: "Phone call", email: "Email", letter: "Letter", in_person: "In person", text_message: "Text message" };
  function leadTimeHours(n) {
    if (!n.plannedSprayDate || !n.notificationDate) return null;
    const a = /* @__PURE__ */ new Date(n.notificationDate + "T00:00:00");
    const b = /* @__PURE__ */ new Date(n.plannedSprayDate + "T00:00:00");
    return (b.getTime() - a.getTime()) / 36e5;
  }
  function LeadTimeBadge({ n }) {
    const hours = leadTimeHours(n);
    if (hours === null) return null;
    const days = Math.floor(Math.abs(hours) / 24);
    if (hours < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded px-1.5 py-0.5", children: "Spray date past" });
    if (hours < 48) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5 font-medium", children: [
      "⚠ ",
      days,
      "d notice"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5", children: [
      "✓ ",
      days,
      "d notice"
    ] });
  }
  function openEdit(n) {
    setEditRec(n);
    setForm({
      sprayApplicationId: String(n.sprayApplicationId ?? ""),
      notificationDate: n.notificationDate?.slice(0, 10) ?? today,
      plannedSprayDate: n.plannedSprayDate?.slice(0, 10) ?? "",
      recipientType: n.recipientType ?? "beekeeper",
      recipientName: n.recipientName ?? "",
      recipientContact: n.recipientContact ?? "",
      recipientAddress: n.recipientAddress ?? "",
      contactMethod: n.contactMethod ?? "phone",
      productsNotified: n.productsNotified ?? "",
      fieldRefs: n.fieldRefs ?? "",
      confirmed: n.confirmed ?? false,
      confirmationDate: n.confirmationDate?.slice(0, 10) ?? "",
      confirmationMethod: n.confirmationMethod ?? "",
      confirmationReference: n.confirmationReference ?? "",
      notes: n.notes ?? ""
    });
  }
  function pickContact(c) {
    setForm((f) => ({ ...f, recipientType: c.recipientType, recipientName: c.recipientName, recipientContact: c.recipientContact ?? "", recipientAddress: c.recipientAddress ?? "" }));
  }
  function openEditContact(c) {
    setEditContact(c);
    setContactForm({ recipientType: c.recipientType ?? "beekeeper", recipientName: c.recipientName ?? "", recipientContact: c.recipientContact ?? "", recipientAddress: c.recipientAddress ?? "", notes: c.notes ?? "" });
  }
  function printNotificationLetter(n) {
    const app = applications.find((a) => String(a.id) === String(n.sprayApplicationId));
    const farmName = farm?.name || "Our Farm";
    const farmAddress = [farm?.address, farm?.postcode].filter(Boolean).join(", ");
    const farmCph = farm?.cphNumber ? `CPH No: ${farm.cphNumber}` : "";
    const farmManager = farm?.farmManager || "";
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const plannedDate = n.plannedSprayDate ? (/* @__PURE__ */ new Date(n.plannedSprayDate + "T12:00:00")).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[date to be confirmed]";
    const notifDateStr = fmtD(n.notificationDate);
    const productsText = n.productsNotified || (app ? app.productName || "pesticide products" : "pesticide products");
    const fieldsText = n.fieldRefs || (app?.fieldId ? fldName(app.fieldId) : "fields at the above holding");
    const isBeekeper = n.recipientType === "beekeeper";
    const hours = leadTimeHours(n);
    const daysNotice = hours !== null ? Math.floor(hours / 24) : null;
    const recipientAddrHtml = n.recipientAddress ? String(n.recipientAddress).replace(/\n/g, "<br>") : "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Spray Notification Letter — ${n.recipientName}</title><style>body{font-family:Georgia,"Times New Roman",serif;max-width:680px;margin:40px auto;padding:20px;color:#111;font-size:14px;line-height:1.55}h1{font-size:18px;margin:0 0 4px}.meta{color:#555;margin:2px 0}.date{margin:28px 0 24px}.recip{margin-bottom:28px}.recip strong{font-size:15px}h2{font-size:14px;text-decoration:underline;letter-spacing:.04em;margin:0 0 18px}p{margin:0 0 14px}table{width:100%;border-collapse:collapse;margin:0 0 20px;font-size:13px}td{padding:6px 12px;border:1px solid #bbb}td:first-child{font-weight:bold;background:#f8f8f8;width:36%}.gap{height:52px}.ref{font-size:11px;color:#888;margin-top:6px}@media print{body{margin:0;padding:24px}}</style></head><body><div><h1>${farmName}</h1>${farmAddress ? `<p class="meta">${farmAddress}</p>` : ""}${farmCph ? `<p class="meta">${farmCph}</p>` : ""}</div><div class="date">${dateStr}</div><div class="recip"><strong>${n.recipientName}</strong>${recipientAddrHtml ? `<br>${recipientAddrHtml}` : ""}</div><h2>ADVANCE NOTICE OF PESTICIDE APPLICATION</h2><p>Dear ${n.recipientName},</p><p>We are writing to provide you with advance notice of our intention to apply pesticide products at ${farmName}. The details of the planned application are set out below:</p><table><tr><td>Planned Application Date</td><td><strong>${plannedDate}</strong></td></tr><tr><td>Date of This Notification</td><td>${notifDateStr}</td></tr>${daysNotice !== null ? `<tr><td>Notice Period Given</td><td>${daysNotice} day${daysNotice === 1 ? "" : "s"}</td></tr>` : ""}<tr><td>Products to be Applied</td><td>${productsText}</td></tr><tr><td>Fields / Areas Affected</td><td>${fieldsText}</td></tr></table>${isBeekeper ? "<p>As a registered beekeeper, we respectfully request that you take appropriate precautions to protect your bees during and after this application. Where practicable, we would ask that hive entrances are closed or that hives are moved away from the treated area before spraying commences, and remain so for at least 24 hours after the application has finished. We are happy to discuss the timing further to minimise any potential impact on your bees.</p>" : "<p>As an adjoining landowner or occupier, we are providing this advance notice as good practice under the Voluntary Initiative Code of Practice for the responsible use of pesticides. We take our obligations to neighbouring parties seriously and aim to keep all landowners informed prior to any pesticide application.</p>"}<p>If you have any questions or concerns about this planned application, please do not hesitate to contact us before the spray date.</p><p>Yours sincerely,</p><div class="gap"></div><p>${farmManager ? `<strong>${farmManager}</strong><br>` : ""}${farmName}</p><p class="ref">Notification ref: ${farmName} — ${notifDateStr} — ${n.recipientName}</p></body></html>`;
    openPrintWindow(html);
  }
  const beekeepers = notifications.filter((n) => n.recipientType === "beekeeper");
  const confirmedNotifs = notifications.filter((n) => n.confirmed);
  const lateNotifs = notifications.filter((n) => {
    const h = leadTimeHours(n);
    return h !== null && h >= 0 && h < 48;
  });
  const formLeadH = form.notificationDate && form.plannedSprayDate ? ((/* @__PURE__ */ new Date(form.plannedSprayDate + "T00:00:00")).getTime() - (/* @__PURE__ */ new Date(form.notificationDate + "T00:00:00")).getTime()) / 36e5 : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold", children: "Spray Beekeeper & Neighbour Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Red Tractor requirement: log all pre-spray notifications to beekeepers and neighbours. Minimum 48 hours' advance notice required." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-gray-50", onClick: () => setContactOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-3.5 h-3.5" }),
          "Contact Book"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:opacity-90", onClick: () => {
          setForm({ ...emptyForm });
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          "Log Notification"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-blue-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 font-medium", children: "Total Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-800 mt-1", children: notifications.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-amber-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 font-medium", children: "Beekeeper Notices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-800 mt-1", children: beekeepers.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-green-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-medium", children: "Confirmed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-800 mt-1", children: confirmedNotifs.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg p-3 ${lateNotifs.length > 0 ? "bg-red-50 border-red-200" : "bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-medium ${lateNotifs.length > 0 ? "text-red-700" : "text-gray-600"}`, children: "Under 48hr Notice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold mt-1 ${lateNotifs.length > 0 ? "text-red-800" : "text-gray-400"}`, children: lateNotifs.length })
      ] })
    ] }),
    beeInfoOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-amber-200 rounded-lg p-4 bg-amber-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl leading-none mt-0.5 flex-shrink-0", children: "🐝" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-900", children: "BeeConnected — Automatic Beekeeper Notification Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-800 mt-1 leading-relaxed", children: "BeeConnected is a free UK service that automatically notifies registered beekeepers within your chosen radius when you plan to spray. Beekeepers register their hive locations voluntarily and receive instant alerts — saving you time and ensuring you meet your notification obligations without needing to know who keeps bees locally." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 mt-1", children: "APHA's BeeBase does not provide a public search API, but BeeConnected is the recommended alternative for England, Scotland and Wales." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://beeconnected.org.uk", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline mt-2 hover:text-amber-700", children: [
          "Visit BeeConnected.org.uk ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-amber-500 hover:text-amber-800 flex-shrink-0 text-lg leading-none", onClick: () => setBeeInfoOpen(false), children: "✕" })
    ] }) }),
    notifQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center py-8 text-sm text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      "Loading…"
    ] }),
    !notifQ.isLoading && notifications.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed border-gray-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "No notifications logged yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Log when you notify beekeepers or neighbours before applying bee-toxic products." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: notifications.map((n) => {
      const isExp = expandedId === n.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50", onClick: () => setExpandedId(isExp ? null : n.id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: n.recipientName || "Unnamed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                rTypeLabel[n.recipientType] || n.recipientType,
                ")"
              ] }),
              n.confirmed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5", children: "✓ Confirmed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LeadTimeBadge, { n })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Notified ",
              fmtD(n.notificationDate),
              " · ",
              methodLabel[n.contactMethod] || n.contactMethod || "—",
              n.plannedSprayDate && ` · Spray: ${fmtD(n.plannedSprayDate)}`,
              n.sprayApplicationId && ` · ${appLabel(n.sprayApplicationId)}`
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded hover:bg-gray-200 text-gray-500", title: "Print notification letter", onClick: (e) => {
              e.stopPropagation();
              printNotificationLetter(n);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded hover:bg-gray-200", onClick: (e) => {
              e.stopPropagation();
              openEdit(n);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 text-gray-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded hover:bg-red-100", onClick: (e) => {
              e.stopPropagation();
              setDeleteId(n.id);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) }),
            isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })
          ] })
        ] }),
        isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Phone / Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: n.recipientContact || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Contact Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: methodLabel[n.contactMethod] || n.contactMethod || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Linked Application" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: appLabel(n.sprayApplicationId) })
          ] }),
          n.recipientAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Postal Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line text-sm", children: n.recipientAddress })
          ] }),
          n.productsNotified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Products Notified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: n.productsNotified })
          ] }),
          n.fieldRefs && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fields / Areas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: n.fieldRefs })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Confirmation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              n.confirmed ? "Received" : "Pending",
              n.confirmationDate && ` — ${fmtD(n.confirmationDate)}`,
              n.confirmationMethod && ` (${n.confirmationMethod})`
            ] })
          ] }),
          n.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-line", children: n.notes })
          ] })
        ] })
      ] }, n.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen || !!editRec, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRec(null);
        setForm({ ...emptyForm });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRec ? "Edit Notification" : "Log Spray Notification" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Recipient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Recipient Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: form.recipientType, onChange: (e) => setForm((f) => ({ ...f, recipientType: e.target.value })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "beekeeper", children: "Beekeeper" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "neighbour", children: "Neighbour / Landowner" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
              ] })
            ] }),
            contacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Pick from Contact Book" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: "", onChange: (e) => {
                const c = contacts.find((c2) => String(c2.id) === e.target.value);
                if (c) pickContact(c);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— Select saved contact —" }),
                contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(c.id), children: [
                  c.recipientName,
                  " (",
                  rTypeLabel[c.recipientType] || c.recipientType,
                  ")"
                ] }, c.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Recipient Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recipientName, onChange: (e) => setForm((f) => ({ ...f, recipientName: e.target.value })), placeholder: "e.g. John Smith" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Phone / Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.recipientContact, onChange: (e) => setForm((f) => ({ ...f, recipientContact: e.target.value })), placeholder: "07700 900 123" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium", children: [
              "Postal Address ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(used when printing notification letter)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.recipientAddress, onChange: (e) => setForm((f) => ({ ...f, recipientAddress: e.target.value })), rows: 2, placeholder: "1 Lane Road\nVillage, County\nAB1 2CD" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Notification Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Date Notified *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.notificationDate, onChange: (e) => setForm((f) => ({ ...f, notificationDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium", children: [
                "Planned Spray Date ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(48hr check)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.plannedSprayDate, onChange: (e) => setForm((f) => ({ ...f, plannedSprayDate: e.target.value })) })
            ] })
          ] }),
          formLeadH !== null && (formLeadH < 48 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600 font-medium -mt-1", children: [
            "⚠ Only ",
            Math.floor(formLeadH / 24),
            " day",
            Math.floor(formLeadH / 24) === 1 ? "" : "s",
            " notice — Red Tractor requires a minimum of 48 hours."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 -mt-1", children: [
            "✓ ",
            Math.floor(formLeadH / 24),
            " day",
            Math.floor(formLeadH / 24) === 1 ? "" : "s",
            " notice — meets the 48-hour requirement."
          ] })),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "How Was Notification Made?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: form.contactMethod, onChange: (e) => setForm((f) => ({ ...f, contactMethod: e.target.value })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "phone", children: "Phone call" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "email", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "letter", children: "Letter (post)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_person", children: "In person" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "text_message", children: "Text message" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Linked Spray Application" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: form.sprayApplicationId, onChange: (e) => setForm((f) => ({ ...f, sprayApplicationId: e.target.value })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— None —" }),
                applications.slice(0, 50).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(a.id), children: [
                  a.productName || "Spray",
                  " — ",
                  fmtD(a.applicationDate),
                  a.fieldId ? ` — ${fldName(a.fieldId)}` : ""
                ] }, a.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Products Notified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productsNotified, onChange: (e) => setForm((f) => ({ ...f, productsNotified: e.target.value })), placeholder: "e.g. Karate Zeon, Lambda-C" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Fields / Areas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fieldRefs, onChange: (e) => setForm((f) => ({ ...f, fieldRefs: e.target.value })), placeholder: "e.g. North Field, Field 4" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Confirmation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "spn-confirmed", checked: form.confirmed, onChange: (e) => setForm((f) => ({ ...f, confirmed: e.target.checked })), className: "w-4 h-4 cursor-pointer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "spn-confirmed", className: "text-sm cursor-pointer", children: "Confirmation received from recipient" })
          ] }),
          form.confirmed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Confirmation Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.confirmationDate, onChange: (e) => setForm((f) => ({ ...f, confirmationDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "How Confirmed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.confirmationMethod, onChange: (e) => setForm((f) => ({ ...f, confirmationMethod: e.target.value })), placeholder: "e.g. verbal, email reply" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => {
          setAddOpen(false);
          setEditRec(null);
          setForm({ ...emptyForm });
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50", disabled: !form.notificationDate || !form.recipientName || createMut.isPending || updateMut.isPending, onClick: () => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form), children: createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Notification" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: contactOpen, onOpenChange: (o) => {
      if (!o) {
        setContactOpen(false);
        setEditContact(null);
        setContactForm({ ...emptyContact });
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Contact Book — Beekeepers & Neighbours" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-2 mb-3", children: "Save regular recipients here so you can quickly populate the notification form." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-gray-50 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold", children: editContact ? "Edit Contact" : "Add Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full border border-input rounded-md px-3 py-2 text-sm bg-background", value: contactForm.recipientType, onChange: (e) => setContactForm((f) => ({ ...f, recipientType: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "beekeeper", children: "Beekeeper" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "neighbour", children: "Neighbour / Landowner" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.recipientName, onChange: (e) => setContactForm((f) => ({ ...f, recipientName: e.target.value })), placeholder: "e.g. John Smith" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Phone / Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.recipientContact, onChange: (e) => setContactForm((f) => ({ ...f, recipientContact: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.notes, onChange: (e) => setContactForm((f) => ({ ...f, notes: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Postal Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: contactForm.recipientAddress, onChange: (e) => setContactForm((f) => ({ ...f, recipientAddress: e.target.value })), rows: 2, placeholder: "1 Lane Road\nVillage, County AB1 2CD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          editContact && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-3 py-1.5 text-sm hover:bg-gray-100", onClick: () => {
            setEditContact(null);
            setContactForm({ ...emptyContact });
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50", disabled: !contactForm.recipientName || createContactMut.isPending || updateContactMut.isPending, onClick: () => editContact ? updateContactMut.mutate({ id: editContact.id, b: contactForm }) : createContactMut.mutate(contactForm), children: createContactMut.isPending || updateContactMut.isPending ? "Saving…" : editContact ? "Save Changes" : "Add Contact" })
        ] })
      ] }),
      contactsQ.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center py-4 gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
        "Loading…"
      ] }),
      !contactsQ.isLoading && contacts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No contacts saved yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mt-2", children: contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg px-3 py-2 flex items-start justify-between gap-3 bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium", children: [
            c.recipientName,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
              "(",
              rTypeLabel[c.recipientType] || c.recipientType,
              ")"
            ] })
          ] }),
          c.recipientContact && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: c.recipientContact }),
          c.recipientAddress && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 whitespace-pre-line", children: c.recipientAddress }),
          c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: c.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded hover:bg-gray-100", onClick: () => openEditContact(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 text-gray-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded hover:bg-red-100", onClick: () => setDeleteContactId(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-400" }) })
        ] })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => setContactOpen(false), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Notification" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this notification record? This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: deleteMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteContactId !== null, onOpenChange: (o) => {
      if (!o) setDeleteContactId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Contact" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Remove this contact from the book? Existing notification records are not affected." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => setDeleteContactId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50", disabled: deleteContactMut.isPending, onClick: () => deleteContactId !== null && deleteContactMut.mutate(deleteContactId), children: deleteContactMut.isPending ? "Deleting…" : "Delete" })
      ] })
    ] }) })
  ] });
}
const DISPOSAL_METHODS = [
  { value: "triple_rinsed_return", label: "Triple-rinsed & returned to supplier" },
  { value: "waste_contractor", label: "Waste contractor collection" },
  { value: "crushing", label: "On-site crushing / compaction" },
  { value: "incineration", label: "Incineration" },
  { value: "other", label: "Other" }
];
function ContainerDisposalTab({ farmId, products }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  const key = [`/api/farms/${farmId}/spray-container-disposals`];
  const dataQ = useQuery({ queryKey: key, queryFn: () => fetch(`/api/farms/${farmId}/spray-container-disposals`).then((r) => r.json()) });
  const records = dataQ.data?.records ?? [];
  const emptyDisposal = { disposalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), productId: "__none__", productName: "", containerCount: "", containerSizeL: "", disposalMethod: "__none__", wasteContractorName: "", wasteTransferRef: "", rinsedOnSite: false, operatorMemberId: "__none__", notes: "" };
  const [form, setForm] = reactExports.useState(emptyDisposal);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRec, setEditRec] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  function openAdd() {
    setEditRec(null);
    setForm(emptyDisposal);
    setAddOpen(true);
  }
  function openEdit(r) {
    setEditRec(r);
    setForm({
      disposalDate: r.disposalDate ? String(r.disposalDate).slice(0, 10) : "",
      productId: r.productId ? String(r.productId) : "__none__",
      productName: r.productName ?? "",
      containerCount: r.containerCount ?? "",
      containerSizeL: r.containerSizeL ?? "",
      disposalMethod: r.disposalMethod ?? "__none__",
      wasteContractorName: r.wasteContractorName ?? "",
      wasteTransferRef: r.wasteTransferRef ?? "",
      rinsedOnSite: !!r.rinsedOnSite,
      operatorMemberId: r.operatorMemberId ? String(r.operatorMemberId) : "__none__",
      notes: r.notes ?? ""
    });
    setAddOpen(true);
  }
  function buildBody() {
    const { productId, disposalMethod, operatorMemberId, ...rest } = form;
    return {
      ...rest,
      productId: productId && productId !== "__none__" ? Number(productId) : null,
      disposalMethod: disposalMethod && disposalMethod !== "__none__" ? disposalMethod : null,
      operatorMemberId: operatorMemberId && operatorMemberId !== "__none__" ? Number(operatorMemberId) : null,
      containerCount: rest.containerCount ? Number(rest.containerCount) : null,
      containerSizeL: rest.containerSizeL ? rest.containerSizeL : null
    };
  }
  const createMut = useMutation({
    mutationFn: (b) => fetch(`/api/farms/${farmId}/spray-container-disposals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Disposal log saved" });
      qc.invalidateQueries({ queryKey: key });
      setAddOpen(false);
    },
    onError: () => toast({ title: "Error saving disposal log", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/spray-container-disposals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Disposal log updated" });
      qc.invalidateQueries({ queryKey: key });
      setAddOpen(false);
    },
    onError: () => toast({ title: "Error updating disposal log", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-container-disposals/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: key });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" })
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", color: "#1e293b" }, children: "Container Disposal Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#64748b", marginTop: 2 }, children: "Record disposal of used pesticide containers, as required by UK waste regulations." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Disposal"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, marginBottom: 4 }, children: "No disposals recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem" }, children: "Log container disposals to demonstrate regulatory compliance." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Product", "Containers", "Method", "Waste Transfer Ref", "Rinsed", "Operator", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const prod = products.find((p) => p.id === r.productId);
        const method = DISPOSAL_METHODS.find((m) => m.value === r.disposalMethod);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", whiteSpace: "nowrap" }, children: r.disposalDate ? new Date(r.disposalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: prod?.productName || r.productName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.75rem" }, children: [
            r.containerCount ?? "—",
            r.containerSizeL ? ` × ${r.containerSizeL}L` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontSize: "0.8rem", color: "#374151" }, children: method?.label || r.disposalMethod || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", fontFamily: "monospace", fontSize: "0.78rem" }, children: r.wasteTransferRef || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.rinsedOnSite ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#16a34a", fontWeight: 600, fontSize: "0.78rem" }, children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontSize: "0.78rem" }, children: "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }, children: r.operatorMemberId ? memberFullName(members.find((m) => m.id === r.operatorMemberId)) : r.operatorName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRec(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editRec ? "Edit" : "Log",
        " Container Disposal"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Disposal Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.disposalDate, onChange: (e) => set("disposalDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.operatorMemberId, onValueChange: (v) => set("operatorMemberId", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.id), children: memberFullName(m) }, m.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productId, onValueChange: (v) => set("productId", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not listed / manual entry" }),
              products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.productName }, p.id))
            ] })
          ] })
        ] }),
        (!form.productId || form.productId === "__none__") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name (manual)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Enter product name", value: form.productName, onChange: (e) => set("productName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Containers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", placeholder: "e.g. 3", value: form.containerCount, onChange: (e) => set("containerCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Container Size (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 5", value: form.containerSizeL, onChange: (e) => set("containerSizeL", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.disposalMethod, onValueChange: (v) => set("disposalMethod", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              DISPOSAL_METHODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m.value, children: m.label }, m.value))
            ] })
          ] })
        ] }),
        form.disposalMethod === "waste_contractor" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Contractor Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Agri-Waste Services Ltd", value: form.wasteContractorName, onChange: (e) => set("wasteContractorName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste Transfer Note Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WTN-2026-001", value: form.wasteTransferRef, onChange: (e) => set("wasteTransferRef", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "rinsedOnSite", checked: !!form.rinsedOnSite, onChange: (e) => set("rinsedOnSite", e.target.checked), style: { width: 16, height: 16, cursor: "pointer" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "rinsedOnSite", style: { fontSize: "0.85rem", cursor: "pointer" }, children: "Containers triple-rinsed on site before disposal" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Additional details…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => {
          setAddOpen(false);
          setEditRec(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50",
            disabled: !form.disposalDate || createMut.isPending || updateMut.isPending,
            onClick: () => editRec ? updateMut.mutate({ id: editRec.id, b: buildBody() }) : createMut.mutate(buildBody()),
            children: createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Disposal"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Disposal Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this disposal record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function SprayStocktakesTab({ farmId, products }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const todayST = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const emptyST = {
    productId: "",
    productName: "",
    systemQtyLitres: "",
    physicalQtyLitres: "",
    conductedBy: "",
    stocktakeDate: todayST(),
    notes: ""
  };
  const [stForm, setStForm] = reactExports.useState(emptyST);
  const stocktakesQ = useQuery({
    queryKey: ["spray-product-stocktakes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-product-stocktakes`).then((r) => r.json())
  });
  const stRecords = Array.isArray(stocktakesQ.data?.records) ? stocktakesQ.data.records : [];
  function handleSpraySTProdChange(productId) {
    if (productId === "__other__") {
      setStForm((f) => ({ ...f, productId, productName: "", systemQtyLitres: "" }));
      return;
    }
    const p = products.find((x) => String(x.id) === productId);
    setStForm((f) => ({
      ...f,
      productId,
      productName: p?.productName ?? "",
      systemQtyLitres: p?.currentStockQuantity !== null && p?.currentStockQuantity !== void 0 ? String(p.currentStockQuantity) : ""
    }));
  }
  const saveST = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/spray-product-stocktakes`, {
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
    onSuccess: () => {
      toast({ title: "Stocktake recorded" });
      qc.invalidateQueries({ queryKey: ["spray-product-stocktakes", farmId] });
      setOpen(false);
      setStForm(emptyST);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  function handleSTSubmit() {
    if (!stForm.physicalQtyLitres || !stForm.stocktakeDate) {
      toast({ title: "Physical quantity and date are required", variant: "destructive" });
      return;
    }
    saveST.mutate({
      productId: stForm.productId && stForm.productId !== "__other__" ? Number(stForm.productId) : null,
      productName: stForm.productName || null,
      systemQtyLitres: stForm.systemQtyLitres || null,
      physicalQtyLitres: stForm.physicalQtyLitres,
      conductedBy: stForm.conductedBy || null,
      stocktakeDate: stForm.stocktakeDate,
      notes: stForm.notes || null
    });
  }
  const fmtL = (v) => v === null || v === void 0 ? "—" : `${parseFloat(String(v)).toFixed(2)} L`;
  function stVarBadge(sys, phys) {
    if (!sys || !phys) return null;
    const v = parseFloat(phys) - parseFloat(sys);
    const cls = Math.abs(v) < 0.01 ? "bg-green-100 text-green-800" : v < 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`, children: [
      v >= 0 ? "+" : "",
      v.toFixed(2),
      " L"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Spray Store Stocktake" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Physically count bottles and containers, reconcile against application records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "bg-green-700 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-green-800 flex items-center gap-1.5", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
        "Record Stocktake"
      ] })
    ] }),
    stocktakesQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-gray-400" }) }) : stRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-3 opacity-40", style: { fontSize: 36 }, children: "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No stocktakes recorded yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Use the button above to record a physical bottle count." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "System (L)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "Physical (L)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right text-xs font-semibold text-gray-600", children: "Variance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Conducted By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left text-xs font-semibold text-gray-600", children: "Notes" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: stRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: r.stocktakeDate ? (/* @__PURE__ */ new Date(r.stocktakeDate + "T12:00:00")).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: r.registeredProductName ?? r.productName ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", children: fmtL(r.systemQtyLitres) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", children: fmtL(r.physicalQtyLitres) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", children: stVarBadge(r.systemQtyLitres, r.physicalQtyLitres) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: r.conductedBy ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-gray-500 max-w-xs truncate", children: r.notes ?? "" })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setStForm(emptyST);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Record Spray Store Stocktake" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stForm.productId, onValueChange: handleSpraySTProdChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select spray product…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.productName }, p.id)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not in register" })
            ] })
          ] })
        ] }),
        stForm.productId === "__other__" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.productName, onChange: (e) => setStForm((f) => ({ ...f, productName: e.target.value })), placeholder: "Enter product name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stocktake Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: stForm.stocktakeDate, onChange: (e) => setStForm((f) => ({ ...f, stocktakeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Quantity (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stForm.systemQtyLitres, onChange: (e) => setStForm((f) => ({ ...f, systemQtyLitres: e.target.value })), placeholder: "From stock records" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Physical Quantity (L) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: stForm.physicalQtyLitres, onChange: (e) => setStForm((f) => ({ ...f, physicalQtyLitres: e.target.value })), placeholder: "Counted in store" })
          ] })
        ] }),
        stForm.systemQtyLitres && stForm.physicalQtyLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-md bg-gray-50 border border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Variance:" }),
          stVarBadge(stForm.systemQtyLitres, stForm.physicalQtyLitres),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "(physical − system)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducted By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: stForm.conductedBy, onChange: (e) => setStForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Name of person" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: stForm.notes, onChange: (e) => setStForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "e.g. partial containers measured, damaged stock noted" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setStForm(emptyST);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-green-700 hover:bg-green-800", onClick: handleSTSubmit, disabled: saveST.isPending, children: [
          saveST.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1" }) : null,
          "Save Stocktake"
        ] })
      ] })
    ] }) })
  ] });
}
const INSPECTION_TYPES = [
  { value: "routine", label: "Routine" },
  { value: "pre_season", label: "Pre-Season" },
  { value: "post_season", label: "Post-Season" },
  { value: "ad_hoc", label: "Ad-hoc" }
];
const CHECKLIST_FIELDS = [
  { key: "locked", label: "Store is lockable and kept locked" },
  { key: "bunded", label: "Bunded / spillage containment in place" },
  { key: "emergencyCardPosted", label: "Emergency contact card posted" },
  { key: "coshhAssessed", label: "COSHH assessment available on site" },
  { key: "signagePresent", label: "Hazard signage present" },
  { key: "ventilationAdequate", label: "Ventilation adequate" },
  { key: "separateFromSeed", label: "Stored separately from seed/feed" },
  { key: "noObviousLeaks", label: "No obvious leaks or damaged containers" }
];
function StoreInspectionTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  const key = [`/api/farms/${farmId}/spray-store-inspections`];
  const dataQ = useQuery({ queryKey: key, queryFn: () => fetch(`/api/farms/${farmId}/spray-store-inspections`).then((r) => r.json()) });
  const records = dataQ.data?.records ?? [];
  const emptyInspection = {
    inspectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    inspectedById: "__none__",
    inspectedByName: "",
    inspectionType: "routine",
    storeLocation: "",
    passed: true,
    locked: true,
    bunded: false,
    emergencyCardPosted: true,
    coshhAssessed: true,
    signagePresent: true,
    ventilationAdequate: true,
    separateFromSeed: true,
    noObviousLeaks: true,
    conditionNotes: "",
    actionRequired: "",
    actionDueDate: "",
    nextInspectionDue: "",
    notes: ""
  };
  const [form, setForm] = reactExports.useState(emptyInspection);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRec, setEditRec] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  function openAdd() {
    setEditRec(null);
    setForm(emptyInspection);
    setAddOpen(true);
  }
  function openEdit(r) {
    setEditRec(r);
    setForm({
      inspectionDate: r.inspectionDate ? String(r.inspectionDate).slice(0, 10) : "",
      inspectedById: r.inspectedById ? String(r.inspectedById) : "__none__",
      inspectedByName: r.inspectedByName ?? "",
      inspectionType: r.inspectionType ?? "routine",
      storeLocation: r.storeLocation ?? "",
      passed: r.passed !== false,
      locked: !!r.locked,
      bunded: !!r.bunded,
      emergencyCardPosted: !!r.emergencyCardPosted,
      coshhAssessed: !!r.coshhAssessed,
      signagePresent: !!r.signagePresent,
      ventilationAdequate: !!r.ventilationAdequate,
      separateFromSeed: !!r.separateFromSeed,
      noObviousLeaks: !!r.noObviousLeaks,
      conditionNotes: r.conditionNotes ?? "",
      actionRequired: r.actionRequired ?? "",
      actionDueDate: r.actionDueDate ? String(r.actionDueDate).slice(0, 10) : "",
      nextInspectionDue: r.nextInspectionDue ? String(r.nextInspectionDue).slice(0, 10) : "",
      notes: r.notes ?? ""
    });
    setAddOpen(true);
  }
  function buildBody() {
    const { inspectedById, ...rest } = form;
    const checksPassed = CHECKLIST_FIELDS.every((f) => !!form[f.key]);
    return {
      ...rest,
      inspectedById: inspectedById && inspectedById !== "__none__" ? Number(inspectedById) : null,
      passed: checksPassed,
      actionDueDate: rest.actionDueDate || null,
      nextInspectionDue: rest.nextInspectionDue || null
    };
  }
  const createMut = useMutation({
    mutationFn: (b) => fetch(`/api/farms/${farmId}/spray-store-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Inspection saved" });
      qc.invalidateQueries({ queryKey: key });
      setAddOpen(false);
    },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, b }) => fetch(`/api/farms/${farmId}/spray-store-inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Inspection updated" });
      qc.invalidateQueries({ queryKey: key });
      setAddOpen(false);
    },
    onError: () => toast({ title: "Error updating inspection", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/spray-store-inspections/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: key });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Error deleting", variant: "destructive" })
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", color: "#1e293b" }, children: "Pesticide Store Inspections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#64748b", marginTop: 2 }, children: "Record routine and pre/post-season inspections of your pesticide store." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        "Log Inspection"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, marginBottom: 4 }, children: "No inspections recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem" }, children: "Regular store inspections demonstrate good stewardship and are required by some assurance schemes." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Type", "Location", "Inspector", "Outcome", "Next Due", "Actions", ""].map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.75rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }, children: h }, i)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const itype = INSPECTION_TYPES.find((t) => t.value === r.inspectionType);
        const inspector = r.inspectedById ? memberFullName(members.find((m) => m.id === r.inspectedById)) : r.inspectedByName;
        const nextDue = r.nextInspectionDue ? new Date(r.nextInspectionDue) : null;
        const overdue = nextDue && nextDue < /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", whiteSpace: "nowrap" }, children: r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: "#f1f5f9", color: "#475569", fontSize: "0.72rem", fontWeight: 600, borderRadius: 4, padding: "2px 6px" }, children: itype?.label ?? r.inspectionType }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }, children: r.storeLocation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#374151", fontSize: "0.8rem" }, children: inspector || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.passed === true ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: "#f0fdf4", color: "#15803d", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "2px 7px" }, children: "Pass" }) : r.passed === false ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 3, background: "#fef2f2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, borderRadius: 4, padding: "2px 7px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 10 }),
            " Fail"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af", fontSize: "0.72rem" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: nextDue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: overdue ? "#dc2626" : "#374151", fontWeight: overdue ? 700 : 400 }, children: [
            overdue ? "⚠ " : "",
            nextDue.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280", fontSize: "0.78rem", maxWidth: 200 }, children: r.actionRequired || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditRec(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 600, maxHeight: "88vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editRec ? "Edit" : "Log",
        " Store Inspection"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Inspection Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.inspectionDate, onChange: (e) => set("inspectionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspection Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inspectionType, onValueChange: (v) => set("inspectionType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INSPECTION_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector (Farm Member)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inspectedById, onValueChange: (v) => set("inspectedById", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { fontSize: "0.8rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "External / manual entry" }),
                members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.id), children: memberFullName(m) }, m.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inspector Name (if external)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of external inspector", value: form.inspectedByName, onChange: (e) => set("inspectedByName", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Store Location / Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Locked chemical store, north side of grain store", value: form.storeLocation, onChange: (e) => set("storeLocation", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #e5e7eb", paddingTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { marginBottom: "0.5rem", display: "block", fontWeight: 700 }, children: "Compliance Checklist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: CHECKLIST_FIELDS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: `chk_${f.key}`, checked: !!form[f.key], onChange: (e) => set(f.key, e.target.checked), style: { width: 16, height: 16, cursor: "pointer", accentColor: "#16a34a" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `chk_${f.key}`, style: { fontSize: "0.83rem", cursor: "pointer" }, children: f.label })
          ] }, f.key)) }),
          !CHECKLIST_FIELDS.every((f) => !!form[f.key]) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.78rem", color: "#991b1b" }, children: [
            "One or more checklist items not met — this inspection will be recorded as a ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Fail" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.conditionNotes, onChange: (e) => set("conditionNotes", e.target.value), rows: 2, placeholder: "Describe general condition of the store…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionRequired, onChange: (e) => set("actionRequired", e.target.value), rows: 2, placeholder: "List any corrective actions needed…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.actionDueDate, onChange: (e) => set("actionDueDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Inspection Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextInspectionDue, onChange: (e) => set("nextInspectionDue", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Additional Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Any other relevant notes…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => {
          setAddOpen(false);
          setEditRec(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50",
            disabled: !form.inspectionDate || createMut.isPending || updateMut.isPending,
            onClick: () => editRec ? updateMut.mutate({ id: editRec.id, b: buildBody() }) : createMut.mutate(buildBody()),
            children: createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Log Inspection"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Inspection Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Permanently delete this inspection record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "border rounded-md px-4 py-2 text-sm hover:bg-gray-50", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50", disabled: deleteMut.isPending, onClick: () => deleteId !== null && deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  SprayPage as default
};
