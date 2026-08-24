import { s as createLucideIcon, r as reactExports, m as useQuery, j as jsxRuntimeExports, b as useAppStore, c as useQueryClient, a as useToast, S as useMutation, d as Button, T as Plus, O as React, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-wemPfpPl.js";
import { d as downloadCsvFile } from "./csv-DqFyucvM.js";
import { u as useSafeUser } from "./use-safe-clerk-B0Pu-4CF.js";
import { u as usePersistedTab } from "./use-persisted-tab-fQM1Fshb.js";
import { u as usePersistedNumberFilter, a as usePersistedFilter } from "./use-persisted-filter-CbXrTJNk.js";
import { U as Users, A as AppLayout, C as CalendarDays, T as TrendingUp, I as Info, p as Bell, Z as Zap } from "./AppLayout-AXmKydl8.js";
import { B as Badge } from "./badge-BUTp9ioj.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CTXoQF7V.js";
import { P as Printer } from "./printer-B6s1K_bm.js";
import { a as Clock } from "./database-cyFXXRKA.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell } from "./generateCategoricalChart-_1Z8QmvX.js";
import { B as BarChart } from "./BarChart-O0wreOIn.js";
import { C as CartesianGrid } from "./CartesianGrid-BvBUTYjB.js";
import { C as ChevronUp } from "./chevron-up-D9CkaeOU.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-B0iEP7TA.js";
import { U as UserCheck } from "./user-check-DV6KAkMd.js";
import { P as PoundSterling } from "./shield-alert-v5Hmk-P0.js";
import { S as ShieldCheck } from "./shield-check-BwCbdWBg.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-B4P38e5B.js";
import { A as ArrowLeftRight } from "./arrow-left-right-DTFf8oE3.js";
import { T as TriangleAlert } from "./triangle-alert-Cud9xgqQ.js";
import { C as ChevronLeft } from "./chevron-left-6Z4Brakc.js";
import { C as ChevronRight } from "./tractor-DUyEXa4Y.js";
import { E as Eye } from "./eye-Bn0EDnst.js";
import { P as Pencil } from "./pencil-B9TxaMBP.js";
import { C as CircleCheck } from "./circle-check-D5ml80jf.js";
import { C as CircleX } from "./circle-x-BuF_sjtK.js";
import { D as Download } from "./download-DlEJTRl7.js";
import { P as PieChart, a as Pie } from "./PieChart-DU-BvO2R.js";
import { M as MessageSquare } from "./message-square-Cd33T3Ce.js";
import { C as CircleCheckBig } from "./circle-check-big-DQgRngaP.js";
import "./index-DOjzO7K0.js";
import "./index-C5TnK4L6.js";
const __iconNode = [
  ["path", { d: "M12 13v7a2 2 0 0 0 4 0", key: "rpgb42" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  [
    "path",
    { d: "M18.656 13h2.336a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-12.07-7.51", key: "yawknk" }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  ["path", { d: "M5.961 5.957a10.28 10.28 0 0 0-3.922 5.769A1 1 0 0 0 3 13h10", key: "5sfalc" }]
];
const UmbrellaOff = createLucideIcon("umbrella-off", __iconNode);
const PRINT_ID = "labour-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{visibility:hidden!important}#${PRINT_ID}{visibility:visible!important;display:block!important;position:fixed!important;inset:0!important;overflow:auto!important;background:#fff!important;z-index:99999!important;padding:24px!important}#${PRINT_ID} *{visibility:visible!important}.no-print{display:none!important;visibility:hidden!important}table{page-break-inside:auto}tr{page-break-inside:avoid}}`;
  document.head.appendChild(s);
}
function fmtGBP$1(p) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const ENTERPRISE_COLOURS = {
  Dairy: "#3b82f6",
  Beef: "#f97316",
  Sheep: "#f59e0b",
  Pigs: "#ec4899",
  Poultry: "#eab308",
  Arable: "#22c55e",
  Livestock: "#f97316",
  Machinery: "#64748b",
  General: "#94a3b8"
};
const ENTERPRISE_CSS = {
  Dairy: "bg-blue-500",
  Beef: "bg-orange-500",
  Sheep: "bg-amber-400",
  Pigs: "bg-pink-500",
  Poultry: "bg-yellow-500",
  Arable: "bg-green-500",
  Livestock: "bg-orange-400",
  Machinery: "bg-slate-500",
  General: "bg-gray-400"
};
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.fill }, children: [
      p.name,
      ": ",
      fmtGBP$1(p.value),
      " · ",
      p.payload.totalHours?.toFixed(1),
      " hrs"
    ] }, p.name))
  ] });
};
function LabourEnterpriseReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "labour-enterprise-report", filter: "year", farmId, defaultValue: currentYear });
  const [showStaff, setShowStaff] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["labour-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/labour-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && d.timesheetEntries > 0;
  const totalHours = d ? d.totalRegularHours + d.totalOvertimeHours : 0;
  const chartData = (d?.byEnterprise ?? []).map((e) => ({
    enterprise: e.enterprise,
    "Wage Cost": e.totalCostPence,
    totalHours: e.totalHours,
    pct: e.pctOfTotal
  }));
  (d?.byStaff ?? []).filter((s) => s.regularRatePence != null && s.regularRatePence > 0);
  const staffNoRates = (d?.byStaff ?? []).filter((s) => !s.regularRatePence || s.regularRatePence === 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Labour Cost by Enterprise" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Hours and wage cost allocated by enterprise from timesheets" })
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
      "No timesheet entries found for ",
      year,
      ".",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Record timesheets with task types to see labour costs by enterprise. Set hourly rates in the Labour → Pay Summary tab." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-blue-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Total Hours" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: totalHours.toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.totalRegularHours.toFixed(1),
            " reg + ",
            d.totalOvertimeHours.toFixed(1),
            " OT · ",
            d.timesheetEntries,
            " entries"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-emerald-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Total Wage Cost" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-emerald-700", children: fmtGBP$1(d.totalCostPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
            d.byStaff.length,
            " staff · ",
            staffNoRates.length > 0 ? `${staffNoRates.length} without rates set` : "all rates configured"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: "Avg Cost / Hour" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: totalHours > 0 && d.totalCostPence > 0 ? fmtGBP$1(d.totalCostPence / totalHours) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40", children: "across all costed hours" })
        ] })
      ] }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Wage Cost by Enterprise — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(160, chartData.length * 38 + 60), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, layout: "vertical", margin: { top: 4, right: 80, bottom: 4, left: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "enterprise", tick: { fontSize: 11 }, width: 80 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Wage Cost", radius: [0, 3, 3, 0], maxBarSize: 24, children: chartData.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: ENTERPRISE_COLOURS[e.enterprise] ?? "#94a3b8" }, e.enterprise)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Enterprise Allocation Detail — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 space-y-2", children: d.byEnterprise.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm w-20 text-right text-foreground/70 shrink-0", children: e.enterprise }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-muted/50 rounded-full h-5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full ${ENTERPRISE_CSS[e.enterprise] ?? "bg-slate-400"}`, style: { width: `${Math.max(e.pctOfTotal, 1)}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono w-24 text-right shrink-0", children: fmtGBP$1(e.totalCostPence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-foreground/40 w-12 text-right shrink-0", children: [
            e.pctOfTotal.toFixed(1),
            "%"
          ] })
        ] }, e.enterprise)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Enterprise" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Reg Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "OT Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Wage Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Cost/Hr" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "% Labour" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            d.byEnterprise.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-2.5 h-2.5 rounded-full ${ENTERPRISE_CSS[e.enterprise] ?? "bg-slate-400"}` }),
                e.enterprise
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: e.regularHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: e.overtimeHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-medium", children: e.totalHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-semibold", children: fmtGBP$1(e.totalCostPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/60 text-xs", children: e.totalHours > 0 && e.totalCostPence > 0 ? fmtGBP$1(e.totalCostPence / e.totalHours) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-foreground/60", children: [
                e.pctOfTotal.toFixed(1),
                "%"
              ] })
            ] }, e.enterprise)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border font-semibold bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: d.totalRegularHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: d.totalOvertimeHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: totalHours.toFixed(1) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: fmtGBP$1(d.totalCostPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: totalHours > 0 && d.totalCostPence > 0 ? fmtGBP$1(d.totalCostPence / totalHours) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: "100%" })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: [
          "Enterprise allocation based on task type from timesheet entries. ",
          staffNoRates.length > 0 ? `${staffNoRates.length} staff member(s) have no hourly rate set — their hours are counted but contribute £0 to wage cost. Configure rates in Labour → Pay Summary.` : "All staff have hourly rates configured.",
          " Contractor costs from Financial are not included."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors", onClick: () => setShowStaff((v) => !v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Staff Cost Breakdown (",
            d.byStaff.length,
            " staff members)"
          ] }),
          showStaff ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
        ] }),
        showStaff && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Staff Member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Reg Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "OT Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total Hrs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Rate/hr" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Wage Cost" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: d.byStaff.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: s.staffName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: s.regularHours.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: s.overtimeHours.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-medium", children: s.totalHours.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/60 text-xs", children: s.regularRatePence && s.regularRatePence > 0 ? `${fmtGBP$1(s.regularRatePence)}/hr` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", children: "No rate" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-semibold", children: s.totalCostPence > 0 ? fmtGBP$1(s.totalCostPence) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/30", children: "—" }) })
          ] }, s.staffName)) })
        ] }) })
      ] })
    ] })
  ] });
}
const TASK_TYPES = [
  "General Farm Work",
  "Crop Spraying",
  "Drilling / Planting",
  "Harvesting",
  "Livestock Handling",
  "Machinery Maintenance",
  "Irrigation",
  "Fencing / Hedging",
  "Grain Handling / Store",
  "Record Keeping / Admin",
  "Cleaning & Biosecurity",
  "Vehicle / Transport",
  "Travel (between sites)",
  "Building / Construction",
  "Other"
];
const SHIFT_TYPES = [
  { value: "full-day", label: "Full Day", color: "#16a34a" },
  { value: "morning", label: "Morning", color: "#2563eb" },
  { value: "afternoon", label: "Afternoon", color: "#7c3aed" },
  { value: "day-off", label: "Day Off", color: "#9ca3af" },
  { value: "holiday", label: "Holiday", color: "#f59e0b" },
  { value: "sick", label: "Sick", color: "#dc2626" },
  { value: "training", label: "Training", color: "#0891b2" }
];
const ABSENCE_TYPES = [
  "Annual Leave",
  "Sickness",
  "Compassionate Leave",
  "Maternity / Paternity",
  "Unpaid Leave",
  "Public Holiday",
  "Training Day",
  "Other"
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["monShift", "tueShift", "wedShift", "thuShift", "friShift", "satShift", "sunShift"];
function fmtDate(d) {
  try {
    return (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}
function fmtGBP(pence) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? "border-green-700 text-green-800" : "border-transparent text-gray-500 hover:text-gray-700"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 15 }),
        label,
        badge != null && badge > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none", children: badge })
      ]
    }
  );
}
function SubmissionStatusPanel({ farmId, weekStart, onSelectStaff }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const statusQ = useQuery({
    queryKey: ["labour-submission-status", farmId, weekStart],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/submission-status?weekStart=${weekStart}`).then((r) => r.json()),
    enabled: !!farmId && !!weekStart
  });
  const settingsQ = useQuery({
    queryKey: ["labour-settings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/settings`).then((r) => r.json()),
    enabled: !!farmId
  });
  const [reminderTime, setReminderTime] = reactExports.useState("18:00");
  reactExports.useEffect(() => {
    if (settingsQ.data?.timesheetReminderTime) setReminderTime(settingsQ.data.timesheetReminderTime);
  }, [settingsQ.data]);
  const saveReminderMut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/labour/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timesheetReminderTime: reminderTime })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Reminder time saved" });
      qc.invalidateQueries({ queryKey: ["labour-settings", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const DAYS2 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = isoDate(/* @__PURE__ */ new Date());
  const data = statusQ.data;
  const todayIndex = (() => {
    const d = /* @__PURE__ */ new Date(today + "T00:00:00Z");
    const dow = d.getUTCDay();
    return dow === 0 ? 6 : dow - 1;
  })();
  const summary = data?.staff?.length ? (() => {
    const scheduled = data.staff.filter((s) => {
      const day = s.days[todayIndex];
      return day && !["not_in_rota", "off", "future"].includes(day.status);
    });
    const submitted = scheduled.filter((s) => {
      const day = s.days[todayIndex];
      return day && (day.status === "approved" || day.status === "pending");
    });
    const pendingCount = data.staff.filter((s) => s.days[todayIndex]?.status === "pending").length;
    return { scheduled: scheduled.length, submitted: submitted.length, pendingCount };
  })() : null;
  const cellCls = (status) => {
    if (status === "approved") return "bg-green-100 text-green-800 border-green-300";
    if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-300";
    if (status === "missing") return "bg-red-50 text-red-600 border-red-300";
    if (status === "off") return "bg-gray-100 text-gray-400 border-gray-200";
    return "bg-white text-gray-200 border-gray-100";
  };
  const cellGlyph = (status) => {
    if (status === "approved") return "✓";
    if (status === "pending") return "~";
    if (status === "missing") return "!";
    if (status === "off") return "–";
    return "";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl bg-white overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2.5 border-b bg-gray-50 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 14, className: "text-gray-400 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-800", children: "Submission Status" }),
        summary !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 ml-1", children: [
          "Today: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: summary.submitted >= summary.scheduled && summary.scheduled > 0 ? "text-green-700" : "text-amber-700", children: [
            summary.submitted,
            "/",
            summary.scheduled
          ] }),
          " submitted"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 12, className: "text-gray-400 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 whitespace-nowrap", children: "SMS reminder at:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "time",
            value: reminderTime,
            onChange: (e) => setReminderTime(e.target.value),
            className: "h-7 text-xs border rounded px-2 focus:outline-none focus:ring-1 focus:ring-green-500 w-28"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "h-7 text-xs px-2.5",
            onClick: () => saveReminderMut.mutate(),
            disabled: saveReminderMut.isPending,
            children: "Save"
          }
        )
      ] })
    ] }),
    summary !== null && summary.pendingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "shrink-0 text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          summary.pendingCount,
          " timesheet",
          summary.pendingCount !== 1 ? "s" : "",
          " submitted today"
        ] }),
        " and awaiting your approval — click a staff member's name in the grid below to view and approve their entries."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 px-4 py-1.5 border-b bg-gray-50/60 text-xs text-gray-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-300" }),
        "Approved"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-amber-50 border border-amber-300" }),
        "Pending"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-red-50 border border-red-300" }),
        "Missing"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" }),
        "Off / Holiday"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-white border border-gray-100" }),
        "Not rostered"
      ] })
    ] }),
    statusQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-gray-400 py-6", children: "Loading…" }) : !data?.staff?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-gray-400 py-6", children: "No active staff found — add staff members in the Rota tab first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-500 min-w-[130px]", children: "Staff" }),
        DAYS2.map((d, i) => {
          const date = data.staff[0]?.days[i]?.date ?? "";
          const isToday = date === today;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: `px-1 py-2 text-center font-medium min-w-[52px] ${isToday ? "text-green-700 bg-green-50/60" : "text-gray-500"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: d }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-normal text-gray-400 text-[10px]", children: date ? (/* @__PURE__ */ new Date(date + "T00:00:00Z")).getDate() : "" })
          ] }, d);
        })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.staff.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t hover:bg-gray-50/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium truncate max-w-[150px]", children: onSelectStaff ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onSelectStaff(member.name),
            className: "text-gray-700 hover:text-green-700 hover:underline text-left w-full truncate",
            title: `View ${member.name}'s timesheet entries`,
            children: member.name
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: member.name }) }),
        member.days.map((day, i) => {
          const isToday = day.date === today;
          const isClickable = onSelectStaff && (day.status === "pending" || day.status === "missing" || day.status === "approved");
          return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-1 py-1.5 text-center ${isToday ? "bg-green-50/40" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              onClick: isClickable ? () => onSelectStaff(member.name) : void 0,
              title: `${member.name} — ${day.status}${day.shift ? ` (${day.shift})` : ""}${day.totalHours > 0 ? ` — ${day.totalHours.toFixed(1)}h` : ""}${isClickable ? " · click to view entries" : ""}`,
              className: `inline-flex items-center justify-center w-8 h-6 rounded border text-[11px] font-semibold ${isClickable ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-green-400 transition-all" : "cursor-default"} ${cellCls(day.status)}`,
              children: cellGlyph(day.status)
            }
          ) }, i);
        })
      ] }, member.name)) })
    ] }) })
  ] });
}
function TimesheetsTab({ farmId, staffNames, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: farmData } = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const farmName = farmData?.record?.name ?? "";
  const [filterStaff, setFilterStaff] = usePersistedFilter({ page: "labour-timesheets", filter: "staff", farmId, defaultValue: "all" });
  const [filterMode, setFilterMode] = reactExports.useState("month");
  const [filterMonth, setFilterMonth] = reactExports.useState(() => isoDate(/* @__PURE__ */ new Date()).slice(0, 7));
  const [filterWeekStart, setFilterWeekStart] = reactExports.useState(() => isoDate(getMondayOfWeek(/* @__PURE__ */ new Date())));
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewEntry, setViewEntry] = reactExports.useState(null);
  const emptyForm = () => ({
    staffName: filterStaff !== "all" ? filterStaff : "",
    date: isoDate(/* @__PURE__ */ new Date()),
    taskType: "",
    hoursRegular: "",
    hoursOvertime: "",
    notes: "",
    approvedBy: ""
  });
  const [form, setForm] = reactExports.useState(emptyForm());
  const sf = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const q = useQuery({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then((r) => r.json()),
    enabled: !!farmId
  });
  const addMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/timesheets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Entry saved" });
      qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] });
      qc.invalidateQueries({ queryKey: ["labour-submission-status", farmId] });
      setAddOpen(false);
      setEditItem(null);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const editMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/labour/timesheets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Entry updated" });
      qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] });
      qc.invalidateQueries({ queryKey: ["labour-submission-status", farmId] });
      setEditItem(null);
      setAddOpen(false);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/labour/timesheets/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Entry deleted" });
      qc.invalidateQueries({ queryKey: ["labour-timesheets", farmId] });
      qc.invalidateQueries({ queryKey: ["labour-submission-status", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openEdit = (e) => {
    setForm({ staffName: e.staffName, date: e.date, taskType: e.taskType, hoursRegular: e.hoursRegular, hoursOvertime: e.hoursOvertime ?? "", notes: e.notes ?? "", approvedBy: e.approvedBy ?? "" });
    setEditItem(e);
    setAddOpen(true);
  };
  const save = () => {
    if (editItem) editMut.mutate({ id: editItem.id, body: { ...form } });
    else addMut.mutate({ ...form });
  };
  const weekEnd = isoDate(addDays(/* @__PURE__ */ new Date(filterWeekStart + "T00:00:00"), 6));
  const prevWeek = () => setFilterWeekStart(isoDate(addDays(/* @__PURE__ */ new Date(filterWeekStart + "T00:00:00"), -7)));
  const nextWeek = () => setFilterWeekStart(isoDate(addDays(/* @__PURE__ */ new Date(filterWeekStart + "T00:00:00"), 7)));
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const all = q.data?.entries ?? [];
  const filtered = reactExports.useMemo(() => all.filter((e) => {
    if (filterStaff !== "all" && e.staffName !== filterStaff) return false;
    if (filterMode === "month" && filterMonth && !e.date.startsWith(filterMonth)) return false;
    if (filterMode === "week" && (e.date < filterWeekStart || e.date > weekEnd)) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date)), [all, filterStaff, filterMode, filterMonth, filterWeekStart, weekEnd]);
  const totalReg = filtered.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
  const totalOT = filtered.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);
  const byDate = reactExports.useMemo(() => {
    if (filterStaff === "all") return null;
    const map = {};
    filtered.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, filterStaff]);
  const byStaff = reactExports.useMemo(() => {
    if (filterStaff !== "all") return {};
    return filtered.reduce((acc, e) => {
      if (!acc[e.staffName]) acc[e.staffName] = { reg: 0, ot: 0 };
      acc[e.staffName].reg += parseFloat(e.hoursRegular || "0");
      acc[e.staffName].ot += parseFloat(e.hoursOvertime || "0");
      return acc;
    }, {});
  }, [filtered, filterStaff]);
  const periodLabel = filterMode === "week" ? `${fmtDate(filterWeekStart)} – ${fmtDate(weekEnd)}` : filterMonth ? (/* @__PURE__ */ new Date(filterMonth + "-01")).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "All periods";
  const printTimesheets = () => {
    const rows = filtered.map((e) => `<tr><td>${fmtDate(e.date)}</td><td>${e.staffName}</td><td>${e.taskType}</td><td style="text-align:right">${parseFloat(e.hoursRegular || "0").toFixed(1)}</td><td style="text-align:right">${parseFloat(e.hoursOvertime || "0") > 0 ? parseFloat(e.hoursOvertime).toFixed(1) : "—"}</td><td>${e.approvedBy || "—"}</td><td>${e.notes || ""}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Labour Timesheets</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}h1{font-size:16px;margin-bottom:4px}p{color:#666;margin-bottom:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}tr:nth-child(even){background:#fafafa}.totals{margin-top:12px;font-size:13px}</style></head><body><h1>Labour Timesheets</h1><p>${periodLabel} — All staff</p><table><thead><tr><th>Date</th><th>Staff Member</th><th>Task</th><th>Reg Hrs</th><th>OT Hrs</th><th>Approved By</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><strong>Total regular: ${totalReg.toFixed(1)} hrs</strong> &nbsp;&nbsp; <strong>Total overtime: ${totalOT.toFixed(1)} hrs</strong> &nbsp;&nbsp; <strong>Total working time: ${(totalReg + totalOT).toFixed(1)} hrs</strong></div></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  };
  const printStaffTimesheet = () => {
    if (!byDate) return;
    const name = filterStaff;
    const dayRows = byDate.map(([date, entries]) => {
      const dayReg = entries.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
      const dayOT = entries.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);
      const dayLabel = (/* @__PURE__ */ new Date(date + "T00:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
      const taskRows = entries.map(
        (e) => `<tr><td style="padding-left:24px;color:#555">${e.taskType}</td><td style="text-align:right">${parseFloat(e.hoursRegular || "0").toFixed(2)}</td><td style="text-align:right">${parseFloat(e.hoursOvertime || "0") > 0 ? parseFloat(e.hoursOvertime).toFixed(2) : "—"}</td><td style="color:#777;font-size:11px">${e.approvedBy || ""}</td><td style="color:#777;font-size:11px">${e.notes || ""}</td></tr>`
      ).join("");
      return `<tr style="background:#f8f8f8"><td colspan="5" style="font-weight:600;padding:7px 8px;border:1px solid #bbb">${dayLabel} &nbsp;<span style="font-weight:400;color:#555">— ${dayReg.toFixed(1)}h reg${dayOT > 0 ? ` + ${dayOT.toFixed(1)}h OT` : ""} &nbsp;(daily total: ${(dayReg + dayOT).toFixed(1)}h)</span></td></tr>${taskRows}`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Timesheet — ${name}</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px;color:#111}h1{font-size:18px;margin:0 0 2px}.sub{color:#666;font-size:12px;margin:0 0 14px}table{width:100%;border-collapse:collapse;margin-bottom:14px}th{background:#efefef;border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em}td{border:1px solid #ddd;padding:6px 8px}.wtr-note{background:#fff8e1;border:1px solid #e8cc50;border-radius:4px;padding:8px 12px;margin-bottom:14px;font-size:11px;color:#555}.totals{background:#f0f7f0;border:1px solid #b8d8b8;border-radius:4px;padding:10px 14px;margin-bottom:18px;font-size:13px}.signoff{border-top:2px solid #222;padding-top:14px;margin-top:20px}.sig-box{border-bottom:1px solid #222;height:36px;margin-top:4px}.signoff-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:10px}@media print{body{margin:12px}}</style></head><body><h1>Staff Timesheet — ${name}</h1><p class="sub">${periodLabel} &nbsp;·&nbsp; Printed ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p><div class="wtr-note"><strong>Working Time note:</strong> Hours recorded represent time actively working on each task. Rest breaks (including the statutory 20-minute break) are <em>not</em> working time under the Working Time Regulations 1998 and should not be included. Travel between work sites during the working day <em>is</em> working time and should be recorded as "Travel (between sites)".</div><table><thead><tr><th>Task</th><th style="text-align:right">Reg Hrs</th><th style="text-align:right">OT Hrs</th><th>Approved By</th><th>Notes</th></tr></thead><tbody>${dayRows}</tbody></table><div class="totals">Total regular hours: <strong>${totalReg.toFixed(1)} hrs</strong> &nbsp;&nbsp;&nbsp; Total overtime: <strong>${totalOT.toFixed(1)} hrs</strong> &nbsp;&nbsp;&nbsp; Total working time: <strong>${(totalReg + totalOT).toFixed(1)} hrs</strong></div><div class="signoff"><p style="margin:0 0 4px;font-size:13px;font-weight:600">Declaration</p><p style="margin:0;font-size:11px;color:#555">I confirm that the above is an accurate record of my working hours and the tasks undertaken during the period shown. Rest breaks are not included in the hours recorded.</p><div class="signoff-grid"><div><p style="margin:10px 0 2px;font-size:11px">Staff member: <strong>${name}</strong></p><div class="sig-box"></div><p style="margin:3px 0 0;font-size:10px;color:#888">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: _______________</p></div><div><p style="margin:10px 0 2px;font-size:11px">Countersigned by (supervisor / farm manager)</p><div class="sig-box"></div><p style="margin:3px 0 0;font-size:10px;color:#888">Name: _________________________ &nbsp; Date: _______________</p></div></div></div></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  };
  const printBlankTimesheet = () => {
    const taskList = TASK_TYPES.map((t) => `<li>${t}</li>`).join("");
    const blankRows = Array.from(
      { length: 9 },
      () => `<tr><td style="width:90px">&nbsp;</td><td>&nbsp;</td><td style="width:62px">&nbsp;</td><td style="width:62px">&nbsp;</td><td style="width:58px;text-align:right">&nbsp;</td><td style="width:58px;text-align:right">&nbsp;</td><td>&nbsp;</td></tr>`
    ).join("");
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Blank Daily Timesheet — BDE Farm Trac</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;padding:18px 22px;color:#111}
  .header{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #166534;padding-bottom:9px;margin-bottom:12px}
  .brand{font-size:20px;font-weight:700;color:#166534;letter-spacing:-0.3px}
  .brand-sub{font-size:9.5px;color:#4b7c5e;margin-top:1px}
  .doc-title{font-size:15px;font-weight:700;color:#111;text-align:right}
  .doc-ref{font-size:9.5px;color:#888;text-align:right;margin-top:2px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px 20px;margin-bottom:11px}
  .info-field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;display:block;margin-bottom:2px}
  .info-field .line{border-bottom:1.5px solid #333;height:21px;padding-left:4px;font-size:11px;color:#111;display:flex;align-items:flex-end;padding-bottom:2px}
  .wtr-box{background:#fffbeb;border:1px solid #d97706;border-radius:3px;padding:6px 10px;margin-bottom:11px;font-size:9.5px;color:#78350f;line-height:1.5}
  .wtr-box strong{color:#92400e}
  table{width:100%;border-collapse:collapse;margin-bottom:10px}
  th{background:#166534;color:#fff;font-size:9.5px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding:6px 7px;border:1px solid #155e2f;text-align:left}
  td{border:1px solid #ccc;padding:0;height:25px;vertical-align:middle}
  td:nth-child(5),td:nth-child(6){text-align:right}
  .totals-row td{border:1px solid #aaa;background:#f0f7f0;font-weight:700;padding:5px 7px;height:auto}
  .totals-label{font-size:9.5px;text-transform:uppercase;letter-spacing:.05em;color:#555}
  .section-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#166534;margin:11px 0 5px}
  .task-ref{display:grid;grid-template-columns:repeat(4,1fr);gap:1px 12px;margin-bottom:11px}
  .task-ref ol{margin:0;padding-left:16px;font-size:9.5px;color:#444;line-height:1.65}
  .signoff-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:12px}
  .sig-block label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;display:block;margin-bottom:2px}
  .sig-block .line{border-bottom:1.5px solid #333;height:28px;margin-bottom:7px}
  .footer-note{margin-top:12px;border-top:1px solid #ddd;padding-top:7px;font-size:9px;color:#666;text-align:center}
  @media print{body{padding:12px 16px}@page{size:A4 portrait;margin:9mm}}
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">BDE Farm Trac</div>
    <div class="brand-sub">Red Tractor Compliance Made Simple · bdefarmtrac.co.uk</div>
  </div>
  <div>
    <div class="doc-title">Daily Timesheet Record</div>
    <div class="doc-ref">Form FT-TS-01 &nbsp;|&nbsp; Printed: ${today}</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-field"><label>Employee Name</label><div class="line"></div></div>
  <div class="info-field"><label>Farm / Business Name</label><div class="line">${farmName}</div></div>
  <div class="info-field"><label>Date of Work</label><div class="line"></div></div>
  <div class="info-field"><label>Department / Section</label><div class="line"></div></div>
  <div class="info-field"><label>Line Manager</label><div class="line"></div></div>
  <div class="info-field"><label>Contract Type (circle)&nbsp; &nbsp;Full-Time &nbsp;/&nbsp; Part-Time &nbsp;/&nbsp; Casual</label><div class="line"></div></div>
</div>

<div class="wtr-box">
  <strong>Working Time Regulations 1998 — What to record:</strong>
  Record each task separately with the actual hours spent working on it.
  <strong>Include:</strong> travel between work sites during the working day (use "Travel (between sites)").
  <strong>Do NOT include:</strong> rest breaks — including the statutory 20-minute break or any period where you are free to leave your post.
  Regular hours = contracted hours &nbsp;|&nbsp; Overtime = hours worked beyond your contracted daily hours.
</div>

<table>
  <thead>
    <tr>
      <th style="width:90px">Date</th>
      <th>Task Type <span style="font-weight:400;font-size:9px">(see list below)</span></th>
      <th style="width:62px">Start Time</th>
      <th style="width:62px">End Time</th>
      <th style="width:58px;text-align:right">Reg Hrs</th>
      <th style="width:58px;text-align:right">OT Hrs</th>
      <th>Notes / Location / Field Reference</th>
    </tr>
  </thead>
  <tbody>
    ${blankRows}
    <tr class="totals-row">
      <td colspan="4" style="padding:5px 7px"><span class="totals-label">Daily Totals</span></td>
      <td style="text-align:right;padding:5px 7px">&nbsp;</td>
      <td style="text-align:right;padding:5px 7px">&nbsp;</td>
      <td style="padding:5px 7px"><span class="totals-label">Total working time: _________ hrs</span></td>
    </tr>
  </tbody>
</table>

<div class="section-title">Task Type Reference — write the task type in the Task column above</div>
<div class="task-ref">
  <ol>${taskList}</ol>
</div>

<div class="signoff-grid">
  <div>
    <div class="section-title">Employee Declaration</div>
    <p style="font-size:10px;color:#555;margin:0 0 8px">I confirm the hours recorded above are accurate and represent time actively spent working on the tasks listed.</p>
    <div class="sig-block"><label>Employee Signature</label><div class="line"></div></div>
    <div class="sig-block"><label>Date Signed</label><div class="line"></div></div>
  </div>
  <div>
    <div class="section-title">Manager Approval</div>
    <p style="font-size:10px;color:#555;margin:0 0 8px">I have reviewed and approved the hours recorded on this timesheet.</p>
    <div class="sig-block"><label>Manager Name (print)</label><div class="line"></div></div>
    <div class="sig-block"><label>Manager Signature &amp; Date</label><div class="line"></div></div>
  </div>
</div>

<div class="footer-note">
  Please complete in <strong>black or blue ink</strong> and return this form to your manager at the end of the working day.
  Managers: retain completed timesheets for a minimum of <strong>2 years</strong> in accordance with Working Time Regulations record-keeping requirements.
  Once approved, enter hours into BDE Farm Trac (Labour → Timesheets → Add Entry) to maintain your WTR 17-week rolling average.
</div>

</body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  };
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "shrink-0 mt-0.5 text-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "What counts as working time:" }),
        " Record each task separately with the hours spent on it. Travel ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "between" }),
        " work sites during the day is working time — use the “Travel (between sites)” task type. Rest breaks (including the statutory 20-minute break, or any break where the worker is free to leave) are ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "not" }),
        " working time under the Working Time Regulations 1998 and should not be recorded as task hours."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SubmissionStatusPanel, { farmId, weekStart: filterWeekStart, onSelectStaff: (name) => {
      setFilterStaff(name);
      setFilterMode("week");
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStaff, onValueChange: (v) => setFilterStaff(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-48 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All staff" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All staff" }),
          staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border rounded-lg overflow-hidden h-9 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterMode("month"), className: `px-3 text-sm font-medium transition-colors ${filterMode === "month" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`, children: "Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterMode("week"), className: `px-3 text-sm font-medium border-l transition-colors ${filterMode === "week" ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`, children: "Week" })
      ] }),
      filterMode === "month" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterMonth || "all-months", onValueChange: (v) => setFilterMonth(v === "all-months" ? "" : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select month" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all-months", children: "All months" }),
          months.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) }, m))
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 h-9", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: prevWeek, className: "border rounded-lg p-1.5 hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium px-2 whitespace-nowrap", children: [
          fmtDate(filterWeekStart),
          " – ",
          fmtDate(weekEnd)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextWeek, className: "border rounded-lg p-1.5 hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printBlankTimesheet, title: "Print a blank daily timesheet for staff without app access", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          " Blank Timesheet"
        ] }),
        filterStaff !== "all" && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printStaffTimesheet, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          " Print Staff Timesheet"
        ] }),
        filterStaff === "all" && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printTimesheets, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          " Print All"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(emptyForm());
          setEditItem(null);
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          " Add Entry"
        ] })
      ] })
    ] }),
    filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm bg-gray-50 rounded-lg px-4 py-2.5 border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
        "Regular: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-gray-900", children: [
          totalReg.toFixed(1),
          " hrs"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
        "Overtime: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-amber-700", children: [
          totalOT.toFixed(1),
          " hrs"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
        "Total working time: ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-gray-900", children: [
          (totalReg + totalOT).toFixed(1),
          " hrs"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 text-xs ml-auto", children: [
        filtered.length,
        " ",
        filtered.length === 1 ? "entry" : "entries",
        " · ",
        periodLabel,
        filterStaff !== "all" ? ` · ${filterStaff}` : ""
      ] })
    ] }),
    filterStaff === "all" && Object.keys(byStaff).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3", children: (() => {
      const renderCard = (name, hrs) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFilterStaff(name), className: "border rounded-xl p-3 bg-white text-left hover:border-green-500 hover:shadow-sm transition-all group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800 truncate", children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900 mt-0.5", children: [
          hrs.reg.toFixed(1),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-400", children: "reg hrs" })
        ] }),
        hrs.ot > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-0.5", children: [
          "+ ",
          hrs.ot.toFixed(1),
          " OT hrs"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity", children: "View daily breakdown →" })
      ] }, name);
      if (!hasDepartments) return Object.entries(byStaff).map(([n, h]) => renderCard(n, h));
      return deptGroups.map(({ dept, colour, names }) => {
        const group = names.filter((n) => byStaff[n]);
        if (!group.length) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest", style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 }, children: dept ?? "No department" }) }),
          group.map((n) => renderCard(n, byStaff[n]))
        ] }, dept ?? "__none__");
      });
    })() }),
    filterStaff !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : !byDate || byDate.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-10 h-10 mx-auto mb-2 opacity-25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No entries for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: filterStaff }),
        " in this period."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: byDate.map(([date, entries]) => {
      const dayReg = entries.reduce((s, e) => s + parseFloat(e.hoursRegular || "0"), 0);
      const dayOT = entries.reduce((s, e) => s + parseFloat(e.hoursOvertime || "0"), 0);
      const dayLabel = (/* @__PURE__ */ new Date(date + "T00:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-800", children: dayLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-gray-900", children: [
              dayReg.toFixed(1),
              "h"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "reg" }),
            dayOT > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "+" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-amber-700", children: [
                dayOT.toFixed(1),
                "h"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "OT" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400 text-xs ml-1", children: [
              "· total ",
              (dayReg + dayOT).toFixed(1),
              "h"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("table", { className: "w-full text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: entries.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setViewEntry(e), className: `cursor-pointer hover:bg-blue-50/40 transition-colors ${!e.approvedBy ? "bg-amber-50/30" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 pl-6 text-gray-700", children: e.taskType }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 font-mono text-gray-900 whitespace-nowrap", children: [
            parseFloat(e.hoursRegular || "0").toFixed(1),
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-mono whitespace-nowrap", children: parseFloat(e.hoursOvertime || "0") > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-700", children: [
            "+",
            parseFloat(e.hoursOvertime).toFixed(1),
            "h OT"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-200", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: e.approvedBy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-50 text-green-700 border-green-200", children: e.approvedBy }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 font-medium", children: "Needs approval" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-400 text-xs max-w-[200px] truncate", children: e.notes || "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", onClick: (ev) => ev.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewEntry(e), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(e), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delMut.mutate(e.id), className: "text-gray-400 hover:text-red-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, e.id)) }) })
      ] }, date);
    }) }) }),
    filterStaff === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-10 h-10 mx-auto mb-2 opacity-25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: all.length === 0 ? "No timesheet entries yet — add your first entry." : "No entries match the current filters." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide", children: ["Date", "Staff Member", "Task", "Reg hrs", "OT hrs", "Approved By", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-semibold", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filtered.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setViewEntry(e), className: `cursor-pointer hover:bg-blue-50/40 transition-colors ${!e.approvedBy ? "bg-amber-50/30" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap text-gray-700", children: fmtDate(e.date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", onClick: (ev) => ev.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterStaff(e.staffName), className: "text-gray-900 hover:text-green-700 hover:underline", children: e.staffName }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-gray-700", children: e.taskType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-mono text-gray-900", children: parseFloat(e.hoursRegular || "0").toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-mono", children: parseFloat(e.hoursOvertime || "0") > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700", children: parseFloat(e.hoursOvertime).toFixed(1) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: e.approvedBy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-50 text-green-700 border-green-200", children: e.approvedBy }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 font-medium", children: "Needs approval" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-gray-400 text-xs max-w-[180px] truncate", children: e.notes || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", onClick: (ev) => ev.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewEntry(e), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(e), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delMut.mutate(e.id), className: "text-gray-400 hover:text-red-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
        ] }) })
      ] }, e.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditItem(null);
        setForm(emptyForm());
        addMut.reset();
        editMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Timesheet Entry" : "Add Timesheet Entry" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Each entry records ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "one task type" }),
        " for one staff member on one date. To record multiple tasks in the same day, save this entry then click ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Entry" }),
        " again with the same person and date."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.staffName, onValueChange: (v) => sf("staffName", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.date, onChange: (e) => sf("date", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Task Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.taskType, onValueChange: (v) => sf("taskType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select task…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TASK_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Regular Hours ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(for this task)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.25", className: "mt-1", value: form.hoursRegular, onChange: (e) => sf("hoursRegular", e.target.value), placeholder: "e.g. 4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Overtime Hours ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.25", className: "mt-1", value: form.hoursOvertime, onChange: (e) => sf("hoursOvertime", e.target.value), placeholder: "0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Approved By ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.approvedBy || "none", onValueChange: (v) => sf("approvedBy", v === "none" ? "" : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supervisor…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Not yet approved —" }),
                staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              "Notes ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: "mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[72px] resize-y focus:outline-none focus:ring-2 focus:ring-ring",
                value: form.notes,
                onChange: (e) => sf("notes", e.target.value),
                placeholder: "e.g. North block, finished at 18:00 due to weather"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setAddOpen(false);
            setEditItem(null);
            setForm(emptyForm());
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: !form.staffName || !form.date || !form.taskType || addMut.isPending || editMut.isPending, children: editItem ? "Update Entry" : "Save Entry" })
        ] })
      ] })
    ] }) }),
    viewEntry && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewEntry(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Timesheet Entry — ",
        fmtDate(viewEntry.date)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEntry.staffName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewEntry.date) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Task Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEntry.taskType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Regular Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium font-mono", children: [
            parseFloat(viewEntry.hoursRegular || "0").toFixed(2),
            " h"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overtime Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: parseFloat(viewEntry.hoursOvertime || "0") > 0 ? `${parseFloat(viewEntry.hoursOvertime).toFixed(2)} h` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approved By" }),
          viewEntry.approvedBy ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-50 text-green-700 border-green-200", children: viewEntry.approvedBy }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 font-medium", children: "Needs approval" })
        ] }),
        viewEntry.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewEntry.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewEntry);
          setViewEntry(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewEntry(null), children: "Close" })
      ] })
    ] }) })
  ] });
}
function computeDeptGroups(sm) {
  const map = /* @__PURE__ */ new Map();
  for (const m of sm) {
    const key = m.department ?? "";
    if (!map.has(key)) map.set(key, { colour: m.colour, names: [] });
    map.get(key).names.push(m.name);
  }
  const sorted = [...map.entries()].sort(([a], [b]) => !a ? 1 : !b ? -1 : a.localeCompare(b));
  return { groups: sorted.map(([dept, { colour, names }]) => ({ dept: dept || null, colour, names })), hasDepartments: sm.some((m) => m.department !== null) };
}
function RotaTab({ farmId, staffNames, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [weekStart, setWeekStart] = reactExports.useState(getMondayOfWeek(/* @__PURE__ */ new Date()));
  const [saving, setSaving] = reactExports.useState({});
  const [pendingHolidayLog, setPendingHolidayLog] = reactExports.useState(null);
  const [quickLog, setQuickLog] = reactExports.useState(null);
  const [qlStatus, setQlStatus] = reactExports.useState("absent_sick");
  const [qlNotes, setQlNotes] = reactExports.useState("");
  const logAbsenceMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/absences`, {
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
      toast({ title: "Annual leave logged and deducted from entitlement" });
      qc.invalidateQueries({ queryKey: ["labour-absences", farmId] });
      setPendingHolidayLog(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const logAttMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/actual-attendance`, {
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
    onSuccess: (_data, variables) => {
      const v = variables;
      toast({ title: "Attendance logged" });
      qc.invalidateQueries({ queryKey: ["labour-actual-attendance", farmId] });
      setQuickLog(null);
      setQlStatus("absent_sick");
      setQlNotes("");
      if (v.actualStatus === "absent_holiday") {
        setPendingHolidayLog({ staffName: v.staffName, date: v.date });
      }
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const q = useQuery({
    queryKey: ["labour-rota", farmId, isoDate(weekStart)],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rota`).then((r) => r.json()),
    enabled: !!farmId
  });
  const allRota = q.data?.rota ?? [];
  const weekRota = allRota.filter((r) => r.weekStartDate === isoDate(weekStart));
  const rotaMap = new Map(weekRota.map((r) => [r.staffName, r]));
  const shiftColor = (val) => {
    const s = SHIFT_TYPES.find((t) => t.value === val);
    return s ? s.color : "#e5e7eb";
  };
  const shiftLabel = (val) => {
    const s = SHIFT_TYPES.find((t) => t.value === val);
    return s ? s.label : "—";
  };
  const setShift = async (staffName, dayKey, shiftVal) => {
    const key = `${staffName}-${dayKey}`;
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      const existing = rotaMap.get(staffName);
      if (existing) {
        await fetch(`/api/farms/${farmId}/labour/rota/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...existing, [dayKey]: shiftVal === "none" ? null : shiftVal })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      } else {
        const body = { weekStartDate: isoDate(weekStart), staffName };
        DAY_KEYS.forEach((k) => {
          body[k] = k === dayKey ? shiftVal === "none" ? null : shiftVal : null;
        });
        await fetch(`/api/farms/${farmId}/labour/rota`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      qc.invalidateQueries({ queryKey: ["labour-rota", farmId, isoDate(weekStart)] });
      qc.invalidateQueries({ queryKey: ["labour-rota", farmId] });
      if (shiftVal === "holiday") {
        const dayIndex = DAY_KEYS.indexOf(dayKey);
        const date = isoDate(addDays(weekStart, dayIndex));
        setPendingHolidayLog({ staffName, date });
      }
    } catch {
      toast({ title: "Error saving shift", variant: "destructive" });
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  };
  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToday = () => setWeekStart(getMondayOfWeek(/* @__PURE__ */ new Date()));
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  const printRota = () => {
    const colCount = DAYS.length + 1;
    const header = `<tr><th>Staff Member</th>${DAYS.map((d, i) => `<th>${d} ${fmtDate(isoDate(addDays(weekStart, i))).slice(0, 6)}</th>`).join("")}</tr>`;
    const rows = hasDepartments ? deptGroups.map(({ dept, names }) => {
      const deptRow = `<tr><td colspan="${colCount}" style="background:#f9fafb;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;padding:5px 10px;text-align:left">${dept ?? "No Department"}</td></tr>`;
      const memberRows = names.map((name) => {
        const row = rotaMap.get(name);
        return `<tr><td style="padding-left:18px"><strong>${name}</strong></td>${DAY_KEYS.map((k) => `<td>${row ? shiftLabel(row[k]) ?? "—" : "—"}</td>`).join("")}</tr>`;
      }).join("");
      return deptRow + memberRows;
    }).join("") : staffNames.map((name) => {
      const row = rotaMap.get(name);
      return `<tr><td><strong>${name}</strong></td>${DAY_KEYS.map((k) => `<td>${row ? shiftLabel(row[k]) ?? "—" : "—"}</td>`).join("")}</tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Weekly Rota</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:center}th{background:#f5f5f5;font-weight:600}td:first-child{text-align:left}</style></head><body><h1>Weekly Rota — w/c ${fmtDate(isoDate(weekStart))}</h1><table><thead>${header}</thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  };
  const dayDates = DAYS.map((_, i) => addDays(weekStart, i));
  const todayStr = isoDate(/* @__PURE__ */ new Date());
  const weekContainsToday = dayDates.some((d) => isoDate(d) === todayStr);
  const todayDayIndex = dayDates.findIndex((d) => isoDate(d) === todayStr);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: prevWeek, className: "p-1.5 rounded hover:bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-800 min-w-[200px] text-center", children: [
        "w/c ",
        fmtDate(isoDate(weekStart)),
        " – ",
        fmtDate(isoDate(addDays(weekStart, 6)))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextWeek, className: "p-1.5 rounded hover:bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: goToday, children: "Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-600 flex items-center gap-1 ml-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
        "Auto-saved"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printRota, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
        " Print Rota"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3 text-xs", children: SHIFT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-sm inline-block", style: { background: s.color } }),
      s.label
    ] }, s.value)) }),
    staffNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: "No staff found. Add staff members first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-auto bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[700px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-semibold text-gray-700 min-w-[160px] sticky left-0 bg-gray-50", children: "Staff Member" }),
        DAYS.map((day, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "px-2 py-2.5 text-center font-medium text-gray-600 min-w-[110px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: day }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 font-normal", children: [
            dayDates[i].getDate(),
            "/",
            dayDates[i].getMonth() + 1
          ] })
        ] }, day))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: (() => {
        const renderStaffRow = (name) => {
          const row = rotaMap.get(name);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: name }),
              weekContainsToday && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  title: "Log today's actual attendance",
                  className: "text-gray-300 hover:text-amber-500 transition-colors",
                  onClick: () => {
                    const planned = todayDayIndex >= 0 ? row?.[DAY_KEYS[todayDayIndex]] ?? null : null;
                    setQuickLog({ staffName: name, date: todayStr, planned });
                    setQlStatus("absent_sick");
                    setQlNotes("");
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 13 })
                }
              )
            ] }) }),
            DAY_KEYS.map((dayKey) => {
              const val = row?.[dayKey] ?? null;
              const key = `${name}-${dayKey}`;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: val ?? "none", onValueChange: (v) => setShift(name, dayKey, v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectTrigger,
                  {
                    className: "h-8 text-xs justify-center border-0 shadow-none focus:ring-0",
                    style: { background: val ? shiftColor(val) + "22" : "#f9fafb", color: val ? shiftColor(val) : "#9ca3af", fontWeight: val ? 600 : 400 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { children: saving[key] ? "…" : shiftLabel(val) })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "— Clear —" }),
                  SHIFT_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
                ] })
              ] }) }, dayKey);
            })
          ] }, name);
        };
        if (!hasDepartments) return staffNames.map(renderStaffRow);
        return deptGroups.map(({ dept, colour, names }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              colSpan: DAYS.length + 1,
              className: "px-4 py-1.5 bg-gray-50 border-t-2 border-gray-200 sticky left-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-xs font-semibold text-gray-500 uppercase tracking-widest",
                  style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 },
                  children: dept ?? "No department"
                }
              )
            }
          ) }),
          names.map(renderStaffRow)
        ] }, dept ?? "__none__"));
      })() })
    ] }) }),
    pendingHolidayLog && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setPendingHolidayLog(null);
        logAbsenceMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log against annual leave?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
        "Count ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtDate(pendingHolidayLog.date) }),
        " as 1 day of annual leave for",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: pendingHolidayLog.staffName }),
        "? This will deduct from their leave entitlement balance."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: logAbsenceMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4 gap-2 flex-col sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPendingHolidayLog(null), className: "sm:order-first", children: "Just mark rota" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => logAbsenceMut.mutate({
              staffName: pendingHolidayLog.staffName,
              absenceType: "Annual Leave",
              startDate: pendingHolidayLog.date,
              endDate: pendingHolidayLog.date,
              daysCount: "1",
              status: "approved",
              notes: "Logged from rota grid"
            }),
            disabled: logAbsenceMut.isPending,
            children: logAbsenceMut.isPending ? "Saving…" : "Yes — log annual leave"
          }
        )
      ] })
    ] }) }),
    quickLog && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setQuickLog(null);
        logAttMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log today's attendance" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Recording actual attendance for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: quickLog.staffName }),
          " — ",
          fmtDate(quickLog.date)
        ] }),
        quickLog.planned && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2", children: [
          "Planned on rota: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: SHIFT_TYPES.find((s) => s.value === quickLog.planned)?.label ?? quickLog.planned })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Actual status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: qlStatus, onValueChange: setQlStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "present", children: "Present ✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "absent_sick", children: "Absent – Sick" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "absent_holiday", children: "Absent – Holiday" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "absent_unauthorised", children: "Absent – Unauthorised" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "late", children: "Late" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "left_early", children: "Left Early" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "day_off", children: "Day Off" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: qlNotes, onChange: (e) => setQlNotes(e.target.value), placeholder: "e.g. phoned in at 07:30, feeling unwell" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: logAttMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setQuickLog(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => logAttMut.mutate({ staffName: quickLog.staffName, date: quickLog.date, actualStatus: qlStatus, plannedShift: quickLog.planned, notes: qlNotes || null }),
            disabled: logAttMut.isPending,
            children: logAttMut.isPending ? "Saving…" : "Save"
          }
        )
      ] })
    ] }) })
  ] });
}
function AbsenceTab({ farmId, staffNames, onPendingCount, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useSafeUser();
  const managerName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.primaryEmailAddress?.emailAddress || "Manager" : "Manager";
  const thisYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "labour-absence", filter: "year", farmId, defaultValue: String(thisYear) });
  const [staffFilter, setStaffFilter] = usePersistedFilter({ page: "labour-absence", filter: "staff", farmId, defaultValue: "all" });
  const [typeFilter, setTypeFilter] = usePersistedFilter({ page: "labour-absence", filter: "type", farmId, defaultValue: "all" });
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [viewAbsence, setViewAbsence] = reactExports.useState(null);
  const [entEditOpen, setEntEditOpen] = reactExports.useState(false);
  const [entEditTarget, setEntEditTarget] = reactExports.useState(null);
  const [entEditDays, setEntEditDays] = reactExports.useState("");
  const [entEditCarried, setEntEditCarried] = reactExports.useState("");
  const [declineTarget, setDeclineTarget] = reactExports.useState(null);
  const [declineReason, setDeclineReason] = reactExports.useState("");
  const [overrideExceeded, setOverrideExceeded] = reactExports.useState(false);
  const [rotaFillTarget, setRotaFillTarget] = reactExports.useState(null);
  const [fillingRota, setFillingRota] = reactExports.useState(false);
  const [approvalTarget, setApprovalTarget] = reactExports.useState(null);
  const [plannerView, setPlannerView] = reactExports.useState(false);
  const [plannerYM, setPlannerYM] = reactExports.useState(() => {
    const n = /* @__PURE__ */ new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const emptyForm = () => ({ staffName: "", absenceType: "Annual Leave", startDate: "", endDate: "", daysCount: "", notes: "", approvedBy: "", status: "approved" });
  const [form, setForm] = reactExports.useState(emptyForm());
  const sf = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data: absenceFarmData } = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const absenceFarmName = absenceFarmData?.record?.name ?? "";
  const absRotaQ = useQuery({
    queryKey: ["labour-rota", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rota`).then((r) => r.json()),
    enabled: !!farmId && plannerView
  });
  const printBlankLeaveForm = () => {
    const printed = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const leaveTypes = ["Annual Leave", "Compassionate Leave", "Maternity / Paternity Leave", "Unpaid Leave", "Training Day", "TOIL (Time Off in Lieu)", "Other (specify below)"];
    const checkboxes = leaveTypes.map((t) => `
      <div class="cb-row"><span class="cb"></span><span class="cb-label">${t}</span></div>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Leave Request Form — BDE Farm Trac</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;margin:0;padding:18px 22px;color:#111}
  .header{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #166534;padding-bottom:9px;margin-bottom:14px}
  .brand{font-size:20px;font-weight:700;color:#166534;letter-spacing:-0.3px}
  .brand-sub{font-size:9.5px;color:#4b7c5e;margin-top:1px}
  .doc-title{font-size:15px;font-weight:700;color:#111;text-align:right}
  .doc-ref{font-size:9.5px;color:#888;text-align:right;margin-top:2px}
  .section{margin-bottom:14px}
  .section-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#166534;margin-bottom:7px;padding-bottom:3px;border-bottom:1px solid #bbf7d0}
  .field-grid{display:grid;gap:9px 18px}
  .field-grid-2{grid-template-columns:1fr 1fr}
  .field-grid-3{grid-template-columns:1fr 1fr 1fr}
  .field label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;display:block;margin-bottom:3px}
  .field .line{border-bottom:1.5px solid #333;min-height:22px;padding-bottom:3px}
  .field .box{border:1px solid #333;min-height:56px;border-radius:2px;padding:4px}
  .cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-top:4px}
  .cb-row{display:flex;align-items:center;gap:8px}
  .cb{display:inline-block;width:14px;height:14px;border:1.5px solid #333;border-radius:2px;flex-shrink:0}
  .cb-label{font-size:10.5px;color:#222}
  .date-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px 18px;margin-top:8px}
  .info-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:3px;padding:7px 10px;font-size:9.5px;color:#14532d;line-height:1.55;margin-bottom:14px}
  .decision-box{border:2px solid #333;border-radius:3px;padding:10px 12px;margin-bottom:14px}
  .decision-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#111;margin-bottom:8px}
  .decision-row{display:flex;gap:32px;margin-bottom:10px}
  .decision-opt{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700}
  .decision-cb{display:inline-block;width:18px;height:18px;border:2px solid #333;border-radius:2px;flex-shrink:0}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px 18px;margin-top:8px}
  .footer-note{margin-top:14px;border-top:1px solid #ddd;padding-top:7px;font-size:9px;color:#666;text-align:center}
  @media print{body{padding:12px 16px}@page{size:A4 portrait;margin:9mm}}
</style>
</head><body>

<div class="header">
  <div>
    <div class="brand">BDE Farm Trac</div>
    <div class="brand-sub">Barnett Davies Enterprises Ltd · bdefarmtrac.co.uk</div>
  </div>
  <div>
    <div class="doc-title">Leave / Holiday Request Form</div>
    <div class="doc-ref">Form FT-LR-01 &nbsp;|&nbsp; Printed: ${printed}</div>
  </div>
</div>

<div class="info-box">
  Complete this form and hand it to your manager. For staff with app access, you can also submit requests digitally via the <strong>BDE Farm Trac mobile app</strong> — your manager will receive an instant notification and you will receive a text message when the request is actioned.
</div>

<div class="section">
  <div class="section-title">Employee Details</div>
  <div class="field-grid field-grid-3">
    <div class="field"><label>Full Name</label><div class="line"></div></div>
    <div class="field"><label>Farm / Business</label><div class="line">${absenceFarmName}</div></div>
    <div class="field"><label>Date of Request</label><div class="line"></div></div>
    <div class="field"><label>Job Title / Role</label><div class="line"></div></div>
    <div class="field"><label>Department / Team</label><div class="line"></div></div>
    <div class="field"><label>Line Manager</label><div class="line"></div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Type of Leave Requested <span style="font-weight:400;font-size:9px;text-transform:none;letter-spacing:0">(tick one)</span></div>
  <div class="cb-grid">${checkboxes}</div>
  <div style="margin-top:8px" class="field"><label>If "Other" — please specify</label><div class="line"></div></div>
</div>

<div class="section">
  <div class="section-title">Dates &amp; Duration</div>
  <div class="date-grid">
    <div class="field"><label>First Day of Leave</label><div class="line"></div></div>
    <div class="field"><label>Last Day of Leave</label><div class="line"></div></div>
    <div class="field"><label>Total Days Requested</label><div class="line"></div></div>
  </div>
  <div style="margin-top:10px" class="field"><label>Is any of this leave unpaid? &nbsp; &nbsp;Yes &nbsp;/&nbsp; No (circle)</label><div class="line" style="min-height:18px"></div></div>
</div>

<div class="section">
  <div class="section-title">Additional Information / Reason <span style="font-weight:400;font-size:9px;text-transform:none;letter-spacing:0">(optional — may be required for compassionate / unpaid leave)</span></div>
  <div class="field"><div class="box" style="min-height:52px"></div></div>
</div>

<div class="section">
  <div class="section-title">Employee Declaration</div>
  <p style="font-size:10px;color:#333;margin:0 0 8px">I confirm that the information above is accurate and that I have sufficient annual leave entitlement remaining to cover this request (or I understand this request may be taken as unpaid leave).</p>
  <div class="sig-grid">
    <div class="field"><label>Employee Signature</label><div class="line" style="min-height:32px"></div></div>
    <div class="field"><label>Print Name</label><div class="line" style="min-height:32px"></div></div>
    <div class="field"><label>Date Signed</label><div class="line" style="min-height:32px"></div></div>
  </div>
</div>

<div class="decision-box">
  <div class="decision-title">For Manager Use Only</div>
  <div class="decision-row">
    <div class="decision-opt"><div class="decision-cb"></div> APPROVED</div>
    <div class="decision-opt"><div class="decision-cb"></div> DECLINED</div>
    <div class="decision-opt"><div class="decision-cb"></div> APPROVED (part) — see notes</div>
  </div>
  <div class="field-grid field-grid-2" style="margin-bottom:8px">
    <div class="field"><label>If declined / part-approved — reason</label><div class="box" style="min-height:40px"></div></div>
    <div class="field"><label>Leave balance remaining after this request</label><div class="line" style="margin-top:28px"></div></div>
  </div>
  <div class="sig-grid">
    <div class="field"><label>Manager Name</label><div class="line" style="min-height:32px"></div></div>
    <div class="field"><label>Manager Signature</label><div class="line" style="min-height:32px"></div></div>
    <div class="field"><label>Date</label><div class="line" style="min-height:32px"></div></div>
  </div>
  <p style="font-size:9px;color:#555;margin:8px 0 0">Once signed by the manager, please return a copy to the employee and retain the original for payroll / HR records. Log this absence in BDE Farm Trac (Labour → Holiday &amp; Absence) to keep the digital record up to date.</p>
</div>

<div class="footer-note">BDE Farm Trac — Barnett Davies Enterprises Ltd · Confidential HR Document · Form FT-LR-01 · bdefarmtrac.co.uk</div>
</body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }, 400);
  };
  const absQ = useQuery({
    queryKey: ["labour-absences", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/absences`).then((r) => r.json()),
    enabled: !!farmId
  });
  const entQ = useQuery({
    queryKey: ["labour-entitlements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/entitlements`).then((r) => r.json()),
    enabled: !!farmId
  });
  const addMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/absences`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Absence recorded" });
      qc.invalidateQueries({ queryKey: ["labour-absences", farmId] });
      setAddOpen(false);
      setEditItem(null);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const editMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/labour/absences/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Absence updated" });
      qc.invalidateQueries({ queryKey: ["labour-absences", farmId] });
      setAddOpen(false);
      setEditItem(null);
      setForm(emptyForm());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/labour/absences/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Deleted" });
      qc.invalidateQueries({ queryKey: ["labour-absences", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const approveMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/labour/absences/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["labour-absences", farmId] });
      toast({ title: "Leave request approved" });
      if (approvalTarget?.absenceType === "Annual Leave") setRotaFillTarget(approvalTarget);
      setApprovalTarget(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const addEntMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/entitlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Entitlement set" });
      qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const editEntMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/labour/entitlements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Entitlement updated" });
      qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const openEdit = (a) => {
    setForm({ staffName: a.staffName, absenceType: a.absenceType, startDate: a.startDate, endDate: a.endDate, daysCount: a.daysCount ?? "", notes: a.notes ?? "", approvedBy: a.approvedBy ?? "", status: a.status });
    setEditItem(a);
    setAddOpen(true);
  };
  const autoCalcDays = (start, end) => {
    if (!start || !end) return "";
    const s = /* @__PURE__ */ new Date(start + "T00:00:00"), e = /* @__PURE__ */ new Date(end + "T00:00:00");
    const diff = Math.round((e.getTime() - s.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
    return diff > 0 ? String(diff) : "";
  };
  const save = () => {
    const autoApprovedBy = form.status === "approved" || form.status === "declined" ? managerName : null;
    const body = { ...form, daysCount: form.daysCount || autoCalcDays(form.startDate, form.endDate), approvedBy: autoApprovedBy };
    if (editItem) editMut.mutate({ id: editItem.id, body });
    else addMut.mutate(body);
  };
  const absences = absQ.data?.absences ?? [];
  const entitlements = entQ.data?.entitlements ?? [];
  const yearInt = parseInt(yearFilter);
  const pendingAbsences = reactExports.useMemo(() => absences.filter((a) => a.status === "pending"), [absences]);
  reactExports.useEffect(() => {
    onPendingCount?.(pendingAbsences.length);
  }, [pendingAbsences.length, onPendingCount]);
  const filtered = absences.filter((a) => {
    if (staffFilter !== "all" && a.staffName !== staffFilter) return false;
    if (typeFilter !== "all" && a.absenceType !== typeFilter) return false;
    if (yearFilter && !a.startDate.startsWith(yearFilter)) return false;
    return true;
  });
  const leaveSummary = reactExports.useMemo(() => {
    return staffNames.map((name) => {
      const ent = entitlements.find((e) => e.staffName === name && e.year === yearInt);
      const taken = absences.filter((a) => a.staffName === name && a.absenceType === "Annual Leave" && a.startDate.startsWith(yearFilter)).reduce((s, a) => s + parseFloat(a.daysCount ?? "0"), 0);
      const entDays = parseFloat(ent?.entitlementDays ?? "28") + parseFloat(ent?.carriedOverDays ?? "0");
      return { name, entDays, taken, remaining: entDays - taken, ent };
    });
  }, [staffNames, entitlements, absences, yearFilter, yearInt]);
  const entitlementWarn = reactExports.useMemo(() => {
    if (form.absenceType !== "Annual Leave" || !form.staffName || !form.daysCount) return null;
    const year = form.startDate ? parseInt(form.startDate.slice(0, 4)) : yearInt;
    const ent = entitlements.find((e) => e.staffName === form.staffName && e.year === year);
    const entDays = parseFloat(ent?.entitlementDays ?? "28") + parseFloat(ent?.carriedOverDays ?? "0");
    const takenSoFar = absences.filter(
      (a) => a.staffName === form.staffName && a.absenceType === "Annual Leave" && a.startDate.startsWith(String(year)) && a.status !== "declined" && (!editItem || a.id !== editItem.id)
    ).reduce((s, a) => s + parseFloat(a.daysCount ?? "0"), 0);
    const requesting = parseFloat(form.daysCount) || 0;
    const remaining = entDays - takenSoFar - requesting;
    return { entDays, takenSoFar, requesting, remaining, exceeded: remaining < 0 };
  }, [form.absenceType, form.staffName, form.daysCount, form.startDate, entitlements, absences, yearInt, editItem]);
  reactExports.useEffect(() => {
    setOverrideExceeded(false);
  }, [form.staffName, form.startDate, form.endDate, form.daysCount, form.absenceType]);
  const fillRota = async (absence) => {
    setFillingRota(true);
    try {
      const rotaRes = await fetch(`/api/farms/${farmId}/labour/rota`).then((r) => r.json());
      const allRota = rotaRes.rota ?? [];
      const start = /* @__PURE__ */ new Date(absence.startDate + "T00:00:00");
      const end = /* @__PURE__ */ new Date(absence.endDate + "T00:00:00");
      const byWeek = {};
      const cur = new Date(start);
      while (cur <= end) {
        const mon = getMondayOfWeek(new Date(cur));
        const weekKey = isoDate(mon);
        const dow = cur.getDay();
        const dayIndex = dow === 0 ? 6 : dow - 1;
        if (!byWeek[weekKey]) byWeek[weekKey] = [];
        byWeek[weekKey].push(DAY_KEYS[dayIndex]);
        cur.setDate(cur.getDate() + 1);
      }
      for (const [weekStart, dayKeys] of Object.entries(byWeek)) {
        const existing = allRota.find((r) => r.staffName === absence.staffName && r.weekStartDate === weekStart);
        if (existing) {
          const update = { ...existing };
          for (const dk of dayKeys) update[dk] = "holiday";
          await fetch(`/api/farms/${farmId}/labour/rota/${existing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
        } else {
          const body = { weekStartDate: weekStart, staffName: absence.staffName };
          for (const dk of dayKeys) body[dk] = "holiday";
          await fetch(`/api/farms/${farmId}/labour/rota`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
        }
      }
      qc.invalidateQueries({ queryKey: ["labour-rota", farmId] });
      toast({ title: "Rota updated — holiday days marked" });
      setRotaFillTarget(null);
    } catch {
      toast({ title: "Error updating rota", variant: "destructive" });
    } finally {
      setFillingRota(false);
    }
  };
  const statusBadge = (status) => {
    if (status === "approved") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-50 text-green-700 border-green-200", children: "Approved" });
    if (status === "pending") return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-amber-50 text-amber-700 border-amber-200", children: "Pending" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-gray-100 text-gray-500", children: "Declined" });
  };
  const years = [thisYear + 1, thisYear, thisYear - 1, thisYear - 2];
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    pendingAbsences.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-amber-200 rounded-xl overflow-hidden bg-amber-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2.5 bg-amber-100 border-b border-amber-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-amber-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-amber-800", children: [
          "Pending Leave Request",
          pendingAbsences.length !== 1 ? "s" : "",
          " — ",
          pendingAbsences.length,
          " awaiting approval"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-amber-100", children: pendingAbsences.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-gray-800", children: a.staffName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${a.absenceType === "Annual Leave" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`, children: a.absenceType })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-0.5", children: [
            fmtDate(a.startDate),
            a.startDate !== a.endDate ? ` — ${fmtDate(a.endDate)}` : "",
            a.daysCount ? ` · ${a.daysCount} day${a.daysCount === "1" ? "" : "s"}` : ""
          ] }),
          a.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5 italic", children: a.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "h-7 text-xs bg-green-600 hover:bg-green-700 text-white",
              onClick: () => {
                setApprovalTarget(a);
                approveMut.mutate({ id: a.id, body: { staffName: a.staffName, absenceType: a.absenceType, startDate: a.startDate, endDate: a.endDate, daysCount: a.daysCount, notes: a.notes, status: "approved", approvedBy: managerName } });
              },
              disabled: approveMut.isPending,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12, className: "mr-1" }),
                " Approve"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-7 text-xs text-red-600 border-red-300 hover:bg-red-50",
              onClick: () => {
                setDeclineTarget(a);
                setDeclineReason("");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 12, className: "mr-1" }),
                " Decline"
              ]
            }
          )
        ] })
      ] }, a.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800 text-sm", children: "Annual Leave Entitlement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: (() => {
        const renderCard = ({ name, entDays, taken, remaining, ent }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-3 bg-white space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 truncate", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Entitlement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-800", children: [
              entDays,
              " days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-800", children: [
              taken.toFixed(1),
              " days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${remaining < 0 ? "text-red-600" : remaining <= 5 ? "text-amber-600" : "text-green-700"}`, children: [
              remaining.toFixed(1),
              " days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-gray-100 rounded-full mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-green-500", style: { width: `${Math.min(100, taken / entDays * 100)}%`, background: taken > entDays ? "#dc2626" : "#16a34a" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "text-xs text-blue-600 underline mt-0.5",
              onClick: () => {
                setEntEditTarget({ name, year: yearInt, ent });
                setEntEditDays(String(parseFloat(ent?.entitlementDays ?? "28")));
                setEntEditCarried(String(parseFloat(ent?.carriedOverDays ?? "0")));
                setEntEditOpen(true);
              },
              children: "Edit entitlement"
            }
          )
        ] }, name);
        if (!hasDepartments) return leaveSummary.map(renderCard);
        return deptGroups.map(({ dept, colour, names }) => {
          const group = leaveSummary.filter((s) => names.includes(s.name));
          if (!group.length) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest", style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 }, children: dept ?? "No department" }) }),
            group.map(renderCard)
          ] }, dept ?? "__none__");
        });
      })() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border overflow-hidden text-sm font-medium shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `px-3 py-1.5 flex items-center gap-1.5 transition-colors ${!plannerView ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
            onClick: () => setPlannerView(false),
            children: "List"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: `px-3 py-1.5 flex items-center gap-1.5 border-l transition-colors ${plannerView ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
            onClick: () => setPlannerView(true),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 13, className: "mr-0.5" }),
              " Planner"
            ]
          }
        )
      ] }),
      !plannerView && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: staffFilter, onValueChange: setStaffFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All staff" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All staff" }),
            staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All types" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All absence types" }),
            ABSENCE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printBlankLeaveForm, title: "Print a blank paper leave request form for staff without system or mobile access", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
            " Blank Leave Form"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setForm(emptyForm());
            setEditItem(null);
            setAddOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
            " Record Absence"
          ] })
        ] })
      ] }),
      plannerView && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "p-1.5 rounded hover:bg-gray-100 text-gray-600 border",
            onClick: () => setPlannerYM((ym) => {
              const m = ym.month - 1;
              return m < 0 ? { year: ym.year - 1, month: 11 } : { year: ym.year, month: m };
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 15 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-gray-800 min-w-[120px] text-center", children: new Date(plannerYM.year, plannerYM.month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "p-1.5 rounded hover:bg-gray-100 text-gray-600 border",
            onClick: () => setPlannerYM((ym) => {
              const m = ym.month + 1;
              return m > 11 ? { year: ym.year + 1, month: 0 } : { year: ym.year, month: m };
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 15 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "text-xs h-8 ml-1",
            onClick: () => {
              const n = /* @__PURE__ */ new Date();
              setPlannerYM({ year: n.getFullYear(), month: n.getMonth() });
            },
            children: "Today"
          }
        )
      ] })
    ] }),
    !plannerView && (absQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UmbrellaOff, { className: "w-10 h-10 mx-auto mb-2 opacity-25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: absences.length === 0 ? "No absences recorded yet." : "No absences match the current filters." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide", children: ["Staff Member", "Type", "From", "To", "Days", "Approved By", "Status", "Notes", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-semibold", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filtered.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setViewAbsence(a), className: "cursor-pointer hover:bg-gray-50/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: a.staffName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${a.absenceType === "Annual Leave" ? "bg-blue-50 text-blue-700" : a.absenceType === "Sickness" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`, children: a.absenceType }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap", children: fmtDate(a.startDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap", children: fmtDate(a.endDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-mono text-center", children: a.daysCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-gray-500 text-xs", children: a.approvedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: statusBadge(a.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-gray-400 text-xs max-w-[160px] truncate", children: a.notes || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", onClick: (ev) => ev.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewAbsence(a), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(a), className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delMut.mutate(a.id), className: "text-gray-400 hover:text-red-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
        ] }) })
      ] }, a.id)) })
    ] }) })),
    plannerView && (() => {
      const { year, month } = plannerYM;
      const dim = new Date(year, month + 1, 0).getDate();
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const threshold = Math.max(2, Math.ceil(staffNames.length * 0.4));
      const days = Array.from({ length: dim }, (_, i) => i + 1);
      const getDow = (d) => new Date(year, month, d).getDay();
      const isWeekend = (d) => {
        const dw = getDow(d);
        return dw === 0 || dw === 6;
      };
      const dayStr = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = (d) => dayStr(d) === todayStr;
      const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
      const absMap = /* @__PURE__ */ new Map();
      for (const name of staffNames) absMap.set(name, Array(dim).fill(null));
      for (const a of absences) {
        if (!a.startDate || !a.endDate) continue;
        const s = /* @__PURE__ */ new Date(a.startDate + "T00:00:00");
        const e = /* @__PURE__ */ new Date(a.endDate + "T00:00:00");
        for (let d = 1; d <= dim; d++) {
          const cd = new Date(year, month, d);
          if (cd >= s && cd <= e) {
            const row = absMap.get(a.staffName);
            if (row && !row[d - 1]) row[d - 1] = a;
          }
        }
      }
      const rotaHolidaySet = /* @__PURE__ */ new Map();
      for (const name of staffNames) rotaHolidaySet.set(name, /* @__PURE__ */ new Set());
      const ROTA_COLS = ["monShift", "tueShift", "wedShift", "thuShift", "friShift", "satShift", "sunShift"];
      for (const entry of absRotaQ.data?.rota ?? []) {
        const wkStart = /* @__PURE__ */ new Date(entry.weekStartDate + "T00:00:00");
        for (let offset = 0; offset < 7; offset++) {
          const col = ROTA_COLS[offset];
          if (entry[col] !== "holiday") continue;
          const cd = new Date(wkStart);
          cd.setDate(cd.getDate() + offset);
          if (cd.getFullYear() === year && cd.getMonth() === month) {
            const ds = dayStr(cd.getDate());
            const absRow = absMap.get(entry.staffName);
            if (!absRow?.[cd.getDate() - 1]) rotaHolidaySet.get(entry.staffName)?.add(ds);
          }
        }
      }
      const counts = days.map((d) => {
        let c = 0;
        for (const n of staffNames) {
          if (absMap.get(n)?.[d - 1] || rotaHolidaySet.get(n)?.has(dayStr(d))) c++;
        }
        return c;
      });
      const cellBg = (a, rotaHol, wknd) => {
        if (rotaHol) return "bg-lime-300";
        if (!a) return wknd ? "bg-gray-100" : "";
        if (a.status === "pending") return "bg-amber-300";
        switch (a.absenceType) {
          case "Annual Leave":
            return "bg-green-500";
          case "Sickness":
            return "bg-red-400";
          case "Compassionate Leave":
            return "bg-purple-400";
          case "Maternity / Paternity Leave":
            return "bg-pink-400";
          case "TOIL (Time Off in Lieu)":
            return "bg-teal-400";
          case "Training Day":
            return "bg-sky-400";
          default:
            return "bg-blue-400";
        }
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 bg-gray-50 border-b text-xs text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700 mr-1", children: "Key:" }),
          [
            { cls: "bg-green-500", label: "Annual Leave" },
            { cls: "bg-red-400", label: "Sickness" },
            { cls: "bg-purple-400", label: "Compassionate" },
            { cls: "bg-pink-400", label: "Mat/Pat" },
            { cls: "bg-sky-400", label: "Training" },
            { cls: "bg-teal-400", label: "TOIL" },
            { cls: "bg-blue-400", label: "Other" },
            { cls: "bg-amber-300", label: "Pending" },
            { cls: "bg-lime-300", label: "Rota only (unlogged)" },
            { cls: "bg-gray-100 border border-gray-300", label: "Weekend" }
          ].map(({ cls, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-3 h-3 rounded-sm ${cls}` }),
            label
          ] }, label)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto flex items-center gap-1 text-red-600 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
            " Red = scheduling conflict"
          ] })
        ] }),
        staffNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-gray-400 text-sm", children: "No staff members found. Add staff in the Rota tab first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "border-collapse", style: { minWidth: "max-content" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "sticky left-0 z-10 bg-gray-50 border-b border-r px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap", style: { minWidth: 140 }, children: "Staff Member" }),
            days.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "th",
              {
                className: `border-b border-r px-0 py-1.5 text-center ${isWeekend(d) ? "bg-gray-100 text-gray-400" : "bg-gray-50 text-gray-600"} ${isToday(d) ? "ring-2 ring-inset ring-blue-400" : ""}`,
                style: { minWidth: 30, width: 30 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold leading-none", children: d }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] leading-none mt-0.5 font-normal opacity-75", children: DOW[getDow(d)] })
                ]
              },
              d
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "border-b bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500 whitespace-nowrap text-center", children: "Off" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            staffNames.map((name) => {
              const row = absMap.get(name) ?? [];
              const total = row.filter(Boolean).length + (rotaHolidaySet.get(name)?.size ?? 0);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "sticky left-0 z-10 bg-white border-r px-3 py-0 text-xs font-medium text-gray-800 whitespace-nowrap", style: { height: 30 }, children: name }),
                days.map((d) => {
                  const a = row[d - 1];
                  const rotaHol = !a && !!rotaHolidaySet.get(name)?.has(dayStr(d));
                  const wknd = isWeekend(d);
                  const today = isToday(d);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      title: a ? `${a.absenceType}${a.status === "pending" ? " (pending)" : ""}${a.notes ? ` · ${a.notes}` : ""}` : rotaHol ? "Holiday on rota — no absence record logged. Click to log now." : void 0,
                      className: `border-r last:border-r-0 ${cellBg(a, rotaHol, wknd)} ${today ? "outline outline-2 outline-blue-400 outline-offset-[-2px]" : ""} ${rotaHol ? "cursor-pointer hover:brightness-90 active:brightness-75" : ""}`,
                      style: { width: 30, height: 30 },
                      onClick: rotaHol ? () => {
                        setForm({ ...emptyForm(), staffName: name, startDate: dayStr(d), endDate: dayStr(d), daysCount: "1", absenceType: "Annual Leave" });
                        setEditItem(null);
                        setAddOpen(true);
                      } : void 0
                    },
                    d
                  );
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 text-center text-xs text-gray-500 font-medium", children: total || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) })
              ] }, name);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-t-2 border-gray-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "sticky left-0 z-10 bg-gray-50 border-r px-3 py-1.5 text-xs font-bold text-gray-600 whitespace-nowrap", children: "Staff off" }),
              days.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: `border-r last:border-r-0 text-center text-xs font-bold ${counts[i] === 0 ? "text-gray-200" : counts[i] >= threshold ? "bg-red-50 text-red-600" : "text-gray-600"}`,
                  style: { height: 28 },
                  children: counts[i] || ""
                },
                d
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
            ] })
          ] })
        ] }) })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditItem(null);
        setForm(emptyForm());
        addMut.reset();
        editMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Absence" : "Record Absence" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.staffName, onValueChange: (v) => sf("staffName", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Absence Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.absenceType, onValueChange: (v) => sf("absenceType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ABSENCE_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.startDate, onChange: (e) => {
              sf("startDate", e.target.value);
              if (!form.daysCount) sf("daysCount", autoCalcDays(e.target.value, form.endDate));
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.endDate, onChange: (e) => {
              sf("endDate", e.target.value);
              sf("daysCount", autoCalcDays(form.startDate, e.target.value));
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Days Count" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0.5", step: "0.5", className: "mt-1", value: form.daysCount, onChange: (e) => sf("daysCount", e.target.value), placeholder: "Auto-calculated" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => sf("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "declined", children: "Declined" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs text-gray-500 -mt-1", children: form.status === "approved" || form.status === "declined" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Will be recorded as approved/declined by ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: managerName })
          ] }) : editItem?.approvedBy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Previously actioned by ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: editItem.approvedBy }),
            " — cleared on save as status is now Pending"
          ] }) : null }),
          entitlementWarn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `col-span-2 rounded-lg border p-3 text-xs space-y-1.5 ${entitlementWarn.exceeded ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: entitlementWarn.exceeded ? "⚠ Entitlement exceeded" : "✓ Entitlement check" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Annual entitlement" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                entitlementWarn.entDays,
                " days"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Already taken / pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                entitlementWarn.takenSoFar.toFixed(1),
                " days"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This request" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                entitlementWarn.requesting,
                " days"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold border-t border-current/20 pt-1.5 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remaining after" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: entitlementWarn.exceeded ? "text-red-700" : "text-green-700", children: [
                entitlementWarn.remaining.toFixed(1),
                " days"
              ] })
            ] }),
            entitlementWarn.exceeded && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 mt-2 cursor-pointer select-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: overrideExceeded, onChange: (e) => setOverrideExceeded(e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 font-medium", children: "Approve anyway — override entitlement limit" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-ring", value: form.notes, onChange: (e) => sf("notes", e.target.value), placeholder: "Optional details…" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setAddOpen(false);
            setEditItem(null);
            setForm(emptyForm());
            setOverrideExceeded(false);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: save,
              disabled: !form.staffName || !form.startDate || !form.endDate || addMut.isPending || editMut.isPending || !!entitlementWarn?.exceeded && !overrideExceeded,
              title: entitlementWarn?.exceeded && !overrideExceeded ? "Entitlement exceeded — tick the override checkbox to proceed" : void 0,
              children: editItem ? "Update" : "Record Absence"
            }
          )
        ] })
      ] })
    ] }) }),
    viewAbsence && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewAbsence(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Absence — ",
        viewAbsence.staffName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAbsence.staffName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${viewAbsence.absenceType === "Annual Leave" ? "bg-blue-50 text-blue-700" : viewAbsence.absenceType === "Sickness" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`, children: viewAbsence.absenceType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewAbsence.startDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewAbsence.endDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Days" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewAbsence.daysCount ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          statusBadge(viewAbsence.status)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Approved By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAbsence.approvedBy || "—" })
        ] }),
        viewAbsence.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewAbsence.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewAbsence);
          setViewAbsence(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewAbsence(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!declineTarget, onOpenChange: (o) => {
      if (!o) {
        setDeclineTarget(null);
        editMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Decline Leave Request" }) }),
      declineTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Declining ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: declineTarget.absenceType }),
          " for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: declineTarget.staffName }),
          " ",
          "(",
          fmtDate(declineTarget.startDate),
          declineTarget.startDate !== declineTarget.endDate ? ` — ${fmtDate(declineTarget.endDate)}` : "",
          "). The staff member will receive an SMS with the outcome."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Reason ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(optional — included in SMS)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "mt-1 w-full border rounded-md px-3 py-2 text-sm min-h-[70px] resize-y focus:outline-none focus:ring-2 focus:ring-ring",
              value: declineReason,
              onChange: (e) => setDeclineReason(e.target.value),
              placeholder: "e.g. Farm too short-staffed during harvest period — please re-request after September."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editMut, message: "Failed to decline — please try again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeclineTarget(null), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "destructive",
              disabled: editMut.isPending,
              onClick: () => {
                const notes = [declineTarget.notes, declineReason.trim()].filter(Boolean).join(" — Decline reason: ");
                editMut.mutate({
                  id: declineTarget.id,
                  body: { staffName: declineTarget.staffName, absenceType: declineTarget.absenceType, startDate: declineTarget.startDate, endDate: declineTarget.endDate, daysCount: declineTarget.daysCount, notes, status: "declined", approvedBy: managerName }
                });
                setDeclineTarget(null);
              },
              children: "Confirm Decline"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: entEditOpen, onOpenChange: (v) => {
      if (!v) {
        setEntEditOpen(false);
        editEntMut.reset();
        addEntMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Leave Entitlement" }) }),
      entEditTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          entEditTarget.name,
          " — ",
          entEditTarget.year
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Annual entitlement (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: "0",
              step: "0.5",
              className: "mt-1",
              value: entEditDays,
              onChange: (e) => setEntEditDays(e.target.value),
              autoFocus: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Carried over from previous year (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: "0",
              step: "0.5",
              className: "mt-1",
              value: entEditCarried,
              onChange: (e) => setEntEditCarried(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editEntMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addEntMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEntEditOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (!entEditTarget) return;
              const days = String(parseFloat(entEditDays) || 0);
              const carried = String(parseFloat(entEditCarried) || 0);
              const { ent, name, year } = entEditTarget;
              if (ent) {
                editEntMut.mutate({ id: ent.id, body: { entitlementDays: days, carriedOverDays: carried, wtrOptOut: ent.wtrOptOut } });
              } else {
                addEntMut.mutate({ staffName: name, year, entitlementDays: days, carriedOverDays: carried });
              }
              setEntEditOpen(false);
            },
            disabled: editEntMut.isPending || addEntMut.isPending,
            children: "Save"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rotaFillTarget, onOpenChange: (o) => {
      if (!o) setRotaFillTarget(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mark days on rota?" }) }),
      rotaFillTarget && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Would you like to mark ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            rotaFillTarget.daysCount,
            " day",
            rotaFillTarget.daysCount !== "1" ? "s" : ""
          ] }),
          " as Holiday on the weekly rota grid for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: rotaFillTarget.staffName }),
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2", children: [
          fmtDate(rotaFillTarget.startDate),
          rotaFillTarget.startDate !== rotaFillTarget.endDate ? ` — ${fmtDate(rotaFillTarget.endDate)}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Each day in that date range will be set to Holiday on the Rota & Shifts grid, including any future weeks." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRotaFillTarget(null), children: "Skip" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => rotaFillTarget && fillRota(rotaFillTarget), disabled: fillingRota, children: fillingRota ? "Updating rota…" : "Yes — mark rota" })
      ] })
    ] }) })
  ] });
}
const ACTUAL_OPTS = [
  { value: "present", label: "Present", color: "#16a34a" },
  { value: "absent_sick", label: "Absent – Sick", color: "#dc2626" },
  { value: "absent_holiday", label: "Absent – Holiday", color: "#f59e0b" },
  { value: "absent_unauthorised", label: "Absent – Unauthorised", color: "#7c3aed" },
  { value: "late", label: "Late", color: "#0891b2" },
  { value: "left_early", label: "Left Early", color: "#ea580c" },
  { value: "day_off", label: "Day Off", color: "#9ca3af" }
];
function ActualAttendanceTab({ farmId, staffNames, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = reactExports.useState(isoDate(/* @__PURE__ */ new Date()));
  const [showBradford, setShowBradford] = reactExports.useState(false);
  const [localStatus, setLocalStatus] = reactExports.useState({});
  const [localNotes, setLocalNotes] = reactExports.useState({});
  const [rowSaving, setRowSaving] = reactExports.useState({});
  const attQ = useQuery({
    queryKey: ["labour-actual-attendance", farmId, selectedDate],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/actual-attendance?from=${selectedDate}&to=${selectedDate}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const weekStartStr = reactExports.useMemo(() => isoDate(getMondayOfWeek(/* @__PURE__ */ new Date(selectedDate + "T00:00:00"))), [selectedDate]);
  const rotaQ = useQuery({
    queryKey: ["labour-rota", farmId, weekStartStr],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rota`).then((r) => r.json()),
    enabled: !!farmId
  });
  const yearFrom = reactExports.useMemo(() => isoDate(addDays(/* @__PURE__ */ new Date(), -364)), []);
  const yearTo = reactExports.useMemo(() => isoDate(/* @__PURE__ */ new Date()), []);
  const yearAttQ = useQuery({
    queryKey: ["labour-actual-attendance-year", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/actual-attendance?from=${yearFrom}&to=${yearTo}`).then((r) => r.json()),
    enabled: !!farmId && showBradford
  });
  const attMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    (attQ.data?.records ?? []).forEach((r) => m.set(r.staffName, r));
    return m;
  }, [attQ.data]);
  const rotaMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    (rotaQ.data?.rota ?? []).filter((r) => r.weekStartDate === weekStartStr).forEach((r) => m.set(r.staffName, r));
    return m;
  }, [rotaQ.data, weekStartStr]);
  const dowIndex = reactExports.useMemo(() => {
    const d = /* @__PURE__ */ new Date(selectedDate + "T00:00:00Z");
    const dow = d.getUTCDay();
    return dow === 0 ? 6 : dow - 1;
  }, [selectedDate]);
  const saveMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/actual-attendance`, {
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
      qc.invalidateQueries({ queryKey: ["labour-actual-attendance", farmId] });
      qc.invalidateQueries({ queryKey: ["labour-actual-attendance-year", farmId] });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const getStatus = (name) => localStatus[name] ?? attMap.get(name)?.actualStatus ?? "";
  const getNotes = (name) => localNotes[name] ?? attMap.get(name)?.notes ?? "";
  const getPlanned = (name) => {
    const row = rotaMap.get(name);
    return row ? row[DAY_KEYS[dowIndex]] ?? null : null;
  };
  const saveRow = async (name) => {
    setRowSaving((p) => ({ ...p, [name]: true }));
    try {
      const status = getStatus(name) || "present";
      await saveMut.mutateAsync({ staffName: name, date: selectedDate, actualStatus: status, plannedShift: getPlanned(name), notes: getNotes(name) || null });
      setLocalStatus((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
      setLocalNotes((p) => {
        const n = { ...p };
        delete n[name];
        return n;
      });
      toast({ title: `${name}: attendance saved` });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setRowSaving((p) => ({ ...p, [name]: false }));
    }
  };
  const confirmAllPresent = async () => {
    const toConfirm = staffNames.filter((name) => {
      const planned = getPlanned(name);
      return planned && !["day-off", "holiday", "sick"].includes(planned);
    });
    await Promise.all(toConfirm.map(
      (name) => saveMut.mutateAsync({ staffName: name, date: selectedDate, actualStatus: "present", plannedShift: getPlanned(name), notes: null })
    ));
    qc.invalidateQueries({ queryKey: ["labour-actual-attendance", farmId] });
    toast({ title: `${toConfirm.length} staff confirmed present` });
  };
  const bradfordData = reactExports.useMemo(() => {
    if (!yearAttQ.data) return null;
    const records = yearAttQ.data.records ?? [];
    return staffNames.map((name) => {
      const sickDates = records.filter((r) => r.staffName === name && r.actualStatus === "absent_sick").map((r) => r.date).sort();
      let spells = 0;
      let lastDate = null;
      for (const date of sickDates) {
        if (!lastDate) {
          spells++;
        } else {
          const diffDays = Math.round(((/* @__PURE__ */ new Date(date + "T00:00:00")).getTime() - (/* @__PURE__ */ new Date(lastDate + "T00:00:00")).getTime()) / 864e5);
          if (diffDays > 3) spells++;
        }
        lastDate = date;
      }
      const D = sickDates.length;
      const B = spells * spells * D;
      const risk = B >= 150 ? "critical" : B >= 100 ? "high" : B >= 36 ? "medium" : "low";
      return { name, spells, days: D, bradford: B, risk };
    }).sort((a, b) => b.bradford - a.bradford);
  }, [yearAttQ.data, staffNames]);
  const statusOpt = (s) => ACTUAL_OPTS.find((o) => o.value === s);
  const shiftLabel = (v) => SHIFT_TYPES.find((t) => t.value === v)?.label ?? "—";
  const today = isoDate(/* @__PURE__ */ new Date());
  const isFuture = selectedDate > today;
  const changeDate = (d) => {
    setSelectedDate(d);
    setLocalStatus({});
    setLocalNotes({});
  };
  const prevDay = () => {
    const d = /* @__PURE__ */ new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    changeDate(isoDate(d));
  };
  const nextDay = () => {
    const d = /* @__PURE__ */ new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    changeDate(isoDate(d));
  };
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: prevDay, className: "p-1.5 rounded hover:bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-800 min-w-[130px] text-center", children: fmtDate(selectedDate) }),
        selectedDate === today && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5 font-medium", children: "Today" }),
        isFuture && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 font-medium", children: "Future date" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextDay, className: "p-1.5 rounded hover:bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => changeDate(today), children: "Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "date",
          value: selectedDate,
          onChange: (e) => changeDate(e.target.value),
          className: "h-8 text-xs border rounded px-2 focus:outline-none focus:ring-1 focus:ring-green-500"
        }
      ),
      !isFuture && staffNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: confirmAllPresent,
          disabled: saveMut.isPending,
          className: "ml-auto text-green-700 border-green-300 hover:bg-green-50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "mr-1.5" }),
            "End-of-day: Confirm all present"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5 text-xs text-blue-700 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13, className: "mt-0.5 shrink-0 text-blue-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "This records ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "what actually happened" }),
        " — separate from the planned rota. Log exceptions as they occur (e.g. phone-in sick), then use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "End-of-day: Confirm all present" }),
        " to confirm everyone else came in as planned.",
        isFuture && " Actual attendance can only be recorded for today or past dates."
      ] })
    ] }),
    staffNames.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: "No staff found. Add staff members first." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-xl overflow-hidden bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-semibold text-gray-700 min-w-[150px]", children: "Staff Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium text-gray-500 min-w-[110px]", children: "Planned shift" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium text-gray-500 min-w-[200px]", children: "Actual status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-left font-medium text-gray-500 min-w-[200px]", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 text-right font-medium text-gray-500 w-24", children: "Save" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: (() => {
        const renderRow = (name) => {
          const rec = attMap.get(name);
          const planned = getPlanned(name);
          const cur = getStatus(name);
          const curNotes = getNotes(name);
          const isDirty = localStatus[name] !== void 0 || localNotes[name] !== void 0;
          const opt = statusOpt(cur);
          const shiftOpt = SHIFT_TYPES.find((s) => s.value === planned);
          const isDisc = !!rec && !!planned && !["day-off", "holiday", "sick"].includes(planned) && rec.actualStatus !== "present" && rec.actualStatus !== "late" && rec.actualStatus !== "left_early";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-gray-50/30 ${isDisc ? "bg-red-50/40" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium text-gray-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: name }),
              isDisc && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Discrepancy: planned shift ≠ actual", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12, className: "text-red-500 shrink-0" }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: planned ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap",
                style: { background: (shiftOpt?.color ?? "#9ca3af") + "22", color: shiftOpt?.color ?? "#9ca3af" },
                children: shiftLabel(planned)
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Not on rota" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: isFuture ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 italic", children: "Future date" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cur || "__none__", onValueChange: (v) => setLocalStatus((p) => ({ ...p, [name]: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs w-full", style: opt ? { borderColor: opt.color + "66" } : void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { children: opt ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: opt.color, fontWeight: 600 }, children: opt.label }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "— Select status —" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Clear —" }),
                ACTUAL_OPTS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value))
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: !isFuture && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                className: "h-8 text-xs",
                value: curNotes,
                onChange: (e) => setLocalNotes((p) => ({ ...p, [name]: e.target.value })),
                placeholder: "e.g. phoned in 07:30, COVID"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", children: !isFuture && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: isDirty ? "default" : "outline",
                className: "h-7 text-xs px-3",
                onClick: () => saveRow(name),
                disabled: rowSaving[name] || !cur && !isDirty,
                children: rowSaving[name] ? "…" : rec && !isDirty ? "✓ Saved" : "Save"
              }
            ) })
          ] }, name);
        };
        if (!hasDepartments) return staffNames.map(renderRow);
        return deptGroups.map(({ dept, colour, names }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-1.5 bg-gray-50 border-t-2 border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest", style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 }, children: dept ?? "No department" }) }) }),
          names.map(renderRow)
        ] }, dept ?? "__none__"));
      })() })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left",
          onClick: () => setShowBradford((v) => !v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, className: "text-amber-500" }),
              "Bradford Factor — rolling 52-week sickness analysis"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: showBradford ? "Hide ▲" : "Show ▼" })
          ]
        }
      ),
      showBradford && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-4 pb-4 pt-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "B = S² × D" }),
          " — S = number of separate sickness spells, D = total sick days in the past 52 weeks. Frequent short spells score higher than one long illness, reflecting disruption to the workplace."
        ] }),
        yearAttQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "Loading attendance data…" }) : bradfordData && bradfordData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 border-b pb-2 px-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Staff member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "Spells (S)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "Days sick (D)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: "Score (B)" })
          ] }),
          bradfordData.map(({ name, spells, days, bradford, risk }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-4 gap-2 text-sm py-2 rounded-lg px-2 ${risk === "critical" ? "bg-red-50" : risk === "high" ? "bg-orange-50" : risk === "medium" ? "bg-amber-50/60" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800", children: name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: spells }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: days }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-center font-bold ${risk === "critical" ? "text-red-600" : risk === "high" ? "text-orange-600" : risk === "medium" ? "text-amber-600" : "text-green-600"}`, children: [
              bradford,
              risk !== "low" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs font-normal opacity-80", children: risk === "critical" ? "⚠ Critical" : risk === "high" ? "High" : "Medium" })
            ] })
          ] }, name))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No sickness data recorded yet — use this tab to log actual absences over time." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Guidance thresholds (UK):" }),
            " 0–35 Normal · 36–99 Informal discussion · 100–149 Formal warning · 150+ Consider dismissal"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "These are guidelines only — always apply your farm's own absence policy and take HR advice for formal actions." })
        ] })
      ] })
    ] })
  ] });
}
function PaySummaryTab({ farmId, staffNames, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterMonth, setFilterMonth] = reactExports.useState(() => isoDate(/* @__PURE__ */ new Date()).slice(0, 7));
  const [rateOpen, setRateOpen] = reactExports.useState(false);
  const [editRate, setEditRate] = reactExports.useState(null);
  const emptyRate = () => ({ staffName: "", regularRatePence: "", overtimeRatePence: "", effectiveFrom: isoDate(/* @__PURE__ */ new Date()), notes: "" });
  const [rateForm, setRateForm] = reactExports.useState(emptyRate());
  const tsQ = useQuery({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then((r) => r.json()),
    enabled: !!farmId
  });
  const ratesQ = useQuery({
    queryKey: ["labour-rates", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/rates`).then((r) => r.json()),
    enabled: !!farmId
  });
  const addRateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/labour/rates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Rate saved" });
      qc.invalidateQueries({ queryKey: ["labour-rates", farmId] });
      setRateOpen(false);
      setEditRate(null);
      setRateForm(emptyRate());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const editRateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/labour/rates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Rate updated" });
      qc.invalidateQueries({ queryKey: ["labour-rates", farmId] });
      setRateOpen(false);
      setEditRate(null);
      setRateForm(emptyRate());
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delRateMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/labour/rates/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Rate deleted" });
      qc.invalidateQueries({ queryKey: ["labour-rates", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const entries = tsQ.data?.entries ?? [];
  const rates = ratesQ.data?.rates ?? [];
  const monthEntries = entries.filter((e) => !filterMonth || e.date.startsWith(filterMonth));
  const getRate = (staffName) => {
    return rates.filter((r) => r.staffName === staffName).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  };
  const summary = reactExports.useMemo(() => {
    const byStaff = {};
    for (const e of monthEntries) {
      if (!byStaff[e.staffName]) byStaff[e.staffName] = { reg: 0, ot: 0 };
      byStaff[e.staffName].reg += parseFloat(e.hoursRegular || "0");
      byStaff[e.staffName].ot += parseFloat(e.hoursOvertime || "0");
    }
    return Object.entries(byStaff).map(([name, hrs]) => {
      const rate = getRate(name);
      const regPay = rate ? hrs.reg * (rate.regularRatePence / 100) : null;
      const otPay = rate ? hrs.ot * (rate.overtimeRatePence / 100) : null;
      const total = regPay !== null && otPay !== null ? regPay + otPay : null;
      return { name, ...hrs, regPay, otPay, total };
    });
  }, [monthEntries, rates]);
  const grandTotal = summary.reduce((s, r) => s + (r.total ?? 0), 0);
  const exportCsv = () => {
    const rows = [["Staff Member", "Regular Hrs", "OT Hrs", "Reg Pay", "OT Pay", "Total"], ...summary.map((r) => [r.name, r.reg.toFixed(1), r.ot.toFixed(1), r.regPay !== null ? fmtGBP(r.regPay * 100) : "—", r.otPay !== null ? fmtGBP((r.otPay ?? 0) * 100) : "—", r.total !== null ? fmtGBP((r.total ?? 0) * 100) : "—"])];
    downloadCsvFile(`payroll-${filterMonth}.csv`, rows);
  };
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterMonth || "all-months", onValueChange: (v) => setFilterMonth(v === "all-months" ? "" : v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select month" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all-months", children: "All time" }),
          months.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) }, m))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
          setEditRate(null);
          setRateForm(emptyRate());
          setRateOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { size: 14, className: "mr-1" }),
          " Set Pay Rate"
        ] }),
        summary.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: exportCsv, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14, className: "mr-1" }),
          " Export CSV"
        ] })
      ] })
    ] }),
    rates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Current Pay Rates" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-xs text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Regular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "Overtime" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-50", children: rates.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: r.staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right font-mono", children: [
            fmtGBP(r.regularRatePence),
            "/hr"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right font-mono", children: [
            fmtGBP(r.overtimeRatePence),
            "/hr"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-gray-500 text-xs", children: fmtDate(r.effectiveFrom) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setRateForm({ staffName: r.staffName, regularRatePence: String(r.regularRatePence / 100), overtimeRatePence: String(r.overtimeRatePence / 100), effectiveFrom: r.effectiveFrom, notes: r.notes ?? "" });
              setEditRate(r);
              setRateOpen(true);
            }, className: "text-gray-400 hover:text-blue-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delRateMut.mutate(r.id), className: "text-gray-400 hover:text-red-600 p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
          ] }) })
        ] }, r.id)) })
      ] })
    ] }),
    summary.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PoundSterling, { className: "w-10 h-10 mx-auto mb-2 opacity-25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No timesheet data for this period. Add timesheet entries to see pay summaries." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl overflow-hidden bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 bg-gray-50 border-b flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: [
          "Monthly Summary — ",
          filterMonth ? (/* @__PURE__ */ new Date(filterMonth + "-01")).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "All time"
        ] }),
        grandTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-gray-900", children: [
          "Total: ",
          fmtGBP(grandTotal * 100)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-xs text-gray-500 uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-semibold", children: "Staff Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 font-semibold", children: "Reg Hrs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 font-semibold", children: "OT Hrs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 font-semibold", children: "Reg Pay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 font-semibold", children: "OT Pay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2.5 font-semibold", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: (() => {
          const renderRow = (r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-mono", children: r.reg.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-mono", children: r.ot > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700", children: r.ot.toFixed(1) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-mono", children: r.regPay !== null ? fmtGBP(r.regPay * 100) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 text-xs", children: "No rate set" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-mono", children: r.otPay !== null && r.ot > 0 ? fmtGBP((r.otPay ?? 0) * 100) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-bold", children: r.total !== null ? fmtGBP((r.total ?? 0) * 100) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 text-xs", children: "—" }) })
          ] }, r.name);
          if (!hasDepartments) return summary.map(renderRow);
          return deptGroups.map(({ dept, colour, names }) => {
            const group = summary.filter((r) => names.includes(r.name));
            if (!group.length) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-1.5 bg-gray-50 border-t-2 border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest", style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 }, children: dept ?? "No department" }) }) }),
              group.map(renderRow)
            ] }, dept ?? "__none__");
          });
        })() })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: rateOpen, onOpenChange: (o) => {
      if (!o) {
        setRateOpen(false);
        setEditRate(null);
        setRateForm(emptyRate());
        addRateMut.reset();
        editRateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRate ? "Edit Pay Rate" : "Set Pay Rate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rateForm.staffName, onValueChange: (v) => setRateForm((p) => ({ ...p, staffName: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regular Rate (£/hr)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", className: "mt-1", value: rateForm.regularRatePence, onChange: (e) => setRateForm((p) => ({ ...p, regularRatePence: e.target.value })), placeholder: "e.g. 12.21" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overtime Rate (£/hr)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", className: "mt-1", value: rateForm.overtimeRatePence, onChange: (e) => setRateForm((p) => ({ ...p, overtimeRatePence: e.target.value })), placeholder: "e.g. 18.32" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Effective From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: rateForm.effectiveFrom, onChange: (e) => setRateForm((p) => ({ ...p, effectiveFrom: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: addRateMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editRateMut, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            setRateOpen(false);
            setEditRate(null);
            setRateForm(emptyRate());
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => {
                const body = { staffName: rateForm.staffName, regularRatePence: Math.round(parseFloat(rateForm.regularRatePence) * 100), overtimeRatePence: Math.round(parseFloat(rateForm.overtimeRatePence) * 100), effectiveFrom: rateForm.effectiveFrom, notes: rateForm.notes };
                if (editRate) editRateMut.mutate({ id: editRate.id, body });
                else addRateMut.mutate(body);
              },
              disabled: !rateForm.staffName || !rateForm.regularRatePence || addRateMut.isPending || editRateMut.isPending,
              children: "Save Rate"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function WorkingTimeTab({ farmId, staffNames, staffMembers }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const tsQ = useQuery({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then((r) => r.json()),
    enabled: !!farmId
  });
  const entQ = useQuery({
    queryKey: ["labour-entitlements", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/entitlements`).then((r) => r.json()),
    enabled: !!farmId
  });
  const entries = tsQ.data?.entries ?? [];
  const entitlements = entQ.data?.entitlements ?? [];
  const wtrStatus = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const sevenWeeksAgo = new Date(now.getTime() - 17 * 7 * 24 * 60 * 60 * 1e3);
    return staffNames.map((name) => {
      const ent = entitlements.find((e) => e.staffName === name && e.year === now.getFullYear());
      const wtrOptOut = ent?.wtrOptOut ?? false;
      const relevant = entries.filter((e) => e.staffName === name && /* @__PURE__ */ new Date(e.date + "T00:00:00") >= sevenWeeksAgo);
      const byWeek = {};
      for (const e of relevant) {
        const d = /* @__PURE__ */ new Date(e.date + "T00:00:00");
        const weekKey = isoDate(getMondayOfWeek(d));
        byWeek[weekKey] = (byWeek[weekKey] ?? 0) + parseFloat(e.hoursRegular || "0") + parseFloat(e.hoursOvertime || "0");
      }
      const weeks = Object.values(byWeek);
      const totalHrs = weeks.reduce((s, h) => s + h, 0);
      const weekCount = Math.max(weeks.length, 1);
      const avgHrs = totalHrs / weekCount;
      return { name, avgHrs, wtrOptOut, status: avgHrs > 48 ? "breach" : avgHrs > 44 ? "warning" : "ok", weekCount };
    });
  }, [staffNames, entries, entitlements]);
  const toggleOptOut = async (name, current) => {
    const ent = entitlements.find((e) => e.staffName === name && e.year === (/* @__PURE__ */ new Date()).getFullYear());
    if (ent) {
      await fetch(`/api/farms/${farmId}/labour/entitlements/${ent.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ent, wtrOptOut: !current }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    } else {
      await fetch(`/api/farms/${farmId}/labour/entitlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ staffName: name, year: (/* @__PURE__ */ new Date()).getFullYear(), entitlementDays: "28", carriedOverDays: "0", wtrOptOut: !current }) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
    }
    qc.invalidateQueries({ queryKey: ["labour-entitlements", farmId] });
    toast({ title: `WTR opt-out ${!current ? "recorded" : "removed"} for ${name}` });
  };
  const { groups: deptGroups, hasDepartments } = computeDeptGroups(staffMembers);
  if (staffNames.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400 text-sm", children: "No staff found. Add staff members first." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UK Working Time Regulations (WTR) 1998" }),
      " — Workers cannot be required to work more than an average of 48 hours per week over a 17-week reference period. Workers can opt out individually in writing. The 17-week rolling average is calculated from your timesheet entries."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: (() => {
      const renderCard = ({ name, avgHrs, wtrOptOut, status, weekCount }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl p-4 bg-white ${status === "breach" ? "border-red-300" : status === "warning" ? "border-amber-300" : "border-gray-200"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: name }),
          status === "breach" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 18, className: "text-red-500 flex-shrink-0 mt-0.5" }) : status === "warning" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, className: "text-amber-500 flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-green-500 flex-shrink-0 mt-0.5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-2xl font-bold ${status === "breach" ? "text-red-600" : status === "warning" ? "text-amber-600" : "text-green-700"}`, children: [
          avgHrs.toFixed(1),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-gray-500", children: "avg hrs/wk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
          "Based on ",
          weekCount,
          " week",
          weekCount !== 1 ? "s" : "",
          " of data (17-week window)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1.5 bg-gray-100 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full transition-all", style: { width: `${Math.min(100, avgHrs / 60 * 100)}%`, background: status === "breach" ? "#dc2626" : status === "warning" ? "#f59e0b" : "#16a34a" } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-gray-400 mt-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "48 hrs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "60 hrs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "WTR Opt-out" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => toggleOptOut(name, wtrOptOut),
              className: `text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${wtrOptOut ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`,
              children: wtrOptOut ? "Opt-out recorded" : "No opt-out"
            }
          )
        ] }),
        status === "breach" && !wtrOptOut && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-2 font-medium", children: "⚠ Exceeds 48-hr WTR limit — ensure opt-out is in place or reduce hours." })
      ] }, name);
      if (!hasDepartments) return wtrStatus.map(renderCard);
      return deptGroups.map(({ dept, colour, names }) => {
        const group = wtrStatus.filter((s) => names.includes(s.name));
        if (!group.length) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-500 uppercase tracking-widest", style: { borderLeft: `3px solid ${colour ?? "#9ca3af"}`, paddingLeft: 8 }, children: dept ?? "No department" }) }),
          group.map(renderCard)
        ] }, dept ?? "__none__");
      });
    })() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-4 bg-gray-50 text-xs text-gray-500 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rest period requirements (WTR 1998):" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Minimum 11 consecutive hours rest between working days" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Minimum 24 hours rest per week (or 48 hours per fortnight)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 20-minute rest break when working more than 6 hours in a day" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Young workers (under 18): maximum 8 hours/day, 40 hours/week (no opt-out)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pt-1 text-gray-400", children: "Agriculture has some exemptions — consult DEFRA guidance for harvest and livestock emergencies." })
    ] })
  ] });
}
const LABOUR_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];
function LabourAnalyticsTab({ farmId }) {
  const { data: tsData } = useQuery({ queryKey: ["labour-timesheets", farmId], queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then((r) => r.json()) });
  const { data: absData } = useQuery({ queryKey: ["labour-absences", farmId], queryFn: () => fetch(`/api/farms/${farmId}/labour/absences`).then((r) => r.json()) });
  const { data: membersData } = useQuery({ queryKey: ["staff-members", farmId], queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()) });
  const timesheets = reactExports.useMemo(() => tsData?.timesheets ?? tsData?.entries ?? tsData ?? [], [tsData]);
  const absences = reactExports.useMemo(() => absData?.absences ?? absData?.records ?? absData ?? [], [absData]);
  const members = reactExports.useMemo(() => membersData?.members ?? [], [membersData]);
  const totalHours = reactExports.useMemo(() => timesheets.reduce((s, r) => s + (Number(r.hoursWorked) || Number(r.hours) || 0), 0), [timesheets]);
  const absenceByType = reactExports.useMemo(() => {
    const map = {};
    absences.forEach((r) => {
      const t = String(r.absenceType || r.type || "Other");
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [absences]);
  const tssByMonth = reactExports.useMemo(() => {
    const map = {};
    timesheets.forEach((r) => {
      const d = String(r.date || r.workDate || "");
      const k = d.slice(0, 7);
      if (!k || k.length < 7) return;
      if (!map[k]) map[k] = { entries: 0, hours: 0 };
      map[k].entries++;
      map[k].hours += Number(r.hoursWorked) || Number(r.hours) || 0;
    });
    return Object.entries(map).sort().slice(-12).map(([m, d]) => ({ month: m.slice(5), ...d, hours: +d.hours.toFixed(1) }));
  }, [timesheets]);
  const noData = timesheets.length === 0 && absences.length === 0;
  if (noData) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No data yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add timesheets or absence records to see analytics." })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Timesheet Entries", value: timesheets.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
      { label: "Total Hours Logged", value: totalHours.toFixed(1), bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
      { label: "Absence Records", value: absences.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
      { label: "Active Staff", value: members.filter((m) => m.isActive !== false).length, bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" }
    ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${c.bg} rounded-xl border p-4 text-center`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${c.text}`, children: c.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-0.5 ${c.sub}`, children: c.label })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      tssByMonth.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Hours Logged by Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: tssByMonth, margin: { left: 0, right: 8, top: 4, bottom: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, unit: "h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}h`, "Hours"] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "hours", fill: "#1d4ed8", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] }),
      absenceByType.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-4", children: "Absences by Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: absenceByType, cx: "50%", cy: "50%", outerRadius: 75, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, children: absenceByType.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: LABOUR_COLORS[i % LABOUR_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${v}`, "Absences"] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function StaffHoursCrossRefTab({ farmId, staffNames }) {
  const todayMonday = reactExports.useMemo(() => isoDate(getMondayOfWeek(/* @__PURE__ */ new Date())), []);
  const [weekStart, setWeekStart] = reactExports.useState(todayMonday);
  const [filterStaff, setFilterStaff] = usePersistedFilter({ page: "labour-crossref", filter: "staff", farmId, defaultValue: "all" });
  const weekEnd = reactExports.useMemo(() => isoDate(addDays(/* @__PURE__ */ new Date(weekStart + "T00:00:00"), 6)), [weekStart]);
  const prevWeek = () => setWeekStart((w) => isoDate(addDays(/* @__PURE__ */ new Date(w + "T00:00:00"), -7)));
  const nextWeek = () => setWeekStart((w) => isoDate(addDays(/* @__PURE__ */ new Date(w + "T00:00:00"), 7)));
  const [annotating, setAnnotating] = reactExports.useState(null);
  const [annotForm, setAnnotForm] = reactExports.useState({ note: "", resolvedBy: "", markResolved: false });
  const qc = useQueryClient();
  const { toast } = useToast();
  const tsQ = useQuery({
    queryKey: ["labour-timesheets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/timesheets`).then((r) => r.json()),
    enabled: !!farmId
  });
  const foQ = useQuery({
    queryKey: ["field-operations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-operations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const annotQ = useQuery({
    queryKey: ["labour-crossref-annotations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/crossref-annotations`).then((r) => r.json()),
    enabled: !!farmId
  });
  const saveAnnot = useMutation({
    mutationFn: async (body) => {
      if (annotating?.existing) {
        return fetch(`/api/farms/${farmId}/labour/crossref-annotations/${annotating.existing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        }).then((r) => r.json());
      }
      return fetch(`/api/farms/${farmId}/labour/crossref-annotations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labour-crossref-annotations", farmId] });
      toast({ title: "Annotation saved" });
      setAnnotating(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delAnnot = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/labour/crossref-annotations/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labour-crossref-annotations", farmId] });
      toast({ title: "Annotation removed" });
      setAnnotating(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const annotMap = reactExports.useMemo(() => {
    const m = {};
    (annotQ.data?.annotations ?? []).forEach((a) => {
      m[`${a.date}||${a.staffName}`] = a;
    });
    return m;
  }, [annotQ.data]);
  function openAnnot(staffName, date) {
    const existing = annotMap[`${date}||${staffName}`] ?? null;
    setAnnotating({ staffName, date, existing });
    setAnnotForm({ note: existing?.note ?? "", resolvedBy: existing?.resolvedBy ?? "", markResolved: !!existing?.resolvedAt });
  }
  function saveAnnotation() {
    const body = {
      staffName: annotating.staffName,
      date: annotating.date,
      note: annotForm.note,
      resolvedBy: annotForm.markResolved && annotForm.resolvedBy ? annotForm.resolvedBy : null,
      resolvedAt: annotForm.markResolved ? (/* @__PURE__ */ new Date()).toISOString() : null
    };
    saveAnnot.mutate(body);
  }
  const { rows, summaryTimesheet, summaryFieldOps, summaryMismatch } = reactExports.useMemo(() => {
    const allTs = (tsQ.data?.entries ?? []).filter((e) => e.date >= weekStart && e.date <= weekEnd);
    const allFo = (foQ.data?.records ?? []).filter(
      (r) => r.operationDate >= weekStart && r.operationDate <= weekEnd && !r.isContractor && r.operator && r.labourHours && parseFloat(r.labourHours) > 0
    );
    const map = {};
    const key = (date, name) => `${date}||${name}`;
    for (const e of allTs) {
      if (filterStaff !== "all" && e.staffName !== filterStaff) continue;
      const k = key(e.date, e.staffName);
      if (!map[k]) map[k] = { date: e.date, staffName: e.staffName, tsHrs: 0, foHrs: 0, foOps: [] };
      map[k].tsHrs += parseFloat(e.hoursRegular || "0") + parseFloat(e.hoursOvertime || "0");
    }
    for (const r of allFo) {
      const name = r.operator;
      if (filterStaff !== "all" && name !== filterStaff) continue;
      const k = key(r.operationDate, name);
      if (!map[k]) map[k] = { date: r.operationDate, staffName: name, tsHrs: 0, foHrs: 0, foOps: [] };
      map[k].foHrs += parseFloat(r.labourHours || "0");
      const opLabel = r.operationType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (!map[k].foOps.includes(opLabel)) map[k].foOps.push(opLabel);
    }
    const rows2 = Object.values(map).sort((a, b) => a.date === b.date ? a.staffName.localeCompare(b.staffName) : a.date.localeCompare(b.date));
    const summaryTimesheet2 = rows2.reduce((s, r) => s + r.tsHrs, 0);
    const summaryFieldOps2 = rows2.reduce((s, r) => s + r.foHrs, 0);
    const summaryMismatch2 = rows2.filter((r) => Math.abs(r.foHrs - r.tsHrs) > 0.25).length;
    return { rows: rows2, summaryTimesheet: summaryTimesheet2, summaryFieldOps: summaryFieldOps2, summaryMismatch: summaryMismatch2 };
  }, [tsQ.data, foQ.data, weekStart, weekEnd, filterStaff]);
  const loading = tsQ.isLoading || foQ.isLoading;
  function statusBadge(row, annotation) {
    if (annotation?.resolvedAt) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3" }),
      " Resolved"
    ] });
    if (annotation) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-3 h-3" }),
      " Explained"
    ] });
    const diff = row.foHrs - row.tsHrs;
    if (row.tsHrs === 0 && row.foHrs > 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700", children: "Field ops only" });
    if (row.foHrs === 0 && row.tsHrs > 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700", children: "No field ops" });
    if (Math.abs(diff) <= 0.25) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700", children: "Matched" });
    if (diff < -0.25) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700", children: "Under-logged" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700", children: "Over-logged" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "This view compares ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "timesheet hours" }),
        " (from the Timesheets tab) against ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "labour hours logged in Field Operations" }),
        " for the same staff member and date. Task types don't need to match — it's a totals comparison to help spot days where hours don't add up. Contractor operations are excluded from the field ops side."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: prevWeek, className: "px-2.5 py-1.5 hover:bg-gray-100 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1.5 text-sm font-medium text-gray-700 min-w-[180px] text-center", children: [
          fmtDate(weekStart),
          " – ",
          fmtDate(weekEnd)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: nextWeek, className: "px-2.5 py-1.5 hover:bg-gray-100 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStaff, onValueChange: setFilterStaff, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-44 h-9 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All staff" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All staff" }),
          staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Timesheet Hours", value: summaryTimesheet.toFixed(1), sub: "hrs this week", color: "text-gray-800" },
      { label: "Field Op Labour Hrs", value: summaryFieldOps.toFixed(1), sub: "hrs this week", color: "text-gray-800" },
      { label: "Variance", value: (summaryFieldOps - summaryTimesheet).toFixed(1), sub: "field ops vs timesheet", color: Math.abs(summaryFieldOps - summaryTimesheet) > 0.5 ? "text-amber-600" : "text-green-600" },
      { label: "Days with Mismatch", value: String(summaryMismatch), sub: "> 15 min difference", color: summaryMismatch > 0 ? "text-amber-600" : "text-green-600" }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium tracking-wide mb-0.5", children: s.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${s.color}`, children: loading ? "—" : s.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-gray-400", children: "Loading…" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "w-8 h-8 text-gray-300 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 font-medium", children: "No data for this week" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Log timesheets and field operations to see comparisons here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Staff Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Timesheet Hrs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Field Op Hrs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Variance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Field Operations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-10" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: rows.map((row, i) => {
        const diff = row.foHrs - row.tsHrs;
        const diffStr = diff === 0 ? "0.0" : diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
        const diffColor = Math.abs(diff) <= 0.25 ? "text-green-600" : diff < 0 ? "text-amber-600" : "text-purple-600";
        const annotation = annotMap[`${row.date}||${row.staffName}`];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `hover:bg-gray-50 transition-colors ${annotation ? "bg-gray-50/40" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-700 whitespace-nowrap", children: fmtDate(row.date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-gray-900", children: row.staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-gray-700 tabular-nums", children: row.tsHrs > 0 ? `${row.tsHrs.toFixed(1)} hrs` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-gray-700 tabular-nums", children: row.foHrs > 0 ? `${row.foHrs.toFixed(1)} hrs` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-4 py-3 text-right font-medium tabular-nums ${diffColor}`, children: [
            diffStr,
            " hrs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-gray-500 text-xs", children: [
            row.foOps.length > 0 ? row.foOps.join(", ") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300", children: "—" }),
            annotation && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-teal-600 italic truncate max-w-[200px]", title: annotation.note, children: [
              '"',
              annotation.note,
              '"'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: statusBadge(row, annotation) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => openAnnot(row.staffName, row.date),
              title: annotation ? "Edit annotation" : "Add annotation / explanation",
              className: `p-1.5 rounded hover:bg-gray-200 transition-colors ${annotation ? "text-teal-600" : "text-gray-300 hover:text-gray-500"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-3.5 h-3.5" })
            }
          ) })
        ] }, i);
      }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-gray-500 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-green-200 inline-block" }),
        " Matched — within 15 min"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-amber-200 inline-block" }),
        " Under-logged — fewer field op hrs than timesheet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-purple-200 inline-block" }),
        " Over-logged — more field op hrs than timesheet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" }),
        " Field ops only — no matching timesheet entry"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-amber-200 inline-block" }),
        " No field ops — timesheet logged but no field op hours"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-sm bg-teal-200 inline-block" }),
        " Explained — annotation added"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!annotating, onOpenChange: (open) => {
      if (!open) {
        setAnnotating(null);
        saveAnnot.reset();
        delAnnot.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-4 h-4 text-teal-600" }),
        annotating?.existing ? "Edit Annotation" : "Add Annotation"
      ] }) }),
      annotating && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: annotating.staffName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 mx-1.5", children: "·" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: fmtDate(annotating.date) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Explanation / Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              className: "w-full border rounded-md px-3 py-2 text-sm min-h-[90px] resize-y focus:outline-none focus:ring-2 focus:ring-ring",
              placeholder: "e.g. John spent 2.5 hrs helping with livestock weighing — not a field op, so no hours logged there.",
              value: annotForm.note,
              onChange: (e) => setAnnotForm((f) => ({ ...f, note: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAnnotForm((f) => ({ ...f, markResolved: !f.markResolved })),
              className: `relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${annotForm.markResolved ? "bg-green-600" : "bg-gray-200"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${annotForm.markResolved ? "translate-x-4" : "translate-x-0"}` })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-0 cursor-pointer", onClick: () => setAnnotForm((f) => ({ ...f, markResolved: !f.markResolved })), children: "Mark as resolved" })
        ] }),
        annotForm.markResolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resolved by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Farm manager name",
              value: annotForm.resolvedBy,
              onChange: (e) => setAnnotForm((f) => ({ ...f, resolvedBy: e.target.value }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveAnnot, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: delAnnot, message: "Failed to remove annotation — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 flex-wrap", children: [
        annotating?.existing && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "text-red-600 border-red-200 hover:bg-red-50 mr-auto",
            onClick: () => delAnnot.mutate(annotating.existing.id),
            disabled: delAnnot.isPending,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 mr-1" }),
              " Remove"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setAnnotating(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: saveAnnotation, disabled: !annotForm.note.trim() || saveAnnot.isPending, children: saveAnnot.isPending ? "Saving…" : "Save Annotation" })
      ] })
    ] }) })
  ] });
}
function LabourPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "labour", farmId, validIds: ["timesheets", "rota", "actual", "absence", "pay", "wtr", "analytics", "crossref", "enterprise"], defaultTab: "rota" });
  const [absencePendingBadge, setAbsencePendingBadge] = reactExports.useState(0);
  const staffQ = useQuery({
    queryKey: ["staff-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json()),
    enabled: !!farmId
  });
  const staffMembers = reactExports.useMemo(
    () => (staffQ.data?.members ?? []).filter((m) => m.isActive !== false).map((m) => ({ name: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(), department: m.departmentName ?? null, colour: m.departmentColour ?? null })).filter((m) => m.name).sort((a, b) => a.name.localeCompare(b.name)),
    [staffQ.data]
  );
  const staffNames = reactExports.useMemo(() => staffMembers.map((m) => m.name), [staffMembers]);
  const todayWeekStart = reactExports.useMemo(() => isoDate(getMondayOfWeek(/* @__PURE__ */ new Date())), []);
  const pendingStatusQ = useQuery({
    queryKey: ["labour-submission-status", farmId, todayWeekStart],
    queryFn: () => fetch(`/api/farms/${farmId}/labour/submission-status?weekStart=${todayWeekStart}`).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 3e4
  });
  const pendingBadge = reactExports.useMemo(() => {
    if (!pendingStatusQ.data?.staff?.length) return 0;
    const todayStr = isoDate(/* @__PURE__ */ new Date());
    const d = /* @__PURE__ */ new Date(todayStr + "T00:00:00Z");
    const dow = d.getUTCDay();
    const idx = dow === 0 ? 6 : dow - 1;
    return pendingStatusQ.data.staff.filter((s) => s.days[idx]?.status === "pending").length;
  }, [pendingStatusQ.data]);
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Labour Management", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800", children: "Select a farm from the top-left dropdown to load labour records." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Labour Management", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm -mt-4 mb-4", children: "Timesheets, rota planning, holiday & absence, pay summaries, and Working Time Regulations compliance." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b flex gap-0 overflow-x-auto mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "rota", onClick: () => setTab("rota"), icon: CalendarDays, label: "Rota & Shifts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "actual", onClick: () => setTab("actual"), icon: UserCheck, label: "Actual Attendance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "timesheets", onClick: () => setTab("timesheets"), icon: Clock, label: "Timesheets", badge: pendingBadge }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "absence", onClick: () => setTab("absence"), icon: UmbrellaOff, label: "Holiday & Absence", badge: absencePendingBadge }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "pay", onClick: () => setTab("pay"), icon: PoundSterling, label: "Pay Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "wtr", onClick: () => setTab("wtr"), icon: ShieldCheck, label: "Working Time" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "analytics", onClick: () => setTab("analytics"), icon: ChartNoAxesColumn, label: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "crossref", onClick: () => setTab("crossref"), icon: ArrowLeftRight, label: "Staff Hours X-Ref" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "enterprise", onClick: () => setTab("enterprise"), icon: TrendingUp, label: "Enterprise Report" })
    ] }),
    tab === "timesheets" && /* @__PURE__ */ jsxRuntimeExports.jsx(TimesheetsTab, { farmId, staffNames, staffMembers }),
    tab === "rota" && /* @__PURE__ */ jsxRuntimeExports.jsx(RotaTab, { farmId, staffNames, staffMembers }),
    tab === "actual" && /* @__PURE__ */ jsxRuntimeExports.jsx(ActualAttendanceTab, { farmId, staffNames, staffMembers }),
    tab === "absence" && /* @__PURE__ */ jsxRuntimeExports.jsx(AbsenceTab, { farmId, staffNames, onPendingCount: setAbsencePendingBadge, staffMembers }),
    tab === "pay" && /* @__PURE__ */ jsxRuntimeExports.jsx(PaySummaryTab, { farmId, staffNames, staffMembers }),
    tab === "wtr" && /* @__PURE__ */ jsxRuntimeExports.jsx(WorkingTimeTab, { farmId, staffNames, staffMembers }),
    tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(LabourAnalyticsTab, { farmId }),
    tab === "crossref" && /* @__PURE__ */ jsxRuntimeExports.jsx(StaffHoursCrossRefTab, { farmId, staffNames }),
    tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(LabourEnterpriseReport, { farmId })
  ] });
}
export {
  LabourPage as default
};
