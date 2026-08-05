const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-DCDDbUO2.js","assets/index-CdirZOd1.js","assets/index-CAOhs4IG.css","assets/typeof-WJl3ipnu.js"])))=>i.map(i=>d[i]);
import { r as reactExports, m as useQuery, j as jsxRuntimeExports, b as useAppStore, R as Redirect, d as Button, e as LoaderCircle, n as Card, o as CardContent, c as useQueryClient, a as useToast, S as useMutation, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, N as DialogMutationError, C as Checkbox, _ as __vitePreload, M as MapPin } from "./index-CdirZOd1.js";
import { u as usePersistedTab } from "./use-persisted-tab-BpzW86LH.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { D as DocAttach } from "./DocAttach-JdkGK2bs.js";
import { P as Printer } from "./printer-BCSjlGaR.js";
import { T as TrendingUp, A as AppLayout, Q as LayoutDashboard, V as PiggyBank, j as Truck, k as Stethoscope, f as Scale, c as ClipboardList } from "./AppLayout-BYtQ8m3g.js";
import { T as TrendingDown } from "./trending-down-BM3RdsYm.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar, C as Cell } from "./generateCategoricalChart-CLueV00T.js";
import { C as ComposedChart } from "./ComposedChart-Dux4gkrN.js";
import { C as CartesianGrid } from "./CartesianGrid-Ccz79_ni.js";
import { L as Line } from "./Line-UCIrfMgM.js";
import { C as ChevronUp } from "./chevron-up-DF39Syyc.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-z6Xcf3lD.js";
import { R as RecordAttachments } from "./RecordAttachments-Czd_pJDh.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BJbp_WG2.js";
import { T as Textarea } from "./textarea-DWmsQkH_.js";
import { B as Badge } from "./badge-CGhXlzsr.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BJ5Ent_f.js";
import { T as TabBar, a as TabButton } from "./tab-button-BdqaSQFS.js";
import { u as useFarmMembers } from "./use-farm-members-R0U1EWbF.js";
import { S as StaffSelect } from "./staff-select-D3cIwaWm.js";
import { C as ConfirmDialog$1 } from "./confirm-dialog-ti8X_6ec.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { P as Pill } from "./pill-B12sxIfB.js";
import { F as FileText, C as ClipboardCheck } from "./shield-alert-ZRfYfiFT.js";
import { U as UtensilsCrossed } from "./utensils-crossed-BgVRQ2n2.js";
import { T as TriangleAlert } from "./triangle-alert-CUfGy1ZD.js";
import { B as Baby } from "./baby-D_s-9eAq.js";
import { S as ShieldCheck } from "./shield-check-DtcVMmdO.js";
import { S as Syringe } from "./syringe-DqtaqCRX.js";
import { A as Activity } from "./activity-BE2MZmi3.js";
import { F as FileDown } from "./file-down-CtuX3gyf.js";
import { C as CircleCheck } from "./circle-check-Ckaymn3D.js";
import { C as CircleX } from "./circle-x-BrdvxCob.js";
import { E as Eye } from "./eye-XML_ptWu.js";
import { P as Pencil } from "./pencil-BPBN9KmK.js";
import { P as Paperclip } from "./paperclip-DfWmzJ9d.js";
import { B as BarChart } from "./BarChart-CampUK3i.js";
import { P as PieChart, a as Pie } from "./PieChart-B8yj1RTl.js";
import { a as Clock } from "./database-BYZvKxkF.js";
import "./use-upload-dHDidFZp.js";
import "./upload-Ca0UsuV4.js";
import "./use-safe-clerk-GosXKq3X.js";
import "./tractor-EgAMV7wt.js";
import "./image-DtEWFJ-i.js";
import "./download-jZc7qPPv.js";
import "./index-mw0PPnci.js";
import "./index-DRht-o5x.js";
const PRINT_ID = "pig-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}
function fmtGBP(p) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPkg(p) {
  return p == null ? "—" : `${(p / 100).toFixed(2)}p/kg`;
}
function monthLabel(d) {
  return (/* @__PURE__ */ new Date(d.slice(0, 7) + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
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
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      fmtGBP(Math.abs(p.value))
    ] }, p.name))
  ] });
};
function PigEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data, isLoading } = useQuery({
    queryKey: ["pig-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/pig-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.totalHeadKilled > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = reactExports.useMemo(() => {
    if (!d) return [];
    const map = {};
    d.killRecords.forEach((r) => {
      const m = r.killDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].revenue += r.netPaymentPence ?? 0;
    });
    d.feedDeliveries.forEach((f) => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].feedCost += f.costPence;
    });
    d.purchases.forEach((p) => {
      const m = p.invoiceDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].purchases += p.totalAmountPence;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Kill Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Purchases": v.purchases,
      "Gross Margin": v.revenue - v.feedCost - v.purchases
    }));
  }, [d]);
  const avgP2 = d && d.killRecords.filter((r) => r.averageP2BackfatMm).length ? d.killRecords.reduce((s, r) => s + (parseFloat(String(r.averageP2BackfatMm)) || 0), 0) / d.killRecords.filter((r) => r.averageP2BackfatMm).length : null;
  const fcrChartData = reactExports.useMemo(() => {
    if (!d) return [];
    const map = {};
    d.feedDeliveries.forEach((f) => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { feedKg: 0, dwtKg: 0 };
      map[m].feedKg += parseFloat(String(f.quantityKg)) || 0;
    });
    d.killRecords.forEach((r) => {
      const m = r.killDate.slice(0, 7);
      if (!map[m]) map[m] = { feedKg: 0, dwtKg: 0 };
      map[m].dwtKg += parseFloat(String(r.totalDeadweightKg)) || 0;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Feed (kg)": Math.round(v.feedKg),
      "Deadweight (kg)": Math.round(v.dwtKg),
      fcr: v.dwtKg > 0 ? parseFloat((v.feedKg / v.dwtKg).toFixed(2)) : null
    })).filter((v) => v["Feed (kg)"] > 0 || v["Deadweight (kg)"] > 0);
  }, [d]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Pig Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cost per kg deadweight · Gross margin per head · Carcase quality" })
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
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No kill records, priced feed deliveries or livestock purchases found for ",
      year,
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Head Killed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: d.totalHeadKilled.toLocaleString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.totalDeadweightKg.toLocaleString("en-GB"),
            " kg dwt",
            d.avgLeanMeatPct ? ` · avg LMP ${d.avgLeanMeatPct.toFixed(1)}%` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Kill Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-700", children: fmtGBP(d.totalRevenuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: fmtPkg(d.revenuePerKgDwtPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Variable Costs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: fmtGBP(d.totalVariableCostPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            "Feed ",
            fmtGBP(d.totalFeedCostPence),
            " · Purchases ",
            fmtGBP(d.totalPurchaseCostPence)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${marginPositive ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Gross Margin" }),
            marginPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${marginPositive ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(d.grossMarginPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: d.grossMarginPerHeadPence != null ? `${fmtGBP(d.grossMarginPerHeadPence)}/head` : "—" })
        ] })
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Kill Revenue vs Costs" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Kill Revenue", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Purchases", fill: "#f97316", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "Gross Margin", stroke: "#3b82f6", strokeWidth: 2, dot: false })
        ] }) }) })
      ] }),
      fcrChartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "FCR Trend — Feed vs Deadweight (kg/month)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: "Feed conversion ratio = feed delivered ÷ deadweight produced in the same month" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: fcrChartData, margin: { top: 4, right: 56, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, width: 55, tickFormatter: (v) => `${v.toLocaleString("en-GB")} kg` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, width: 42, domain: [0, "auto"], label: { value: "FCR", angle: 90, position: "insideRight", offset: 10, fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              content: ({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: label }),
                  payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: p.color }, children: p.name === "FCR" ? `FCR: ${p.value ?? "—"}` : `${p.name}: ${(p.value ?? 0).toLocaleString("en-GB")} kg` }, p.name))
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "Feed (kg)", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "Deadweight (kg)", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "fcr", name: "FCR", stroke: "#6366f1", strokeWidth: 2, dot: { r: 3 }, connectNulls: true })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Enterprise P&L Summary — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Per Head" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Per kg Dwt" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: `Kill revenue (${d.killRecords.length} kills · ${d.totalHeadKilled} head)`, value: d.totalRevenuePence, positive: true },
            { label: `Livestock purchases (${d.totalHeadPurchased} head)`, value: -d.totalPurchaseCostPence },
            { label: `Feed cost (${d.feedDeliveries.length} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence },
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalHeadKilled > 0 ? fmtGBP(Math.abs(row.value) / d.totalHeadKilled) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalDeadweightKg > 0 ? `${(Math.abs(row.value) / d.totalDeadweightKg / 100).toFixed(2)}p/kg` : "—" })
          ] }, i)) })
        ] }),
        (d.avgLeanMeatPct != null || avgP2 != null || d.feedCostPerKgDwtPence != null) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 border-t border-border/40 text-xs text-foreground/60 flex flex-wrap gap-4", children: [
          d.avgLeanMeatPct != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Avg lean meat %: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              d.avgLeanMeatPct.toFixed(1),
              "%"
            ] })
          ] }),
          avgP2 != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Avg P2 backfat: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              avgP2.toFixed(1),
              " mm"
            ] })
          ] }),
          d.feedCostPerKgDwtPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Feed cost/kg dwt: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtPkg(d.feedCostPerKgDwtPence) })
          ] }),
          d.variableCostPerKgDwtPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Variable cost/kg dwt: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtPkg(d.variableCostPerKgDwtPence) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed from priced deliveries tagged to pigs/swine. Bedding, haulage, vet, and fixed costs should be added via Financial for a complete P&L." })
      ] }),
      d.killRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Kill Records (${d.killRecords.length} · ${d.totalHeadKilled} head · ${d.totalDeadweightKg.toLocaleString("en-GB")} kg dwt)`, open: openSection === "kills", setOpen: (v) => toggle(v ? "kills" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Kill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Deadweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "LMP %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "P2 (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Net Payment" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.killRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(r.killDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.numberOfHead }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.totalDeadweightKg != null ? `${parseFloat(String(r.totalDeadweightKg)).toFixed(0)} kg` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.pricePerKgPence ? `${(r.pricePerKgPence / 100).toFixed(2)}p` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.leanMeatPct != null ? `${parseFloat(String(r.leanMeatPct)).toFixed(1)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.averageP2BackfatMm != null ? `${parseFloat(String(r.averageP2BackfatMm)).toFixed(1)}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: r.netPaymentPence ? fmtGBP(r.netPaymentPence) : "—" })
        ] }, r.id)) })
      ] }) }),
      d.feedDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Feed Deliveries (${d.feedDeliveries.length} · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, open: openSection === "feed", setOpen: (v) => toggle(v ? "feed" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Qty (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Cost" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.feedDeliveries.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(f.deliveryDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: f.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: parseFloat(String(f.quantityKg)).toLocaleString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium", children: fmtGBP(f.costPence) })
        ] }, f.id)) })
      ] }) })
    ] })
  ] });
}
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, children: confirmLabel })
    ] })
  ] }) });
}
function DataTable({ cols, rows, onEdit, onDelete, onView }) {
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet. Add one using the button above." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.render ? c.render(row) : c.fmt ? c.fmt(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingDelete(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingDelete,
        title: "Delete Record",
        message: "Are you sure you want to delete this record? This cannot be undone.",
        onConfirm: () => {
          if (pendingDelete && onDelete) {
            onDelete(pendingDelete);
          }
          setPendingDelete(null);
        },
        onCancel: () => setPendingDelete(null),
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
function FlocksTab({ farmId }) {
  const { data: herds = [], isLoading } = useQuery({ queryKey: ["pig-flocks", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then((r) => r.json()) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Production groups are managed in Livestock → Herds & Animals." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Records in all tabs link to that register. Create or edit herds and production groups there."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
      "Registered Herds / Production Groups ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
        "(",
        herds.length,
        ")"
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "flockName", label: "Name" },
          { key: "productionType", label: "Type" },
          { key: "breed", label: "Breed" },
          { key: "herdNumber", label: "Herd No." },
          { key: "notes", label: "Notes" }
        ],
        rows: herds
      }
    )
  ] });
}
function MovementsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: movements = [], isLoading } = useQuery({ queryKey: ["pig-movements", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-movements`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-movements/${editing.id}`) : apiUrl(`farms/${farmId}/pig-movements`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-movements", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-movements/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-movements", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  const years = reactExports.useMemo(() => Array.from(new Set(movements.map((r) => String(r.movementDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [movements]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? movements : movements.filter((r) => String(r.movementDate ?? "").startsWith(yearFilter)), [movements, yearFilter]);
  function printMovements() {
    const fmtD = (d) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const rows = filtered.map((r) => `<tr><td>${fmtD(r.movementDate)}</td><td>${String(r.movementType ?? "—")}</td><td>${String(r.fromLocation ?? "—")} (${String(r.fromCph ?? "—")})</td><td>${String(r.toLocation ?? "—")} (${String(r.toCph ?? "—")})</td><td>${String(r.numberOfAnimals ?? "—")}</td><td>${String(r.eaml2Reference ?? "—")}</td><td>${String(r.transporterName ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Pig Movements (eAML2)</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Pig Movements (eAML2)${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Animals</th><th>eAML2 Ref</th><th>Transporter</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Pig Movements (eAML2)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMovements, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Movement"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "movementDate", label: "Date", fmt: (r) => fmtDate(r.movementDate) },
          { key: "movementType", label: "Type" },
          { key: "fromLocation", label: "From" },
          { key: "toLocation", label: "To" },
          { key: "numberOfAnimals", label: "Animals" },
          { key: "eaml2Reference", label: "eAML2 Ref" },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-movements", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-movements", String(farmId)] }) }
        ],
        rows: filtered,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Movement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Movement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.movementDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Movement Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.movementType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "From Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.fromLocation ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "From CPH" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.fromCph ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "To Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.toLocation ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "To CPH" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.toCph ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.numberOfAnimals ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "eAML2 Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.eaml2Reference ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Transporter Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.transporterName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vehicle Registration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vehicleRegistration ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Movement" : "Log Pig Movement" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movement Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.movementDate ?? "", onChange: (e) => setForm((f) => ({ ...f, movementDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movement Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.movementType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, movementType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["On Farm", "Off Farm — Market", "Off Farm — Slaughter", "Off Farm — Dealer", "Internal Movement", "Out to Agistment"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        [["fromLocation", "From Location *"], ["fromCph", "From CPH"], ["toLocation", "To Location *"], ["toCph", "To CPH"], ["numberOfAnimals", "Number of Animals *"], ["eaml2Reference", "eAML2 Reference"], ["transporterName", "Transporter Name"], ["vehicleRegistration", "Vehicle Reg."]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[k] ?? "", onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) })
        ] }, k)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function FciDocumentsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: docs = [], isLoading } = useQuery({ queryKey: ["pig-fci", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-fci-documents`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-fci-documents/${editing.id}`) : apiUrl(`farms/${farmId}/pig-fci-documents`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-fci", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-fci-documents/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-fci", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ withdrawalPeriodClear: true, signedByFarmer: true });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v])));
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Food Chain Information (FCI) Documents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add FCI Doc"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "documentDate", label: "Date", fmt: (r) => fmtDate(r.documentDate) },
          { key: "batchReference", label: "Batch Ref" },
          { key: "destinationAbattoir", label: "Abattoir" },
          { key: "numberOfPigs", label: "Pigs" },
          { key: "withdrawalPeriodClear", label: "Withdrawal Clear", fmt: (r) => r.withdrawalPeriodClear ? "Yes" : "No" },
          { key: "signedByFarmer", label: "Signed", fmt: (r) => r.signedByFarmer ? "Yes" : "No" },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-fci-documents", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-fci", String(farmId)] }) }
        ],
        rows: docs,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View FCI Document" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Document Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.documentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Batch Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.batchReference ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Destination Abattoir" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.destinationAbattoir ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Pigs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.numberOfPigs ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Withdrawal (hours)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.feedWithdrawalHours ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lameness / Casualty Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.lambnessCasualtyStatus ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Veterinary Medicines Last 60 Days" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.veterinaryMedicinesLast60Days ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal Period Clear" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.withdrawalPeriodClear ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Signed By Farmer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.signedByFarmer ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Medicine Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.medicineDetails ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "FCI Document" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.documentDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, documentDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.batchReference ?? ""), onChange: (e) => setForm((f) => ({ ...f, batchReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination Abattoir" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.destinationAbattoir ?? ""), onChange: (e) => setForm((f) => ({ ...f, destinationAbattoir: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Pigs *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: String(form.numberOfPigs ?? ""), onChange: (e) => setForm((f) => ({ ...f, numberOfPigs: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Withdrawal (hours)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.feedWithdrawalHours ?? ""), onChange: (e) => setForm((f) => ({ ...f, feedWithdrawalHours: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lameness / Casualty Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.lambnessCasualtyStatus ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, lambnessCasualtyStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["None", "Lame – minor", "Lame – moderate", "Lame – severe", "Casualty – suspected", "Casualty – confirmed", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 space-y-2", children: [["veterinaryMedicinesLast60Days", "Veterinary medicines administered in last 60 days?"], ["withdrawalPeriodClear", "Withdrawal period clear?"], ["signedByFarmer", "Signed by farmer?"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: k, checked: Boolean(form[k]), onCheckedChange: (v) => setForm((f) => ({ ...f, [k]: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: k, children: l })
        ] }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medicine Details (if applicable)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.medicineDetails ?? ""), onChange: (e) => setForm((f) => ({ ...f, medicineDetails: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function PigFeedDeliveriesView({ farmId }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ["pig-deliveries-view", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then((r) => r.json())
  });
  const all = Array.isArray(raw) ? raw : raw?.records ?? [];
  const pigDeliveries = all.filter((d) => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "pigs" || sp === "mixed";
  }).sort((a, b) => String(b.deliveryDate ?? "").localeCompare(String(a.deliveryDate ?? "")));
  const [yearFilterDel, setYearFilterDel] = reactExports.useState("all");
  const delivYears = reactExports.useMemo(() => Array.from(new Set(pigDeliveries.map((d) => String(d.deliveryDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [pigDeliveries]);
  const displayedDeliveries = yearFilterDel === "all" ? pigDeliveries : pigDeliveries.filter((d) => String(d.deliveryDate ?? "").startsWith(yearFilterDel));
  function printDeliveries() {
    const trs = displayedDeliveries.map((r) => `<tr><td>${fmtDate(r.deliveryDate)}</td><td>${fmt(r.supplierName)}</td><td>${fmt(r.feedType)}</td><td>${r.quantityKg != null ? `${r.quantityKg} kg` : "—"}</td><td>${fmt(r.batchNumber)}</td><td>${fmt(r.deliveryNoteNumber)}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pig Feed Deliveries</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Feed Deliveries${yearFilterDel !== "all" ? ` — ${yearFilterDel}` : ""}</h2><table><thead><tr><th>Date</th><th>Supplier</th><th>Feed Type</th><th>Qty (kg)</th><th>Batch No.</th><th>Delivery Note</th></tr></thead><tbody>${trs}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" });
  if (pigDeliveries.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: 'No pig or mixed-species feed deliveries on record. Log a delivery in Feed Management with species set to "Pigs" or "Mixed".' });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterDel, onValueChange: setYearFilterDel, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
          delivYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
        ] })
      ] }),
      displayedDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printDeliveries, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
        "Print"
      ] })
    ] }),
    displayedDeliveries.length === 0 && pigDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400 py-2", children: [
      "No deliveries for ",
      yearFilterDel,
      "."
    ] }),
    displayedDeliveries.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-3 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmt(r.supplierName) }),
        String(r.speciesIntended ?? "").toLowerCase() === "mixed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs", style: { background: "#fef9c3", color: "#854d0e", border: "none" }, children: "Mixed species" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Date:" }),
          " ",
          fmtDate(r.deliveryDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Type:" }),
          " ",
          fmt(r.feedType)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Qty:" }),
          " ",
          fmt(r.quantityKg),
          " kg"
        ] }),
        !!r.productName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Product:" }),
          " ",
          fmt(r.productName)
        ] }),
        !!r.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Batch:" }),
          " ",
          fmt(r.batchNumber)
        ] }),
        !!r.deliveryNoteNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Note No.:" }),
          " ",
          fmt(r.deliveryNoteNumber)
        ] }),
        !!r.ufasNumberOnNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "UFAS No.:" }),
          " ",
          fmt(r.ufasNumberOnNote)
        ] })
      ] })
    ] }) }) }, i))
  ] });
}
function PigPenConsumptionView({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: rawRows, isLoading } = useQuery({
    queryKey: ["pig-feed-consumption", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-feed-consumption`), { credentials: "include" }).then((r) => r.json())
  });
  const rows = Array.isArray(rawRows) ? rawRows : rawRows?.records ?? rawRows ?? [];
  const sorted = [...rows].sort((a, b) => String(b.consumptionDate ?? "").localeCompare(String(a.consumptionDate ?? "")));
  const [yearFilterCon, setYearFilterCon] = reactExports.useState("all");
  const conYears = reactExports.useMemo(() => Array.from(new Set(sorted.map((r) => String(r.consumptionDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [sorted]);
  const displayed = yearFilterCon === "all" ? sorted : sorted.filter((r) => String(r.consumptionDate ?? "").startsWith(yearFilterCon));
  const { data: flocksRaw } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then((r) => r.json())
  });
  const flocks = Array.isArray(flocksRaw) ? flocksRaw : flocksRaw?.records ?? flocksRaw ?? [];
  const { data: locsRaw } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/farm-locations`), { credentials: "include" }).then((r) => r.json())
  });
  const allLocations = Array.isArray(locsRaw) ? locsRaw : [];
  const activeLocations = allLocations.filter((l) => l.isActive !== false);
  const { data: delivRaw } = useQuery({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then((r) => r.json())
  });
  const deliveries = Array.isArray(delivRaw) ? delivRaw : delivRaw?.records ?? [];
  const pigDeliveries = deliveries.filter((d) => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "pigs" || sp === "mixed";
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-feed-consumption/${editing.id}`) : apiUrl(`farms/${farmId}/pig-feed-consumption`);
      const payload = { ...body };
      if (payload.appliedToFlockId === "" || payload.appliedToFlockId === "__none__") payload.appliedToFlockId = null;
      else if (payload.appliedToFlockId) payload.appliedToFlockId = Number(payload.appliedToFlockId);
      if (payload.locationId === "" || payload.locationId === "__none__") payload.locationId = null;
      else if (payload.locationId) payload.locationId = Number(payload.locationId);
      if (payload.linkedDeliveryId === "" || payload.linkedDeliveryId === "__none__") payload.linkedDeliveryId = null;
      else if (payload.linkedDeliveryId) payload.linkedDeliveryId = Number(payload.linkedDeliveryId);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-feed-consumption", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-feed-consumption/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-feed-consumption", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  function printConsumption() {
    const trs = displayed.map((r) => `<tr><td>${fmtDate(r.consumptionDate)}</td><td>${fmt(r.flockName)}</td><td>${fmt(r.locationName)}</td><td>${fmt(r.feedType)}</td><td>${r.quantityKg != null ? `${r.quantityKg} kg` : "—"}</td><td>${fmt(r.batchLotNumber)}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Pen Feed Consumption</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Pen Feed Consumption${yearFilterCon !== "all" ? ` — ${yearFilterCon}` : ""}</h2><table><thead><tr><th>Date</th><th>Herd/Group</th><th>Location</th><th>Feed Type</th><th>Quantity</th><th>Batch No.</th></tr></thead><tbody>${trs}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-green-100 bg-green-50 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { className: "w-4 h-4 text-green-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-800", children: [
        "Record feed quantity per ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "herd / group" }),
        " and ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "location" }),
        " each day. Locations are drawn from your central Farm Locations list — add any sheds or outdoor areas there to keep all records consistent."
      ] })
    ] }),
    activeLocations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-amber-600 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
        "No farm locations are set up yet. Go to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Locations" }),
        " in the sidebar and add your pig sheds, farrowing houses, and outdoor areas before recording feed consumption."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Pen Feeding Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterCon, onValueChange: setYearFilterCon, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            conYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        displayed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printConsumption, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No feeding records yet. Add your pig sheds to Farm Locations, then record daily feed consumption per herd / group and location." }) : displayed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400 py-2", children: [
      "No records for ",
      yearFilterCon,
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: displayed.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg p-3 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: !!r.flockName ? fmt(r.flockName) : "Unknown group" }),
          !!r.locationName && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3 inline mr-0.5" }),
            fmt(r.locationName)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Date:" }),
            " ",
            fmtDate(r.consumptionDate)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Type:" }),
            " ",
            fmt(r.feedType)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Qty:" }),
            " ",
            fmt(r.quantityKg),
            " kg"
          ] }),
          !!r.batchLotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Batch:" }),
            " ",
            fmt(r.batchLotNumber)
          ] }),
          !!r.linkedDeliveryId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Linked delivery #:" }),
            " ",
            fmt(r.linkedDeliveryId)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "pig-feed-consumption", recordId: r.id, farmId, compact: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
      ] })
    ] }) }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Feeding Record" : "Add Feeding Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.consumptionDate ?? "", onChange: (e) => setForm((f) => ({ ...f, consumptionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd / Group *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.appliedToFlockId ?? "__none__", onValueChange: (v) => setForm((f) => ({ ...f, appliedToFlockId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd / group" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select herd / group —" }),
              flocks.map((fl) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(fl.id), children: [
                fmt(fl.flockName),
                fl.productionType ? ` (${fl.productionType})` : ""
              ] }, String(fl.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location / Shed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.locationId ?? "__none__", onValueChange: (v) => setForm((f) => ({ ...f, locationId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select location" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select location —" }),
              activeLocations.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: fmt(l.name) }, String(l.id)))
            ] })
          ] }),
          activeLocations.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-1", children: [
            "Add pig buildings to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Locations" }),
            " first."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.feedType ?? "__none__", onValueChange: (v) => setForm((f) => ({ ...f, feedType: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
              ["Compound Feed", "Straights", "Home Mix", "Liquid Feed", "Creep Feed", "Supplement"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", value: form.quantityKg ?? "", onChange: (e) => setForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch/Lot No. (traceability)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From delivery label", value: form.batchLotNumber ?? "", onChange: (e) => setForm((f) => ({ ...f, batchLotNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Delivery (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.linkedDeliveryId ?? "__none__", onValueChange: (v) => {
            if (v === "__none__") {
              setForm((f) => ({ ...f, linkedDeliveryId: "" }));
              return;
            }
            const d = pigDeliveries.find((x) => String(x.id) === v);
            setForm((f) => ({ ...f, linkedDeliveryId: v, batchLotNumber: d?.batchNumber ? String(d.batchNumber) : f.batchLotNumber }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to a feed delivery for traceability" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              pigDeliveries.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                fmtDate(d.deliveryDate),
                " — ",
                fmt(d.supplierName),
                " ",
                d.batchNumber ? `(Batch: ${d.batchNumber})` : ""
              ] }, String(d.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function FeedRecordsTab({ farmId }) {
  const [subTab, setSubTab] = reactExports.useState("deliveries");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0 border-b", children: ["deliveries", "consumption"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSubTab(t), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: t === "deliveries" ? "Feed Deliveries" : "Pen Consumption Records" }, t)) }),
    subTab === "deliveries" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4 text-blue-500 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-800", children: [
          "Showing all feed deliveries from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Feed Management" }),
          " where species is set to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Pigs" }),
          " or ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Mixed" }),
          ". To add a delivery, go to Feed Management → Delivery Records."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PigFeedDeliveriesView, { farmId })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PigPenConsumptionView, { farmId })
  ] });
}
function VetAssessmentsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: allAssessments = [], isLoading } = useQuery({ queryKey: ["pig-vet", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-vet-assessments`), { credentials: "include" }).then((r) => r.json()) });
  const [vetYearFilter, setVetYearFilter] = reactExports.useState("all");
  const vetYears = reactExports.useMemo(() => Array.from(new Set(allAssessments.map((r) => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAssessments]);
  const assessments = reactExports.useMemo(() => vetYearFilter === "all" ? allAssessments : allAssessments.filter((r) => String(r.assessmentDate || "").startsWith(vetYearFilter)), [allAssessments, vetYearFilter]);
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-vet-assessments/${editing.id}`) : apiUrl(`farms/${farmId}/pig-vet-assessments`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-vet", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-vet-assessments/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-vet", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  function printVetAssessments() {
    const rows = assessments;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Vet Assessments</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Veterinary Assessments & Health Plans${vetYearFilter !== "all" ? ` — ${vetYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Vet</th><th>Practice</th><th>Lameness</th><th>Respiratory</th><th>Next Review</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.vetName || "—"}</td><td>${r.practiceName || "—"}</td><td>${r.lameness || "—"}</td><td>${r.respiratoryHealth || "—"}</td><td>${fmtDate(r.nextReviewDate)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Veterinary Assessments & Health Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vetYearFilter, onValueChange: setVetYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            vetYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        assessments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printVetAssessments, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "assessmentDate", label: "Date", fmt: (r) => fmtDate(r.assessmentDate) },
          { key: "vetName", label: "Vet" },
          { key: "practiceName", label: "Practice" },
          { key: "lameness", label: "Lameness" },
          { key: "respiratoryHealth", label: "Respiratory" },
          { key: "nextReviewDate", label: "Next Review", fmt: (r) => fmtDate(r.nextReviewDate) },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-vet-assessments", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-vet", String(farmId)] }) }
        ],
        rows: assessments,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Vet Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.vetName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Practice Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.practiceName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mortality Rate (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.mortalityRate ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lameness Assessment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.lameness ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Respiratory Health" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.respiratoryHealth ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Skin Condition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.skinCondition ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Tail Biting" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.tailBiting ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.nextReviewDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Findings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.findings ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Recommendations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.recommendations ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "pig-vet-assessments", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Vet Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate ?? "", onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: (e) => setForm((f) => ({ ...f, vetName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Practice Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.practiceName ?? "", onChange: (e) => setForm((f) => ({ ...f, practiceName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortality Rate (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.mortalityRate ?? "", onChange: (e) => setForm((f) => ({ ...f, mortalityRate: e.target.value })) })
        ] }),
        [["lameness", "Lameness Assessment"], ["respiratoryHealth", "Respiratory Health"], ["skinCondition", "Skin Condition"], ["tailBiting", "Tail Biting"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form[k] ?? "", onValueChange: (v) => setForm((f) => ({ ...f, [k]: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["None observed", "Low", "Moderate", "High", "Requires action"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }, k)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextReviewDate ?? "", onChange: (e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Findings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.findings ?? "", onChange: (e) => setForm((f) => ({ ...f, findings: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recommendations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.recommendations ?? "", onChange: (e) => setForm((f) => ({ ...f, recommendations: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function StockmanshipChecksTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: allChecks = [], isLoading } = useQuery({ queryKey: ["pig-stockmanship", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-stockmanship-checks`), { credentials: "include" }).then((r) => r.json()) });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const stockYears = reactExports.useMemo(() => {
    const s = new Set(allChecks.map((r) => String(r.checkDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allChecks]);
  const [stockYearFilter, setStockYearFilter] = reactExports.useState("all");
  const checks = reactExports.useMemo(() => stockYearFilter === "all" ? allChecks : allChecks.filter((r) => String(r.checkDate || "").startsWith(stockYearFilter)), [allChecks, stockYearFilter]);
  const printStock = () => {
    const rows = checks;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Stockmanship Checks</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Daily Stockmanship Checks${stockYearFilter !== "all" ? ` — ${stockYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Mortalities</th><th>Injured</th><th>Welfare Status</th><th>Actions Required</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${fmtDate(r.checkDate)}</td><td>${r.checkedBy || "—"}</td><td>${r.mortalitiesFound ?? 0}</td><td>${r.injuredFound ?? 0}</td><td>${r.overallWelfare || "—"}</td><td>${r.actionsRequired || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-stockmanship-checks/${editing.id}`) : apiUrl(`farms/${farmId}/pig-stockmanship-checks`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-stockmanship", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-stockmanship-checks/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-stockmanship", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const defaults = { waterSystemOk: true, feedSystemOk: true, ventilationOk: true, temperatureOk: true, lightingOk: true, beddingOk: true };
  function openAdd() {
    setEditing(null);
    setForm({ ...defaults });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v])));
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Daily Stockmanship Checks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stockYearFilter, onValueChange: setStockYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            stockYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printStock, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Check"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "checkDate", label: "Date", fmt: (r) => fmtDate(r.checkDate) },
          { key: "checkedBy", label: "Checked By" },
          { key: "mortalitiesFound", label: "Mortalities" },
          { key: "injuredFound", label: "Injured" },
          { key: "overallWelfare", label: "Welfare Status" },
          { key: "actionsRequired", label: "Actions Required" },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-stockmanship-checks", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-stockmanship", String(farmId)], compact: true }) }
        ],
        rows: checks,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Stockmanship Check — ",
        fmtDate(viewRecord.checkDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Checked By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.checkedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overall Welfare" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.overallWelfare ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mortalities Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.mortalitiesFound ?? 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Injured Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.injuredFound ?? 0) })
        ] }),
        !!viewRecord.actionsRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.actionsRequired) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "pig-stockmanship-checks", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Stockmanship Check" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Check Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.checkDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, checkDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Checked By *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: String(form.checkedBy ?? ""), onChange: (v) => setForm((f) => ({ ...f, checkedBy: v })), staffNames, loading: membersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mortalities Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: String(form.mortalitiesFound ?? "0"), onChange: (e) => setForm((f) => ({ ...f, mortalitiesFound: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Injured Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: String(form.injuredFound ?? "0"), onChange: (e) => setForm((f) => ({ ...f, injuredFound: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Welfare" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.overallWelfare ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, overallWelfare: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Excellent", "Good", "Satisfactory", "Requires Attention", "Urgent Action Needed"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "System Checks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: ["waterSystemOk", "feedSystemOk", "ventilationOk", "temperatureOk", "lightingOk", "beddingOk"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: k, checked: Boolean(form[k]), onCheckedChange: (v) => setForm((f) => ({ ...f, [k]: Boolean(v) })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: k, className: "text-xs", children: [
              k.replace(/Ok$/, "").replace(/([A-Z])/g, " $1").trim(),
              " OK"
            ] })
          ] }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.actionsRequired ?? ""), onChange: (e) => setForm((f) => ({ ...f, actionsRequired: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function TailBitingRisksTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: allRecords = [], isLoading } = useQuery({ queryKey: ["pig-tail-biting", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-tail-biting-risks`), { credentials: "include" }).then((r) => r.json()) });
  const { data: tbMembersData, isLoading: tbMembersLoading } = useFarmMembers(farmId);
  const tbStaffNames = (tbMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const tbYears = reactExports.useMemo(() => {
    const s = new Set(allRecords.map((r) => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allRecords]);
  const [tbYearFilter, setTbYearFilter] = reactExports.useState("all");
  const records = reactExports.useMemo(() => tbYearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.assessmentDate || "").startsWith(tbYearFilter)), [allRecords, tbYearFilter]);
  const printTb = () => {
    const rows = records;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tail Biting Risk Assessments</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Tail Biting Risk Assessments${tbYearFilter !== "all" ? ` — ${tbYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Assessed By</th><th>Risk Level</th><th>Biting Active?</th><th>Interventions</th><th>Review Date</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.assessedBy || "—"}</td><td>${r.riskLevel || "—"}</td><td>${r.currentBiting ? "Yes" : "No"}</td><td>${r.interventionsTaken || "—"}</td><td>${fmtDate(r.reviewDate)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-tail-biting-risks/${editing.id}`) : apiUrl(`farms/${farmId}/pig-tail-biting-risks`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-tail-biting", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-tail-biting-risks/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-tail-biting", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const defaults = { tailLengthAdequate: true, stockingDensityOk: true, enrichmentProvided: true, feedingSystemOk: true, healthStatusOk: true, currentBiting: false, tailsDockedAtBirth: false };
  function openAdd() {
    setEditing(null);
    setForm({ ...defaults });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v])));
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Tail Biting Risk Assessments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Red Tractor Pigs Standard — a written risk assessment is required. Review when risk factors change or biting is observed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tbYearFilter, onValueChange: setTbYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            tbYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printTb, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "New Assessment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "assessmentDate", label: "Date", fmt: (r) => fmtDate(r.assessmentDate) },
          { key: "assessedBy", label: "Assessed By" },
          { key: "riskLevel", label: "Risk Level" },
          { key: "currentBiting", label: "Biting Active?", fmt: (r) => r.currentBiting ? "Yes" : "No" },
          { key: "interventionsTaken", label: "Interventions" },
          { key: "reviewDate", label: "Review Date", fmt: (r) => fmtDate(r.reviewDate) },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-tail-biting-risks", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-tail-biting", String(farmId)], compact: true }) }
        ],
        rows: records,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Tail Biting Risk Assessment — ",
        fmtDate(viewRecord.assessmentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.assessedBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.riskLevel ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Biting Currently Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.currentBiting ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.reviewDate) })
        ] }),
        !!viewRecord.interventionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Interventions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.interventionsTaken) })
        ] }),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "pig-tail-biting-risks", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tail Biting Risk Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.assessmentDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: String(form.assessedBy ?? ""), onChange: (v) => setForm((f) => ({ ...f, assessedBy: v })), staffNames: tbStaffNames, loading: tbMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.riskLevel ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, riskLevel: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Low", "Medium", "High"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.monitoringFrequency ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, monitoringFrequency: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Daily", "Twice daily", "Every check", "Weekly"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mixing Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.mixingFrequency ?? ""), onChange: (e) => setForm((f) => ({ ...f, mixingFrequency: e.target.value })), placeholder: "e.g. Rarely / at weaning only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.reviewDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, reviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Risk Factor Checks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [["tailsDockedAtBirth", "Tails docked at birth"], ["tailLengthAdequate", "Tail length adequate"], ["stockingDensityOk", "Stocking density within limits"], ["enrichmentProvided", "Enrichment material provided"], ["feedingSystemOk", "Feeding system adequate"], ["healthStatusOk", "Good health status (no disease)"], ["currentBiting", "Tail biting currently observed"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: k, checked: Boolean(form[k]), onCheckedChange: (v) => setForm((f) => ({ ...f, [k]: Boolean(v) })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: k, className: "text-xs", children: l })
          ] }, k)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Enrichment Types" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.enrichmentTypes ?? ""), onChange: (e) => setForm((f) => ({ ...f, enrichmentTypes: e.target.value })), placeholder: "e.g. Straw, chains, hanging rope" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Biting Level (if active)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.bitingLevel ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, bitingLevel: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Minor — superficial", "Moderate — bleeding", "Severe — significant wound"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Interventions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.interventionsTaken ?? ""), onChange: (e) => setForm((f) => ({ ...f, interventionsTaken: e.target.value })), rows: 2, placeholder: "e.g. Separated bitten pigs, increased enrichment, reduced stocking density" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save Assessment" })
      ] })
    ] }) })
  ] });
}
function FarrowingEaseBadge({ v }) {
  if (!v) return null;
  const n = parseInt(v.charAt(0));
  const map = {
    1: { cls: "bg-green-100 text-green-700" },
    2: { cls: "bg-yellow-100 text-yellow-700" },
    3: { cls: "bg-orange-100 text-orange-700" },
    4: { cls: "bg-red-100 text-red-700" }
  };
  const d = map[n];
  if (!d) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded font-medium ${d.cls}`, children: v });
}
function FarrowingRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const EMPTY = {
    totalBornAlive: 0,
    totalBornDead: 0,
    totalMummified: 0,
    fostersIn: 0,
    fostersOut: 0,
    assistanceRequired: false,
    colostrumManaged: true
  };
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const [showManualVet, setShowManualVet] = reactExports.useState(false);
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = reactExports.useState(String(CURRENT_YEAR));
  const { data, isLoading } = useQuery({
    queryKey: ["pig-farrowing", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-farrowing-records`), { credentials: "include" }).then((r) => r.json())
  });
  const allRecords = Array.isArray(data) ? data : [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => r.farrowingDate?.startsWith(yearFilter));
  const vetVisitsQ = useQuery({
    queryKey: ["farrowing-vet-visits", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/vet-visits`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!form.vetAttended
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map((v) => v.vetName).filter(Boolean))];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter((v) => v.vetName && v.vetPractice).map((v) => [v.vetName, v.vetPractice])
  );
  const availableYears = [...new Set(allRecords.map((r) => r.farrowingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-farrowing-records/${editing.id}`) : apiUrl(`farms/${farmId}/pig-farrowing-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] });
      closeDialog();
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-farrowing-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setShowManualVet(false);
  }
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY, farrowingDate: todayStr });
    setShowManualVet(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setShowManualVet(!!(r.vetAttended && r.vetName && !uniqueVetNames.includes(r.vetName ?? "")));
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const totalBorn = (r) => (r.totalBornAlive || 0) + (r.totalBornDead || 0) + (r.totalMummified || 0);
  const weaningRate = (r) => {
    const alive = r.totalBornAlive || 0;
    const weaned = r.pigletsWeanedCount || 0;
    if (!alive) return null;
    return Math.round(weaned / alive * 100);
  };
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const farrowingAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "farrowing").map((c) => [c.recordId, c.count]));
  const contractorsQ = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/fallen-stock-contractors`), { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const contractors = contractorsQ.data ?? [];
  const hasDeadPiglets = (r) => (r.totalBornDead ?? 0) > 0 || (r.totalMummified ?? 0) > 0;
  function farrowingSeasonStats(recs) {
    const farrowings = recs.length;
    const totalBornAll = recs.reduce((s, r) => s + totalBorn(r), 0);
    const stillborns = recs.reduce((s, r) => s + (r.totalBornDead || 0), 0);
    const mummified = recs.reduce((s, r) => s + (r.totalMummified || 0), 0);
    const perinatal = stillborns + mummified;
    const pct = (n) => totalBornAll > 0 ? (n / totalBornAll * 100).toFixed(1) : "—";
    return { farrowings, totalBornAll, stillborns, mummified, perinatal, pct };
  }
  const currentFarrowingStats = farrowingSeasonStats(records);
  const farrowingYearlyStats = availableYears.map((y) => ({ year: y, ...farrowingSeasonStats(allRecords.filter((r) => r.farrowingDate?.startsWith(y))) }));
  function generateFarrowingReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const fv2 = (v) => v === null || v === void 0 || v === "" ? "—" : String(v);
    const yesNo = (v) => v === true ? "Yes" : v === false ? "No" : "—";
    const totalStillborns = records.reduce((s, r) => s + (r.totalBornDead || 0), 0);
    const totalMummifieds = records.reduce((s, r) => s + (r.totalMummified || 0), 0);
    const totalBornAll = records.reduce((s, r) => s + totalBorn(r), 0);
    const pctSB = totalBornAll > 0 ? (totalStillborns / totalBornAll * 100).toFixed(1) : "—";
    const pctMum = totalBornAll > 0 ? (totalMummifieds / totalBornAll * 100).toFixed(1) : "—";
    const rows = records.map((r) => {
      const dead = (r.totalBornDead || 0) + (r.totalMummified || 0);
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}` : dead > 0 ? "<span style='color:#b91c1c'>NOT RECORDED</span>" : "—";
      return `<tr>
        <td>${fmtD(r.farrowingDate)}</td>
        <td>${fv2(r.sowEarTag)}</td>
        <td>${r.parityNumber === 1 ? "Gilt" : r.parityNumber ? `P${r.parityNumber}` : "—"}</td>
        <td>${fv2(r.farrowingEase)}</td>
        <td>${totalBorn(r)}</td>
        <td>${r.totalBornAlive}</td>
        <td>${r.totalBornDead}</td>
        <td>${r.totalMummified}</td>
        <td>${r.averageBirthWeightKg ? `${r.averageBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumManaged)}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td style="font-size:9px">${disposalCell}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 60)}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Farrowing Records — Red Tractor Pigs Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .stats{display:flex;gap:20px;margin-bottom:12px;flex-wrap:wrap}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:6px 12px;font-size:10px}
  .stat strong{display:block;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Farrowing Records</h1><h2>Red Tractor Pigs Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Year filter: ${yearFilter}<br>Printed: ${printedDate}</div>
</div>
<div class="stats">
  <div class="stat"><strong>${records.length}</strong>Farrowings recorded</div>
  <div class="stat"><strong>${totalStillborns} (${pctSB}%)</strong>Stillbirths</div>
  <div class="stat"><strong>${totalMummifieds} (${pctMum}%)</strong>Mummified</div>
  <div class="stat"><strong>${totalBornAll}</strong>Total piglets born</div>
</div>
<table>
  <thead><tr>
    <th>Farrowing Date</th><th>Sow Tag</th><th>Parity</th><th>Ease</th><th>Total Born</th>
    <th>Alive</th><th>Stillborn</th><th>Mummified</th><th>Avg Wt</th><th>Colostrum</th><th>Assisted</th>
    <th>ABP Disposal</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This farrowing records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Pigs audit. Printed: ${printedDate}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Litter-level farrowing records — born alive/dead, fostering, avg birth weight, weaning performance, and sow assistance. Required for Red Tractor Pigs Standard compliance." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Pigs: farrowing performance must be recorded and available at audit. Retain records for a minimum of 3 years." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateFarrowingReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4 mr-1" }),
          "Farrowing Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Farrowing"
        ] })
      ] })
    ] }),
    allRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: [
        { label: "Farrowings", value: String(currentFarrowingStats.farrowings), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
        { label: "Total Piglets Born", value: String(currentFarrowingStats.totalBornAll), sub: "", colour: "" },
        { label: "Stillborn", value: `${currentFarrowingStats.stillborns}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.stillborns)}% of born`, colour: currentFarrowingStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
        { label: "Mummified", value: `${currentFarrowingStats.mummified}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.mummified)}% of born`, colour: currentFarrowingStats.mummified > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
        { label: "Perinatal Loss", value: `${currentFarrowingStats.perinatal}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.perinatal)}% of born`, colour: currentFarrowingStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" }
      ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`, children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mt-0.5", children: s.label }),
        s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
      ] }, s.label)) }),
      farrowingYearlyStats.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Year-by-Year Perinatal Mortality Trend" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Farrowings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Total Born" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Stillborn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Mummified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Perinatal Loss" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Bar" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: farrowingYearlyStats.map((s, i) => {
            const maxRate = Math.max(...farrowingYearlyStats.map((x) => Number(x.pct(x.perinatal)) || 0), 0.1);
            const rate = Number(s.pct(s.perinatal)) || 0;
            const barWidth = Math.round(rate / maxRate * 100);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: s.year }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.farrowings }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.totalBornAll }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                s.stillborns,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                  "(",
                  s.pct(s.stillborns),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right", children: [
                s.mummified,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                  "(",
                  s.pct(s.mummified),
                  "%)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-3 py-2 text-right font-semibold ${rate > 8 ? "text-red-600" : rate > 4 ? "text-amber-600" : "text-green-700"}`, children: [
                s.perinatal,
                " (",
                s.pct(s.perinatal),
                "%)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-gray-100 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded ${rate > 8 ? "bg-red-400" : rate > 4 ? "bg-amber-400" : "bg-green-400"}`, style: { width: `${barWidth}%` } }) }) })
            ] }, s.year);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red >8% perinatal loss · Amber 4–8% · Green <4%. Red Tractor Pigs may query rates significantly above industry benchmarks." }) })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No farrowing records yet. Log the first farrowing above." }) }),
      records.map((r) => {
        const total = totalBorn(r);
        const rate = weaningRate(r);
        const parityLabel = r.parityNumber === 1 ? "Gilt (P1)" : r.parityNumber ? `Parity ${r.parityNumber}` : null;
        const fostering = (r.fostersIn || 0) + (r.fostersOut || 0) > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmtDate(r.farrowingDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-mono", children: [
                "Sow: ",
                r.sowEarTag
              ] }),
              parityLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: parityLabel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FarrowingEaseBadge, { v: r.farrowingEase }),
              total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded", children: [
                total,
                " born total"
              ] }),
              r.totalBornAlive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: [
                r.totalBornAlive,
                " alive"
              ] }),
              r.totalBornDead > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded", children: [
                r.totalBornDead,
                " stillborn"
              ] }),
              r.totalMummified > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded", children: [
                r.totalMummified,
                " mummified"
              ] }),
              r.averageBirthWeightKg && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded", children: [
                "Avg birth ",
                r.averageBirthWeightKg,
                " kg"
              ] }),
              fostering && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded", children: [
                "Fostered ",
                r.fostersIn > 0 ? `+${r.fostersIn}` : "",
                r.fostersOut > 0 ? ` −${r.fostersOut}` : ""
              ] }),
              r.weaningDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded", children: [
                "Weaned ",
                r.pigletsWeanedCount ?? "?",
                rate !== null ? ` (${rate}%)` : "",
                " · ",
                fmtDate(r.weaningDate)
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded", children: "Not yet weaned" }),
              r.colostrumManaged !== null && r.colostrumManaged !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.colostrumManaged ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: r.colostrumManaged ? "Colostrum ✓" : "Colostrum not confirmed" }),
              hasDeadPiglets(r) && (r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "ABP disposal ✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: "⚠ ABP disposal not recorded" })),
              r.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: [
                "Vet: ",
                r.vetName || "attended"
              ] }),
              r.expectedFarrowingDate && (() => {
                const days = Math.floor((new Date(r.expectedFarrowingDate).getTime() - Date.now()) / 864e5);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`, children: [
                  "Expected: ",
                  fmtDate(r.expectedFarrowingDate)
                ] });
              })(),
              (farrowingAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                farrowingAttachMap[r.id]
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1 rounded hover:bg-gray-100 text-red-300 hover:text-red-600", onClick: () => setConfirmDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1.5", children: r.notes })
        ] }) }, r.id);
      })
    ] }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Farrowing Record — ",
        viewRecord.sowEarTag
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Farrowing Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.farrowingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Farrowing Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.expectedFarrowingDate ? fmtDate(viewRecord.expectedFarrowingDate) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.sowEarTag })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.sowBreed || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Parity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.parityNumber === 1 ? "1 — Gilt" : viewRecord.parityNumber ? `Parity ${viewRecord.parityNumber}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Farrowing Ease" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.farrowingEase || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Born Alive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalBornAlive })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Born Dead" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalBornDead })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Mummified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.totalMummified })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fosters In" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fostersIn })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fosters Out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fostersOut })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg Birth Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.averageBirthWeightKg ? `${viewRecord.averageBirthWeightKg} kg` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum Managed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumManaged === true ? "Yes ✓" : viewRecord.colostrumManaged === false ? "Not confirmed" : "—" })
        ] }),
        hasDeadPiglets(viewRecord) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border rounded-md bg-amber-50 border-amber-200 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2", children: "ABP Perinatal Disposal (Category 3)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalCollectionDate ? new Date(viewRecord.perinatalCollectionDate).toLocaleDateString("en-GB") : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Consignment / NFAS Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalCollectionRef || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalMethod || "—" })
            ] }),
            viewRecord.perinatalDisposalNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Disposal Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.perinatalDisposalNotes })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceRequired ? "Yes" : "No" })
        ] }),
        viewRecord.assistanceDetails && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceDetails })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Attended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAttended ? "Yes" : "No" })
        ] }),
        viewRecord.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Weaning Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.weaningDate ? fmtDate(viewRecord.weaningDate) : "Not yet weaned" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Piglets Weaned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.pigletsWeanedCount ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Avg Weaning Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.averageWeaningWeightKg ? `${viewRecord.averageWeaningWeightKg} kg` : "—" })
        ] }),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "farrowing", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: confirmDelete !== null, onOpenChange: (o) => {
      if (!o) {
        setConfirmDelete(null);
        del.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Farrowing Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This will permanently remove this farrowing record. This action cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: del, message: "Failed to delete record — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfirmDelete(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => confirmDelete !== null && del.mutate(confirmDelete), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        closeDialog();
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Farrowing Record" : "Log Farrowing" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Sow Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farrowing Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.farrowingDate?.slice(0, 10) || "", onChange: (e) => set("farrowingDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sow Ear Tag *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sowEarTag || "", onChange: (e) => set("sowEarTag", e.target.value), placeholder: "UK ear tag" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Farrowing Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedFarrowingDate?.slice(0, 10) || "", onChange: (e) => set("expectedFarrowingDate", e.target.value || null) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Set before birth to track in Week Ahead" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sow Breed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sowBreed || "", onValueChange: (v) => set("sowBreed", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Large White", "Landrace", "Duroc", "Hampshire", "Pietrain", "Berkshire", "Oxford Sandy & Black", "Welsh", "British Lop", "Hybrid / commercial cross", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parity Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.parityNumber ?? "", onChange: (e) => set("parityNumber", e.target.value ? parseInt(e.target.value) : null), placeholder: "1 = gilt" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "1 = first litter (gilt)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farrowing Ease" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.farrowingEase || "__none__", onValueChange: (v) => set("farrowingEase", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select ease score..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1 — Unassisted", children: "1 — Unassisted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2 — Minor assistance", children: "2 — Minor assistance (1 person)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3 — Major assistance", children: "3 — Major assistance" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4 — Vet required", children: "4 — Vet required" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Litter Performance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Born Alive *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.totalBornAlive ?? 0, onChange: (e) => set("totalBornAlive", parseInt(e.target.value) || 0) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Stillbirths" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.totalBornDead ?? 0, onChange: (e) => set("totalBornDead", parseInt(e.target.value) || 0) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mummified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.totalMummified ?? 0, onChange: (e) => set("totalMummified", parseInt(e.target.value) || 0) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Birth Weight (kg)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.averageBirthWeightKg ?? "", onChange: (e) => set("averageBirthWeightKg", e.target.value || null), placeholder: "e.g. 1.35" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Recommended — weigh a sample if not all. Target ≥1.2 kg." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                  "Total born: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (form.totalBornAlive || 0) + (form.totalBornDead || 0) + (form.totalMummified || 0) })
                ] }),
                (form.totalBornAlive || 0) > 0 && (form.totalBornDead || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
                  "Stillbirth rate: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    Math.round((form.totalBornDead || 0) / ((form.totalBornAlive || 0) + (form.totalBornDead || 0) + (form.totalMummified || 0)) * 100),
                    "%"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fosters In" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.fostersIn ?? 0, onChange: (e) => set("fostersIn", parseInt(e.target.value) || 0) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Piglets moved onto this sow" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fosters Out" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.fostersOut ?? 0, onChange: (e) => set("fostersOut", parseInt(e.target.value) || 0) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Piglets moved off this sow" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Weaning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Can be completed later once the litter is weaned. Minimum weaning age is 28 days (21 days with dispensation)." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Weaning Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.weaningDate?.slice(0, 10) || "", onChange: (e) => set("weaningDate", e.target.value || null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Piglets Weaned" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.pigletsWeanedCount ?? "", onChange: (e) => set("pigletsWeanedCount", e.target.value ? parseInt(e.target.value) : null) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Avg Weaning Weight (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.averageWeaningWeightKg ?? "", onChange: (e) => set("averageWeaningWeightKg", e.target.value || null), placeholder: "e.g. 7.5", className: "w-40" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-64 flex-shrink-0 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Assistance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "farr-ar", checked: !!form.assistanceRequired, onCheckedChange: (v) => {
                set("assistanceRequired", !!v);
                if (!v) set("assistanceDetails", null);
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farr-ar", className: "text-sm", children: "Assistance required" })
            ] }),
            form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assistance Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.assistanceDetails || "", onChange: (e) => set("assistanceDetails", e.target.value), rows: 3, placeholder: "e.g. 2 piglets presented incorrectly, manual repositioning required. Vet not needed." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Vet Attendance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "farr-vet", checked: !!form.vetAttended, onCheckedChange: (v) => {
                set("vetAttended", !!v);
                if (!v) {
                  set("vetName", null);
                  setShowManualVet(false);
                }
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farr-vet", className: "text-sm", children: "Vet attended this farrowing" })
            ] }),
            form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Vet Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "(for invoice reconciliation)" })
              ] }),
              !showManualVet && uniqueVetNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vetName || "__none__", onValueChange: (v) => set("vetName", v === "__none__" ? null : v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from Vet Ledger…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select vet —" }),
                    uniqueVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: n, children: [
                      n,
                      vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""
                    ] }, n))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowManualVet(true), children: "Enter manually" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet name…", className: "flex-1" }),
                uniqueVetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowManualVet(false), children: "Use ledger" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600", children: "Vet name is matched against the Vet Ledger for invoice reconciliation." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Colostrum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "All piglets should receive colostrum within 12–24 hours of birth. Confirm management was completed." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "farr-col", checked: !!form.colostrumManaged, onCheckedChange: (v) => set("colostrumManaged", !!v) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "farr-col", className: "text-sm", children: "Colostrum management confirmed" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), placeholder: "Any additional observations...", rows: 4 })
          ] })
        ] })
      ] }),
      hasDeadPiglets(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "ABP Perinatal Disposal — Category 3 (Required)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Stillborn and mummified piglets are Category 3 Animal By-Product waste (Regulation (EC) 1069/2009). They must be collected by a licensed fallen stock contractor or disposed of via another approved route. Retain the collection note for at least 3 years." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fallen Stock Contractor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : "", onValueChange: (v) => set("perinatalDisposalContractorId", v ? Number(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contractor…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                contractors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                  c.name,
                  " (",
                  c.approvalNumber,
                  ")"
                ] }, c.id)),
                contractors.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", disabled: true, children: "No contractors set up — add in Livestock settings" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.perinatalCollectionDate?.slice(0, 10) || "", onChange: (e) => set("perinatalCollectionDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consignment / NFAS Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalCollectionRef || "", onChange: (e) => set("perinatalCollectionRef", e.target.value), placeholder: "e.g. NFAS-LIN-0042-240317" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Method (if no contractor)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalMethod || "", onChange: (e) => set("perinatalDisposalMethod", e.target.value), placeholder: "e.g. Hunt kennels, on-farm incinerator" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disposal Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.perinatalDisposalNotes || "", onChange: (e) => set("perinatalDisposalNotes", e.target.value), placeholder: "Any additional disposal notes…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeDialog, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending || !form.sowEarTag || !form.farrowingDate, onClick: () => save.mutate(form), children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }),
          "Saving…"
        ] }) : editing ? "Save Changes" : "Log Farrowing" })
      ] })
    ] }) })
  ] });
}
function PigRedTractorChecklistTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: allRtcRecords = [], isLoading } = useQuery({ queryKey: ["pig-rt-checklist", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-red-tractor-checklists`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []) });
  const [rtcYearFilter, setRtcYearFilter] = reactExports.useState("all");
  const rtcYears = reactExports.useMemo(() => Array.from(new Set(allRtcRecords.map((r) => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRtcRecords]);
  const records = reactExports.useMemo(() => rtcYearFilter === "all" ? allRtcRecords : allRtcRecords.filter((r) => String(r.assessmentDate || "").startsWith(rtcYearFilter)), [allRtcRecords, rtcYearFilter]);
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/pig-red-tractor-checklists/${editing.id}`) : apiUrl(`farms/${farmId}/pig-red-tractor-checklists`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-red-tractor-checklists/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const BoolField = ({ label, field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: field, checked: Boolean(form[field]), onCheckedChange: (v) => setForm((f) => ({ ...f, [field]: Boolean(v) })) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: field, className: "text-sm", children: label })
  ] });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  function printRtcRecords() {
    const rows = records;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>RT Pig Checklists</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Red Tractor Pig Compliance Checklists${rtcYearFilter !== "all" ? ` — ${rtcYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Assessor</th><th>Certificate No.</th><th>Overall Status</th><th>Next Due</th><th>Non-conformances</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.assessorName || "—"}</td><td>${r.certificateNumber || "—"}</td><td>${r.overallStatus || "—"}</td><td>${fmtDate(r.nextAssessmentDue)}</td><td>${r.nonConformances || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Red Tractor Pig Compliance Checklist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record Red Tractor Pigs Standard self-assessment results. Each major standard area is checked to maintain farm assurance status. Assessments should be carried out at least annually or following any significant changes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rtcYearFilter, onValueChange: setRtcYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            rtcYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printRtcRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ assessmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), overallStatus: "pass" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "assessmentDate", label: "Assessment Date", fmt: (r) => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "overallStatus", label: "Overall Status" },
          { key: "nextAssessmentDue", label: "Next Due", fmt: (r) => fmtDate(r.nextAssessmentDue) },
          { key: "nonConformances", label: "Non-conformances" },
          { key: "doc", label: "Document", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-red-tractor-checklists", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-rt-checklist", String(farmId)] }) }
        ],
        rows: records,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        onView: setViewRecord
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "54rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Red Tractor Pig Self-Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.assessmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.assessorName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certificateNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overall Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium uppercase", children: String(viewRecord.overallStatus ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.nextAssessmentDue) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-2", children: "Compliance Items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs", children: [
        ["medicinesRecorded", "Medicines & veterinary treatments recorded correctly"],
        ["withdrawalPeriodsObserved", "Withdrawal periods observed (no residue failures)"],
        ["movementsRecorded", "Pig movements / eAML2 records up to date"],
        ["feedRecordsKept", "Feed records maintained (source, batch, HACCP)"],
        ["waterQualityChecked", "Water supply quality checked / tested"],
        ["identificationCorrect", "Identification / tagging correct for all pigs"],
        ["stockmanshipChecked", "Stockmanship daily checks evidenced"],
        ["bodyConditionScored", "Body condition scored and recorded"],
        ["tailBitingRiskAssessed", "Tail biting risk assessment completed"],
        ["tailDockingJustified", "Tail docking justification documented"],
        ["boarTuskTrimmed", "Boar tusk trimming recorded"],
        ["enrichmentProvided", "Environmental enrichment provided"],
        ["ventilationAdequate", "Ventilation and thermal environment adequate"],
        ["housingStructuralOk", "Building / housing structural integrity checked"],
        ["pestControlCurrent", "Pest and vermin control records current"],
        ["biosecurityInPlace", "Biosecurity protocols in place and enforced"],
        ["casualtyDisposalCompliant", "Casualty / fallen stock disposal compliant"],
        ["vetHealthPlanReviewed", "Vet health plan reviewed within 12 months"],
        ["emergencyPlanInPlace", "Emergency plan / out-of-hours contact available"],
        ["trainingRecordsKept", "Farm training / competence records maintained"]
      ].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-gray-50 pb-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: l }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: viewRecord[k] ? "text-green-600 font-medium" : "text-red-600 font-medium", children: viewRecord[k] ? "Yes" : "No" })
      ] }, k)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Non-conformances / Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.nonConformances ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Corrective Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.correctiveActions ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        (String(viewRecord.overallStatus) === "fail" || String(viewRecord.overallStatus) === "conditional-pass") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "text-purple-700 border-purple-200 hover:bg-purple-50 mr-auto", onClick: () => {
          setRaiseTaskFor(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Corrective Action Task"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: "Corrective Action — Red Tractor Pig Assessment",
        defaultDescription: String(raiseTaskFor.correctiveActions ?? "") || `Assessment date: ${raiseTaskFor.assessmentDate ?? "—"} · Status: ${raiseTaskFor.overallStatus ?? "—"} · Non-conformances: ${raiseTaskFor.nonConformances ?? "—"}`,
        taskType: "compliance_corrective",
        module: "pig-production",
        onAssigned: () => setRaiseTaskFor(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "54rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Red Tractor Pig Self-Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.assessmentDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.assessorName ?? ""), onChange: (e) => setForm((f) => ({ ...f, assessorName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.certificateNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, certificateNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.overallStatus ?? "pass"), onValueChange: (v) => setForm((f) => ({ ...f, overallStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["pass", "conditional-pass", "fail", "pending"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Assessment Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.nextAssessmentDue ?? ""), onChange: (e) => setForm((f) => ({ ...f, nextAssessmentDue: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-2", children: "RT Pig Standard Compliance Items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Medicines & veterinary treatments recorded correctly", field: "medicinesRecorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Withdrawal periods observed (no residue failures)", field: "withdrawalPeriodsObserved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Pig movements / eAML2 records up to date", field: "movementsRecorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Feed records maintained (source, batch, HACCP)", field: "feedRecordsKept" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Water supply quality checked / tested", field: "waterQualityChecked" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Identification / tagging correct for all pigs", field: "identificationCorrect" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Stockmanship daily checks evidenced", field: "stockmanshipChecked" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Body condition scored and recorded", field: "bodyConditionScored" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Tail biting risk assessment completed", field: "tailBitingRiskAssessed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Tail docking justification documented (if applicable)", field: "tailDockingJustified" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Boar tusk trimming recorded (if applicable)", field: "boarTuskTrimmed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Environmental enrichment provided", field: "enrichmentProvided" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Ventilation and thermal environment adequate", field: "ventilationAdequate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Building / housing structural integrity checked", field: "housingStructuralOk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Pest and vermin control records current", field: "pestControlCurrent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Biosecurity protocols in place and enforced", field: "biosecurityInPlace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Casualty / fallen stock disposal compliant", field: "casualtyDisposalCompliant" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Vet health plan reviewed within 12 months", field: "vetHealthPlanReviewed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Emergency plan / out-of-hours contact available", field: "emergencyPlanInPlace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BoolField, { label: "Farm training / competence records maintained", field: "trainingRecordsKept" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Non-conformances / Observations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.nonConformances ?? ""), onChange: (e) => setForm((f) => ({ ...f, nonConformances: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Actions Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.correctiveActions ?? ""), onChange: (e) => setForm((f) => ({ ...f, correctiveActions: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save Assessment" })
      ] })
    ] }) })
  ] });
}
const ROUTES = ["Injection", "Oral (individual)", "In-water medication", "In-feed medication", "Topical / pour-on", "Other"];
const UNITS = ["ml", "g", "kg", "L", "tablets", "sachets", "other"];
function WithdrawalBadge({ endDate }) {
  if (!endDate) return null;
  const today = /* @__PURE__ */ new Date();
  const end = new Date(endDate);
  const inWithdrawal = end > today;
  if (inWithdrawal) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#fee2e2", color: "#991b1b", border: "none" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1" }),
      "In Withdrawal until ",
      fmtDate(endDate)
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "text-xs", style: { background: "#dcfce7", color: "#166534", border: "none" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 mr-1" }),
    "Withdrawal Clear"
  ] });
}
function MedicineRegisterTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["pig-medicine-treatments", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-medicine-treatments`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const { data: flocks = [] } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then((r) => r.json())
  });
  const flockMap = new Map(flocks.map((f) => [String(f.id), String(f.flockName)]));
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-medicine-treatments/${editing.id}`) : apiUrl(`farms/${farmId}/pig-medicine-treatments`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-medicine-treatments", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-medicine-treatments/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-medicine-treatments", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const EMPTY_FORM = {
    treatmentDate: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
    flockId: "",
    batchOrPenRef: "",
    numberOfAnimals: "",
    medicineProductName: "",
    activeIngredient: "",
    manufacturer: "",
    productBatchNumber: "",
    expiryDate: "",
    administrationRoute: "Injection",
    quantityUsed: "",
    unitOfMeasure: "ml",
    diagnosisReason: "",
    prescribingVetName: "",
    prescribingVetPractice: "",
    prescriptionObtained: false,
    administeredBy: "",
    withdrawalPeriodMeatDays: "",
    notes: ""
  };
  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : typeof v === "boolean" ? v : String(v)])));
    setOpen(true);
  }
  const allSorted = [...treatments].sort((a, b) => String(b.treatmentDate ?? "").localeCompare(String(a.treatmentDate ?? "")));
  const medYears = reactExports.useMemo(() => {
    const s = new Set(allSorted.map((r) => String(r.treatmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allSorted]);
  const [medYearFilter, setMedYearFilter] = reactExports.useState("all");
  const sorted = reactExports.useMemo(() => medYearFilter === "all" ? allSorted : allSorted.filter((r) => String(r.treatmentDate || "").startsWith(medYearFilter)), [allSorted, medYearFilter]);
  const activeWithdrawals = allSorted.filter((r) => r.withdrawalEndDate && new Date(r.withdrawalEndDate) > /* @__PURE__ */ new Date());
  const printMed = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Medicine Register</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:3px 6px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Medicine Register${medYearFilter !== "all" ? ` — ${medYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Product</th><th>Animals</th><th>Route</th><th>Quantity</th><th>Vet</th><th>Withdrawal End</th><th>Reason</th></tr></thead><tbody>${sorted.map((r) => `<tr><td>${fmtDate(r.treatmentDate)}</td><td>${r.medicineProductName || "—"}</td><td>${r.numberOfAnimals || "—"}</td><td>${r.administrationRoute || "—"}</td><td>${r.quantityUsed || "—"} ${r.unitOfMeasure || ""}</td><td>${r.prescribingVetName || "—"}</td><td>${fmtDate(r.withdrawalEndDate)}</td><td>${r.diagnosisReason || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    activeWithdrawals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-red-200 bg-red-50 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-red-500 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-red-800", children: [
          activeWithdrawals.length,
          " active withdrawal period",
          activeWithdrawals.length > 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "Do not send these animals for slaughter until withdrawal period has expired." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Medicine Register — Batch / Group Level" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Records required under Veterinary Medicines Regulations 2013. Retain for minimum 5 years." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: medYearFilter, onValueChange: setMedYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            medYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMed, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Treatment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No medicine treatments recorded yet. Log batch treatments using the button above." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sorted.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fmt(r.medicineProductName) }),
            !!r.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsx(WithdrawalBadge, { endDate: r.withdrawalEndDate })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Date:" }),
              " ",
              fmtDate(r.treatmentDate)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Animals:" }),
              " ",
              fmt(r.numberOfAnimals)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Route:" }),
              " ",
              fmt(r.administrationRoute)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Qty:" }),
              " ",
              fmt(r.quantityUsed),
              r.unitOfMeasure ? ` ${String(r.unitOfMeasure)}` : ""
            ] }),
            !!r.flockId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Group:" }),
              " ",
              flockMap.get(String(r.flockId)) ?? fmt(r.flockId)
            ] }),
            !!r.batchOrPenRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Batch/Pen:" }),
              " ",
              fmt(r.batchOrPenRef)
            ] }),
            !!r.diagnosisReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Reason:" }),
              " ",
              fmt(r.diagnosisReason)
            ] }),
            !!r.prescribingVetName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Vet:" }),
              " ",
              fmt(r.prescribingVetName)
            ] }),
            !!r.productBatchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground/70", children: "Batch No.:" }),
              " ",
              fmt(r.productBatchNumber)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 pt-1.5 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-medicine-treatments", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-medicine-treatments", String(farmId)] }) })
    ] }, i)) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Medicine Treatment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.treatmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.numberOfAnimals ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Production Group / Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: flockMap.get(String(viewRecord.flockId)) ?? String(viewRecord.flockId ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Batch / Pen Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.batchOrPenRef ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Medicine Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.medicineProductName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.activeIngredient ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.manufacturer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.productBatchNumber ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.expiryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Administration Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.administrationRoute ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity Used" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.quantityUsed),
            viewRecord.unitOfMeasure ? ` ${String(viewRecord.unitOfMeasure)}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Diagnosis / Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.diagnosisReason ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescribing Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.prescribingVetName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Practice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.prescribingVetPractice ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Obtained" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.prescriptionObtained ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Administered By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.administeredBy ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal Period (Meat Days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.withdrawalPeriodMeatDays ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.withdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      if (!v) {
        setOpen(false);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Treatment Record" : "Record Medicine Treatment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Batch/group level recording" }),
          " — record which pen, batch, or production group was treated. No individual ear tags required for pigs."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Treatment Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.treatmentDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, treatmentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Number of Animals Treated *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: String(form.numberOfAnimals ?? ""), onChange: (e) => setForm((f) => ({ ...f, numberOfAnimals: e.target.value })), placeholder: "e.g. 12" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Production Group / Herd" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.flockId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, flockId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd / group" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
                flocks.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: String(f.flockName) }, String(f.id)))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Batch / Pen Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.batchOrPenRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, batchOrPenRef: e.target.value })), placeholder: "e.g. Pen 4, Batch W22-01" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-gray-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Medicine Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Medicine Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.medicineProductName ?? ""), onChange: (e) => setForm((f) => ({ ...f, medicineProductName: e.target.value })), placeholder: "e.g. Alamycin LA 300mg/ml" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Active Ingredient" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.activeIngredient ?? ""), onChange: (e) => setForm((f) => ({ ...f, activeIngredient: e.target.value })), placeholder: "e.g. Oxytetracycline" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Manufacturer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.manufacturer ?? ""), onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })), placeholder: "e.g. Norbrook" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Product Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.productBatchNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, productBatchNumber: e.target.value })), placeholder: "e.g. BN1234/A" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Product Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expiryDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-gray-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Administration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Route of Administration *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.administrationRoute ?? "Injection"), onValueChange: (v) => setForm((f) => ({ ...f, administrationRoute: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROUTES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Administered By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.administeredBy ?? ""), onChange: (e) => setForm((f) => ({ ...f, administeredBy: e.target.value })), placeholder: "Name of person" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Quantity Used *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "flex-1", value: String(form.quantityUsed ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityUsed: e.target.value })), placeholder: "e.g. 25" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.unitOfMeasure ?? "ml"), onValueChange: (v) => setForm((f) => ({ ...f, unitOfMeasure: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: UNITS.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: u, children: u }, u)) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Diagnosis / Reason for Treatment *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.diagnosisReason ?? ""), onChange: (e) => setForm((f) => ({ ...f, diagnosisReason: e.target.value })), placeholder: "e.g. PRRS, respiratory disease" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-gray-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Veterinary Prescription" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Prescribing Vet Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.prescribingVetName ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescribingVetName: e.target.value })), placeholder: "e.g. Dr. A. Smith" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Vet Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.prescribingVetPractice ?? ""), onChange: (e) => setForm((f) => ({ ...f, prescribingVetPractice: e.target.value })), placeholder: "e.g. Farm Vet Services Ltd" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "prescObtained", checked: Boolean(form.prescriptionObtained), onCheckedChange: (v) => setForm((f) => ({ ...f, prescriptionObtained: Boolean(v) })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prescObtained", className: "text-sm", children: "Written prescription obtained" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "border-gray-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Withdrawal Period" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Withdrawal Period — Meat (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: String(form.withdrawalPeriodMeatDays ?? ""), onChange: (e) => setForm((f) => ({ ...f, withdrawalPeriodMeatDays: e.target.value })), placeholder: "e.g. 28" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pb-2", children: "Withdrawal end date is calculated automatically from treatment date + withdrawal days." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs mb-1 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Any additional notes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: save.isPending || !form.treatmentDate || !form.numberOfAnimals || !form.medicineProductName || !form.quantityUsed || !form.diagnosisReason,
            onClick: () => save.mutate(form),
            children: editing ? "Update Record" : "Save Record"
          }
        )
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Treatment Record — ",
        fmt(viewRecord.medicineProductName)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        !!viewRecord.withdrawalEndDate && /* @__PURE__ */ jsxRuntimeExports.jsx(WithdrawalBadge, { endDate: viewRecord.withdrawalEndDate }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-1", children: [["treatmentDate", "Treatment Date", fmtDate], ["numberOfAnimals", "Animals Treated"], ["administrationRoute", "Route"], ["quantityUsed", "Quantity Used"], ["unitOfMeasure", "Unit"], ["flockId", "Group", (v) => flockMap.get(String(v)) ?? fmt(v)], ["batchOrPenRef", "Batch/Pen Ref"], ["medicineProductName", "Product Name"], ["activeIngredient", "Active Ingredient"], ["manufacturer", "Manufacturer"], ["productBatchNumber", "Product Batch No."], ["expiryDate", "Product Expiry", fmtDate], ["diagnosisReason", "Reason / Diagnosis"], ["prescribingVetName", "Prescribing Vet"], ["prescribingVetPractice", "Vet Practice"], ["prescriptionObtained", "Prescription Obtained", (v) => v ? "Yes" : "No"], ["administeredBy", "Administered By"], ["withdrawalPeriodMeatDays", "Withdrawal (days)"], ["withdrawalEndDate", "Withdrawal End", fmtDate], ["notes", "Notes"]].map(([key, label, fmtFn]) => {
          const val = viewRecord[key];
          if (val == null || val === "") return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: key === "diagnosisReason" || key === "notes" ? "col-span-2" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtFn ? fmtFn(val) : fmt(val) })
          ] }, key);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "pig-medicine-treatments", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) })
  ] });
}
function StatusDot({ status }) {
  const cls = status === "green" ? "bg-green-500" : status === "amber" ? "bg-amber-400" : status === "red" ? "bg-red-500" : "bg-gray-300";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-2 h-2 rounded-full ${cls} shrink-0` });
}
function ComplianceCard({ title, icon, item, tab, onGoto }) {
  const borderCls = item.status === "green" ? "border-green-200 hover:border-green-400" : item.status === "amber" ? "border-amber-200 hover:border-amber-400" : item.status === "red" ? "border-red-200 hover:border-red-400" : "border-gray-200";
  const bgCls = item.status === "green" ? "bg-green-50" : item.status === "amber" ? "bg-amber-50" : item.status === "red" ? "bg-red-50" : "bg-gray-50";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onGoto(tab), className: `w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${borderCls} ${bgCls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusDot, { status: item.status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: item.message }),
    item.lastEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/60 mt-1", children: [
      "Last: ",
      item.lastEntry
    ] })
  ] });
}
function OverviewTab({ farmId, onGoto }) {
  const { data, isLoading } = useQuery({
    queryKey: ["pig-compliance-summary", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-compliance-summary`), { credentials: "include" }).then((r) => r.json()),
    refetchInterval: 6e4
  });
  const summary = data?.summary;
  const statuses = summary ? Object.values(summary) : [];
  const overallStatus = !summary ? "grey" : statuses.some((s) => s.status === "red") ? "red" : statuses.some((s) => s.status === "amber") ? "amber" : "green";
  const redCount = statuses.filter((s) => s.status === "red").length;
  const amberCount = statuses.filter((s) => s.status === "amber").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Red Tractor Pig Compliance Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Live status across all 10 pig record categories. Click any card to jump to that tab." })
      ] }),
      summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shrink-0 ${overallStatus === "red" ? "bg-red-100 text-red-700" : overallStatus === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: [
        overallStatus === "green" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }) : overallStatus === "amber" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5" }),
        overallStatus === "green" ? "All Clear" : overallStatus === "amber" ? `${amberCount} Need${amberCount === 1 ? "s" : ""} Attention` : `${redCount} Issue${redCount > 1 ? "s" : ""} Require Action`
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4" }),
      "Loading compliance status…"
    ] }),
    summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Herd Setup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Herds / Groups", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "w-4 h-4" }), item: summary.flocks, tab: "flocks", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Movements", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4" }), item: summary.movements, tab: "movements", onGoto })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Daily Compliance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Stockmanship Checks", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-4 h-4" }), item: summary.stockmanship, tab: "stockmanship", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Feed Records", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { className: "w-4 h-4" }), item: summary.feed, tab: "feed", onGoto })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Treatments & Slaughter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Medicine Register", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { className: "w-4 h-4" }), item: summary.medicine, tab: "medicine", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "FCI Documents", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }), item: summary.fci, tab: "fci", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Farrowing Records", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Baby, { className: "w-4 h-4" }), item: summary.farrowing, tab: "farrowing", onGoto })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Health & Welfare" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Vet Assessments", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-4 h-4" }), item: summary.vet, tab: "vet", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Tail Biting Risk", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }), item: summary.tailBiting, tab: "tail-biting", onGoto }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceCard, { title: "Red Tractor Checklist", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4" }), item: summary.redTractor, tab: "red-tractor", onGoto })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-pink-200 bg-pink-50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-pink-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-pink-700", children: "Scheme Compliance Status" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-pink-600", children: summary.redTractor.message })
      ] })
    ] })
  ] });
}
function KillRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: allKillRecords = [], isLoading } = useQuery({
    queryKey: ["pig-kill-records", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-kill-records`), { credentials: "include" }).then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object" && "records" in d && Array.isArray(d.records)) return d.records;
      return [];
    })
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const killYears = reactExports.useMemo(() => {
    const s = new Set(allKillRecords.map((r) => String(r.killDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allKillRecords]);
  const [killYearFilter, setKillYearFilter] = reactExports.useState("all");
  const records = reactExports.useMemo(() => killYearFilter === "all" ? allKillRecords : allKillRecords.filter((r) => String(r.killDate || "").startsWith(killYearFilter)), [allKillRecords, killYearFilter]);
  const printKill = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Kill Records</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:3px 6px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Kill Records${killYearFilter !== "all" ? ` — ${killYearFilter}` : ""}</h2><table><thead><tr><th>Kill Date</th><th>Processor</th><th>Head</th><th>Total DW (kg)</th><th>Avg DW (kg)</th><th>P2 (mm)</th><th>Grade</th><th>Net Payment</th><th>Kill Sheet Ref</th></tr></thead><tbody>${records.map((r) => `<tr><td>${fmtDate(r.killDate)}</td><td>${r.processor || "—"}</td><td>${r.headCount || "—"}</td><td>${r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—"}</td><td>${r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—"}</td><td>${r.averageP2BackfatMm ? parseFloat(String(r.averageP2BackfatMm)).toFixed(1) : "—"}</td><td>${r.gradeOut || "—"}</td><td>${r.netPaymentPence ? `£${(Number(r.netPaymentPence) / 100).toFixed(2)}` : "—"}</td><td>${r.killSheetRef || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const save = useMutation({
    mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/pig-kill-records/${editing.id}`) : apiUrl(`farms/${farmId}/pig-kill-records`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(b)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-kill-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const totalDeadweight = records.reduce((s, r) => s + parseFloat(String(r.totalDeadweightKg ?? "0") || "0"), 0);
  const totalHead = records.reduce((s, r) => s + (Number(r.headCount) || 0), 0);
  const avgP2 = records.length > 0 ? records.reduce((s, r) => s + parseFloat(String(r.averageP2BackfatMm ?? "0") || "0"), 0) / records.filter((r) => r.averageP2BackfatMm).length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: totalHead.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Deadweight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold", children: [
            totalDeadweight.toFixed(0),
            " kg"
          ] })
        ] }),
        avgP2 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg P2 Backfat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold", children: [
            avgP2.toFixed(1),
            " mm"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: killYearFilter, onValueChange: setKillYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            killYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printKill, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Kill Record"
        ] })
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) }),
    !isLoading && records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No pig kill records yet. Add your first abattoir kill sheet." }),
    !isLoading && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3", children: "Kill Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3", children: "Processor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-3", children: "Head" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-3", children: "Deadweight (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-3", children: "Avg DW (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-3", children: "P2 (mm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3", children: "Grade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-3", children: "Net (£)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3", children: "Kill Sheet Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3", children: "Document" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-muted/30 cursor-pointer", onClick: () => setViewRecord(r), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 font-medium", children: fmtDate(r.killDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(r.processor) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right", children: fmt(r.headCount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right", children: r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right", children: r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right", children: r.averageP2BackfatMm ? `${parseFloat(String(r.averageP2BackfatMm)).toFixed(1)}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: fmt(r.gradeOut) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-right", children: r.netPaymentPence ? `£${(Number(r.netPaymentPence) / 100).toFixed(2)}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(r.killSheetRef) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-kill-records", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-kill-records", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pl-2 flex gap-1", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 w-7 p-0 text-destructive hover:text-destructive", onClick: () => setConfirmDelete(Number(r.id)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] })
      ] }, String(r.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm({});
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Kill Record" : "Add Pig Kill Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        [
          ["killDate", "Kill Date", "date"],
          ["processor", "Processor / Abattoir", "text"],
          ["headCount", "Head Count", "number"],
          ["totalDeadweightKg", "Total Deadweight (kg)", "number"],
          ["averageDeadweightKg", "Avg Deadweight (kg)", "number"],
          ["pricePerKgPence", "Price per kg (pence)", "number"],
          ["grossValuePence", "Gross Value (pence)", "number"],
          ["levelDeductionPence", "Levy Deduction (pence)", "number"],
          ["transportDeductionPence", "Transport Deduction (pence)", "number"],
          ["otherDeductionsPence", "Other Deductions (pence)", "number"],
          ["netPaymentPence", "Net Payment (pence)", "number"],
          ["averageP2BackfatMm", "Avg P2 Backfat (mm)", "number"],
          ["averageMuscleDepthMm", "Avg Muscle Depth (mm)", "number"],
          ["leanMeatPct", "Lean Meat %", "number"],
          ["gradeOut", "Grade Out (R/O/P…)", "text"],
          ["sppPriceKgPence", "SPP Price/kg (pence)", "number"],
          ["sppVariancePence", "SPP Variance (pence)", "number"],
          ["killSheetRef", "Kill Sheet Reference", "text"],
          ["herdMark", "Herd Mark", "text"],
          ["premiumScheme", "Premium Scheme", "text"],
          ["premiumPence", "Premium Value (pence)", "number"],
          ["paymentDate", "Payment Date", "date"]
        ].map(([k, label, type]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: type === "text" && k !== "gradeOut" && k !== "herdMark" && k !== "premiumScheme" && k !== "killSheetRef" ? "col-span-2" : "", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type, value: String(form[k] ?? ""), onChange: (e) => setForm((p) => ({ ...p, [k]: e.target.value })) })
        ] }, k)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "w-full border rounded-md p-2 text-sm min-h-[60px]", value: String(form.notes ?? ""), onChange: (e) => setForm((p) => ({ ...p, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
          setForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4" }) : editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Kill Record — ",
        fmtDate(viewRecord.killDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm py-2", children: [
        [
          ["Processor", viewRecord.processor],
          ["Head Count", viewRecord.headCount],
          ["Total Deadweight", viewRecord.totalDeadweightKg ? `${parseFloat(String(viewRecord.totalDeadweightKg)).toFixed(1)} kg` : "—"],
          ["Avg Deadweight", viewRecord.averageDeadweightKg ? `${parseFloat(String(viewRecord.averageDeadweightKg)).toFixed(1)} kg` : "—"],
          ["P2 Backfat", viewRecord.averageP2BackfatMm ? `${parseFloat(String(viewRecord.averageP2BackfatMm)).toFixed(1)} mm` : "—"],
          ["Muscle Depth", viewRecord.averageMuscleDepthMm ? `${parseFloat(String(viewRecord.averageMuscleDepthMm)).toFixed(1)} mm` : "—"],
          ["Lean Meat %", viewRecord.leanMeatPct ? `${viewRecord.leanMeatPct}%` : "—"],
          ["Grade Out", viewRecord.gradeOut],
          ["Kill Sheet Ref", viewRecord.killSheetRef],
          ["Price/kg", viewRecord.pricePerKgPence ? `${Number(viewRecord.pricePerKgPence)}p` : "—"],
          ["Gross Value", viewRecord.grossValuePence ? `£${(Number(viewRecord.grossValuePence) / 100).toFixed(2)}` : "—"],
          ["Net Payment", viewRecord.netPaymentPence ? `£${(Number(viewRecord.netPaymentPence) / 100).toFixed(2)}` : "—"],
          ["SPP Variance", viewRecord.sppVariancePence ? `${Number(viewRecord.sppVariancePence) > 0 ? "+" : ""}${(Number(viewRecord.sppVariancePence) / 100).toFixed(2)}` : "—"],
          ["Herd Mark", viewRecord.herdMark],
          ["Premium Scheme", viewRecord.premiumScheme],
          ["Premium Value", viewRecord.premiumPence ? `£${(Number(viewRecord.premiumPence) / 100).toFixed(2)}` : "—"],
          ["Payment Date", fmtDate(viewRecord.paymentDate)]
        ].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: l }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(v) })
        ] }, String(l))),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: String(viewRecord.notes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "pig-kill-records", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRecord);
          setForm(viewRecord);
          setViewRecord(null);
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: confirmDelete !== null, title: "Delete Kill Record", message: "Delete this kill record? This cannot be undone.", confirmLabel: "Delete", confirmVariant: "destructive", onConfirm: () => {
      if (confirmDelete) del.mutate(confirmDelete);
    }, onCancel: () => setConfirmDelete(null) })
  ] });
}
async function generatePigAuditPDF(farmId) {
  const [jsPDFModule, autoTableModule] = await Promise.all([__vitePreload(() => import("./jspdf.es.min-DCDDbUO2.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0), __vitePreload(() => import("./jspdf.plugin.autotable-rNuKHwSj.js"), true ? [] : void 0)]);
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;
  const [flocks, movements, medicine, fci, feed, vet, stockmanship, tailBiting, farrowing, redTractor, killRecords] = await Promise.all([
    fetch(`/api/farms/${farmId}/pig-flocks`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-movements`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-medicine-treatments`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-fci-documents`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-feed-consumption`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-vet-assessments`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-stockmanship-checks`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-tail-biting-risks`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-farrowing-records`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-red-tractor-checklists`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? []),
    fetch(`/api/farms/${farmId}/pig-kill-records`, { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? [])
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  const fd = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const fv = (v) => v == null || v === "" ? "—" : String(v);
  const fp = (p) => p ? `£${(Number(p) / 100).toFixed(2)}` : "—";
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BDE Farm Trac — Pig Production Audit Report", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Farm ID: ${farmId}   Generated: ${today}   Red Tractor Pig Assurance`, 14, 26);
  doc.setDrawColor(219, 39, 119);
  doc.setLineWidth(0.5);
  doc.line(14, 30, 283, 30);
  let y = 38;
  function addSection(title, head, rows, colour = [219, 39, 119]) {
    if (rows.length === 0) return;
    if (y > 170) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colour[0], colour[1], colour[2]);
    doc.text(title, 14, y);
    y += 4;
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: y,
      head: [head],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: colour, textColor: 255 },
      alternateRowStyles: { fillColor: [253, 242, 248] },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;
  }
  if (flocks.length) addSection("Pig Herds / Groups", ["Name", "Type", "Breed", "Location", "Current Count", "Herd No.", "CPH"], flocks.map((r) => [fv(r.flockName), fv(r.productionType), fv(r.breed), fv(r.location), fv(r.currentCount), fv(r.herdNumber), fv(r.cphNumber)]));
  if (stockmanship.length) addSection("Daily Stockmanship Checks", ["Date", "Group", "Behaviour", "Bedding", "Tail Biting", "Overall Welfare", "Action Taken"], stockmanship.map((r) => [fd(r.checkDate), fv(r.groupName), fv(r.behaviour), fv(r.beddingCondition), r.tailBitingObserved ? "Yes" : "No", fv(r.overallWelfare), fv(r.actionTaken)]));
  if (medicine.length) addSection("Medicine Treatments", ["Date", "Group", "Product", "Diagnosis", "Route", "Qty", "Withdrawal Clear", "Vet"], medicine.map((r) => [fd(r.treatmentDate), fv(r.batchOrPenRef), fv(r.medicineProductName), fv(r.diagnosisReason), fv(r.administrationRoute), `${fv(r.quantityUsed)} ${fv(r.unitOfMeasure)}`, fd(r.withdrawalEndDate), fv(r.prescribingVetName)]));
  if (movements.length) addSection("Pig Movements (EAML2)", ["Date", "Type", "From", "To", "Head", "EAML2 Ref", "Haulier"], movements.map((r) => [fd(r.movementDate), fv(r.movementType), `${fv(r.fromLocation)} (${fv(r.fromCph)})`, `${fv(r.toLocation)} (${fv(r.toCph)})`, fv(r.numberOfAnimals), fv(r.eaml2Reference), fv(r.transporterName)]));
  if (fci.length) addSection("Food Chain Information (FCI)", ["Date", "Batch Ref", "Abattoir", "Pigs", "Medicines?", "WD Clear?", "Feed WD (h)", "Signed"], fci.map((r) => [fd(r.documentDate), fv(r.batchReference), fv(r.destinationAbattoir), fv(r.numberOfPigs), r.veterinaryMedicinesLast60Days ? "Yes" : "No", r.withdrawalPeriodClear ? "Yes" : "No", fv(r.feedWithdrawalHours), r.signedByFarmer ? "Yes" : "No"]));
  if (feed.length) addSection("Feed Consumption Records", ["Date", "Group / Pen", "Feed Type", "Quantity (kg)", "Batch / Lot No."], feed.map((r) => [fd(r.consumptionDate), fv(r.penName), fv(r.feedType), fv(r.quantityKg), fv(r.batchLotNumber)]));
  if (vet.length) addSection("Vet Health Assessments", ["Date", "Vet", "Practice", "BCS", "Lameness", "Respiratory", "Findings", "Next Review"], vet.map((r) => [fd(r.assessmentDate), fv(r.vetName), fv(r.practiceName), fv(r.bodyConditionScore), fv(r.lameness), fv(r.respiratoryHealth), String(fv(r.findings)).slice(0, 60), fd(r.nextReviewDate)]));
  if (tailBiting.length) addSection("Tail Biting Risk Assessments", ["Date", "Assessed By", "Risk Level", "Current Biting", "Interventions", "Next Review"], tailBiting.map((r) => [fd(r.assessmentDate), fv(r.assessedBy), fv(r.riskLevel), r.currentBiting ? "Yes" : "No", String(fv(r.interventionsTaken)).slice(0, 50), fd(r.reviewDate)]));
  if (farrowing.length) addSection("Farrowing Records", ["Date", "Sow Tag", "Parity", "Born Alive", "Stillborn", "Mummified", "Avg Birth Wt (kg)", "Ease", "Fosters In", "Fosters Out", "Weaning Date", "Piglets Weaned", "Colostrum", "ABP Disposal"], farrowing.map((r) => {
    const dead = (r.totalBornDead || 0) + (r.totalMummified || 0);
    const disposal = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? `${r.perinatalCollectionDate ? fd(r.perinatalCollectionDate) : "—"} · ${fv(r.perinatalCollectionRef)} · ${fv(r.perinatalDisposalMethod)}` : dead > 0 ? "NOT RECORDED" : "—";
    return [fd(r.farrowingDate), fv(r.sowEarTag), fv(r.parityNumber), fv(r.totalBornAlive), fv(r.totalBornDead), fv(r.totalMummified), fv(r.averageBirthWeightKg), fv(r.farrowingEase), fv(r.fostersIn), fv(r.fostersOut), fd(r.weaningDate), fv(r.pigletsWeanedCount), r.colostrumManaged ? "Yes" : r.colostrumManaged === false ? "No" : "—", disposal];
  }));
  if (redTractor.length) addSection("Red Tractor Checklists", ["Date", "Assessor", "Overall Status", "Non-conformances", "Next Due", "Corrective Action Deadline"], redTractor.map((r) => [fd(r.assessmentDate), fv(r.assessorName), fv(r.overallStatus), fv(r.nonConformancesCount), fd(r.nextAssessmentDue), fd(r.correctiveActionDeadline)]));
  if (killRecords.length) addSection("Abattoir Kill Records", ["Kill Date", "Processor", "Head", "Total DW (kg)", "Avg DW (kg)", "P2 (mm)", "Grade", "Net Payment", "Kill Sheet Ref"], killRecords.map((r) => [fd(r.killDate), fv(r.processor), fv(r.headCount), r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—", r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—", r.averageP2BackfatMm ? parseFloat(String(r.averageP2BackfatMm)).toFixed(1) : "—", fv(r.gradeOut), fp(r.netPaymentPence), fv(r.killSheetRef)]));
  const safeFarmId = String(farmId).replace(/[^a-z0-9]/gi, "");
  doc.save(`pig-audit-report-farm${safeFarmId}-${today.replace(/\//g, "-")}.pdf`);
}
const PIG_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function PigAnalyticsTab({ farmId }) {
  const { data: farrowingRaw } = useQuery({ queryKey: ["pig-farrowing", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-farrowing-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: movementsRaw } = useQuery({ queryKey: ["pig-movements", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-movements`), { credentials: "include" }).then((r) => r.json()) });
  const { data: feedRaw } = useQuery({ queryKey: ["pig-feed", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-feed-consumption`), { credentials: "include" }).then((r) => r.json()) });
  const farrowing = reactExports.useMemo(() => farrowingRaw?.records ?? farrowingRaw ?? [], [farrowingRaw]);
  const movements = reactExports.useMemo(() => movementsRaw?.records ?? movementsRaw ?? [], [movementsRaw]);
  const feed = reactExports.useMemo(() => feedRaw?.records ?? feedRaw ?? [], [feedRaw]);
  const avgBornAlive = reactExports.useMemo(() => {
    const valid = farrowing.filter((r) => r.pigletsBornAlive);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.pigletsBornAlive), 0) / valid.length).toFixed(1) : null;
  }, [farrowing]);
  const avgWeaned = reactExports.useMemo(() => {
    const valid = farrowing.filter((r) => r.pigletsWeaned);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.pigletsWeaned), 0) / valid.length).toFixed(1) : null;
  }, [farrowing]);
  const preWeanMortPct = reactExports.useMemo(() => {
    const bornAliveTotal = farrowing.reduce((s, r) => s + (Number(r.pigletsBornAlive) || 0), 0);
    const weanedTotal = farrowing.reduce((s, r) => s + (Number(r.pigletsWeaned) || 0), 0);
    return bornAliveTotal > 0 ? ((bornAliveTotal - weanedTotal) / bornAliveTotal * 100).toFixed(1) : null;
  }, [farrowing]);
  const farrowingByMonth = reactExports.useMemo(() => {
    const map = {};
    farrowing.forEach((r) => {
      const d = String(r.farrowingDate || r.date || "");
      const k = d.slice(0, 7);
      if (!k || k.length < 7) return;
      if (!map[k]) map[k] = { farrowings: 0, bornAlive: 0, weaned: 0 };
      map[k].farrowings++;
      map[k].bornAlive += Number(r.pigletsBornAlive) || 0;
      map[k].weaned += Number(r.pigletsWeaned) || 0;
    });
    return Object.entries(map).sort().slice(-12).map(([m, d]) => ({ month: m.slice(5), ...d }));
  }, [farrowing]);
  const movementTypes = reactExports.useMemo(() => {
    const map = {};
    movements.forEach((r) => {
      const t = String(r.movementType || r.type || "Unknown");
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [movements]);
  const noData = farrowing.length === 0 && movements.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add farrowing or movement records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Farrowing Records", value: farrowing.length, bg: "bg-pink-50 border-pink-100", text: "text-pink-800", sub: "text-pink-700" },
      { label: "Avg Born Alive", value: avgBornAlive ?? "—", bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Avg Pigs Weaned", value: avgWeaned ?? "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Pre-wean Mortality", value: preWeanMortPct ? `${preWeanMortPct}%` : "—", bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      farrowingByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Monthly Farrowings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: farrowingByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "bornAlive", name: "Born Alive", fill: "#15803d", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "weaned", name: "Weaned", fill: "#a16207", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] }),
      movementTypes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Movement Types" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: movementTypes, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: movementTypes.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIG_COLORS[i % PIG_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} records`, ""] })
        ] }) }) })
      ] })
    ] }),
    feed.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "Feed Consumption Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: feed.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Feed Records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: feed.reduce((s, r) => s + (Number(r.quantityKg) || Number(r.quantity) || 0), 0).toFixed(0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total kg Consumed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: [...new Set(feed.map((r) => r.feedType || r.feedName).filter(Boolean))].length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Feed Types Used" })
        ] })
      ] })
    ] })
  ] });
}
const PIG_PRODUCTION_TAB_IDS = ["overview", "flocks", "movements", "medicine", "fci", "feed", "vet", "stockmanship", "tail-biting", "farrowing", "red-tractor", "kill-records", "salmonella", "vaccination", "disease-monitoring", "analytics", "enterprise"];
function PigProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "pig-production", farmId, validIds: PIG_PRODUCTION_TAB_IDS, defaultTab: "overview", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  const [generating, setGenerating] = reactExports.useState(false);
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  async function handleGeneratePdf() {
    setGenerating(true);
    try {
      await generatePigAuditPDF(farmId);
    } catch (e) {
      console.error("Pig PDF generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Pig Production", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "overview", onClick: () => setTab("overview"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "w-3.5 h-3.5 mr-1" }),
          "Overview"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "flocks", onClick: () => setTab("flocks"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "w-3.5 h-3.5 mr-1" }),
          "Herds / Groups"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "movements", onClick: () => setTab("movements"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-3.5 h-3.5 mr-1" }),
          "Movements"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "medicine", onClick: () => setTab("medicine"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { className: "w-3.5 h-3.5 mr-1" }),
          "Medicine Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "fci", onClick: () => setTab("fci"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3.5 h-3.5 mr-1" }),
          "FCI Documents"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "feed", onClick: () => setTab("feed"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { className: "w-3.5 h-3.5 mr-1" }),
          "Feed Records"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "vet", onClick: () => setTab("vet"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stethoscope, { className: "w-3.5 h-3.5 mr-1" }),
          "Vet Assessments"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stockmanship", onClick: () => setTab("stockmanship"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "w-3.5 h-3.5 mr-1" }),
          "Stockmanship"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "tail-biting", onClick: () => setTab("tail-biting"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1" }),
          "Tail Biting Risk"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "farrowing", onClick: () => setTab("farrowing"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Baby, { className: "w-3.5 h-3.5 mr-1" }),
          "Farrowing"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "red-tractor", onClick: () => setTab("red-tractor"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5 mr-1" }),
          "Red Tractor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "kill-records", onClick: () => setTab("kill-records"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-3.5 h-3.5 mr-1" }),
          "Kill Records"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "salmonella", onClick: () => setTab("salmonella"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1" }),
          "Salmonella"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "vaccination", onClick: () => setTab("vaccination"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Syringe, { className: "w-3.5 h-3.5 mr-1" }),
          "Vaccination"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "disease-monitoring", onClick: () => setTab("disease-monitoring"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-3.5 h-3.5 mr-1" }),
          "Disease Monitoring"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1" }),
          "Analytics"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1" }),
          "Enterprise Report"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handleGeneratePdf, disabled: generating, className: "ml-2 shrink-0", children: [
        generating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "w-4 h-4 mr-1" }),
        "Audit Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { farmId, onGoto: (t) => setTab(t) }),
      tab === "flocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(FlocksTab, { farmId }),
      tab === "movements" && /* @__PURE__ */ jsxRuntimeExports.jsx(MovementsTab, { farmId }),
      tab === "medicine" && /* @__PURE__ */ jsxRuntimeExports.jsx(MedicineRegisterTab, { farmId }),
      tab === "fci" && /* @__PURE__ */ jsxRuntimeExports.jsx(FciDocumentsTab, { farmId }),
      tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedRecordsTab, { farmId }),
      tab === "vet" && /* @__PURE__ */ jsxRuntimeExports.jsx(VetAssessmentsTab, { farmId }),
      tab === "stockmanship" && /* @__PURE__ */ jsxRuntimeExports.jsx(StockmanshipChecksTab, { farmId }),
      tab === "tail-biting" && /* @__PURE__ */ jsxRuntimeExports.jsx(TailBitingRisksTab, { farmId }),
      tab === "farrowing" && /* @__PURE__ */ jsxRuntimeExports.jsx(FarrowingRecordsTab, { farmId }),
      tab === "red-tractor" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigRedTractorChecklistTab, { farmId }),
      tab === "kill-records" && /* @__PURE__ */ jsxRuntimeExports.jsx(KillRecordsTab, { farmId }),
      tab === "salmonella" && /* @__PURE__ */ jsxRuntimeExports.jsx(SalmonellaMonitoringTab, { farmId }),
      tab === "vaccination" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigVaccinationTab, { farmId }),
      tab === "disease-monitoring" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigDiseaseMonitoringTab, { farmId }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigEnterpriseReport, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(PigAnalyticsTab, { farmId })
    ] }) })
  ] }) });
}
const SALM_SAMPLE_TYPES = [
  { value: "blood_serology", label: "Blood Serology (ELISA)" },
  { value: "meat_juice_elisa", label: "Meat Juice ELISA (post-slaughter)" },
  { value: "faecal_pooled", label: "Pooled Faecal Sample" },
  { value: "environmental", label: "Environmental Swab" }
];
const SALM_CATEGORIES = [1, 2, 3, 4, 5];
function SalmonellaMonitoringTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pig-salmonella-monitoring", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-salmonella-monitoring`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const { data: flocksData } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const flocks = Array.isArray(flocksData) ? flocksData : flocksData?.records ?? [];
  const salmYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.samplingPeriodStart ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredSalm = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => String(r.samplingPeriodStart ?? "").startsWith(yearFilter)), [records, yearFilter]);
  function openAdd() {
    setEditing(null);
    setForm({ sampleType: "meat_juice_elisa", actionRequired: false });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-salmonella-monitoring/${editing.id}`) : apiUrl(`farms/${farmId}/pig-salmonella-monitoring`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-salmonella-monitoring", farmId] });
      setOpen(false);
      setForm({ sampleType: "meat_juice_elisa", actionRequired: false });
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function printSalmonella() {
    const fmtD = (d) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredSalm.map((r) => `<tr><td>${fmtD(r.samplingPeriodStart)}${r.samplingPeriodEnd ? `–${fmtD(r.samplingPeriodEnd)}` : ""}</td><td>${flocks.find((f) => f.id === r.pigFlockId)?.flockName ?? "—"}</td><td>${SALM_SAMPLE_TYPES.find((t) => t.value === r.sampleType)?.label ?? r.sampleType}</td><td>${r.sampleCount ?? "—"}</td><td>${r.positiveCount ?? 0}</td><td>${r.seroprevalence != null ? `${r.seroprevalence}%` : "—"}</td><td>Category ${r.salmonellaCategory ?? "—"}</td><td>${r.actionRequired ? "Yes" : "No"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Salmonella Monitoring</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Salmonella Monitoring Register${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>NSMP · ${filteredSalm.length} record${filteredSalm.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Sampling Period</th><th>Flock</th><th>Sample Type</th><th>Samples</th><th>Positive</th><th>Seroprevalence</th><th>Category</th><th>Action Required</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-salmonella-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-salmonella-monitoring", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const fmtDate2 = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const catBadge = (cat) => {
    if (!cat) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
    const colours = ["", "bg-green-100 text-green-800", "bg-green-100 text-green-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800", "bg-red-200 text-red-900"];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[cat]}`, children: [
      "Category ",
      cat
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between mb-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Salmonella Monitoring Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "NSMP requires quarterly testing of finishing pigs. Red Tractor Pigs requires documented monitoring with serological category results." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            salmYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        filteredSalm.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printSalmonella, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Add Monitoring Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : filteredSalm.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-amber-400 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No Salmonella monitoring records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Record quarterly NSMP sampling results here. Category 1–2 is the Red Tractor target." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Sampling Period", "Flock", "Sample Type", "Samples", "Positive", "Seroprevalence", "Category", "Change", "Action Required", "Doc", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: filteredSalm.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
          fmtDate2(r.samplingPeriodStart),
          r.samplingPeriodEnd ? `–${fmtDate2(r.samplingPeriodEnd)}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: flocks.find((f) => f.id === r.pigFlockId)?.flockName ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: SALM_SAMPLE_TYPES.find((t) => t.value === r.sampleType)?.label ?? r.sampleType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.sampleCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.positiveCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.seroprevalence != null ? `${r.seroprevalence}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: catBadge(r.salmonellaCategory) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.categoryChange ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium ${r.categoryChange === "improved" ? "text-green-700" : r.categoryChange === "worsened" ? "text-red-700" : "text-gray-500"}`, children: r.categoryChange.charAt(0).toUpperCase() + r.categoryChange.slice(1) }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.actionRequired ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "No" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-salmonella-monitoring", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-salmonella-monitoring", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Salmonella Monitoring Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sampling Period Start *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.samplingPeriodStart || "", onChange: (e) => set("samplingPeriodStart", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sampling Period End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.samplingPeriodEnd || "", onChange: (e) => set("samplingPeriodEnd", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pig Flock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.pigFlockId || "__none__"), onValueChange: (v) => set("pigFlockId", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select flock" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All flocks" }),
              flocks.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.flockName }, f.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sampleType || "meat_juice_elisa", onValueChange: (v) => set("sampleType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SALM_SAMPLE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.sampleCount ?? "", onChange: (e) => set("sampleCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positive Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveCount ?? 0, onChange: (e) => set("positiveCount", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seroprevalence (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", max: "100", value: form.seroprevalence ?? "", onChange: (e) => set("seroprevalence", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labName || "", onChange: (e) => set("labName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Salmonella Category (1–5)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.salmonellaCategory || "__none__"), onValueChange: (v) => set("salmonellaCategory", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not yet determined" }),
              SALM_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c), children: [
                "Category ",
                c
              ] }, c))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Previous Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.previousCategory || "__none__"), onValueChange: (v) => set("previousCategory", v === "__none__" ? null : Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Previous period" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— N/A" }),
              SALM_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c), children: [
                "Category ",
                c
              ] }, c))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category Change" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.categoryChange || "__none__", onValueChange: (v) => set("categoryChange", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select change" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— N/A" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "improved", children: "Improved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unchanged", children: "Unchanged" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "worsened", children: "Worsened" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "actreq", checked: !!form.actionRequired, onChange: (e) => set("actionRequired", e.target.checked), className: "rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "actreq", children: "Action Required" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Sampling Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextSamplingDue || "", onChange: (e) => set("nextSamplingDue", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.actionsTaken || "", onChange: (e) => set("actionsTaken", e.target.value), placeholder: "Cleaning, biosecurity, feed changes, vet review…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog$1,
      {
        open: pendingDelete !== null,
        title: "Delete Record",
        message: "Delete this Salmonella monitoring record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          del.reset();
        }
      }
    )
  ] });
}
const PIG_VACCINE_CATEGORIES = [
  { value: "PRRS", label: "PRRS (Porcine Reproductive & Respiratory Syndrome)" },
  { value: "PCV2", label: "PCV2 / Circovirus" },
  { value: "MH", label: "Enzootic Pneumonia (Mycoplasma hyopneumoniae)" },
  { value: "Erysipelas_PPV", label: "Erysipelas / PPV" },
  { value: "E_coli_Clostridial", label: "E. coli / Clostridial" },
  { value: "APP", label: "APP (Actinobacillus pleuropneumoniae)" },
  { value: "SIV", label: "Swine Influenza (SIV)" },
  { value: "PED", label: "PED (Porcine Epidemic Diarrhoea)" },
  { value: "Other", label: "Other" }
];
const PIG_VACCINE_PRESETS = {
  PRRS: ["Ingelvac PRRS MLV", "Porcilis PRRS", "Fostera PRRS", "Fostera Gold", "Ingelvac PRRSFLEX EU", "Unistrain PRRS"],
  PCV2: ["Ingelvac CircoFLEX", "Circovac", "Porcilis PCV AD", "Suvaxyn Circo", "Porcilis PCV M Hyo"],
  MH: ["Ingelvac M.hyo. IDAL", "Hyoresp", "Stellamune Mycoplasma", "Suvaxyn MH-One", "Porcilis M Hyo ID ONCE"],
  Erysipelas_PPV: ["Eryseng Parvo", "Porcilis Ery+Parvo", "Stellamune Erysipelas", "Suvaxyn Parvo/E", "Ingelvac ERY-ALC"],
  E_coli_Clostridial: ["Porcilis ColiClos", "Enteromax", "Suigex", "PolySeC"],
  APP: ["Porcilis APP"],
  SIV: ["Respiporc FluCombi", "Porcilis Flu", "Suvaxyn Influenza"],
  PED: ["Suvaxyn PED"],
  Other: []
};
const PIG_AGE_GROUPS = ["Sows/Gilts", "Boars", "Piglets/Suckling", "Weaners", "Growers", "Finishers", "All pigs"];
const PIG_ADMIN_ROUTES = ["Intramuscular", "Subcutaneous", "Intradermal", "Intranasal", "Oral", "In-water"];
function PigVaccinationTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ vaccinationCategory: "PRRS", vetPrescribed: false });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pig-vaccination-records", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-vaccination-records`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const presets = PIG_VACCINE_PRESETS[form.vaccinationCategory] ?? [];
  function openAdd() {
    setEditing(null);
    setForm({ vaccinationCategory: "PRRS", vetPrescribed: false });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-vaccination-records/${editing.id}`) : apiUrl(`farms/${farmId}/pig-vaccination-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-vaccination-records", farmId] });
      setOpen(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-vaccination-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-vaccination-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const nextDueRecords = records.filter((r) => r.nextDueDate);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between mb-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Pig Vaccination Programme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record all herd vaccinations. Red Tractor Pigs requires a documented programme signed off by your vet. Maintain batch numbers and expiry dates for traceability." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "Add Vaccination Record"
      ] })
    ] }),
    nextDueRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800 mb-1.5", children: "Upcoming / Overdue Boosters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: nextDueRecords.map((r) => {
        const due = new Date(r.nextDueDate);
        const overdue = due < /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-1 rounded border ${overdue ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-300 text-amber-800"}`, children: [
          r.vaccineProduct,
          " — ",
          overdue ? "overdue " : "due ",
          fmtDate(r.nextDueDate)
        ] }, r.id);
      }) })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Syringe, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No vaccination records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Add your first vaccination record to build your programme log." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Category", "Vaccine Product", "Age Group", "No. Treated", "Route", "Admin By", "Next Due", "Doc", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.vaccinationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.vaccinationCategory }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 font-medium", children: [
          r.vaccineProduct,
          r.batchNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 ml-1", children: [
            "#",
            r.batchNumber
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.ageGroupTreated ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.numberTreated ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.administrationRoute ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.administeredBy ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.nextDueDate ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: new Date(r.nextDueDate) < /* @__PURE__ */ new Date() ? "text-red-600 font-medium" : "", children: fmtDate(r.nextDueDate) }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-vaccination-records", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-vaccination-records", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Vaccination Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.vaccinationDate || "", onChange: (e) => set("vaccinationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vaccinationCategory || "PRRS", onValueChange: (v) => {
            set("vaccinationCategory", v);
            set("vaccineProduct", "");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PIG_VACCINE_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vaccine Product *" }),
          presets.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vaccineProduct || "", onValueChange: (v) => set("vaccineProduct", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                presets.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other — enter manually below" })
              ] })
            ] }),
            (form.vaccineProduct === "__other__" || form.vaccineProduct && !presets.includes(form.vaccineProduct)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.vaccineProduct === "__other__" ? "" : form.vaccineProduct || "", onChange: (e) => set("vaccineProduct", e.target.value), placeholder: "Enter product name" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vaccineProduct || "", onChange: (e) => set("vaccineProduct", e.target.value), placeholder: "Enter vaccine product name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber || "", onChange: (e) => set("batchNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate || "", onChange: (e) => set("expiryDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Age Group Treated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ageGroupTreated || "__none__", onValueChange: (v) => set("ageGroupTreated", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select age group" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              PIG_AGE_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number Treated" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.numberTreated ?? "", onChange: (e) => set("numberTreated", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose Volume (ml)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doseVolumeMl || "", onChange: (e) => set("doseVolumeMl", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Administration Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.administrationRoute || "__none__", onValueChange: (v) => set("administrationRoute", v === "__none__" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select route" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              PIG_ADMIN_ROUTES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Withdrawal Period (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.withdrawalPeriodDays ?? 0, onChange: (e) => set("withdrawalPeriodDays", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextDueDate || "", onChange: (e) => set("nextDueDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Administered By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.administeredBy || "", onChange: (e) => set("administeredBy", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "vetpres", checked: !!form.vetPrescribed, onCheckedChange: (v) => set("vetPrescribed", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetpres", children: "Vet Prescribed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.vaccinationDate || !form.vaccineProduct || form.vaccineProduct === "__other__", children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog$1,
      {
        open: pendingDelete !== null,
        title: "Delete Record",
        message: "Delete this vaccination record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          del.reset();
        }
      }
    )
  ] });
}
const PIG_MONITORING_TYPES = [
  { value: "PRRS", label: "PRRS Monitoring" },
  { value: "Enzootic Pneumonia (MH)", label: "Enzootic Pneumonia / MH Monitoring" },
  { value: "Aujeszky's Disease", label: "Aujeszky's Disease (AD-Free)" },
  { value: "APP", label: "APP Serotyping" },
  { value: "Swine Influenza", label: "Swine Influenza Surveillance" },
  { value: "PRDC", label: "PRDC (Porcine Respiratory Disease Complex)" },
  { value: "General serology", label: "General Serology / Blood Sampling" }
];
const PIG_ACCREDITATION_SCHEMES = [
  { value: "AHDB PRRS Accreditation", label: "AHDB PRRS Accreditation" },
  { value: "AHDB MH Accreditation", label: "AHDB MH Accreditation" },
  { value: "APHA AD-Free", label: "APHA Aujeszky's Disease-Free Scheme" },
  { value: "None", label: "No accreditation scheme" }
];
const HERD_STATUS_COLOURS = {
  negative: "bg-green-100 text-green-800 border-green-200",
  positive_stable: "bg-amber-100 text-amber-800 border-amber-200",
  positive_unstable: "bg-red-100 text-red-800 border-red-200",
  positive: "bg-red-100 text-red-800 border-red-200",
  ad_free: "bg-green-100 text-green-800 border-green-200",
  inconclusive: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-gray-50 text-gray-500 border-gray-200"
};
function PigDiseaseMonitoringTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ monitoringType: "PRRS" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pig-disease-monitoring", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/pig-disease-monitoring`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  function openAdd() {
    setEditing(null);
    setForm({ monitoringType: "PRRS" });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  }
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/pig-disease-monitoring/${editing.id}`) : apiUrl(`farms/${farmId}/pig-disease-monitoring`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pig-disease-monitoring", farmId] });
      setOpen(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/pig-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-disease-monitoring", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  function statusBadge(status) {
    if (!status) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
    const cl = HERD_STATUS_COLOURS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
    const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cl}`, children: label });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between mb-4 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Disease Monitoring Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record PRRS, MH, Aujeszky's Disease, APP, and other herd-level disease surveillance. Supports AHDB accreditation scheme documentation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "Add Monitoring Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600", children: "No disease monitoring records yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Record PRRS, MH, and other surveillance testing results here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Type", "Accreditation Scheme", "Testing Body", "Samples", "Positives", "Herd Status", "Next Test Due", "Doc", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.monitoringDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs font-medium", children: r.monitoringType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.accreditationScheme ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.testingBody ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.numberOfSamples ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.positiveResults ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: statusBadge(r.herdStatus) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.nextTestDue ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: new Date(r.nextTestDue) < /* @__PURE__ */ new Date() ? "text-red-600 font-medium" : "", children: fmtDate(r.nextTestDue) }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "pig-disease-monitoring", recordId: r.id, documentPath: r.documentPath, documentName: r.documentName, queryKey: ["pig-disease-monitoring", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelete(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Disease Monitoring Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.monitoringDate || "", onChange: (e) => set("monitoringDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.monitoringType || "PRRS", onValueChange: (v) => set("monitoringType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PIG_MONITORING_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accreditation Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.accreditationScheme || "__none__", onValueChange: (v) => set("accreditationScheme", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None / not applicable" }),
              PIG_ACCREDITATION_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scheme Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.schemeReference || "", onChange: (e) => set("schemeReference", e.target.value), placeholder: "Certificate / accreditation ref" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Body / Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.testingBody || "", onChange: (e) => set("testingBody", e.target.value), placeholder: "Lab name or vet practice" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdStatus || "__none__", onValueChange: (v) => set("herdStatus", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not yet determined" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive_stable", children: "Positive — Stable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive_unstable", children: "Positive — Unstable" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive (general)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ad_free", children: "AD-Free Accredited" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inconclusive", children: "Inconclusive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Samples" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.numberOfSamples ?? "", onChange: (e) => set("numberOfSamples", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positive Results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveResults ?? 0, onChange: (e) => set("positiveResults", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Negative Results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.negativeResults ?? 0, onChange: (e) => set("negativeResults", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e) => set("nextTestDue", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.actionsTaken || "", onChange: (e) => set("actionsTaken", e.target.value), placeholder: "Biosecurity changes, management actions, vet review…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.monitoringDate || !form.monitoringType, children: editing ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog$1,
      {
        open: pendingDelete !== null,
        title: "Delete Record",
        message: "Delete this monitoring record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          del.reset();
        }
      }
    )
  ] });
}
export {
  PigProductionPage as default
};
