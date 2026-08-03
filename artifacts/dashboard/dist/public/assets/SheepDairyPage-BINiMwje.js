import { b as useAppStore, r as reactExports, j as jsxRuntimeExports, R as Redirect, u as useLocation, t as useQueryClient, a as useToast, l as useQuery, O as useMutation, c as Button, S as Plus, d as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, m as Card, n as CardContent, H as DialogDescription, C as Checkbox } from "./index-DmKdQ7dc.js";
import { A as AppLayout } from "./AppLayout-043XWITg.js";
import { T as TabBar, a as TabButton } from "./tab-button-B-pRLiL-.js";
import { T as Textarea } from "./textarea-B3BnPnd9.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BV5DYUfS.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-B8k2Lt8n.js";
import { B as Badge } from "./badge-Dd9DmBNE.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-C75g4NsW.js";
import { R as RecordAttachments } from "./RecordAttachments-djZZsEr9.js";
import { A as AbrKitStockSection, S as SccEquipmentSection, D as DairySuppliesTab } from "./DairyPage-O1B0FfjX.js";
import { A as AbrProcurementSection, D as DairyEnterpriseReport } from "./DairyEnterpriseReport-Dw6TZiBN.js";
import { C as ChevronRight } from "./tractor-js2Kek-5.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar, C as Cell, L as Legend } from "./generateCategoricalChart-DOYeVRpn.js";
import { L as LineChart } from "./LineChart-a_KOgEAO.js";
import { C as CartesianGrid } from "./CartesianGrid-s4kVRORo.js";
import { L as Line } from "./Line-D_hGTvCQ.js";
import { P as Printer } from "./printer-3OaRJkrz.js";
import { P as Pencil } from "./pencil-COTSzZN1.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-BLmnrwB4.js";
import { C as CircleCheck } from "./circle-check-CLHgZ2bc.js";
import { B as BarChart } from "./BarChart-B4qWdcWX.js";
import { P as PieChart, a as Pie } from "./PieChart-7SUMuueP.js";
import { T as TriangleAlert } from "./triangle-alert-BqKtXZ3i.js";
import { E as Eye } from "./eye-DSB64hhJ.js";
import { C as ComposedChart } from "./ComposedChart-DKX275is.js";
import { D as Droplets } from "./shield-alert-Bs5wl-Zd.js";
import "./use-safe-clerk-CdeIM_NL.js";
import "./database-BIWxw2sm.js";
import "./shield-check-rhIGv_FB.js";
import "./index-B1W-aXvq.js";
import "./index-BolDo61T.js";
import "./chevron-up-DTDCi_Cf.js";
import "./index-C9-HhWL2.js";
import "./use-upload-0vf59cYw.js";
import "./paperclip-BPYPOACx.js";
import "./upload-Cbg7Msjr.js";
import "./image--TuRSaTs.js";
import "./download-B6tmnwIL.js";
import "./DocAttach-CTPdl-ZL.js";
import "./RaiseTaskDialog-CHk2REty.js";
import "./index-dtVv5im3.js";
import "./use-farm-members-CZ7Tofg5.js";
import "./staff-select-CI6TeOdn.js";
import "./print-report-B_FwCCVJ.js";
import "./vmdMedicines-mq70NSvP.js";
import "./shopping-cart-DBNuzaE5.js";
import "./circle-x-C0SEZinA.js";
import "./file-down-Uft2ORTq.js";
import "./trending-down-B2RjwpFz.js";
import "./chevron-left-DxnumEbv.js";
import "./sparkles-EyETCODm.js";
import "./chart-no-axes-column-B6Uq3Mw9.js";
import "./receipt-BxvhZKbU.js";
import "./thermometer-DaKYWhTx.js";
import "./chevrons-up-down-CVTq47nr.js";
import "./badge-check-Cn9LUVmE.js";
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
function SheepSccBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const ok = v < 750;
  const warn = v >= 750 && v < 1500;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL ",
    v >= 1500 ? "⚠ Exceeds 1,500k limit" : ""
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
function fmtRaw(v) {
  return v == null || v === "" ? "—" : String(v);
}
const PRODUCT_CATEGORIES = ["Antibiotic", "NSAID", "Anthelmintic", "Antiparasitic", "Vaccine", "Homeopathic", "Other"];
const ROUTES_OF_ADMINISTRATION = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intravenous (IV)", "Oral", "Intramammary", "Topical", "Other"];
function SheepDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState("milk");
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Sheep Dairy", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Sheep Dairy Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "British Sheep Dairying Association compliance — milk recording with SCC monitoring (1,500,000 cells/mL regulatory limit), mastitis, lambing records with LIS tagging, body condition, bulk tank hygiene, and Maedi-Visna monitoring." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "milk", onClick: () => setTab("milk"), children: "Milk Collections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tupping", onClick: () => setTab("tupping"), children: "Tupping" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "kidding", onClick: () => setTab("kidding"), children: "Lambing Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "treatments", onClick: () => setTab("treatments"), children: "Vet Treatments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bcs", onClick: () => setTab("bcs"), children: "Body Condition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tank", onClick: () => setTab("tank"), children: "Bulk Tank" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mv", onClick: () => setTab("mv"), children: "Maedi-Visna" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assurance", onClick: () => setTab("assurance"), children: "Assurance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "abr-kit", onClick: () => setTab("abr-kit"), children: "ABR Kit Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scc-equipment", onClick: () => setTab("scc-equipment"), children: "SCC Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "enterprise", onClick: () => setTab("enterprise"), children: "Enterprise Report" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "supplies", onClick: () => setTab("supplies"), children: "Supplies" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(MilkTab, { farmId }),
      tab === "tupping" && /* @__PURE__ */ jsxRuntimeExports.jsx(TuppingTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "kidding" && /* @__PURE__ */ jsxRuntimeExports.jsx(SheepLambingTab, { farmId }),
      tab === "treatments" && /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentRegisterTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "mv" && /* @__PURE__ */ jsxRuntimeExports.jsx(MvTab, { farmId }),
      tab === "assurance" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssuranceTab, {}),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId })
      ] }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "sheep" }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId, endpoint: api(`farms/${farmId}/sheep-dairy-enterprise-report`), queryPrefix: "sheep-dairy-enterprise", speciesNote: "Milk income from sheep dairy collection records. Feed cost and other variable costs not yet included — add via Financial for a complete P&L." }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "sheep" })
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
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-milk", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/milk-records`)).then((r) => r.json()) });
  const allMilkRecords = data?.records ?? [];
  const milkYears = reactExports.useMemo(() => Array.from(new Set(allMilkRecords.map((r) => String(r.recordDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allMilkRecords]);
  const [milkYear, setMilkYear] = reactExports.useState("all");
  const records = reactExports.useMemo(() => milkYear === "all" ? allMilkRecords : allMilkRecords.filter((r) => String(r.recordDate ?? "").startsWith(milkYear)), [allMilkRecords, milkYear]);
  const totalYield = records.reduce((s, r) => s + (parseFloat(r.yieldLitres || "0") || 0), 0);
  const sccReadings = records.map((r) => r.buyerSccThousands ?? r.sccThousands).filter((v) => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`)).then((r) => r.json())
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/sheep-dairy/milk-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, abrKitStockId: abrKitStockId || void 0 }) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-milk", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/milk-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-milk", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openAdd() {
    setEditing(null);
    setForm(blank);
    setAbrKitStockId("");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(r);
    setAbrKitStockId("");
    setOpen(true);
  }
  const milkChartData = reactExports.useMemo(() => {
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
    return Object.keys(monthMap).sort().map((k) => monthMap[k]);
  }, [records]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Yield (all records)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-800", children: [
          totalYield.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Avg SCC (k/mL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1500 ? "text-red-700" : avgScc > 750 ? "text-amber-700" : "text-green-700"}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "UK limit: 1,500k cells/mL" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: records.length })
      ] }) })
    ] }),
    milkChartData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Yield & SCC Trend — Monthly" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Sheep regulatory SCC limit: 1,500k cells/mL" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: milkChartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, width: 55, tickFormatter: (v) => `${v}L` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, width: 65, tickFormatter: (v) => `${v}k` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [name === "SCC (k/mL)" ? `${v}k` : `${Number(v).toFixed(0)}L`, name] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "yieldL", name: "Yield (L)", fill: "#3b82f6", radius: [3, 3, 0, 0], maxBarSize: 40 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "scc", name: "SCC (k/mL)", stroke: "#ef4444", strokeWidth: 2, dot: { r: 3 }, connectNulls: true })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Milk Collection Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: milkYear, onValueChange: setMilkYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            milkYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.recordDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.sessionType || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.yieldLitres ? parseFloat(r.yieldLitres).toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheepSccBadge, { v: r.buyerSccThousands ?? r.sccThousands }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.buyerFatPercent ?? r.fatPercent ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.buyerProteinPercent ?? r.proteinPercent ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.antibioticResidueTestResult ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-medium ${r.antibioticResidueTestResult === "negative" ? "bg-green-100 text-green-800" : r.antibioticResidueTestResult === "positive" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`, children: r.antibioticResidueTestResult }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: r.milkBuyer || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC (on-farm, k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheepSccBadge, { v: viewRec.sccThousands }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheepSccBadge, { v: viewRec.buyerSccThousands }) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer Lab Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.buyerLabResultsStatus || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.netPaymentPence != null ? `£${(viewRec.netPaymentPence / 100).toFixed(2)}` : "—" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sheep-dairy-milk", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-1" }),
          "Edit"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "UK limit: 1,500k" })
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "is-retest-sd", checked: !!form.isRetest, onChange: (e) => {
                set("isRetest", e.target.checked);
                if (!e.target.checked) set("retestOfId", null);
              }, className: "w-4 h-4 rounded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest-sd", className: "font-normal cursor-pointer", children: "This is a follow-up retest of a previous non-negative result" })
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
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-mastitis", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const mastiYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.incidentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [mastiYear, setMastiYear] = reactExports.useState("all");
  const filtered = reactExports.useMemo(() => mastiYear === "all" ? records : records.filter((r) => String(r.incidentDate || "").startsWith(mastiYear)), [records, mastiYear]);
  const analytics = reactExports.useMemo(() => {
    const monthMap = {};
    filtered.forEach((r) => {
      const key = String(r.incidentDate || "").slice(0, 7);
      if (key.length === 7) monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const trend = Object.keys(monthMap).sort().map((k) => ({ label: (/* @__PURE__ */ new Date(k + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), cases: monthMap[k] }));
    const outcomeMap = {};
    filtered.forEach((r) => {
      const o = r.outcome || "ongoing";
      outcomeMap[o] = (outcomeMap[o] || 0) + 1;
    });
    const outcomeData = Object.entries(outcomeMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "), value }));
    const pathMap = {};
    filtered.forEach((r) => {
      if (r.pathogenIdentified?.trim()) {
        const p = r.pathogenIdentified.trim();
        pathMap[p] = (pathMap[p] || 0) + 1;
      }
    });
    const pathData = Object.entries(pathMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const animalMap = {};
    filtered.forEach((r) => {
      if (r.eweLisTag) animalMap[r.eweLisTag] = (animalMap[r.eweLisTag] || 0) + 1;
    });
    const repeatAnimals = Object.entries(animalMap).filter(([, c]) => c >= 2).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
    return { trend, outcomeData, pathData, repeatAnimals };
  }, [filtered]);
  const printCompliance = () => {
    const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const period = mastiYear === "all" ? "All records" : mastiYear;
    const pathRows = analytics.pathData.map((p) => `<tr><td>${p.name}</td><td>${p.value}</td><td>${filtered.length > 0 ? (p.value / filtered.length * 100).toFixed(0) : 0}%</td></tr>`).join("");
    const repeatRows = analytics.repeatAnimals.map((a) => `<tr><td>${a.tag}</td><td>${a.count}</td></tr>`).join("");
    const rows = filtered.map((r) => `<tr><td>${r.incidentDate ? new Date(r.incidentDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.eweLisTag || "—"}</td><td>${r.quarterAffected || "—"}</td><td>${r.pathogenIdentified || "—"}</td><td>${r.treatmentProduct || "—"}</td><td>${r.outcome || "Ongoing"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Mastitis Compliance — Sheep Dairy</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}h3{font-size:11px;margin:12px 0 6px}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}.kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}.kpi-val{font-size:20px;font-weight:700}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}table{width:100%;border-collapse:collapse;margin-bottom:14px}th,td{border:1px solid #e5e7eb;padding:4px 6px;font-size:10px;text-align:left}th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}</style></head><body><h1>Mastitis Compliance Report — Sheep Dairy</h1><h2>Period: ${period} · Printed: ${printedDate}</h2><div class="kpi"><div class="kpi-box"><div class="kpi-val">${filtered.length}</div><div class="kpi-lbl">Total cases</div></div><div class="kpi-box"><div class="kpi-val">${filtered.filter((r) => r.chronicCase).length}</div><div class="kpi-lbl">Chronic</div></div><div class="kpi-box"><div class="kpi-val">${filtered.filter((r) => r.culledDueToMastitis).length}</div><div class="kpi-lbl">Culled</div></div><div class="kpi-box"><div class="kpi-val">${analytics.repeatAnimals.length}</div><div class="kpi-lbl">Repeat ewes</div></div></div>${pathRows ? `<h3>Pathogen Breakdown</h3><table><tr><th>Pathogen</th><th>Cases</th><th>%</th></tr>${pathRows}</table>` : ""}${repeatRows ? `<h3>Repeat Offenders (≥2 episodes)</h3><table><tr><th>Ewe LIS Tag</th><th>Episodes</th></tr>${repeatRows}</table>` : ""}<h3>All Records</h3><table><tr><th>Date</th><th>Ewe LIS Tag</th><th>Quarter</th><th>Pathogen</th><th>Treatment</th><th>Outcome</th></tr>${rows || "<tr><td colspan='6'>No records</td></tr>"}</table><p class="note">BSDA mastitis compliance report produced by BDE Farm Trac. Retain for 3 years. Printed: ${printedDate}.</p></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Cases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: filtered.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Chronic Cases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: filtered.filter((r) => r.chronicCase).length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Culled Due to Mastitis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-700", children: filtered.filter((r) => r.culledDueToMastitis).length })
      ] }) })
    ] }),
    analytics.trend.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Monthly Case Trend" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.trend, margin: { top: 4, right: 8, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "cases", name: "Cases", fill: "#f59e0b", radius: [3, 3, 0, 0], maxBarSize: 40 })
      ] }) }) })
    ] }),
    (analytics.outcomeData.length > 0 || analytics.pathData.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      analytics.outcomeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Outcome Distribution" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { width: 220, height: 160, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: analytics.outcomeData, cx: 110, cy: 75, innerRadius: 40, outerRadius: 70, dataKey: "value", label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, labelLine: false, style: { fontSize: 9 }, children: analytics.outcomeData.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {})
        ] }) })
      ] }),
      analytics.pathData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Pathogen Breakdown" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: analytics.pathData, layout: "vertical", margin: { top: 0, right: 8, bottom: 0, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 9 }, width: 110 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", name: "Cases", fill: "#3b82f6", radius: [0, 3, 3, 0], maxBarSize: 20 })
        ] }) }) })
      ] })
    ] }),
    analytics.repeatAnimals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-amber-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-amber-800", children: [
        "⚠ Repeat Mastitis Ewes — ",
        analytics.repeatAnimals.length,
        " ewe",
        analytics.repeatAnimals.length !== 1 ? "s" : "",
        " with ≥2 episodes"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 flex flex-wrap gap-2", children: analytics.repeatAnimals.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md text-xs font-mono font-medium text-amber-900", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mastiYear, onValueChange: setMastiYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            mastiYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printCompliance, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Report"
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
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mastitis records yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ewe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Quarter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Pathogen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.incidentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.eweLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.quarterAffected || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.pathogenIdentified || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.treatmentProduct || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { v: r.outcome }),
          r.chronicCase && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-amber-600", children: "Chronic" })
        ] }),
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
        viewRec.eweLisTag || "Unknown ewe",
        " on ",
        fmt(viewRec.incidentDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ewe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.eweLisTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quarter Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.quarterAffected || "—" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Sample" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.labSampleTaken ? `Yes — ref: ${viewRec.labRef || "pending"}` : "No" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Withheld Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.milkWithdrawnUntil) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sheep-dairy-mastitis", recordId: viewRec.id }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Mastitis Record" : "Add Mastitis Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Incident Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.incidentDate || "").slice(0, 10), onChange: (e) => set("incidentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweLisTag || "", onChange: (e) => set("eweLisTag", e.target.value), placeholder: "LIS ear tag" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quarter Affected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quarterAffected || "__none__", onValueChange: (v) => set("quarterAffected", v === "__none__" ? null : v), children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pathogenIdentified || "", onChange: (e) => set("pathogenIdentified", e.target.value), placeholder: "e.g. Staph. aureus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null), placeholder: "e.g. 1200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "UK limit: 1,500k" })
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
function SheepLambingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { lambingDate: today(), birthOutcome: "live-single", lambCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-kidding", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records`)).then((r) => r.json()) });
  const allLambingRecords = data?.records ?? [];
  const lambYears = reactExports.useMemo(() => Array.from(new Set(allLambingRecords.map((r) => String(r.lambingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allLambingRecords]);
  const [lambYear, setLambYear] = reactExports.useState("all");
  const records = reactExports.useMemo(() => lambYear === "all" ? allLambingRecords : allLambingRecords.filter((r) => String(r.lambingDate ?? "").startsWith(lambYear)), [allLambingRecords, lambYear]);
  const liveCount = records.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? r.lambCount || 1 : 0), 0);
  const pendingEid = records.filter((r) => !r.eidApplied && r.birthOutcome?.includes("live")).length;
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-kidding", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/kidding-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-kidding", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LIS Tagging:" }),
      " Sheep EID tags must be applied before first movement off the holding — there is no 36-hour rule (unlike cattle BCMS). Record EID application date and LIS tag number below."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Litters Recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: records.length })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Live Lambs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-700", children: liveCount })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "EID Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${pendingEid > 0 ? "text-amber-700" : "text-gray-400"}`, children: pendingEid })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Lambing Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: lambYear, onValueChange: setLambYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            lambYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          const printedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          const rows = records.map((r) => `<tr><td>${r.lambingDate ? new Date(r.lambingDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.eweLisTag || "—"}</td><td>${r.birthOutcome?.replace(/-/g, " ") || "—"}</td><td>${r.lambCount ?? 1} × ${r.lambSex || "?"}</td><td>${r.easeScore ?? "—"}</td><td>${r.eidApplied ? "Applied" : "Pending"}</td><td>${r.lambBirthWeightKg || "—"}</td></tr>`).join("");
          const html = `<!DOCTYPE html><html><head><title>Lambing Records — Sheep Dairy</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}.kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}.kpi-box{border:1px solid #e5e7eb;border-radius:4px;padding:8px;text-align:center}.kpi-val{font-size:20px;font-weight:700}.kpi-lbl{font-size:9px;color:#6b7280;margin-top:2px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:left}th{background:#f9fafb;font-weight:700;text-transform:uppercase;font-size:9px}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px}</style></head><body><h1>Lambing Records — Sheep Dairy</h1><h2>Printed: ${printedDate}</h2><div class="kpi"><div class="kpi-box"><div class="kpi-val">${records.length}</div><div class="kpi-lbl">Litters recorded</div></div><div class="kpi-box"><div class="kpi-val">${liveCount}</div><div class="kpi-lbl">Live lambs</div></div><div class="kpi-box"><div class="kpi-val">${pendingEid}</div><div class="kpi-lbl">EID pending</div></div></div><table><tr><th>Date</th><th>Ewe LIS Tag</th><th>Outcome</th><th>Lambs</th><th>Ease</th><th>EID</th><th>Birth Weight (kg)</th></tr>${rows || "<tr><td colspan='7'>No records</td></tr>"}</table><p class="note">Sheep dairy lambing records — BDE Farm Trac. LIS EID tags must be applied before first movement off holding. Printed: ${printedDate}.</p></body></html>`;
          const w = window.open("", "_blank");
          if (!w) return;
          w.document.write(html);
          w.document.close();
          w.print();
        }, children: [
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
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No lambing records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ewe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Lambs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ease" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "EID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.lambingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.eweLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.birthOutcome?.replace(/-/g, " ") || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-3", children: [
          r.lambCount ?? 1,
          " × ",
          r.lambSex || "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EaseScoreBadge, { v: r.easeScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.eidApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-medium text-xs", children: "✓ Applied" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs font-medium", children: "Pending" }) }),
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
        "Lambing Record — ",
        fmt(viewRec.lambingDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ewe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono font-medium", children: viewRec.eweLisTag || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.birthOutcome?.replace(/-/g, " ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lamb Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.lambCount ?? 1 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.lambSex || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.lambBirthWeightKg || "—" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ewe Milking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.eweMilkingStatus || "—" })
        ] }),
        viewRec.eweComplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Ewe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.eweComplications })
        ] }),
        viewRec.vetAttended && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "Attended" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sheep-dairy-kidding", recordId: viewRec.id }) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Lambing Record" : "Add Lambing Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lambing Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.lambingDate || "").slice(0, 10), onChange: (e) => set("lambingDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweLisTag || "", onChange: (e) => set("eweLisTag", e.target.value), placeholder: "LIS ear tag" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lamb Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.lambCount || 1, onChange: (e) => set("lambCount", parseInt(e.target.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sex" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.lambSex || "__none__", onValueChange: (v) => set("lambSex", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ewe", children: "Ewe lamb" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ram", children: "Ram lamb" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mixed", children: "Mixed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Birth Weight (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.lambBirthWeightKg || "", onChange: (e) => set("lambBirthWeightKg", e.target.value) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EID Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lambEidTag || "", onChange: (e) => set("lambEidTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "LIS Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.lisTagNumber || "", onChange: (e) => set("lisTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.eidApplied, onChange: (e) => set("eidApplied", e.target.checked), id: "sd-eid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "sd-eid", className: "text-sm cursor-pointer", children: "EID tag applied" }),
          form.eidApplied && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "ml-2 w-40", value: String(form.eidAppliedDate || "").slice(0, 10), onChange: (e) => set("eidAppliedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Colostrum & Ewe" }) }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Milking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.eweMilkingStatus || "__none__", onValueChange: (v) => set("eweMilkingStatus", v === "__none__" ? null : v), children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweComplications || "", onChange: (e) => set("eweComplications", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
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
  const blank = { assessmentDate: today() };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-bcs", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records${editing ? `/${editing.id}` : ""}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-bcs", farmId] });
      setOpen(false);
      toast({ title: editing ? "Updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/bcs-records/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-bcs", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const bcsYears = reactExports.useMemo(() => {
    const s = new Set(records.map((r) => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [records]);
  const [bcsYear, setBcsYear] = reactExports.useState("all");
  const filteredBcs = reactExports.useMemo(() => bcsYear === "all" ? records : records.filter((r) => String(r.assessmentDate || "").startsWith(bcsYear)), [records, bcsYear]);
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
  const printBcs = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>BCS Records — Sheep Dairy</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Body Condition Scoring Records${bcsYear !== "all" ? ` — ${bcsYear}` : ""}</h2><table><thead><tr><th>Date</th><th>Ewe LIS Tag</th><th>Stage</th><th>BCS</th><th>Action Required</th><th>Assessed By</th></tr></thead><tbody>${filteredBcs.map((r) => `<tr><td>${fmt(r.assessmentDate)}</td><td>${r.eweLisTag || "—"}</td><td>${r.assessmentStage || "—"}</td><td>${r.bcsScore || "—"}</td><td>${r.actionRequired || "None"}</td><td>${r.assessedBy || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bcsYear, onValueChange: setBcsYear, children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Ewe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "BCS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Action" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Assessed By" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-3 text-left", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredBcs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-50 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.assessmentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-xs", children: r.eweLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 capitalize", children: r.assessmentStage || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BcsBadge, { v: r.bcsScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-sm", children: r.actionRequired || "None" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-gray-500", children: r.assessedBy || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setEditing(r);
            setForm(r);
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit BCS Record" : "Add BCS Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.assessmentDate || "").slice(0, 10), onChange: (e) => set("assessmentDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewe LIS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.eweLisTag || "", onChange: (e) => set("eweLisTag", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessmentStage || "__none__", onValueChange: (v) => set("assessmentStage", v === "__none__" ? null : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not specified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tupping", children: "Pre-tupping" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mid-pregnancy", children: "Mid-pregnancy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "late-pregnancy", children: "Late pregnancy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "post-lambing", children: "Post-lambing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weaning", children: "Weaning" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "lactation-peak", children: "Peak lactation" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.actionRequired || "", onChange: (e) => set("actionRequired", e.target.value), placeholder: "e.g. Increase ration, separate group" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes || "", onChange: (e) => set("notes", e.target.value), rows: 2 })
        ] })
      ] }),
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
  const tanksQ = useQuery({ queryKey: ["sheep-dairy-bulk-tanks", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tanks`)).then((r) => r.json()) });
  const tanks = tanksQ.data?.tanks ?? [];
  const monQ = useQuery({ queryKey: ["sheep-dairy-tank-records", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records`)).then((r) => r.json()) });
  const allMonRecords = monQ.data?.records ?? [];
  const monRecords = reactExports.useMemo(() => allMonRecords.filter((r) => new Date(r.recordDate).getFullYear() === parseInt(monYear)), [allMonRecords, monYear]);
  const collQ = useQuery({ queryKey: ["sheep-dairy-milk-collections", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/milk-collections`)).then((r) => r.json()) });
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
  const saveTankM = useMutation({ mutationFn: (d) => editingTank ? fetch(api(`farms/${farmId}/sheep-dairy/bulk-tanks/${editingTank.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()) : fetch(api(`farms/${farmId}/sheep-dairy/bulk-tanks`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dairy-bulk-tanks", farmId] });
    setTankDialog(false);
    toast({ title: editingTank ? "Tank updated" : "Tank added" });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delTankM = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tanks/${id}`), { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dairy-bulk-tanks", farmId] });
    toast({ title: "Tank removed" });
  }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const saveMonM = useMutation({ mutationFn: (d) => editingMon ? fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records/${editingMon.id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()) : fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records`), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dairy-tank-records", farmId] });
    setMonDialog(false);
    toast({ title: editingMon ? "Record updated" : "Record saved" });
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const delMonM = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/bulk-tank-records/${id}`), { method: "DELETE" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }).then((r) => r.json()), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["sheep-dairy-tank-records", farmId] });
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
    w.document.write(`<!DOCTYPE html><html><head><title>Sheep Dairy Bulk Tank Report ${monYear}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}h1{font-size:16px;margin-bottom:4px}h2{font-size:13px;margin:16px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f0f0f0;padding:5px 8px;text-align:left;font-size:10px;border:1px solid #ddd}td{padding:4px 8px;border:1px solid #ddd;font-size:10px}.kpi{display:inline-block;background:#f7f7f7;border:1px solid #ddd;padding:8px 16px;border-radius:6px;margin:0 12px 8px 0}.kpi-val{font-size:18px;font-weight:bold;color:#1d4ed8}.kpi-lab{font-size:10px;color:#666}@media print{button{display:none}}</style></head><body>
<h1>Sheep Dairy — Bulk Tank Report</h1>
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { recordType: "sheep-dairy-tank-record", recordId: r.id, farmId, compact: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEditMon(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => delMonM.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
          ] }) })
        ] }, r.id)) })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: monDialog, onOpenChange: setMonDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setMonDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMonM.mutate({ ...monForm, tankId: monForm.tankId || null }), disabled: saveMonM.isPending, children: saveMonM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : editingMon ? "Save Changes" : "Add Record" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tankDialog, onOpenChange: setTankDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setTankDialog(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveTankM.mutate(tankForm), disabled: saveTankM.isPending, children: saveTankM.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : editingTank ? "Save Changes" : "Add Tank" })
      ] })
    ] }) })
  ] });
}
const MV_LABS = [
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
const MV_ACCRED_BODIES = [
  "SRUC (MVA Scheme)",
  "SCAHFS",
  "Individual buyer scheme",
  "Not enrolled in scheme",
  "Other"
];
const MV_TEST_TYPES = [
  { value: "blood-elisa", label: "Blood ELISA" },
  { value: "agar-gel-id", label: "Agar gel immunodiffusion (AGID)" },
  { value: "pcr", label: "PCR" },
  { value: "western-blot", label: "Western blot" },
  { value: "bulk-milk-elisa", label: "Bulk milk ELISA" },
  { value: "post-mortem", label: "Post-mortem / histopathology" }
];
const mvIsAwaiting = (r) => !r.result || r.result === "";
const mvIsBulkMilk = (t) => t === "bulk-milk-elisa";
const mvIsPostMortem = (t) => t === "post-mortem";
function MvTab({ farmId }) {
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
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mv", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring`)).then((r) => r.json()) });
  const allRecords = Array.isArray(data) ? data : data?.records ?? [];
  const { data: vetData } = useQuery({ queryKey: ["vet-names", farmId], queryFn: () => fetch(api(`farms/${farmId}/vet-names`)).then((r) => r.json()), enabled: open });
  const vetNames = (vetData?.vets ?? []).map((v) => v.vetName).filter(Boolean);
  const { data: staffData } = useQuery({ queryKey: ["farm-staff", farmId], queryFn: () => fetch(api(`farms/${farmId}/staff`)).then((r) => r.json()), enabled: open });
  const staffNames = Array.isArray(staffData) ? staffData.map((s) => s.name).filter(Boolean) : [];
  const mvYears = reactExports.useMemo(() => {
    const s = new Set(allRecords.map((r) => String(r.testDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allRecords]);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const records = reactExports.useMemo(() => yearFilter === "all" ? allRecords : allRecords.filter((r) => String(r.testDate || "").startsWith(yearFilter)), [allRecords, yearFilter]);
  const latestAccred = allRecords.find((r) => r.mvAccreditationStatus)?.mvAccreditationStatus;
  const awaitingCount = allRecords.filter(mvIsAwaiting).length;
  const printMv = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>MV Monitoring</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Maedi-Visna Monitoring Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Test Type</th><th>Laboratory</th><th>Animals</th><th>Positives</th><th>Result</th><th>Next Test Due</th><th>Notes</th></tr></thead><tbody>${records.map((r) => `<tr><td>${fmt(r.testDate)}</td><td>${MV_TEST_TYPES.find((t) => t.value === r.testType)?.label || r.testType}</td><td>${r.laboratory || "—"}</td><td>${r.animalsTestedCount ?? "—"}</td><td>${r.positiveCount ?? "—"}</td><td>${r.result || "Awaiting results"}</td><td>${fmt(r.nextTestDue)}</td><td>${r.notes || ""}</td></tr>`).join("")}</tbody></table></body></html>`);
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
  const labIsKnown = MV_LABS.slice(0, -1).includes(form.laboratory);
  const effectiveLab = form.laboratory === "Other" ? labOther : form.laboratory;
  const save = useMutation({
    mutationFn: (body) => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, laboratory: effectiveLab })
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-mv", farmId] });
      setOpen(false);
      toast({ title: mode === "log" ? "Test event logged" : editing ? "Record updated" : "Added" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/mv-monitoring/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-mv", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const testType = form.testType || "blood-elisa";
  const isBulkMilk = mvIsBulkMilk(testType);
  const isPostMortem = mvIsPostMortem(testType);
  const vetLabel = isPostMortem ? "Examining vet" : "Sample taken by";
  const showLab = !isPostMortem;
  const showAnimals = !isBulkMilk && !isPostMortem;
  const isNonNeg = !!(form.result && (form.result.includes("pos") || form.result === "inconclusive"));
  const dialogTitle = mode === "log" ? "Log MV Test Event" : mode === "result" ? "Enter MV Test Results" : "Edit MV Record";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Maedi-Visna (MV)" }),
      " is a progressive chronic viral disease of sheep (OIE listed). UK dairy sheep health schemes require regular testing. Accreditation is available through SRUC and other bodies. Dairy ewes should be MV-accredited for premium markets. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Log each blood draw or sampling event immediately — enter laboratory results when the report arrives." })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "MV Test Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            mvYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printMv, children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No MV monitoring records yet." }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b border-gray-50 hover:bg-gray-50 ${mvIsAwaiting(r) ? "bg-amber-50/50" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs font-mono text-gray-400", children: r.testRef || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-medium", children: fmt(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs", children: MV_TEST_TYPES.find((t) => t.value === r.testType)?.label || r.testType?.replace(/-/g, " ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs text-gray-500", children: r.laboratory || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: r.animalsTestedCount != null ? r.animalsTestedCount : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: mvIsAwaiting(r) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: r.result }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-xs text-gray-500", children: fmt(r.nextTestDue) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 items-center", children: [
          mvIsAwaiting(r) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "text-xs h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-red-500", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "MV Test — ",
          fmt(viewRec.testDate)
        ] }),
        viewRec.testRef && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground pt-0.5", children: viewRec.testRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: MV_TEST_TYPES.find((t) => t.value === viewRec.testType)?.label || viewRec.testType })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: mvIsPostMortem(viewRec.testType) ? "Examining Vet" : "Sample Taken By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.vetName || "—" }),
          viewRec.sampledByType && !mvIsPostMortem(viewRec.testType) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: viewRec.sampledByType === "vet" ? "Veterinary surgeon" : viewRec.sampledByType === "staff" ? "Farm staff member" : "Other" })
        ] }),
        !mvIsBulkMilk(viewRec.testType) && !mvIsPostMortem(viewRec.testType) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
          mvIsAwaiting(viewRec) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: viewRec.result })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Accreditation Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResultBadge, { v: viewRec.mvAccreditationStatus })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sheep-dairy-mv", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRec(null), children: "Close" }),
        mvIsAwaiting(viewRec) && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }),
        mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground pt-1", children: "Record the sampling event now. Return to enter laboratory results once they arrive." }),
        mode === "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-1", children: [
          "Test from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(editing?.testDate) }),
          " · ",
          MV_TEST_TYPES.find((t) => t.value === editing?.testType)?.label,
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MV_TEST_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
            ] })
          ] }),
          showLab && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Laboratory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: labIsKnown ? form.laboratory : form.laboratory ? "Other" : "", onValueChange: (v) => {
                set("laboratory", v || null);
                if (v !== "Other") setLabOther("");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select lab…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "Not specified" }),
                  MV_LABS.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: l, children: l }, l))
                ] })
              ] })
            ] }),
            form.laboratory === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Specify laboratory" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: labOther, onChange: (e) => setLabOther(e.target.value), placeholder: "Laboratory name" })
            ] })
          ] }),
          showAnimals && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null) })
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
          showLab && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value), placeholder: "Lab report reference" })
          ] }),
          showAnimals && mode === "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animals Tested" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.animalsTestedCount ?? "", onChange: (e) => set("animalsTestedCount", e.target.value ? parseInt(e.target.value) : null) })
          ] }),
          showAnimals && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
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
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "accredited-clear", children: "Accredited — Clear" })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "MV Accreditation Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.mvAccreditationStatus || "__none__", onValueChange: (v) => set("mvAccreditationStatus", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "No change / not applicable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "accredited-negative", children: "Accredited — Negative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "provisional", children: "Provisional accreditation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-accredited", children: "Not accredited" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accreditation Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: MV_ACCRED_BODIES.includes(form.accreditationBody) ? form.accreditationBody : form.accreditationBody ? "Other" : "__none__", onValueChange: (v) => set("accreditationBody", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not applicable" }),
                MV_ACCRED_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b))
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
function TuppingTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["sheep-tupping", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: async (body) => {
      const url = editing ? api(`farms/${farmId}/sheep-tupping-records/${editing.id}`) : api(`farms/${farmId}/sheep-tupping-records`);
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
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
  const years = reactExports.useMemo(
    () => Array.from(new Set(rows.map((r) => String(r.tuppingStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(),
    [rows]
  );
  const filtered = reactExports.useMemo(
    () => yearFilter === "all" ? rows : rows.filter((r) => String(r.tuppingStartDate ?? "").startsWith(yearFilter)),
    [rows, yearFilter]
  );
  const fmtD = (v) => v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtV = (v) => v == null || v === "" ? "—" : String(v);
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5 text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-sm", children: "No tupping records for this period." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Start Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "End Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ram Breed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ram Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ewes Exposed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Expected Lambing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Progesterone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtD(r.tuppingStartDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtD(r.tuppingEndDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtV(r.ramBreed) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtV(r.ramTagNumber) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtV(r.ewesExposed) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmtD(r.expectedLambingStart) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.progesteroneUsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 text-xs font-medium", children: "CIDR / Prog." }) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewing(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] }) })
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewing, onOpenChange: (o) => {
      if (!o) setViewing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tupping Record Details" }) }),
      viewing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          ["Start Date", fmtD(viewing.tuppingStartDate)],
          ["End Date", fmtD(viewing.tuppingEndDate)],
          ["Ram Breed", fmtV(viewing.ramBreed)],
          ["Ram Tag", fmtV(viewing.ramTagNumber)],
          ["Ram Source", fmtV(viewing.ramSource)],
          ["Ewes Exposed", fmtV(viewing.ewesExposed)],
          ["Tupping Method", fmtV(viewing.tuppingMethod)],
          ["Harness Colour", fmtV(viewing.harnessColour)],
          ["Expected Lambing Start", fmtD(viewing.expectedLambingStart)],
          ["Expected Lambing End", fmtD(viewing.expectedLambingEnd)]
        ].map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: value })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Progesterone / CIDR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewing.progesteroneUsed ? "Yes" : "No" })
        ] }),
        viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtV(viewing.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Tupping Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.tuppingStartDate ?? "", onChange: (e) => sf("tuppingStartDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.tuppingEndDate ?? "", onChange: (e) => sf("tuppingEndDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ramBreed ?? "", onValueChange: (v) => sf("ramBreed", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select breed..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Suffolk", "Texel", "Charollais", "Beltex", "Bluefaced Leicester", "Border Leicester", "Hampshire Down", "Poll Dorset", "Rouge de l'Ouest", "Vendeen", "Lleyn", "Cheviot", "Swaledale", "Herdwick", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Tag Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ramTagNumber ?? "", onChange: (e) => sf("ramTagNumber", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ram Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.ramSource ?? "", onValueChange: (v) => sf("ramSource", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Home bred", "Purchased at auction/market", "Private sale", "AI centre", "ET donor flock", "Hired/loaned", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ewes Exposed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.ewesExposed ?? "", onChange: (e) => sf("ewesExposed", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tupping Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tuppingMethod ?? "", onValueChange: (v) => sf("tuppingMethod", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Natural service", "AI (fresh)", "AI (frozen)", "ET"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harness Colour" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harnessColour ?? "", onValueChange: (v) => sf("harnessColour", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "None"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Lambing Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingStart ?? "", onChange: (e) => sf("expectedLambingStart", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Lambing End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expectedLambingEnd ?? "", onChange: (e) => sf("expectedLambingEnd", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.progesteroneUsed === "true", onCheckedChange: (v) => sf("progesteroneUsed", v ? "true" : "false"), id: "prog-conv" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prog-conv", className: "cursor-pointer font-normal", children: "Progesterone / CIDR used" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate({ ...form }), disabled: !form.tuppingStartDate || save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          editing ? "Save" : "Add"
        ] })
      ] })
    ] }) })
  ] });
}
function TreatmentRegisterTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const blank = { treatmentDate: today(), certifierNotified: false, treatmentNumber: 1 };
  const [form, setForm] = reactExports.useState(blank);
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const { data, isLoading } = useQuery({
    queryKey: ["sheep-dairy-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/treatments`)).then((r) => r.json())
  });
  const allTreatments = data?.records ?? [];
  const treatYears = reactExports.useMemo(() => Array.from(new Set(allTreatments.map((r) => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allTreatments]);
  const [treatYear, setTreatYear] = reactExports.useState("all");
  const records = reactExports.useMemo(() => treatYear === "all" ? allTreatments : allTreatments.filter((r) => String(r.treatmentDate ?? "").startsWith(treatYear)), [allTreatments, treatYear]);
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/sheep-dairy/treatments${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Treatment recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/sheep-dairy/treatments/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sheep-dairy-treatments", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(r);
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: treatYear, onValueChange: setTreatYear, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
          treatYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Add Treatment"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Animal LIS Tags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Milk W/D (days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Milk W/D End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No treatment records yet." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.treatmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs max-w-[120px] truncate", children: r.animalLisTags || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.standardMilkWithdrawalDays != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [
            r.standardMilkWithdrawalDays,
            "d"
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.milkWithdrawalEndDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Vet Treatment — ",
        viewRec.productName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.treatmentDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.treatmentNumber })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Animal LIS Tags" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono text-xs", children: fmtRaw(viewRec.animalLisTags) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.numberOfAnimals) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.productName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.productCategory) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.activeIngredient) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.doseAmount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.routeOfAdministration) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.vetName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prescription Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.prescriptionRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.standardMilkWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.milkWithdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.standardMeatWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meat W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.meatWithdrawalEndDate) })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Treatment" : "Record Vet Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record veterinary treatments and withdrawal periods for all treated animals." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.treatmentDate ?? "").slice(0, 10), onChange: f("treatmentDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentNumber ?? 1, onChange: (e) => setForm((p) => ({ ...p, treatmentNumber: Number(e.target.value) })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Animal LIS Tags (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.animalLisTags ?? "", onChange: f("animalLisTags"), placeholder: "e.g. UK123456789012, UK123456789013" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Animals" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfAnimals ?? "", onChange: (e) => setForm((p) => ({ ...p, numberOfAnimals: e.target.value ? Number(e.target.value) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productCategory ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, productCategory: v === "__none__" ? null : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: f("productName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Active Ingredient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.activeIngredient ?? "", onChange: f("activeIngredient") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.doseAmount ?? "", onChange: f("doseAmount") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route of Administration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.routeOfAdministration ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, routeOfAdministration: v === "__none__" ? null : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROUTES_OF_ADMINISTRATION.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vetName ?? "", onChange: f("vetName") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.prescriptionRef ?? "", onChange: f("prescriptionRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMilkWithdrawalDays ?? "", onChange: (e) => setForm((p) => ({ ...p, standardMilkWithdrawalDays: e.target.value ? Number(e.target.value) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.milkWithdrawalEndDate ?? "").slice(0, 10), onChange: f("milkWithdrawalEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMeatWithdrawalDays ?? "", onChange: (e) => setForm((p) => ({ ...p, standardMeatWithdrawalDays: e.target.value ? Number(e.target.value) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.meatWithdrawalEndDate ?? "").slice(0, 10), onChange: f("meatWithdrawalEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: !form.productName || save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
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
          "Your farm's assurance memberships and certificates (BSDA, Red Tractor, organic bodies etc.) are stored in the ",
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-green-800 mb-1", children: "British Sheep Dairying Association (BSDA)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700", children: "The BSDA supports UK sheep dairy producers with technical guidance, traceability, and assurance frameworks for sheep milk production. Record your BSDA membership and certificate details in the Assurance Certificates register (link above)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.sheepdairying.com", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 mt-2 text-xs text-green-800 underline hover:text-green-900", children: "Visit British Sheep Dairying Association ↗" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-blue-100 bg-blue-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-blue-800 mb-1", children: "Red Tractor — Sheep milk not currently covered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700", children: "Red Tractor does not currently operate an assurance scheme specifically for sheep or goat milk production. Producers should refer to BSDA guidance, buyer assurance requirements, and their certifying body requirements directly." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-gray-200 bg-gray-50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-700 mb-1", children: "National Milk Records (NMR)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "NMR is a separate statutory milk recording service that sends recording officers to the farm and provides SCC analysis, yield data, and quality trend reports. NMR does not offer a public developer API — data exchange with NMR is handled through their own systems and cannot currently be automated from BDE Farm Trac. Your milk collection records within this app serve your own compliance audit trail and are independent of any NMR submission." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.nmr.co.uk", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 mt-2 text-xs text-gray-700 underline hover:text-gray-900", children: "Visit National Milk Records ↗" })
    ] })
  ] });
}
export {
  AssuranceTab,
  BcsTab,
  BulkTankTab,
  MastitisTab,
  MvTab,
  SheepLambingTab,
  TreatmentRegisterTab,
  TuppingTab,
  SheepDairyPage as default
};
