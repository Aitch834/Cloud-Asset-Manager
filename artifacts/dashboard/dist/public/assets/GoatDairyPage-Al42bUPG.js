import { b as useAppStore, j as jsxRuntimeExports, R as Redirect, u as useLocation, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, S as useMutation, d as Button, T as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, N as DialogMutationError, n as Card, o as CardContent } from "./index-DqqyMgV5.js";
import { u as usePersistedTab } from "./use-persisted-tab-BdPO-J0X.js";
import { A as AppLayout } from "./AppLayout-CRCfUGIQ.js";
import { T as TabBar, a as TabButton } from "./tab-button-JqtopuBN.js";
import { T as Textarea } from "./textarea-cWejaHNk.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BRUP0KyH.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BgFbPH0-.js";
import { R as RecordAttachments } from "./RecordAttachments-RXd_oUpC.js";
import { D as DocAttach } from "./DocAttach-dmZZw2ja.js";
import { b as SccEquipmentSection, c as DairySuppliesTab } from "./SccEquipmentSection-BDCFkD-s.js";
import { A as AbrKitStockSection } from "./AbrKitStockSection-BP2xilOI.js";
import "./index-B-1sxOSR.js";
import { A as AbrProcurementSection, D as DairyEnterpriseReport } from "./DairyEnterpriseReport-CSfvvvQB.js";
import { C as ChevronRight } from "./tractor-BpMQwMfj.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-CNz3Wtb2.js";
import { L as LineChart } from "./LineChart-BDFA8lpd.js";
import { C as CartesianGrid } from "./CartesianGrid-Be9pWdwS.js";
import { L as Line } from "./Line-MPrZ1-ym.js";
import { P as Printer } from "./printer-JwVEOnnr.js";
import { E as Eye } from "./eye-BlNJry9y.js";
import { P as Pencil } from "./pencil-D47roH6-.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-BucwWiGZ.js";
import { C as CircleCheck } from "./circle-check-C_vx6mVc.js";
import { T as TriangleAlert } from "./triangle-alert-EzdC4Cdl.js";
import { B as BarChart } from "./BarChart-0imvZKDi.js";
import { P as PieChart, a as Pie } from "./PieChart-DE4YT1UC.js";
import { C as ComposedChart } from "./ComposedChart-Csi-R-cv.js";
import { D as Droplets } from "./shield-alert-LGxjoMDQ.js";
import "./use-safe-clerk-_ES44327.js";
import "./database-AVqoQrge.js";
import "./shield-check-4rW-XbXK.js";
import "./index-BneSBufb.js";
import "./index-u10g0L2v.js";
import "./chevron-up-DYGnHi5d.js";
import "./index-D2b9m_ZY.js";
import "./use-upload-DGADPpQv.js";
import "./paperclip-BAr2Z7vx.js";
import "./upload-BfOWHW_A.js";
import "./image-BlT3wMxa.js";
import "./download-Cw1WQAyT.js";
import "./api-Dhdsf4oM.js";
import "./shopping-cart-CSn304dB.js";
import "./circle-x-DMKF68xj.js";
import "./print-report-B_FwCCVJ.js";
import "./vmdMedicines-mq70NSvP.js";
import "./file-down-Cg82GObv.js";
import "./chevron-left-Ci94Voli.js";
import "./sparkles-DOZ6mlSg.js";
import "./chevrons-up-down-Dz7FQiXV.js";
import "./confirm-dialog-BYmKNk7q.js";
import "./receipt-D4VpC11N.js";
import "./badge-check-BOrLvdJO.js";
import "./trending-down-BEeI-OXT.js";
const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const BASE = "/dashboard/";
const api = (path) => `${BASE}api/${path}`;
function fmt(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return v;
  }
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function GoatSccBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const ok = v < 500;
  const warn = v >= 500 && v < 1e3;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL ",
    v >= 1e3 ? "⚠ Exceeds 1,000k limit" : ""
  ] });
}
function OutcomeBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const map = { cured: "bg-green-100 text-green-800", recovered: "bg-green-100 text-green-800", "dried-off": "bg-blue-100 text-blue-800", culled: "bg-red-100 text-red-800", chronic: "bg-amber-100 text-amber-800", ongoing: "bg-yellow-100 text-yellow-800" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[v] || "bg-gray-100 text-gray-700"}`, children: v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ") });
}
function BcsBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const n = parseFloat(v);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${n >= 2.5 && n <= 3.5 ? "bg-green-100 text-green-800" : n < 2.5 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: v });
}
function ResultBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const cls = v.toLowerCase().includes("neg") || v.toLowerCase() === "clear" ? "bg-green-100 text-green-800" : v.toLowerCase().includes("pos") ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: v });
}
function GoatDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({
    page: "goat-dairy",
    farmId,
    validIds: ["milk", "mastitis", "kidding", "bcs", "tank", "cae", "assurance", "abr-kit", "scc-equipment", "enterprise", "supplies"],
    defaultTab: "milk"
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Goat Dairy", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Goat Dairy Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "British Goat Society compliance — milk recording with SCC monitoring (1,000,000 cells/mL regulatory limit), mastitis, kidding records with LIS tagging, body condition scoring, bulk tank hygiene, and CAE (Caprine Arthritis Encephalitis) monitoring." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "milk", onClick: () => setTab("milk"), children: "Milk Collections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "kidding", onClick: () => setTab("kidding"), children: "Kidding Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bcs", onClick: () => setTab("bcs"), children: "Body Condition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tank", onClick: () => setTab("tank"), children: "Bulk Tank" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "cae", onClick: () => setTab("cae"), children: "CAE Monitoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assurance", onClick: () => setTab("assurance"), children: "Assurance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "abr-kit", onClick: () => setTab("abr-kit"), children: "ABR Kit Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scc-equipment", onClick: () => setTab("scc-equipment"), children: "SCC Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: "Enterprise Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "supplies", onClick: () => setTab("supplies"), children: "Supplies" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "kidding" && /* @__PURE__ */ jsxRuntimeExports.jsx(KiddingTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "cae" && /* @__PURE__ */ jsxRuntimeExports.jsx(CaeTab, { farmId }),
      tab === "assurance" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssuranceTab, {}),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId })
      ] }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "goat" }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId, endpoint: api(`farms/${farmId}/goat-dairy-enterprise-report`), queryPrefix: "goat-dairy-enterprise", speciesNote: "Milk income from goat dairy collection records. Feed cost and other variable costs not yet included — add via Financial for a complete P&L." }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "goat" })
    ] })
  ] }) });
}
function MilkTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { recordDate: today(), sessionType: "morning" };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-milk", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/milk-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`)).then((r) => r.json())
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/goat-dairy/milk-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || void 0 }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-milk", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/milk-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-milk", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const milkYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.recordDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [milkYearFilter, setMilkYearFilter] = reactExports.useState("all");
  const filteredMilk = reactExports.useMemo(() => milkYearFilter === "all" ? records : records.filter((r) => String(r.recordDate || "").startsWith(milkYearFilter)), [records, milkYearFilter]);
  const totalYield = filteredMilk.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const sccReadings = filteredMilk.map((r) => r.buyerSccThousands ?? r.sccThousands).filter((v) => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const printMilk = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Milk Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Milk Collection Records${milkYearFilter !== "all" ? ` — ${milkYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Session</th><th>Yield (L)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>ABR</th><th>Buyer</th></tr></thead><tbody>${filteredMilk.map((r) => `<tr><td>${fmt(r.recordDate)}</td><td>${r.sessionType || "—"}</td><td>${r.yieldLitres || "—"}</td><td>${r.buyerSccThousands ?? r.sccThousands ?? "—"}</td><td>${r.buyerFatPercent ?? r.fatPercent ?? "—"}</td><td>${r.buyerProteinPercent ?? r.proteinPercent ?? "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkBuyer || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Yield (filtered)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-800", children: [
          totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Avg SCC (k/mL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1e3 ? "text-red-700" : avgScc > 500 ? "text-amber-700" : "text-green-700"}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "UK limit: 1,000k cells/mL" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: filteredMilk.length })
      ] }) })
    ] }),
    (() => {
      const monthMap = {};
      [...records].sort((a, b) => String(a.recordDate).localeCompare(String(b.recordDate))).forEach((r) => {
        const d = new Date(String(r.recordDate));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        if (!monthMap[key]) monthMap[key] = { label, yieldL: 0, scc: null };
        monthMap[key].yieldL += parseFloat(r.yieldLitres || "0") || 0;
        const scc = r.buyerSccThousands ?? r.sccThousands ?? null;
        if (scc != null) monthMap[key].scc = scc;
      });
      const chartData = Object.keys(monthMap).sort().map((k) => monthMap[k]);
      if (chartData.length <= 1) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Yield & SCC Trend — Monthly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Goat regulatory SCC limit: 1,000k cells/mL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, width: 55, tickFormatter: (v) => `${v}L` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, width: 65, tickFormatter: (v) => `${v}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [name === "SCC (k/mL)" ? `${v}k` : `${Number(v).toFixed(0)}L`, name] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "yieldL", name: "Yield (L)", fill: "#3b82f6", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "scc", name: "SCC (k/mL)", stroke: "#ef4444", strokeWidth: 2, dot: { r: 3 }, connectNulls: true })
        ] }) }) })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Milk Collection Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: milkYearFilter, onValueChange: setMilkYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            milkYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMilk, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm(blank);
          setAbrKitStockId("");
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredMilk.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No milk records yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Yield (L)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "SCC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Fat%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Protein%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "ABR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Buyer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredMilk.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.recordDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.sessionType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoatSccBadge, { v: r.buyerSccThousands ?? r.sccThousands }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.buyerFatPercent ?? r.fatPercent ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.buyerProteinPercent ?? r.proteinPercent ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.antibioticResidueTestResult ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-800" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`, children: r.antibioticResidueTestResult }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: r.milkBuyer || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "goat-dairy/milk-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["goat-dairy-milk", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setAbrKitStockId("");
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Milk Record — ",
        fmt(viewRec.recordDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.sessionType || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Yield (L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.yieldLitres || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC on-farm (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoatSccBadge, { v: viewRec.sccThousands })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoatSccBadge, { v: viewRec.buyerSccThousands })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fat%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.buyerFatPercent ?? viewRec.fatPercent ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protein%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.buyerProteinPercent ?? viewRec.proteinPercent ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.milkTemperatureCelsius || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.antibioticResidueTestResult || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.milkBuyer || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collector Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.collectorReference || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.netPaymentPence != null ? `£${(viewRec.netPaymentPence / 100).toFixed(2)}` : "—" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "goat-dairy-milk", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm(viewRec);
          setAbrKitStockId("");
          setOpen(true);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Milk Record" : "Add Milk Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "session", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "session", children: "Milking Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collection", children: "Collection & Buyer Lab" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "session", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.recordDate || "").slice(0, 10), onChange: (e) => set("recordDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Session" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sessionType || "__none__", onValueChange: (v) => set("sessionType", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "morning", children: "Morning" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "afternoon", children: "Afternoon" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "evening", children: "Evening" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full-day", children: "Full day" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (litres)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.yieldLitres || "", onChange: (e) => set("yieldLitres", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.milkTemperatureCelsius || "", onChange: (e) => set("milkTemperatureCelsius", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "On-farm SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccThousands || "", onChange: (e) => set("sccThousands", e.target.value ? parseInt(e.target.value) : null) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "UK limit: 1,000k" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "On-farm TBC (cfu/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.tbcCfuMl || "", onChange: (e) => set("tbcCfuMl", e.target.value ? parseInt(e.target.value) : null) })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.antibioticResidueTestResult || "__none__", onValueChange: (v) => set("antibioticResidueTestResult", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not tested" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative ✓" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive ⚠" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid (test void)" })
              ] })
            ] })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Kit Lot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abrTestKitLot || "", onChange: (e) => set("abrTestKitLot", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 border-t border-amber-100 pt-2 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "is-retest-gd", checked: !!form.isRetest, onChange: (e) => {
                set("isRetest", e.target.checked);
                if (!e.target.checked) set("retestOfId", null);
              }, className: "w-4 h-4 rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest-gd", className: "font-normal cursor-pointer", children: "This is a follow-up retest of a previous non-negative result" })
            ] }),
            form.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retest of (original concerning record)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.retestOfId ? String(form.retestOfId) : "", onValueChange: (v) => set("retestOfId", v ? Number(v) : null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select the original record…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: records.filter((r) => r.id !== editing?.id && ["positive", "borderline", "invalid"].includes(r.antibioticResidueTestResult ?? "")).slice(0, 40).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  new Date(r.recordDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                  " — ABR ",
                  r.antibioticResidueTestResult
                ] }, r.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "A Negative retest will auto-resolve the alert for the original record." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collection", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800 mb-1", children: "One collection covers multiple milkings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", children: "A tanker typically collects from the bulk tank every 2–3 days. Enter the same Collector Reference on every milking session that went into one collection load. The buyer's lab results are tied to the collection event, not each individual milking." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Buyer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.milkBuyer || "", onChange: (e) => set("milkBuyer", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collector Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectorReference || "", onChange: (e) => set("collectorReference", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerSccThousands || "", onChange: (e) => set("buyerSccThousands", e.target.value ? parseInt(e.target.value) : null) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat %" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerFatPercent || "", onChange: (e) => set("buyerFatPercent", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein %" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerProteinPercent || "", onChange: (e) => set("buyerProteinPercent", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pence per litre" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.pencePerLitre || "", onChange: (e) => set("pencePerLitre", e.target.value) })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function MastitisTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-mastitis", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const mastiYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.incidentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [mastiYearFilter, setMastiYearFilter] = reactExports.useState("all");
  const filteredMasti = reactExports.useMemo(() => mastiYearFilter === "all" ? records : records.filter((r) => String(r.incidentDate || "").startsWith(mastiYearFilter)), [records, mastiYearFilter]);
  const printMasti = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Mastitis Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Mastitis Records${mastiYearFilter !== "all" ? ` — ${mastiYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Half</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th></tr></thead><tbody>${filteredMasti.map((r) => `<tr><td>${fmt(r.incidentDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.halfAffected || "—"}</td><td>${r.pathogenIdentified || "—"}</td><td>${r.treatmentProduct || "—"}</td><td>${r.outcome || "—"}${r.chronicCase ? " (Chronic)" : ""}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const mastiAnalytics = reactExports.useMemo(() => {
    const monthMap = {};
    filteredMasti.forEach((r) => {
      const key = String(r.incidentDate || "").slice(0, 7);
      if (key.length === 7) monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const trend = Object.keys(monthMap).sort().map((k) => ({ label: (/* @__PURE__ */ new Date(k + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), cases: monthMap[k] }));
    const outcomeMap = {};
    filteredMasti.forEach((r) => {
      const o = r.outcome || "ongoing";
      outcomeMap[o] = (outcomeMap[o] || 0) + 1;
    });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "), value }));
    const pathMap = {};
    filteredMasti.forEach((r) => {
      if (r.pathogenIdentified?.trim()) {
        const p = r.pathogenIdentified.trim();
        pathMap[p] = (pathMap[p] || 0) + 1;
      }
    });
    const pathData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const animalMap = {};
    filteredMasti.forEach((r) => {
      if (r.doeLisTag) animalMap[r.doeLisTag] = (animalMap[r.doeLisTag] || 0) + 1;
    });
    const repeatAnimals = Object.entries(animalMap).filter(([, c]) => c >= 2).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
    return { trend, outcomeData, pathData, repeatAnimals };
  }, [filteredMasti]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Cases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: filteredMasti.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Chronic Cases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: filteredMasti.filter((r) => r.chronicCase).length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Culled Due to Mastitis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-700", children: filteredMasti.filter((r) => r.culledDueToMastitis).length })
      ] }) })
    ] }),
    mastiAnalytics.trend.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Case Trend" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mastiAnalytics.trend, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cases", name: "Cases", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 40 })
      ] }) }) })
    ] }),
    (mastiAnalytics.outcomeData.length > 0 || mastiAnalytics.pathData.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      mastiAnalytics.outcomeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Outcome Distribution" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { width: 220, height: 160, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: mastiAnalytics.outcomeData, cx: 110, cy: 75, innerRadius: 40, outerRadius: 70, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, style: { fontSize: 9 }, children: mastiAnalytics.outcomeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) })
      ] }),
      mastiAnalytics.pathData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Pathogen Breakdown" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: mastiAnalytics.pathData, layout: "vertical", margin: { top: 0, right: 8, bottom: 0, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 9 }, width: 110 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: "Cases", fill: "#3b82f6", radius: [0, 3, 3, 0], maxBarSize: 20 })
        ] }) }) })
      ] })
    ] }),
    mastiAnalytics.repeatAnimals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-amber-800", children: [
        "⚠ Repeat Mastitis Does — ",
        mastiAnalytics.repeatAnimals.length,
        " doe",
        mastiAnalytics.repeatAnimals.length !== 1 ? "s" : "",
        " with ≥2 episodes"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 flex flex-wrap gap-2", children: mastiAnalytics.repeatAnimals.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md text-xs font-mono font-medium text-amber-900", children: [
        a.tag,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-amber-700", children: [
          "× ",
          a.count
        ] })
      ] }, a.tag)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Mastitis Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mastiYearFilter, onValueChange: setMastiYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            mastiYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMasti, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm(blank);
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredMasti.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mastitis records yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Half" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Pathogen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredMasti.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.incidentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.doeLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.halfAffected || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.pathogenIdentified || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.treatmentProduct || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { v: r.outcome }),
          r.chronicCase && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-amber-600", children: "Chronic" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "goat-dairy/mastitis-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["goat-dairy-mastitis", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Mastitis — ",
        viewRec.doeLisTag || "Unknown doe",
        " on ",
        fmt(viewRec.incidentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.doeLisTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Half Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.halfAffected || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Clinical Signs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.clinicalSigns || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pathogen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.pathogenIdentified || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC at Onset (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.sccAtOnset ? viewRec.sccAtOnset.toLocaleString() : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.treatmentProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Withdrawal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.withdrawalMilkDays != null ? `${viewRec.withdrawalMilkDays} days` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { v: viewRec.outcome })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.attendingVet || "—" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "goat-dairy-mastitis", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm(viewRec);
          setOpen(true);
          setViewRec(null);
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mastitis Record" : "Add Mastitis Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incident Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.incidentDate || "").slice(0, 10), onChange: (e) => set("incidentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeLisTag || "", onChange: (e) => set("doeLisTag", e.target.value), placeholder: "LIS ear tag" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Half Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.halfAffected || "__none__", onValueChange: (v) => set("halfAffected", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "left", children: "Left" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "right", children: "Right" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "both", children: "Both" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Clinical Signs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.clinicalSigns || "", onChange: (e) => set("clinicalSigns", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pathogen Identified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pathogenIdentified || "", onChange: (e) => set("pathogenIdentified", e.target.value), placeholder: "e.g. Staph. aureus, Strep." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 800" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "UK limit: 1,000k" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct || "", onChange: (e) => set("treatmentProduct", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentDurationDays || "", onChange: (e) => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withdrawal (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.withdrawalMilkDays || "", onChange: (e) => set("withdrawalMilkDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Withheld Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.milkWithdrawnUntil || "").slice(0, 10), onChange: (e) => set("milkWithdrawnUntil", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.outcome || "__none__", onValueChange: (v) => set("outcome", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Ongoing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cured", children: "Cured" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "recovered", children: "Recovered" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dried-off", children: "Dried off early" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "chronic", children: "Chronic" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "culled", children: "Culled" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.attendingVet || "", onChange: (e) => set("attendingVet", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.labSampleTaken, onChange: (e) => set("labSampleTaken", e.target.checked) }),
            "Lab sample taken"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.chronicCase, onChange: (e) => set("chronicCase", e.target.checked) }),
            "Chronic case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.culledDueToMastitis, onChange: (e) => set("culledDueToMastitis", e.target.checked) }),
            "Culled for mastitis"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function EaseScoreBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const cls = ["", "bg-green-100 text-green-800", "bg-lime-100 text-lime-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800"];
  const lbl = ["", "Unassisted", "Minor assistance", "Major assistance", "Vet required"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] || "bg-gray-100 text-gray-700"}`, children: [
    v,
    " — ",
    lbl[v] || "Unknown"
  ] });
}
function KiddingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { kiddingDate: today(), birthOutcome: "live-single", kidCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-kidding", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/kidding-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/kidding-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-kidding", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const kiddingYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.kiddingDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [kiddingYearFilter, setKiddingYearFilter] = reactExports.useState("all");
  const filteredKidding = reactExports.useMemo(() => kiddingYearFilter === "all" ? records : records.filter((r) => String(r.kiddingDate || "").startsWith(kiddingYearFilter)), [records, kiddingYearFilter]);
  const liveCount = filteredKidding.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? r.kidCount || 1 : 0), 0);
  const pendingEid = filteredKidding.filter((r) => !r.eidApplied && r.birthOutcome?.includes("live")).length;
  const printKidding = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Kidding Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Kidding Records${kiddingYearFilter !== "all" ? ` — ${kiddingYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Outcome</th><th>Kids</th><th>Ease</th><th>EID Applied</th></tr></thead><tbody>${filteredKidding.map((r) => `<tr><td>${fmt(r.kiddingDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.birthOutcome?.replace(/-/g, " ") || "—"}</td><td>${r.kidCount ?? 1} × ${r.kidSex || "?"}</td><td>${r.easeScore ?? "—"}</td><td>${r.eidApplied ? "Yes" : "Pending"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS Tagging:" }),
      " Goat EID tags must be applied before first movement off the holding. Record EID application date and LIS tag number for each kid."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Litters Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: filteredKidding.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Live Kids" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: liveCount })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "EID Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${pendingEid > 0 ? "text-amber-700" : "text-gray-400"}`, children: pendingEid })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Kidding Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kiddingYearFilter, onValueChange: setKiddingYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            kiddingYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printKidding, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm(blank);
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredKidding.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No kidding records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Kids" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ease" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "EID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredKidding.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.kiddingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.doeLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.birthOutcome?.replace(/-/g, " ") || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          r.kidCount ?? 1,
          " × ",
          r.kidSex || "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EaseScoreBadge, { v: r.easeScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.eidApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-medium text-xs", children: "✓ Applied" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-medium", children: "Pending" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "goat-dairy/kidding-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["goat-dairy-kidding", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Kidding Record — ",
        fmt(viewRec.kiddingDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.doeLisTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.birthOutcome?.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Kid Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.kidCount ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.kidSex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.kidBirthWeightKg || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EaseScoreBadge, { v: viewRec.easeScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EID Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.eidApplied ? `Yes — ${fmt(viewRec.eidAppliedDate)}` : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "LIS Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.lisTagNumber || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRec.colostrumGivenWithin2Hours === false ? "No" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe Milking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.doeMilkingStatus || "—" })
        ] }),
        viewRec.doeComplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.doeComplications })
        ] }),
        viewRec.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "Attended" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "goat-dairy-kidding", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm(viewRec);
          setOpen(true);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Kidding Record" : "Add Kidding Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kidding Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.kiddingDate || "").slice(0, 10), onChange: (e) => set("kiddingDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeLisTag || "", onChange: (e) => set("doeLisTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.birthOutcome || "live-single", onValueChange: (v) => set("birthOutcome", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-single", children: "Live — single" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-twins", children: "Live — twins" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "live-triplets", children: "Live — triplets" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "stillborn", children: "Stillborn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mummified", children: "Mummified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "abortion", children: "Abortion" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kid Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.kidCount || 1, onChange: (e) => set("kidCount", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.kidSex || "__none__", onValueChange: (v) => set("kidSex", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "doe", children: "Doe kid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "buck", children: "Buck kid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mixed", children: "Mixed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.kidBirthWeightKg || "", onChange: (e) => set("kidBirthWeightKg", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ease Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.easeScore || ""), onValueChange: (v) => set("easeScore", v ? parseInt(v) : null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: "1 — Unassisted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: "2 — Minor assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: "3 — Major assistance" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "4", children: "4 — Vet required" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "LIS Tagging" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kid EID Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.kidEidTag || "", onChange: (e) => set("kidEidTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "LIS Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lisTagNumber || "", onChange: (e) => set("lisTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.eidApplied, onChange: (e) => set("eidApplied", e.target.checked), id: "gd-eid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "gd-eid", className: "text-sm cursor-pointer", children: "EID tag applied" }),
          form.eidApplied && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "ml-2 w-40", value: String(form.eidAppliedDate || "").slice(0, 10), onChange: (e) => set("eidAppliedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Colostrum & Doe" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Given ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no", onValueChange: (v) => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe Milking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.doeMilkingStatus || "__none__", onValueChange: (v) => set("doeMilkingStatus", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "good", children: "Good let-down" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "poor", children: "Poor let-down" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "agalactia", children: "Agalactia" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mastitis", children: "Mastitis" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeComplications || "", onChange: (e) => set("doeComplications", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.vetAttended, onChange: (e) => set("vetAttended", e.target.checked) }),
          "Vet attended"
        ] }) }),
        form.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName || "", onChange: (e) => set("vetName", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function BcsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { assessmentDate: today() };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-bcs", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bcs-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const bcsYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [bcsYearFilter, setBcsYearFilter] = reactExports.useState("all");
  const filteredBcs = reactExports.useMemo(() => bcsYearFilter === "all" ? records : records.filter((r) => String(r.assessmentDate || "").startsWith(bcsYearFilter)), [records, bcsYearFilter]);
  const printBcs = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>BCS Records</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Body Condition Scoring Records${bcsYearFilter !== "all" ? ` — ${bcsYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Doe LIS Tag</th><th>Stage</th><th>BCS</th><th>Action Required</th><th>Assessed By</th></tr></thead><tbody>${filteredBcs.map((r) => `<tr><td>${fmt(r.assessmentDate)}</td><td>${r.doeLisTag || "—"}</td><td>${r.assessmentStage || "—"}</td><td>${r.bcsScore || "—"}</td><td>${r.actionRequired || "None"}</td><td>${r.assessedBy || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/goat-dairy/bcs-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-bcs", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/bcs-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-bcs", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const bcsChartData = reactExports.useMemo(() => {
    const byDate = {};
    [...records].sort((a, b) => String(a.assessmentDate).localeCompare(String(b.assessmentDate))).forEach((r) => {
      const key = String(r.assessmentDate || "").slice(0, 7);
      if (key.length !== 7) return;
      const label = (/* @__PURE__ */ new Date(key + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      if (!byDate[key]) byDate[key] = { label, scores: [] };
      const s = parseFloat(r.bcsScore || "");
      if (!isNaN(s)) byDate[key].scores.push(s);
    });
    return Object.keys(byDate).sort().map((k) => ({ label: byDate[k].label, avgBcs: byDate[k].scores.length ? parseFloat((byDate[k].scores.reduce((a, b) => a + b, 0) / byDate[k].scores.length).toFixed(2)) : null }));
  }, [records]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    bcsChartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "BCS Trend — Average by Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Target range: 2.5–3.5 at all stages" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: bcsChartData, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [1, 5], ticks: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`BCS ${v}`, "Avg BCS"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "avgBcs", name: "Avg BCS", stroke: "#10b981", strokeWidth: 2, dot: { r: 4, fill: "#10b981" }, connectNulls: true })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Body Condition Scoring (1–5 scale)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bcsYearFilter, onValueChange: setBcsYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            bcsYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printBcs, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm(blank);
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Assessment"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredBcs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No BCS records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "BCS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Assessed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredBcs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.assessmentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.doeLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.assessmentStage || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BcsBadge, { v: r.bcsScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-sm", children: r.actionRequired || "None" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: r.assessedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocAttach, { farmId, endpoint: "goat-dairy/bcs-records", recordId: r.id, documentPath: r.documentPath ?? null, documentName: r.documentName ?? null, queryKey: ["goat-dairy-bcs", String(farmId)], compact: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "BCS Assessment — ",
        fmt(viewRec.assessmentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.doeLisTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessment Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.assessmentStage || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "BCS Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BcsBadge, { v: viewRec.bcsScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.assessedBy || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Follow-up Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.followUpDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.actionRequired || "None" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "goat-dairy-bcs", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing(viewRec);
          setForm(viewRec);
          setOpen(true);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit BCS Record" : "Add BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.assessmentDate || "").slice(0, 10), onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Doe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doeLisTag || "", onChange: (e) => set("doeLisTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessmentStage || "__none__", onValueChange: (v) => set("assessmentStage", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mating", children: "Pre-mating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mid-pregnancy", children: "Mid-pregnancy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "late-pregnancy", children: "Late pregnancy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "post-kidding", children: "Post-kidding" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weaning", children: "Weaning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "peak-lactation", children: "Peak lactation" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "BCS Score (1–5)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.bcsScore || ""), onValueChange: (v) => set("bcsScore", v || null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessedBy || "", onChange: (e) => set("assessedBy", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Follow-up Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.followUpDate || "").slice(0, 10), onChange: (e) => set("followUpDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionRequired || "", onChange: (e) => set("actionRequired", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
const MONITOR_TYPES = [
  { value: "daily-temperature", label: "Daily Temperature Check" },
  { value: "cleaning", label: "Cleaning Record" },
  { value: "abr-test", label: "Antibiotic Residue Test" },
  { value: "maintenance", label: "Maintenance Check" }
];
const ABR_RESULTS = ["Negative", "Positive", "Borderline", "Invalid"];
function BulkTankTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showTanks, setShowTanks] = reactExports.useState(false);
  const [tankDialog, setTankDialog] = reactExports.useState(false);
  const [editingTank, setEditingTank] = reactExports.useState(null);
  const [tankForm, setTankForm] = reactExports.useState({ name: "", location: "", capacityLitres: "", manufacturer: "", serialNumber: "", installDate: "", notes: "" });
  const [monDialog, setMonDialog] = reactExports.useState(false);
  const [editingMon, setEditingMon] = reactExports.useState(null);
  const [monForm, setMonForm] = reactExports.useState({ tankId: "", recordDate: today(), recordType: "daily-temperature", tankTemperatureCelsius: "", tankCleaned: false, cleaningProductUsed: "", cleaningProductBatch: "", antibioticResidueTestRef: "", antibioticResidueResult: "", notes: "" });
  const [monYear, setMonYear] = reactExports.useState(String((/* @__PURE__ */ new Date()).getFullYear()));
  const tanksQ = useQuery({ queryKey: ["goat-dairy-bulk-tanks", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks`)).then((r) => r.json()) });
  const tanks = tanksQ.data?.tanks ?? [];
  const monQ = useQuery({ queryKey: ["goat-dairy-tank-records", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records`)).then((r) => r.json()) });
  const allMonRecords = monQ.data?.records ?? [];
  const monRecords = reactExports.useMemo(() => allMonRecords.filter((r) => new Date(r.recordDate).getFullYear() === parseInt(monYear)), [allMonRecords, monYear]);
  const collQ = useQuery({ queryKey: ["goat-dairy-milk-collections", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/milk-collections`)).then((r) => r.json()) });
  const allColls = collQ.data?.collections ?? [];
  const summary = reactExports.useMemo(() => {
    const yr = parseInt(monYear);
    const yrRecs = allMonRecords.filter((r) => new Date(r.recordDate).getFullYear() === yr);
    const tempRecs = yrRecs.filter((r) => r.recordType === "daily-temperature" && r.tankTemperatureCelsius != null);
    const tempOk = tempRecs.filter((r) => parseFloat(r.tankTemperatureCelsius) <= 4).length;
    const cleanings = yrRecs.filter((r) => r.tankCleaned).length;
    const abrTests = yrRecs.filter((r) => r.recordType === "abr-test").length;
    const yrColls = allColls.filter((c) => new Date(c.collectionDate).getFullYear() === yr);
    const totalVol = yrColls.reduce((s, c) => s + (c.volumeCollectedLitres ? parseFloat(c.volumeCollectedLitres) : 0), 0);
    return { tempOk, tempTotal: tempRecs.length, cleanings, abrTests, totalVol, collCount: yrColls.length };
  }, [allMonRecords, allColls, monYear]);
  const years = reactExports.useMemo(() => Array.from(/* @__PURE__ */ new Set([
    ...allMonRecords.map((r) => String(new Date(r.recordDate).getFullYear())),
    ...allColls.map((c) => String(new Date(c.collectionDate).getFullYear())),
    String((/* @__PURE__ */ new Date()).getFullYear())
  ])).sort((a, b) => parseInt(b) - parseInt(a)), [allMonRecords, allColls]);
  const saveTankM = useMutation({ mutationFn: (d) => editingTank ? fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks/${editingTank.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()) : fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-dairy-bulk-tanks", farmId] });
    setTankDialog(false);
    toast({ title: editingTank ? "Tank updated" : "Tank added" });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delTankM = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/bulk-tanks/${id}`), { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-dairy-bulk-tanks", farmId] });
    toast({ title: "Tank removed" });
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const saveMonM = useMutation({ mutationFn: (d) => editingMon ? fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records/${editingMon.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()) : fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-dairy-tank-records", farmId] });
    setMonDialog(false);
    toast({ title: editingMon ? "Record updated" : "Record saved" });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delMonM = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/bulk-tank-records/${id}`), { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["goat-dairy-tank-records", farmId] });
    toast({ title: "Record deleted" });
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openNewTank() {
    setEditingTank(null);
    setTankForm({ name: "", location: "", capacityLitres: "", manufacturer: "", serialNumber: "", installDate: "", notes: "" });
    setTankDialog(true);
  }
  function openEditTank(t) {
    setEditingTank(t);
    setTankForm({ name: t.name, location: t.location || "", capacityLitres: t.capacityLitres || "", manufacturer: t.manufacturer || "", serialNumber: t.serialNumber || "", installDate: t.installDate || "", notes: t.notes || "" });
    setTankDialog(true);
  }
  function openNewMon() {
    setEditingMon(null);
    setMonForm({ tankId: "", recordDate: today(), recordType: "daily-temperature", tankTemperatureCelsius: "", tankCleaned: false, cleaningProductUsed: "", cleaningProductBatch: "", antibioticResidueTestRef: "", antibioticResidueResult: "", notes: "" });
    setMonDialog(true);
  }
  function openEditMon(r) {
    setEditingMon(r);
    setMonForm({ tankId: r.tankId ? String(r.tankId) : "", recordDate: r.recordDate.slice(0, 10), recordType: r.recordType, tankTemperatureCelsius: r.tankTemperatureCelsius || "", tankCleaned: r.tankCleaned || false, cleaningProductUsed: r.cleaningProductUsed || "", cleaningProductBatch: r.cleaningProductBatch || "", antibioticResidueTestRef: r.antibioticResidueTestRef || "", antibioticResidueResult: r.antibioticResidueResult || "", notes: r.notes || "" });
    setMonDialog(true);
  }
  const tankName = (id) => id ? tanks.find((t) => t.id === id)?.name || `Tank #${id}` : "—";
  function generateReport() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Goat Dairy Bulk Tank Report ${monYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f0f0f0;padding:5px 8px;text-align:left;font-size:10px;border:1px solid #ddd}td{padding:4px 8px;border:1px solid #ddd;font-size:10px}.kpi{display:inline-block;background:#f7f7f7;border:1px solid #ddd;padding:8px 16px;border-radius:6px;margin:0 12px 8px 0}.kpi-val{font-size:18px;font-weight:bold;color:#1d4ed8}.kpi-lab{font-size:10px;color:#666}@media print{button{display:none}}</style></head><body>
<h1>Goat Dairy — Bulk Tank Report</h1>
<p style="color:#666;font-size:10px">Year: ${monYear} | Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</p>
<div>
<div class="kpi"><div class="kpi-val">${summary.tempOk}/${summary.tempTotal}</div><div class="kpi-lab">Temp ≤4°C Checks</div></div>
<div class="kpi"><div class="kpi-val">${summary.cleanings}</div><div class="kpi-lab">Cleaning Records</div></div>
<div class="kpi"><div class="kpi-val">${summary.abrTests}</div><div class="kpi-lab">ABR Tests</div></div>
<div class="kpi"><div class="kpi-val">${summary.totalVol.toFixed(0)}L</div><div class="kpi-lab">Milk Collected (${summary.collCount} collections)</div></div>
</div>
<h2>Tank Monitoring Records</h2>
<table><tr><th>Date</th><th>Tank</th><th>Type</th><th>Temp (°C)</th><th>Cleaned</th><th>Cleaning Product</th><th>ABR Ref</th><th>ABR Result</th><th>Notes</th></tr>
${monRecords.map((r) => `<tr><td>${fmt(r.recordDate)}</td><td>${tankName(r.tankId)}</td><td>${r.recordType.replace(/-/g, " ")}</td><td>${r.tankTemperatureCelsius || "—"}</td><td>${r.tankCleaned ? "Yes" : "—"}</td><td>${r.cleaningProductUsed || "—"}</td><td>${r.antibioticResidueTestRef || "—"}</td><td>${r.antibioticResidueResult || "—"}</td><td>${r.notes || "—"}</td></tr>`).join("")}
</table>
<h2>Milk Collections</h2>
<table><tr><th>Date</th><th>Tank</th><th>Volume (L)</th><th>Buyer</th><th>Tanker Reg</th><th>Driver</th><th>Coll. Ref</th><th>ABR Before</th><th>Net Pay (£)</th><th>Notes</th></tr>
${allColls.filter((c) => new Date(c.collectionDate).getFullYear() === parseInt(monYear)).map((c) => `<tr><td>${fmt(c.collectionDate)}</td><td>${tankName(c.tankId)}</td><td>${c.volumeCollectedLitres || "—"}</td><td>${c.milkBuyer || "—"}</td><td>${c.tankerRegistration || "—"}</td><td>${c.tankerDriverName || "—"}</td><td>${c.collectionRef || "—"}</td><td>${c.abtResultBeforeCollection || "—"}</td><td>${c.netPaymentPence ? "£" + (c.netPaymentPence / 100).toFixed(2) : "—"}</td><td>${c.notes || "—"}</td></tr>`).join("")}
</table>
<script>window.onload=()=>window.print()<\/script>
</body></html>`);
    w.document.close();
  }
  function TempBadge({ v }) {
    if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
    const n = parseFloat(v);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${n <= 4 ? "bg-green-100 text-green-800" : n <= 6 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
      v,
      "°C",
      n > 4 ? " ⚠" : ""
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Temp ≤4°C" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-700", children: [
          summary.tempOk,
          "/",
          summary.tempTotal
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "checks (",
          monYear,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Cleaning Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-700", children: summary.cleanings }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "records (",
          monYear,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "ABR Tests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-700", children: summary.abrTests }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          "tests (",
          monYear,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Milk Collected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-700", children: [
          summary.totalVol.toFixed(0),
          "L"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400", children: [
          summary.collCount,
          " collections (",
          monYear,
          ")"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateReport, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
      "Print Report"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between cursor-pointer select-none", onClick: () => setShowTanks((v) => !v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-800 flex items-center gap-1", children: [
          showTanks ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }),
          "Tank Registry (",
          tanks.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: (e) => {
          e.stopPropagation();
          openNewTank();
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Tank"
        ] })
      ] }),
      showTanks && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 divide-y", children: tanks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 py-2", children: "No tanks registered." }) : tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: t.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: [t.location, t.capacityLitres ? `${t.capacityLitres}L` : null, t.manufacturer].filter(Boolean).join(" · ") || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEditTank(t), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delTankM.mutate(t.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, t.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800", children: "Tank Monitoring Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monYear, onValueChange: setMonYear, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openNewMon, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add Record"
          ] })
        ] })
      ] }),
      monQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : monRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400 py-4", children: [
        "No monitoring records for ",
        monYear,
        "."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-xs text-gray-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "Tank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "Temp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "Cleaned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 font-medium", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: monRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-xs whitespace-nowrap", children: fmt(r.recordDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-xs", children: tankName(r.tankId) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-xs capitalize", children: r.recordType.replace(/-/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TempBadge, { v: r.tankTemperatureCelsius }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-xs", children: r.tankCleaned ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 inline" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: r.antibioticResidueResult }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-xs text-gray-500 max-w-[160px] truncate", children: r.notes || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "goat-dairy-tank-record", recordId: r.id, farmId, compact: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEditMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delMonM.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
          ] }) })
        ] }, r.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: monDialog, onOpenChange: (o) => {
      setMonDialog(o);
      if (!o) saveMonM.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editingMon ? "Edit" : "Add",
        " Monitoring Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: monForm.recordDate, onChange: (e) => setMonForm((f) => ({ ...f, recordDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.tankId, onValueChange: (v) => setMonForm((f) => ({ ...f, tankId: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tank…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
                tanks.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, t.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.recordType, onValueChange: (v) => setMonForm((f) => ({ ...f, recordType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MONITOR_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", placeholder: "e.g. 3.5", value: monForm.tankTemperatureCelsius, onChange: (e) => setMonForm((f) => ({ ...f, tankTemperatureCelsius: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "mon-tc", checked: monForm.tankCleaned, onChange: (e) => setMonForm((f) => ({ ...f, tankCleaned: e.target.checked })), className: "w-4 h-4 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "mon-tc", children: "Tank cleaned this session" })
        ] }),
        monForm.tankCleaned && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cleaning Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductUsed, onChange: (e) => setMonForm((f) => ({ ...f, cleaningProductUsed: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.cleaningProductBatch, onChange: (e) => setMonForm((f) => ({ ...f, cleaningProductBatch: e.target.value })) })
          ] })
        ] }),
        monForm.recordType === "abr-test" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: monForm.antibioticResidueTestRef, onChange: (e) => setMonForm((f) => ({ ...f, antibioticResidueTestRef: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: monForm.antibioticResidueResult, onValueChange: (v) => setMonForm((f) => ({ ...f, antibioticResidueResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ABR_RESULTS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: monForm.notes, onChange: (e) => setMonForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveMonM, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMonDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMonM.mutate({ ...monForm, tankId: monForm.tankId || null }), disabled: saveMonM.isPending, children: saveMonM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : editingMon ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tankDialog, onOpenChange: (o) => {
      setTankDialog(o);
      if (!o) saveTankM.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editingTank ? "Edit" : "Add",
        " Bulk Tank"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tank Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.name, onChange: (e) => setTankForm((f) => ({ ...f, name: e.target.value })), placeholder: "e.g. Main Tank" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.location, onChange: (e) => setTankForm((f) => ({ ...f, location: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Capacity (L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: tankForm.capacityLitres, onChange: (e) => setTankForm((f) => ({ ...f, capacityLitres: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.manufacturer, onChange: (e) => setTankForm((f) => ({ ...f, manufacturer: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tankForm.serialNumber, onChange: (e) => setTankForm((f) => ({ ...f, serialNumber: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Install Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: tankForm.installDate, onChange: (e) => setTankForm((f) => ({ ...f, installDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: tankForm.notes, onChange: (e) => setTankForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: saveTankM, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTankDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveTankM.mutate(tankForm), disabled: saveTankM.isPending, children: saveTankM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : editingTank ? "Save Changes" : "Add Tank" })
      ] })
    ] }) })
  ] });
}
const CAE_LABS = [
  "SRUC Veterinary Services",
  "SAC Consulting Veterinary Services",
  "APHA Starcross (Exeter)",
  "APHA Weybridge",
  "APHA Shrewsbury",
  "Axiom Veterinary Laboratories",
  "Biobest Laboratories",
  "University of Liverpool VDL",
  "Fera Science",
  "Other"
];
const CAE_ACCRED_BODIES = [
  "SGS UK (CAEV-free Scheme)",
  "British Goat Society",
  "Individual buyer scheme",
  "APHA",
  "Not enrolled in scheme",
  "Other"
];
const CAE_TEST_TYPES = [
  { value: "blood-elisa", label: "Blood ELISA" },
  { value: "agar-gel-id", label: "Agar gel immunodiffusion (AGID)" },
  { value: "pcr", label: "PCR" },
  { value: "western-blot", label: "Western blot" },
  { value: "post-mortem", label: "Post-mortem / histopathology" }
];
const caeIsAwaiting = (r) => !r.result || r.result === "";
const caeIsPostMortem = (t) => t === "post-mortem";
function CaeTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("log");
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [labOther, setLabOther] = reactExports.useState("");
  const blank = { testDate: today(), testType: "blood-elisa" };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-cae", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring`)).then((r) => r.json()) });
  const allRecords = Array.isArray(data) ? data : data?.records ?? [];
  const { data: vetData } = useQuery({ queryKey: ["vet-names", farmId], queryFn: () => fetch(api(`farms/${farmId}/vet-names`)).then((r) => r.json()), enabled: open });
  const vetNames = (vetData?.vets ?? []).map((v) => v.vetName).filter(Boolean);
  const { data: staffData } = useQuery({ queryKey: ["farm-staff", farmId], queryFn: () => fetch(api(`farms/${farmId}/staff`)).then((r) => r.json()), enabled: open });
  const staffNames = Array.isArray(staffData) ? staffData.map((s) => s.name).filter(Boolean) : [];
  const caeYears = reactExports.useMemo(() => {
    const s = new Set(allRecords.map((r) => String(r.testDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allRecords]);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const records = reactExports.useMemo(() => yearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.testDate || "").startsWith(yearFilter)), [allRecords, yearFilter]);
  const latestAccred = allRecords.find((r) => r.caeAccreditationStatus)?.caeAccreditationStatus;
  const awaitingCount = allRecords.filter(caeIsAwaiting).length;
  const printCae = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>CAE Monitoring</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>CAE Monitoring Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Test Type</th><th>Laboratory</th><th>Animals</th><th>Positives</th><th>Result</th><th>Next Test Due</th><th>Notes</th></tr></thead><tbody>${records.map((r) => `<tr><td>${fmt(r.testDate)}</td><td>${CAE_TEST_TYPES.find((t) => t.value === r.testType)?.label || r.testType}</td><td>${r.laboratory || "—"}</td><td>${r.animalsTestedCount ?? "—"}</td><td>${r.positiveCount ?? "—"}</td><td>${r.result || "Awaiting results"}</td><td>${fmt(r.nextTestDue)}</td><td>${r.notes || ""}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
  const openLogTest = () => {
    setEditing(null);
    setForm({ ...blank });
    setLabOther("");
    setMode("log");
    setOpen(true);
  };
  const openEnterResult = (r) => {
    setEditing(r);
    setForm({ ...r });
    setLabOther("");
    setMode("result");
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ ...r });
    setLabOther("");
    setMode("edit");
    setOpen(true);
  };
  const labIsKnown = CAE_LABS.slice(0, -1).includes(form.laboratory);
  const effectiveLab = form.laboratory === "Other" ? labOther : form.laboratory;
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, laboratory: effectiveLab })
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-cae", farmId] });
      setOpen(false);
      toast({ title: mode === "log" ? "Test event logged" : editing ? "Record updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/goat-dairy/cae-monitoring/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat-dairy-cae", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const testType = form.testType || "blood-elisa";
  const isPostMortem = caeIsPostMortem(testType);
  const vetLabel = isPostMortem ? "Examining vet" : "Sample taken by";
  const isNonNeg = !!(form.result && (form.result.includes("pos") || form.result === "inconclusive"));
  const dialogTitle = mode === "log" ? "Log CAE Test Event" : mode === "result" ? "Enter CAE Test Results" : "Edit CAE Record";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CAE — Caprine Arthritis Encephalitis" }),
      " is a progressive viral disease of goats causing joint disease in adults and neurological disease in kids. Accreditation through programmes such as SGS UK CAEV-free is expected by dairy buyers and assurance bodies. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Log each sampling event now — enter laboratory results when the report arrives." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm", children: [
      latestAccred && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-600", children: "Current accreditation:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: latestAccred })
      ] }),
      awaitingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5" }),
        awaitingCount,
        " test",
        awaitingCount > 1 ? "s" : "",
        " awaiting results"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "CAE Test Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            caeYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printCae, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openLogTest, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Test Event"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No CAE monitoring records yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: 'Use "Log Test Event" to record a blood draw or sampling event. Enter results once your laboratory report arrives.' })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Test Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Laboratory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Animals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Next Test" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b border-gray-50 hover:bg-gray-50 ${caeIsAwaiting(r) ? "bg-amber-50/50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs font-mono text-gray-400", children: r.testRef || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: CAE_TEST_TYPES.find((t) => t.value === r.testType)?.label || r.testType?.replace(/-/g, " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs text-gray-500", children: r.laboratory || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.animalsTestedCount != null ? r.animalsTestedCount : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: caeIsAwaiting(r) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: r.result }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs text-gray-500", children: fmt(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 items-center", children: [
          caeIsAwaiting(r) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "text-xs h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "CAE Test — ",
          fmt(viewRec.testDate)
        ] }),
        viewRec.testRef && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground pt-0.5", children: viewRec.testRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: CAE_TEST_TYPES.find((t) => t.value === viewRec.testType)?.label || viewRec.testType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Laboratory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.laboratory || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labRef || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: caeIsPostMortem(viewRec.testType) ? "Examining Vet" : "Sample Taken By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "—" }),
          viewRec.sampledByType && !caeIsPostMortem(viewRec.testType) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: viewRec.sampledByType === "vet" ? "Veterinary surgeon" : viewRec.sampledByType === "staff" ? "Farm staff member" : "Other" })
        ] }),
        !caeIsPostMortem(viewRec.testType) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.animalsTestedCount ?? "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Positives" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-medium ${(viewRec.positiveCount ?? 0) > 0 ? "text-red-700" : ""}`, children: viewRec.positiveCount ?? "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overall Result" }),
          caeIsAwaiting(viewRec) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: viewRec.result })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "CAE Accreditation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: viewRec.caeAccreditationStatus })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Accreditation Body" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.accreditationBody || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.nextTestDue) })
        ] }),
        viewRec.actionTaken && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Action Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.actionTaken })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "goat-dairy-cae", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        caeIsAwaiting(viewRec) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEnterResult(viewRec);
          setViewRec(null);
        }, children: "Enter Result" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }),
        mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pt-1", children: "Record the sampling event now. Return to enter laboratory results once they arrive." }),
        mode === "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-1", children: [
          "Test from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(editing?.testDate) }),
          " · ",
          CAE_TEST_TYPES.find((t) => t.value === editing?.testType)?.label,
          " · ",
          editing?.laboratory || "lab not recorded"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        (mode === "log" || mode === "edit") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.testDate || "").slice(0, 10), onChange: (e) => set("testDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: testType, onValueChange: (v) => set("testType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CAE_TEST_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          !isPostMortem && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Laboratory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: labIsKnown ? form.laboratory : form.laboratory ? "Other" : "", onValueChange: (v) => {
                set("laboratory", v || null);
                if (v !== "Other") setLabOther("");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select lab…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
                  CAE_LABS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l))
                ] })
              ] })
            ] }),
            form.laboratory === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Specify laboratory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: labOther, onChange: (e) => setLabOther(e.target.value), placeholder: "Laboratory name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: vetLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 mt-1", children: [
              !isPostMortem && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sampledByType || "", onValueChange: (v) => {
                set("sampledByType", v || null);
                set("vetName", null);
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Who took the sample?" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "vet", children: "Veterinary surgeon" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff", children: "Farm staff member" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: "Other" })
                ] })
              ] }),
              (isPostMortem || form.sampledByType === "vet") && vetNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: vetNames.includes(form.vetName || "") ? form.vetName || "" : "", onValueChange: (v) => set("vetName", v || null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: isPostMortem ? "Select examining vet…" : "Select vet from ledger…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— Not listed, type below —" }),
                  vetNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
                ] })
              ] }),
              form.sampledByType === "staff" && staffNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: staffNames.includes(form.vetName || "") ? form.vetName || "" : "", onValueChange: (v) => set("vetName", v || null), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— Not listed, type below —" }),
                  staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: n, children: n }, n))
                ] })
              ] }),
              (isPostMortem || form.sampledByType) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.vetName || "",
                  onChange: (e) => set("vetName", e.target.value),
                  placeholder: isPostMortem ? "Examining vet name" : form.sampledByType === "vet" ? "Vet name (or select above)" : form.sampledByType === "staff" ? "Staff member name (or select above)" : "Name or description"
                }
              )
            ] })
          ] })
        ] }),
        (mode === "result" || mode === "edit") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          !isPostMortem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value), placeholder: "Lab report reference" })
          ] }),
          !isPostMortem && mode === "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null) })
          ] }),
          !isPostMortem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Positives" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.positiveCount ?? "", onChange: (e) => set("positiveCount", e.target.value ? parseInt(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.result || "", onValueChange: (v) => set("result", v || null), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative (all clear)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inconclusive", children: "Inconclusive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caev-free", children: "CAEV-free certified" })
              ] })
            ] })
          ] }),
          isNonNeg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Non-negative result:" }),
              " Vet consultation, biosecurity review, and segregation of any seropositive animals are required. Document actions taken below."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CAE Accreditation Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.caeAccreditationStatus || "__none__", onValueChange: (v) => set("caeAccreditationStatus", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No change / not applicable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "caev-free", children: "CAEV-free certified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "provisional", children: "Provisional accreditation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-accredited", children: "Not accredited" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accreditation Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: CAE_ACCRED_BODIES.includes(form.accreditationBody) ? form.accreditationBody : form.accreditationBody ? "Other" : "__none__", onValueChange: (v) => set("accreditationBody", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not applicable" }),
                CAE_ACCRED_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.nextTestDue || "").slice(0, 10), onChange: (e) => set("nextTestDue", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isNonNeg ? "Action Taken *" : "Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionTaken || "", onChange: (e) => set("actionTaken", e.target.value), placeholder: isNonNeg ? "Required — describe biosecurity / management actions" : "e.g. All clear — no action required", className: isNonNeg && !form.actionTaken ? "border-red-300" : "" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2, placeholder: "Additional notes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          mode === "log" ? "Log Test Event" : mode === "result" ? "Save Results" : "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function AssuranceTab() {
  const [, navigate] = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-indigo-100 bg-indigo-50 p-4 flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-indigo-800 mb-1", children: "Assurance Certificates Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-indigo-700", children: [
          "Your farm's assurance memberships and certificates (BGS, organic bodies, buyer schemes etc.) are stored in the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Inspections → Assurance Certificates" }),
          " tab. Record expiry dates, certificate numbers, and upload copies there."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/inspections?tab=assurance-certs"),
          className: "flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap",
          children: [
            "Open Register ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3.5 h-3.5" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-green-100 bg-green-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-green-800 mb-1", children: "British Goat Society (BGS)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700", children: "The BGS is the UK body supporting dairy goat producers with herd recording, breed standards, and quality assurance. BGS milk recording data supports SCC compliance monitoring. Record BGS membership and certificate details in the Assurance Certificates register (link above)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.britishgoatsociety.com", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 mt-2 text-xs text-green-800 underline hover:text-green-900", children: "Visit British Goat Society ↗" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-100 bg-amber-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-amber-800 mb-1", children: "CAE Accreditation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700", children: "Several UK buyers require goat milk to come from CAEV-free or CAE accredited herds. Accreditation bodies include SGS UK and veterinary laboratories. Keep annual test records and accreditation certificates here and upload copies using the document attachment on each test record." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-700 mb-1", children: "National Milk Records (NMR)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "NMR is a separate statutory milk recording service that sends recording officers to the farm and provides SCC analysis, yield data, and quality trend reporting. NMR does not offer a public developer API — data exchange with NMR is handled through their own systems and cannot currently be automated from BDE Farm Trac. Your milk collection records within this app serve your own compliance audit trail and are independent of any NMR submission." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.nmr.co.uk", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 mt-2 text-xs text-gray-700 underline hover:text-gray-900", children: "Visit National Milk Records ↗" })
    ] })
  ] });
}
export {
  AssuranceTab,
  BcsTab,
  BulkTankTab,
  CaeTab,
  KiddingTab,
  MastitisTab,
  GoatDairyPage as default
};
