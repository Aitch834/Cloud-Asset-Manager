import { b as useAppStore, m as useQuery, j as jsxRuntimeExports, d as Button } from "./index-DnpqOjPK.js";
import { u as usePersistedTab } from "./use-persisted-tab-DsCx_GXI.js";
import { u as usePersistedNumberFilter } from "./use-persisted-filter-B7ldAiRe.js";
import { b as api } from "./api-Dhdsf4oM.js";
import { A as AppLayout, I as Info, H as HeartPulse, T as TrendingUp } from "./AppLayout-BBNHxsBD.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DJGVynMA.js";
import { u as useRawFarmName } from "./use-farm-name-ElExA1Vi.js";
import { p as printRecordsReport } from "./record-report-CtL9yOgX.js";
import { P as Printer } from "./printer-mP-m1fpf.js";
import { D as Download } from "./download-Bh5YraR5.js";
import { T as TriangleAlert } from "./triangle-alert-C8gD2uC3.js";
import { T as TrendingDown } from "./trending-down-BkpAA7Ym.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-CKGGa4c8.js";
import { B as BarChart } from "./BarChart-C-UaHbRp.js";
import { P as PieChart, a as Pie } from "./PieChart-C6aI0c_T.js";
import { L as LineChart } from "./LineChart-U1gMffXL.js";
import { C as CartesianGrid } from "./CartesianGrid-CzA77U_X.js";
import { L as Line } from "./Line-BIOhfVoj.js";
import "./use-safe-clerk-BNWpY-DW.js";
import "./trash-2-B8E7ZM2V.js";
import "./database-CM9mLyE3.js";
import "./shield-alert-CcEMaYOh.js";
import "./shield-check-DUT5dxRP.js";
import "./tractor-DlKKq-lf.js";
import "./index-DEyNxU4N.js";
import "./index-Bn3K7hzk.js";
import "./chevron-up-CMf_33HZ.js";
import "./print-report-ClU8-1P0.js";
const RUMA_THRESHOLDS = { green: 50, amber: 99 };
const PIE_COLOURS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#ef4444"];
const CRITICAL_CLASSES = ["fluoroquinolones", "3rd/4th gen cephalosporins", "carbapenems", "colistin"];
const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
function AMRReportPage() {
  const { farmId } = useAppStore();
  const rawFarmName = useRawFarmName(farmId ?? 0);
  const [year, setYear] = usePersistedNumberFilter({ page: "amr-report", filter: "year", farmId, defaultValue: currentYear });
  const [tab, setTab] = usePersistedTab({ page: "amr-report", farmId, validIds: ["summary", "species", "trend", "ruma"], defaultTab: "summary" });
  const reportQ = useQuery({
    queryKey: ["farms", farmId, "amr-report", year],
    queryFn: () => api.get(`/farms/${farmId}/amr-report?year=${year}`).then((r) => r.report),
    enabled: !!farmId
  });
  const report = reportQ.data;
  const rumaColour = report?.rumaCategory === "green" ? "text-green-700 bg-green-50 border-green-200" : report?.rumaCategory === "amber" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";
  const trend = report && report.prevYearMgPerPcu != null ? report.mgPerPcu - report.prevYearMgPerPcu : null;
  const printReport = () => {
    if (!report) return;
    printRecordsReport({
      title: `Antimicrobial Usage (AMR) Report — ${report.year}`,
      farmName: rawFarmName,
      subtitle: `Total use ${(report.totalUseMg / 1e3).toFixed(1)} g · ${report.mgPerPcu.toFixed(1)} mg/PCU · RUMA category ${report.rumaCategory}`,
      authority: "RUMA / VMD",
      footerNote: "Annual antimicrobial usage report. Review with the prescribing veterinary surgeon and retain supporting medicine records.",
      columns: [
        { label: "Antibiotic class", value: (r) => r.className },
        { label: "Total use (mg)", value: (r) => Number(r.totalMg).toLocaleString() },
        { label: "Share", value: (r) => `${Number(r.percent).toFixed(1)}%` },
        { label: "HP-CIA", value: (r) => r.isCritical }
      ],
      records: report.byClass
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Antimicrobial Usage (AMR) Report", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "RUMA / VMD Reporting" }),
      " — Annual antibiotic usage calculated from medicine records. Target: reduce usage of Highest Priority Critically Important Antimicrobials (HP-CIAs) to zero."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5 gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Year:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(year), onValueChange: (v) => setYear(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: printReport, disabled: !report, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-1" }),
          "Export CSV"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex gap-2 flex-wrap", children: ["summary", "species", "trend", "ruma"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: tab === t ? "default" : "outline", onClick: () => setTab(t), children: t === "summary" ? "Annual Summary" : t === "species" ? "By Species" : t === "trend" ? "Monthly Trend" : "RUMA Benchmarks" }, t)) }),
    reportQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Calculating antibiotic usage for ",
      year,
      "…"
    ] }) : !report || report.totalUseMg === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground border rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "mx-auto mb-2 w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        "No antibiotic medicine records found for ",
        year,
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Records are auto-calculated from entries in the Medicine Register." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      tab === "summary" && report && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        report.adrTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-red-200 bg-red-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { className: "w-4 h-4 text-red-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-red-800", children: [
              "Adverse Drug Reactions — ",
              report.year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-red-700", children: "VMR 2013 Reg 58 / VMD SARSS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-3 text-center border border-red-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-red-700", children: report.adrTotal }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-600", children: "Suspected ADRs" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center border ${report.adrReportedToVet === report.adrTotal ? "bg-green-50 border-green-200" : "bg-white border-red-100"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${report.adrReportedToVet === report.adrTotal ? "text-green-700" : "text-amber-700"}`, children: report.adrReportedToVet }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Reported to Vet" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center border ${report.adrReportedToVmd === report.adrTotal ? "bg-green-50 border-green-200" : "bg-white border-red-100"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${report.adrReportedToVmd === report.adrTotal ? "text-green-700" : "text-amber-700"}`, children: report.adrReportedToVmd }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "VMD SARSS Submitted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 text-center border ${report.adrUnreported === 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-300"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${report.adrUnreported === 0 ? "text-green-700" : "text-red-700"}`, children: report.adrUnreported }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Awaiting Report" })
            ] })
          ] }),
          report.adrUnreported > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-start gap-2 text-xs text-red-800 bg-red-100 border border-red-200 rounded-lg p-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              report.adrUnreported,
              " reaction",
              report.adrUnreported !== 1 ? "s have" : " has",
              " not yet been confirmed as reported to the VMD SARSS. Serious reactions must be submitted within 15 days. Go to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Medicine Register → ADR Register" }),
              " to update reporting status."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
              (report.totalUseMg / 1e3).toFixed(1),
              "g"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total Antibiotic Use" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${report.mgPerPcu > RUMA_THRESHOLDS.amber ? "text-red-600" : report.mgPerPcu > RUMA_THRESHOLDS.green ? "text-amber-600" : "text-green-600"}`, children: report.mgPerPcu.toFixed(1) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "mg/PCU" }),
            trend !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs flex items-center justify-center gap-1 mt-1 ${trend < 0 ? "text-green-600" : "text-red-600"}`, children: [
              trend < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3 h-3" }),
              Math.abs(trend).toFixed(1),
              " vs last year"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-lg p-4 text-center ${rumaColour}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold capitalize", children: report.rumaCategory }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: "RUMA Category" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white border rounded-lg p-4 text-center ${report.criticallyImportantMg > 0 ? "border-red-300" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${report.criticallyImportantMg > 0 ? "text-red-600" : "text-green-600"}`, children: report.criticallyImportantMg > 0 ? `${report.criticallyImportantPercent.toFixed(1)}%` : "0%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "HP-CIA Usage" }),
            report.criticallyImportantMg > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-red-700 mt-1 flex items-center gap-1 justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
              "Action needed"
            ] })
          ] })
        ] }),
        report.byClass.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Usage by Antibiotic Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: report.byClass, layout: "vertical", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 11 }, unit: "mg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "className", tick: { fontSize: 11 }, width: 160 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${Number(v).toLocaleString()} mg`] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "totalMg", radius: [0, 4, 4, 0], children: report.byClass.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: c.isCritical ? "#ef4444" : "#3b82f6" }, i)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded bg-blue-500 inline-block" }),
              "Standard"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded bg-red-500 inline-block" }),
              "HP-CIA (critically important)"
            ] })
          ] })
        ] }),
        report.byClass.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Class Distribution (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: report.byClass, dataKey: "percent", nameKey: "className", cx: "50%", cy: "50%", outerRadius: 70, children: report.byClass.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLOURS[i % PIE_COLOURS.length] }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${Number(v).toFixed(1)}%`] })
          ] }) })
        ] })
      ] }),
      tab === "species" && report && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-medium", children: "Species" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "Total Use (mg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "Treatments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right font-medium", children: "Avg per Treatment" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: report.bySpecies.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: s.species }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: s.totalMg.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: s.treatmentCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: s.treatmentCount > 0 ? Math.round(s.totalMg / s.treatmentCount).toLocaleString() : "—" })
        ] }, i)) })
      ] }) }) }),
      tab === "trend" && report && report.monthlyTrend.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium mb-3", children: [
          "Monthly Antibiotic Usage — ",
          year
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: report.monthlyTrend, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, unit: "mg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`${Number(v).toLocaleString()} mg`] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "totalMg", stroke: "#3b82f6", strokeWidth: 2, dot: { r: 4 }, name: "Usage (mg)" })
        ] }) })
      ] }),
      tab === "ruma" && report && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 border rounded-lg ${rumaColour}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mb-1", children: [
            "Your RUMA Category: ",
            report.rumaCategory.toUpperCase()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            "mg/PCU: ",
            report.mgPerPcu.toFixed(1),
            " — ",
            report.rumaCategory === "green" ? "Within responsible use targets." : report.rumaCategory === "amber" ? "Above target — review antibiotic policies with vet." : "Significantly above target — urgent vet review required."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: "RUMA Reference Bands" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 text-sm", children: [
            { colour: "bg-green-500", band: "Green", label: `≤${RUMA_THRESHOLDS.green} mg/PCU`, desc: "Responsible use target" },
            { colour: "bg-amber-400", band: "Amber", label: `${RUMA_THRESHOLDS.green + 1}–${RUMA_THRESHOLDS.amber} mg/PCU`, desc: "Above target — review required" },
            { colour: "bg-red-500", band: "Red", label: `>${RUMA_THRESHOLDS.amber} mg/PCU`, desc: "Significantly above target" }
          ].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `${b.colour} w-4 h-4 rounded shrink-0` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: b.band }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: b.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "— ",
              b.desc
            ] })
          ] }, b.band)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-2", children: "Highest Priority Critically Important Antimicrobials (HP-CIAs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "RUMA target: ZERO use. These classes are reserved for human medicine where no alternative exists." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs space-y-1 list-disc list-inside text-red-800", children: CRITICAL_CLASSES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: c }, c)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AMRReportPage as default
};
