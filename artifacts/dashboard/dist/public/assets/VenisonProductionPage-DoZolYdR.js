import { r as reactExports, l as useQuery, j as jsxRuntimeExports, b as useAppStore, t as useQueryClient, a as useToast, O as useMutation, d as LoaderCircle, c as Button, S as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, C as Checkbox, J as DialogFooter } from "./index-Da1xbYWs.js";
import { R as RecordAttachments } from "./RecordAttachments-I8jzrEE0.js";
import { D as DocAttach } from "./DocAttach-CZEEGhlu.js";
import { P as Printer } from "./printer-2fBIaI0z.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar, C as Cell } from "./generateCategoricalChart-B8Bzi8HX.js";
import { C as ComposedChart } from "./ComposedChart-CwheKIVJ.js";
import { C as CartesianGrid } from "./CartesianGrid-C117sm9W.js";
import { L as Line } from "./Line-6V4L0J1Q.js";
import { T as Target } from "./target-DuGNl609.js";
import { C as ChevronUp } from "./chevron-up-C3rQLlSP.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-fIC7ZN6Z.js";
import { A as AppLayout, _ as Crosshair, U as Users, H as HeartPulse, e as ChartColumn } from "./AppLayout-C-qpnNQg.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-MXpfe6Jl.js";
import { T as Textarea } from "./textarea-Ck6gciO9.js";
import { B as Badge } from "./badge-C28LJMzY.js";
import { S as ShoppingCart } from "./shopping-cart-BIvp-N5M.js";
import { S as ShieldCheck } from "./shield-check-W6fpkzUW.js";
import { E as Eye } from "./eye-Cx3tGwKg.js";
import { P as Pencil } from "./pencil-DbQJQVgl.js";
import { T as TriangleAlert } from "./triangle-alert-CnSAkVrx.js";
import { P as PieChart, a as Pie } from "./PieChart-DVm4Veu2.js";
import { B as BarChart } from "./BarChart-CWqjKfV_.js";
import "./use-upload-DLSCbrCl.js";
import "./paperclip-BFUCc7pM.js";
import "./upload-DeD5jwhH.js";
import "./image-Dgzlbr-S.js";
import "./shield-alert-Cdl89hNi.js";
import "./download-CGHsUWE7.js";
import "./use-safe-clerk-DUKO-GVj.js";
import "./database-D2UCOeNZ.js";
import "./tractor-CMNQaHgz.js";
import "./index-GdpXai7i.js";
import "./index-6J-a-cHk.js";
function fmtGbp$1(v) {
  return `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate$1(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function monthLabel(m) {
  return (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
function isStag(sex) {
  return /stag|buck/i.test(sex ?? "");
}
function isHind(sex) {
  return /hind|doe/i.test(sex ?? "");
}
const PRINT_ID = "venison-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}
function Collapsible({ title, open, setOpen, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children })
  ] });
}
function KpiCard({ label, value, sub, highlight }) {
  const cls = highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : highlight === "amber" ? "border-amber-200 bg-amber-50/50" : "border-border bg-card";
  const vCls = highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : highlight === "amber" ? "text-amber-700" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${vCls}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      typeof p.value === "number" && p.name.toLowerCase().includes("kg") ? `${p.value.toLocaleString("en-GB")} kg` : typeof p.value === "number" ? p.value.toLocaleString("en-GB") : p.value
    ] }, p.name))
  ] });
};
function VenisonEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data: cullRaw, isLoading: cullLoading } = useQuery({
    queryKey: ["venison-cull", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/venison-cull-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: salesRaw, isLoading: salesLoading } = useQuery({
    queryKey: ["venison-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/venison-carcass-sales`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allCull = reactExports.useMemo(() => Array.isArray(cullRaw) ? cullRaw : cullRaw?.records ?? [], [cullRaw]);
  const allSales = reactExports.useMemo(() => Array.isArray(salesRaw) ? salesRaw : salesRaw?.records ?? [], [salesRaw]);
  const years = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    allCull.forEach((r) => {
      const y = parseInt(String(r.cullDate ?? "").slice(0, 4));
      if (y) s.add(y);
    });
    allSales.forEach((r) => {
      const y = parseInt(String(r.saleDate ?? "").slice(0, 4));
      if (y) s.add(y);
    });
    if (!s.size) s.add(currentYear);
    return Array.from(s).sort((a, b) => b - a);
  }, [allCull, allSales, currentYear]);
  const cull = reactExports.useMemo(() => allCull.filter((r) => String(r.cullDate ?? "").startsWith(String(year))), [allCull, year]);
  const sales = reactExports.useMemo(() => allSales.filter((r) => String(r.saleDate ?? "").startsWith(String(year))), [allSales, year]);
  const totalCullCarcassKg = reactExports.useMemo(() => cull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [cull]);
  const totalSalesValueGbp = reactExports.useMemo(() => sales.reduce((s, r) => s + (Number(r.totalValueGbp) || 0), 0), [sales]);
  const totalCarcassesSold = reactExports.useMemo(() => sales.reduce((s, r) => s + (Number(r.numberCarcasses) || 0), 0), [sales]);
  const avgKillout = reactExports.useMemo(() => {
    const valid = cull.filter((r) => r.killoutPercent);
    return valid.length ? valid.reduce((s, r) => s + (parseFloat(String(r.killoutPercent)) || 0), 0) / valid.length : null;
  }, [cull]);
  const stagCull = reactExports.useMemo(() => cull.filter((r) => isStag(r.sex)), [cull]);
  const hindCull = reactExports.useMemo(() => cull.filter((r) => isHind(r.sex)), [cull]);
  const otherCull = reactExports.useMemo(() => cull.filter((r) => !isStag(r.sex) && !isHind(r.sex)), [cull]);
  const stagKg = reactExports.useMemo(() => stagCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [stagCull]);
  const hindKg = reactExports.useMemo(() => hindCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [hindCull]);
  const monthlyChart = reactExports.useMemo(() => {
    const map = {};
    cull.forEach((r) => {
      const m = String(r.cullDate ?? "").slice(0, 7);
      if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { cullCount: 0, carcassKg: 0, salesValue: 0 };
      map[m].cullCount++;
      map[m].carcassKg += parseFloat(String(r.carcassWeightKg)) || 0;
    });
    sales.forEach((r) => {
      const m = String(r.saleDate ?? "").slice(0, 7);
      if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { cullCount: 0, carcassKg: 0, salesValue: 0 };
      map[m].salesValue += Number(r.totalValueGbp) || 0;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Culls": v.cullCount,
      "Carcass (kg)": Math.round(v.carcassKg),
      "Sales Value (£)": parseFloat(v.salesValue.toFixed(2))
    }));
  }, [cull, sales]);
  const speciesBreakdown = reactExports.useMemo(() => {
    const map = {};
    cull.forEach((r) => {
      const sp = r.species || "Unknown";
      if (!map[sp]) map[sp] = { culls: 0, kgTotal: 0 };
      map[sp].culls++;
      map[sp].kgTotal += parseFloat(String(r.carcassWeightKg)) || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].culls - a[1].culls).map(([species, v]) => ({ species, ...v }));
  }, [cull]);
  const isLoading = cullLoading || salesLoading;
  const hasData = cull.length > 0 || sales.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Venison Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cull summary · Stalking season split · Carcass sales & revenue" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          ensurePrintStyle();
          window.print();
        }, className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" }) : !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No cull or sale records found for ",
      year,
      ". Add cull records and carcass sales to generate this report."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Total Culls", value: String(cull.length), sub: `${totalCullCarcassKg > 0 ? `${totalCullCarcassKg.toFixed(1)} kg total carcass` : "No weights recorded"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Stag / Buck", value: String(stagCull.length), sub: stagKg > 0 ? `${stagKg.toFixed(1)} kg carcass` : "—", highlight: "amber" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Hind / Doe", value: String(hindCull.length), sub: hindKg > 0 ? `${hindKg.toFixed(1)} kg carcass` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Avg Kill-out %", value: avgKillout != null ? `${avgKillout.toFixed(1)}%` : "—", sub: avgKillout != null ? avgKillout >= 55 ? "Good yield" : avgKillout >= 50 ? "Average" : "Below target" : "No data", highlight: avgKillout != null && avgKillout >= 55 ? "emerald" : void 0 })
      ] }),
      totalSalesValueGbp > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Carcass Sales", value: String(sales.length), sub: `${totalCarcassesSold} carcasses sold` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Total Revenue", value: fmtGbp$1(totalSalesValueGbp), sub: totalCarcassesSold > 0 ? `${fmtGbp$1(totalSalesValueGbp / totalCarcassesSold)}/carcass avg` : "—", highlight: "emerald" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiCard,
          {
            label: "Revenue / kg (carcass)",
            value: totalCullCarcassKg > 0 ? `${fmtGbp$1(totalSalesValueGbp / totalCullCarcassKg)}/kg` : "—",
            sub: "sales value ÷ total carcass kg culled"
          }
        )
      ] }),
      monthlyChart.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Monthly Cull Volume & Revenue — ",
          year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: monthlyChart, margin: { top: 4, right: 12, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, width: 40, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, width: 55, tickFormatter: (v) => `£${v.toFixed(0)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "Culls", fill: "#15803d", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "Carcass (kg)", fill: "#92400e", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "Sales Value (£)", stroke: "#3b82f6", strokeWidth: 2, dot: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
              "Stalking Season Split — ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: "Stag/Buck vs Hind/Doe cull breakdown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Class" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Culls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Carcass (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Avg Wt (kg)" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
              { label: "Stag / Buck", culls: stagCull, kg: stagKg, cls: "text-amber-700" },
              { label: "Hind / Doe", culls: hindCull, kg: hindKg, cls: "" },
              ...otherCull.length > 0 ? [{ label: "Other / Unknown", culls: otherCull, kg: otherCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), cls: "text-foreground/40" }] : [],
              { label: "Total", culls: cull, kg: totalCullCarcassKg, cls: "font-semibold", bold: true }
            ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t border-border/40 ${row.bold ? "bg-muted/20 font-semibold" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.cls}`, children: row.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.culls.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.kg > 0 ? row.kg.toFixed(1) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50", children: row.culls.length > 0 && row.kg > 0 ? `${(row.kg / row.culls.length).toFixed(1)} kg` : "—" })
            ] }, i)) })
          ] })
        ] }),
        speciesBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
            "Cull by Species — ",
            year
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Species" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Culls" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Carcass (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Avg (kg)" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: speciesBreakdown.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: row.species }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.culls }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.kgTotal > 0 ? row.kgTotal.toFixed(1) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50", children: row.culls > 0 && row.kgTotal > 0 ? `${(row.kgTotal / row.culls).toFixed(1)}` : "—" })
            ] }, i)) })
          ] })
        ] })
      ] }),
      sales.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Carcass Sales Summary — ",
          year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Value" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: "Sale records" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: sales.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: "Total carcasses sold" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: totalCarcassesSold })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: "Total weight sold (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right", children: [
                sales.reduce((s, r) => s + (parseFloat(String(r.totalWeightKg)) || 0), 0).toFixed(1),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-semibold", children: "Total sales revenue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-bold text-emerald-700", children: fmtGbp$1(totalSalesValueGbp) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Stalker fees, larder processing, transport, and vet costs should be added via Financial for a complete P&L." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Collapsible,
        {
          title: `Cull Records (${cull.length} culls · ${totalCullCarcassKg > 0 ? `${totalCullCarcassKg.toFixed(1)} kg carcass` : "no weights"})`,
          open: openSection === "cull",
          setOpen: (v) => toggle(v ? "cull" : ""),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Stalker" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Species" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Sex" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Age Class" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Carcass (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Kill-out %" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Food Safety" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cull.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: fmtDate$1(r.cullDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.stalkerName || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: r.species || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.sex || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.ageClass || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.carcassWeightKg ? `${parseFloat(String(r.carcassWeightKg)).toFixed(1)}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.killoutPercent ? `${r.killoutPercent}%` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-xs max-w-[160px] truncate", children: String(r.foodSafetyInspectionResult || "—").split("—")[0].trim() || "—" })
            ] }, r.id)) })
          ] })
        }
      ),
      sales.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Collapsible,
        {
          title: `Sale Records (${sales.length} · ${totalCarcassesSold} carcasses · ${fmtGbp$1(totalSalesValueGbp)})`,
          open: openSection === "sales",
          setOpen: (v) => toggle(v ? "sales" : ""),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Species" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Carcasses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Weight (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/kg" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Destination" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Value" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sales.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: fmtDate$1(r.saleDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.species || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.numberCarcasses ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.totalWeightKg ? `${parseFloat(String(r.totalWeightKg)).toFixed(1)}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.pricePerKgGbp ? `£${parseFloat(String(r.pricePerKgGbp)).toFixed(2)}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-1.5", children: [
                r.destinationType || "—",
                r.buyerName ? ` — ${r.buyerName}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: r.totalValueGbp ? fmtGbp$1(Number(r.totalValueGbp)) : "—" })
            ] }, r.id)) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-foreground/50 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Stalker fees, transport, larder processing, and veterinary costs are not tracked in cull/sale records. Add these via the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Financial" }),
          " module for a complete enterprise P&L."
        ] })
      ] })
    ] })
  ] });
}
const api = (path) => `/api/${path}`;
const DEER_SPECIES = ["Red Deer", "Roe Deer", "Fallow Deer", "Sika Deer", "Muntjac", "Chinese Water Deer", "Reindeer", "Other"];
const VEN_COLORS = ["#15803d", "#92400e", "#1d4ed8", "#7c3aed", "#b91c1c", "#0e7490", "#6d28d9"];
const CULL_REASONS = ["Population management (annual cull plan)", "Damage control", "Welfare — injured or sick", "Sporting cull", "Licenced out-of-season emergency"];
const FOOD_SAFETY_RESULTS = ["Passed — clean bill of health", "Conditionally passed — abnormality noted, parts condemned", "Failed — carcass condemned", "Not inspected / not for human consumption"];
const AGE_CLASSES = ["Calf / Fawn / Kid", "Yearling (Pricket / Knobber)", "Adult", "Unknown"];
const SEX_OPTIONS = ["Stag", "Hind", "Buck", "Doe", "Calf", "Fawn", "Kid", "Unknown"];
const CULL_METHODS = ["Rifle (stalking)", "Driven / sika drive", "Trap (licensed)"];
const FACILITY_TYPES = ["On-farm approved larder", "AGHE (Approved Game Handling Establishment)", "Licensed Game Handling Establishment (GHE)", "Direct on-farm slaughter"];
const DESTINATION_TYPES = ["Game dealer", "Butcher / butchery", "Wholesale", "Direct consumer sale", "Restaurant / catering", "Export", "Own consumption"];
const SURVEY_METHODS = ["Driven count", "Thermal imaging (ground-based)", "Fixed point count (vantage point)", "ADE count (aerial)", "Thermal drone survey", "Camera trap census"];
const HEALTH_EVENT_TYPES = ["Vaccination", "Vet visit / health check", "bTB skin test (SICCT)", "bTB gamma-interferon blood test", "Post mortem examination", "Worming treatment", "Parasite treatment", "Other vet treatment"];
const BTB_RESULTS = ["Clear / negative", "Standard reactor", "Inconclusive reactor", "Not applicable"];
const CERT_TYPES = [
  "Section 1 Firearms Certificate (FC)",
  "Section 2 Shotgun Certificate (SGC)",
  "Deer Stalking Certificate Level 1 (DSC1)",
  "Deer Stalking Certificate Level 2 (DSC2)",
  "Scottish Stalking Certificate",
  "Hunter Food Hygiene Certificate (WGMI)",
  "Larder Hygiene Certificate",
  "Other"
];
function VPTabBar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-wrap border-b border-border mb-4 pb-2", children });
}
function VPTabButton({ active, onClick, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      className: `px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`,
      children
    }
  );
}
function VPEmptyState({ icon: Icon, message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: message })
  ] });
}
function VPKpiCard({ label, value, bg, text, sub }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${bg} rounded-xl border p-4 text-center`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${text}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${sub}`, children: label })
  ] });
}
const fmt = (val) => val == null || val === "" ? "—" : String(val);
const fmtDate = (val) => {
  if (!val) return "—";
  try {
    return new Date(String(val)).toLocaleDateString("en-GB");
  } catch {
    return String(val);
  }
};
const fmtGbp = (val) => {
  if (!val) return "—";
  return `£${Number(val).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
function VPFieldView({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: value || "—" })
  ] });
}
function HerdsTab({ farmId }) {
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then((r) => r.json())
  });
  const deerHerds = herds.filter(
    (h) => /deer|venison|fallow|red|roe|sika|muntjac|chinese water|reindeer/i.test(String(h.species || "")) || /deer|venison/i.test(String(h.name || ""))
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Deer Herd Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Deer herds are registered in ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Livestock → Herds & Animals" }),
        ". Set the species to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Deer" }),
        " (or a specific deer species) when creating a herd. All records in this Venison Production module link back to herds from that register."
      ] })
    ] }),
    deerHerds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: Crosshair, message: "No deer herds found. Add a deer herd in Livestock → Herds & Animals first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: deerHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: h.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: h.status || "Active" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Species:" }),
          " ",
          fmt(h.species)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Breed:" }),
          " ",
          fmt(h.breed)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "CPH:" }),
          " ",
          fmt(h.herdNumber)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Purpose:" }),
          " ",
          fmt(h.purpose)
        ] })
      ] })
    ] }, h.id)) })
  ] });
}
function CullRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-cull", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-cull-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/venison-cull-records${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-cull", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/venison-cull-records/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-cull", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.cullDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => String(r.cullDate || "").startsWith(yearFilter)), [records, yearFilter]);
  const totalCarcassKg = filtered.reduce((s, r) => s + (Number(r.carcassWeightKg) || 0), 0);
  const foodSafetyIssues = filtered.filter((r) => String(r.foodSafetyInspectionResult || "").toLowerCase().includes("fail") || String(r.foodSafetyInspectionResult || "").toLowerCase().includes("condemn")).length;
  const notifiable = filtered.filter((r) => r.notifiableDiseaseSupect).length;
  const printCullRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cull Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}h2{margin-bottom:8px}</style></head><body><h2>Stalking & Cull Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Stalker</th><th>Species</th><th>Sex</th><th>Age Class</th><th>Carcass Wt (kg)</th><th>Kill-out %</th><th>Food Safety</th><th>Notifiable</th></tr></thead><tbody>${filtered.map((r) => `<tr><td>${fmtDate(r.cullDate)}</td><td>${fmt(r.stalkerName)}</td><td>${fmt(r.species)}</td><td>${fmt(r.sex)}</td><td>${fmt(r.ageClass)}</td><td>${fmt(r.carcassWeightKg)}</td><td>${r.killoutPercent ? r.killoutPercent + "%" : "—"}</td><td>${fmt(r.foodSafetyInspectionResult)}</td><td>${r.notifiableDiseaseSupect ? "Yes" : "No"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Cull Records", value: filtered.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Carcass Wt (kg)", value: totalCarcassKg > 0 ? `${totalCarcassKg.toFixed(1)} kg` : "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Food Safety Issues", value: foodSafetyIssues || "None", bg: foodSafetyIssues > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100", text: foodSafetyIssues > 0 ? "text-red-800" : "text-gray-700", sub: foodSafetyIssues > 0 ? "text-red-600" : "text-gray-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Notifiable Suspect", value: notifiable || "None", bg: notifiable > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100", text: notifiable > 0 ? "text-red-800" : "text-gray-700", sub: notifiable > 0 ? "text-red-600" : "text-gray-500" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Stalking & Cull Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printCullRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => open("add"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Cull Record"
        ] })
      ] })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: Crosshair, message: "No cull records yet. Add your first stalking or cull record above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Date", "Stalker", "Species", "Sex / Age", "Carcass Wt (kg)", "Kill-out %", "Food Safety", "Notifiable", "", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.cullDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.stalkerName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          fmt(r.sex),
          " / ",
          fmt(r.ageClass)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.carcassWeightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.killoutPercent ? `${r.killoutPercent}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: `text-xs ${String(r.foodSafetyInspectionResult || "").includes("Passed") ? "bg-green-100 text-green-800 border-green-200" : String(r.foodSafetyInspectionResult || "").includes("Failed") || String(r.foodSafetyInspectionResult || "").includes("condemn") ? "bg-red-100 text-red-800 border-red-200" : "bg-amber-100 text-amber-800 border-amber-200"}`,
            children: String(r.foodSafetyInspectionResult || "—").split("—")[0].trim() || "—"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.notifiableDiseaseSupect ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold", children: "⚠ Yes" }) : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "venison-cull-records", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["venison-cull", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Cull Record" : dlg.mode === "edit" ? "Edit Cull Record" : "Add Cull Record" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Cull Date", value: fmtDate(dlg.row.cullDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Stalker Name", value: fmt(dlg.row.stalkerName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Species", value: fmt(dlg.row.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Sex", value: fmt(dlg.row.sex) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Age Class", value: fmt(dlg.row.ageClass) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Location / Beat", value: fmt(dlg.row.locationBeat) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Larder No.", value: fmt(dlg.row.larderNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Carcass No.", value: fmt(dlg.row.carcassNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Liveweight (kg)", value: fmt(dlg.row.liveweightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Gralloch Wt (kg)", value: fmt(dlg.row.grallochWeightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Carcass Wt (kg)", value: fmt(dlg.row.carcassWeightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Kill-out %", value: dlg.row.killoutPercent ? `${dlg.row.killoutPercent}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Cull Method", value: fmt(dlg.row.cullMethod) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Cull Reason", value: fmt(dlg.row.cullReason) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Food Safety Inspection", value: fmt(dlg.row.foodSafetyInspectionResult) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notifiable Disease Suspect", value: dlg.row.notifiableDiseaseSupect ? "Yes — APHA notified" : "No" }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) }),
        dlg.row.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "venison-cull", recordId: dlg.row.id }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cull Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.cullDate || ""), onChange: (e) => sf("cullDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stalker Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name", value: String(form.stalkerName || ""), onChange: (e) => sf("stalkerName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.species || ""), onValueChange: (v) => sf("species", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEER_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.sex || ""), onValueChange: (v) => sf("sex", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select sex" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEX_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Age Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.ageClass || ""), onValueChange: (v) => sf("ageClass", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select age class" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AGE_CLASSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId || ""), onValueChange: (v) => sf("herdId", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location / Beat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North beat, East block", value: String(form.locationBeat || ""), onChange: (e) => sf("locationBeat", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Larder Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. L001", value: String(form.larderNumber || ""), onChange: (e) => sf("larderNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carcass Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. C2025-001", value: String(form.carcassNumber || ""), onChange: (e) => sf("carcassNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Liveweight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.liveweightKg || ""), onChange: (e) => sf("liveweightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gralloch Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.grallochWeightKg || ""), onChange: (e) => sf("grallochWeightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carcass Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.carcassWeightKg || ""), onChange: (e) => sf("carcassWeightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kill-out %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.killoutPercent || ""), onChange: (e) => sf("killoutPercent", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cull Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.cullMethod || ""), onValueChange: (v) => sf("cullMethod", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CULL_METHODS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cull Reason *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.cullReason || ""), onValueChange: (v) => sf("cullReason", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CULL_REASONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Food Safety Inspection Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.foodSafetyInspectionResult || ""), onValueChange: (v) => sf("foodSafetyInspectionResult", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FOOD_SAFETY_RESULTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: Boolean(form.notifiableDiseaseSupect), onCheckedChange: (v) => sf("notifiableDiseaseSupect", v), id: "nd-cull" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nd-cull", className: "text-sm", children: "Notifiable disease suspected — contact APHA on 03000 200 301" })
        ] }),
        form.notifiableDiseaseSupect && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline w-4 h-4 mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "APHA Advisory:" }),
          " If you suspect a notifiable disease (e.g. TB, foot-and-mouth, bluetongue), you must contact APHA immediately on ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "03000 200 301" }),
          ". Mandatory notification must be made before laboratory confirmation."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }),
          disabled: mutSave.isPending || !form.cullDate || !form.species || !form.cullReason,
          children: [
            mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
            dlg.mode === "edit" ? "Update" : "Save"
          ]
        }
      ) })
    ] }) })
  ] });
}
function CarcassSalesTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-sales", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-carcass-sales`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/venison-carcass-sales${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-sales", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/venison-carcass-sales/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-sales", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const salesYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.saleDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [salesYearFilter, setSalesYearFilter] = reactExports.useState("all");
  const filteredSales = reactExports.useMemo(() => salesYearFilter === "all" ? records : records.filter((r) => String(r.saleDate || "").startsWith(salesYearFilter)), [records, salesYearFilter]);
  const totalValue = filteredSales.reduce((s, r) => s + (Number(r.totalValueGbp) || 0), 0);
  const totalCarcasses = filteredSales.reduce((s, r) => s + (Number(r.numberCarcasses) || 0), 0);
  const printSalesRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carcass Sales</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Carcass Sales${salesYearFilter !== "all" ? ` — ${salesYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Facility</th><th>Species</th><th>Carcasses</th><th>Grade</th><th>Destination / Buyer</th><th>Weight (kg)</th><th>Value</th></tr></thead><tbody>${filteredSales.map((r) => `<tr><td>${fmtDate(r.saleDate)}</td><td>${fmt(r.facilityType)}</td><td>${fmt(r.species)}</td><td>${fmt(r.numberCarcasses)}</td><td>${fmt(r.gradeOrQuality)}</td><td>${fmt(r.destinationType)}${r.buyerName ? ` — ${r.buyerName}` : ""}</td><td>${fmt(r.totalWeightKg)}</td><td>${r.totalValueGbp ? fmtGbp(r.totalValueGbp) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Sale Records", value: filteredSales.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Carcasses Sold", value: totalCarcasses || "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Sales Value", value: totalValue > 0 ? fmtGbp(totalValue) : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Carcass Processing & Venison Sales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: salesYearFilter, onValueChange: setSalesYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            salesYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printSalesRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => open("add"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Sale Record"
        ] })
      ] })
    ] }),
    filteredSales.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: ShoppingCart, message: "No sale records yet. Record your first venison sale or carcass processing event above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Date", "Facility", "Species", "Carcasses", "Grade", "Destination / Buyer", "Weight (kg)", "Value", "", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredSales.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.saleDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs max-w-[140px] truncate", children: fmt(r.facilityType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: fmt(r.numberCarcasses) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: String(r.gradeOrQuality || "—").split("—")[0].trim() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          fmt(r.destinationType),
          r.buyerName ? ` — ${r.buyerName}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.totalWeightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: r.totalValueGbp ? fmtGbp(r.totalValueGbp) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "venison-carcass-sales", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["venison-sales", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Carcass Sale Record" : dlg.mode === "edit" ? "Edit Sale Record" : "Add Sale Record" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Sale Date", value: fmtDate(dlg.row.saleDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Facility Type", value: fmt(dlg.row.facilityType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Species", value: fmt(dlg.row.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Number of Carcasses", value: fmt(dlg.row.numberCarcasses) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Carcass Numbers", value: fmt(dlg.row.carcassNumbers) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Grade / Quality", value: fmt(dlg.row.gradeOrQuality) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Destination", value: fmt(dlg.row.destinationType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Buyer / Game Dealer", value: fmt(dlg.row.buyerName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Price per kg (£)", value: dlg.row.pricePerKgGbp ? `£${dlg.row.pricePerKgGbp}/kg` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Total Weight (kg)", value: fmt(dlg.row.totalWeightKg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Total Value", value: fmtGbp(dlg.row.totalValueGbp) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Invoice Reference", value: fmt(dlg.row.invoiceReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Wild Game Declaration No.", value: fmt(dlg.row.wildGameDeclarationNumber) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) }),
        dlg.row.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "venison-carcass-sales", recordId: dlg.row.id }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sale Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.saleDate || ""), onChange: (e) => sf("saleDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.species || ""), onValueChange: (v) => sf("species", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEER_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Facility Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.facilityType || ""), onValueChange: (v) => sf("facilityType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select facility" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FACILITY_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Carcasses *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.numberCarcasses || ""), onChange: (e) => sf("numberCarcasses", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Carcass Numbers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. C001, C002, C003", value: String(form.carcassNumbers || ""), onChange: (e) => sf("carcassNumbers", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade / Quality" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.gradeOrQuality || ""), onValueChange: (v) => sf("gradeOrQuality", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["A — Premium grade", "B — Standard grade", "C — Out-grade / manufacturing", "Not graded"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.destinationType || ""), onValueChange: (v) => sf("destinationType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select destination" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DESTINATION_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer / Game Dealer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of buyer or game dealer", value: String(form.buyerName || ""), onChange: (e) => sf("buyerName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price per kg (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: String(form.pricePerKgGbp || ""), onChange: (e) => sf("pricePerKgGbp", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.totalWeightKg || ""), onChange: (e) => sf("totalWeightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Value (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", placeholder: "0.00", value: String(form.totalValueGbp || ""), onChange: (e) => sf("totalValueGbp", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Invoice number", value: String(form.invoiceReference || ""), onChange: (e) => sf("invoiceReference", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wild Game Declaration No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "WGD reference number", value: String(form.wildGameDeclarationNumber || ""), onChange: (e) => sf("wildGameDeclarationNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }),
          disabled: mutSave.isPending || !form.saleDate || !form.facilityType || !form.numberCarcasses || !form.destinationType,
          children: [
            mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
            dlg.mode === "edit" ? "Update" : "Save"
          ]
        }
      ) })
    ] }) })
  ] });
}
function HerdMonitoringTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-herd-monitoring`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/venison-herd-monitoring${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-monitoring", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/venison-herd-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-monitoring", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const monYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.surveyDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [monYearFilter, setMonYearFilter] = reactExports.useState("all");
  const filteredMon = reactExports.useMemo(() => monYearFilter === "all" ? records : records.filter((r) => String(r.surveyDate || "").startsWith(monYearFilter)), [records, monYearFilter]);
  const printMonitoring = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Herd Monitoring</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Herd Monitoring Surveys${monYearFilter !== "all" ? ` — ${monYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Method</th><th>Species</th><th>Males</th><th>Females</th><th>Young</th><th>Total</th><th>M:F Ratio</th><th>Recruitment %</th></tr></thead><tbody>${filteredMon.map((r) => `<tr><td>${fmtDate(r.surveyDate)}</td><td>${fmt(r.surveyMethod)}</td><td>${fmt(r.species)}</td><td>${fmt(r.maleCount)}</td><td>${fmt(r.femaleCount)}</td><td>${fmt(r.youngCount)}</td><td>${fmt(r.totalCount)}</td><td>${fmt(r.maleFemaleRatio)}</td><td>${r.recruitmentRatePercent ? r.recruitmentRatePercent + "%" : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Herd Population Surveys" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monYearFilter, onValueChange: setMonYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            monYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMonitoring, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => open("add"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Survey"
        ] })
      ] })
    ] }),
    filteredMon.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: Users, message: "No monitoring surveys yet. Record your first population count or herd survey above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Survey Date", "Method", "Species", "Males", "Females", "Young", "Total", "M:F Ratio", "Recruitment %", "", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredMon.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.surveyDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.surveyMethod) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: fmt(r.maleCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: fmt(r.femaleCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: fmt(r.youngCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center font-medium", children: fmt(r.totalCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.maleFemaleRatio) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.recruitmentRatePercent ? `${r.recruitmentRatePercent}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "venison-herd-monitoring", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["venison-monitoring", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Herd Survey" : dlg.mode === "edit" ? "Edit Survey" : "Add Herd Survey" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Survey Date", value: fmtDate(dlg.row.surveyDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Survey Method", value: fmt(dlg.row.surveyMethod) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Species", value: fmt(dlg.row.species) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Male Count (stags/bucks)", value: fmt(dlg.row.maleCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Female Count (hinds/does)", value: fmt(dlg.row.femaleCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Young Count (calves/fawns)", value: fmt(dlg.row.youngCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Total Count", value: fmt(dlg.row.totalCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Male:Female Ratio", value: fmt(dlg.row.maleFemaleRatio) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Recruitment Rate %", value: dlg.row.recruitmentRatePercent ? `${dlg.row.recruitmentRatePercent}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Observed By", value: fmt(dlg.row.observedBy) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Weather Conditions", value: fmt(dlg.row.weatherConditions) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) }),
        dlg.row.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "venison-herd-monitoring", recordId: dlg.row.id }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Survey Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.surveyDate || ""), onChange: (e) => sf("surveyDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.species || ""), onValueChange: (v) => sf("species", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select species" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEER_SPECIES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Survey Method *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.surveyMethod || ""), onValueChange: (v) => sf("surveyMethod", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SURVEY_METHODS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId || ""), onValueChange: (v) => sf("herdId", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Observed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name of observer", value: String(form.observedBy || ""), onChange: (e) => sf("observedBy", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Male Count (stags/bucks)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.maleCount || ""), onChange: (e) => sf("maleCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Female Count (hinds/does)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.femaleCount || ""), onChange: (e) => sf("femaleCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Young Count (calves/fawns)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.youngCount || ""), onChange: (e) => sf("youngCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.totalCount || ""), onChange: (e) => sf("totalCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Male:Female Ratio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. 1:3.5", value: String(form.maleFemaleRatio || ""), onChange: (e) => sf("maleFemaleRatio", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recruitment Rate %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "0.0", value: String(form.recruitmentRatePercent || ""), onChange: (e) => sf("recruitmentRatePercent", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weather Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Clear, light wind, good visibility", value: String(form.weatherConditions || ""), onChange: (e) => sf("weatherConditions", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.surveyDate || !form.surveyMethod, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
function HealthRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-health", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-health-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herd-flock-register`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/venison-health-records${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-health", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/venison-health-records/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-health", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const hrYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.eventDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [hrYearFilter, setHrYearFilter] = reactExports.useState("all");
  const filteredHr = reactExports.useMemo(() => hrYearFilter === "all" ? records : records.filter((r) => String(r.eventDate || "").startsWith(hrYearFilter)), [records, hrYearFilter]);
  const printHealthRecords = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Health Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Health Records${hrYearFilter !== "all" ? ` — ${hrYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Event Type</th><th>Product / Description</th><th>No. Treated</th><th>Withdrawal (days)</th><th>bTB Result</th><th>APHA Ref</th></tr></thead><tbody>${filteredHr.map((r) => `<tr><td>${fmtDate(r.eventDate)}</td><td>${fmt(r.healthEventType)}</td><td>${fmt(r.productOrDescription)}</td><td>${fmt(r.numberTreated)}</td><td>${r.withdrawalPeriodDays ? r.withdrawalPeriodDays + "d" : "—"}</td><td>${fmt(r.btbTestResult)}</td><td>${fmt(r.aphaReference)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Health Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hrYearFilter, onValueChange: setHrYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            hrYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printHealthRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => open("add"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Health Record"
        ] })
      ] })
    ] }),
    filteredHr.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: HeartPulse, message: "No health records yet. Add vaccination, bTB test, or vet visit records above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Date", "Event Type", "Product / Description", "No. Treated", "Withdrawal", "bTB Result", "APHA Ref", "", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredHr.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.eventDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.healthEventType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.productOrDescription) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: fmt(r.numberTreated) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-center", children: r.withdrawalPeriodDays ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: Number(r.withdrawalPeriodDays) > 0 ? "text-amber-700 font-medium" : "", children: [
          r.withdrawalPeriodDays,
          "d"
        ] }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.btbTestResult && r.btbTestResult !== "Not applicable" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${String(r.btbTestResult).includes("Clear") ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`, children: r.btbTestResult }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.aphaReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "venison-health-records", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["venison-health", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Health Record" : dlg.mode === "edit" ? "Edit Health Record" : "Add Health Record" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Event Date", value: fmtDate(dlg.row.eventDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Event Type", value: fmt(dlg.row.healthEventType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Product / Description", value: fmt(dlg.row.productOrDescription) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Batch Number", value: fmt(dlg.row.batchNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Number Treated", value: fmt(dlg.row.numberTreated) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Withdrawal Period (days)", value: dlg.row.withdrawalPeriodDays ? `${dlg.row.withdrawalPeriodDays} days` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "bTB Test Result", value: fmt(dlg.row.btbTestResult) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "APHA Reference", value: fmt(dlg.row.aphaReference) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Vet Name", value: fmt(dlg.row.vetName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Vet Prescribed", value: dlg.row.vetPrescribed ? "Yes (POM-V)" : "No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notifiable Disease Suspect", value: dlg.row.notifiableDiseaseSupect ? "Yes — APHA notified" : "No" }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) }),
        dlg.row.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "venison-health-records", recordId: dlg.row.id }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Event Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.eventDate || ""), onChange: (e) => sf("eventDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Health Event Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.healthEventType || ""), onValueChange: (v) => sf("healthEventType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: HEALTH_EVENT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.herdId || ""), onValueChange: (v) => sf("herdId", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product / Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Vaccine, drug, or description", value: String(form.productOrDescription || ""), onChange: (e) => sf("productOrDescription", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Batch / lot number", value: String(form.batchNumber || ""), onChange: (e) => sf("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number Treated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.numberTreated || ""), onChange: (e) => sf("numberTreated", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Period (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", placeholder: "0", value: String(form.withdrawalPeriodDays || ""), onChange: (e) => sf("withdrawalPeriodDays", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "bTB Test Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.btbTestResult || ""), onValueChange: (v) => sf("btbTestResult", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result (if applicable)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BTB_RESULTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "APHA Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "APHA case / test reference", value: String(form.aphaReference || ""), onChange: (e) => sf("aphaReference", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Vet or prescribing vet name", value: String(form.vetName || ""), onChange: (e) => sf("vetName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: Boolean(form.vetPrescribed), onCheckedChange: (v) => sf("vetPrescribed", v), id: "vet-presc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vet-presc", children: "Vet prescribed (POM-V)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: Boolean(form.notifiableDiseaseSupect), onCheckedChange: (v) => sf("notifiableDiseaseSupect", v), id: "nd-health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nd-health", children: "Notifiable disease suspected — contact APHA on 03000 200 301" })
        ] }),
        form.notifiableDiseaseSupect && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline w-4 h-4 mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "APHA Advisory:" }),
          " Contact APHA immediately on ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "03000 200 301" }),
          ". Mandatory notification must be made before laboratory confirmation."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.eventDate || !form.healthEventType, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
function FirearmsRegisterTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [dlg, setDlg] = reactExports.useState({ open: false, mode: "add", row: {} });
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["venison-firearms", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/venison-firearms-register`), { credentials: "include" }).then((r) => r.json())
  });
  const mutSave = useMutation({
    mutationFn: (data) => fetch(api(`farms/${farmId}/venison-firearms-register${data.id ? `/${data.id}` : ""}`), {
      method: data.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-firearms", farmId] });
      setDlg({ open: false, mode: "add", row: {} });
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const mutDel = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/venison-firearms-register/${id}`), { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["venison-firearms", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const open = (mode, row = {}) => {
    setDlg({ open: true, mode, row });
    setForm(mode === "add" ? { status: "active" } : row);
  };
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const fireYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.issueDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredFirearms = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => String(r.issueDate ?? "").startsWith(yearFilter)), [records, yearFilter]);
  function printFirearms() {
    const fmtD = (d) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredFirearms.map((r) => `<tr><td>${String(r.holderName ?? "—")}</td><td>${String(r.certificateType ?? "—")}</td><td>${String(r.certificateNumber ?? "—")}</td><td>${String(r.issuingAuthority ?? "—")}</td><td>${fmtD(r.issueDate)}</td><td>${fmtD(r.expiryDate)}</td><td>${String(r.calibreOrDescription ?? "—")}</td><td>${String(r.status ?? "—")}</td></tr>`).join("");
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Firearms &amp; Stalking Certificates</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Firearms &amp; Stalking Certificates${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filteredFirearms.length} certificate${filteredFirearms.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Holder Name</th><th>Certificate Type</th><th>Cert. No.</th><th>Issuing Authority</th><th>Issue Date</th><th>Expiry Date</th><th>Calibre / Desc.</th><th>Status</th></tr></thead><tbody>${trs}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const expiringSoon = records.filter((r) => r.expiryDate && r.expiryDate > today && r.expiryDate <= new Date(Date.now() + 90 * 864e5).toISOString().split("T")[0]).length;
  const expired = records.filter((r) => r.expiryDate && r.expiryDate < today && r.status === "active").length;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    (expiringSoon > 0 || expired > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-sm ${expired > 0 ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "inline w-4 h-4 mr-1" }),
      expired > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: expired }),
        " certificate",
        expired > 1 ? "s" : "",
        " expired. "
      ] }),
      expiringSoon > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: expiringSoon }),
        " certificate",
        expiringSoon > 1 ? "s" : "",
        " expiring within 90 days. "
      ] }),
      "Ensure all stalkers hold current, valid certificates before entering the field."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "inline w-4 h-4 mr-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Legal requirement:" }),
      " All deer stalkers must hold a valid ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Section 1 Firearms Certificate (FC)" }),
      " for the calibre used. Commercial venison supply requires ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DSC2" }),
      " or equivalent and a ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Hunter Food Hygiene Certificate (WGMI)" }),
      ". FCs are renewed every 5 years by the local police authority."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: "Firearms & Stalking Certificates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            fireYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filteredFirearms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printFirearms, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => open("add"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Certificate"
        ] })
      ] })
    ] }),
    filteredFirearms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VPEmptyState, { icon: ShieldCheck, message: "No certificates registered yet. Add firearms certificates and stalking qualifications for all stalkers above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b bg-muted/30", children: ["Holder Name", "Certificate Type", "Cert. No.", "Issuing Authority", "Issue Date", "Expiry Date", "Calibre / Description", "Status", "Doc", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 text-xs text-muted-foreground font-medium whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredFirearms.map((r) => {
        const isExpired = r.expiryDate && r.expiryDate < today;
        const isExpiringSoon = r.expiryDate && !isExpired && r.expiryDate <= new Date(Date.now() + 90 * 864e5).toISOString().split("T")[0];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/20 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.holderName) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.certificateType) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: fmt(r.certificateNumber) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.issuingAuthority) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 whitespace-nowrap", children: fmtDate(r.issueDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `py-2 px-3 whitespace-nowrap ${isExpired ? "text-red-700 font-bold" : isExpiringSoon ? "text-amber-700 font-medium" : ""}`, children: [
            fmtDate(r.expiryDate),
            isExpired ? " ⚠" : isExpiringSoon ? " ⏳" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: fmt(r.calibreOrDescription) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `text-xs ${isExpired ? "bg-red-100 text-red-800 border-red-200" : r.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`, children: isExpired ? "Expired" : fmt(r.status) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "venison-firearms-register", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["venison-firearms", String(farmId)], compact: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("view", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => open("edit", r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => mutDel.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlg.open, onOpenChange: (o) => !o && setDlg({ open: false, mode: "add", row: {} }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dlg.mode === "view" ? "Certificate Record" : dlg.mode === "edit" ? "Edit Certificate" : "Add Certificate" }) }),
      dlg.mode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Holder Name", value: fmt(dlg.row.holderName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Certificate Type", value: fmt(dlg.row.certificateType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Certificate Number", value: fmt(dlg.row.certificateNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Issuing Authority", value: fmt(dlg.row.issuingAuthority) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Issue Date", value: fmtDate(dlg.row.issueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Expiry Date", value: fmtDate(dlg.row.expiryDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Calibre / Description", value: fmt(dlg.row.calibreOrDescription) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Status", value: fmt(dlg.row.status) }),
        dlg.row.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VPFieldView, { label: "Notes", value: fmt(dlg.row.notes) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Holder Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Full name of certificate holder", value: String(form.holderName || ""), onChange: (e) => sf("holderName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status || "active"), onValueChange: (v) => sf("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "expired", "surrendered"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.certificateType || ""), onValueChange: (v) => sf("certificateType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Certificate / registration number", value: String(form.certificateNumber || ""), onChange: (e) => sf("certificateNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issuing Authority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Northumbria Police, DSC Ltd", value: String(form.issuingAuthority || ""), onChange: (e) => sf("issuingAuthority", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.issueDate || ""), onChange: (e) => sf("issueDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expiryDate || ""), onChange: (e) => sf("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calibre / Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. .243 Win, .308 Win; or certificate scope notes", value: String(form.calibreOrDescription || ""), onChange: (e) => sf("calibreOrDescription", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: String(form.notes || ""), onChange: (e) => sf("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: dlg.mode !== "view" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => mutSave.mutate({ ...form, id: dlg.row.id }), disabled: mutSave.isPending || !form.holderName || !form.certificateType, children: [
        mutSave.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
        dlg.mode === "edit" ? "Update" : "Save"
      ] }) })
    ] }) })
  ] });
}
function VenisonAnalyticsTab({ farmId }) {
  const { data: cull = [] } = useQuery({ queryKey: ["venison-cull", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-cull-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: sales = [] } = useQuery({ queryKey: ["venison-sales", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-carcass-sales`), { credentials: "include" }).then((r) => r.json()) });
  const { data: monitoring = [] } = useQuery({ queryKey: ["venison-monitoring", farmId], queryFn: () => fetch(api(`farms/${farmId}/venison-herd-monitoring`), { credentials: "include" }).then((r) => r.json()) });
  const speciesData = reactExports.useMemo(() => {
    const counts = {};
    cull.forEach((r) => {
      if (r.species) counts[r.species] = (counts[r.species] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [cull]);
  const cullByMonth = reactExports.useMemo(() => {
    const months = {};
    cull.forEach((r) => {
      if (r.cullDate) {
        const m = String(r.cullDate).slice(0, 7);
        months[m] = (months[m] || 0) + 1;
      }
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([name, value]) => ({
      name: name.slice(5) + "/" + name.slice(2, 4),
      value
    }));
  }, [cull]);
  const totalCarcassKg = reactExports.useMemo(() => cull.reduce((s, r) => s + (Number(r.carcassWeightKg) || 0), 0), [cull]);
  const totalSalesValue = reactExports.useMemo(() => sales.reduce((s, r) => s + (Number(r.totalValueGbp) || 0), 0), [sales]);
  const avgMonitoringCount = reactExports.useMemo(() => {
    const valid = monitoring.filter((r) => r.totalCount);
    return valid.length ? Math.round(valid.reduce((s, r) => s + Number(r.totalCount), 0) / valid.length) : null;
  }, [monitoring]);
  if (cull.length === 0 && sales.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add cull records and carcass sales to see analytics." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Culls", value: cull.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Carcass Wt (kg)", value: totalCarcassKg > 0 ? `${totalCarcassKg.toFixed(1)} kg` : "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Total Sales Value", value: totalSalesValue > 0 ? fmtGbp(totalSalesValue) : "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPKpiCard, { label: "Avg Herd Count", value: avgMonitoringCount ?? "—", bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      speciesData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Cull by Species" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: speciesData, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: speciesData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: VEN_COLORS[i % VEN_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} culls`, ""] })
        ] }) }) })
      ] }),
      cullByMonth.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Monthly Cull Trend (last 12 months)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: cullByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} culls`, "Culls"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", fill: "#15803d", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] })
    ] }),
    sales.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "Venison Sales Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: sales.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sale Records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: sales.reduce((s, r) => s + (Number(r.numberCarcasses) || 0), 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Carcasses" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: totalSalesValue > 0 ? fmtGbp(totalSalesValue) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Value" })
        ] })
      ] })
    ] })
  ] });
}
function VenisonProductionPage() {
  const { selectedFarm } = useAppStore();
  const farmId = selectedFarm?.id;
  const [tab, setTab] = reactExports.useState("herds");
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground text-sm", children: "Select a farm to continue." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Venison Production" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Stalking & cull records, carcass processing & sales, herd monitoring, health records, and firearms register" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VPTabButton, { active: tab === "herds", onClick: () => setTab("herds"), children: "Herds" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "cull", onClick: () => setTab("cull"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "w-3.5 h-3.5" }),
        "Cull Records"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "sales", onClick: () => setTab("sales"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "w-3.5 h-3.5" }),
        "Carcass Sales"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "monitoring", onClick: () => setTab("monitoring"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
        "Herd Monitoring"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "health", onClick: () => setTab("health"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-3.5 h-3.5" }),
        "Health"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "firearms", onClick: () => setTab("firearms"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
        "Firearms & Licences"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5" }),
        "Analytics"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(VPTabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5" }),
        "Enterprise Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 bg-card", children: [
      tab === "herds" && /* @__PURE__ */ jsxRuntimeExports.jsx(HerdsTab, { farmId }),
      tab === "cull" && /* @__PURE__ */ jsxRuntimeExports.jsx(CullRecordsTab, { farmId }),
      tab === "sales" && /* @__PURE__ */ jsxRuntimeExports.jsx(CarcassSalesTab, { farmId }),
      tab === "monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsx(HerdMonitoringTab, { farmId }),
      tab === "health" && /* @__PURE__ */ jsxRuntimeExports.jsx(HealthRecordsTab, { farmId }),
      tab === "firearms" && /* @__PURE__ */ jsxRuntimeExports.jsx(FirearmsRegisterTab, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(VenisonAnalyticsTab, { farmId }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(VenisonEnterpriseReport, { farmId })
    ] })
  ] }) });
}
export {
  VenisonProductionPage as default
};
