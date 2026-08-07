import { r as reactExports, m as useQuery, j as jsxRuntimeExports, b as useAppStore, e as LoaderCircle, c as useQueryClient, a as useToast, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, I as Input, C as Checkbox, L as Label, N as DialogMutationError } from "./index-BXFbAQnW.js";
import { R as RecordAttachments } from "./RecordAttachments-CMNlrBRF.js";
import { o as openPrintWindow } from "./print-report-B_FwCCVJ.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-Dq0SSlpU.js";
import { T as TrendingUp, A as AppLayout, f as Scale, e as ChartColumn, c as ClipboardList } from "./AppLayout-CsDI7U2t.js";
import { T as Textarea } from "./textarea-CIlvlSlD.js";
import { B as Badge } from "./badge-C9uJbh2q.js";
import { C as ConfirmDialog } from "./confirm-dialog-mRFIn3i9.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BvZCLodq.js";
import { T as TabBar, a as TabButton } from "./tab-button-C0cHG09R.js";
import { P as Printer } from "./printer-AltBw5bN.js";
import { T as TrendingDown } from "./trending-down-DweQpXm3.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar, C as Cell } from "./generateCategoricalChart-CDmTc88O.js";
import { C as ComposedChart } from "./ComposedChart-DOnzjbqt.js";
import { C as CartesianGrid } from "./CartesianGrid-2d4ngDHe.js";
import { L as Line } from "./Line-Cmc5dNfP.js";
import { C as ChevronUp } from "./chevron-up-Blf5cywo.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-GeHC-Y87.js";
import { u as usePersistedTab } from "./use-persisted-tab-CE4Vlih7.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { T as TriangleAlert } from "./triangle-alert-BInhS0ef.js";
import { P as PieChart, a as Pie } from "./PieChart-DtS5WCzO.js";
import { B as BarChart } from "./BarChart-Bb83DTKX.js";
import { E as Eye } from "./eye-KaYVeVeq.js";
import { P as Pencil } from "./pencil-JV5r3xg2.js";
import "./use-upload-DQJC1Wk-.js";
import "./paperclip-CceR5J9T.js";
import "./upload-o_7Pdqnf.js";
import "./image-Czohp682.js";
import "./shield-alert-BZYJY6-A.js";
import "./download-C-JQYk3h.js";
import "./use-safe-clerk-DuEA6k2d.js";
import "./database-DA9CnzY5.js";
import "./shield-check-hVR3AiSO.js";
import "./tractor-C9_502BR.js";
import "./index-Qp0DXGHs.js";
import "./index-R56mWsJ2.js";
const PRINT_ID = "goat-enterprise-report-print";
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
      typeof p.value === "number" ? fmtGBP(Math.abs(p.value)) : p.value
    ] }, p.name))
  ] });
};
function GoatEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data, isLoading } = useQuery({
    queryKey: ["goat-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/goat-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.totalHeadSold > 0 || d.totalFeedCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = reactExports.useMemo(() => {
    if (!d) return [];
    const map = {};
    d.cullRecords.forEach((r) => {
      const m = r.cullDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0 };
      map[m].revenue += Math.round((parseFloat(r.totalValueGbp ?? "0") || 0) * 100);
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Sale Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Gross Margin": v.revenue - v.feedCost
    }));
  }, [d]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Goat Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Sale revenue · Price per head · Gross margin by destination" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            className: "h-9 rounded-lg border border-border bg-background px-3 text-sm",
            value: year,
            onChange: (e) => setYear(parseInt(e.target.value)),
            children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              ensurePrintStyle();
              window.print();
            },
            className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
              "Print"
            ]
          }
        )
      ] })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No cull/market records found for ",
      year,
      ". Record goat sales in the Cull / Market tab."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Head Sold" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: d.totalHeadSold.toLocaleString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.cullRecords.length,
            " sale",
            d.cullRecords.length !== 1 ? "s" : "",
            " recorded"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Sale Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-700", children: fmtGBP(d.totalRevenuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: d.avgPricePerHeadPence != null ? `avg ${fmtGBP(d.avgPricePerHeadPence)}/head` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Variable Costs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: fmtGBP(d.totalVariableCostPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.totalFeedCostPence > 0 && `Feed ${fmtGBP(d.totalFeedCostPence)}`,
            d.totalVetCostPence > 0 && ` · Vet ${fmtGBP(d.totalVetCostPence)}`,
            d.totalVariableCostPence === 0 && "Add via Financial"
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Monthly Sale Revenue — ",
          year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Sale Revenue", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 36 }),
          d.totalFeedCostPence > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 36 }),
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Per Head" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: `Sale revenue (${d.totalHeadSold} head, ${d.cullRecords.length} lots)`, value: d.totalRevenuePence, positive: true },
            ...d.totalFeedCostPence > 0 ? [{ label: "Feed cost", value: -d.totalFeedCostPence }] : [],
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine", value: -d.totalVetCostPence }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: d.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d.totalHeadSold) : "—" })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed costs from priced deliveries tagged to goats. Bedding, haulage, vet, and fixed costs should be added via Financial for a complete P&L." })
      ] }),
      d.byDestination.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Sales by Destination" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Destination" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Head" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Revenue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Avg/Head" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.byDestination.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 capitalize", children: row.destination.replace(/_/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.head }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-emerald-700 font-medium", children: fmtGBP(row.revenue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50", children: row.head > 0 ? fmtGBP(row.revenue / row.head) : "—" })
          ] }, i)) })
        ] })
      ] }),
      d.cullRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Collapsible,
        {
          title: `Cull / Market Records (${d.cullRecords.length} lots · ${d.totalHeadSold} head)`,
          open: openSection === "culls",
          setOpen: (v) => toggle(v ? "culls" : ""),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Head" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Destination" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Age Class" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Avg LW (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "£/Head" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Total Value" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.cullRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: new Date(r.cullDate).toLocaleDateString("en-GB") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.numberCulled }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 capitalize", children: r.destination.replace(/_/g, " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.ageClass ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.averageLiveWeightKg ? parseFloat(r.averageLiveWeightKg).toFixed(1) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.pricePerHeadGbp ? `£${parseFloat(r.pricePerHeadGbp).toFixed(2)}` : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right font-medium text-emerald-700", children: r.totalValueGbp ? `£${parseFloat(r.totalValueGbp).toFixed(2)}` : "—" })
            ] }, r.id)) })
          ] })
        }
      )
    ] })
  ] });
}
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const UK_GOAT_ABATTOIRS = [
  "ABP Ellesmere (Shropshire)",
  "ABP Shrewsbury (Shropshire)",
  "ABP Thetford (Norfolk)",
  "ABP Ferrybridge (West Yorkshire)",
  "Dunbia Llanybydder (Ceredigion)",
  "Dunbia Carmarthen (Carmarthenshire)",
  "Welsh Country Foods — Llanidloes (Powys)",
  "Celtic Pride — Llanybydder (Ceredigion)",
  "Dawn Meats UK",
  "Scotbeef — Bridge of Allan (Stirlingshire)",
  "XL Veal & Lamb — Banbury (Oxfordshire)",
  "Kepak — Bodmin (Cornwall)",
  "Glendale Meat Company — Hexham (Northumberland)",
  "Woodheads — Bradford (West Yorkshire)",
  "Dovecote Park — Pontefract (West Yorkshire)",
  "WJ Howe & Co (Lancashire)",
  "Other (not listed)"
];
const GOAT_FINISH_GRADES = [
  "E — Excellent",
  "U — Very good",
  "R — Good",
  "O — Fair",
  "P — Poor",
  "1 — Very lean",
  "2 — Lean",
  "3L — Moderate low",
  "3H — Moderate high",
  "4L — Fat low",
  "4H — Fat high",
  "5L — Very fat low",
  "5H — Very fat high",
  "E2",
  "U2",
  "U3L",
  "U3H",
  "R2",
  "R3L",
  "R3H",
  "O3H",
  "O4L",
  "O4H",
  "P4H"
];
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
const fmtNum = (v, dp = 1) => v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
const gbp = (v) => v == null || v === "" ? "—" : `£${parseFloat(String(v)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation }) {
  const [pending, setPending] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (deleteMutation?.isSuccess) setPending(null);
  }, [deleteMutation?.isSuccess]);
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!pending, title: "Delete Record", message: "Are you sure? This cannot be undone.", confirmLabel: "Delete", confirmVariant: "destructive", mutation: deleteMutation, onConfirm: () => {
      if (pending && onDelete) {
        onDelete(pending);
        if (!deleteMutation) setPending(null);
      }
    }, onCancel: () => {
      setPending(null);
      deleteMutation?.reset();
    } })
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
function HerdsTab({ farmId }) {
  const { data: herds = [], isLoading } = useQuery({
    queryKey: ["goat-herds", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-herds`), { credentials: "include" }).then((r) => r.json())
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Herds are managed in Livestock → Herds & Animals." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Records in the tabs below link to those herds. To create, edit, or archive a herd, use the Livestock module."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-sm", children: [
      "Registered Goat Herds ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-muted-foreground", children: [
        "(",
        herds.length,
        ")"
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : herds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-dashed border-gray-300 bg-gray-50 p-8 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No goat herds registered yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/livestock?tab=herds", className: "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2", children: "Go to Livestock → Herds & Animals to add your first herd" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "flockName", label: "Name" },
          { key: "breed", label: "Breed" },
          { key: "flockPurpose", label: "Type / Purpose" },
          { key: "herdFlockNumber", label: "Herd No." },
          { key: "status", label: "Status", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "active" ? "default" : "secondary", children: fmt(r.status) }) }
        ],
        rows: herds
      }
    )
  ] });
}
function MatingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-mating", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-mating-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/goat-mating-records/${editing.id}`) : apiUrl(`farms/${farmId}/goat-mating-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-mating", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-mating-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-mating", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  function openAdd() {
    setEditing(null);
    setForm({ progesteroneSpongeUsed: "false", matingMethod: "natural" });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.matingStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.matingStartDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printMatingRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.matingStartDate)}</td><td>${fmtDate(r.matingEndDate)}</td><td>${fmt(r.buckBreed)}</td><td>${fmt(r.buckEarTag)}</td><td>${fmt(r.doesExposed)}</td><td>${fmtDate(r.expectedKiddingDate)}</td><td>${fmt(r.matingMethod)}</td><td>${r.progesteroneSpongeUsed === "true" || r.progesteroneSpongeUsed === true ? "Yes" : "No"}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Mating Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Goat Mating Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Goat Production · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Start Date</th><th>End Date</th><th>Buck Breed</th><th>Buck Tag</th><th>Does Exposed</th><th>Expected Kidding</th><th>Method</th><th>CIDR/Sponge</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Mating records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Mating Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMatingRecords, children: [
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
          { key: "matingStartDate", label: "Start Date", render: (r) => fmtDate(r.matingStartDate) },
          { key: "matingEndDate", label: "End Date", render: (r) => fmtDate(r.matingEndDate) },
          { key: "buckBreed", label: "Buck Breed" },
          { key: "buckEarTag", label: "Buck Tag" },
          { key: "doesExposed", label: "Does Exposed" },
          { key: "expectedKiddingDate", label: "Expected Kidding", render: (r) => fmtDate(r.expectedKiddingDate) },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-mating-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mating Record Details" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Start Date", fmtDate(viewing.matingStartDate)], ["End Date", fmtDate(viewing.matingEndDate)], ["Buck Breed", fmt(viewing.buckBreed)], ["Buck Ear Tag", fmt(viewing.buckEarTag)], ["Buck Owner", fmt(viewing.buckOwner)], ["Buck Hired/Owned", fmt(viewing.buckHiredOrOwned)], ["Does Exposed", fmt(viewing.doesExposed)], ["Mating Method", fmt(viewing.matingMethod)], ["CIDR / Sponge Used", viewing.progesteroneSpongeUsed ? "Yes" : "No"], ["Expected Kidding Date", fmtDate(viewing.expectedKiddingDate)]].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-mating-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Mating Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Start Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.matingStartDate ?? "", onChange: (e) => sf("matingStartDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "End Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.matingEndDate ?? "", onChange: (e) => sf("matingEndDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Buck Breed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["Boer", "Kiko", "Savanna", "Spanish", "Nubian", "Anglo-Nubian", "Cashmere", "Pygmy", "Pygmy x", "Crossbred"].includes(form.buckBreed ?? "") ? form.buckBreed ?? "" : form.buckBreed ? "Other" : "", onValueChange: (v) => sf("buckBreed", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Boer", "Kiko", "Savanna", "Spanish", "Nubian", "Anglo-Nubian", "Cashmere", "Pygmy", "Pygmy x", "Crossbred", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          (form.buckBreed === "Other" || form.buckBreed && !["Boer", "Kiko", "Savanna", "Spanish", "Nubian", "Anglo-Nubian", "Cashmere", "Pygmy", "Pygmy x", "Crossbred"].includes(form.buckBreed)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.buckBreed === "Other" ? "" : form.buckBreed, onChange: (e) => sf("buckBreed", e.target.value || "Other"), placeholder: "Please specify breed…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Buck Ear Tag", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buckEarTag ?? "", onChange: (e) => sf("buckEarTag", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Buck Owner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buckOwner ?? "", onChange: (e) => sf("buckOwner", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Buck Hired or Owned", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buckHiredOrOwned ?? "", onValueChange: (v) => sf("buckHiredOrOwned", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["owned", "hired"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Does Exposed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doesExposed ?? "", onChange: (e) => sf("doesExposed", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mating Method", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.matingMethod ?? "", onValueChange: (v) => sf("matingMethod", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["natural", "AI (fresh)", "AI (frozen)", "ET"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected Kidding Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedKiddingDate ?? "", onChange: (e) => sf("expectedKiddingDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.progesteroneSpongeUsed === "true", onCheckedChange: (v) => sf("progesteroneSpongeUsed", v ? "true" : "false"), id: "sponge" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sponge", children: "CIDR / Progesterone sponge used" })
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
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-scanning", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-scanning-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/goat-scanning-records/${editing.id}`) : apiUrl(`farms/${farmId}/goat-scanning-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-scanning", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-scanning-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-scanning", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.scanDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.scanDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printScanningRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.scanDate)}</td><td>${fmt(r.scannerName)}</td><td>${fmt(r.totalDoesScanned)}</td><td>${fmt(r.doesBarren)}</td><td>${fmt(r.doesSingles)}</td><td>${fmt(r.doesDoubles)}</td><td>${fmt(r.doesTriples)}</td><td>${fmt(r.scanningPercentage)}%</td><td>${fmt(r.expectedTotalKids)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Scanning Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Goat Pregnancy Scanning Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Goat Production · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Scan Date</th><th>Scanner</th><th>Does Scanned</th><th>Barren</th><th>Singles</th><th>Doubles</th><th>Triplets</th><th>Scanning %</th><th>Expected Kids</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Pregnancy scanning records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Pregnancy Scanning Records" }),
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
          { key: "totalDoesScanned", label: "Scanned" },
          { key: "doesBarren", label: "Barren" },
          { key: "doesSingles", label: "Singles" },
          { key: "doesDoubles", label: "Doubles" },
          { key: "scanningPercentage", label: "Scanning %" },
          { key: "expectedTotalKids", label: "Expected Kids" },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-scanning-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Scanning Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Scan Date", fmtDate(viewing.scanDate)], ["Scanner", fmt(viewing.scannerName)], ["Scanner Company", fmt(viewing.scannerCompany)], ["Does Scanned", fmt(viewing.totalDoesScanned)], ["Barren", fmt(viewing.doesBarren)], ["Singles", fmt(viewing.doesSingles)], ["Doubles", fmt(viewing.doesDoubles)], ["Triplets", fmt(viewing.doesTriples)], ["Scanning %", fmt(viewing.scanningPercentage)], ["Expected Kids", fmt(viewing.expectedTotalKids)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-scanning-records", recordId: viewing.id, farmId })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scanner Company", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.scannerCompany ?? "", onChange: (e) => sf("scannerCompany", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Does Scanned *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.totalDoesScanned ?? "", onChange: (e) => sf("totalDoesScanned", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Barren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doesBarren ?? "", onChange: (e) => sf("doesBarren", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scanning %", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.scanningPercentage ?? "", onChange: (e) => sf("scanningPercentage", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Singles", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doesSingles ?? "", onChange: (e) => sf("doesSingles", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Doubles", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doesDoubles ?? "", onChange: (e) => sf("doesDoubles", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Triplets", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doesTriples ?? "", onChange: (e) => sf("doesTriples", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expected Kids Total", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.expectedTotalKids ?? "", onChange: (e) => sf("expectedTotalKids", e.target.value) }) }),
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
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-weigh", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-weigh-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/goat-weigh-records/${editing.id}`) : apiUrl(`farms/${farmId}/goat-weigh-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-weigh", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-weigh-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-weigh", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.weighDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.weighDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printWeighRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.weighDate)}</td><td>${fmt(r.ageClassWeighed)}</td><td>${fmt(r.numberWeighed)}</td><td>${fmtNum(r.averageWeightKg)}</td><td>${fmtNum(r.targetWeightKg)}</td><td>${fmtNum(r.dlwgGPerDay)}</td><td>${fmt(r.bodyConditionScore)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Weigh-in Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Goat Weigh-in &amp; Performance Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Goat Production · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>Target (kg)</th><th>DLWG (g/day)</th><th>BCS</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Weight records and BCS must be maintained to demonstrate welfare monitoring. Retain for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
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
          { key: "ageClassWeighed", label: "Category" },
          { key: "numberWeighed", label: "Count" },
          { key: "averageWeightKg", label: "Avg Wt (kg)", render: (r) => fmtNum(r.averageWeightKg) },
          { key: "dlwgGPerDay", label: "DLWG (g/day)", render: (r) => fmtNum(r.dlwgGPerDay) },
          { key: "bodyConditionScore", label: "BCS" },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-weigh-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Weigh-in Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Date", fmtDate(viewing.weighDate)], ["Weigh Type", fmt(viewing.weighType)], ["Weighed By", fmt(viewing.weighedBy)], ["Category", fmt(viewing.ageClassWeighed)], ["Animals Weighed", fmt(viewing.numberWeighed)], ["Avg Weight (kg)", fmtNum(viewing.averageWeightKg)], ["Lowest (kg)", fmtNum(viewing.lowestWeightKg)], ["Highest (kg)", fmtNum(viewing.highestWeightKg)], ["Target (kg)", fmtNum(viewing.targetWeightKg)], ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay)], ["Days Since Last", fmt(viewing.daysSincePreviousWeigh)], ["BCS", fmt(viewing.bodyConditionScore)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-weigh-records", recordId: viewing.id, farmId })
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
        defaultTitle: `Goat Weigh Review — ${raiseTaskFor.ageClassWeighed ?? "Batch"}`,
        defaultDescription: `Avg weight: ${raiseTaskFor.averageWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.bodyConditionScore ?? "—"}`,
        module: "goat"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Weigh Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weigh Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.weighDate ?? "", onChange: (e) => sf("weighDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weigh Type", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.weighType ?? "", onValueChange: (v) => sf("weighType", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["routine", "pre-sale", "pre-weaning", "post-weaning", "draft check", "BCS check"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animal Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ageClassWeighed ?? "", onValueChange: (v) => sf("ageClassWeighed", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Kids (pre-weaning)", "Kids (post-weaning)", "Young does", "Does (adult)", "Bucks", "Cull does", "Cull bucks"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Weighed By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.weighedBy ?? "", onChange: (e) => sf("weighedBy", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number Weighed *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberWeighed ?? "", onChange: (e) => sf("numberWeighed", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageWeightKg ?? "", onChange: (e) => sf("averageWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lowest (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.lowestWeightKg ?? "", onChange: (e) => sf("lowestWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Highest (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.highestWeightKg ?? "", onChange: (e) => sf("highestWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.targetWeightKg ?? "", onChange: (e) => sf("targetWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "DLWG (g/day)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: form.dlwgGPerDay ?? "", onChange: (e) => sf("dlwgGPerDay", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Days Since Last Weigh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "1", value: form.daysSincePreviousWeigh ?? "", onChange: (e) => sf("daysSincePreviousWeigh", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "BCS (1–5)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.5", min: "1", max: "5", value: form.bodyConditionScore ?? "", onChange: (e) => sf("bodyConditionScore", e.target.value) }) }),
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
function CullTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-cull", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-cull-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? apiUrl(`farms/${farmId}/goat-cull-records/${editing.id}`) : apiUrl(`farms/${farmId}/goat-cull-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-cull", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-cull-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-cull", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const years = reactExports.useMemo(() => Array.from(new Set(rows.map((r) => String(r.cullDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = reactExports.useMemo(() => yearFilter === "all" ? rows : rows.filter((r) => String(r.cullDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  function printCullRecords() {
    const tableRows = filtered.map((r) => `<tr><td>${fmtDate(r.cullDate)}</td><td>${fmt(r.ageClass)}</td><td>${fmt(r.numberCulled)}</td><td>${fmt(r.reasonForCulling)}</td><td>${fmt(r.destination)}</td><td>${fmtNum(r.averageLiveWeightKg)}</td><td>${fmtNum(r.averageDeadweightKg)}</td><td>${fmt(r.finishGrade)}</td><td>${gbp(r.totalValueGbp)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Cull / Market Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Goat Cull / Draft / Market Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Goat Production · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Category</th><th>Number</th><th>Reason</th><th>Destination</th><th>Live Wt (kg)</th><th>DW (kg)</th><th>Grade</th><th>Total Value</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Cull, draft and market records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  const totalValue = filtered.reduce((sum, r) => sum + (parseFloat(String(r.totalValueGbp)) || 0), 0);
  const totalHead = filtered.reduce((sum, r) => sum + (parseInt(String(r.numberCulled)) || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [["Total Batches", filtered.length], ["Total Head", totalHead], ["Total Value", `£${totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: String(v) })
    ] }, String(l))) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Cull / Draft / Market Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printCullRecords, children: [
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
          { key: "cullDate", label: "Date", render: (r) => fmtDate(r.cullDate) },
          { key: "ageClass", label: "Category" },
          { key: "numberCulled", label: "Head" },
          { key: "reasonForCulling", label: "Reason" },
          { key: "destination", label: "Destination" },
          { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)", render: (r) => fmtNum(r.averageLiveWeightKg) },
          { key: "totalValueGbp", label: "Total Value", render: (r) => gbp(r.totalValueGbp) },
          { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-cull-records", recordId: r.id, farmId, compact: true }) : null }
        ],
        rows: filtered,
        onView: setViewing,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Cull / Market Record" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          [["Date", fmtDate(viewing.cullDate)], ["Category", fmt(viewing.ageClass)], ["Number", fmt(viewing.numberCulled)], ["Reason", fmt(viewing.reasonForCulling)], ["Destination", fmt(viewing.destination)], ["Destination CPH", fmt(viewing.destinationCph)], ["Abattoir", fmt(viewing.abattoirName)], ["Avg Live Wt (kg)", fmtNum(viewing.averageLiveWeightKg)], ["Avg Deadweight (kg)", fmtNum(viewing.averageDeadweightKg)], ["Killout %", fmtNum(viewing.deadweightKilloutPercent)], ["Finish Grade", fmt(viewing.finishGrade)], ["Price/Head", gbp(viewing.pricePerHeadGbp)], ["Total Value", gbp(viewing.totalValueGbp)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
        viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-cull-records", recordId: viewing.id, farmId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Cull / Market Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.cullDate ?? "", onChange: (e) => sf("cullDate", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Age / Category", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["Kids", "Young does", "Cull does", "Cull bucks", "Store goats"].includes(form.ageClass ?? "") ? form.ageClass ?? "" : form.ageClass ? "Other" : "", onValueChange: (v) => sf("ageClass", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Kids", "Young does", "Cull does", "Cull bucks", "Store goats", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          (form.ageClass === "Other" || form.ageClass && !["Kids", "Young does", "Cull does", "Cull bucks", "Store goats"].includes(form.ageClass)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.ageClass === "Other" ? "" : form.ageClass, onChange: (e) => sf("ageClass", e.target.value || "Other"), placeholder: "Please specify age / category…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.numberCulled ?? "", onChange: (e) => sf("numberCulled", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Reason *", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["Finished for slaughter", "Store sale", "Draft ewe/doe", "Age cull", "Health / injury", "Poor performance", "Surplus stock"].includes(form.reasonForCulling ?? "") ? form.reasonForCulling ?? "" : form.reasonForCulling ? "Other" : "", onValueChange: (v) => sf("reasonForCulling", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Finished for slaughter", "Store sale", "Draft ewe/doe", "Age cull", "Health / injury", "Poor performance", "Surplus stock", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          (form.reasonForCulling === "Other" || form.reasonForCulling && !["Finished for slaughter", "Store sale", "Draft ewe/doe", "Age cull", "Health / injury", "Poor performance", "Surplus stock"].includes(form.reasonForCulling)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.reasonForCulling === "Other" ? "" : form.reasonForCulling, onChange: (e) => sf("reasonForCulling", e.target.value || "Other"), placeholder: "Please specify reason…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Destination *", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["Abattoir (direct)", "Market / mart", "Private sale", "On-farm slaughter"].includes(form.destination ?? "") ? form.destination ?? "" : form.destination ? "Other" : "", onValueChange: (v) => setForm((f) => ({ ...f, destination: v, destinationCph: "", abattoirName: "" })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Abattoir (direct)", "Market / mart", "Private sale", "On-farm slaughter", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          (form.destination === "Other" || form.destination && !["Abattoir (direct)", "Market / mart", "Private sale", "On-farm slaughter"].includes(form.destination)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.destination === "Other" ? "" : form.destination, onChange: (e) => setForm((f) => ({ ...f, destination: e.target.value || "Other" })), placeholder: "Please specify destination…" })
        ] }),
        form.destination === "Private sale" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Destination CPH", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.destinationCph ?? "", onChange: (e) => sf("destinationCph", e.target.value), placeholder: "e.g. 12/345/6789" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        form.destination === "Abattoir (direct)" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Abattoir Name", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.abattoirName ?? "", onValueChange: (v) => sf("abattoirName", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select abattoir..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: UK_GOAT_ABATTOIRS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }) }),
        form.destination === "On-farm slaughter" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slaughterman / Business Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abattoirName ?? "", onChange: (e) => sf("abattoirName", e.target.value), placeholder: "Name of person or business carrying out slaughter" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Live Weight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageLiveWeightKg ?? "", onChange: (e) => sf("averageLiveWeightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Avg Deadweight (kg)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.averageDeadweightKg ?? "", onChange: (e) => sf("averageDeadweightKg", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Killout % (DW/LW)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.deadweightKilloutPercent ?? "", onChange: (e) => sf("deadweightKilloutPercent", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Finish Grade", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.finishGrade ?? "", onValueChange: (v) => sf("finishGrade", v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade..." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GOAT_FINISH_GRADES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price / Head (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.pricePerHeadGbp ?? "", onChange: (e) => sf("pricePerHeadGbp", e.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Total Value (£)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.totalValueGbp ?? "", onChange: (e) => sf("totalValueGbp", e.target.value) }) }),
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
  const [form, setForm] = reactExports.useState({});
  const [vaccYearFilter, setVaccYearFilter] = reactExports.useState("all");
  const [diseaseYearFilter, setDiseaseYearFilter] = reactExports.useState("all");
  const { data: vaccRows = [], isLoading: vLoading } = useQuery({ queryKey: ["goat-vacc", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-vaccination-programmes`), { credentials: "include" }).then((r) => r.json()) });
  const { data: diseaseRows = [], isLoading: dLoading } = useQuery({ queryKey: ["goat-disease", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-disease-monitoring`), { credentials: "include" }).then((r) => r.json()) });
  const saveVacc = useMutation({ mutationFn: (body) => {
    const url = editing ? apiUrl(`farms/${farmId}/goat-vaccination-programmes/${editing.id}`) : apiUrl(`farms/${farmId}/goat-vaccination-programmes`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-vacc", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const saveDisease = useMutation({ mutationFn: (body) => {
    const url = editing ? apiUrl(`farms/${farmId}/goat-disease-monitoring/${editing.id}`) : apiUrl(`farms/${farmId}/goat-disease-monitoring`);
    return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
  }, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-disease", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delVacc = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-vaccination-programmes/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-vacc", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const delDisease = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/goat-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-disease", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const vaccYears = reactExports.useMemo(() => Array.from(new Set(vaccRows.map((r) => String(r.vaccinationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [vaccRows]);
  const filteredVacc = reactExports.useMemo(() => vaccYearFilter === "all" ? vaccRows : vaccRows.filter((r) => String(r.vaccinationDate ?? "").startsWith(vaccYearFilter)), [vaccRows, vaccYearFilter]);
  const diseaseYears = reactExports.useMemo(() => Array.from(new Set(diseaseRows.map((r) => String(r.monitoringDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [diseaseRows]);
  const filteredDisease = reactExports.useMemo(() => diseaseYearFilter === "all" ? diseaseRows : diseaseRows.filter((r) => String(r.monitoringDate ?? "").startsWith(diseaseYearFilter)), [diseaseRows, diseaseYearFilter]);
  function printVaccRecords() {
    const tableRows = filteredVacc.map((r) => `<tr><td>${fmtDate(r.vaccinationDate)}</td><td>${fmt(r.vaccinationCategory)}</td><td>${fmt(r.vaccineProduct)}</td><td>${fmt(r.numberTreated)}</td><td>${fmt(r.ageClassTreated)}</td><td>${fmtDate(r.nextDueDate)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Vaccination Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Goat Vaccination Records${vaccYearFilter !== "all" ? ` — ${vaccYearFilter}` : ""}</h1><h2>Goat Production · ${filteredVacc.length} record${filteredVacc.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Programme</th><th>Vaccine</th><th>Animals</th><th>Age Class</th><th>Next Due</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Vaccination records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
  }
  function printDiseaseRecords() {
    const tableRows = filteredDisease.map((r) => `<tr><td>${fmtDate(r.monitoringDate)}</td><td>${fmt(r.monitoringType)}</td><td>${fmt(r.testingBody)}</td><td>${fmt(r.numberOfSamples)}</td><td>${fmt(r.positiveResults)}</td><td>${fmt(r.status)}</td><td>${fmtDate(r.nextTestDue)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Goat Disease Monitoring</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Goat Disease Monitoring Records${diseaseYearFilter !== "all" ? ` — ${diseaseYearFilter}` : ""}</h1><h2>Goat Production · ${filteredDisease.length} record${filteredDisease.length !== 1 ? "s" : ""} · Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Type</th><th>Testing Body</th><th>Samples</th><th>Positive</th><th>Status</th><th>Next Due</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Disease monitoring records should be retained for a minimum of 3 years. Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p></body></html>`);
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
            { key: "vaccinationCategory", label: "Programme" },
            { key: "vaccineProduct", label: "Vaccine" },
            { key: "numberTreated", label: "Animals" },
            { key: "nextDueDate", label: "Next Due", render: (r) => fmtDate(r.nextDueDate) },
            { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-vaccination-programmes", recordId: r.id, farmId, compact: true }) : null }
          ],
          rows: filteredVacc,
          onView: setViewing,
          onEdit: (r) => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setOpen(true);
          },
          onDelete: (r) => delVacc.mutate(r.id),
          deleteMutation: delVacc
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing && subTab === "vaccinations", onOpenChange: (o) => {
        if (!o) setViewing(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Vaccination Programme" }) }),
        viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            [["Date", fmtDate(viewing.vaccinationDate)], ["Programme", fmt(viewing.vaccinationCategory)], ["Vaccine", fmt(viewing.vaccineProduct)], ["Route", fmt(viewing.administrationRoute)], ["Dose (ml)", fmt(viewing.doseVolumeMl)], ["Animals Treated", fmt(viewing.numberTreated)], ["Age Class", fmt(viewing.ageClassTreated)], ["Batch No.", fmt(viewing.batchNumber)], ["Expiry", fmtDate(viewing.expiryDate)], ["Next Due", fmtDate(viewing.nextDueDate)], ["Administered By", fmt(viewing.administeredBy)], ["Vet Prescribed", viewing.vetPrescribed ? "Yes" : "No"], ["Withdrawal (days)", fmt(viewing.withdrawalPeriodDays)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
          viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-vaccination-programmes", recordId: viewing.id, farmId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: open && subTab === "vaccinations", onOpenChange: (o) => {
        if (!o) {
          setOpen(false);
          setEditing(null);
          setForm({});
          saveVacc.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Vaccination"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Vaccination Programme", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ["CAE prevention (dam-raised)", "Clostridial diseases", "Pasteurella / pneumonia", "Enterotoxaemia", "Foot rot (Footvax)", "Caseous Lymphadenitis (CLA)", "E. coli (neonatal)", "Orf", "Johne's Disease — Paratuberculosis (Gudair)"].includes(form.vaccinationCategory ?? "") ? form.vaccinationCategory ?? "" : form.vaccinationCategory ? "Other" : "", onValueChange: (v) => sf("vaccinationCategory", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select programme..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["CAE prevention (dam-raised)", "Clostridial diseases", "Pasteurella / pneumonia", "Enterotoxaemia", "Foot rot (Footvax)", "Caseous Lymphadenitis (CLA)", "E. coli (neonatal)", "Orf", "Johne's Disease — Paratuberculosis (Gudair)", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] }),
            (form.vaccinationCategory === "Other" || form.vaccinationCategory && !["CAE prevention (dam-raised)", "Clostridial diseases", "Pasteurella / pneumonia", "Enterotoxaemia", "Foot rot (Footvax)", "Caseous Lymphadenitis (CLA)", "E. coli (neonatal)", "Orf", "Johne's Disease — Paratuberculosis (Gudair)"].includes(form.vaccinationCategory)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.vaccinationCategory === "Other" ? "" : form.vaccinationCategory, onChange: (e) => sf("vaccinationCategory", e.target.value || "Other"), placeholder: "Please specify programme…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vaccine Product *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vaccineProduct ?? "", onChange: (e) => sf("vaccineProduct", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.vaccinationDate ?? "", onChange: (e) => sf("vaccinationDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Batch Number", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.batchNumber ?? "", onChange: (e) => sf("batchNumber", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expiry Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate ?? "", onChange: (e) => sf("expiryDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Animals Treated *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberTreated ?? "", onChange: (e) => sf("numberTreated", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Age Class Treated", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ageClassTreated ?? "", onChange: (e) => sf("ageClassTreated", e.target.value), placeholder: "e.g. Kids, Does" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dose Volume (ml)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.doseVolumeMl ?? "", onChange: (e) => sf("doseVolumeMl", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administration Route", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.administrationRoute ?? "", onValueChange: (v) => sf("administrationRoute", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Subcutaneous (SC)", "Intramuscular (IM)", "Intradermal (ID)", "Oral", "Intranasal"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Withdrawal Period (days)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.withdrawalPeriodDays ?? "", onChange: (e) => sf("withdrawalPeriodDays", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Next Due Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextDueDate ?? "", onChange: (e) => sf("nextDueDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Administered By", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.administeredBy ?? "", onChange: (e) => sf("administeredBy", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.vetPrescribed === "true", onCheckedChange: (v) => sf("vetPrescribed", v ? "true" : "false"), id: "vetpx" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetpx", children: "Vet prescribed" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveVacc, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm({});
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveVacc.mutate({ ...form }), disabled: saveVacc.isPending, children: editing ? "Save" : "Add" })
        ] })
      ] }) })
    ] }),
    subTab === "disease" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Disease Monitoring" }),
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
            setForm({ status: "pending" });
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
            { key: "monitoringDate", label: "Date", render: (r) => fmtDate(r.monitoringDate) },
            { key: "monitoringType", label: "Type" },
            { key: "testingBody", label: "Testing Body" },
            { key: "numberOfSamples", label: "Samples" },
            { key: "positiveResults", label: "Positive" },
            { key: "status", label: "Status", render: (r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "clear" ? "default" : r.status === "positive" ? "destructive" : "secondary", children: fmt(r.status) }) },
            { key: "nextTestDue", label: "Next Due", render: (r) => fmtDate(r.nextTestDue) },
            { key: "_attach", label: "", render: (r) => r.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-disease-monitoring", recordId: r.id, farmId, compact: true }) : null }
          ],
          rows: filteredDisease,
          onView: setViewing,
          onEdit: (r) => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setOpen(true);
          },
          onDelete: (r) => delDisease.mutate(r.id),
          deleteMutation: delDisease
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing && subTab === "disease", onOpenChange: (o) => {
        if (!o) setViewing(null);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Disease Monitoring Record" }) }),
        viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            [["Date", fmtDate(viewing.monitoringDate)], ["Type", fmt(viewing.monitoringType)], ["Scheme Reference", fmt(viewing.schemeReference)], ["Testing Body", fmt(viewing.testingBody)], ["Samples", fmt(viewing.numberOfSamples)], ["Positive", fmt(viewing.positiveResults)], ["Negative", fmt(viewing.negativeResults)], ["Status", fmt(viewing.status)], ["Next Test Due", fmtDate(viewing.nextTestDue)]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                l,
                ":"
              ] }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: String(v) })
            ] }, String(l))),
            viewing.actionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Actions Taken:" }),
              " ",
              fmt(viewing.actionsTaken)
            ] }),
            viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
              " ",
              fmt(viewing.notes)
            ] })
          ] }),
          viewing.id && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-disease-monitoring", recordId: viewing.id, farmId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: open && subTab === "disease", onOpenChange: (o) => {
        if (!o) {
          setOpen(false);
          setEditing(null);
          setForm({});
          saveDisease.reset();
        }
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Disease Monitoring"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Monitoring Type *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.monitoringType ?? "", onValueChange: (v) => sf("monitoringType", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["CAE (Caprine Arthritis Encephalitis)", "CLA (Caseous Lymphadenitis)", "Johne's Disease", "Foot rot surveillance", "Cryptosporidiosis", "Toxoplasmosis", "Chlamydiosis", "Mycoplasma", "Faecal egg count (worms)", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.monitoringDate ?? "", onChange: (e) => sf("monitoringDate", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scheme Reference", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.schemeReference ?? "", onChange: (e) => sf("schemeReference", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Testing Body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.testingBody ?? "", onChange: (e) => sf("testingBody", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Number of Samples", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfSamples ?? "", onChange: (e) => sf("numberOfSamples", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "", onValueChange: (v) => sf("status", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["pending", "clear", "positive", "inconclusive"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Positive Results", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.positiveResults ?? "", onChange: (e) => sf("positiveResults", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Negative Results", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.negativeResults ?? "", onChange: (e) => sf("negativeResults", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Actions Taken", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.actionsTaken ?? "", onChange: (e) => sf("actionsTaken", e.target.value), rows: 2 }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Next Test Due", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue ?? "", onChange: (e) => sf("nextTestDue", e.target.value) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveDisease, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setOpen(false);
            setEditing(null);
            setForm({});
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveDisease.mutate({ ...form }), disabled: saveDisease.isPending, children: editing ? "Save" : "Add" })
        ] })
      ] }) })
    ] })
  ] });
}
const GOAT_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function GoatAnalyticsTab({ farmId }) {
  const { data: mating = [] } = useQuery({ queryKey: ["goat-mating", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-mating-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: scanning = [] } = useQuery({ queryKey: ["goat-scanning", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-scanning-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: weigh = [] } = useQuery({ queryKey: ["goat-weigh", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-weigh-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: cull = [] } = useQuery({ queryKey: ["goat-cull", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/goat-cull-records`), { credentials: "include" }).then((r) => r.json()) });
  const avgScanPct = reactExports.useMemo(() => {
    const valid = scanning.filter((r) => r.scanningPercentage);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.scanningPercentage), 0) / valid.length).toFixed(1) : null;
  }, [scanning]);
  const kidTypeData = reactExports.useMemo(() => [
    { name: "Barren", value: scanning.reduce((s, r) => s + (Number(r.doesBarren) || 0), 0) },
    { name: "Singles", value: scanning.reduce((s, r) => s + (Number(r.doesSingles) || 0), 0) },
    { name: "Doubles", value: scanning.reduce((s, r) => s + (Number(r.doesDoubles) || 0), 0) },
    { name: "Triplets", value: scanning.reduce((s, r) => s + (Number(r.doesTriples) || 0), 0) }
  ].filter((d) => d.value > 0), [scanning]);
  const dlwgData = reactExports.useMemo(() => weigh.filter((r) => r.dlwgGPerDay).slice(-10).map((r) => ({
    name: String(r.batchRef || r.animalCategory || "Batch").slice(0, 12),
    dlwg: Math.round(Number(r.dlwgGPerDay))
  })), [weigh]);
  const avgDlwg = reactExports.useMemo(() => {
    const valid = weigh.filter((r) => r.dlwgGPerDay);
    return valid.length ? Math.round(valid.reduce((s, r) => s + Number(r.dlwgGPerDay), 0) / valid.length) : null;
  }, [weigh]);
  const totalCullHead = reactExports.useMemo(() => cull.reduce((s, r) => s + (Number(r.numberOfHead) || 0), 0), [cull]);
  const totalCullValue = reactExports.useMemo(() => cull.reduce((s, r) => s + (Number(r.saleValue) || 0), 0), [cull]);
  const noData = mating.length === 0 && scanning.length === 0 && weigh.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add mating, scanning, or weigh-in records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Mating Records", value: mating.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Avg Scanning %", value: avgScanPct ? `${avgScanPct}%` : "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Avg DLWG (g/day)", value: avgDlwg ?? "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Cull / Market Head", value: totalCullHead || "—", bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      kidTypeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Kid Type Distribution (all scans)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: kidTypeData, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: kidTypeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: GOAT_COLORS[i % GOAT_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v} does`, ""] })
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
    cull.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "Cull & Market Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: cull.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Market Records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: totalCullHead }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Head" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: totalCullValue > 0 ? `£${totalCullValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Value" })
        ] })
      ] })
    ] }),
    mating.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "Mating Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: mating.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mating Cycles" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: mating.reduce((s, r) => s + (Number(r.doesExposed) || 0), 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total Does Exposed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: [...new Set(mating.map((r) => r.buckBreed).filter(Boolean))].length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Buck Breeds Used" })
        ] })
      ] })
    ] })
  ] });
}
function GoatProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "goat-production",
    farmId,
    validIds: ["herds", "mating", "scanning", "weigh", "cull", "health", "analytics", "enterprise"],
    defaultTab: "herds"
  });
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Please select a farm to view Goat Production records." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-6xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "w-6 h-6 text-green-600" }),
        "Goat Production"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Mating records, pregnancy scanning, weigh-in & DLWG, market records, health & vaccination" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "herds", onClick: () => setTab("herds"), children: "Herds" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mating", onClick: () => setTab("mating"), children: "Mating" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scanning", onClick: () => setTab("scanning"), children: "Scanning" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "weigh", onClick: () => setTab("weigh"), children: "Weigh-in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "cull", onClick: () => setTab("cull"), children: "Cull / Market" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "health", onClick: () => setTab("health"), children: "Health" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "analytics", onClick: () => setTab("analytics"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1 inline" }),
        "Analytics"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: "Enterprise Report" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-4 bg-card", children: [
      tab === "herds" && /* @__PURE__ */ jsxRuntimeExports.jsx(HerdsTab, { farmId }),
      tab === "mating" && /* @__PURE__ */ jsxRuntimeExports.jsx(MatingTab, { farmId }),
      tab === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScanningTab, { farmId }),
      tab === "weigh" && /* @__PURE__ */ jsxRuntimeExports.jsx(WeighTab, { farmId }),
      tab === "cull" && /* @__PURE__ */ jsxRuntimeExports.jsx(CullTab, { farmId }),
      tab === "health" && /* @__PURE__ */ jsxRuntimeExports.jsx(HealthTab, { farmId }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(GoatAnalyticsTab, { farmId }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(GoatEnterpriseReport, { farmId })
    ] })
  ] }) });
}
export {
  GoatProductionPage as default
};
