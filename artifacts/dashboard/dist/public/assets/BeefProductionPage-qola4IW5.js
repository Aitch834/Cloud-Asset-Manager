import { r as reactExports, l as useQuery, j as jsxRuntimeExports, b as useAppStore, t as useQueryClient, a as useToast, O as useMutation, c as Button, S as Plus, d as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, C as Checkbox, L as Label } from "./index-CZgUVkHZ.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { R as RecordAttachments } from "./RecordAttachments-CfV09vaJ.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-qTosEOSA.js";
import { P as Printer } from "./printer-C-Rc95KH.js";
import { f as Scale, T as TrendingUp, A as AppLayout, e as ChartColumn, c as ClipboardList } from "./AppLayout-C_Y0xH6v.js";
import { P as Package } from "./use-safe-clerk-xJ0iwJEz.js";
import { T as TrendingDown } from "./trending-down-DQONNQVG.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-BA56aBpX.js";
import { C as ComposedChart } from "./ComposedChart-BDODU3X9.js";
import { C as CartesianGrid } from "./CartesianGrid-CrAiHUnj.js";
import { L as Line } from "./Line-D_4BZi-k.js";
import { C as ChevronUp } from "./chevron-up-DYtvSrGZ.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-CZe2jYyp.js";
import { T as Textarea } from "./textarea-BZhfDexV.js";
import { B as Badge } from "./badge-BCoZ9w2H.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BeA10Ddo.js";
import { T as TabBar, a as TabButton } from "./tab-button-Bv-CHAw8.js";
import { u as useFarmMembers } from "./use-farm-members-DCmkrdkx.js";
import { S as StaffSelect } from "./staff-select-Dvkmv9Km.js";
import { C as CircleCheck } from "./circle-check-OzZooJux.js";
import { E as Eye } from "./eye-DtR_pAsW.js";
import { P as Pencil } from "./pencil-Cou76tsa.js";
import "./use-upload-BqHGQdpx.js";
import "./paperclip-B_kPKMf2.js";
import "./upload-ctUp7lOa.js";
import "./image-C2mxZ5dK.js";
import "./shield-alert-BIifTInu.js";
import "./download-DovqhB3f.js";
import "./database-Bb_iY1zn.js";
import "./triangle-alert-csdY1wTB.js";
import "./shield-check-IHgJoL58.js";
import "./tractor-tddYvgFc.js";
import "./index-WKya3f1l.js";
import "./index-BfbbBZLq.js";
const PRINT_ID = "beef-enterprise-report-print";
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
function KpiCard({ label, value, sub, icon, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
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
function BeefEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data, isLoading } = useQuery({
    queryKey: ["beef-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/beef-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.settlementCount > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = reactExports.useMemo(() => {
    if (!d) return [];
    const map = {};
    d.settlements.forEach((s) => {
      const m = s.killDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].revenue += s.netPaymentPence;
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
      "Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Purchases": v.purchases,
      "Gross Margin": v.revenue - v.feedCost - v.purchases
    }));
  }, [d]);
  const avgKoPercent = d?.settlements.filter((s) => s.killingOutPercentage).length ? (d.settlements.reduce((sum, s) => sum + (parseFloat(String(s.killingOutPercentage)) || 0), 0) / d.settlements.filter((s) => s.killingOutPercentage).length).toFixed(1) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Beef Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cost per head · Cost per kg deadweight · Gross margin" })
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
      "No deadweight settlements, feed deliveries or livestock purchases found for ",
      year,
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Head Sold", value: d.totalHeadSold.toString(), sub: `${d.totalCarcassKg.toLocaleString("en-GB")} kg dwt${avgKoPercent ? ` · avg KO ${avgKoPercent}%` : ""}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-4 h-4 text-orange-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Revenue", value: fmtGBP(d.totalRevenuePence), sub: fmtPkg(d.revenuePerKgDwtPence), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Variable Costs", value: fmtGBP(d.totalVariableCostPence), sub: `Feed ${fmtGBP(d.totalFeedCostPence)} · Purchases ${fmtGBP(d.totalPurchaseCostPence)}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-amber-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Gross Margin", value: fmtGBP(d.grossMarginPence), sub: d.grossMarginPerHeadPence != null ? `${fmtGBP(d.grossMarginPerHeadPence)}/head` : "—", icon: marginPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }), highlight: marginPositive ? "emerald" : "red" })
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Revenue vs Costs" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Revenue", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Purchases", fill: "#f97316", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "Gross Margin", stroke: "#3b82f6", strokeWidth: 2, dot: false })
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
            { label: `Deadweight revenue (${d.settlementCount} settlements)`, value: d.totalRevenuePence, positive: true, bold: false },
            { label: `Livestock purchases (${d.totalHeadPurchased} head)`, value: -d.totalPurchaseCostPence, bold: false },
            { label: `Feed cost (${d.feedDeliveries.length} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence, bold: false },
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, bold: false }] : [],
            ...(d.totalContractorCostPence ?? 0) > 0 ? [{ label: "Contractor costs (field ops)", value: -d.totalContractorCostPence, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d.totalHeadSold) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalCarcassKg > 0 ? `${(Math.abs(row.value) / d.totalCarcassKg / 100).toFixed(2)}p/kg` : "—" })
          ] }, i)) })
        ] }),
        d.costPerKgDwtPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 border-t border-border/40 text-xs text-foreground/60 flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Variable cost/kg dwt: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtPkg(d.costPerKgDwtPence) })
          ] }),
          avgKoPercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Avg killing out: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              avgKoPercent,
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed from priced deliveries tagged to beef/cattle. Haulage, bedding, vet, and fixed costs should be recorded in Financial for a complete enterprise P&L." })
      ] }),
      d.settlements.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Deadweight Settlements (${d.settlements.length})`, open: openSection === "settlements", setOpen: (v) => toggle(v ? "settlements" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Kill Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Abattoir" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Carcass Wt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "KO%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Net Payment" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.settlements.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(s.killDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: s.abattoirName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: s.numberOfHead }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-1.5 text-right", children: [
            parseFloat(String(s.totalCarcassWeightKg)).toFixed(0),
            " kg"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: s.averagePricePerKgGbp ? `${(parseFloat(String(s.averagePricePerKgGbp)) * 100).toFixed(0)}p` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: s.killingOutPercentage ? `${parseFloat(String(s.killingOutPercentage)).toFixed(1)}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: s.dominantGrade ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: fmtGBP(s.netPaymentPence) })
        ] }, s.id)) })
      ] }) }),
      d.feedDeliveries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Feed Deliveries (${d.feedDeliveries.length} · ${d.totalFeedKg.toLocaleString("en-GB")} kg total)`, open: openSection === "feed", setOpen: (v) => toggle(v ? "feed" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
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
      ] }) }),
      d.purchases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Livestock Purchases (${d.purchases.length} · ${d.totalHeadPurchased} head)`, open: openSection === "purchases", setOpen: (v) => toggle(v ? "purchases" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "£/Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.purchases.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(p.invoiceDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: p.species }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: p.numberOfHead }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: p.pricePerHeadPence ? fmtGBP(p.pricePerHeadPence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-red-700", children: fmtGBP(p.totalAmountPence) })
        ] }, p.id)) })
      ] }) })
    ] })
  ] });
}
const api = (path) => `/api/${path}`;
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
const fmtNum = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
const gbp = (v) => v == null || v === "" ? "—" : `£${parseFloat(String(v)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: onConfirm, children: "Delete" })
    ] })
  ] }) });
}
function DataTable({ cols, rows, onEdit, onDelete, onView }) {
  const [pending, setPending] = reactExports.useState(null);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet. Add one using the button above." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.render ? c.render(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPending(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!pending, title: "Delete Record", message: "Are you sure? This cannot be undone.", onConfirm: () => {
      if (pending && onDelete) onDelete(pending);
      setPending(null);
    }, onCancel: () => setPending(null) })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
function WeighTab({ farmId, onRaiseTask }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["beef-weigh", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/beef-weigh-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: herdsRaw } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json())
  });
  const herds = (Array.isArray(herdsRaw) ? herdsRaw : []).filter((h) => {
    const t = String(h.type ?? "").toLowerCase();
    return ["cattle", "beef", "dairy", "suckler", "bovine"].some((k) => t.includes(k));
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/beef-weigh-records/${editing.id}`) : api(`farms/${farmId}/beef-weigh-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beef-weigh", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/beef-weigh-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-weigh", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.weighDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.weighDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printWeighReport() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.weighDate)}</td><td>${fmt(r.groupRef)}</td><td>${fmt(r.breed)}</td><td>${fmt(r.category)}</td><td>${fmt(r.numberOfAnimals)}</td><td>${fmtNum(r.averageLiveWeightKg)}</td><td>${fmtNum(r.dlwgGPerDay)}</td><td>${fmt(r.averageBcsScore)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Weigh-in Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Weigh-in &amp; DLWG Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Group</th><th>Breed</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>DLWG (g/day)</th><th>Avg BCS</th></tr></thead><tbody>${tableRows}</tbody></table><p style="margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px">Red Tractor Beef &amp; Dairy: weight records and DLWG must be maintained as evidence of performance monitoring. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  const cols = [
    { key: "weighDate", label: "Date", render: (r) => fmtDate(r.weighDate) },
    { key: "groupRef", label: "Group" },
    { key: "breed", label: "Breed" },
    { key: "category", label: "Category" },
    { key: "numberOfAnimals", label: "Count" },
    { key: "averageLiveWeightKg", label: "Avg Wt (kg)", render: (r) => fmtNum(r.averageLiveWeightKg) },
    { key: "dlwgGPerDay", label: "DLWG (g/day)", render: (r) => fmtNum(r.dlwgGPerDay) },
    { key: "averageBcsScore", label: "BCS" },
    { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-weigh-records", recordId: r.id, farmId, compact: true }) : null }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Beef Weigh-in & DLWG Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printWeighReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Weigh"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols, rows: filtered, onView: setViewing, onEdit: (r) => {
      setEditing(r);
      setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
      setOpen(true);
    }, onDelete: (r) => del.mutate(r.id) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Weigh-in Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Date", fmtDate(viewing.weighDate)], ["Group Ref", fmt(viewing.groupRef)], ["Breed", fmt(viewing.breed)], ["Category", fmt(viewing.category)], ["Animals Weighed", fmt(viewing.numberOfAnimals)], ["Avg Live Weight (kg)", fmtNum(viewing.averageLiveWeightKg)], ["Total Live Weight (kg)", fmtNum(viewing.totalLiveWeightKg)], ["Target Weight (kg)", fmtNum(viewing.targetWeightKg)], ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay)], ["Days Since Last Weigh", fmt(viewing.daysSincePreviousWeigh)], ["Avg BCS", fmt(viewing.averageBcsScore)], ["Location", fmt(viewing.location)], ["Weighed By", fmt(viewing.weighedBy)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: v })
          ] }, l)),
          !!viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-weigh-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-purple-700 border-purple-200 hover:bg-purple-50", onClick: () => {
          onRaiseTask(viewing);
          setViewing(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Task"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Weigh Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Herd / Group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId ?? "__none__", onValueChange: (v) => sf("herdId", v === "__none__" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
            herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: String(h.name ?? "") }, String(h.id)))
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weigh Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.weighDate ?? "", onChange: (e) => sf("weighDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Group Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.groupRef ?? "", onChange: (e) => sf("groupRef", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Breed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.breed ?? "", onValueChange: (v) => sf("breed", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Hereford", "Angus", "Limousin", "Charolais", "Simmental", "Blonde d'Aquitaine", "Shorthorn", "Belgian Blue", "British Friesian", "Murray Grey", "Dexter", "Highland", "Red Poll", "South Devon", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category ?? "", onValueChange: (v) => sf("category", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Suckler calves", "Weaned calves", "Store cattle", "Finishing cattle", "Cows", "Bulls"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number of Animals", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfAnimals ?? "", onChange: (e) => sf("numberOfAnimals", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Live Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageLiveWeightKg ?? "", onChange: (e) => sf("averageLiveWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total Live Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.totalLiveWeightKg ?? "", onChange: (e) => sf("totalLiveWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.targetWeightKg ?? "", onChange: (e) => sf("targetWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "DLWG (g/day)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.dlwgGPerDay ?? "", onChange: (e) => sf("dlwgGPerDay", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Days Since Last Weigh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.daysSincePreviousWeigh ?? "", onChange: (e) => sf("daysSincePreviousWeigh", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg BCS (1–5)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "1", max: "5", value: form.averageBcsScore ?? "", onChange: (e) => sf("averageBcsScore", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Location", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.location ?? "", onChange: (e) => sf("location", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weighed By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.weighedBy ?? "", onChange: (e) => sf("weighedBy", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function FinishingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-finishing", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-finishing-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: herdsRaw2 } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json()) });
  const herds = (Array.isArray(herdsRaw2) ? herdsRaw2 : []).filter((h) => {
    const t = String(h.type ?? "").toLowerCase();
    return ["cattle", "beef", "dairy", "suckler", "bovine"].some((k) => t.includes(k));
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/beef-finishing-records/${editing.id}`) : api(`farms/${farmId}/beef-finishing-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beef-finishing", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/beef-finishing-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-finishing", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.dateEnteredFinishing ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.dateEnteredFinishing ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printFinishingReport() {
    const tableRows = filtered.map((r) => `<tr><td>${fmt(r.animalTagNumber)}</td><td>${fmt(r.breed)}</td><td>${fmt(r.sex)}</td><td>${fmtDate(r.dateEnteredFinishing)}</td><td>${fmtNum(r.entryLiveWeightKg)}</td><td>${fmtDate(r.slaughterDate)}</td><td>${fmtNum(r.overallDlwgGPerDay)}</td><td>${fmt(r.status)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Finishing Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Finishing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} animal${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Tag No.</th><th>Breed</th><th>Sex</th><th>Entered Finishing</th><th>Entry Wt (kg)</th><th>Slaughter Date</th><th>DLWG (g/day)</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table><p style="margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px">Red Tractor Beef &amp; Dairy: individual animal finishing records support traceability requirements. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Finishing Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printFinishingReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ status: "active" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Animal"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "animalTagNumber", label: "Tag No." },
          { key: "breed", label: "Breed" },
          { key: "sex", label: "Sex" },
          { key: "dateEnteredFinishing", label: "Entered Finishing", render: (r) => fmtDate(r.dateEnteredFinishing) },
          { key: "entryLiveWeightKg", label: "Entry Wt (kg)", render: (r) => fmtNum(r.entryLiveWeightKg) },
          { key: "targetSlaughterDate", label: "Target Slaughter", render: (r) => fmtDate(r.targetSlaughterDate) },
          { key: "overallDlwgGPerDay", label: "DLWG (g/day)", render: (r) => fmtNum(r.overallDlwgGPerDay) },
          { key: "status", label: "Status", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "active" ? "default" : "secondary", children: fmt(r.status) }) },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-finishing-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Finishing Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Tag Number", fmt(viewing.animalTagNumber)], ["Breed", fmt(viewing.breed)], ["Sex", fmt(viewing.sex)], ["Date of Birth", fmtDate(viewing.dateOfBirth)], ["Entered Finishing", fmtDate(viewing.dateEnteredFinishing)], ["Entry Live Weight (kg)", fmtNum(viewing.entryLiveWeightKg)], ["Target Slaughter Wt (kg)", fmtNum(viewing.targetSlaughterWeightKg)], ["Target Slaughter Date", fmtDate(viewing.targetSlaughterDate)], ["Finishing System", fmt(viewing.finishingSystem)], ["Slaughter Date", fmtDate(viewing.slaughterDate)], ["Slaughter Live Wt (kg)", fmtNum(viewing.slaughterLiveWeightKg)], ["Days on Finishing", fmt(viewing.totalDaysOnFinishing)], ["Overall DLWG (g/day)", fmtNum(viewing.overallDlwgGPerDay)], ["Status", fmt(viewing.status)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          !!viewing.rationsDescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Rations:" }),
            " ",
            fmt(viewing.rationsDescription)
          ] }),
          !!viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-finishing-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Finishing Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Herd / Group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.herdId ?? "__none__", onValueChange: (v) => sf("herdId", v === "__none__" ? "" : v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
            herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: String(h.name ?? "") }, String(h.id)))
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animal Tag No. *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalTagNumber ?? "", onChange: (e) => sf("animalTagNumber", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Breed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.breed ?? "", onValueChange: (v) => sf("breed", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Hereford", "Angus", "Limousin", "Charolais", "Simmental", "Blonde d'Aquitaine", "Shorthorn", "Belgian Blue", "British Friesian", "Murray Grey", "Dexter", "Highland", "Red Poll", "South Devon", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sex ?? "", onValueChange: (v) => sf("sex", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Bull", "Steer", "Heifer", "Cow"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date of Birth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateOfBirth ?? "", onChange: (e) => sf("dateOfBirth", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date Entered Finishing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateEnteredFinishing ?? "", onChange: (e) => sf("dateEnteredFinishing", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Entry Live Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.entryLiveWeightKg ?? "", onChange: (e) => sf("entryLiveWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Slaughter Wt (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.targetSlaughterWeightKg ?? "", onChange: (e) => sf("targetSlaughterWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Slaughter Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.targetSlaughterDate ?? "", onChange: (e) => sf("targetSlaughterDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Finishing System", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.finishingSystem ?? "", onValueChange: (v) => sf("finishingSystem", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select system..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Cereal beef", "Grass finishing", "18-month beef", "Maize silage", "TMR (Total Mixed Ration)", "Silage-based", "Specialist slow-finish", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => sf("status", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "slaughtered", "sold-store", "died"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slaughter Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.slaughterDate ?? "", onChange: (e) => sf("slaughterDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slaughter Live Wt (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.slaughterLiveWeightKg ?? "", onChange: (e) => sf("slaughterLiveWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Days on Finishing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.totalDaysOnFinishing ?? "", onChange: (e) => sf("totalDaysOnFinishing", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Overall DLWG (g/day)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.overallDlwgGPerDay ?? "", onChange: (e) => sf("overallDlwgGPerDay", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Rations Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.rationsDescription ?? "", onChange: (e) => sf("rationsDescription", e.target.value), rows: 2 }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function DeadweightTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-deadweight", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-deadweight-settlements`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/beef-deadweight-settlements/${editing.id}`) : api(`farms/${farmId}/beef-deadweight-settlements`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beef-deadweight", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/beef-deadweight-settlements/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-deadweight", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.killDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.killDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printDeadweightReport() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.killDate)}</td><td>${fmt(r.abattoirName)}</td><td>${fmt(r.numberOfHead)}</td><td>${fmtNum(r.averageCarcassWeightKg)}</td><td>${fmt(r.dominantGrade)}</td><td>${fmt(r.killingOutPercentage)}%</td><td>${gbp(r.netPaymentGbp)}</td><td>${r.paymentReceived ? "Yes" : "No"}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Deadweight Settlements</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Deadweight Settlement Notes${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Kill Date</th><th>Abattoir</th><th>Head</th><th>Avg Carcass (kg)</th><th>Grade</th><th>Kill-Out %</th><th>Net Payment</th><th>Paid</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Deadweight settlement records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Deadweight Settlement Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printDeadweightReport, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ paymentReceived: "false" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Settlement"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "killDate", label: "Kill Date", render: (r) => fmtDate(r.killDate) },
          { key: "abattoirName", label: "Abattoir" },
          { key: "numberOfHead", label: "Head" },
          { key: "averageCarcassWeightKg", label: "Avg Carcass (kg)", render: (r) => fmtNum(r.averageCarcassWeightKg) },
          { key: "dominantGrade", label: "Grade" },
          { key: "netPaymentGbp", label: "Net Payment", render: (r) => gbp(r.netPaymentGbp) },
          { key: "paymentReceived", label: "Paid", render: (r) => r.paymentReceived ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", children: "Paid" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Outstanding" }) },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-deadweight-settlements", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Settlement Note" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Kill Date", fmtDate(viewing.killDate)], ["Abattoir", fmt(viewing.abattoirName)], ["Ref", fmt(viewing.abattoirRef)], ["Head", fmt(viewing.numberOfHead)], ["Avg Carcass Wt (kg)", fmtNum(viewing.averageCarcassWeightKg)], ["Total Carcass Wt (kg)", fmtNum(viewing.totalCarcassWeightKg)], ["Killing Out %", fmt(viewing.killingOutPercentage)], ["Grade", fmt(viewing.dominantGrade)], ["Avg Price/kg", gbp(viewing.averagePricePerKgGbp)], ["Total Value", gbp(viewing.totalValueGbp)], ["Levy Deduction", gbp(viewing.levyDeductionGbp)], ["Net Payment", gbp(viewing.netPaymentGbp)], ["Settlement Date", fmtDate(viewing.settlementDate)], ["Payment Received", viewing.paymentReceived ? "Yes" : "No"]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          !!viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-deadweight-settlements", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Settlement Note"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Kill Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.killDate ?? "", onChange: (e) => sf("killDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Abattoir Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abattoirName ?? "", onChange: (e) => sf("abattoirName", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Abattoir Ref", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abattoirRef ?? "", onChange: (e) => sf("abattoirRef", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number of Head", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfHead ?? "", onChange: (e) => sf("numberOfHead", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Carcass Wt (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageCarcassWeightKg ?? "", onChange: (e) => sf("averageCarcassWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total Carcass Wt (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.totalCarcassWeightKg ?? "", onChange: (e) => sf("totalCarcassWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Killing Out %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.killingOutPercentage ?? "", onChange: (e) => sf("killingOutPercentage", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dominant Grade", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.dominantGrade ?? "", onValueChange: (v) => sf("dominantGrade", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select EUROP grade..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["E3L", "E3H", "E4L", "E4H", "U3L", "U3H", "U4L", "U4H", "R3L", "R3H", "R4L", "R4H", "O3L", "O3H", "O4L", "O4H", "P3L", "P3H", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Price per kg (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.averagePricePerKgGbp ?? "", onChange: (e) => sf("averagePricePerKgGbp", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total Value (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.totalValueGbp ?? "", onChange: (e) => sf("totalValueGbp", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Levy Deduction (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.levyDeductionGbp ?? "", onChange: (e) => sf("levyDeductionGbp", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Net Payment (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.netPaymentGbp ?? "", onChange: (e) => sf("netPaymentGbp", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Settlement Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.settlementDate ?? "", onChange: (e) => sf("settlementDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.paymentReceived === "true", onCheckedChange: (v) => sf("paymentReceived", v ? "true" : "false"), id: "pr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pr", children: "Payment received" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function RTChecklistTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-rt", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-rt-checklists`), { credentials: "include" }).then((r) => r.json()) });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const save = useMutation({ mutationFn: (body) => {
    const url = editing ? api(`farms/${farmId}/beef-rt-checklists/${editing.id}`) : api(`farms/${farmId}/beef-rt-checklists`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["beef-rt", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/beef-rt-checklists/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-rt", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const boolFields = ["cattlePassportsCurrent", "herdRegisterUpToDate", "movementRecordsComplete", "medicineRecordsComplete", "feedRecordsComplete", "mbmFreeStatus", "tbStatusCurrent", "assuranceMembershipCurrent", "vetHealthPlanOnFile", "staffTrainingCurrent"];
  const boolLabels = { cattlePassportsCurrent: "Cattle passports current & on farm", herdRegisterUpToDate: "Herd register up to date", movementRecordsComplete: "Movement records complete", medicineRecordsComplete: "Medicine records complete", feedRecordsComplete: "Feed records complete", mbmFreeStatus: "MBM-free status confirmed", tbStatusCurrent: "TB test status current", assuranceMembershipCurrent: "Assurance membership current", vetHealthPlanOnFile: "Vet health plan on file", staffTrainingCurrent: "Staff training current" };
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.checkDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.checkDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printRtChecklists() {
    const tableRows = filtered.map((r) => `<tr><td>${r.checkDate ? new Date(String(r.checkDate)).toLocaleDateString("en-GB") : "—"}</td><td>${String(r.checkedBy ?? "—")}</td><td>${String(r.overallStatus ?? "—")}</td><td>${boolFields.filter((k) => r[k]).map((k) => boolLabels[k]).join("; ") || "—"}</td><td>${String(r.notes ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>RT Beef Checklists</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}@media print{@page{margin:1.5cm}}</style></head><body><h1>Red Tractor Beef &amp; Cattle Checklists${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Status</th><th>Compliant Items</th><th>Notes</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Red Tractor Beef & Cattle Checklists" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printRtChecklists, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ overallStatus: "pending" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "New Check"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "checkDate", label: "Date", render: (r) => fmtDate(r.checkDate) },
          { key: "checkedBy", label: "Checked By" },
          { key: "overallStatus", label: "Status", render: (r) => {
            const s = String(r.overallStatus ?? "");
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s === "pass" ? "default" : s === "fail" ? "destructive" : "secondary", children: s });
          } },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-rt-checklists", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "RT Beef & Cattle Checklist" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Date", fmtDate(viewing.checkDate)], ["Checked By", fmt(viewing.checkedBy)], ["Status", fmt(viewing.overallStatus)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 space-y-1 border rounded p-2", children: boolFields.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: viewing[k] ? "text-green-600" : "text-muted-foreground", children: viewing[k] ? "✓" : "✗" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: boolLabels[k] })
          ] }, k)) }),
          !!viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "beef-rt-checklists", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "New",
        " RT Beef & Cattle Checklist"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Check Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.checkDate ?? "", onChange: (e) => sf("checkDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Checked By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.checkedBy ?? "", onChange: (v) => sf("checkedBy", v), staffNames, loading: membersLoading }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 grid grid-cols-1 gap-2 border rounded p-3", children: boolFields.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form[k] === "true", onCheckedChange: (v) => sf(k, v ? "true" : "false"), id: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: k, className: "text-sm", children: boolLabels[k] })
        ] }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Overall Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallStatus ?? "pending", onValueChange: (v) => sf("overallStatus", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["pending", "pass", "fail", "action-required"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function ReportsTab({ farmId }) {
  const [yearFilter, setYearFilter] = reactExports.useState("__all__");
  const weighQ = useQuery({ queryKey: ["beef-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-weigh-records`), { credentials: "include" }).then((r) => r.json()) });
  const finishQ = useQuery({ queryKey: ["beef-finishing", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-finishing-records`), { credentials: "include" }).then((r) => r.json()) });
  const dwQ = useQuery({ queryKey: ["beef-deadweight", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-deadweight-records`), { credentials: "include" }).then((r) => r.json()) });
  const weighRows = Array.isArray(weighQ.data) ? weighQ.data : [];
  const finishRows = Array.isArray(finishQ.data) ? finishQ.data : [];
  const dwRows = Array.isArray(dwQ.data) ? dwQ.data : [];
  const years = [...new Set([
    ...weighRows.map((r) => r.weighDate ? String(r.weighDate).slice(0, 4) : null),
    ...finishRows.map((r) => r.exitDate ? String(r.exitDate).slice(0, 4) : null),
    ...dwRows.map((r) => r.killDate ? String(r.killDate).slice(0, 4) : null)
  ].filter((y) => !!y))].sort().reverse();
  const inYear = (date) => yearFilter === "__all__" || !!date && String(date).slice(0, 4) === yearFilter;
  const fw = weighRows.filter((r) => inYear(r.weighDate));
  const ff = finishRows.filter((r) => inYear(r.exitDate));
  const fd = dwRows.filter((r) => inYear(r.killDate));
  const avgDlwg = fw.length > 0 ? (fw.reduce((s, r) => s + (parseFloat(String(r.dlwgGPerDay ?? 0)) || 0), 0) / fw.length).toFixed(0) : null;
  const groups = [...new Set(fw.map((r) => r.groupRef).filter(Boolean))].length;
  const totalDw = fd.reduce((s, r) => s + (parseFloat(String(r.coldDeadweightKg ?? 0)) || 0), 0);
  const avgKillOut = fd.length > 0 ? (fd.reduce((s, r) => s + (parseFloat(String(r.killOutPct ?? 0)) || 0), 0) / fd.length).toFixed(1) : null;
  const totalSettlement = fd.reduce((s, r) => s + (parseFloat(String(r.netSettlementValue ?? 0)) || 0), 0);
  const gradeMap = {};
  fd.forEach((r) => {
    const g = String(r.europConformation ?? "Not recorded");
    gradeMap[g] = (gradeMap[g] || 0) + 1;
  });
  const statusMap = {};
  ff.forEach((r) => {
    const s = String(r.status ?? "active");
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  const isLoading = weighQ.isLoading || finishQ.isLoading || dwQ.isLoading;
  const periodLabel = yearFilter === "__all__" ? "All Time" : yearFilter;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
        "Beef Production Report — ",
        periodLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: yearFilter, onChange: (e) => setYearFilter(e.target.value), style: { padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__all__", children: "All Time" }),
          years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          const gradeRows = Object.entries(gradeMap).map(([g, n]) => `<tr><td>${g}</td><td style="text-align:right">${n}</td></tr>`).join("");
          const statusRows = Object.entries(statusMap).map(([s, n]) => `<tr><td style="text-transform:capitalize">${s}</td><td style="text-align:right">${n}</td></tr>`).join("");
          openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Production Report — ${periodLabel}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}h3{font-size:11px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:2px}table{border-collapse:collapse;margin-bottom:12px}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 8px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 8px;border:1px solid #e5e7eb}.stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px}.stat{text-align:center;border:1px solid #e5e7eb;border-radius:6px;padding:8px 14px}.stat-n{font-size:20px;font-weight:700}.stat-l{font-size:9px;color:#666;margin-top:2px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<h1>Beef Production Report — ${periodLabel}</h1>
<h2>Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<h3>Weigh-in &amp; DLWG</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${fw.length}</div><div class="stat-l">Records</div></div>
  <div class="stat"><div class="stat-n">${avgDlwg ?? "—"}</div><div class="stat-l">Avg DLWG (g/day)</div></div>
  <div class="stat"><div class="stat-n">${groups || "—"}</div><div class="stat-l">Groups Weighed</div></div>
</div>
<h3>Finishing Records</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${ff.length}</div><div class="stat-l">Total Records</div></div>
</div>
${statusRows ? `<table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>${statusRows}</tbody></table>` : ""}
<h3>Deadweight Settlements</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${fd.length}</div><div class="stat-l">Kill Sheets</div></div>
  <div class="stat"><div class="stat-n">${totalDw > 0 ? `${totalDw.toFixed(0)}kg` : "—"}</div><div class="stat-l">Total Deadweight</div></div>
  <div class="stat"><div class="stat-n">${avgKillOut ? `${avgKillOut}%` : "—"}</div><div class="stat-l">Avg Kill-Out</div></div>
  <div class="stat"><div class="stat-n">${totalSettlement > 0 ? `£${totalSettlement.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}</div><div class="stat-l">Total Settlement</div></div>
</div>
${gradeRows ? `<table><thead><tr><th>EUROP Grade</th><th>Count</th></tr></thead><tbody>${gradeRows}</tbody></table>` : ""}
</body></html>`);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print Report"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-4 h-4 text-amber-700" }),
          "Weigh-in & DLWG"
        ] }),
        fw.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No weigh-in records for this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: fw.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Records" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: avgDlwg ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg DLWG (g/day)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: groups || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Groups Weighed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-700" }),
          "Finishing Records"
        ] }),
        ff.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No finishing records for this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: ff.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Records" })
          ] }),
          Object.entries(statusMap).map(([s, n]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: n }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground capitalize", children: s })
          ] }, s))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-blue-700" }),
          "Deadweight Settlements"
        ] }),
        fd.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No deadweight records for this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: fd.length }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Kill Sheets" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: totalDw > 0 ? `${totalDw.toFixed(0)}kg` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Deadweight" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: avgKillOut ? `${avgKillOut}%` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Avg Kill-Out" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: totalSettlement > 0 ? `£${totalSettlement.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Settlement" })
            ] })
          ] }),
          Object.keys(gradeMap).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2 font-medium", children: "EUROP Grade Distribution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(gradeMap).map(([g, n]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
              g,
              ": ",
              n
            ] }, g)) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function BeefProductionPage() {
  const farmId = useAppStore((s) => s.farmId);
  const [tab, setTab] = reactExports.useState("weigh");
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [tabsReady, setTabsReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (farmId) setTabsReady(true);
    else setTabsReady(false);
  }, [farmId]);
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Select a farm to view beef production records." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-6 h-6 text-amber-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Beef & Cattle Production" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Weigh-in & DLWG, finishing records, deadweight settlements and Red Tractor cattle checklist" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "weigh", onClick: () => setTab("weigh"), children: "Weigh-in & DLWG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "finishing", onClick: () => setTab("finishing"), children: "Finishing Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "deadweight", onClick: () => setTab("deadweight"), children: "Deadweight Settlement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "rt-checklist", onClick: () => setTab("rt-checklist"), children: "RT Checklist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "reports", onClick: () => setTab("reports"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Reports"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Enterprise Report"
        ] })
      ] }),
      tabsReady && tab === "weigh" && /* @__PURE__ */ jsxRuntimeExports.jsx(WeighTab, { farmId, onRaiseTask: setRaiseTaskFor }),
      tabsReady && tab === "finishing" && /* @__PURE__ */ jsxRuntimeExports.jsx(FinishingTab, { farmId }),
      tabsReady && tab === "deadweight" && /* @__PURE__ */ jsxRuntimeExports.jsx(DeadweightTab, { farmId }),
      tabsReady && tab === "rt-checklist" && /* @__PURE__ */ jsxRuntimeExports.jsx(RTChecklistTab, { farmId }),
      tabsReady && tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, { farmId }),
      tabsReady && tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(BeefEnterpriseReport, { farmId })
    ] }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Beef Weigh Review — ${raiseTaskFor.groupRef ?? raiseTaskFor.breed ?? "Group"}`,
        defaultDescription: `Avg weight: ${raiseTaskFor.averageLiveWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.averageBcsScore ?? "—"}`,
        module: "beef"
      }
    )
  ] });
}
export {
  BeefProductionPage as default
};
