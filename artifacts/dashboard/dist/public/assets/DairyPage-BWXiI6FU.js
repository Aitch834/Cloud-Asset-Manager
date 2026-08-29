import { c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, j as jsxRuntimeExports, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, e as LoaderCircle, n as Card, o as CardContent, L as Label, I as Input, N as DialogMutationError, O as React, B as Building2, b as useAppStore, R as Redirect, b4 as formatAlertIssuedAt } from "./index-DSdbWWue.js";
import { u as usePersistedTab } from "./use-persisted-tab-BgWC3rOh.js";
import { c as ClipboardList, T as TrendingUp, A as AppLayout } from "./AppLayout-Bm9Jacz4.js";
import { T as TabBar, a as TabButton } from "./tab-button-CFSdJzFr.js";
import { a as api, f as formatDate, S as SccBadge, t as today, O as OutcomeBadge, E as EaseScoreBadge, P as PackageCheck, D as DctTab, b as SccEquipmentSection, c as DairySuppliesTab } from "./SccEquipmentSection-CKTuswc2.js";
import { u as usePersistedNumberFilter, a as usePersistedFilter } from "./use-persisted-filter-mXmElOb6.js";
import { R as RecordAttachments } from "./RecordAttachments-CEzOVBRR.js";
import { D as DocAttach } from "./DocAttach-BDy6EpQ7.js";
import { T as Textarea } from "./textarea-CP7f0gNT.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-mbE4Xd2N.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-pIBlTolO.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-Z56K5RyC.js";
import { C as ChevronLeft } from "./chevron-left-CvSXi3e1.js";
import { C as ChevronRight } from "./tractor-DtgeQObp.js";
import { C as CircleCheck } from "./circle-check-rWqkW12L.js";
import { T as TriangleAlert } from "./triangle-alert-qmdOC9ih.js";
import { E as Eye } from "./eye-BmbU5KrF.js";
import { P as Pencil } from "./pencil-_mi9pi4E.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-Cdo_ftvH.js";
import { D as Droplets, S as ShieldAlert } from "./shield-alert-CFpGpxri.js";
import { F as FileDown } from "./file-down-Gnuqapjd.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, _ as ReferenceLine, C as Cell, L as Legend } from "./generateCategoricalChart-CcMlIyne.js";
import { C as ComposedChart } from "./ComposedChart-DzCCANVp.js";
import { C as CartesianGrid } from "./CartesianGrid-15GFNt4Y.js";
import { L as Line } from "./Line-ChZtnqM4.js";
import { o as openPrintWindow, a as printElementReport } from "./print-report-ClU8-1P0.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-CR9HBmUb.js";
import { P as PieChart, a as Pie } from "./PieChart-rD80kwlH.js";
import { P as Paperclip } from "./paperclip-B-Uvb9Zg.js";
import { p as printBirthRecordReport } from "./birth-record-report-BlDgWc7B.js";
import { u as useFarmReportMeta, a as useRawFarmName } from "./use-farm-name-DGxNuzy-.js";
import { P as Printer } from "./printer-Cu4qncps.js";
import { B as BcsTab, M as MobilityTab, a as BulkTankTab, R as RecordingVisitsTab } from "./RecordingVisitsTab-BPC4LtxJ.js";
import { A as AbrKitStockSection } from "./AbrKitStockSection-Dw6EbbUy.js";
import { u as useFarmMembers } from "./use-farm-members-BxOzwmyc.js";
import { S as StaffSelect } from "./staff-select-Dj_85_1I.js";
import { S as ShoppingCart } from "./shopping-cart-D_7mPpaW.js";
import { R as Receipt } from "./receipt-m-SujCKP.js";
import { B as BadgeCheck } from "./badge-check-CK446muV.js";
import { a as Clock } from "./database-O5mB7owv.js";
import { C as CircleX } from "./circle-x-Bgp8THuH.js";
import { P as Package } from "./use-safe-clerk-DUn6dsFD.js";
import { T as TrendingDown } from "./trending-down-CDxlVFBO.js";
import { C as ChevronUp } from "./chevron-up-Bk9uSuPE.js";
import { C as ConfirmDialog } from "./confirm-dialog-Daamsduu.js";
import "./shield-check-T9eggP_P.js";
import "./vmdMedicines-mq70NSvP.js";
import "./sparkles-DnAfLHCj.js";
import "./chevrons-up-down-772GQ_Bk.js";
import "./use-upload-BwYkOHyX.js";
import "./upload-CZSXlV8P.js";
import "./image-TE7nelpA.js";
import "./download-CbQlNNRE.js";
import "./api-Dhdsf4oM.js";
import "./index-Cuaeg3CY.js";
import "./index-C-vWqzvQ.js";
import "./index-D8gOUt7F.js";
import "./Area-D5PJ13B9.js";
import "./index-eUP_1YHd.js";
import "./qr-code-B4fXnpIi.js";
import "./thermometer-Dmli1woE.js";
function LabResultsBadge({ status }) {
  if (!status || status === "not-applicable") return null;
  const map = {
    pending: { label: "Lab Results Pending", cls: "bg-amber-100 text-amber-800" },
    received: { label: "Lab Results Received", cls: "bg-green-100 text-green-800" },
    concern: { label: "Lab Results — Action Needed", cls: "bg-red-100 text-red-800" }
  };
  const m = map[status];
  if (!m) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`, children: m.label });
}
function MilkMonthlySummary({ records, monthLabel: monthLabel2 }) {
  const printRef = reactExports.useRef(null);
  const totalYield = records.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const uniqueDays = new Set(records.map((r) => r.recordDate?.slice(0, 10)).filter(Boolean)).size;
  const avgDaily = uniqueDays > 0 ? totalYield / uniqueDays : 0;
  const sccReadings = records.map((r) => r.buyerSccThousands ?? r.sccThousands).filter((v) => v != null);
  const avgScc = sccReadings.length > 0 ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const abrTests = records.filter((r) => r.antibioticResidueTestResult);
  const abrPositives = abrTests.filter((r) => r.antibioticResidueTestResult === "positive").length;
  const byDay = /* @__PURE__ */ new Map();
  for (const r of records) {
    const day = r.recordDate?.slice(0, 10);
    if (!day) continue;
    const yld = parseFloat(r.yieldLitres || "0") || 0;
    const scc = r.buyerSccThousands ?? r.sccThousands ?? null;
    const ex = byDay.get(day) ?? { yield: 0, sccSum: 0, sccCount: 0 };
    byDay.set(day, {
      yield: ex.yield + yld,
      sccSum: scc != null ? ex.sccSum + scc : ex.sccSum,
      sccCount: scc != null ? ex.sccCount + 1 : ex.sccCount
    });
  }
  const chartData = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({
    day: parseInt(date.slice(8, 10)),
    date,
    yield: Math.round(v.yield * 10) / 10,
    scc: v.sccCount > 0 ? Math.round(v.sccSum / v.sccCount) : null
  }));
  const hasScc = chartData.some((d) => d.scc != null);
  function handlePrint() {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Milk Records — ${monthLabel2}</title>
      <style>body{font-family:sans-serif;font-size:13px;color:#111;padding:24px}
      h2{margin:0 0 16px}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
      .stat{border:1px solid #e5e7eb;border-radius:6px;padding:10px}
      .stat-label{font-size:11px;color:#6b7280;margin-bottom:2px}
      .stat-value{font-size:20px;font-weight:600}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;padding:6px 8px;border-bottom:2px solid #e5e7eb}
      td{padding:6px 8px;border-bottom:1px solid #f3f4f6;font-size:12px}
      </style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }, 400);
  }
  const sccColour = (v) => v == null ? "text-gray-400" : v > 400 ? "text-red-700" : v > 200 ? "text-amber-700" : "text-green-700";
  const sccBg = (v) => v == null ? "bg-gray-50 border-gray-200" : v > 400 ? "bg-red-50 border-red-200" : v > 200 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-md border border-gray-200 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-800", children: [
          "Monthly Summary — ",
          monthLabel2
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
        "Print Report"
      ] })
    ] }),
    records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No records for this month to summarise." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: printRef, style: { display: "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { children: [
          "Milk Records — ",
          monthLabel2
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Total Yield" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
              " L"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Daily Average" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—",
              " L"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "Avg SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-value", children: avgScc != null ? avgScc.toLocaleString() : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stat-label", children: "ABR Tests" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-value", children: [
              abrTests.length,
              abrPositives > 0 ? ` (${abrPositives} pos)` : ""
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Yield (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Temp (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "ABR" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Buyer Lab Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Buyer" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.sort((a, b) => (a.recordDate ?? "").localeCompare(b.recordDate ?? "")).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: new Date(r.recordDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.sessionType ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.milkTemperatureCelsius ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.antibioticResidueTestResult ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: (r.buyerSccThousands ?? r.sccThousands)?.toLocaleString() ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.buyerLabResultsStatus ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: r.milkBuyer ?? "—" })
          ] }, r.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-blue-50 border border-blue-100 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-0.5", children: "Total Yield" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-800", children: [
            totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-gray-50 border border-gray-200 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-0.5", children: "Daily Average" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-800", children: [
            uniqueDays > 0 ? Math.round(avgDaily).toLocaleString() : "—",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
          ] }),
          uniqueDays > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
            "across ",
            uniqueDays,
            " day",
            uniqueDays !== 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2.5 ${sccBg(avgScc)}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mb-0.5 ${avgScc == null ? "text-gray-500" : avgScc > 400 ? "text-red-600" : avgScc > 200 ? "text-amber-600" : "text-green-600"}`, children: "Avg SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${sccColour(avgScc)}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
          avgScc != null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${sccColour(avgScc)}`, children: avgScc <= 200 ? "Within threshold" : avgScc <= 400 ? "Above 200k — monitor" : "High — action needed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-md border px-3 py-2.5 ${abrPositives > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mb-0.5 ${abrPositives > 0 ? "text-red-600" : "text-gray-500"}`, children: "ABR Tests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${abrPositives > 0 ? "text-red-700" : "text-gray-700"}`, children: abrTests.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${abrPositives > 0 ? "text-red-600 font-medium" : "text-gray-400"}`, children: abrTests.length === 0 ? "No tests recorded" : abrPositives > 0 ? `${abrPositives} positive result${abrPositives > 1 ? "s" : ""}` : "All negative" })
        ] })
      ] }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide", children: [
          "Daily Yield",
          hasScc ? " & SCC Trend" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: hasScc ? 52 : 12, bottom: 0, left: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "yield", tick: { fontSize: 11, fill: "#9ca3af" }, tickLine: false, axisLine: false, width: 50, tickFormatter: (v) => `${v}L` }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "scc", orientation: "right", tick: { fontSize: 11, fill: "#fb923c" }, tickLine: false, axisLine: false, width: 44, tickFormatter: (v) => `${v}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              content: ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-md shadow px-3 py-2 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700 mb-1", children: (/* @__PURE__ */ new Date(d.date + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) }),
                  d.yield > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-600", children: [
                    "Yield: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.yield.toLocaleString(),
                      " L"
                    ] })
                  ] }),
                  d.scc != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-orange-500", children: [
                    "SCC: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      d.scc.toLocaleString(),
                      " k/mL"
                    ] })
                  ] })
                ] });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "yield", dataKey: "yield", fill: "#3b82f6", fillOpacity: 0.8, radius: [3, 3, 0, 0], name: "Yield (L)", maxBarSize: 32 }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "scc", type: "monotone", dataKey: "scc", stroke: "#f97316", strokeWidth: 2.5, dot: { r: 3.5, fill: "#f97316", strokeWidth: 0 }, connectNulls: true, name: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { yAxisId: "scc", y: 200, stroke: "#f97316", strokeDasharray: "5 3", strokeOpacity: 0.45, label: { value: "200k", position: "right", fontSize: 10, fill: "#f97316" } })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-3 h-3 rounded-sm bg-blue-500 opacity-80" }),
            "Daily yield (L)"
          ] }),
          hasScc && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-4 border-t-2 border-orange-400" }),
            "SCC (k/mL) — dashed line = 200k threshold"
          ] })
        ] })
      ] })
    ] })
  ] });
}
const UK_MILK_BUYERS = [
  "Arla Foods UK",
  "Müller Milk & Ingredients",
  "First Milk",
  "Crediton Dairy",
  "Dale Farm",
  "Freshways Dairy",
  "Glanbia Cheese",
  "Graham's The Family Dairy",
  "Hook & Son",
  "Medina Dairy",
  "Norseland",
  "Saputo Dairy UK",
  "The Collective Dairy",
  "Yeo Valley Farms"
];
function MilkRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const now = /* @__PURE__ */ new Date();
  const [filterYear, setFilterYear] = usePersistedNumberFilter({ page: "dairy-milk", filter: "year", farmId, defaultValue: now.getFullYear() });
  const [filterMonth, setFilterMonth] = usePersistedNumberFilter({ page: "dairy-milk", filter: "month", farmId, defaultValue: now.getMonth() });
  function stepMonth(dir) {
    const next = filterMonth + dir;
    if (next < 0) {
      setFilterYear(filterYear - 1);
      setFilterMonth(11);
    } else if (next > 11) {
      setFilterYear(filterYear + 1);
      setFilterMonth(0);
    } else {
      setFilterMonth(next);
    }
  }
  const monthLabel2 = new Date(filterYear, filterMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-milk", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/milk-records`), { credentials: "include" }).then((r) => r.json())
  });
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`), { credentials: "include" }).then((r) => r.json())
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const staffNamesQ = useQuery({
    queryKey: ["dairy-staff-names", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/staff-names`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 5 * 60 * 1e3
  });
  const staffNames = staffNamesQ.data?.names ?? [];
  const filteredRecords = (data?.records ?? []).filter((r) => {
    if (!r.recordDate) return false;
    const d = new Date(r.recordDate);
    return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/milk-records/${editing.id}`) : api(`farms/${farmId}/dairy/milk-records`);
      const r = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || void 0 }) });
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setAbrKitStockId("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/milk-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-milk", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ recordDate: today(), recordType: "bulk-tank", buyerLabResultsStatus: "not-applicable" });
    setAbrKitStockId("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setAbrKitStockId("");
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const labStatus = form.buyerLabResultsStatus;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Add Record"
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Milk Record — ",
        formatDate(viewRecord.recordDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-sm overflow-y-auto max-h-[70vh]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Collection Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Record Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.recordType ?? "—").replace(/-/g, " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milking Session" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: String(viewRecord.sessionType ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milk Buyer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.milkBuyer ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Yield (litres)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.yieldLitres ? `${parseFloat(viewRecord.yieldLitres).toLocaleString()} L` : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Collector Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.collectorReference ?? "—" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "On-Farm Measurements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Milk Temperature (°C)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.milkTemperatureCelsius ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Temp Tested By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.tempTestedBy ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Test Result" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.antibioticResidueTestResult ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Tested By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.abrTestedBy ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Kit Lot No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.abrTestKitLot ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ABR Kit Batch No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.abrTestKitBatch ?? "—" })
            ] }),
            (viewRecord.sccThousands || viewRecord.tbcCfuMl || viewRecord.fatPercent) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "SCC (k/mL) — On-farm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRecord.sccThousands })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "TBC (cfu/mL)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.tbcCfuMl?.toLocaleString() ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.fatPercent ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Protein %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.proteinPercent ?? "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lactose %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.lactosePercent ?? "—" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Buyer Lab Results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(LabResultsBadge, { status: viewRecord.buyerLabResultsStatus }),
              (!viewRecord.buyerLabResultsStatus || viewRecord.buyerLabResultsStatus === "not-applicable") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: "Not applicable" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Results Received Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabResultsDate ? formatDate(viewRecord.buyerLabResultsDate) : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Buyer Lab Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLabRef ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "SCC (k/mL) — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: viewRecord.buyerSccThousands })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "TBC (cfu/mL) — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerTbcCfuMl?.toLocaleString() ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Fat % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerFatPercent ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Protein % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerProteinPercent ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Lactose % — Buyer Lab" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.buyerLactosePercent ?? "—" })
            ] })
          ] })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", children: "Documents & Attachments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "dairy_milk_record", recordId: viewRecord.id, farmId })
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(-1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Previous month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 text-gray-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: monthLabel2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => stepMonth(1), className: "p-1 rounded hover:bg-gray-200 transition-colors", "aria-label": "Next month", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-600" }) })
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkMonthlySummary, { records: filteredRecords, monthLabel: monthLabel2 }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: data?.records?.length ? `No records for ${monthLabel2} — use the arrows to browse other months.` : "No milk records yet — click Add Record to begin." }) }),
      filteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: formatDate(r.recordDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 capitalize", children: [
              r.recordType.replace(/-/g, " "),
              r.sessionType ? ` · ${r.sessionType}` : ""
            ] }),
            r.milkBuyer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: r.milkBuyer }),
            r.yieldLitres && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
              parseFloat(r.yieldLitres).toLocaleString(),
              " L"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SccBadge, { v: r.sccThousands || r.buyerSccThousands }),
            r.antibioticResidueTestResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-700" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: [
              r.antibioticResidueTestResult === "negative" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "ABR: ",
              r.antibioticResidueTestResult
            ] }),
            r.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700", children: "↩ Retest" }),
            !r.isRetest && (data?.records ?? []).some((rt) => rt.retestOfId === r.id && rt.antibioticResidueTestResult === "negative") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "✓ Retested — Negative" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LabResultsBadge, { status: r.buyerLabResultsStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "dairy/milk-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["dairy-milk", farmId], compact: true }),
            (r.antibioticResidueTestResult && r.antibioticResidueTestResult !== "negative" || r.sccThousands && Number(r.sccThousands ?? 0) > 200 || r.buyerSccThousands && Number(r.buyerSccThousands ?? 0) > 200) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-purple-600", title: "Raise Task — quality alert", onClick: () => setRaiseTaskFor(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1 truncate", children: r.notes })
      ] }) }, r.id))
    ] }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Milk Quality Alert — ${raiseTaskFor.antibioticResidueTestResult && raiseTaskFor.antibioticResidueTestResult !== "negative" ? `ABR ${raiseTaskFor.antibioticResidueTestResult.charAt(0).toUpperCase()}${raiseTaskFor.antibioticResidueTestResult.slice(1)}` : "High SCC"}`,
        defaultDescription: `Date: ${raiseTaskFor.recordDate ?? "—"} · ABR: ${raiseTaskFor.antibioticResidueTestResult ?? "—"} · SCC: ${raiseTaskFor.sccThousands ?? raiseTaskFor.buyerSccThousands ?? "—"} k/mL · Buyer: ${raiseTaskFor.milkBuyer ?? "—"}`,
        module: "dairy"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "64rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Milk Record" : "Add Milk Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "session", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "session", children: "Milking Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collection", children: "Collection & Buyer Lab" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "session", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[68vh] space-y-5 pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3", children: "Milking Event" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.recordDate || "", onChange: (e) => set("recordDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.recordType || "bulk-tank", onValueChange: (v) => set("recordType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "bulk-tank", children: "Bulk Tank (Quality Sample)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "individual-cow", children: "Individual Cow" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "herd-total", children: "Herd Total" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milking Session" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sessionType || "", onValueChange: (v) => set("sessionType", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "morning", children: "Morning" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "afternoon", children: "Afternoon" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "evening", children: "Evening" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily-total", children: "Daily Total" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (litres)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.yieldLitres || "", onChange: (e) => set("yieldLitres", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3", children: "On-Farm Measurements" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Temperature (°C)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.milkTemperatureCelsius || "", onChange: (e) => set("milkTemperatureCelsius", e.target.value), placeholder: "Target ≤4°C" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature Tested By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "staff-names-list", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "staff-names-list", placeholder: "Name of person who took reading", value: form.tempTestedBy || "", onChange: (e) => set("tempTestedBy", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Result" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.antibioticResidueTestResult || "", onValueChange: (v) => set("antibioticResidueTestResult", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not tested" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative (safe to supply)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive (milk discarded)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid (test void)" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Tested By" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "staff-names-list", placeholder: "Name of tester", value: form.abrTestedBy || "", onChange: (e) => set("abrTestedBy", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Stock Record" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: abrKitStockId, onValueChange: setAbrKitStockId, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link kit (auto-decrements stock)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None / not tracking" }),
                    abrStock.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                      s.productName,
                      s.lotNumber ? ` · Lot ${s.lotNumber}` : "",
                      " (",
                      s.quantityRemaining,
                      " remaining)"
                    ] }, s.id))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Lot Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit packaging", value: form.abrTestKitLot || "", onChange: (e) => set("abrTestKitLot", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Batch Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "From kit packaging", value: form.abrTestKitBatch || "", onChange: (e) => set("abrTestKitBatch", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 border-t border-amber-100 pt-3 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "is-retest-abr", checked: !!form.isRetest, onChange: (e) => {
                    set("isRetest", e.target.checked);
                    if (!e.target.checked) set("retestOfId", null);
                  }, className: "w-4 h-4 rounded" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest-abr", className: "font-normal cursor-pointer", children: "This is a follow-up retest of a previous non-negative result" })
                ] }),
                form.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retest of (original concerning record)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.retestOfId ? String(form.retestOfId) : "", onValueChange: (v) => set("retestOfId", v ? Number(v) : null), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select the original record…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (data?.records ?? []).filter((r) => r.id !== editing?.id && ["positive", "borderline", "invalid"].includes(r.antibioticResidueTestResult ?? "")).slice(0, 40).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                      new Date(r.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                      " — ABR ",
                      r.antibioticResidueTestResult
                    ] }, r.id)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "A Negative retest will auto-resolve the alert for the original record." })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 border-t border-blue-200 pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mb-2 font-medium", children: "On-farm quality measurements (optional — if tested on-farm separately from buyer)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-5 gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccThousands || "", onChange: (e) => set("sccThousands", e.target.value ? parseInt(e.target.value) : void 0) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (cfu/mL)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.tbcCfuMl || "", onChange: (e) => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : void 0) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.fatPercent || "", onChange: (e) => set("fatPercent", e.target.value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.proteinPercent || "", onChange: (e) => set("proteinPercent", e.target.value) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose %" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.lactosePercent || "", onChange: (e) => set("lactosePercent", e.target.value) })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collection", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[68vh] space-y-5 pr-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800 mb-1", children: "One collection covers multiple milkings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "A tanker typically collects from the bulk tank every 2–3 days. Enter the same Collector / Tanker Reference on every milking session that went into one collection load. The buyer's lab results are tied to the collection event, not to each individual milking." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3", children: "Collection Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Buyer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "milk-buyer-list", children: UK_MILK_BUYERS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b }, b)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "milk-buyer-list", placeholder: "Type or select buyer…", value: form.milkBuyer || "", onChange: (e) => set("milkBuyer", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collector / Tanker Ref" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectorReference || "", onChange: (e) => set("collectorReference", e.target.value) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-purple-100 bg-purple-50 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1", children: "Buyer Lab Results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-purple-600 mb-3", children: "Transcribe results from your milk buyer's lab report. These are the official figures used for payment and compliance." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Results Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: labStatus || "not-applicable", onValueChange: (v) => set("buyerLabResultsStatus", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-applicable", children: "Not applicable (no buyer lab for this record)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending — awaiting results from buyer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received — results logged below" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "concern", children: "Concern — results require action" })
                  ] })
                ] })
              ] }),
              (labStatus === "received" || labStatus === "concern") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Results Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.buyerLabResultsDate || "", onChange: (e) => set("buyerLabResultsDate", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lab Reference" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Lab report reference / slip number", value: form.buyerLabRef || "", onChange: (e) => set("buyerLabRef", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL) — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerSccThousands || "", onChange: (e) => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : void 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (cfu/mL) — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerTbcCfuMl || "", onChange: (e) => set("buyerTbcCfuMl", e.target.value ? parseInt(e.target.value) : void 0) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerFatPercent || "", onChange: (e) => set("buyerFatPercent", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerProteinPercent || "", onChange: (e) => set("buyerProteinPercent", e.target.value) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose % — Buyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerLactosePercent || "", onChange: (e) => set("buyerLactosePercent", e.target.value) })
                ] })
              ] })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.recordDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) })
  ] });
}
function normalizeGrade(g) {
  if (!g) return "";
  const s = g.trim();
  if (s === "1" || /grade\s*1/i.test(s) || /^mild/i.test(s)) return "Mild";
  if (s === "2" || /grade\s*2/i.test(s) || /^moderate/i.test(s)) return "Moderate";
  if (s === "3" || /grade\s*3/i.test(s) || /^severe/i.test(s)) return "Severe";
  if (s === "4" || /grade\s*4/i.test(s) || /^subclinical/i.test(s)) return "Subclinical";
  return s;
}
const GRADE_PIE_COLOURS = ["#6366f1", "#f59e0b", "#f97316", "#ef4444", "#94a3b8"];
const OUTCOME_PIE_COLOURS = ["#22c55e", "#eab308", "#f97316", "#3b82f6", "#ef4444", "#94a3b8"];
function MastitisTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [filterPreset, setFilterPreset] = usePersistedFilter({ page: "dairy-mastitis", filter: "preset", farmId, defaultValue: "12m" });
  const [filterEarTag, setFilterEarTag] = reactExports.useState("");
  const [filterOutcome, setFilterOutcome] = usePersistedFilter({ page: "dairy-mastitis", filter: "outcome", farmId, defaultValue: "" });
  const [filterGrade, setFilterGrade] = usePersistedFilter({ page: "dairy-mastitis", filter: "grade", farmId, defaultValue: "" });
  const [showReports, setShowReports] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-mastitis", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/mastitis-records`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const mastitisAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "mastitis").map((c) => [c.recordId, c.count]));
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/mastitis-records/${editing.id}`) : api(`farms/${farmId}/dairy/mastitis-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/mastitis-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-mastitis", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ onsetDate: today() });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, treatmentStartDate: r.treatmentStartDate?.slice(0, 10), withdrawalEndDate: r.withdrawalEndDate?.slice(0, 10), outcomeDate: r.outcomeDate?.slice(0, 10) });
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const allRecords = data?.records ?? [];
  const presetFrom = React.useMemo(() => {
    if (filterPreset === "all") return null;
    const d = /* @__PURE__ */ new Date();
    if (filterPreset === "30d") d.setDate(d.getDate() - 30);
    else if (filterPreset === "90d") d.setDate(d.getDate() - 90);
    else d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, [filterPreset]);
  const filtered = React.useMemo(() => allRecords.filter((r) => {
    const d = r.onsetDate.slice(0, 10);
    if (presetFrom && d < presetFrom) return false;
    if (filterEarTag && !r.earTagNumber?.toLowerCase().includes(filterEarTag.toLowerCase())) return false;
    if (filterOutcome && r.outcome !== filterOutcome) return false;
    if (filterGrade && normalizeGrade(r.clinicalGrade) !== filterGrade) return false;
    return true;
  }), [allRecords, presetFrom, filterEarTag, filterOutcome, filterGrade]);
  const kpis = React.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    const activeCases = filtered.filter((r) => r.outcome === "ongoing" || !r.outcome).length;
    const inWithdrawal = filtered.filter((r) => r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= now).length;
    const tagCounts = {};
    filtered.forEach((r) => {
      if (r.earTagNumber) tagCounts[r.earTagNumber] = (tagCounts[r.earTagNumber] || 0) + 1;
    });
    const recurrentCows = Object.values(tagCounts).filter((c) => c >= 2).length;
    const pathogenCounts = {};
    filtered.forEach((r) => {
      if (r.bacterialCultureResult?.trim()) {
        const p = r.bacterialCultureResult.trim();
        pathogenCounts[p] = (pathogenCounts[p] || 0) + 1;
      }
    });
    const topPathogen = Object.entries(pathogenCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const quarterCounts = {};
    filtered.forEach((r) => {
      if (r.quartersAffected) quarterCounts[r.quartersAffected] = (quarterCounts[r.quartersAffected] || 0) + 1;
    });
    const topQuarter = Object.entries(quarterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { total: filtered.length, activeCases, inWithdrawal, recurrentCows, topPathogen, topQuarter, tagCounts };
  }, [filtered]);
  const outbreakWindow = React.useMemo(() => {
    if (filtered.length < 3) return null;
    const sorted = [...filtered].sort((a, b) => a.onsetDate.localeCompare(b.onsetDate));
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].onsetDate);
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + 14);
      const inWindow = sorted.filter((r) => {
        const d = new Date(r.onsetDate);
        return d >= windowStart && d <= windowEnd;
      });
      if (inWindow.length >= 3) return { count: inWindow.length, start: sorted[i].onsetDate, end: inWindow[inWindow.length - 1].onsetDate };
    }
    return null;
  }, [filtered]);
  const reportData = React.useMemo(() => {
    const monthMap = {};
    filtered.forEach((r) => {
      const d = new Date(r.onsetDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthlyTrend = Object.keys(monthMap).sort().map((m) => ({
      month: (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      cases: monthMap[m]
    }));
    const gradeMap = {};
    filtered.forEach((r) => {
      const g = normalizeGrade(r.clinicalGrade);
      if (g) gradeMap[g] = (gradeMap[g] || 0) + 1;
    });
    const gradeData = Object.entries(gradeMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const pathMap = {};
    filtered.forEach((r) => {
      if (r.bacterialCultureResult?.trim()) {
        const p = r.bacterialCultureResult.trim();
        pathMap[p] = (pathMap[p] || 0) + 1;
      }
    });
    const pathogenData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const outcomeMap = {};
    filtered.forEach((r) => {
      const o = r.outcome || "not recorded";
      outcomeMap[o] = (outcomeMap[o] || 0) + 1;
    });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name, value }));
    const cowMap = {};
    filtered.forEach((r) => {
      if (!r.earTagNumber) return;
      if (!cowMap[r.earTagNumber]) cowMap[r.earTagNumber] = { count: 0, grades: [], lastDate: "" };
      cowMap[r.earTagNumber].count++;
      const ng = normalizeGrade(r.clinicalGrade);
      if (ng) cowMap[r.earTagNumber].grades.push(ng);
      if (!cowMap[r.earTagNumber].lastDate || r.onsetDate > cowMap[r.earTagNumber].lastDate) cowMap[r.earTagNumber].lastDate = r.onsetDate;
    });
    const problemCows = Object.entries(cowMap).filter(([, v]) => v.count >= 2).map(([tag, v]) => ({ tag, ...v })).sort((a, b) => b.count - a.count);
    return { monthlyTrend, gradeData, pathogenData, outcomeData, problemCows };
  }, [filtered]);
  function generateMastitisReport() {
    const periodLabel = filterPreset === "30d" ? "Last 30 days" : filterPreset === "90d" ? "Last 90 days" : filterPreset === "12m" ? "Last 12 months" : "All records";
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const rows = filtered.map((r) => `<tr>
      <td>${fmtD(r.onsetDate)}</td>
      <td>${r.earTagNumber || "—"}</td>
      <td>${r.quartersAffected || "—"}</td>
      <td>${r.clinicalGrade || "—"}</td>
      <td>${r.bacterialCultureResult || "—"}</td>
      <td>${r.treatmentProduct || "—"}</td>
      <td>${r.outcome ? r.outcome.charAt(0).toUpperCase() + r.outcome.slice(1).replace("-", " ") : "Ongoing"}</td>
      <td>${fmtD(r.withdrawalEndDate)}</td>
    </tr>`).join("");
    const pathRows = reportData.pathogenData.map((p) => `<tr><td>${p.name}</td><td>${p.value}</td><td>${filtered.length > 0 ? (p.value / filtered.length * 100).toFixed(0) : 0}%</td></tr>`).join("");
    const problemRows = reportData.problemCows.map((c) => `<tr><td>${c.tag}</td><td>${c.count}</td><td>${c.grades.join(", ") || "—"}</td><td>${fmtD(c.lastDate)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Mastitis Records — Compliance Report</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  h3{font-size:11px;margin:12px 0 6px}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#111}
  .kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm}}
</style></head><body>
<div class="hdr">
  <div><h1>Mastitis Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2><p style="margin:4px 0;font-size:9px;color:#6b7280">Period: <strong>${periodLabel}</strong></p></div>
  <div class="hdr-r"><b>${filtered.length} record${filtered.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<div class="kpi">
  <div class="kpi-box"><div class="kpi-val">${kpis.total}</div><div class="kpi-lbl">Total cases</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.activeCases}</div><div class="kpi-lbl">Active / ongoing</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.recurrentCows}</div><div class="kpi-lbl">Recurrent cows (≥2 cases)</div></div>
  <div class="kpi-box"><div class="kpi-val">${kpis.topPathogen ?? "—"}</div><div class="kpi-lbl">Most common pathogen</div></div>
</div>
${pathRows ? `<h3>Pathogen Breakdown</h3><table><tr><th>Pathogen</th><th>Cases</th><th>% of total</th></tr>${pathRows}</table>` : ""}
${problemRows ? `<h3>Recurrent Cows (2+ episodes in period)</h3><table><tr><th>Ear Tag</th><th>Episodes</th><th>Grades</th><th>Last case</th></tr>${problemRows}</table>` : ""}
<h3>All Records — ${periodLabel}</h3>
<table>
  <tr><th>Date</th><th>Ear Tag</th><th>Quarter</th><th>Grade</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th><th>Withdrawal ends</th></tr>
  ${rows || "<tr><td colspan='8'>No records</td></tr>"}
</table>
<p class="note">This mastitis records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const filtersActive = filterEarTag || filterOutcome || filterGrade || filterPreset !== "12m";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-4 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border border-gray-200 overflow-hidden text-xs", children: ["30d", "90d", "12m", "all"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFilterPreset(p),
          className: `px-3 py-1.5 font-medium transition-colors ${filterPreset === p ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
          children: p === "30d" ? "30 days" : p === "90d" ? "90 days" : p === "12m" ? "12 months" : "All time"
        },
        p
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-44 h-8 text-sm", placeholder: "Search ear tag…", value: filterEarTag, onChange: (e) => setFilterEarTag(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: filterOutcome,
          onChange: (e) => setFilterOutcome(e.target.value),
          className: "h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All outcomes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ongoing", children: "Ongoing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cured", children: "Cured" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "chronic", children: "Chronic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dried-off", children: "Dried off" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "culled", children: "Culled" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: filterGrade,
          onChange: (e) => setFilterGrade(e.target.value),
          className: "h-8 rounded-md border border-input bg-background px-2 text-sm text-gray-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All grades" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Subclinical", children: "Subclinical" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mild", children: "Mild" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Moderate", children: "Moderate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Severe", children: "Severe" })
          ]
        }
      ),
      filtersActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setFilterEarTag("");
            setFilterOutcome("");
            setFilterGrade("");
            setFilterPreset("12m");
          },
          className: "text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2",
          children: "Clear"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowReports((v) => !v),
            className: `h-8 px-3 rounded-md border text-sm font-medium transition-colors flex items-center gap-1.5 ${showReports ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-3.5 w-3.5" }),
              showReports ? "Hide Reports" : "Reports"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateMastitisReport, disabled: filtered.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-3.5 w-3.5 mr-1" }),
          "Print Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: kpis.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Total cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.activeCases > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.activeCases > 0 ? "text-yellow-700" : "text-gray-800"}`, children: kpis.activeCases }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Active cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.inWithdrawal > 0 ? "bg-amber-50 border-amber-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.inWithdrawal > 0 ? "text-amber-700" : "text-gray-800"}`, children: kpis.inWithdrawal }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "In withdrawal" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border px-3 py-2.5 text-center ${kpis.recurrentCows > 0 ? "bg-orange-50 border-orange-200" : "bg-white"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${kpis.recurrentCows > 0 ? "text-orange-700" : "text-gray-800"}`, children: kpis.recurrentCows }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Recurrent cows" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 truncate", title: kpis.topPathogen ?? "", children: kpis.topPathogen ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Top pathogen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-white px-3 py-2.5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800", children: kpis.topQuarter ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Top quarter" })
      ] })
    ] }),
    outbreakWindow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-800", children: "Possible outbreak detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700 mt-0.5", children: [
          outbreakWindow.count,
          " new cases recorded within a 14-day window (",
          formatDate(outbreakWindow.start),
          " – ",
          formatDate(outbreakWindow.end),
          "). This pattern may indicate an environmental pathogen spreading through the herd. Review bacterial culture results and consult your vet."
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: showReports ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No records match the current filters." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Monthly Case Trend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "New mastitis cases per calendar month in the selected period" }),
        reportData.monthlyTrend.length < 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-8", children: "Not enough data across multiple months. Widen the date filter to see a trend." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: reportData.monthlyTrend, margin: { top: 4, right: 8, left: -20, bottom: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cases", name: "Cases", fill: "#fca5a5", radius: [3, 3, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "cases", name: "Trend", stroke: "#dc2626", strokeWidth: 2, dot: { fill: "#dc2626", r: 3 } })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Clinical Grade" }),
          reportData.gradeData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No grade data recorded" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: reportData.gradeData, cx: "50%", cy: "50%", outerRadius: 60, dataKey: "value", labelLine: false, children: reportData.gradeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: reportData.gradeData.map((g, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block flex-shrink-0", style: { background: GRADE_PIE_COLOURS[i % GRADE_PIE_COLOURS.length] } }),
                g.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: g.value })
            ] }, i)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Outcome Breakdown" }),
          reportData.outcomeData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No outcome data recorded" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 150, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: reportData.outcomeData, cx: "50%", cy: "50%", outerRadius: 60, dataKey: "value", labelLine: false, children: reportData.outcomeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length] }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: reportData.outcomeData.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full inline-block flex-shrink-0", style: { background: OUTCOME_PIE_COLOURS[i % OUTCOME_PIE_COLOURS.length] } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: o.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: o.value })
            ] }, i)) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Pathogen Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Culture results only" }),
          reportData.pathogenData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 text-center py-6", children: "No culture results recorded yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 mt-1", children: reportData.pathogenData.map((p, i) => {
            const maxVal = reportData.pathogenData[0].value;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-28 truncate text-gray-700 font-mono text-[11px]", title: p.name, children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-gray-100 rounded-full h-2 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-purple-500 rounded-full", style: { width: `${p.value / maxVal * 100}%` } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 text-right text-gray-600 font-semibold", children: p.value })
            ] }, i);
          }) })
        ] }) })
      ] }),
      reportData.problemCows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Recurrent Cases — Problem Cows" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Animals with 2 or more mastitis episodes in the selected period. Key candidates for selective dry cow therapy review and veterinary discussion." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Ear Tag" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Episodes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Grades seen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Last episode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: reportData.problemCows.map((cow) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 font-mono text-gray-800 font-medium", children: cow.tag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cow.count >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: cow.count }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-gray-600 text-xs", children: [...new Set(cow.grades)].join(", ") || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-gray-600", children: formatDate(cow.lastDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setFilterEarTag(cow.tag);
                  setShowReports(false);
                },
                className: "text-xs text-green-700 hover:underline",
                children: "View records"
              }
            ) })
          ] }, cow.tag)) })
        ] }) })
      ] }) })
    ] }) }) : (
      /* ── Record list ── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: allRecords.length === 0 ? "No mastitis records yet." : "No records match the current filters." }) }),
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.onsetDate) }),
              r.earTagNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700 font-mono", children: r.earTagNumber }),
              r.earTagNumber && (kpis.tagCounts[r.earTagNumber] ?? 0) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium", children: [
                kpis.tagCounts[r.earTagNumber],
                "× recurring"
              ] }),
              r.quartersAffected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded", children: r.quartersAffected }),
              r.clinicalGrade && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                "Grade: ",
                normalizeGrade(r.clinicalGrade)
              ] }),
              r.treatmentProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.treatmentProduct }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { v: r.outcome }),
              r.withdrawalEndDate && new Date(r.withdrawalEndDate) >= /* @__PURE__ */ new Date() && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium", children: [
                "Withdrawal ends ",
                formatDate(r.withdrawalEndDate)
              ] }),
              (mastitisAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                mastitisAttachMap[r.id]
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
        ] }) }, r.id))
      ] })
    ) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mastitis Record — ",
        viewRecord.earTagNumber || formatDate(viewRecord.onsetDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Onset Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.onsetDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cow Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.earTagNumber || "—" }),
            viewRecord.earTagNumber && (kpis.tagCounts[viewRecord.earTagNumber] ?? 0) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full", children: [
              kpis.tagCounts[viewRecord.earTagNumber],
              "× recurring"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quarters Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quartersAffected || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Clinical Grade" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: normalizeGrade(viewRecord.clinicalGrade) || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bacterial Culture" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.bacterialCultureResult || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Onset" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.sccAtOnset ? `${viewRecord.sccAtOnset.toLocaleString()} k/mL` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.treatmentProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.treatmentStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.treatmentDurationDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Withdrawal End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.withdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.outcome || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.outcomeDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Consulted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetConsulted ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetName || "—" })
        ] }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "mastitis", recordId: viewRecord.id }) })
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
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mastitis Record" : "Add Mastitis Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Onset Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.onsetDate?.slice(0, 10) || "", onChange: (e) => set("onsetDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Ear Tag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.earTagNumber || "", onChange: (e) => set("earTagNumber", e.target.value), placeholder: "e.g. UK123456 000001" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quarters Affected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quartersAffected || "", onValueChange: (v) => set("quartersAffected", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select quarters..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF", children: "Left Front (LF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RF", children: "Right Front (RF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LR", children: "Left Rear (LR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RR", children: "Right Rear (RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF, RF", children: "Both Fronts (LF + RF)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LR, RR", children: "Both Rears (LR + RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LF, LR", children: "Left Side (LF + LR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "RF, RR", children: "Right Side (RF + RR)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "All quarters", children: "All Four Quarters" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clinical Grade" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.clinicalGrade || "", onValueChange: (v) => set("clinicalGrade", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select grade..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Subclinical", children: "Subclinical (high SCC, no visible signs)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Mild", children: "Mild (clots in milk, slight swelling)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Moderate", children: "Moderate (swollen quarter, cow lame/off-feed)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Severe", children: "Severe (toxic cow, systemic signs)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : void 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bacterial Culture Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bacterialCultureResult || "", onChange: (e) => set("bacterialCultureResult", e.target.value), placeholder: "e.g. Staph. aureus, E. coli, Strep. uberis" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Treatment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct || "", onChange: (e) => set("treatmentProduct", e.target.value), placeholder: "e.g. Ubrolexin intramammary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.treatmentStartDate || "", onChange: (e) => set("treatmentStartDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration (days)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentDurationDays || "", onChange: (e) => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : void 0) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withdrawal End Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.withdrawalEndDate || "", onChange: (e) => set("withdrawalEndDate", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Outcome & Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome || "", onValueChange: (v) => set("outcome", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select outcome..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ongoing", children: "Ongoing (still treating)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cured", children: "Cured" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chronic", children: "Chronic (no cure achieved)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dried-off", children: "Quarter/Cow Dried Off" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "culled", children: "Culled" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.outcomeDate || "", onChange: (e) => set("outcomeDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vc", checked: !!form.vetConsulted, onChange: (e) => set("vetConsulted", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vc", children: "Vet consulted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 3 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.onsetDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Record"
        ] })
      ] })
    ] }) })
  ] });
}
function CalvingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const farmMeta = useFarmReportMeta(farmId);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [showManualEarTag, setShowManualEarTag] = reactExports.useState(false);
  const [showManualVet, setShowManualVet] = reactExports.useState(false);
  const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "dairy-calving", filter: "year", farmId, defaultValue: String(CURRENT_YEAR) });
  const printBirthRecord = (record) => {
    const offspringCount = Math.max(1, record.numberOfCalves ?? 1, record.calfOutcome2 || record.calfSex2 || record.calfEarTag2 ? 2 : 0);
    const offspring = Array.from({ length: offspringCount }, (_, index) => {
      const suffix = index === 0 ? "" : String(index + 1);
      const get = (field) => record[`${field}${suffix}`];
      return {
        label: `Calf ${index + 1}`,
        outcome: get("calfOutcome"),
        sex: get("calfSex"),
        tag: get("calfEarTag"),
        animalId: get("calfAnimalId"),
        weightKg: get("calfBirthWeightKg"),
        colostrum: index === 0 ? `Within 2 hours: ${record.colostrumGivenWithin2Hours == null ? "—" : record.colostrumGivenWithin2Hours ? "Yes" : "No"} · Within 6 hours: ${record.colostrumGivenWithin6Hours == null ? "—" : record.colostrumGivenWithin6Hours ? "Yes" : "No"}` : null
      };
    });
    printBirthRecordReport({
      species: "cattle",
      recordId: record.id,
      ...farmMeta,
      birthDate: record.calvingDate,
      damLabel: record.cowEarTag,
      damId: record.cowAnimalId,
      offspring,
      sire: record.sireRegisterId,
      sireBreed: record.sireBreed ?? record.calfBreed,
      conceptionMethod: record.conceptionMethod,
      ease: record.calvingEaseScore ? `${record.calvingEaseScore} — ${["", "Unassisted", "Easy assist", "Hard assist", "Vet / caesarean"][record.calvingEaseScore] ?? "Recorded"}` : null,
      assistance: record.assistanceRequired,
      assistanceType: record.assistanceType,
      vet: record.vetAttended ? record.vetName || "Veterinary attendance recorded" : "No veterinary attendance recorded",
      complications: record.cowComplications,
      colostrumWithin2Hours: record.colostrumGivenWithin2Hours,
      colostrumWithin6Hours: record.colostrumGivenWithin6Hours,
      colostrumSource: record.colostrumSource,
      colostrumVolume: record.colostrumVolumeFirstFeedLitres,
      disposition: record.calfDisposition,
      registration: record.bcmsPassportApplied == null ? null : record.bcmsPassportApplied ? "BCMS passport applied" : "BCMS passport pending",
      perinatalDisposal: [record.perinatalCollectionDate, record.perinatalCollectionRef, record.perinatalDisposalMethod, record.perinatalDisposalNotes].filter(Boolean).join(" · ") || null,
      notes: record.notes,
      attachmentCount: calvingAttachMap[record.id] ?? 0
    });
  };
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-calving", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/calving-records`), { credentials: "include" }).then((r) => r.json())
  });
  const animalsQ = useQuery({
    queryKey: ["calving-animals", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/animals`), { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const CATTLE_SPECIES = ["cattle", "bovine"];
  const cows = (animalsQ.data?.records ?? []).filter(
    (a) => CATTLE_SPECIES.includes(a.species?.toLowerCase()) && a.status === "active" && a.earTagNumber
  );
  const vetVisitsQ = useQuery({
    queryKey: ["calving-vet-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vet-visits`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && !!form.vetAttended
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map((v) => v.vetName).filter(Boolean))];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter((v) => v.vetName && v.vetPractice).map((v) => [v.vetName, v.vetPractice])
  );
  const siresQ = useQuery({
    queryKey: ["calving-sires", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sires`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && form.conceptionMethod === "natural"
  });
  const activeSires = (siresQ.data?.records ?? []).filter((s) => s.isActive !== false && s.species?.toLowerCase() === "cattle");
  const strawsQ = useQuery({
    queryKey: ["calving-straws", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/straws`), { credentials: "include" }).then((r) => r.json()),
    enabled: open && form.conceptionMethod === "ai"
  });
  const cattleStraws = (strawsQ.data?.records ?? []).filter((s) => s.sireSpecies?.toLowerCase() === "cattle");
  const { data: attachCountsRaw = [] } = useQuery({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/record-attachments/counts`), { credentials: "include" }).then((r) => r.json()),
    staleTime: 3e4
  });
  const calvingAttachMap = Object.fromEntries(attachCountsRaw.filter((c) => c.recordType === "calving").map((c) => [c.recordId, c.count]));
  const contractorsQ = useQuery({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fallen-stock-contractors`), { credentials: "include" }).then((r) => r.json()),
    enabled: open
  });
  const contractors = contractorsQ.data ?? [];
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/calving-records/${editing.id}`) : api(`farms/${farmId}/dairy/calving-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setShowManualEarTag(false);
      setShowManualVet(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/calving-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dairy-calving", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ calvingDate: today(), numberOfCalves: 1 });
    setShowManualEarTag(false);
    setShowManualVet(false);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r, calvingDate: r.calvingDate.slice(0, 10) });
    setShowManualEarTag(!r.cowAnimalId && !!r.cowEarTag);
    setShowManualVet(!!r.vetAttended && !!r.vetName);
    setOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const hasDeadCalf = (r) => r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" || r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h";
  function generateCalvingReport() {
    const records = data?.records ?? [];
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
    const fv2 = (v) => v === null || v === void 0 || v === "" ? "—" : String(v);
    const easeLabel = (n) => n ? ["", "1 — Unassisted", "2 — Easy pull", "3 — Hard pull", "4 — Mech. assistance", "5 — C-section"][n] ?? String(n) : "—";
    const yesNo = (v) => v === true ? "Yes" : v === false ? "No" : "—";
    const rows = records.map((r) => {
      const calves = r.numberOfCalves && r.numberOfCalves > 1 ? `${r.calfOutcome ?? "—"} (${r.calfSex ?? "?"}) ${r.calfEarTag ?? ""} + ${r.calfOutcome2 ?? "—"} (${r.calfSex2 ?? "?"}) ${r.calfEarTag2 ?? ""}` : `${r.calfOutcome ?? "—"} · ${r.calfSex === "male" ? "Bull" : r.calfSex === "female" ? "Heifer" : r.calfSex ?? "?"} · ${r.calfEarTag ?? "no tag"}`;
      const deadCount = (r.calfOutcome === "stillborn" || r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "stillborn" || r.calfOutcome2 === "died-within-24h" ? 1 : 0);
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}` : deadCount > 0 ? "<span style='color:#b91c1c'>NOT RECORDED</span>" : "—";
      return `<tr>
        <td>${fmtD(r.calvingDate)}</td>
        <td>${fv2(r.cowEarTag)}</td>
        <td>${easeLabel(r.calvingEaseScore)}</td>
        <td>${r.numberOfCalves ?? 1} calf${(r.numberOfCalves ?? 1) > 1 ? "ves" : ""}</td>
        <td>${calves}</td>
        <td>${r.calfBirthWeightKg ? `${r.calfBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumGivenWithin2Hours)} / ${yesNo(r.colostrumGivenWithin6Hours)}</td>
        <td>${r.colostrumVolumeFirstFeedLitres ? `${r.colostrumVolumeFirstFeedLitres} L` : "—"}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td>${yesNo(r.vetAttended)}</td>
        <td>${yesNo(r.bcmsPassportApplied)}</td>
        <td style="font-size:9px">${disposalCell}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 80)}</td>
      </tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Calving Records — Red Tractor Dairy Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Calving Records</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Printed: ${printedDate}</div>
</div>
<table>
  <thead><tr>
    <th>Date</th><th>Dam Tag</th><th>Ease Score</th><th>No. Calves</th><th>Calf Outcome / Tag</th>
    <th>Birth Wt</th><th>Colostrum ≤2h / ≤6h</th><th>Col. Volume</th><th>Assisted</th><th>Vet</th><th>BCMS Applied</th><th>ABP Disposal</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This calving records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Dairy audit. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    (() => {
      const allCalvingRecords = data?.records ?? [];
      const calvingRecords = yearFilter === "all" ? allCalvingRecords : allCalvingRecords.filter((r) => r.calvingDate?.startsWith(yearFilter));
      const calvingYears = [...new Set(allCalvingRecords.map((r) => r.calvingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
      if (!calvingYears.includes(String(CURRENT_YEAR))) calvingYears.unshift(String(CURRENT_YEAR));
      function calvingStats(recs) {
        const cows2 = recs.length;
        const totalCalves = recs.reduce((s, r) => s + (r.numberOfCalves ?? 1), 0);
        const stillborns = recs.reduce((s, r) => s + (r.calfOutcome === "stillborn" ? 1 : 0) + (r.calfOutcome2 === "stillborn" ? 1 : 0), 0);
        const died24h = recs.reduce((s, r) => s + (r.calfOutcome === "died-within-24h" ? 1 : 0) + (r.calfOutcome2 === "died-within-24h" ? 1 : 0), 0);
        const perinatal = stillborns + died24h;
        const pct = (n) => totalCalves > 0 ? (n / totalCalves * 100).toFixed(1) : "—";
        return { cows: cows2, totalCalves, stillborns, died24h, perinatal, pct };
      }
      const currentCalvingStats = calvingStats(calvingRecords);
      const calvingYearlyStats = calvingYears.map((y) => ({ year: y, ...calvingStats(allCalvingRecords.filter((r) => r.calvingDate?.startsWith(y))) }));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Calving records including ease score, calf details, colostrum management, and BCMS passport application." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red Tractor Dairy: calving performance must be recorded and available at audit. Retain records for a minimum of 3 years." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                calvingYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateCalvingReport, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
              "Audit Report"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAdd, size: "sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              "Add Calving"
            ] })
          ] })
        ] }),
        allCalvingRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2 mb-3", children: [
            { label: "Cows Calved", value: String(currentCalvingStats.cows), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
            { label: "Total Calves Born", value: String(currentCalvingStats.totalCalves), sub: "", colour: "" },
            { label: "Stillborn", value: `${currentCalvingStats.stillborns}`, sub: `${currentCalvingStats.pct(currentCalvingStats.stillborns)}% of born`, colour: currentCalvingStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
            { label: "Died Within 24h", value: `${currentCalvingStats.died24h}`, sub: `${currentCalvingStats.pct(currentCalvingStats.died24h)}% of born`, colour: currentCalvingStats.died24h > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
            { label: "Perinatal Loss", value: `${currentCalvingStats.perinatal}`, sub: `${currentCalvingStats.pct(currentCalvingStats.perinatal)}% of born`, colour: currentCalvingStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" }
          ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`, children: s.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mt-0.5", children: s.label }),
            s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: s.sub })
          ] }, s.label)) }),
          calvingYearlyStats.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-gray-200 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Year-by-Year Perinatal Mortality Trend" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Year" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Cows" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Calves Born" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Stillborn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Died <24h" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-semibold text-gray-500", children: "Perinatal Loss" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-semibold text-gray-500", children: "Bar" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: calvingYearlyStats.map((s, i) => {
                const maxRate = Math.max(...calvingYearlyStats.map((x) => Number(x.pct(x.perinatal)) || 0), 0.1);
                const rate = Number(s.pct(s.perinatal)) || 0;
                const barWidth = Math.round(rate / maxRate * 100);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: i % 2 === 0 ? "bg-white" : "bg-gray-50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: s.year }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.cows }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: s.totalCalves }),
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
                    s.died24h,
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-400", children: [
                      "(",
                      s.pct(s.died24h),
                      "%)"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: `px-3 py-2 text-right font-semibold ${rate > 5 ? "text-red-600" : rate > 2 ? "text-amber-600" : "text-green-700"}`, children: [
                    s.perinatal,
                    " (",
                    s.pct(s.perinatal),
                    "%)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-gray-100 rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded ${rate > 5 ? "bg-red-400" : rate > 2 ? "bg-amber-400" : "bg-green-400"}`, style: { width: `${barWidth}%` } }) }) })
                ] }, s.year);
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1.5 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Red >5% perinatal loss · Amber 2–5% · Green <2%. Red Tractor Dairy and BCMS may query rates significantly above industry benchmarks." }) })
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          !calvingRecords.length && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-gray-400 text-sm", children: "No calving records yet." }) }),
          calvingRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-3 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: formatDate(r.calvingDate) }),
                r.cowEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-mono", children: [
                  "Dam: ",
                  r.cowEarTag
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(EaseScoreBadge, { v: r.calvingEaseScore }),
                r.numberOfCalves && r.numberOfCalves > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded", children: [
                  "Twins × ",
                  r.numberOfCalves
                ] }),
                r.calfOutcome && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.calfOutcome === "live" ? "bg-green-100 text-green-700" : r.calfOutcome === "stillborn" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`, children: r.calfOutcome.charAt(0).toUpperCase() + r.calfOutcome.slice(1) }),
                r.calfSex && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: r.calfSex === "male" ? "Bull calf" : r.calfSex === "female" ? "Heifer calf" : r.calfSex }),
                r.calfEarTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 font-mono", children: [
                  "Calf: ",
                  r.calfEarTag
                ] }),
                r.calfOutcome === "live" && !r.calfEarTag && (() => {
                  const hoursOld = (Date.now() - new Date(r.calvingDate).getTime()) / 36e5;
                  if (hoursOld >= 36) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Tag 1 overdue (",
                    Math.floor(hoursOld),
                    "h)"
                  ] });
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Tag 1 due in ",
                    Math.ceil(36 - hoursOld),
                    "h"
                  ] });
                })(),
                r.calfOutcome === "live" && (() => {
                  if (r.calfEarTag2) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "Tag 2 ✓" });
                  const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 864e5);
                  if (daysOld >= 20) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Tag 2 overdue (",
                    daysOld,
                    "d)"
                  ] });
                  if (daysOld >= 15) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Tag 2 due in ",
                    20 - daysOld,
                    "d"
                  ] });
                  return null;
                })(),
                r.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded", children: "In Livestock Register ✓" }),
                r.colostrumGivenWithin2Hours !== null && r.colostrumGivenWithin2Hours !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded ${r.colostrumGivenWithin2Hours ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: r.colostrumGivenWithin2Hours ? "Colostrum ≤2h ✓" : "Colostrum >2h" }),
                r.bcmsPassportApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded", children: "Passport applied ✓" }) : (() => {
                  const daysOld = Math.floor((Date.now() - new Date(r.calvingDate).getTime()) / 864e5);
                  if (daysOld >= 27) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: [
                    "⚠ Passport overdue (",
                    daysOld,
                    "d)"
                  ] });
                  if (daysOld >= 20) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded", children: [
                    "Passport due in ",
                    27 - daysOld,
                    "d"
                  ] });
                  return null;
                })(),
                hasDeadCalf(r) && (r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "ABP disposal ✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium", children: "⚠ ABP disposal not recorded" })),
                (calvingAttachMap[r.id] ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-3 h-3" }),
                  calvingAttachMap[r.id]
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }),
            r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: r.notes })
          ] }) }, r.id))
        ] })
      ] });
    })(),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, className: "max-h-[85vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Calving Record — ",
        viewRecord.cowEarTag || `Record #${viewRecord.id}`
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calving Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatDate(viewRecord.calvingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dam Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.cowEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.calvingEaseScore ? ["", "1 — Unassisted", "2 — Easy assist", "3 — Hard assist", "4 — Vet/caesarean"][viewRecord.calvingEaseScore] ?? viewRecord.calvingEaseScore : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "No. of Calves" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.numberOfCalves ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfOutcome || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRecord.calfSex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calf Ear Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: viewRecord.calfEarTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.calfBirthWeightKg || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assistance Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.assistanceRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Attended" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.vetAttended ? viewRecord.vetName || "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRecord.colostrumGivenWithin2Hours === false ? "No" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCMS Passport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.bcmsPassportApplied ? "Applied ✓" : "Pending" })
        ] }),
        hasDeadCalf(viewRecord) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border rounded-md bg-amber-50 border-amber-200 p-3", children: [
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
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "calving", recordId: viewRecord.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => printBirthRecord(viewRecord), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Farm Birth Record"
        ] }),
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
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "62rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Calving Record" : "Add Calving Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Cow Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calving Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.calvingDate?.slice(0, 10) || "", onChange: (e) => set("calvingDate", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dam Ear Tag" }),
                cows.length > 0 && !showManualEarTag ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.cowAnimalId ? String(form.cowAnimalId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__manual__") {
                        setShowManualEarTag(true);
                        set("cowAnimalId", null);
                        return;
                      }
                      const animal = cows.find((a) => a.id === parseInt(v));
                      set("cowAnimalId", v === "__none__" ? null : parseInt(v));
                      set("cowEarTag", animal?.earTagNumber ?? null);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select cow..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        cows.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(a.id), children: a.earTagNumber }, a.id)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter tag manually…" })
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowEarTag || "", onChange: (e) => set("cowEarTag", e.target.value), placeholder: "Cow's BCMS ear tag" }),
                  cows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                    setShowManualEarTag(false);
                    set("cowAnimalId", null);
                    set("cowEarTag", null);
                  }, children: "↩" })
                ] }),
                cows.length === 0 && animalsQ.isSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No cattle registered. Add animals in the Livestock page, or type the ear tag above." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calving Ease Score *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.calvingEaseScore || ""), onValueChange: (v) => set("calvingEaseScore", v ? parseInt(v) : null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select score..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Minor assistance (1 person)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Major assistance (calving aid)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Vet/caesarean required" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cow Complications" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cowComplications || "", onChange: (e) => set("cowComplications", e.target.value), placeholder: "e.g. retained placenta, hypocalcaemia" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "ar", checked: !!form.assistanceRequired, onChange: (e) => {
                  set("assistanceRequired", e.target.checked);
                  if (!e.target.checked) set("assistanceType", null);
                }, className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ar", children: "Assistance required" })
              ] }),
              form.assistanceRequired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type of Assistance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assistanceType || "__none__", onValueChange: (v) => set("assistanceType", v === "__none__" ? null : v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-1-person", children: "Manual — 1 person" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manual-2-person", children: "Manual — 2 persons" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "calving-aid", children: "Calving aid / jack" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vet-assisted", children: "Vet-assisted delivery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caesarean", children: "Caesarean section" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "embryotomy", children: "Embryotomy" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "va", checked: !!form.vetAttended, onChange: (e) => {
                  set("vetAttended", e.target.checked);
                  if (!e.target.checked) {
                    set("vetName", null);
                    setShowManualVet(false);
                  }
                }, className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "va", children: "Vet attended" })
              ] }),
              form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
                uniqueVetNames.length > 0 && !showManualVet ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.vetName && uniqueVetNames.includes(form.vetName) ? form.vetName : "__none__",
                    onValueChange: (v) => {
                      if (v === "__manual__") {
                        setShowManualVet(true);
                        set("vetName", "");
                        return;
                      }
                      set("vetName", v === "__none__" ? null : v);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        uniqueVetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: n, children: [
                          n,
                          vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""
                        ] }, n)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Enter new vet name…" })
                      ] })
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet's name" }),
                  uniqueVetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "shrink-0 text-xs", onClick: () => {
                    setShowManualVet(false);
                    set("vetName", null);
                  }, children: "↩" })
                ] }),
                vetVisitsQ.isSuccess && uniqueVetNames.length === 0 && !showManualVet && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "No previous vets on record — type the name above." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Calf Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Calves" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "4", value: form.numberOfCalves || 1, onChange: (e) => {
                const n = parseInt(e.target.value);
                set("numberOfCalves", n);
                if (n < 2) {
                  set("calfOutcome2", null);
                  set("calfSex2", null);
                  set("calfEarTag2", null);
                  set("calfBirthWeightKg2", null);
                }
              } })
            ] }) }),
            (form.numberOfCalves ?? 1) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500", children: "Calf 1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Outcome" : "Calf Outcome" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome || "", onValueChange: (v) => set("calfOutcome", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24 hours" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Sex" : "Calf Sex" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex || "", onValueChange: (v) => set("calfSex", v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer (Female)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull Calf (Male)" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Ear Tag" : "Calf Ear Tag" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag || "", onChange: (e) => set("calfEarTag", e.target.value), placeholder: "BCMS ear tag number" }),
                form.calfOutcome === "live" && form.calfEarTag && !form.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live calf will be auto-registered in the Livestock module on save — no double entry needed." }),
                form.calfAnimalId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 mt-1", children: [
                  "Already in Livestock Register (ID #",
                  form.calfAnimalId,
                  "). Movements & destination tracked there."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: (form.numberOfCalves ?? 1) >= 2 ? "Calf 1 Birth Weight (kg)" : "Birth Weight (kg)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.calfBirthWeightKg || "", onChange: (e) => set("calfBirthWeightKg", e.target.value) })
              ] })
            ] }),
            (form.numberOfCalves ?? 1) >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-500 pt-1 border-t", children: "Calf 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Outcome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfOutcome2 || "", onValueChange: (v) => set("calfOutcome2", v), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live", children: "Live" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died-within-24h", children: "Died within 24 hours" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Sex" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfSex2 || "", onValueChange: (v) => set("calfSex2", v), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "female", children: "Heifer (Female)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "male", children: "Bull Calf (Male)" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Ear Tag" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.calfEarTag2 || "", onChange: (e) => set("calfEarTag2", e.target.value), placeholder: "BCMS ear tag number" }),
                  form.calfOutcome2 === "live" && form.calfEarTag2 && !form.calfAnimalId2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-teal-600 mt-1", children: "Live calf will be auto-registered in the Livestock module on save." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calf 2 Birth Weight (kg)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.calfBirthWeightKg2 || "", onChange: (e) => set("calfBirthWeightKg2", e.target.value) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conception Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.conceptionMethod || "__none__",
                    onValueChange: (v) => {
                      const method = v === "__none__" ? null : v;
                      set("conceptionMethod", method);
                      set("sireRegisterId", null);
                      set("strawInventoryId", null);
                      set("sireBreed", "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "natural", children: "Natural Service (bull)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ai", children: "AI — Artificial Insemination" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "embryo-transfer", children: "Embryo Transfer (ET)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unknown", children: "Unknown" })
                      ] })
                    ]
                  }
                )
              ] }),
              form.conceptionMethod === "natural" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire (from Sire Register)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.sireRegisterId ? String(form.sireRegisterId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__none__") {
                        set("sireRegisterId", null);
                        set("sireBreed", "");
                        return;
                      }
                      const sire = activeSires.find((s) => s.id === parseInt(v));
                      set("sireRegisterId", parseInt(v));
                      set("sireBreed", sire?.breed ?? "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select sire..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        activeSires.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.name,
                          s.breed ? ` (${s.breed})` : "",
                          s.tagNumber ? ` — ${s.tagNumber}` : ""
                        ] }, s.id))
                      ] })
                    ]
                  }
                ),
                siresQ.isSuccess && activeSires.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No bulls in Sire Register. Add them via the Livestock → Breeding section." }),
                form.sireBreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                  "Breed auto-filled: ",
                  form.sireBreed
                ] })
              ] }),
              form.conceptionMethod === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "AI Straw (from Inventory)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.strawInventoryId ? String(form.strawInventoryId) : "__none__",
                    onValueChange: (v) => {
                      if (v === "__none__") {
                        set("strawInventoryId", null);
                        set("sireBreed", "");
                        return;
                      }
                      const straw = cattleStraws.find((s) => s.id === parseInt(v));
                      set("strawInventoryId", parseInt(v));
                      set("sireBreed", straw?.sireBreed ?? "");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select straw batch..." }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
                        cattleStraws.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.sireName,
                          s.sireBreed ? ` (${s.sireBreed})` : "",
                          " — Batch ",
                          s.batchNumber
                        ] }, s.id))
                      ] })
                    ]
                  }
                ),
                strawsQ.isSuccess && cattleStraws.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No AI straws in inventory. Add them via the Livestock → Breeding section." }),
                form.sireBreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                  "Sire breed auto-filled: ",
                  form.sireBreed
                ] })
              ] }),
              (!form.conceptionMethod || form.conceptionMethod === "unknown") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sire Breed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sireBreed || "", onChange: (e) => set("sireBreed", e.target.value), placeholder: "e.g. Aberdeen Angus" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Calf Disposition ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-gray-400", children: "(optional — can be updated later)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.calfDisposition || "__none__", onValueChange: (v) => set("calfDisposition", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not yet decided..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not yet decided" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "retained", children: "Retained on farm (rear)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sold", children: "Sold" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "market", children: "To market / auction" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "died", children: "Died post-birth" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Only needed for calves leaving the holding (sold/market) or that die post-birth. Calves retained on farm have their movements tracked automatically through the Livestock module — no need to record disposition here." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "bpp", checked: !!form.bcmsPassportApplied, onChange: (e) => set("bcmsPassportApplied", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "bpp", children: "BCMS passport applied" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 ml-6", children: "UK rules: passport must be applied within 36 days of birth (or within 7 days if the calf leaves the farm of birth before day 36). Tick once submitted to BCMS/CTS." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-gray-200 self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Colostrum Management" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "c2h", checked: !!form.colostrumGivenWithin2Hours, onChange: (e) => set("colostrumGivenWithin2Hours", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c2h", children: "Colostrum given within 2 hours" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "c6h", checked: !!form.colostrumGivenWithin6Hours, onChange: (e) => set("colostrumGivenWithin6Hours", e.target.checked), className: "rounded" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "c6h", children: "Colostrum given within 6 hours" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "First Feed Volume (L)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.colostrumVolumeFirstFeedLitres || "", onChange: (e) => set("colostrumVolumeFirstFeedLitres", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Brix Quality (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.colostrumQualityBrix || "", onChange: (e) => set("colostrumQualityBrix", e.target.value), placeholder: "≥22% = good" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Source" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumSource || "", onValueChange: (v) => set("colostrumSource", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "own-dam", children: "Own dam" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other-cow", children: "Other cow on farm" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "frozen-stored", children: "Frozen/stored colostrum" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "colostrum-supplement", children: "Commercial colostrum supplement" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 5 })
          ] })
        ] })
      ] }),
      hasDeadCalf(form) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "ABP Perinatal Disposal — Category 3 (Required)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "Stillborn and died-within-24h calves are Category 3 Animal By-Product waste (Regulation (EC) 1069/2009). They must be collected by a licensed fallen stock contractor or disposed of via another approved route. Retain the collection/consignment note for at least 3 years. These calves may not enter the food chain." }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.calvingDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Calving"
        ] })
      ] })
    ] }) })
  ] });
}
function penceToGBP(p) {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function PoBadge({ status }) {
  const map = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "Sent" },
    "part-received": { bg: "bg-amber-100", text: "text-amber-700", label: "Part received" },
    received: { bg: "bg-green-100", text: "text-green-700", label: "Received" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" }
  };
  const s = map[status] ?? map.draft;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`, children: s.label });
}
function InvoiceBadge({ status }) {
  if (status === "paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "h-3 w-3" }),
    "Paid"
  ] });
  if (status === "part-paid") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Part paid"
  ] });
  if (status === "overdue") return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
    "Overdue"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
    "Unpaid"
  ] });
}
function GrnConditionBadge({ condition }) {
  if (!condition) return null;
  if (condition === "good") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700", children: "Good condition" });
  if (condition === "damaged") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: "Damaged" });
  if (condition === "partial") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: "Partial delivery" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: condition });
}
function AbrProcurementSection({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const suppliersQ = useQuery({
    queryKey: ["abr-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-suppliers`), { credentials: "include" }).then((r) => r.json())
  });
  const ordersQ = useQuery({
    queryKey: ["abr-purchase-orders", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders`), { credentials: "include" }).then((r) => r.json())
  });
  const grnsQ = useQuery({
    queryKey: ["abr-grns", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-grns`), { credentials: "include" }).then((r) => r.json())
  });
  const invoicesQ = useQuery({
    queryKey: ["abr-invoices", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-invoices`), { credentials: "include" }).then((r) => r.json())
  });
  const suppliers = suppliersQ.data?.suppliers ?? [];
  const orders = ordersQ.data?.orders ?? [];
  const grns = grnsQ.data?.grns ?? [];
  const invoices = invoicesQ.data?.invoices ?? [];
  const unpaidInvoices = invoices.filter((i) => i.paymentStatus === "unpaid" || i.paymentStatus === "overdue");
  const supplierName = (id) => suppliers.find((s) => s.id === id)?.companyName ?? null;
  const poRef = (id) => orders.find((o) => o.id === id)?.poNumber ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm text-gray-800", children: [
              "ABR Kit Procurement (",
              suppliers.length,
              " suppliers, ",
              orders.length,
              " POs)"
            ] }),
            unpaidInvoices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              unpaidInvoices.length,
              " unpaid invoice",
              unpaidInvoices.length !== 1 ? "s" : ""
            ] })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-gray-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-gray-500" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierSubsection, { farmId, suppliers, loading: suppliersQ.isLoading, qc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PurchaseOrderSubsection, { farmId, orders, suppliers, loading: ordersQ.isLoading, qc, supplierName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GrnSubsection, { farmId, grns, orders, loading: grnsQ.isLoading, qc, poRef }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceSubsection, { farmId, invoices, suppliers, orders, loading: invoicesQ.isLoading, qc, supplierName, poRef })
    ] })
  ] });
}
function SupplierSubsection({ farmId, suppliers, loading, qc }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-suppliers/${editing.id}`) : api(`farms/${farmId}/dairy/abr-suppliers`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-suppliers/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-suppliers", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({});
    setDlgOpen(true);
  }
  function openEdit(s) {
    setEditing(s);
    setForm({ ...s });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Supplier Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: suppliers.length })
          ] }),
          open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No suppliers added yet." }) : suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900", children: s.companyName }),
            s.accountRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 font-mono", children: [
              "Acc: ",
              s.accountRef
            ] }),
            s.paymentTermsDays != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              s.paymentTermsDays,
              "-day terms"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
            s.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.contactName }),
            s.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${s.phone}`, className: "hover:text-blue-600", children: s.phone }),
            s.email && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${s.email}`, className: "hover:text-blue-600", children: s.email }),
            (s.city || s.postcode) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: [s.city, s.postcode].filter(Boolean).join(", ") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(s), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, s.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Supplier"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Supplier" : "Add Supplier" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Neogen Europe Ltd", value: form.companyName || "", onChange: (e) => set("companyName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Account manager", value: form.contactName || "", onChange: (e) => set("contactName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Your account number", value: form.accountRef || "", onChange: (e) => set("accountRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "tel", placeholder: "01234 567890", value: form.phone || "", onChange: (e) => set("phone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", placeholder: "orders@supplier.co.uk", value: form.email || "", onChange: (e) => set("email", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine1 || "", onChange: (e) => set("addressLine1", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Address Line 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.addressLine2 || "", onChange: (e) => set("addressLine2", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City / Town" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.city || "", onChange: (e) => set("city", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Postcode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.postcode || "", onChange: (e) => set("postcode", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Terms (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", placeholder: "30", value: form.paymentTermsDays ?? "", onChange: (e) => set("paymentTermsDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.companyName?.trim(), children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Supplier"
        ] })
      ] })
    ] }) })
  ] });
}
function PurchaseOrderSubsection({ farmId, orders, suppliers, loading, qc, supplierName }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [lineItems, setLineItems] = reactExports.useState([]);
  const [expandedPo, setExpandedPo] = reactExports.useState(null);
  const [itemDlg, setItemDlg] = reactExports.useState(null);
  const [itemForm, setItemForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-purchase-orders/${editing.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
      setLineItems([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-purchase-orders/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const saveItem = useMutation({
    mutationFn: (body) => {
      const url = body.id ? api(`farms/${farmId}/dairy/abr-po-items/${body.id}`) : api(`farms/${farmId}/dairy/abr-purchase-orders/${body.poId}/items`);
      return fetch(url, { method: body.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] });
      setItemDlg(null);
      setItemForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delItem = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-po-items/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-purchase-orders", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ orderDate: today(), status: "draft" });
    setLineItems([{ productName: "", quantityOrdered: 1 }]);
    setDlgOpen(true);
  }
  function openEdit(o) {
    setEditing(o);
    setForm({ ...o });
    setLineItems([]);
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const lineTotal = (items) => items.reduce((sum, it) => sum + (it.unitPricePence ?? 0) * (it.quantityOrdered ?? 1), 0);
  function addLineItem() {
    setLineItems((l) => [...l, { productName: "", quantityOrdered: 1 }]);
  }
  function removeLineItem(i) {
    setLineItems((l) => l.filter((_, idx) => idx !== i));
  }
  function setLineItem(i, k, v) {
    setLineItems((l) => l.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Purchase Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: orders.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No purchase orders yet." }) : orders.map((o) => {
        const isExpanded = expandedPo === o.id;
        const sName = supplierName(o.supplierId);
        const itemTotal = lineTotal(o.items);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-white overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex-1 text-left", onClick: () => setExpandedPo(isExpanded ? null : o.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: o.poNumber }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PoBadge, { status: o.status }),
                sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Ordered: ",
                  formatDate(o.orderDate)
                ] }),
                o.expectedDeliveryDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Expected: ",
                  formatDate(o.expectedDeliveryDate)
                ] }),
                o.items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  o.items.length,
                  " line item",
                  o.items.length !== 1 ? "s" : ""
                ] }),
                itemTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                  "Est. ",
                  penceToGBP(itemTotal)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(o), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(o.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }),
          isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-100 px-3 py-2 bg-gray-50 space-y-1.5", children: [
            o.items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-0.5", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Unit price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-0.5", children: "Line total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-12" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: o.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2 text-gray-800", children: it.productName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.quantityOrdered }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-gray-700", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium text-gray-800", children: it.unitPricePence != null ? penceToGBP(it.unitPricePence * it.quantityOrdered) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-0.5 justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => {
                    setItemDlg({ poId: o.id, item: it });
                    setItemForm({ ...it });
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-red-400 hover:text-red-600", onClick: () => delItem.mutate(it.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
                ] }) })
              ] }, it.id)) }),
              o.items.some((it) => it.unitPricePence != null) && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "py-1 text-right text-xs font-medium text-gray-600", children: "Total estimated value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right text-xs font-bold text-gray-900", children: penceToGBP(itemTotal) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-6 text-xs", onClick: () => {
              setItemDlg({ poId: o.id });
              setItemForm({ productName: "", quantityOrdered: 1 });
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add line item"
            ] }),
            o.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 italic mt-1", children: [
              "Note: ",
              o.notes
            ] })
          ] })
        ] }, o.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "New Purchase Order"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Purchase Order" : "New Purchase Order" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. PO-2026-001", value: form.poNumber || "", onChange: (e) => set("poNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status || "draft", onValueChange: (v) => set("status", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent to supplier" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-received", children: "Part received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "received", children: "Received" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Order Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.orderDate || today(), onChange: (e) => set("orderDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedDeliveryDate || "", onChange: (e) => set("expectedDeliveryDate", e.target.value || null) })
          ] })
        ] }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Line Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs", onClick: addLineItem, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
              "Add item"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            lineItems.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Product" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", placeholder: "Product name", value: it.productName || "", onChange: (e) => setLineItem(i, "productName", e.target.value) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "1", value: it.quantityOrdered ?? 1, onChange: (e) => setLineItem(i, "quantityOrdered", parseInt(e.target.value) || 1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Unit price (£)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "number", min: "0", step: "0.01", placeholder: "0.00", value: it.unitPricePence != null ? (it.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setLineItem(i, "unitPricePence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 flex justify-end pb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-red-400", onClick: () => removeLineItem(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }) })
            ] }, i)),
            lineItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 italic", children: "No line items yet — add items above." }),
            lineTotal(lineItems) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-sm font-medium text-gray-700", children: [
              "Estimated total: ",
              penceToGBP(lineTotal(lineItems))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form, items: editing ? void 0 : lineItems.filter((it) => it.productName?.trim()) }), disabled: save.isPending || !form.poNumber?.trim() || !form.orderDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Create PO"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!itemDlg, onOpenChange: (o) => {
      if (!o) {
        setItemDlg(null);
        setItemForm({});
        saveItem.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: itemDlg?.item ? "Edit Line Item" : "Add Line Item" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Delvotest Accelerator kit (50)", value: itemForm.productName || "", onChange: (e) => setItemForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Ordered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: itemForm.quantityOrdered ?? 1, onChange: (e) => setItemForm((f) => ({ ...f, quantityOrdered: parseInt(e.target.value) || 1 })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit Price (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: itemForm.unitPricePence != null ? (itemForm.unitPricePence / 100).toFixed(2) : "", onChange: (e) => setItemForm((f) => ({ ...f, unitPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: itemForm.notes || "", onChange: (e) => setItemForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveItem, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setItemDlg(null);
          setItemForm({});
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveItem.mutate({ ...itemForm, poId: itemDlg.poId, id: itemDlg?.item?.id }), disabled: saveItem.isPending || !itemForm.productName?.trim(), children: [
          saveItem.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          itemDlg?.item ? "Save Changes" : "Add Item"
        ] })
      ] })
    ] }) })
  ] });
}
function GrnSubsection({ farmId, grns, orders, loading, qc, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-grns/${editing.id}`) : api(`farms/${farmId}/dairy/abr-grns`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-grns", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const { data: abrMembersData, isLoading: abrMembersLoading } = useFarmMembers(farmId);
  const abrStaffNames = (abrMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-grns/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-grns", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ receivedDate: today(), conditionOnArrival: "good" });
    setDlgOpen(true);
  }
  function openEdit(g) {
    setEditing(g);
    setForm({ ...g });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PackageCheck, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Goods Received Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: grns.length })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : grns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No goods received notes yet." }) : grns.map((g) => {
        const po = poRef(g.poId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between rounded-md border border-gray-200 bg-white px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              g.grnNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: g.grnNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GrnConditionBadge, { condition: g.conditionOnArrival }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Received: ",
                formatDate(g.receivedDate)
              ] }),
              g.receivedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "By: ",
                g.receivedBy
              ] }),
              g.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: g.notes })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(g), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(g.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, g.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add GRN"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit GRN" : "Add Goods Received Note" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. GRN-2026-001", value: form.grnNumber || "", onChange: (e) => set("grnNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.receivedDate || today(), onChange: (e) => set("receivedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Purchase Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.receivedBy || "", onChange: (v) => set("receivedBy", v), staffNames: abrStaffNames, loading: abrMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition on Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.conditionOnArrival || "", onValueChange: (v) => set("conditionOnArrival", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "good", children: "Good condition" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "damaged", children: "Damaged" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "partial", children: "Partial delivery" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.receivedDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add GRN"
        ] })
      ] })
    ] }) })
  ] });
}
function InvoiceSubsection({ farmId, invoices, suppliers, orders, loading, qc, supplierName, poRef }) {
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(true);
  const [dlgOpen, setDlgOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const save = useMutation({
    mutationFn: (body) => {
      const url = editing ? api(`farms/${farmId}/dairy/abr-invoices/${editing.id}`) : api(`farms/${farmId}/dairy/abr-invoices`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then((r) => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] });
      setDlgOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/dairy/abr-invoices/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["abr-invoices", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm({ invoiceDate: today(), paymentStatus: "unpaid" });
    setDlgOpen(true);
  }
  function openEdit(inv) {
    setEditing(inv);
    setForm({ ...inv });
    setDlgOpen(true);
  }
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  const totalOutstanding = invoices.filter((i) => i.paymentStatus !== "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  const totalPaid = invoices.filter((i) => i.paymentStatus === "paid").reduce((sum, i) => sum + (i.grossAmountPence ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-left", onClick: () => setOpen((o) => !o), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full", children: invoices.length }),
        totalOutstanding > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full", children: [
          penceToGBP(totalOutstanding),
          " outstanding"
        ] })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-gray-400" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 space-y-2", children: [
      invoices.length > 1 && (totalOutstanding > 0 || totalPaid > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-600 font-medium", children: "Outstanding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-amber-800", children: penceToGBP(totalOutstanding) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-100 rounded-md px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-green-600 font-medium", children: "Total paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-green-800", children: penceToGBP(totalPaid) })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-gray-400" }) : invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No invoices recorded yet." }) : invoices.map((inv) => {
        const sName = supplierName(inv.supplierId);
        const po = poRef(inv.poId);
        const isOverdue = inv.paymentStatus === "unpaid" && inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date();
        const effectiveStatus = isOverdue ? "overdue" : inv.paymentStatus;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start justify-between rounded-md border px-3 py-2.5 ${effectiveStatus === "overdue" ? "border-red-200 bg-red-50" : effectiveStatus === "paid" ? "border-green-100 bg-white" : "border-gray-200 bg-white"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-900 font-mono", children: inv.invoiceNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(InvoiceBadge, { status: effectiveStatus }),
              sName && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: sName }),
              po && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400", children: [
                "PO: ",
                po
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Dated: ",
                formatDate(inv.invoiceDate)
              ] }),
              inv.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: effectiveStatus === "overdue" ? "text-red-600 font-medium" : "", children: [
                "Due: ",
                formatDate(inv.dueDate)
              ] }),
              inv.grossAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: penceToGBP(inv.grossAmountPence) }),
              inv.netAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Net: ",
                penceToGBP(inv.netAmountPence)
              ] }),
              inv.vatAmountPence != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "VAT: ",
                penceToGBP(inv.vatAmountPence)
              ] }),
              inv.paymentDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
                "Paid: ",
                formatDate(inv.paymentDate)
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 ml-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(inv), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-red-400 hover:text-red-600", onClick: () => del.mutate(inv.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] })
        ] }, inv.id);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        "Add Invoice"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dlgOpen, onOpenChange: (o) => {
      setDlgOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Invoice" : "Add Invoice" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. INV-12345", value: form.invoiceNumber || "", onChange: (e) => set("invoiceNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.paymentStatus || "unpaid", onValueChange: (v) => set("paymentStatus", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unpaid", children: "Unpaid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "part-paid", children: "Part paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "paid", children: "Paid" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplierId?.toString() || "", onValueChange: (v) => set("supplierId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select supplier" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id.toString(), children: s.companyName }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked PO" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.poId?.toString() || "", onValueChange: (v) => set("poId", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select PO (optional)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.id.toString(), children: o.poNumber }, o.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.invoiceDate || today(), onChange: (e) => set("invoiceDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dueDate || "", onChange: (e) => set("dueDate", e.target.value || null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.netAmountPence != null ? (form.netAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const net = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("netAmountPence", net);
            if (net != null && form.vatAmountPence != null) set("grossAmountPence", net + form.vatAmountPence);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "VAT Amount (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.vatAmountPence != null ? (form.vatAmountPence / 100).toFixed(2) : "", onChange: (e) => {
            const vat = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null;
            set("vatAmountPence", vat);
            if (vat != null && form.netAmountPence != null) set("grossAmountPence", form.netAmountPence + vat);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gross / Total (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", placeholder: "0.00", value: form.grossAmountPence != null ? (form.grossAmountPence / 100).toFixed(2) : "", onChange: (e) => set("grossAmountPence", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null) })
        ] }),
        (form.paymentStatus === "paid" || form.paymentStatus === "part-paid") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.paymentDate || "", onChange: (e) => set("paymentDate", e.target.value || null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. BACS ref, cheque no.", value: form.paymentReference || "", onChange: (e) => set("paymentReference", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDlgOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.invoiceNumber?.trim() || !form.invoiceDate, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Add Invoice"
        ] })
      ] })
    ] }) })
  ] });
}
function fmtGBP(p) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPpl(p) {
  return p == null ? "—" : `${p.toFixed(2)}p/L`;
}
function fmtVol(l) {
  return l >= 1e3 ? `${(l / 1e3).toFixed(1)}kL` : `${l.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function monthLabel(m) {
  return (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      p.name === "Gross Margin" ? fmtGBP(p.value) : fmtGBP(Math.abs(p.value))
    ] }, p.name))
  ] });
};
function DairyEnterpriseReport({ farmId }) {
  const reportRef = reactExports.useRef(null);
  const farmName = useRawFarmName(farmId);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "dairy-enterprise-report", filter: "year", farmId, defaultValue: currentYear });
  const [showMonthly, setShowMonthly] = reactExports.useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dairy-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy-enterprise-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" });
  const d = data;
  const hasData = d && (d.collectionCount > 0 || d.feedDeliveryCount > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const chartData = (d?.monthlyBreakdown ?? []).map((m) => ({
    label: monthLabel(m.month),
    "Milk Income": m.incomePence,
    "Feed Cost": m.feedCostPence,
    "Gross Margin": m.grossMarginPence
  }));
  const feedPct = d && d.totalMilkIncomePence > 0 ? (d.totalFeedCostPence / d.totalMilkIncomePence * 100).toFixed(1) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: reportRef, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Dairy Enterprise Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Cost of production · Gross margin · Per-litre analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => printElementReport(reportRef.current, { title: "Dairy Enterprise Report", subtitle: `${year} enterprise analysis`, farmName }), className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print:block hidden mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold", children: [
        "Dairy Enterprise Report — ",
        year
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Cost of production and gross margin analysis" })
    ] }),
    !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No milk collection or feed delivery data found for ",
      year,
      ".",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: "Record milk collections and priced feed deliveries to generate this report." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Produced", value: fmtVol(d.totalVolumeLitres), sub: `${d.collectionCount} collections`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 text-blue-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Milk Income", value: fmtGBP(d.totalMilkIncomePence), sub: fmtPpl(d.pencePerLitre), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Feed Cost", value: fmtGBP(d.totalFeedCostPence), sub: `${d.totalFeedKg.toLocaleString("en-GB")} kg · ${feedPct ? feedPct + "% of income" : ""}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-amber-500" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          KpiCard,
          {
            label: "Gross Margin",
            value: fmtGBP(d.grossMarginPence),
            sub: fmtPpl(d.grossMarginPerLitrePence),
            icon: marginPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-500" }),
            highlight: marginPositive ? "emerald" : "red"
          }
        )
      ] }),
      chartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Income vs Feed Cost" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tickFormatter: (v) => `£${(v / 100).toFixed(0)}`, tick: { fontSize: 11 }, width: 60 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Milk Income", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Feed Cost", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "Gross Margin", stroke: "#3b82f6", strokeWidth: 2, dot: false })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Cost of Production Summary — ",
          d.year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "per Litre" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
            { label: "Milk income", value: d.totalMilkIncomePence, ppl: d.pencePerLitre, bold: false, positive: true },
            { label: `Feed cost (${d.feedDeliveryCount} deliveries · ${d.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d.totalFeedCostPence, ppl: d.feedCostPerLitrePence ? -d.feedCostPerLitrePence : null, bold: false },
            ...d.dairyPurchaseCostPence > 0 ? [{ label: "Livestock purchases (dairy)", value: -d.dairyPurchaseCostPence, ppl: null, bold: false }] : [],
            ...d.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d.totalVetCostPence, ppl: null, bold: false }] : [],
            { label: "Total variable costs", value: -d.totalVariableCostPence, ppl: null, bold: true, divider: true },
            { label: "Gross margin", value: d.grossMarginPence, ppl: d.grossMarginPerLitrePence, bold: true, highlight: marginPositive ? "emerald" : "red" }
          ].map((row, i) => {
            const ppl = row.ppl ?? (d.totalVolumeLitres > 0 && row.value !== 0 ? row.value / d.totalVolumeLitres : null);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.bold ? "font-semibold" : ""}`, children: row.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`, children: row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/40 text-xs", children: ppl != null ? `${ppl >= 0 ? "" : "-"}${Math.abs(ppl).toFixed(2)}p/L` : "" })
            ] }, i);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-muted/20 text-xs text-foreground/40", children: "Feed cost from priced deliveries tagged to dairy/cattle. Vet, AI, contractor, and fixed costs not included — add via Financial for a complete P&L. Organic dairy farmers: NMR recording visit data is in the Recording Visits tab." })
      ] }),
      d.monthlyBreakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible, { title: `Monthly Breakdown (${d.monthlyBreakdown.length} months)`, open: showMonthly, setOpen: setShowMonthly, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Collections" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Volume (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Income" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "p/L" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Feed Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Gross Margin" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          d.monthlyBreakdown.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: monthLabel(m.month) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.collections }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: m.volumeLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-emerald-700 font-medium", children: fmtGBP(m.incomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-foreground/60", children: m.pplActual != null ? `${m.pplActual.toFixed(2)}p` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-amber-700", children: m.feedCostPence > 0 ? fmtGBP(m.feedCostPence) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-1.5 text-right font-medium ${m.grossMarginPence >= 0 ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(m.grossMarginPence) })
          ] }, m.month)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border bg-muted/20 font-semibold text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: d.collectionCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtVol(d.totalVolumeLitres) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-emerald-700", children: fmtGBP(d.totalMilkIncomePence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: fmtPpl(d.pencePerLitre) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-amber-700", children: fmtGBP(d.totalFeedCostPence) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-2 text-right ${marginPositive ? "text-emerald-700" : "text-red-600"}`, children: fmtGBP(d.grossMarginPence) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
const JOHNES_TYPES = [
  { value: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { value: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { value: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { value: "faecal_pcr", label: "Faecal PCR (individual)" },
  { value: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { value: "post_mortem", label: "Post-mortem confirmation" }
];
const JOHNES_RISK = [
  { value: "1_very_low", label: "1 — Very Low Risk" },
  { value: "2_low", label: "2 — Low Risk" },
  { value: "3_moderate", label: "3 — Moderate Risk" },
  { value: "4_high", label: "4 — High Risk" }
];
const JOHNES_SCHEMES = [
  { value: "johnes_management_in_milk", label: "Johne's Management in Milk (AHDB)" },
  { value: "farm_health_connect", label: "Farm Health Connect" },
  { value: "voluntary", label: "Voluntary / Vet-led" },
  { value: "other", label: "Other" }
];
const JOHNES_LABS_PRESETS_D = [
  "APHA Starcross",
  "APHA Weybridge",
  "APHA Lasswade (Scotland)",
  "SAC / SRUC Veterinary Services",
  "Biobest Laboratories",
  "Axiom Veterinary Laboratories",
  "Westgate Labs",
  "Quality Milk Laboratories"
];
const NJMP_STRATEGY_LABELS_D = {
  s1_test_cull: "S1 — Test & cull high-risk cows",
  s2_segregate: "S2 — Segregate high-risk cows",
  s3_purchased_animals: "S3 — Purchased animal management",
  s4_calf_colostrum: "S4 — Calf & colostrum management",
  s5_slurry_pasture: "S5 — Slurry & pasture management",
  s6_bespoke: "S6 — Bespoke vet-led strategy"
};
function johnesFmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-GB");
  } catch {
    return d;
  }
}
function johnesRiskLabel(v) {
  return JOHNES_RISK.find((r) => r.value === v)?.label ?? v ?? "—";
}
function johnesTypeLabel(v) {
  return JOHNES_TYPES.find((t) => t.value === v)?.label ?? v ?? "—";
}
function DairyJohnesDeclarationSection({ farmId, allMonitoringRecords }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [ackOpen, setAckOpen] = reactExports.useState(false);
  const [ackRec, setAckRec] = reactExports.useState(null);
  const [ackForm, setAckForm] = reactExports.useState({});
  const [form, setForm] = reactExports.useState({});
  const [pendingDelDec, setPendingDelDec] = reactExports.useState(null);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const qKey = ["johnes-declarations", farmId];
  const { data: declarations = [] } = useQuery({
    queryKey: qKey,
    queryFn: () => fetch(api(`farms/${farmId}/johnes-declarations`), { credentials: "include" }).then((r) => r.json()).then((d) => d.declarations ?? []),
    enabled: !!farmId
  });
  const latestNjmp = [...allMonitoringRecords].filter((r) => r.jmmEnrolled).sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0] ?? allMonitoringRecords.sort((a, b) => (b.testDate ?? "").localeCompare(a.testDate ?? ""))[0];
  function openAdd() {
    setEditing(null);
    setForm({
      declarationYear: (/* @__PURE__ */ new Date()).getFullYear(),
      declarationDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      njmpSchemeRef: latestNjmp?.njmpSchemeRef ?? "",
      njmpRiskLevel: latestNjmp?.riskLevel ?? "",
      njmpControlStrategy: latestNjmp?.njmpControlStrategy ?? "",
      njmpPlanReviewedDate: latestNjmp?.njmpPlanDate ?? "",
      bajvaAdvisorName: latestNjmp?.njmpBajvaAdvisor ?? ""
    });
    setOpen(true);
  }
  async function saveDec() {
    const url = editing ? api(`farms/${farmId}/johnes-declarations/${editing.id}`) : api(`farms/${farmId}/johnes-declarations`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: qKey });
    setOpen(false);
    setEditing(null);
  }
  const delDec = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/johnes-declarations/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey })
  });
  async function saveAck() {
    await fetch(api(`farms/${farmId}/johnes-declarations/${ackRec.id}/acknowledge`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(ackForm)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    });
    qc.invalidateQueries({ queryKey: qKey });
    setAckOpen(false);
    setAckRec(null);
  }
  function printDeclaration(rec) {
    const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "[not recorded]";
    const stratLabel = rec.njmpControlStrategy ? NJMP_STRATEGY_LABELS_D[rec.njmpControlStrategy] ?? rec.njmpControlStrategy : "[not recorded]";
    const rl = JOHNES_RISK.find((r) => r.value === rec.njmpRiskLevel)?.label ?? rec.njmpRiskLevel ?? "[not recorded]";
    const html = `<!DOCTYPE html><html><head><title>NJMP Annual Declaration ${rec.declarationYear}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;margin:0;padding:32px 40px;max-width:680px}
  .logo-bar{border-bottom:3px solid #15803d;padding-bottom:8px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end}
  h1{font-size:15px;font-weight:700;margin:0}.scheme{font-size:10px;color:#15803d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase}
  .to-block{margin:20px 0 16px;padding:10px 14px;border-left:3px solid #e5e7eb;font-size:10px;color:#374151}
  .ref-line{font-size:9px;color:#6b7280;margin-bottom:16px}
  .subject{font-size:12px;font-weight:700;text-decoration:underline;margin-bottom:14px}
  .body-para{margin:0 0 10px;line-height:1.55}
  table{width:100%;border-collapse:collapse;margin:14px 0}
  th,td{padding:5px 8px;text-align:left;border:1px solid #d1d5db;font-size:10px}
  th{background:#f0fdf4;font-weight:700;color:#15803d;text-transform:uppercase;font-size:9px}
  .declaration-box{border:2px solid #15803d;border-radius:4px;padding:12px 16px;margin:18px 0;background:#f0fdf4}
  .declaration-box p{margin:0 0 4px;font-size:10.5px}
  .sig-block{margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .sig-line{border-bottom:1px solid #000;height:24px;margin-bottom:4px}
  .sig-label{font-size:9px;color:#6b7280}
  .footer{margin-top:28px;font-size:8px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}
  @media print{@page{margin:2cm;size:A4}}
</style></head><body>
<div class="logo-bar">
  <div><div class="scheme">National Johne's Management Plan (NJMP)</div><h1>Annual Declaration — ${rec.declarationYear}</h1></div>
  <div style="text-align:right;font-size:9px;color:#6b7280">Date: ${fmtD(rec.declarationDate)}<br>${rec.njmpSchemeRef ? `Scheme Ref: <strong>${rec.njmpSchemeRef}</strong>` : ""}</div>
</div>
<div class="to-block"><strong>To:</strong> ${rec.milkPurchaser || "[Milk Purchaser Name]"}<br>${rec.milkPurchaserAddress ? rec.milkPurchaserAddress.replace(/\n/g, "<br>") : "[Milk Purchaser Address]"}</div>
<div class="ref-line">From: ${rec.farmerName || "[Farmer / Herd Operator Name]"}</div>
<p class="subject">Re: NJMP Annual Declaration — Herd Johne's Disease Management Plan — Year ${rec.declarationYear}</p>
<p class="body-para">I, the undersigned, hereby declare that the above-named herd is enrolled in the National Johne's Management Plan (NJMP) as administered by AHDB / BCVA, and that the following information is correct and up to date as of the date of this declaration.</p>
<div class="declaration-box"><p><strong>NJMP Enrolled Herd Declaration</strong></p><p>This declaration confirms that the herd identified above has an active written Johne's disease control plan, which has been reviewed in the 12-month period prior to the date of this declaration.</p></div>
<table>
  <tr><th>Item</th><th>Detail</th></tr>
  <tr><td>NJMP Scheme / Enrolment Reference</td><td>${rec.njmpSchemeRef || "—"}</td></tr>
  <tr><td>Current NJMP Herd Risk Level</td><td>${rl}</td></tr>
  <tr><td>Active Control Strategy</td><td>${stratLabel}</td></tr>
  <tr><td>Written Plan Last Reviewed</td><td>${fmtD(rec.njmpPlanReviewedDate)}</td></tr>
  <tr><td>BAJVA / Accredited Veterinary Advisor</td><td>${rec.bajvaAdvisorName || "—"}</td></tr>
</table>
<p class="body-para">I confirm that the control plan has been formulated and is being implemented in conjunction with a BCVA Accredited Johne's Veterinary Advisor (BAJVA), that an annual on-farm risk assessment has been carried out within the past 12 months, and that the herd has been screened in accordance with NJMP requirements (minimum 60-cow individual milk ELISA — bulk milk ELISA alone is not accepted for NJMP risk status).</p>
<p class="body-para">I understand that this declaration must be submitted to my milk purchaser on an annual basis, and that failure to do so may affect my Red Tractor Dairy assurance status.</p>
${rec.notes ? `<p class="body-para"><em>Notes: ${rec.notes}</em></p>` : ""}
<div class="sig-block">
  <div><div class="sig-line"></div><div class="sig-label">Signature of Herd Operator / Farmer</div></div>
  <div><div class="sig-line"></div><div class="sig-label">Date</div></div>
  <div style="margin-top:16px"><div class="sig-line"></div><div class="sig-label">Print Name: ${rec.farmerName || "________________________________"}</div></div>
</div>
<div class="footer">NJMP Annual Declaration generated by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years.</div>
</body></html>`;
    openPrintWindow(html);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "NJMP Annual Declarations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Record and print the annual declaration submitted to your milk purchaser. Keep a history for assurance auditors." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
        "New Annual Declaration"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-3", children: [
      "The NJMP applies to enrolled ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "dairy cattle herds only" }),
      " — it is not applicable to sheep or goats. For Johne's disease (paratuberculosis) in sheep and goats, record vaccination with Gudair via the Vaccination Programmes tab in the Sheep / Goat Production modules. Cattle vaccination is not licensed in the UK due to cross-reactivity with the bovine TB skin test."
    ] }),
    declarations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 border-2 border-dashed rounded-lg text-sm text-gray-400", children: 'No declarations recorded yet. Click "New Annual Declaration" to log and print your first.' }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Year", "Date Submitted", "Milk Purchaser", "Risk Level", "Control Strategy", "BAJVA Advisor", "Acknowledged", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: declarations.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-semibold", children: d.declarationYear }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.declarationDate ? new Date(d.declarationDate).toLocaleDateString("en-GB") : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.milkPurchaser || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: JOHNES_RISK.find((r) => r.value === d.njmpRiskLevel)?.label ?? d.njmpRiskLevel ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: NJMP_STRATEGY_LABELS_D[d.njmpControlStrategy] ?? d.njmpControlStrategy ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: d.bajvaAdvisorName || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: d.acknowledgementReceived ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700", children: [
          "✓ ",
          d.acknowledgementDate ? new Date(d.acknowledgementDate).toLocaleDateString("en-GB") : "Received"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500", children: "Pending" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs", onClick: () => printDeclaration(d), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3 h-3 mr-1" }),
            "Print"
          ] }),
          !d.acknowledgementReceived && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-green-700 border-green-300 hover:bg-green-50", onClick: () => {
            setAckRec(d);
            setAckForm({ acknowledgementDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
            setAckOpen(true);
          }, children: "Record Ack." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => {
            setEditing(d);
            setForm({ ...d });
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDelDec(d.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Annual Declaration" : "New NJMP Annual Declaration" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Fields are pre-filled from your most recent NJMP monitoring record. Review and adjust before saving and printing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "2020", max: "2099", value: form.declarationYear ?? (/* @__PURE__ */ new Date()).getFullYear(), onChange: (e) => setF("declarationYear", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Declaration Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.declarationDate || "", onChange: (e) => setF("declarationDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farmer / Operator Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.farmerName || "", onChange: (e) => setF("farmerName", e.target.value), placeholder: "Full name as will appear on declaration letter" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "NJMP Scheme Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "font-mono", value: form.njmpSchemeRef || "", onChange: (e) => setF("njmpSchemeRef", e.target.value), placeholder: "e.g. AHDB-JMM-123456" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.milkPurchaser || "", onChange: (e) => setF("milkPurchaser", e.target.value), placeholder: "e.g. Arla Foods UK, Müller Milk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current NJMP Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpRiskLevel || "__none__", onValueChange: (v) => setF("njmpRiskLevel", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Purchaser Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.milkPurchaserAddress || "", onChange: (e) => setF("milkPurchaserAddress", e.target.value), placeholder: "Purchaser address (appears on the printed declaration letter)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Control Strategy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => setF("njmpControlStrategy", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Written Plan Last Reviewed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.njmpPlanReviewedDate || "", onChange: (e) => setF("njmpPlanReviewedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BAJVA Advisor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.bajvaAdvisorName || "", onChange: (e) => setF("bajvaAdvisorName", e.target.value), placeholder: "BCVA-accredited veterinary advisor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => setF("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveDec, children: editing ? "Save Changes" : "Save Declaration" })
      ] })
    ] }) }),
    ackOpen && ackRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => {
      setAckOpen(false);
      setAckRec(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Acknowledgement — ",
        ackRec.declarationYear,
        " Declaration"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Record when ",
        ackRec.milkPurchaser || "the milk purchaser",
        " confirmed receipt. The NJMP does not mandate a formal acknowledgement, but having it on file strengthens your audit trail."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acknowledgement Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: ackForm.acknowledgementDate || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Purchaser Reference ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal text-xs", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: ackForm.acknowledgementRef || "", onChange: (e) => setAckForm((f) => ({ ...f, acknowledgementRef: e.target.value })), placeholder: "e.g. email ref, letter ref" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAckOpen(false);
          setAckRec(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveAck, children: "Save Acknowledgement" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelDec !== null,
        title: "Delete declaration record",
        message: "Delete this declaration record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: delDec,
        onConfirm: () => {
          if (pendingDelDec !== null) delDec.mutate(pendingDelDec, { onSuccess: () => setPendingDelDec(null) });
        },
        onCancel: () => {
          setPendingDelDec(null);
          delDec.reset();
        }
      }
    )
  ] });
}
function DairyJohnesTab({ farmId }) {
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("log");
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "dairy-johnes", filter: "year", farmId, defaultValue: "all" });
  const [pendingDel, setPendingDel] = reactExports.useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["johnes-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/johnes-monitoring`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []),
    enabled: !!farmId
  });
  const allRecords = allRecordsRaw;
  const years = reactExports.useMemo(() => {
    const s = new Set(
      allRecords.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean)
    );
    return Array.from(s).sort().reverse();
  }, [allRecords]);
  const records = yearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.testDate ?? "").startsWith(yearFilter));
  const { data: herds = [] } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then((r) => r.json()).then(
      (d) => (d.records ?? []).filter((h) => {
        const t = String(h.type ?? "").toLowerCase();
        return ["cattle", "beef", "dairy", "suckler", "bovine"].some((k) => t.includes(k));
      })
    ),
    enabled: !!farmId
  });
  const uniqueVetNamesD = [...new Set(allRecords.map((r) => r.vetName).filter(Boolean))];
  function openAdd() {
    setEditing(null);
    setForm({ testType: "bulk_milk_elisa", jmmEnrolled: false, vetSignOff: false, njmpColostrumMgmt: false, njmpPurchasedTesting: false });
    setMode("log");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("edit");
    setOpen(true);
  }
  function openEnterResult(r) {
    setEditing(r);
    setForm({ ...r });
    setMode("result");
    setOpen(true);
  }
  async function save() {
    const url = editing ? api(`farms/${farmId}/johnes-monitoring/${editing.id}`) : api(`farms/${farmId}/johnes-monitoring`);
    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    });
    qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] });
    setOpen(false);
  }
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/johnes-monitoring/${id}`), {
      method: "DELETE",
      credentials: "include"
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["johnes-monitoring", farmId] })
  });
  function printReport() {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const rows = records.map(
      (r) => `<tr>
      <td>${johnesFmtDate(r.testDate)}</td>
      <td>${johnesTypeLabel(r.testType)}</td>
      <td>${r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—"}</td>
      <td>${johnesRiskLabel(r.riskLevel)}</td>
      <td>${r.animalsTestedCount ?? "—"}</td>
      <td>${r.positiveAnimalsCount ?? 0}</td>
      <td>${r.bulkMilkOd ?? "—"}</td>
      <td>${r.labName || "—"}</td>
      <td>${r.labRef || "—"}</td>
      <td>${johnesFmtDate(r.nextTestDue)}</td>
      <td>${r.jmmEnrolled ? "Yes" : "No"}</td>
    </tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><title>Johne's Disease Monitoring Register</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:4px 6px;border-bottom:1px solid #e5e7eb}
  th{font-size:8px;text-transform:uppercase;color:#6b7280;background:#f9fafb}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Johne's Disease Monitoring Register</h1><h2>Red Tractor Dairy Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilter !== "all" ? `<br>Year: ${yearFilter}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Test Date</th><th>Test Type</th><th>Herd</th><th>Risk Level</th><th>Tested</th><th>Positive</th><th>Bulk Milk OD</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th><th>JMM</th></tr>
  ${rows || "<tr><td colspan='11'>No records</td></tr>"}
</table>
<p class="note">Johne's monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor Dairy requires a documented Johne's monitoring programme. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    openPrintWindow(html);
  }
  const totalAnimals = records.reduce(
    (s, r) => s + (r.animalsTestedCount ? Number(r.animalsTestedCount) : 0),
    0
  );
  const totalPositive = records.reduce(
    (s, r) => s + (r.positiveAnimalsCount ? Number(r.positiveAnimalsCount) : 0),
    0
  );
  const prevalence = totalAnimals > 0 ? (totalPositive / totalAnimals * 100).toFixed(1) : null;
  const highRisk = records.filter(
    (r) => r.riskLevel && (r.riskLevel.startsWith("3") || r.riskLevel.startsWith("4"))
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: "Johne's Disease Monitoring Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Red Tractor Dairy requires a documented Johne's monitoring programme. Record each test with result and risk level classification." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: printReport,
            disabled: records.length === 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
              "Print"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }),
          "Log Sample"
        ] })
      ] })
    ] }),
    !isLoading && records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Tests Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: records.length })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#374151", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Animals Tested" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }, children: totalAnimals.toLocaleString() })
      ] }),
      totalAnimals > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: totalPositive > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${totalPositive > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: totalPositive > 0 ? "#b91c1c" : "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: [
          "Positives",
          prevalence ? ` (${prevalence}%)` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: totalPositive > 0 ? "#7f1d1d" : "#14532d", lineHeight: 1, margin: 0 }, children: totalPositive })
      ] }),
      highRisk > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b91c1c", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "High / Elevated Risk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#7f1d1d", lineHeight: 1, margin: 0 }, children: highRisk })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-400 text-sm", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-gray-600", children: [
        "No Johne's monitoring records",
        yearFilter !== "all" ? ` for ${yearFilter}` : "",
        " yet"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Log your first sample to start tracking your herd's Johne's status." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-gray-500 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Test Type", "Herd", "Risk Level", "Animals Tested", "Positive", "Bulk Milk OD", "Next Test Due", "Doc", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesTypeLabel(r.testType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.herdId ? herds.find((h) => h.id === r.herdId)?.name ?? `Herd #${r.herdId}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: !r.riskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.riskLevel.startsWith("4") ? "bg-red-100 text-red-800" : r.riskLevel.startsWith("3") ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`, children: johnesRiskLabel(r.riskLevel) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.animalsTestedCount ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.positiveAnimalsCount ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.bulkMilkOd ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: johnesFmtDate(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocAttach,
          {
            farmId,
            endpoint: "johnes-monitoring",
            recordId: r.id,
            documentPath: r.documentPath ?? null,
            documentName: r.documentName ?? null,
            queryKey: ["johnes-monitoring", farmId],
            compact: true
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.riskLevel && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-red-500", onClick: () => setPendingDel(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Johne's Monitoring — ",
        johnesFmtDate(viewRec.testDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesTypeLabel(viewRec.testType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Herd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.herdId ? herds.find((h) => h.id === viewRec.herdId)?.name ?? `Herd #${viewRec.herdId}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesRiskLabel(viewRec.riskLevel) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animals Tested" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.animalsTestedCount ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Positive Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.positiveAnimalsCount ?? 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bulk Milk OD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.bulkMilkOd ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: JOHNES_SCHEMES.find((s) => s.value === viewRec.scheme)?.label ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: johnesFmtDate(viewRec.nextTestDue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "JMM Enrolled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.jmmEnrolled ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet Sign-off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetSignOff ? "Yes" : "No" })
        ] }),
        viewRec.actionsTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.actionsTaken })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        viewRec.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "johnes-monitoring", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Johne’s Test Sample" : mode === "result" ? "Enter Johne’s Test Results" : "Edit Johne’s Monitoring Record" }) }),
      mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sampling event now. Return to enter laboratory results once the report arrives." }),
      mode === "result" && editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Sample from ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: johnesFmtDate(editing.testDate) }),
        " · ",
        johnesTypeLabel(editing.testType),
        editing.labName ? ` · ${editing.labName}` : "",
        ". Enter results from your lab report."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate || "", onChange: (e) => set("testDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.testType || "", onValueChange: (v) => set("testType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: JOHNES_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Herd" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: String(form.herdId || "__none__"),
                onValueChange: (v) => set("herdId", v === "__none__" ? null : Number(v)),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select herd (optional)" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— All herds" }),
                    herds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(h.id), children: h.name }, h.id))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: JOHNES_LABS_PRESETS_D.includes(form.labName || "") ? form.labName || "__none__" : form.labName ? "__other__" : "__none__",
                onValueChange: (v) => {
                  if (v === "__none__") set("labName", "");
                  else if (v !== "__other__") set("labName", v);
                  else set("labName", "");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select lab" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select lab" }),
                    JOHNES_LABS_PRESETS_D.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (type below)" })
                  ] })
                ]
              }
            ),
            !JOHNES_LABS_PRESETS_D.includes(form.labName || "") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.labName || "", onChange: (e) => set("labName", e.target.value), placeholder: "Type lab name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value), placeholder: "Lab submission reference (if known)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monitoring Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.scheme || "__none__",
                onValueChange: (v) => set("scheme", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select scheme" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None" }),
                    JOHNES_SCHEMES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: s.label }, s.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
            uniqueVetNamesD.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: uniqueVetNamesD.includes(form.vetName) ? form.vetName : form.vetName ? "__other__" : "",
                onValueChange: (v) => {
                  if (v !== "__other__") set("vetName", v);
                  else set("vetName", "");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select vet" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    uniqueVetNamesD.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other (type below)" })
                  ] })
                ]
              }
            ) : null,
            (!uniqueVetNamesD.length || !uniqueVetNamesD.includes(form.vetName)) && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: uniqueVetNamesD.length > 0 ? "mt-1" : "", value: form.vetName || "", onChange: (e) => set("vetName", e.target.value), placeholder: "Vet name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "jmm", checked: !!form.jmmEnrolled, onChange: (e) => set("jmmEnrolled", e.target.checked), className: "rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "jmm", children: "Enrolled in NJMP / JMM Scheme" })
          ] }),
          form.jmmEnrolled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 p-3 rounded-lg border border-green-200 bg-green-50/60 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs font-semibold text-green-800 -mb-1", children: "NJMP / JMM Details" }),
            form.testType === "bulk_milk_elisa" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "col-span-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1", children: "⚠ Bulk milk ELISA alone is not accepted for NJMP risk status — individual milk ELISA (60+ cows) is required." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "NJMP Scheme Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm font-mono", value: form.njmpSchemeRef || "", onChange: (e) => set("njmpSchemeRef", e.target.value), placeholder: "e.g. AHDB-JMM-123456" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "NJMP Risk Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpRiskLevel || "__none__", onValueChange: (v) => set("njmpRiskLevel", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Risk level" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not classified" }),
                  JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Control Strategy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.njmpControlStrategy || "__none__", onValueChange: (v) => set("njmpControlStrategy", v === "__none__" ? null : v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select strategy" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s1_test_cull", children: "S1 — Test & cull high-risk cows" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s2_segregate", children: "S2 — Segregate high-risk cows" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s3_purchased_animals", children: "S3 — Purchased animal management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s4_calf_colostrum", children: "S4 — Calf & colostrum management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s5_slurry_pasture", children: "S5 — Slurry & pasture management" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "s6_bespoke", children: "S6 — Bespoke vet-led strategy" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Written Plan Reviewed Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", type: "date", value: form.njmpPlanDate || "", onChange: (e) => set("njmpPlanDate", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "BAJVA Advisor Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-sm", value: form.njmpBajvaAdvisor || "", onChange: (e) => set("njmpBajvaAdvisor", e.target.value), placeholder: "BCVA-accredited vet" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "njmpColostrum", checked: !!form.njmpColostrumMgmt, onChange: (e) => set("njmpColostrumMgmt", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "njmpColostrum", className: "text-xs", children: "Colostrum management protocol in place" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "njmpPurchased", checked: !!form.njmpPurchasedTesting, onChange: (e) => set("njmpPurchasedTesting", e.target.checked), className: "rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "njmpPurchased", className: "text-xs", children: "Testing/quarantine of purchased cattle" })
            ] })
          ] })
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.riskLevel || "__none__",
                onValueChange: (v) => set("riskLevel", v === "__none__" ? null : v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select risk level" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not classified" }),
                    JOHNES_RISK.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.value, children: r.label }, r.value))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positive Animals" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveAnimalsCount ?? 0, onChange: (e) => set("positiveAnimalsCount", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bulk Milk OD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.bulkMilkOd ?? "", onChange: (e) => set("bulkMilkOd", e.target.value), placeholder: "Optical density reading" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDue || "", onChange: (e) => set("nextTestDue", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "vetso", checked: !!form.vetSignOff, onChange: (e) => set("vetSignOff", e.target.checked), className: "rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vetso", children: "Vet sign-off obtained" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 2,
                value: form.actionsTaken || "",
                onChange: (e) => set("actionsTaken", e.target.value),
                placeholder: "Management actions, culling decisions, biosecurity changes…"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes || "", onChange: (e) => set("notes", e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DairyJohnesDeclarationSection, { farmId, allMonitoringRecords: allRecords }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDel !== null,
        title: "Delete monitoring record",
        message: "Delete this Johne's monitoring record?",
        confirmLabel: "Delete",
        confirmVariant: "destructive",
        mutation: del,
        onConfirm: () => {
          if (pendingDel !== null) del.mutate(pendingDel, { onSuccess: () => setPendingDel(null) });
        },
        onCancel: () => {
          setPendingDel(null);
          del.reset();
        }
      }
    )
  ] });
}
function DairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "dairy", farmId, validIds: ["milk", "mastitis", "calving", "bcs", "mobility", "tank", "dct", "johnes", "recording", "enterprise", "abr-kit", "scc-equipment", "supplies"], defaultTab: "milk" });
  const { data: dairyAlert } = useQuery({
    queryKey: ["dairy-platform-alert", farmId],
    queryFn: () => fetch(`/api/dairy-alert${farmId ? `?farmId=${farmId}` : ""}`).then((r) => r.json()).catch(() => ({ active: false })),
    enabled: !!farmId
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Dairy Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dairy Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Red Tractor Dairy scheme compliance — milk recording, mastitis, calving, body condition, mobility, bulk tank, and dry cow therapy. Supports dairy cattle and water buffalo herds (both regulated as bovines under BCMS)." })
    ] }),
    dairyAlert?.active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 rounded-lg border px-4 py-3 text-sm mb-4 ${dairyAlert.level === "national" ? "bg-red-50 border-red-200 text-red-800" : dairyAlert.level === "regional" ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-amber-50 border-amber-200 text-amber-800"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: dairyAlert.level === "national" ? "National Dairy Herd Disease Alert" : dairyAlert.level === "regional" ? "Regional Dairy Herd Disease Alert" : "Dairy Herd Disease Notice" }),
        dairyAlert.message && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: dairyAlert.message }),
        (dairyAlert.issuedAt || dairyAlert.date) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 opacity-70 text-xs", children: formatAlertIssuedAt(dairyAlert.issuedAt, dairyAlert.date) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "milk", onClick: () => setTab("milk"), children: "Milk Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "calving", onClick: () => setTab("calving"), children: "Calving" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bcs", onClick: () => setTab("bcs"), children: "Body Condition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mobility", onClick: () => setTab("mobility"), children: "Mobility Scoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tank", onClick: () => setTab("tank"), children: "Bulk Tank" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "dct", onClick: () => setTab("dct"), children: "Dry Cow Therapy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "johnes", onClick: () => setTab("johnes"), children: "Johne's Monitoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "recording", onClick: () => setTab("recording"), children: "Recording Visits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: "Enterprise Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "abr-kit", onClick: () => setTab("abr-kit"), children: "ABR Kit Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scc-equipment", onClick: () => setTab("scc-equipment"), children: "SCC Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "supplies", onClick: () => setTab("supplies"), children: "Supplies" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkRecordsTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "calving" && /* @__PURE__ */ jsxRuntimeExports.jsx(CalvingTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "mobility" && /* @__PURE__ */ jsxRuntimeExports.jsx(MobilityTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "dct" && /* @__PURE__ */ jsxRuntimeExports.jsx(DctTab, { farmId }),
      tab === "johnes" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyJohnesTab, { farmId }),
      tab === "recording" && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordingVisitsTab, { farmId }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId }),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId })
      ] }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "cattle" }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "cattle" })
    ] })
  ] }) });
}
export {
  AbrKitStockSection,
  AbrProcurementSection,
  BcsTab,
  BulkTankTab,
  CalvingTab,
  DairyEnterpriseReport,
  DairyJohnesTab,
  DctTab,
  MastitisTab,
  MilkRecordsTab,
  MobilityTab,
  RecordingVisitsTab,
  SccEquipmentSection,
  DairyPage as default
};
