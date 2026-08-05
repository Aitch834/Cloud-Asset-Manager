import { r as reactExports, m as useQuery, j as jsxRuntimeExports, b as useAppStore, e as LoaderCircle, c as useQueryClient, a as useToast, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, C as Checkbox, L as Label, N as DialogMutationError } from "./index-D6bw93Jo.js";
import { R as RecordAttachments } from "./RecordAttachments-BM1K4QbJ.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-B8G5q2fz.js";
import { P as Printer } from "./printer-D21ZNhpx.js";
import { T as TrendingUp, A as AppLayout, Y as Scissors, f as Scale, e as ChartColumn, c as ClipboardList } from "./AppLayout-D2gQ58U4.js";
import { T as TrendingDown } from "./trending-down-DHuVS3sE.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar, C as Cell } from "./generateCategoricalChart-BSAE7OOS.js";
import { B as BarChart } from "./BarChart-CaNUtWRn.js";
import { C as CartesianGrid } from "./CartesianGrid-DUi7n_Ff.js";
import { C as ChevronUp } from "./chevron-up-BY-iJGpI.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-jwo4CQBF.js";
import { T as Textarea } from "./textarea-DhX9Haxh.js";
import { B as Badge } from "./badge-D54CfJi4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CWHH7ljy.js";
import { T as TabBar, a as TabButton } from "./tab-button-BO2D9aQp.js";
import { u as usePersistedTab } from "./use-persisted-tab-CqrjwuG2.js";
import { u as useFarmMembers } from "./use-farm-members-BqTCVfHW.js";
import { S as StaffSelect } from "./staff-select-DNThP-zm.js";
import { B as BuyerCombobox } from "./BuyerCombobox-cFOmcN-M.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { T as TriangleAlert } from "./triangle-alert-BePnejc7.js";
import { E as Eye } from "./eye-B9O6zTAR.js";
import { P as Pencil } from "./pencil-QZ12bX3q.js";
import { P as PieChart, a as Pie } from "./PieChart-DrE8Zeim.js";
import "./use-upload-BvLfAQ16.js";
import "./paperclip-DYAdO14z.js";
import "./upload-Bv9zT6ix.js";
import "./image-C9X2JIeD.js";
import "./shield-alert-DZT2FckP.js";
import "./download-DakwvR5A.js";
import "./use-safe-clerk-CB_9DKv_.js";
import "./database-DiWKLm6k.js";
import "./shield-check-CfqvDGDg.js";
import "./tractor-BfpSxQjK.js";
import "./index-UceG-W_u.js";
import "./index-BSRQqjSt.js";
import "./popover-CG6A1jPm.js";
import "./command-BMY0pyT4.js";
import "./search-DPJQUTfC.js";
import "./chevrons-up-down-DqaF2oSh.js";
import "./user-plus-Dhi0m3SI.js";
const PRINT_ID = "sheep-enterprise-report-print";
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
function fmtGBPv(v) {
  return `£${v.toFixed(2)}`;
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
function SheepEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const currentFlockYear = (/* @__PURE__ */ new Date()).getMonth() >= 7 ? currentYear : currentYear - 1;
  const [year, setYear] = reactExports.useState(currentFlockYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data, isLoading } = useQuery({
    queryKey: ["sheep-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/sheep-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentFlockYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.totalHeadSold > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = reactExports.useMemo(() => {
    if (!d) return [];
    const map = {};
    d.cullRecords.forEach((r) => {
      const m = r.cullDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].cullRevenue += Math.round(parseFloat(String(r.totalValueGbp)) * 100);
    });
    d.shearingRecords.forEach((r) => {
      const m = r.shearingDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].woolRevenue += Math.round(parseFloat(String(r.totalValueGbp)) * 100);
    });
    d.feedDeliveries.forEach((f) => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].feedCost += f.costPence;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Lamb/Cull Sales": v.cullRevenue,
      "Wool Sales": v.woolRevenue,
      "Feed Cost": v.feedCost
    }));
  }, [d]);
  const avgLambPrice = d && d.cullRecords.length > 0 ? d.cullRecords.reduce((s, r) => s + parseFloat(String(r.pricePerHeadGbp)), 0) / d.cullRecords.length : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Sheep Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Flock year Aug–Jul · Gross margin per head sold · Wool income" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: y, children: [
          y,
          "/",
          (y + 1).toString().slice(2)
        ] }, y)) }),
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
      "No cull records, shearing records, feed deliveries or purchases found for flock year ",
      d?.flockYear ?? `${year}/${(year + 1).toString().slice(2)}`,
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Flock Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: d.flockYear }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.totalHeadSold,
            " head sold · ",
            d.totalWoolKg.toFixed(0),
            " kg wool"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Total Output" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-700", children: fmtGBP(d.totalRevenuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            avgLambPrice ? `avg £${avgLambPrice.toFixed(2)}/head` : "Lambs",
            " + wool ",
            fmtGBP(d.totalWoolRevenuePence)
          ] })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: d.grossMarginPerHeadSoldPence != null ? `${fmtGBP(d.grossMarginPerHeadSoldPence)}/head sold` : "—" })
        ] })
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Monthly Output vs Feed Cost — Flock Year ",
          d.flockYear
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Lamb/Cull Sales", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Wool Sales", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#ef4444", radius: [3, 3, 0, 0], maxBarSize: 36 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Enterprise Summary — Flock Year ",
          d.flockYear
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Per Head Sold" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: `Lamb/cull sales (${d.cullRecords.length} records · ${d.totalHeadSold} head)`, value: d.totalCullRevenuePence, positive: true },
            { label: `Wool sales${d.avgWoolPricePerKgGbp ? ` · avg £${d.avgWoolPricePerKgGbp.toFixed(2)}/kg` : ""} (${d.totalWoolKg.toFixed(0)} kg)`, value: d.totalWoolRevenuePence, positive: true },
            { label: "Total output", value: d.totalRevenuePence, bold: true, divider: true },
            { label: `Feed cost (${d.feedDeliveries.length} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence },
            { label: `Livestock purchases (${d.totalHeadPurchased} head)`, value: -d.totalPurchaseCostPence },
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, bold: false }] : [],
            ...(d.totalContractorCostPence ?? 0) > 0 ? [{ label: "Contractor costs (field ops)", value: -d.totalContractorCostPence, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d.totalHeadSold) : "—" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed from priced deliveries tagged to sheep. Shearing contractor, dipping, scanning, vet, and fixed costs should be added via Financial for a complete enterprise P&L." })
      ] }),
      d.cullRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Lamb & Cull Sales (${d.cullRecords.length} records · ${d.totalHeadSold} head)`, open: openSection === "culls", setOpen: (v) => toggle(v ? "culls" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "£/Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Total Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Reason" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.cullRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(r.cullDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.numberOfHead }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: fmtGBPv(parseFloat(String(r.pricePerHeadGbp))) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: fmtGBPv(parseFloat(String(r.totalValueGbp))) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-foreground/60", children: r.reason ?? "—" })
        ] }, r.id)) })
      ] }) }),
      d.shearingRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Shearing Records (${d.shearingRecords.length} · ${d.totalWoolKg.toFixed(0)} kg)`, open: openSection === "shearing", setOpen: (v) => toggle(v ? "shearing" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Wool (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "£/kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.shearingRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(r.shearingDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.headSheared }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: parseFloat(String(r.totalWoolWeightKg)).toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: fmtGBPv(parseFloat(String(r.pricePerKgGbp))) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: fmtGBPv(parseFloat(String(r.totalValueGbp))) })
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
function FlocksTab({ farmId }) {
  const { data: herds = [], isLoading } = useQuery({ queryKey: ["sheep-flocks", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-flocks`), { credentials: "include" }).then((r) => r.json()) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Flocks are managed in Livestock → Herds & Animals." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Records in the tabs below link to those herds. To create, edit, or archive a flock, use the Livestock module."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
      "Registered Flocks / Herds ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
        "(",
        herds.length,
        ")"
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "flockName", label: "Name" },
          { key: "breed", label: "Breed" },
          { key: "flockPurpose", label: "Type / Purpose" },
          { key: "herdFlockNumber", label: "Herd / Flock No." },
          { key: "status", label: "Status", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "active" ? "default" : "secondary", children: fmt(r.status) }) }
        ],
        rows: herds
      }
    )
  ] });
}
function TuppingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-tupping", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/sheep-tupping-records/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-tupping-records`);
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const tupping = await res.json();
      const cidrUsed = body.progesteroneUsed === "true" || body.progesteroneUsed === true;
      if (cidrUsed && body.cidrProductName) {
        const adminDate = body.cidrAdminDate || body.tuppingStartDate;
        const wdDays = parseInt(String(body.cidrWithdrawalDays ?? "1")) || 1;
        const wdEnd = adminDate ? new Date(new Date(String(adminDate)).getTime() + wdDays * 864e5).toISOString().slice(0, 10) : null;
        await fetch(apiUrl(`farms/${farmId}/medicine-records`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            medicineName: body.cidrProductName,
            batchNumber: body.cidrBatchNumber || null,
            dosage: body.cidrDosePerEwe || "1 device per ewe",
            administrationRoute: body.cidrRoute || "Intravaginal",
            administeredBy: body.cidrAdministeredBy || null,
            administeredDate: adminDate,
            vetName: body.cidrPrescribingVet || null,
            treatmentScope: "group",
            treatedAnimalCount: body.ewesExposed ? parseInt(String(body.ewesExposed)) : null,
            withdrawalPeriodDays: wdDays,
            withdrawalEndDate: wdEnd,
            reason: "Reproductive cycle synchronisation — tupping preparation",
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""} | Rx ref: ${body.cidrPrescriptionRef || "—"} | Practice: ${body.cidrVetPractice || "—"}`,
            source: "tupping-record"
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      if (cidrUsed && body.createVetVisit === "true" && body.cidrPrescribingVet) {
        await fetch(apiUrl(`farms/${farmId}/vet-visits`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visitDate: body.cidrAdminDate || body.tuppingStartDate,
            vetName: body.cidrPrescribingVet,
            vetPractice: body.cidrVetPractice || null,
            reasonForVisit: "POM-V prescription — Progesterone/CIDR for cycle synchronisation",
            treatmentsCarriedOut: `${body.cidrProductName || "CIDR/Progesterone"} administered to ${body.ewesExposed || "?"} ewes`,
            prescriptionsIssued: body.cidrPrescriptionRef || null,
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""}`
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      if (cidrUsed && body.cidrCostGbp && parseFloat(String(body.cidrCostGbp)) > 0) {
        await fetch(apiUrl(`farms/${farmId}/financial-transactions`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            transactionType: "expense",
            category: "Veterinary & Medicine",
            description: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || ""} ewes (tupping ${body.tuppingStartDate})`,
            amountPence: Math.round(parseFloat(String(body.cidrCostGbp)) * 100),
            transactionDate: body.cidrAdminDate || body.tuppingStartDate,
            reference: body.cidrPrescriptionRef || null,
            vendorCustomer: body.cidrVetPractice || null,
            notes: "Auto-created from tupping record (CIDR/Progesterone cost)"
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      return tupping;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] });
      qc.invalidateQueries({ queryKey: ["medicine-records", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  function openAdd() {
    setEditing(null);
    setForm({ progesteroneUsed: "false" });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.tuppingStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.tuppingStartDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printTuppingRecords() {
    const tableRows = filtered.map((r) => `<tr>
      <td>${fmtDate(r.tuppingStartDate)}</td><td>${fmtDate(r.tuppingEndDate)}</td><td>${fmt(r.ramBreed)}</td><td>${fmt(r.ramTagNumber)}</td><td>${fmt(r.ewesExposed)}</td><td>${fmtDate(r.expectedLambingStart)}</td><td>${r.progesteroneUsed ? "Yes" : "No"}</td><td>${fmt(r.notes)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Tupping Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body>
<h1>Tupping Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1>
<h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Start Date</th><th>End Date</th><th>Ram Breed</th><th>Ram Tag</th><th>Ewes Exposed</th><th>Expected Lambing</th><th>Progesterone</th><th>Notes</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance requires tupping records to be maintained and available at audit. Retain records for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Tupping Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printTuppingRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "tuppingStartDate", label: "Start Date", render: (r) => fmtDate(r.tuppingStartDate) },
          { key: "tuppingEndDate", label: "End Date", render: (r) => fmtDate(r.tuppingEndDate) },
          { key: "ramBreed", label: "Ram Breed" },
          { key: "ramTagNumber", label: "Ram Tag" },
          { key: "ewesExposed", label: "Ewes Exposed" },
          { key: "expectedLambingStart", label: "Expected Lambing", render: (r) => fmtDate(r.expectedLambingStart) },
          { key: "progesteroneUsed", label: "Progesterone", render: (r) => r.progesteroneUsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-purple-100 text-purple-800 border border-purple-200 text-xs font-medium", children: "CIDR / Prog." }) : null },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-tupping-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tupping Record Details" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Start Date", fmtDate(viewing.tuppingStartDate)], ["End Date", fmtDate(viewing.tuppingEndDate)], ["Ram Breed", fmt(viewing.ramBreed)], ["Ram Tag", fmt(viewing.ramTagNumber)], ["Ram Source", fmt(viewing.ramSource)], ["Ewes Exposed", fmt(viewing.ewesExposed)], ["Tupping Method", fmt(viewing.tuppingMethod)], ["Harness Colour", fmt(viewing.harnessColour)], ["Progesterone Used", viewing.progesteroneUsed ? "Yes" : "No"], ["Expected Lambing Start", fmtDate(viewing.expectedLambingStart)], ["Expected Lambing End", fmtDate(viewing.expectedLambingEnd)]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              label,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(value) })
          ] }, String(label))),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-tupping-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Tupping Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Start Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.tuppingStartDate ?? "", onChange: (e) => sf("tuppingStartDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "End Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.tuppingEndDate ?? "", onChange: (e) => sf("tuppingEndDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ram Breed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ramBreed ?? "", onValueChange: (v) => sf("ramBreed", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Suffolk", "Texel", "Charollais", "Beltex", "Bluefaced Leicester", "Border Leicester", "Hampshire Down", "Poll Dorset", "Rouge de l'Ouest", "Vendeen", "Lleyn", "Cheviot", "Swaledale", "Herdwick", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ram Tag Number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramTagNumber ?? "", onChange: (e) => sf("ramTagNumber", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ram Source", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ramSource ?? "", onValueChange: (v) => sf("ramSource", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Home bred", "Purchased at auction/market", "Private sale", "AI centre", "ET donor flock", "Hired/loaned", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ewes Exposed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.ewesExposed ?? "", onChange: (e) => sf("ewesExposed", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tupping Method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tuppingMethod ?? "", onValueChange: (v) => sf("tuppingMethod", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Natural service", "AI (fresh)", "AI (frozen)", "ET"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Harness Colour", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harnessColour ?? "", onValueChange: (v) => sf("harnessColour", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "None"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected Lambing Start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingStart ?? "", onChange: (e) => sf("expectedLambingStart", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected Lambing End", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingEnd ?? "", onChange: (e) => sf("expectedLambingEnd", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.progesteroneUsed === "true", onCheckedChange: (v) => sf("progesteroneUsed", v ? "true" : "false"), id: "prog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prog", children: "Progesterone / CIDR used (POM-V)" })
        ] }),
        form.progesteroneUsed === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-amber-800", children: "POM-V Medicine Record — Veterinary Medicines Regulations 2013 & Red Tractor Sheep Assurance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Product Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cidrProductName ?? "", onValueChange: (v) => sf("cidrProductName", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select product..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Chronogest CR 0.3g (progesterone sponge)", "Eazi-Breed CIDR Sheep (0.3g progesterone)", "Chronogest CR 0.33g", "Cue-Mate", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch Number *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrBatchNumber ?? "", onChange: (e) => sf("cidrBatchNumber", e.target.value), placeholder: "e.g. B24031A" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dose / Qty per Ewe", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrDosePerEwe ?? "1 sponge / device", onChange: (e) => sf("cidrDosePerEwe", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Route of Administration", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cidrRoute ?? "Intravaginal", onValueChange: (v) => sf("cidrRoute", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Intravaginal", "Subcutaneous injection (GnRH / eCG)", "Intramuscular injection"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administered By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrAdministeredBy ?? "", onChange: (e) => sf("cidrAdministeredBy", e.target.value), placeholder: "Person who inserted devices" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administration Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.cidrAdminDate || form.tuppingStartDate || "", onChange: (e) => sf("cidrAdminDate", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Prescribing Vet *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrPrescribingVet ?? "", onChange: (e) => sf("cidrPrescribingVet", e.target.value), placeholder: "Required for POM-V" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vet Practice", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrVetPractice ?? "", onChange: (e) => sf("cidrVetPractice", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Prescription Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrPrescriptionRef ?? "", onChange: (e) => sf("cidrPrescriptionRef", e.target.value), placeholder: "e.g. WP-2024-001" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meat W/D (days)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.cidrWithdrawalDays ?? "1", onChange: (e) => sf("cidrWithdrawalDays", e.target.value) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total Medicine Cost (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.cidrCostGbp ?? "", onChange: (e) => sf("cidrCostGbp", e.target.value), placeholder: "Optional — creates expense record" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.createVetVisit === "true", onCheckedChange: (v) => sf("createVetVisit", v ? "true" : "false"), id: "create-vet-visit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "create-vet-visit", className: "text-xs cursor-pointer font-normal text-amber-900", children: "Also create a Vet Visit entry in the Vet Ledger" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-medium", children: "✓ A Medicine Register entry will be created automatically in Livestock → Medicines when saved." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-4 h-4 mr-1" }) : null,
          editing ? "Save" : "Add"
        ] })
      ] })
    ] }) })
  ] });
}
function ScanningTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-scanning", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-scanning-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/sheep-scanning-records/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-scanning-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-scanning-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.scanDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.scanDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printScanningRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.scanDate)}</td><td>${fmt(r.scannerName)}</td><td>${fmt(r.ewesScanned)}</td><td>${fmt(r.ewesInLamb)}</td><td>${fmt(r.ewesBare)}</td><td>${fmt(r.singlesCount)}</td><td>${fmt(r.twinsCount)}</td><td>${fmt(r.triplesCount)}</td><td>${fmt(r.quadsCount)}</td><td>${fmt(r.scanningPercentage)}%</td><td>${fmt(r.expectedLambsTotal)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Scanning Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Scanning Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Scan Date</th><th>Scanner</th><th>Scanned</th><th>In Lamb</th><th>Bare</th><th>Singles</th><th>Twins</th><th>Triplets</th><th>Quads</th><th>Scanning %</th><th>Expected Lambs</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: scanning records must be maintained and available at audit. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Scanning Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printScanningRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "scanDate", label: "Scan Date", render: (r) => fmtDate(r.scanDate) },
          { key: "scannerName", label: "Scanner" },
          { key: "ewesScanned", label: "Scanned" },
          { key: "ewesInLamb", label: "In Lamb" },
          { key: "scanningPercentage", label: "Scanning %" },
          { key: "expectedLambsTotal", label: "Expected Lambs" },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-scanning-records", recordId: r.id, farmId, compact: true }) : null }
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Scanning Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Scan Date", fmtDate(viewing.scanDate)], ["Scanner", fmt(viewing.scannerName)], ["Ewes Scanned", fmt(viewing.ewesScanned)], ["Ewes In Lamb", fmt(viewing.ewesInLamb)], ["Ewes Bare", fmt(viewing.ewesBare)], ["Singles", fmt(viewing.singlesCount)], ["Twins", fmt(viewing.twinsCount)], ["Triplets", fmt(viewing.triplesCount)], ["Quads", fmt(viewing.quadsCount)], ["Scanning %", fmt(viewing.scanningPercentage)], ["Expected Lambs", fmt(viewing.expectedLambsTotal)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-scanning-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Scanning Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scan Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.scanDate ?? "", onChange: (e) => sf("scanDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scanner Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.scannerName ?? "", onChange: (e) => sf("scannerName", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ewes Scanned", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.ewesScanned ?? "", onChange: (e) => sf("ewesScanned", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ewes In Lamb", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.ewesInLamb ?? "", onChange: (e) => sf("ewesInLamb", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ewes Bare", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.ewesBare ?? "", onChange: (e) => sf("ewesBare", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scanning %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.scanningPercentage ?? "", onChange: (e) => sf("scanningPercentage", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Singles", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.singlesCount ?? "", onChange: (e) => sf("singlesCount", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Twins", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.twinsCount ?? "", onChange: (e) => sf("twinsCount", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Triplets", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.triplesCount ?? "", onChange: (e) => sf("triplesCount", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected Lambs Total", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.expectedLambsTotal ?? "", onChange: (e) => sf("expectedLambsTotal", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function WeighTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-weigh", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-weigh-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: weighEquipList = [] } = useQuery({ queryKey: ["weighing-equipment", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/weighing-equipment`), { credentials: "include" }).then((r) => r.json()) });
  const prevWeigh = useQuery({
    queryKey: ["sheep-weigh-latest", farmId, form.animalCategory, form.weighDate],
    queryFn: async () => {
      const params = new URLSearchParams({ category: form.animalCategory ?? "", beforeDate: form.weighDate ?? "" });
      const res = await fetch(apiUrl(`farms/${farmId}/sheep-weigh-latest?${params}`), { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !editing && !!form.animalCategory && !!form.weighDate,
    staleTime: 6e4
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/sheep-weigh-records/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-weigh-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-weigh-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.weighDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.weighDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  const equipMap = reactExports.useMemo(() => Object.fromEntries(weighEquipList.map((e) => [String(e.id), String(e.name)])), [weighEquipList]);
  const prevRec = prevWeigh.data;
  const calcTotalKg = reactExports.useMemo(() => {
    const n = parseFloat(form.numberOfAnimalsWeighed ?? "");
    const avg = parseFloat(form.averageWeightKg ?? "");
    return Number.isFinite(n) && Number.isFinite(avg) && n > 0 && avg > 0 ? (n * avg).toFixed(1) : null;
  }, [form.numberOfAnimalsWeighed, form.averageWeightKg]);
  const calcDays = reactExports.useMemo(() => {
    if (!prevRec?.weighDate || !form.weighDate) return null;
    const diff = new Date(form.weighDate).getTime() - new Date(String(prevRec.weighDate)).getTime();
    return diff > 0 ? Math.round(diff / 864e5) : null;
  }, [prevRec, form.weighDate]);
  const calcDlwg = reactExports.useMemo(() => {
    const curr = parseFloat(form.averageWeightKg ?? "");
    if (!prevRec?.averageWeightKg || !Number.isFinite(curr) || !calcDays || calcDays <= 0) return null;
    return Math.round((curr - parseFloat(String(prevRec.averageWeightKg))) * 1e3 / calcDays);
  }, [prevRec, form.averageWeightKg, calcDays]);
  function handleSave() {
    const body = { ...form };
    if (!body.totalWeightKg && calcTotalKg) body.totalWeightKg = calcTotalKg;
    if (!body.daysSincePreviousWeigh && calcDays != null) body.daysSincePreviousWeigh = String(calcDays);
    if (!body.dlwgGPerDay && calcDlwg != null) body.dlwgGPerDay = String(calcDlwg);
    save.mutate(body);
  }
  function printWeighRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.weighDate)}</td><td>${fmt(r.weighBatchRef)}</td><td>${fmt(r.animalCategory)}</td><td>${fmt(r.numberOfAnimalsWeighed)}</td><td>${fmtNum(r.averageWeightKg)}</td><td>${fmtNum(r.totalWeightKg)}</td><td>${fmtNum(r.targetWeightKg)}</td><td>${fmtNum(r.dlwgGPerDay, 0)}</td><td>${fmt(r.bodyConditionScore)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Sheep Weigh-in Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Sheep Weigh-in &amp; Performance Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Batch Ref</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>Total Wt (kg)</th><th>Target (kg)</th><th>DLWG (g/day)</th><th>BCS</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: weight records must be maintained to demonstrate welfare monitoring. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Weigh-in & Performance Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printWeighRecords, children: [
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
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "weighDate", label: "Date", render: (r) => fmtDate(r.weighDate) },
          { key: "weighBatchRef", label: "Batch Ref" },
          { key: "animalCategory", label: "Category" },
          { key: "numberOfAnimalsWeighed", label: "Count" },
          { key: "averageWeightKg", label: "Avg Wt (kg)", render: (r) => fmtNum(r.averageWeightKg) },
          { key: "dlwgGPerDay", label: "DLWG (g/day)", render: (r) => fmtNum(r.dlwgGPerDay, 0) },
          { key: "bodyConditionScore", label: "BCS" },
          { key: "_equip", label: "Equipment", render: (r) => r.weighingEquipmentId ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: equipMap[String(r.weighingEquipmentId)] ?? "—" }) : null },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-weigh-records", recordId: r.id, farmId, compact: true }) : null }
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Weigh-in Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [
            ["Date", fmtDate(viewing.weighDate)],
            ["Batch Ref", fmt(viewing.weighBatchRef)],
            ["Category", fmt(viewing.animalCategory)],
            ["Animals Weighed", fmt(viewing.numberOfAnimalsWeighed)],
            ["Avg Weight (kg)", fmtNum(viewing.averageWeightKg)],
            ["Total Weight (kg)", fmtNum(viewing.totalWeightKg)],
            ["Target Weight (kg)", fmtNum(viewing.targetWeightKg)],
            ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay, 0)],
            ["Days Since Last Weigh", fmt(viewing.daysSincePreviousWeigh)],
            ["BCS", fmt(viewing.bodyConditionScore)],
            ["Equipment", viewing.weighingEquipmentId ? equipMap[String(viewing.weighingEquipmentId)] ?? "—" : "—"]
          ].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-weigh-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-purple-700 border-purple-200 hover:bg-purple-50", onClick: () => {
          setRaiseTaskFor(viewing);
          setViewing(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Task"
        ] })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Sheep Weigh Review — ${raiseTaskFor.weighBatchRef ?? raiseTaskFor.animalCategory ?? "Batch"}`,
        defaultDescription: `Avg weight: ${raiseTaskFor.averageWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.bodyConditionScore ?? "—"}`,
        module: "sheep"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm({});
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Weigh Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weigh Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.weighDate ?? "", onChange: (e) => sf("weighDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch Ref", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.weighBatchRef ?? "", onChange: (e) => sf("weighBatchRef", e.target.value), placeholder: "e.g. Spring 2024 — Group A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animal Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.animalCategory ?? "", onValueChange: (v) => sf("animalCategory", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Lambs (spring)", "Lambs (autumn)", "Store lambs", "Hoggets", "Ewes", "Ram lambs"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }) }),
        prevRec && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Previous record found:" }),
            " ",
            fmtDate(prevRec.weighDate),
            " · Avg ",
            fmtNum(prevRec.averageWeightKg),
            " kg",
            calcDays != null ? ` · ${calcDays} days ago` : "",
            " — Days and DLWG will be auto-calculated on save."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weighing Equipment", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.weighingEquipmentId ?? "", onValueChange: (v) => sf("weighingEquipmentId", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: weighEquipList.filter((e) => e.status === "active").length ? "Select scale / crush…" : "No active equipment registered" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "None selected" }),
            weighEquipList.filter((e) => e.status === "active").map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
              String(e.name),
              " — ",
              String(e.type ?? "").replace(/_/g, " ")
            ] }, String(e.id)))
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number Weighed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberOfAnimalsWeighed ?? "", onChange: (e) => sf("numberOfAnimalsWeighed", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageWeightKg ?? "", onChange: (e) => sf("averageWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          "Total Weight (kg)",
          !form.totalWeightKg && calcTotalKg && !editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700", children: "auto" })
        ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.totalWeightKg ?? "", onChange: (e) => sf("totalWeightKg", e.target.value), placeholder: !editing && calcTotalKg ? calcTotalKg : "", className: !form.totalWeightKg && calcTotalKg && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.targetWeightKg ?? "", onChange: (e) => sf("targetWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          "Days Since Last Weigh",
          !form.daysSincePreviousWeigh && calcDays != null && !editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700", children: "auto" })
        ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.daysSincePreviousWeigh ?? "", onChange: (e) => sf("daysSincePreviousWeigh", e.target.value), placeholder: !editing && calcDays != null ? String(calcDays) : "", className: !form.daysSincePreviousWeigh && calcDays != null && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          "DLWG (g/day)",
          !form.dlwgGPerDay && calcDlwg != null && !editing && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700", children: "auto" })
        ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.dlwgGPerDay ?? "", onChange: (e) => sf("dlwgGPerDay", e.target.value), placeholder: !editing && calcDlwg != null ? String(calcDlwg) : "", className: !form.dlwgGPerDay && calcDlwg != null && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : "" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BCS (1–5, steps of 0.5)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "1", max: "5", value: form.bodyConditionScore ?? "", onChange: (e) => sf("bodyConditionScore", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
          setForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSave, disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function WeighingEquipmentTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [calOpen, setCalOpen] = reactExports.useState(false);
  const [calForm, setCalForm] = reactExports.useState({});
  const [form, setForm] = reactExports.useState({});
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["weighing-equipment", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/weighing-equipment`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: calibrations = [] } = useQuery({
    queryKey: ["weighing-equipment-calibrations", farmId, viewing?.id],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/weighing-equipment/${viewing.id}/calibrations`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!viewing?.id
  });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/weighing-equipment/${editing.id}`) : apiUrl(`farms/${farmId}/weighing-equipment`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/weighing-equipment/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveCal = useMutation({
    mutationFn: (body) => fetch(apiUrl(`farms/${farmId}/weighing-equipment/${viewing.id}/calibrations`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weighing-equipment-calibrations", farmId, viewing?.id] });
      qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] });
      setCalOpen(false);
      setCalForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const EQUIP_TYPES = {
    crush_scale: "Crush Scale",
    floor_scale: "Floor / Platform Scale",
    hanging_scale: "Hanging Scale",
    weigh_band: "Weigh Band / Tape",
    electronic_crate: "Electronic Weigh Crate",
    portable_weigher: "Portable Weigher",
    other: "Other"
  };
  const overdueAny = equipment.some(
    (e) => e.status === "active" && e.nextCalibrationDue && new Date(String(e.nextCalibrationDue)) < /* @__PURE__ */ new Date()
  );
  function CalibBadge({ equip }) {
    if (!equip.nextCalibrationDue) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs font-normal", children: "Not set" });
    const daysUntil = Math.ceil((new Date(String(equip.nextCalibrationDue)).getTime() - Date.now()) / 864e5);
    if (daysUntil < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-red-100 text-red-800 text-xs font-normal", children: [
      "Overdue ",
      Math.abs(daysUntil),
      "d"
    ] });
    if (daysUntil <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-amber-100 text-amber-800 text-xs font-normal", children: [
      "Due in ",
      daysUntil,
      "d"
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 text-xs font-normal", children: fmtDate(equip.nextCalibrationDue) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Weighing Equipment Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Register livestock weighing equipment and track calibration dates for Red Tractor compliance and accuracy assurance." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({ calibrationIntervalMonths: "12", status: "active" });
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Equipment"
      ] })
    ] }),
    overdueAny && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Calibration overdue" }),
        " — one or more items require calibration. Arrange immediately to maintain weighing accuracy."
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : equipment.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-16 text-center text-muted-foreground text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No equipment registered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add your first scale or crush to begin tracking calibrations." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/40 border-b", children: ["Name / Type", "Last Calibration", "Next Due", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: equipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: String(e.name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            EQUIP_TYPES[String(e.type ?? "")] ?? String(e.type ?? ""),
            e.manufacturer ? ` · ${e.manufacturer}` : "",
            e.model ? ` ${e.model}` : "",
            e.location ? ` · ${e.location}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: e.lastCalibrationDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: fmtDate(e.lastCalibrationDate) }),
          e.lastCalibrationResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs mt-0.5 font-normal ${e.lastCalibrationResult === "pass" ? "bg-green-100 text-green-800" : e.lastCalibrationResult === "advisory" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: String(e.lastCalibrationResult) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Not recorded" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalibBadge, { equip: e }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: e.status === "active" ? "default" : "secondary", className: "text-xs font-normal", children: String(e.status ?? "").replace(/_/g, " ") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", title: "View / Calibrations", onClick: () => setViewing(e), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
            setEditing(e);
            setForm(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive", onClick: () => del.mutate(e.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, String(e.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: viewing && String(viewing.name) }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [
          [
            ["Type", EQUIP_TYPES[String(viewing.type ?? "")] ?? fmt(viewing.type)],
            ["Manufacturer", fmt(viewing.manufacturer)],
            ["Model", fmt(viewing.model)],
            ["Serial Number", fmt(viewing.serialNumber)],
            ["Location", fmt(viewing.location)],
            ["Status", fmt(viewing.status)],
            ["Purchase Date", fmtDate(viewing.purchaseDate)],
            ["Calibration Interval", viewing.calibrationIntervalMonths ? `${viewing.calibrationIntervalMonths} months` : "—"],
            ["Last Calibration", fmtDate(viewing.lastCalibrationDate)],
            ["Last Result", fmt(viewing.lastCalibrationResult)],
            ["Calibrated By", fmt(viewing.calibratedBy)],
            ["Next Due", fmtDate(viewing.nextCalibrationDue)]
          ].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: l }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: String(v) })
          ] }, String(l))),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: fmt(viewing.notes) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: "Calibration History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
              setCalForm({ calibrationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
              setCalOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
              "Log Calibration"
            ] })
          ] }),
          calibrations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "No calibrations logged yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: calibrations.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                fmtDate(c.calibrationDate),
                c.calibratedBy ? ` · ${String(c.calibratedBy)}` : ""
              ] }),
              c.certificateRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                "Cert ref: ",
                String(c.certificateRef)
              ] }),
              c.nextDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                "Next due: ",
                fmtDate(c.nextDueDate)
              ] }),
              c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: String(c.notes) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs font-normal ${c.result === "pass" ? "bg-green-100 text-green-800" : c.result === "advisory" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: String(c.result) })
          ] }, String(c.id))) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: calOpen, onOpenChange: (o) => {
      setCalOpen(o);
      if (!o) saveCal.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Log Calibration / Inspection",
        viewing ? ` — ${String(viewing.name)}` : ""
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Calibration Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: calForm.calibrationDate ?? "", onChange: (e) => {
          const d = e.target.value;
          setCalForm((f) => {
            const interval = viewing?.calibrationIntervalMonths ? parseInt(String(viewing.calibrationIntervalMonths)) : null;
            let nextDue = f.nextDueDate;
            if (d && interval) {
              const nd = /* @__PURE__ */ new Date(d + "T00:00:00");
              nd.setMonth(nd.getMonth() + interval);
              nextDue = nd.toISOString().slice(0, 10);
            }
            return { ...f, calibrationDate: d, nextDueDate: nextDue ?? "" };
          });
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Result *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: calForm.result ?? "", onValueChange: (v) => setCalForm((f) => ({ ...f, result: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "advisory", children: "Advisory (minor adjustment needed)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail (take out of service)" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Contractor / Supplier", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: calForm.calibratedBySupplierId ?? null, valueName: String(calForm.calibratedBy ?? ""), onChange: (id, name) => setCalForm((f) => ({ ...f, calibratedBySupplierId: id, calibratedBy: name })) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Certificate / Reference No.", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: calForm.certificateRef ?? "", onChange: (e) => setCalForm((f) => ({ ...f, certificateRef: e.target.value })) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Next Due Date", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: calForm.nextDueDate ?? "", onChange: (e) => setCalForm((f) => ({ ...f, nextDueDate: e.target.value })) }),
          viewing?.calibrationIntervalMonths && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Auto-calculated from ",
            String(viewing.calibrationIntervalMonths),
            "-month interval — adjust if needed"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: calForm.notes ?? "", onChange: (e) => setCalForm((f) => ({ ...f, notes: e.target.value })), rows: 2 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveCal, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveCal.mutate(calForm), disabled: saveCal.isPending || !calForm.result || !calForm.calibrationDate, children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setEditing(null);
        setForm({});
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Register",
        " Weighing Equipment"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Equipment Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name ?? "", onChange: (e) => sf("name", e.target.value), placeholder: "e.g. Main Yard Crush Scale" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Type *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.type ?? "", onValueChange: (v) => sf("type", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(EQUIP_TYPES).map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: l }, v)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => sf("status", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "out_of_service", children: "Out of Service" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "decommissioned", children: "Decommissioned" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Manufacturer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.manufacturer ?? "", onChange: (e) => sf("manufacturer", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Model", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.model ?? "", onChange: (e) => sf("model", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Serial Number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber ?? "", onChange: (e) => sf("serialNumber", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Location", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.location ?? "", onChange: (e) => sf("location", e.target.value), placeholder: "e.g. Main yard, Loading bay" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Purchase Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.purchaseDate ?? "", onChange: (e) => sf("purchaseDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Calibration Interval (months)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.calibrationIntervalMonths ?? "12", onChange: (e) => sf("calibrationIntervalMonths", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
          setForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.name || !form.type, children: editing ? "Save Changes" : "Register" })
      ] })
    ] }) })
  ] });
}
function ShearingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-shearing", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-shearing-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/sheep-shearing-records/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-shearing-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-shearing-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.shearingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.shearingDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printShearingRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.shearingDate)}</td><td>${fmt(r.shearerName)}</td><td>${r.isContractor ? "Contractor" : "Own staff"}</td><td>${fmt(r.numberOfSheepSheared)}</td><td>${fmtNum(r.woolWeightKg)}</td><td>${fmt(r.woolGrade)}</td><td>${fmt(r.britishWoolBoardRef)}</td><td>${gbp(r.woolSaleValue)}</td><td>${r.ectoparasiteTreatmentApplied ? "Yes" : "No"}</td><td>${fmt(r.treatmentProductName)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Shearing Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Shearing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Shearer</th><th>Contractor?</th><th>Head Sheared</th><th>Wool (kg)</th><th>Grade</th><th>BWB Ref</th><th>Sale Value</th><th>Ectoparasite Tx</th><th>Treatment Product</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: shearing records including any ectoparasite treatment applied must be maintained and available at audit. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Shearing Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printShearingRecords, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ isContractor: "false", ectoparasiteTreatmentApplied: "false" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "shearingDate", label: "Date", render: (r) => fmtDate(r.shearingDate) },
          { key: "shearerName", label: "Shearer" },
          { key: "numberOfSheepSheared", label: "Head" },
          { key: "woolWeightKg", label: "Wool (kg)", render: (r) => fmtNum(r.woolWeightKg) },
          { key: "woolGrade", label: "Grade" },
          { key: "woolSaleValue", label: "Sale Value", render: (r) => gbp(r.woolSaleValue) },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-shearing-records", recordId: r.id, farmId, compact: true }) : null }
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Shearing Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Date", fmtDate(viewing.shearingDate)], ["Shearer", fmt(viewing.shearerName)], ["Contractor", viewing.isContractor ? "Yes" : "No"], ["Head Sheared", fmt(viewing.numberOfSheepSheared)], ["Wool Weight (kg)", fmtNum(viewing.woolWeightKg)], ["Wool Grade", fmt(viewing.woolGrade)], ["British Wool Board Ref", fmt(viewing.britishWoolBoardRef)], ["Sale Value", gbp(viewing.woolSaleValue)], ["Ectoparasite Treatment", viewing.ectoparasiteTreatmentApplied ? "Yes" : "No"], ["Treatment Product", fmt(viewing.treatmentProductName)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              l,
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
          ] }, String(l))),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-shearing-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Shearing Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Shearing Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.shearingDate ?? "", onChange: (e) => sf("shearingDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Shearer Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.shearerName ?? "", onChange: (e) => sf("shearerName", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Head Sheared", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberOfSheepSheared ?? "", onChange: (e) => sf("numberOfSheepSheared", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Wool Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.woolWeightKg ?? "", onChange: (e) => sf("woolWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Wool Grade", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.woolGrade ?? "", onValueChange: (v) => sf("woolGrade", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Fine (Merino)", "Medium (DKDF)", "Coarse (Herdwick/Swaledale)", "Double Knit (DK)", "Kemp", "Locks", "Broken/Tender", "Crutchings/Bellies", "Dags", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "British Wool Board Ref", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.britishWoolBoardRef ?? "", onChange: (e) => sf("britishWoolBoardRef", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sale Value (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.woolSaleValue ?? "", onChange: (e) => sf("woolSaleValue", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Treatment Product", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProductName ?? "", onChange: (e) => sf("treatmentProductName", e.target.value), placeholder: "If ectoparasite treatment applied" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isContractor === "true", onCheckedChange: (v) => sf("isContractor", v ? "true" : "false"), id: "contr" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "contr", children: "Contractor shearer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.ectoparasiteTreatmentApplied === "true", onCheckedChange: (v) => sf("ectoparasiteTreatmentApplied", v ? "true" : "false"), id: "ecto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ecto", children: "Ectoparasite treatment applied" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
function HealthTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [subTab, setSubTab] = reactExports.useState("vaccinations");
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [vaccYearFilter, setVaccYearFilter] = reactExports.useState("all");
  const [diseaseYearFilter, setDiseaseYearFilter] = reactExports.useState("all");
  const { data: vaccRows = [], isLoading: vLoading } = useQuery({ queryKey: ["sheep-vacc", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-vaccination-programmes`), { credentials: "include" }).then((r) => r.json()) });
  const { data: diseaseRows = [], isLoading: dLoading } = useQuery({ queryKey: ["sheep-disease", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-disease-monitoring`), { credentials: "include" }).then((r) => r.json()) });
  const saveVacc = useMutation({ mutationFn: (body) => {
    const url = editing ? apiUrl(`farms/${farmId}/sheep-vaccination-programmes/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-vaccination-programmes`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const saveDisease = useMutation({ mutationFn: (body) => {
    const url = editing ? apiUrl(`farms/${farmId}/sheep-disease-monitoring/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-disease-monitoring`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] });
    qc.invalidateQueries({ queryKey: ["notifications", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delVacc = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-vaccination-programmes/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const delDisease = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const vaccYears = reactExports.useMemo(() => Array.from(new Set(vaccRows.map((r) => String(r.vaccinationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [vaccRows]);
  const filteredVacc = reactExports.useMemo(() => vaccYearFilter === "all" ? vaccRows : vaccRows.filter((r) => String(r.vaccinationDate ?? "").startsWith(vaccYearFilter)), [vaccRows, vaccYearFilter]);
  const diseaseYears = reactExports.useMemo(() => Array.from(new Set(diseaseRows.map((r) => String(r.observationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [diseaseRows]);
  const filteredDisease = reactExports.useMemo(() => diseaseYearFilter === "all" ? diseaseRows : diseaseRows.filter((r) => String(r.observationDate ?? "").startsWith(diseaseYearFilter)), [diseaseRows, diseaseYearFilter]);
  function printVaccRecords() {
    const tableRows = filteredVacc.map((r) => `<tr><td>${fmtDate(r.vaccinationDate)}</td><td>${fmt(r.programmeName)}</td><td>${fmt(r.vaccineProduct)}</td><td>${fmt(r.diseaseTargeted)}</td><td>${fmt(r.numberOfAnimalsVaccinated)}</td><td>${fmt(r.administeredBy)}</td><td>${fmtDate(r.boosterDueDate)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Vaccination Programmes</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Vaccination Programmes${vaccYearFilter !== "all" ? ` — ${vaccYearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filteredVacc.length} record${filteredVacc.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Programme</th><th>Vaccine</th><th>Disease</th><th>Animals</th><th>Administered By</th><th>Booster Due</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: vaccination records must be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  function printDiseaseRecords() {
    const tableRows = filteredDisease.map((r) => `<tr><td>${fmtDate(r.observationDate)}</td><td>${fmt(r.condition)}</td><td>${fmt(r.numberOfAnimalsAffected)}</td><td>${fmt(r.severity)}</td><td>${fmt(r.actionTaken)}</td><td>${fmt(r.outcome)}</td><td>${r.reportableDisease ? "Yes" : "No"}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Disease Monitoring</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Disease Monitoring Records${diseaseYearFilter !== "all" ? ` — ${diseaseYearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filteredDisease.length} record${filteredDisease.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Condition</th><th>Animals</th><th>Severity</th><th>Action</th><th>Outcome</th><th>Reportable</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: disease monitoring records must be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 border-b pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: subTab === "vaccinations" ? "default" : "ghost", onClick: () => setSubTab("vaccinations"), children: "Vaccination Programmes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: subTab === "disease" ? "default" : "ghost", onClick: () => setSubTab("disease"), children: "Disease Monitoring" })
    ] }),
    subTab === "vaccinations" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Vaccination Programmes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vaccYearFilter, onValueChange: setVaccYearFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              vaccYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          filteredVacc.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printVaccRecords, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
            "Print"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditing(null);
            setForm({ vetPrescribed: "false" });
            setOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add"
          ] })
        ] })
      ] }),
      vLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          cols: [
            { key: "vaccinationDate", label: "Date", render: (r) => fmtDate(r.vaccinationDate) },
            { key: "programmeName", label: "Programme" },
            { key: "vaccineProduct", label: "Vaccine" },
            { key: "diseaseTargeted", label: "Disease" },
            { key: "numberOfAnimalsVaccinated", label: "Animals" },
            { key: "boosterDueDate", label: "Booster Due", render: (r) => fmtDate(r.boosterDueDate) },
            { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-vaccination-programmes", recordId: r.id, farmId, compact: true }) : null }
          ],
          rows: filteredVacc,
          onView: setViewing,
          onEdit: (r) => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setOpen(true);
          },
          onDelete: (r) => delVacc.mutate(r.id)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
        if (!o) setViewing(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Vaccination Programme" }) }),
        viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            [["Date", fmtDate(viewing.vaccinationDate)], ["Programme", fmt(viewing.programmeName)], ["Vaccine", fmt(viewing.vaccineProduct)], ["Disease Targeted", fmt(viewing.diseaseTargeted)], ["Route", fmt(viewing.administrationRoute)], ["Dose (ml)", fmt(viewing.doseMl)], ["Animals Vaccinated", fmt(viewing.numberOfAnimalsVaccinated)], ["Batch No.", fmt(viewing.batchNumber)], ["Expiry", fmtDate(viewing.expiryDate)], ["Booster Due", fmtDate(viewing.boosterDueDate)], ["Administered By", fmt(viewing.administeredBy)], ["Vet Prescribed", viewing.vetPrescribed ? "Yes" : "No"], ["Withdrawal Period", fmt(viewing.withdrawalPeriodDays) + " days"]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                l,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
            ] }, String(l))),
            viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
              " ",
              fmt(viewing.notes)
            ] })
          ] }),
          viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-vaccination-programmes", recordId: viewing.id, farmId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) saveVacc.reset();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Vaccination"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Programme Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.programmeName ?? "", onChange: (e) => sf("programmeName", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vaccine Product *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.vaccineProduct ?? "", onValueChange: (v) => sf("vaccineProduct", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vaccine..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Heptavac P Plus", "Covexin 8", "Ovivac P", "Ovivac P Plus", "Scabivax Forte", "Footvax", "Toxovax", "Ovilis Enzovax", "Ovilis Fluvac", "Mevac T", "Lambivac", "Bravoxin 10", "Tasvax 8", "Gudair (Ovilis Gudair)", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Disease Targeted", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.diseaseTargeted ?? "", onValueChange: (v) => sf("diseaseTargeted", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Clostridial disease", "Pasteurellosis", "Enzootic abortion (EAE)", "Toxoplasmosis", "OPA", "Footrot", "Louping ill", "Caseous lymphadenitis", "Orf", "Maedi Visna", "Johne's Disease (Paratuberculosis)", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vaccination Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.vaccinationDate ?? "", onChange: (e) => sf("vaccinationDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Booster Due Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.boosterDueDate ?? "", onChange: (e) => sf("boosterDueDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animals Vaccinated", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberOfAnimalsVaccinated ?? "", onChange: (e) => sf("numberOfAnimalsVaccinated", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dose (ml)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.doseMl ?? "", onChange: (e) => sf("doseMl", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Admin Route", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.administrationRoute ?? "", onValueChange: (v) => sf("administrationRoute", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["SC (subcutaneous)", "IM (intramuscular)", "IV (intravenous)", "Oral", "Intranasal", "Topical"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch Number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber ?? "", onChange: (e) => sf("batchNumber", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expiry Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate ?? "", onChange: (e) => sf("expiryDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administered By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.administeredBy ?? "", onChange: (e) => sf("administeredBy", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Withdrawal Period (days)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.withdrawalPeriodDays ?? "", onChange: (e) => sf("withdrawalPeriodDays", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.vetPrescribed === "true", onCheckedChange: (v) => sf("vetPrescribed", v ? "true" : "false"), id: "vp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vp", children: "Vet prescribed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveVacc, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveVacc.mutate({ ...form }), disabled: saveVacc.isPending, children: editing ? "Save" : "Add" })
        ] })
      ] }) })
    ] }),
    subTab === "disease" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Disease & Condition Monitoring" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: diseaseYearFilter, onValueChange: setDiseaseYearFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
              diseaseYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          filteredDisease.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printDiseaseRecords, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
            "Print"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setEditing(null);
            setForm({ vetConsulted: "false", reportableDisease: "false", ahrbiNotified: "false" });
            setOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add"
          ] })
        ] })
      ] }),
      dLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataTable,
        {
          cols: [
            { key: "observationDate", label: "Date", render: (r) => fmtDate(r.observationDate) },
            { key: "condition", label: "Condition" },
            { key: "numberOfAnimalsAffected", label: "Animals" },
            { key: "severity", label: "Severity", render: (r) => {
              const s = String(r.severity ?? "");
              return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: s === "severe" ? "destructive" : s === "moderate" ? "outline" : "secondary", children: s || "—" });
            } },
            { key: "outcome", label: "Outcome" },
            { key: "reportableDisease", label: "Reportable", render: (r) => r.reportableDisease ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "No" }) },
            { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-disease-monitoring", recordId: r.id, farmId, compact: true }) : null }
          ],
          rows: filteredDisease,
          onView: setViewing,
          onEdit: (r) => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setOpen(true);
          },
          onDelete: (r) => delDisease.mutate(r.id)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
        if (!o) setViewing(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Disease Monitoring Record" }) }),
        viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            [["Date", fmtDate(viewing.observationDate)], ["Condition", fmt(viewing.condition)], ["Animals Affected", fmt(viewing.numberOfAnimalsAffected)], ["Severity", fmt(viewing.severity)], ["Action Taken", fmt(viewing.actionTaken)], ["Vet Consulted", viewing.vetConsulted ? "Yes" : "No"], ["Vet Name", fmt(viewing.vetName)], ["Treatment Product", fmt(viewing.treatmentProduct)], ["Outcome", fmt(viewing.outcome)], ["Reportable Disease", viewing.reportableDisease ? "Yes" : "No"], ["AHRBI Notified", viewing.ahrbiNotified ? "Yes" : "No"]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                l,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
            ] }, String(l))),
            viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
              " ",
              fmt(viewing.notes)
            ] })
          ] }),
          viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-disease-monitoring", recordId: viewing.id, farmId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }),
          viewing?.reportableDisease && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-700 border-red-200 hover:bg-red-50", onClick: () => {
            setRaiseTaskFor(viewing);
            setViewing(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
            "Raise APHA Task"
          ] })
        ] })
      ] }) }),
      raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
        RaiseTaskDialog,
        {
          farmId,
          open: !!raiseTaskFor,
          onClose: () => setRaiseTaskFor(null),
          defaultTitle: `Notifiable Disease — APHA Notification — ${raiseTaskFor.condition ?? "Suspected case"}`,
          defaultDescription: `Observation: ${fmtDate(raiseTaskFor.observationDate)} · Animals affected: ${raiseTaskFor.numberOfAnimalsAffected ?? "—"} · Severity: ${raiseTaskFor.severity ?? "—"}. Contact APHA immediately on 03000 200 301 (24 hr). Do not move animals until an APHA vet authorises movement. Failure to report is a criminal offence under the Animal Health Act 1981.`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (!o) saveDisease.reset();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Disease Record"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Observation Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.observationDate ?? "", onChange: (e) => sf("observationDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Condition / Disease *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.condition ?? "", onValueChange: (v) => sf("condition", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Footrot", "Foot abscess", "Flystrike (myiasis)", "OPA (ovine pulmonary adenocarcinoma)", "Maedi Visna", "Caseous lymphadenitis", "Scrapie", "Clostridial disease", "Toxoplasmosis", "Enzootic abortion (EAE)", "Mastitis", "Pneumonia", "Orf", "Lamb dysentery", "Pulpy kidney", "Black disease", "Redwater (babesiosis)", "Listeriosis", "Louping ill", "Border disease", "Twin lamb disease", "Hypocalcaemia", "Hypomagnesaemia", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animals Affected", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberOfAnimalsAffected ?? "", onChange: (e) => sf("numberOfAnimalsAffected", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Severity", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.severity ?? "", onValueChange: (v) => sf("severity", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["mild", "moderate", "severe"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Action Taken", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionTaken ?? "", onChange: (e) => sf("actionTaken", e.target.value) }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Treatment Product", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct ?? "", onChange: (e) => sf("treatmentProduct", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vet Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: (e) => sf("vetName", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Outcome", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome ?? "", onValueChange: (v) => sf("outcome", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Recovered – no treatment", "Recovered – treated", "Ongoing treatment", "Culled", "Died", "Referred to vet", "Notified to APHA", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex gap-4 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.vetConsulted === "true", onCheckedChange: (v) => sf("vetConsulted", v ? "true" : "false"), id: "vc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc", children: "Vet consulted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.reportableDisease === "true", onCheckedChange: (v) => sf("reportableDisease", v ? "true" : "false"), id: "rd" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rd", children: "Reportable disease" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.ahrbiNotified === "true", onCheckedChange: (v) => sf("ahrbiNotified", v ? "true" : "false"), id: "ahrb" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ahrb", children: "AHRBI notified" })
            ] })
          ] }),
          form.reportableDisease === "true" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
              "Notifiable disease — statutory reporting obligation"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "You must notify APHA ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "immediately" }),
                ". Failure to report is a criminal offence under the Animal Health Act 1981."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Do not move animals on or off the holding until authorised by an APHA vet." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                "APHA report line: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "03000 200 301" }),
                " (England) — 24 hours, 7 days."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveDisease, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveDisease.mutate({ ...form }), disabled: saveDisease.isPending, children: editing ? "Save" : "Add" })
        ] })
      ] }) })
    ] })
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
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-rt", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-rt-checklists`), { credentials: "include" }).then((r) => r.json()) });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const save = useMutation({ mutationFn: (body) => {
    const url = editing ? apiUrl(`farms/${farmId}/sheep-rt-checklists/${editing.id}`) : apiUrl(`farms/${farmId}/sheep-rt-checklists`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sheep-rt-checklists/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const boolFields = ["flockRegisterUpToDate", "medicineRecordsComplete", "movementRecordsComplete", "feedRecordsComplete", "mbmFreeStatus", "assuranceMembershipCurrent", "vetHealthPlanOnFile", "staffTrainingCurrent", "welfareOutcomesRecorded"];
  const boolLabels = { flockRegisterUpToDate: "Flock register up to date", medicineRecordsComplete: "Medicine records complete", movementRecordsComplete: "Movement records complete", feedRecordsComplete: "Feed records complete", mbmFreeStatus: "MBM-free status confirmed", assuranceMembershipCurrent: "Assurance membership current", vetHealthPlanOnFile: "Vet health plan on file", staffTrainingCurrent: "Staff training current", welfareOutcomesRecorded: "Welfare outcomes recorded" };
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.checkDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.checkDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printRtChecklists() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.checkDate)}</td><td>${fmt(r.checkedBy)}</td><td>${fmt(r.overallStatus)}</td><td>${boolFields.filter((k) => r[k]).map((k) => boolLabels[k]).join("; ") || "—"}</td><td>${fmt(r.notes)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>RT Sheep Checklists</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Red Tractor Sheep Checklists${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Status</th><th>Compliant Items</th><th>Notes</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: checklist records must be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Red Tractor Sheep Checklists" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
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
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-rt-checklists", recordId: r.id, farmId, compact: true }) : null }
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "RT Sheep Checklist" }) }),
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
          boolFields.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              boolLabels[k],
              ":"
            ] }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: viewing[k] ? "Yes" : "No" })
          ] }, k)),
          viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
            " ",
            fmt(viewing.notes)
          ] })
        ] }),
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-rt-checklists", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "New",
        " RT Sheep Checklist"
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form }), disabled: save.isPending, children: editing ? "Save" : "Add" })
      ] })
    ] }) })
  ] });
}
const SHEEP_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function SheepAnalyticsTab({ farmId }) {
  const { data: scanning = [] } = useQuery({ queryKey: ["sheep-scanning", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-scanning-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: weigh = [] } = useQuery({ queryKey: ["sheep-weigh", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-weigh-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: shearing = [] } = useQuery({ queryKey: ["sheep-shearing", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-shearing-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: tupping = [] } = useQuery({ queryKey: ["sheep-tupping", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then((r) => r.json()) });
  const totalScanned = reactExports.useMemo(() => scanning.reduce((s, r) => s + (Number(r.ewesScanned) || 0), 0), [scanning]);
  const totalInLamb = reactExports.useMemo(() => scanning.reduce((s, r) => s + (Number(r.ewesInLamb) || 0), 0), [scanning]);
  const scanPct = totalScanned > 0 ? (totalInLamb / totalScanned * 100).toFixed(1) : null;
  const litterData = reactExports.useMemo(() => [
    { name: "Singles", value: scanning.reduce((s, r) => s + (Number(r.singles) || 0), 0) },
    { name: "Twins", value: scanning.reduce((s, r) => s + (Number(r.twins) || 0), 0) },
    { name: "Triplets", value: scanning.reduce((s, r) => s + (Number(r.triplets) || 0), 0) },
    { name: "Quads+", value: scanning.reduce((s, r) => s + (Number(r.quads) || 0), 0) }
  ].filter((d) => d.value > 0), [scanning]);
  const dlwgData = reactExports.useMemo(() => weigh.filter((r) => r.dlwgGPerDay).slice(-10).map((r) => ({
    name: String(r.batchRef || r.animalCategory || "Batch").slice(0, 12),
    dlwg: Math.round(Number(r.dlwgGPerDay))
  })), [weigh]);
  const shearData = reactExports.useMemo(() => {
    const byYear = {};
    shearing.forEach((r) => {
      const yr = r.shearingDate ? String(r.shearingDate).slice(0, 4) : "Unknown";
      if (!byYear[yr]) byYear[yr] = { wool: 0, head: 0, value: 0 };
      byYear[yr].wool += Number(r.woolWeightKg) || 0;
      byYear[yr].head += Number(r.headSheared) || 0;
      byYear[yr].value += Number(r.saleValue) || 0;
    });
    return Object.entries(byYear).sort().map(([yr, d]) => ({ year: yr, wool: +d.wool.toFixed(1), head: d.head, value: +d.value.toFixed(2) }));
  }, [shearing]);
  const avgDlwg = reactExports.useMemo(() => {
    const valid = weigh.filter((r) => r.dlwgGPerDay);
    return valid.length ? Math.round(valid.reduce((s, r) => s + Number(r.dlwgGPerDay), 0) / valid.length) : null;
  }, [weigh]);
  const noData = scanning.length === 0 && weigh.length === 0 && shearing.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add scanning, weigh-in, or shearing records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Scanning Records", value: scanning.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Overall Scanning %", value: scanPct ? `${scanPct}%` : "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Avg DLWG (g/day)", value: avgDlwg ?? "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Shearing Records", value: shearing.length, bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      litterData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Litter Type Distribution (all scans)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: litterData, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: litterData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: SHEEP_COLORS[i % SHEEP_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} ewes`, ""] })
        ] }) }) })
      ] }),
      dlwgData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "DLWG by Batch (g/day)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: dlwgData, layout: "vertical", margin: { left: 4, right: 24, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 70 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} g/day`, "DLWG"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "dlwg", fill: "#15803d", radius: [0, 3, 3, 0] })
        ] }) }) })
      ] })
    ] }),
    shearData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Wool Yield & Head Sheared by Year" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: shearData, margin: { left: 0, right: 24, top: 4, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "year", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, unit: "kg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, unit: "hd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "wool", name: "Wool (kg)", fill: "#15803d", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "right", dataKey: "head", name: "Head Sheared", fill: "#a16207", radius: [3, 3, 0, 0] })
      ] }) }) })
    ] }),
    tupping.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "Tupping Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: tupping.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tupping Cycles" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: tupping.reduce((s, r) => s + (Number(r.ewesExposed) || 0), 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Ewes Exposed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: [...new Set(tupping.map((r) => r.ramBreed).filter(Boolean))].length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ram Breeds Used" })
        ] })
      ] })
    ] })
  ] });
}
const SHEEP_TAB_IDS = ["flocks", "tupping", "scanning", "weigh", "shearing", "health", "rt-checklist", "analytics", "weighing-equipment", "enterprise"];
function SheepProductionPage() {
  const farmId = useAppStore((s) => s.farmId);
  const [tab, setTab] = usePersistedTab({ page: "sheep-production", farmId, validIds: SHEEP_TAB_IDS, defaultTab: "tupping" });
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground", children: "Select a farm to view sheep production records." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-6xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-6 h-6 text-green-700" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Sheep Production" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Flock management, tupping, scanning, performance, shearing, health plans and Red Tractor compliance" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "flocks", onClick: () => setTab("flocks"), children: "Flocks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tupping", onClick: () => setTab("tupping"), children: "Tupping" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scanning", onClick: () => setTab("scanning"), children: "Scanning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "weigh", onClick: () => setTab("weigh"), children: "Weigh-in & Performance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "shearing", onClick: () => setTab("shearing"), children: "Shearing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "health", onClick: () => setTab("health"), children: "Health Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "rt-checklist", onClick: () => setTab("rt-checklist"), children: "RT Checklist" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "weighing-equipment", onClick: () => setTab("weighing-equipment"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Equipment"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Analytics"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Enterprise Report"
      ] })
    ] }),
    tab === "flocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(FlocksTab, { farmId }),
    tab === "tupping" && /* @__PURE__ */ jsxRuntimeExports.jsx(TuppingTab, { farmId }),
    tab === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScanningTab, { farmId }),
    tab === "weigh" && /* @__PURE__ */ jsxRuntimeExports.jsx(WeighTab, { farmId }),
    tab === "shearing" && /* @__PURE__ */ jsxRuntimeExports.jsx(ShearingTab, { farmId }),
    tab === "health" && /* @__PURE__ */ jsxRuntimeExports.jsx(HealthTab, { farmId }),
    tab === "rt-checklist" && /* @__PURE__ */ jsxRuntimeExports.jsx(RTChecklistTab, { farmId }),
    tab === "weighing-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(WeighingEquipmentTab, { farmId }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(SheepAnalyticsTab, { farmId }),
    tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(SheepEnterpriseReport, { farmId })
  ] }) });
}
export {
  SheepProductionPage as default
};
