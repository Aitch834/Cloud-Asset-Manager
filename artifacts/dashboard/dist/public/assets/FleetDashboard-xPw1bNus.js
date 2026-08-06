import { r as reactExports, m as useQuery, j as jsxRuntimeExports, b as useAppStore, u as useLocation } from "./index-BJXPeyCY.js";
import { u as usePersistedTab } from "./use-persisted-tab-DBkIAcBy.js";
import { d as Wrench, F as Fuel, A as AppLayout, T as TrendingUp } from "./AppLayout-HBb1kWcP.js";
import { T as TabBar, a as TabButton } from "./tab-button-VVsvkGsk.js";
import { P as Printer } from "./printer-CeEUlwg_.js";
import { T as TrendingDown } from "./trending-down-B2idQZ5c.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-D3jeJjTh.js";
import { B as BarChart } from "./BarChart-BTWAo611.js";
import { C as CartesianGrid } from "./CartesianGrid-DX0pGVPT.js";
import { C as ChevronUp } from "./chevron-up-xhrxRZ7N.js";
import { C as ChevronDown } from "./trash-2-C1_nSWmw.js";
import { C as ChevronRight, T as Tractor } from "./tractor-D2RZPiTh.js";
import { T as TriangleAlert } from "./triangle-alert-CPChFDQg.js";
import { a as Clock } from "./database-C5skk28G.js";
import { C as CircleCheck } from "./circle-check-cTfBdSir.js";
import { C as Calendar } from "./calendar-CNhs5F93.js";
import "./use-safe-clerk-BGYlfbxn.js";
import "./shield-alert-Bl6txpDC.js";
import "./shield-check-Dkz7PDVV.js";
const PRINT_ID = "fleet-cost-report-print";
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
function fmtGBPnull(p) {
  return p != null ? fmtGBP(p) : "—";
}
function KpiCard({ label, value, sub, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1 truncate max-w-[180px]", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      fmtGBP(p.value)
    ] }, p.name))
  ] });
};
function FleetCostReport({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [showAll, setShowAll] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["fleet-cost-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/fleet-cost-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && d.machineCount > 0;
  const displayMachines = showAll ? d?.machines ?? [] : (d?.machines ?? []).slice(0, 10);
  const chartData = (d?.machines ?? []).slice(0, 15).map((m) => ({
    name: m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name,
    "Depreciation": m.annualDepreciationPence,
    "Insurance": m.annualInsurancePence,
    "Fuel": m.fuelCostPence
  }));
  d && d.totalFleetAnnualCostPence > 0 ? ((d.totalFleetAnnualCostPence - d.totalDepreciationPence - d.totalInsurancePence - d.totalFuelCostPence) / d.totalFleetAnnualCostPence * 100).toFixed(0) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Fleet Cost Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Annual depreciation, insurance, and fuel cost per machine" })
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
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: "No active machinery found. Add equipment with purchase price, current value and insurance in the Fleet section." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Active Machines", value: d.machineCount.toString(), sub: "in fleet", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4 text-slate-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Total Annual Cost", value: fmtGBP(d.totalFleetAnnualCostPence), sub: `${fmtGBP(Math.round(d.totalFleetAnnualCostPence / (d.machineCount || 1)))} avg/machine`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-orange-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Depreciation", value: fmtGBP(d.totalDepreciationPence), sub: `${d.totalFleetAnnualCostPence > 0 ? Math.round(d.totalDepreciationPence / d.totalFleetAnnualCostPence * 100) : 0}% of fleet cost`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-amber-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Fuel Cost", value: fmtGBP(d.totalFuelCostPence), sub: "from tracked usage records", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "w-4 h-4 text-blue-500" }) })
      ] }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Annual Cost by Machine — Depreciation + Insurance + Fuel" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(180, chartData.length * 32 + 60), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, layout: "vertical", margin: { top: 4, right: 60, bottom: 4, left: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 10 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 120 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Depreciation", fill: "#f59e0b", stackId: "a", maxBarSize: 20 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Insurance", fill: "#8b5cf6", stackId: "a", maxBarSize: 20 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Fuel", fill: "#3b82f6", stackId: "a", radius: [0, 3, 3, 0], maxBarSize: 20 })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
            "Cost per Machine — ",
            d.year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: "Declining balance depreciation · est. 500 hrs/year for cost/hr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Machine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Current Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Depr. Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Depreciation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Insurance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Fuel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total/Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Est. Cost/hr" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            displayMachines.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: m.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
                  m.machineType,
                  m.makeModel ? ` · ${m.makeModel}` : "",
                  m.registration ? ` · ${m.registration}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/70", children: m.currentValuePence > 0 ? fmtGBP(m.currentValuePence) : m.purchasePricePence > 0 ? fmtGBP(m.purchasePricePence) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2 text-right text-foreground/50 text-xs", children: [
                m.depreciationRatePct,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: m.annualDepreciationPence > 0 ? fmtGBP(m.annualDepreciationPence) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: m.annualInsurancePence > 0 ? fmtGBP(m.annualInsurancePence) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: m.fuelCostPence > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: `${m.fuelLitres.toFixed(1)}L`, children: fmtGBP(m.fuelCostPence) }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-semibold", children: fmtGBP(m.totalAnnualCostPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right font-mono text-foreground/70", children: fmtGBPnull(m.costPerHourPence) })
            ] }, m.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/20 font-semibold text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2", children: [
                "Total Fleet (",
                d.machineCount,
                " machines)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: fmtGBP(d.totalDepreciationPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: fmtGBP(d.totalInsurancePence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: fmtGBP(d.totalFuelCostPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: fmtGBP(d.totalFleetAnnualCostPence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right" })
            ] })
          ] })
        ] }) }),
        d.machines.length > 10 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full px-4 py-2.5 text-xs text-foreground/60 hover:bg-muted/30 flex items-center justify-center gap-1 border-t border-border", onClick: () => setShowAll((v) => !v), children: showAll ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }),
          " Show less"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" }),
          " Show all ",
          d.machines.length,
          " machines"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Depreciation = declining balance on current value (purchase price if current value not set). Default rate 15% if not specified on the machine record. Fuel from usage records tagged to equipment. Cost/hr assumes 500 hrs/year — set actual hours in the Fleet module for precision. Repair, tyres, and operator labour not included." })
      ] }),
      d.totalDepreciationPence > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-3", children: "Cost Structure Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: "Depreciation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-amber-600", children: fmtGBP(d.totalDepreciationPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
              d.totalFleetAnnualCostPence > 0 ? Math.round(d.totalDepreciationPence / d.totalFleetAnnualCostPence * 100) : 0,
              "% of total"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: "Insurance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-purple-600", children: fmtGBP(d.totalInsurancePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
              d.totalFleetAnnualCostPence > 0 ? Math.round(d.totalInsurancePence / d.totalFleetAnnualCostPence * 100) : 0,
              "% of total"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50", children: "Fuel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-bold text-blue-600", children: fmtGBP(d.totalFuelCostPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
              d.totalFleetAnnualCostPence > 0 ? Math.round(d.totalFuelCostPence / d.totalFleetAnnualCostPence * 100) : 0,
              "% of total"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 864e5);
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function ServiceStatus({ days }) {
  if (days === null) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", background: "#f3f4f6", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " Not scheduled"
  ] });
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
    " Overdue ",
    Math.abs(days),
    "d"
  ] });
  if (days <= 14) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " Due in ",
    days,
    "d"
  ] });
  if (days <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 11 }),
    " Due in ",
    days,
    "d"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11 }),
    " OK — ",
    days,
    "d"
  ] });
}
function FleetDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [tab, setTab] = usePersistedTab({
    page: "fleet",
    farmId,
    validIds: ["status", "cost"],
    defaultTab: "status"
  });
  const equipmentQ = useQuery({
    queryKey: ["equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const equipment = equipmentQ.data ?? [];
  const active = equipment.filter((e) => e.isActive !== false);
  const overdue = active.filter((e) => daysUntil(e.nextCalibrationDue) !== null && daysUntil(e.nextCalibrationDue) < 0);
  const dueSoon = active.filter((e) => {
    const d = daysUntil(e.nextCalibrationDue);
    return d !== null && d >= 0 && d <= 30;
  });
  const ok = active.filter((e) => {
    const d = daysUntil(e.nextCalibrationDue);
    return d === null || d > 30;
  });
  const sorted = [
    ...active.filter((e) => {
      const d = daysUntil(e.nextCalibrationDue);
      return d !== null && d < 0;
    }),
    ...active.filter((e) => {
      const d = daysUntil(e.nextCalibrationDue);
      return d !== null && d >= 0 && d <= 30;
    }).sort((a, b) => daysUntil(a.nextCalibrationDue) - daysUntil(b.nextCalibrationDue)),
    ...active.filter((e) => {
      const d = daysUntil(e.nextCalibrationDue);
      return d === null || d > 30;
    })
  ];
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Fleet Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 40, style: { margin: "0 auto 1rem" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "Select a farm to view fleet status" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Fleet Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "status", onClick: () => setTab("status"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Service Status"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "cost", onClick: () => setTab("cost"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1 inline" }),
          "Cost Report"
        ] })
      ] }),
      tab === "status" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/equipment"), style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }, children: [
        "Equipment Register ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
      ] })
    ] }),
    tab === "cost" && /* @__PURE__ */ jsxRuntimeExports.jsx(FleetCostReport, { farmId }),
    tab === "status" && (equipmentQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 } }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      overdue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: "#dc2626", style: { marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }, children: [
            overdue.length,
            " item",
            overdue.length > 1 ? "s" : "",
            " overdue for calibration / service"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: [
            overdue.map((e) => e.name).join(", "),
            " — schedule immediately to maintain Red Tractor compliance."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "Total Fleet", value: active.length, bg: "#f9fafb", iconBg: "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 18, color: "#374151" }) },
        { label: "Overdue", value: overdue.length, bg: overdue.length > 0 ? "#fef2f2" : "#f9fafb", iconBg: overdue.length > 0 ? "#fecaca" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: overdue.length > 0 ? "#dc2626" : "#9ca3af" }) },
        { label: "Due ≤ 30 Days", value: dueSoon.length, bg: dueSoon.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: dueSoon.length > 0 ? "#fef3c7" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, color: dueSoon.length > 0 ? "#d97706" : "#9ca3af" }) },
        { label: "Status OK", value: ok.length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#15803d" }) }
      ].map(({ label, value, bg, iconBg, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: value })
        ] })
      ] }, label)) }),
      sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 32, style: { margin: "0 auto 1rem", opacity: 0.3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "No equipment registered" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", marginTop: 4 }, children: "Add machinery via the Equipment Register" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 15, color: "#374151" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Fleet Status — All Equipment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Machine", "Type", "Make / Model", "Reg / Serial", "Next Calibration", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sorted.map((e, i) => {
            const days = daysUntil(e.nextCalibrationDue);
            const rowBg = days !== null && days < 0 ? "#fff5f5" : days !== null && days <= 14 ? "#fffdf5" : "transparent";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: rowBg }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }, children: e.name || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280", textTransform: "capitalize" }, children: e.type || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.65rem 0.875rem", color: "#374151" }, children: [
                [e.make, e.model].filter(Boolean).join(" ") || "—",
                e.yearOfManufacture ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75rem" }, children: [
                  " (",
                  e.yearOfManufacture,
                  ")"
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280", fontSize: "0.8rem" }, children: e.registrationNumber || e.serialNumber || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#374151", whiteSpace: "nowrap" }, children: fmt(e.nextCalibrationDue) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ServiceStatus, { days }) })
            ] }, e.id);
          }) })
        ] })
      ] })
    ] }))
  ] }) });
}
export {
  FleetDashboard as default
};
