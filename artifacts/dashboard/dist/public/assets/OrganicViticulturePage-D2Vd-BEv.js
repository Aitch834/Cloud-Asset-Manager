import { b as useAppStore, r as reactExports, l as useQuery, j as jsxRuntimeExports, K as Map, A as ArrowRight, T as FlaskConical, m as Card, t as useQueryClient, a as useToast, O as useMutation, c as Button, S as Plus, d as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, H as DialogDescription } from "./index-R4XICohc.js";
import { A as AppLayout, $ as Grape, e as ChartColumn, c as ClipboardList, S as Sprout, Y as Scissors, r as Bug, G as Gauge, d as Wrench, B as BookOpen, T as TrendingUp } from "./AppLayout-p836YkSR.js";
import { T as TabBar, a as TabButton } from "./tab-button-C_p-Tjj3.js";
import { R as RecordAttachments } from "./RecordAttachments-BScDrQTS.js";
import { W as Wine, B as Beaker, D as Droplet, a as BatchTrailQuickSearch, b as WineProductionTab, c as WineryStockTab, H as HarvestReceptionTab, P as PressingRecordsTab, F as FermentationRecordsTab, V as VesselRegisterTab, C as CellarOpsTab, d as BottlingRecordsTab, S as So2TestingTab, E as EquipmentRegisterTab, O as OverviewTab, e as VineRegisterTab, f as BlocksTab, g as VineyardBlockMapTab, h as PhenologyTab, i as OperationsTab, j as HarvestTab, k as ScoutingTab, G as GiComplianceTab, L as LicensingTab, l as ExciseDutyTab, T as TastingsToursTab, A as AgeVerificationTab, m as SprayDiaryTab, n as SoilAnalysisTab, o as ViticulturalAnalyticsTab, p as VintageSeasonReportTab, q as ViticulturalEnterpriseReport } from "./ViticulturePage-Bj1lNzXz.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-B298kzIf.js";
import { T as Textarea } from "./textarea-COanlBw4.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-8zr33rK0.js";
import { u as useLookupStrings } from "./use-lookup-0J330gzG.js";
import { S as StaffSelect } from "./staff-select-6e2Jznve.js";
import { F as FileText } from "./shield-alert-DLMzHCQQ.js";
import { A as Award } from "./award-D-rUs408.js";
import { L as Leaf } from "./triangle-alert-DoYQtXrW.js";
import { R as Receipt } from "./receipt-BK2q3nq6.js";
import { C as CalendarCheck } from "./calendar-check-bEW7MWpK.js";
import { S as ShieldCheck } from "./shield-check-CjTpMlqB.js";
import { P as Package } from "./use-safe-clerk-9Diu1NTz.js";
import { F as FileDown } from "./file-down-BzHp5JK2.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, B as Bar } from "./generateCategoricalChart-BfcAnxRo.js";
import { B as BarChart } from "./BarChart-C3EN7W8j.js";
import { C as CartesianGrid } from "./CartesianGrid-D3V8O0hE.js";
import { P as Pencil } from "./pencil-7kPRrtTL.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-CW0p5gY-.js";
import { C as ChevronUp } from "./chevron-up-BUruL3pK.js";
import "./database-Dj8SDLcA.js";
import "./tractor-DsJv_0QH.js";
import "./use-upload-D3wwqzeM.js";
import "./paperclip-BR1m5H2-.js";
import "./upload-DMph6Doi.js";
import "./image-S631RKhq.js";
import "./download-D4TX3UqA.js";
import "./Line-D4mk-w2o.js";
import "./LineChart-yhjGPbwZ.js";
import "./printer-Nl0FSCcI.js";
import "./badge-B-nhOm9J.js";
import "./typeof-WJl3ipnu.js";
import "./search-BZ_TeQF1.js";
import "./git-branch-wdJBXWfg.js";
import "./eye-B_nB7cVZ.js";
import "./circle-check-6m9i0MuK.js";
import "./circle-x-BOOcMqaN.js";
import "./pen-line-DB0KH_Qp.js";
import "./arrow-up-BKt2v6ky.js";
import "./arrow-up-down-D62UCWsf.js";
import "./csv-Dr539t8b.js";
import "./globe-BSzgpKlb.js";
import "./index-BTvjRpbJ.js";
import "./index-DYWzTIYo.js";
function fmt(val) {
  if (!val) return "—";
  return val;
}
function fmtDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB");
  } catch {
    return val;
  }
}
function fmtNum(val) {
  if (val === null || val === void 0) return "—";
  return String(val);
}
function exportCSV(rows, filename, cols) {
  const header = cols.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((r) => cols.map((c) => {
    const v = c.fmt ? c.fmt(r) : r[c.key] ?? "";
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
const TABS = [
  { id: "vit-overview", label: "Overview", icon: ChartColumn },
  { id: "vine-register", label: "Vine Register", icon: ClipboardList },
  { id: "blocks", label: "Blocks", icon: Sprout },
  { id: "block-map", label: "Block Map", icon: Map },
  { id: "block-conversion", label: "Block Conversion", icon: ArrowRight },
  { id: "input-log", label: "Organic Inputs", icon: ClipboardList },
  { id: "copper-register", label: "Copper Register", icon: FlaskConical },
  { id: "input-derogations", label: "Input Derogations", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "phenology", label: "Phenology", icon: Leaf },
  { id: "operations", label: "Pruning & Canopy", icon: Scissors },
  { id: "vit-harvest", label: "Harvest", icon: Grape },
  { id: "scouting", label: "Disease Scouting", icon: Bug },
  { id: "gi-compliance", label: "GI Compliance", icon: Award },
  { id: "licensing", label: "Licensing", icon: FileText },
  { id: "excise", label: "Excise & Duty", icon: Receipt },
  { id: "tours", label: "Tastings & Tours", icon: CalendarCheck },
  { id: "age-check", label: "Age Verification", icon: ShieldCheck },
  { id: "wine-production", label: "Wine Production", icon: Wine },
  { id: "winery-stock", label: "Winery Stock", icon: Package },
  { id: "winery-reception", label: "Grape Intake", icon: Grape },
  { id: "winery-pressing", label: "Pressing Records", icon: Gauge },
  { id: "winery-fermentation", label: "Fermentation", icon: Beaker },
  { id: "winery-vessels", label: "Tank & Vessel Register", icon: Package },
  { id: "winery-cellar-ops", label: "Cellar Operations", icon: Wrench },
  { id: "winery-bottling", label: "Bottling Records", icon: Wine },
  { id: "winery-so2", label: "SO₂ Testing Register", icon: FlaskConical },
  { id: "winery-equipment", label: "Lab Equipment", icon: ShieldCheck },
  { id: "spray-diary", label: "Spray Diary", icon: Droplet },
  { id: "soil-analysis", label: "Soil & Leaf Analysis", icon: FlaskConical },
  { id: "analytics", label: "Analytics", icon: ChartColumn },
  { id: "vintage-report", label: "Vintage Report", icon: BookOpen },
  { id: "enterprise-report", label: "Enterprise Report", icon: TrendingUp }
];
const BLOCK_STATUS_OPTIONS = ["in-conversion", "fully-organic", "suspended", "withdrawn"];
const INPUT_TYPE_OPTIONS = ["Fungicide", "Insecticide", "Fertiliser", "Growth Regulator", "Soil Amendment", "Biostimulant", "Other"];
const APPROVAL_STATUS_OPTIONS = ["permitted", "derogation", "not-permitted"];
const COPPER_UNIT_OPTIONS = ["kg/ha", "g/ha", "L/ha"];
const DEROGATION_STATUS_OPTIONS = ["pending", "approved", "refused", "withdrawn", "expired"];
const CORRESPONDENCE_TYPE_OPTIONS = ["Email", "Letter", "Phone Call", "Meeting", "Portal Submission", "Decision Notice", "Other"];
const DIRECTION_OPTIONS = ["outbound", "inbound"];
const CERT_TYPE_OPTIONS = ["Vineyard Organic Certificate", "Organic Wine Certificate", "In-Conversion Certificate", "Other"];
const CERT_STATUS_OPTIONS = ["active", "expired", "suspended", "withdrawn"];
function BlockStatusChip({ status }) {
  const map = {
    "in-conversion": "bg-amber-100 text-amber-800",
    "fully-organic": "bg-green-100 text-green-800",
    "suspended": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700"
  };
  const label = {
    "in-conversion": "In Conversion",
    "fully-organic": "Fully Organic",
    "suspended": "Suspended",
    "withdrawn": "Withdrawn"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`, children: label[status] ?? status });
}
function ApprovalChip({ status }) {
  const map = {
    "permitted": "bg-green-100 text-green-800",
    "derogation": "bg-amber-100 text-amber-800",
    "not-permitted": "bg-red-100 text-red-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`, children: status === "not-permitted" ? "Not Permitted" : status.charAt(0).toUpperCase() + status.slice(1) });
}
function DerogationStatusChip({ status }) {
  const map = {
    "pending": "bg-amber-100 text-amber-800",
    "approved": "bg-green-100 text-green-800",
    "refused": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700",
    "expired": "bg-orange-100 text-orange-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`, children: status.charAt(0).toUpperCase() + status.slice(1) });
}
function CertStatusChip({ status }) {
  const map = {
    "active": "bg-green-100 text-green-800",
    "expired": "bg-red-100 text-red-800",
    "suspended": "bg-amber-100 text-amber-800",
    "withdrawn": "bg-gray-100 text-gray-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`, children: status.charAt(0).toUpperCase() + status.slice(1) });
}
function BlockConversionTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["org-vit-block-status", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/block-status`).then((r) => r.json())
  });
  const openAdd = () => {
    setForm({ status: "in-conversion" });
    setShowAdd(true);
  };
  const openEdit = (r) => {
    setForm({
      blockName: r.blockName ?? "",
      certifyingBody: r.certifyingBody ?? "",
      status: r.status ?? "in-conversion",
      conversionStartDate: r.conversionStartDate ?? "",
      fullyOrganicDate: r.fullyOrganicDate ?? "",
      preConversionLandUse: r.preConversionLandUse ?? "",
      syntheticHistory: r.syntheticHistory ?? "",
      notes: r.notes ?? ""
    });
    setEditing(r);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-viticulture/block-status/${editing.id}` : `/api/farms/${farmId}/organic-viticulture/block-status`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] });
      setShowAdd(false);
      setEditing(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/block-status/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] });
      setDeleting(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" })
  });
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const landUseTypes = useLookupStrings("organic_land_use_types", ["Conventional arable", "Conventional grassland", "Set-aside / fallow", "Woodland / forestry", "Previously certified organic", "Other"]);
  const records = data?.records ?? [];
  const statusFiltered = statusFilter === "all" ? records : records.filter((r) => String(r.status) === statusFilter);
  const convCsvCols = [
    { key: "blockName", label: "Block" },
    { key: "certifyingBody", label: "Certifying Body" },
    { key: "status", label: "Status" },
    { key: "conversionStartDate", label: "Conversion Start", fmt: (r) => fmtDate(r.conversionStartDate) },
    { key: "fullyOrganicDate", label: "Fully Organic Date", fmt: (r) => fmtDate(r.fullyOrganicDate) },
    { key: "preConversionLandUse", label: "Pre-Conversion Land Use" },
    { key: "syntheticHistory", label: "Synthetic History" },
    { key: "notes", label: "Notes" }
  ];
  const convStatusChart = Object.entries(
    records.reduce((acc, r) => {
      const s = String(r.status ?? "unknown").replace(/-/g, " ");
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Organic conversion register for each vineyard block — certifying body, conversion dates, and pre-conversion land-use history." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-conversion", children: "In Conversion" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "certified-organic", children: "Certified Organic" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportCSV(statusFiltered, "block-conversion.csv", convCsvCols), disabled: !statusFiltered.length, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Block"
        ] })
      ] })
    ] }),
    convStatusChart.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Blocks by Conversion Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: convStatusChart, margin: { top: 4, right: 12, bottom: 24, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "status", tick: { fontSize: 9 }, angle: -20, textAnchor: "end" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, width: 28, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", name: "Blocks", fill: "#10b981", radius: [2, 2, 0, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "UK Organic Regs 2020:" }),
      " A 3-year conversion period applies to vineyard blocks. Records must be retained for at least 5 years. Certifying bodies include Soil Association and OF&G."
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : statusFiltered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-gray-500", children: records.length === 0 ? "No block conversion records yet. Add your first block above." : "No records match the selected status." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: statusFiltered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: r.blockName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BlockStatusChip, { status: r.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Certifying Body:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(r.certifyingBody) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Conversion Start:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(r.conversionStartDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Fully Organic:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(r.fullyOrganicDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Pre-conversion Use:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(r.preConversionLandUse) })
          ] })
        ] }),
        r.syntheticHistory && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Synthetic History:" }),
          " ",
          r.syntheticHistory
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: r.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleting(r), className: "text-red-500 hover:text-red-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }) }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdd || !!editing, onOpenChange: () => {
      setShowAdd(false);
      setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Block Conversion Record" : "Add Block Conversion Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.blockName ?? "", onChange: sf("blockName"), placeholder: "e.g. North Slope" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "in-conversion", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BLOCK_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.conversionStartDate ?? "", onChange: sf("conversionStartDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fully Organic Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.fullyOrganicDate ?? "", onChange: sf("fullyOrganicDate") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pre-conversion Land Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.preConversionLandUse ?? "", onValueChange: (v) => setForm((f) => ({ ...f, preConversionLandUse: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select land use…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: landUseTypes.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Synthetic Input History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.syntheticHistory ?? "", onChange: sf("syntheticHistory"), placeholder: "Note any synthetic pesticide/fertiliser history relevant to conversion", rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: sf("notes"), rows: 2 })
        ] })
      ] }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-block-conversion", recordId: editing.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAdd(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: !form.blockName || saveMutation.isPending, children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: () => setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Block Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Remove ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.blockName }),
          " from the conversion register? This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMutation.mutate(deleting.id), disabled: deleteMutation.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function InputLogTab({ farmId, blocks }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState(String((/* @__PURE__ */ new Date()).getFullYear()));
  const [productLookupId, setProductLookupId] = reactExports.useState("");
  const inputUnits = useLookupStrings("organic_input_units", ["kg/ha", "g/ha", "L/ha", "mL/ha", "kg", "g", "L", "mL", "t/ha", "Other"]);
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 12e4
  });
  const staffNames = (staffData?.staff ?? []).map((s) => s.name);
  const { data: productsData } = useQuery({
    queryKey: ["spray-products", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-products`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 12e4
  });
  const sprayProducts = productsData?.records ?? [];
  const handleProductLookup = (id) => {
    setProductLookupId(id);
    const p = sprayProducts.find((p2) => String(p2.id) === id);
    if (p) {
      setForm((f) => ({ ...f, productName: p.productName, inputType: p.category ?? f.inputType ?? "" }));
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ["org-vit-input-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-log`).then((r) => r.json())
  });
  const { data: certRegData } = useQuery({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then((r) => r.json()),
    staleTime: 3e5
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;
  const openAdd = () => {
    setProductLookupId("");
    setForm({ approvalStatus: "permitted", vintageYear: String((/* @__PURE__ */ new Date()).getFullYear()) });
    setShowAdd(true);
  };
  const openEdit = (r) => {
    setProductLookupId("");
    setForm({
      blockName: r.blockName ?? "",
      productName: r.productName ?? "",
      inputType: r.inputType ?? "",
      supplier: r.supplier ?? "",
      dateApplied: r.dateApplied ?? "",
      quantity: r.quantity ?? "",
      unit: r.unit ?? "",
      areaHa: r.areaHa ?? "",
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      approvalStatus: r.approvalStatus ?? "permitted",
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      appliedBy: r.appliedBy ?? "",
      notes: r.notes ?? ""
    });
    setEditing(r);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-viticulture/input-log/${editing.id}` : `/api/farms/${farmId}/organic-viticulture/input-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] });
      setShowAdd(false);
      setEditing(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-log/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] });
      setDeleting(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" })
  });
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const records = data?.records ?? [];
  const inputYears = Array.from(new Set(records.map((r) => String(r.vintageYear)).filter(Boolean))).sort().reverse();
  if (!inputYears.includes(String((/* @__PURE__ */ new Date()).getFullYear()))) inputYears.unshift(String((/* @__PURE__ */ new Date()).getFullYear()));
  const filteredInputs = yearFilter === "all" ? records : records.filter((r) => String(r.vintageYear) === yearFilter);
  const inputCsvCols = [
    { key: "dateApplied", label: "Date Applied", fmt: (r) => fmtDate(r.dateApplied) },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "productName", label: "Product" },
    { key: "inputType", label: "Type" },
    { key: "blockName", label: "Block" },
    { key: "quantity", label: "Quantity" },
    { key: "unit", label: "Unit" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "approvalStatus", label: "Approval Status" },
    { key: "certifierApprovalRef", label: "Certifier Ref" },
    { key: "appliedBy", label: "Applied By" },
    { key: "notes", label: "Notes" }
  ];
  const inputTypeChart = Object.entries(
    filteredInputs.reduce((acc, r) => {
      const t = String(r.inputType ?? "Unknown");
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Log all organic-approved inputs applied in the vineyard — copper, sulphur, plant preparations, fertilisers, and any inputs requiring certifier approval." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          "Set ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Approval Status" }),
          " to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Restricted" }),
          " for products needing certifier notification, or ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Derogation" }),
          " for products used under a formal derogation approval. For the full derogation case file (availability search, correspondence, decision), use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Input Derogations" }),
          " tab. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Do not record arable or general farm inputs here — use Organic Compliance → Input Register." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "shrink-0", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Add Input"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "Vintage:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
          inputYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "ml-auto", onClick: () => exportCSV(filteredInputs, "organic-inputs.csv", inputCsvCols), disabled: !filteredInputs.length, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
        "Export CSV"
      ] })
    ] }),
    inputTypeChart.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Applications by Input Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 140, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: inputTypeChart, margin: { top: 4, right: 12, bottom: 24, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "type", tick: { fontSize: 9 }, angle: -20, textAnchor: "end" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, width: 28, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", name: "Applications", fill: "#8b5cf6", radius: [2, 2, 0, 0] })
      ] }) })
    ] }),
    primaryCertifier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-4 w-4 text-green-600 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Registered certifier: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: primaryCertifier.certifier }),
        primaryCertifier.operatorNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " · Operator No: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: primaryCertifier.operatorNumber })
        ] }) : null
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : filteredInputs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-gray-500", children: records.length === 0 ? "No input records yet." : "No records match the selected vintage year." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Block" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Quantity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Approval" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Vintage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filteredInputs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.dateApplied) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.productName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.inputType) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.blockName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: r.quantity ? `${r.quantity} ${r.unit ?? ""}`.trim() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalChip, { status: r.approvalStatus }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmtNum(r.vintageYear) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500 hover:text-red-700", onClick: () => setDeleting(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdd || !!editing, onOpenChange: () => {
      setShowAdd(false);
      setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Input Record" : "Add Input Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Register Lookup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: productLookupId, onValueChange: handleProductLookup, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: sprayProducts.length ? "Select from product register to auto-fill…" : "No products in register — enter manually below" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: sprayProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
              p.productName,
              p.activeIngredient ? ` — ${p.activeIngredient}` : ""
            ] }, String(p.id))) })
          ] }),
          sprayProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Add products in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sprays & Inputs → Products" }),
            " to enable auto-fill."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.productName ?? "", onChange: sf("productName"), placeholder: "e.g. Bordeaux Mixture WP" }),
            productLookupId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "Auto-filled — edit if needed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inputType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, inputType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INPUT_TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] }),
            productLookupId && !!form.inputType && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "From product register" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Applied *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.dateApplied ?? "", onChange: sf("dateApplied") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vintage Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.vintageYear ?? "", onChange: sf("vintageYear"), placeholder: "e.g. 2025" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.blockName || "__whole__", onValueChange: (v) => setForm((f) => ({ ...f, blockName: v === "__whole__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Whole vineyard or select block…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__whole__", children: "— Whole vineyard —" }),
                blocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.blockName), children: String(b.blockName) }, String(b.id)))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.areaHa ?? "", onChange: sf("areaHa"), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.quantity ?? "", onChange: sf("quantity"), placeholder: "e.g. 3.0" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.unit ?? "", onValueChange: (v) => setForm((f) => ({ ...f, unit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select unit…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: inputUnits.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplier ?? "", onChange: sf("supplier") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.approvalStatus ?? "permitted", onValueChange: (v) => setForm((f) => ({ ...f, approvalStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: APPROVAL_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef ?? "", onChange: sf("certifierApprovalRef"), placeholder: "Reference if certifier pre-approval was required" }),
          primaryCertifier && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 mt-1", children: [
            "Your registered certifier: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: primaryCertifier.certifier }),
            primaryCertifier.operatorNumber ? ` (Op. No: ${primaryCertifier.operatorNumber})` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Applied By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.appliedBy ?? "", onChange: (v) => setForm((f) => ({ ...f, appliedBy: v })), staffNames, loading: staffLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: sf("notes"), rows: 2 })
        ] })
      ] }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-input-log", recordId: editing.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAdd(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: !form.productName || !form.inputType || !form.dateApplied || saveMutation.isPending, children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: () => setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Input Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Remove ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.productName }),
          "? This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMutation.mutate(deleting.id), disabled: deleteMutation.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function CopperRegisterTab({ farmId, blocks }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const copperProducts = useLookupStrings("organic_copper_products", ["Bordeaux Mixture WP", "Copper Hydroxide WP", "Copper Oxychloride WP", "Copper Sulfate (tribasic)", "Nordox 75 WG", "Trophy WG", "Other"]);
  const sprayMethods = useLookupStrings("vineyard_spray_application_methods", ["Knapsack Sprayer", "Tractor-mounted Boom Sprayer", "Air-blast / Vineyard Sprayer", "Lean-to / Facing Sprayer", "Drone Application", "Hand-held Lance", "Other"]);
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 12e4
  });
  const staffNames = (staffData?.staff ?? []).map((s) => s.name);
  const { data, isLoading } = useQuery({
    queryKey: ["org-vit-copper-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/copper-log`).then((r) => r.json())
  });
  const openAdd = () => {
    setForm({ quantityUnit: "kg/ha" });
    setShowAdd(true);
  };
  const openEdit = (r) => {
    setForm({
      blockName: r.blockName ?? "",
      applicationDate: r.applicationDate ?? "",
      productName: r.productName ?? "",
      copperContent: r.copperContent ?? "",
      quantityApplied: r.quantityApplied ?? "",
      quantityUnit: r.quantityUnit ?? "kg/ha",
      areaHa: r.areaHa ?? "",
      copperKgApplied: r.copperKgApplied ?? "",
      applicationMethod: r.applicationMethod ?? "",
      operatorName: r.operatorName ?? "",
      notes: r.notes ?? ""
    });
    setEditing(r);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-viticulture/copper-log/${editing.id}` : `/api/farms/${farmId}/organic-viticulture/copper-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] });
      setShowAdd(false);
      setEditing(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/copper-log/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] });
      setDeleting(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" })
  });
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const records = data?.records ?? [];
  const copperYears = Array.from(new Set(records.map((r) => r.applicationDate ? String(r.applicationDate).slice(0, 4) : null).filter((x) => Boolean(x)))).sort().reverse();
  if (!copperYears.includes(String((/* @__PURE__ */ new Date()).getFullYear()))) copperYears.unshift(String((/* @__PURE__ */ new Date()).getFullYear()));
  const filteredCopper = yearFilter === "all" ? records : records.filter((r) => r.applicationDate && String(r.applicationDate).slice(0, 4) === yearFilter);
  const copperCsvCols = [
    { key: "applicationDate", label: "Date Applied", fmt: (r) => fmtDate(r.applicationDate) },
    { key: "blockName", label: "Block" },
    { key: "productName", label: "Product" },
    { key: "copperContent", label: "Copper Content (%)" },
    { key: "quantityApplied", label: "Quantity Applied" },
    { key: "quantityUnit", label: "Unit" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "copperKgApplied", label: "Cu Applied (kg)" },
    { key: "applicationMethod", label: "Method" },
    { key: "operatorName", label: "Operator" },
    { key: "notes", label: "Notes" }
  ];
  const totalCopperKg = reactExports.useMemo(() => {
    return records.reduce((sum, r) => {
      const v = parseFloat(r.copperKgApplied ?? "0");
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  }, [records]);
  const LIMIT_7YR = 28;
  const limitPct = Math.min(totalCopperKg / LIMIT_7YR * 100, 100);
  const limitColour = limitPct >= 90 ? "bg-red-500" : limitPct >= 70 ? "bg-amber-500" : "bg-green-500";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Running register of all copper-based fungicide applications. UK Organic Regs 2020 cap copper at 28 kg/ha over any 7-year period (equivalent to 4 kg/ha/year average)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            copperYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportCSV(filteredCopper, "copper-register.csv", copperCsvCols), disabled: !filteredCopper.length, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Application"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Recorded copper applied (all records)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-sm font-bold ${limitPct >= 90 ? "text-red-600" : limitPct >= 70 ? "text-amber-600" : "text-green-700"}`, children: [
          totalCopperKg.toFixed(2),
          " kg/ha of 28 kg/ha limit"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 rounded-full transition-all ${limitColour}`, style: { width: `${limitPct}%` } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "This total covers all records in your register. Filter by block and 7-year rolling window in your certifier audit report." })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : filteredCopper.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-gray-500", children: records.length === 0 ? "No copper applications recorded yet." : "No records match the selected year." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Block" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Cu Applied (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-600", children: "Operator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-gray-100", children: filteredCopper.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 whitespace-nowrap", children: fmtDate(r.applicationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.productName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.blockName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.areaHa) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: fmt(r.copperKgApplied) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.applicationMethod) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-600", children: fmt(r.operatorName) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500 hover:text-red-700", onClick: () => setDeleting(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdd || !!editing, onOpenChange: () => {
      setShowAdd(false);
      setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Copper Application" : "Add Copper Application" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate ?? "", onChange: sf("applicationDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productName ?? "", onValueChange: (v) => setForm((f) => ({ ...f, productName: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select copper product…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: copperProducts.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.blockName || "__whole__", onValueChange: (v) => setForm((f) => ({ ...f, blockName: v === "__whole__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Whole vineyard or select block…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__whole__", children: "— Whole vineyard —" }),
                blocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.blockName), children: String(b.blockName) }, String(b.id)))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Applied (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.areaHa ?? "", onChange: sf("areaHa"), placeholder: "0.00" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Copper Content (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.copperContent ?? "", onChange: sf("copperContent"), placeholder: "e.g. 20" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Applied" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.quantityApplied ?? "", onChange: sf("quantityApplied"), placeholder: "Amount applied" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.quantityUnit ?? "kg/ha", onValueChange: (v) => setForm((f) => ({ ...f, quantityUnit: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: COPPER_UNIT_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Copper kg Applied *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.copperKgApplied ?? "", onChange: sf("copperKgApplied"), placeholder: "Actual kg Cu applied" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.applicationMethod ?? "", onValueChange: (v) => setForm((f) => ({ ...f, applicationMethod: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: sprayMethods.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.operatorName ?? "", onChange: (v) => setForm((f) => ({ ...f, operatorName: v })), staffNames, loading: staffLoading })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: sf("notes"), rows: 2 })
        ] })
      ] }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-copper-log", recordId: editing.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAdd(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: !form.applicationDate || !form.productName || !form.copperKgApplied || saveMutation.isPending, children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: () => setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Copper Application" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Remove ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.productName }),
          " on ",
          fmtDate(deleting?.applicationDate),
          "? This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMutation.mutate(deleting.id), disabled: deleteMutation.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function RecordDecisionDialog({ farmId, derogCase, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = reactExports.useState("approved");
  const [decisionDate, setDecisionDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [certifierRef, setCertifierRef] = reactExports.useState(derogCase.certifierRef ?? "");
  const [approvalConditions, setApprovalConditions] = reactExports.useState(derogCase.approvalConditions ?? "");
  const [expiryDate, setExpiryDate] = reactExports.useState(derogCase.expiryDate ?? "");
  const [rejectionReason, setRejectionReason] = reactExports.useState(derogCase.rejectionReason ?? "");
  const [rejectionRef, setRejectionRef] = reactExports.useState(derogCase.rejectionRef ?? "");
  const mut = useMutation({
    mutationFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${derogCase.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, decisionDate: decisionDate || null, certifierRef: certifierRef || null, approvalConditions: approvalConditions || null, expiryDate: expiryDate || null, rejectionReason: rejectionReason || null, rejectionRef: rejectionRef || null })
    }).then((r) => {
      if (!r.ok) throw new Error("Failed");
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] });
      toast({ title: "Decision recorded" });
      onClose();
    },
    onError: () => toast({ title: "Error saving decision", variant: "destructive" })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-amber-600" }),
        " Record Certifier Decision"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        derogCase.inputName,
        " — decision from ",
        derogCase.certifier ?? "certifying body"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: setStatus, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "refused", children: "Refused" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn (by applicant)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expired", children: "Expired — no decision received" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: decisionDate, onChange: (e) => setDecisionDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference No." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: certifierRef, onChange: (e) => setCertifierRef(e.target.value), placeholder: "Reference from certifying body" })
      ] }),
      status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", value: approvalConditions, onChange: (e) => setApprovalConditions(e.target.value), rows: 2, placeholder: "Any conditions attached to the approval…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: expiryDate, onChange: (e) => setExpiryDate(e.target.value) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => mut.mutate(), disabled: mut.isPending || !decisionDate, children: mut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }),
        " Saving…"
      ] }) : "Record Decision" })
    ] })
  ] }) });
}
function InputDerogationsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const [regulatoryOther, setRegulatoryOther] = reactExports.useState(false);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const [recordDecisionFor, setRecordDecisionFor] = reactExports.useState(null);
  const certifyingBodies = useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const { data: certRegData } = useQuery({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then((r) => r.json()),
    staleTime: 3e5
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;
  const [showAddCorr, setShowAddCorr] = reactExports.useState(false);
  const [editingCorr, setEditingCorr] = reactExports.useState(null);
  const [deletingCorr, setDeletingCorr] = reactExports.useState(null);
  const [corrForm, setCorrForm] = reactExports.useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["org-vit-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations`).then((r) => r.json())
  });
  const { data: corrData } = useQuery({
    queryKey: ["org-vit-derog-corr", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`).then((r) => r.json()),
    enabled: expandedId !== null
  });
  const openAdd = () => {
    setForm({ status: "pending", vintageYear: String((/* @__PURE__ */ new Date()).getFullYear()), internalDecisionDate: "", rejectionReason: "", rejectionRef: "", correctiveAction: "", certifier: primaryCertifier?.certifier ?? "" });
    setRegulatoryOther(false);
    setShowAdd(true);
  };
  const openEdit = (c) => {
    setForm({
      inputName: c.inputName ?? "",
      inputType: c.inputType ?? "",
      regulatoryBasis: c.regulatoryBasis ?? "",
      certifier: c.certifier ?? "",
      certifierRef: c.certifierRef ?? "",
      availabilitySearchDate: c.availabilitySearchDate ?? "",
      availabilitySearchRef: c.availabilitySearchRef ?? "",
      applicationDate: c.applicationDate ?? "",
      decisionDate: c.decisionDate ?? "",
      status: c.status ?? "pending",
      approvalConditions: c.approvalConditions ?? "",
      expiryDate: c.expiryDate ?? "",
      vintageYear: c.vintageYear ? String(c.vintageYear) : "",
      justification: c.justification ?? "",
      internalDecisionDate: c.internalDecisionDate ?? "",
      rejectionReason: c.rejectionReason ?? "",
      rejectionRef: c.rejectionRef ?? "",
      correctiveAction: c.correctiveAction ?? "",
      notes: c.notes ?? ""
    });
    setRegulatoryOther(!!c.regulatoryBasis && !["UK Organic Regs 2020, Sch. 1 Part A", "UK Organic Regs 2020, Sch. 1 Part B", "UK Organic Regs 2020, Annex II", "Certifier derogation guidance"].includes(c.regulatoryBasis ?? ""));
    setEditing(c);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-viticulture/input-derogations/${editing.id}` : `/api/farms/${farmId}/organic-viticulture/input-derogations`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] });
      setShowAdd(false);
      setEditing(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] });
      setDeleting(null);
      if (expandedId === deleting?.id) setExpandedId(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" })
  });
  const saveCorr = useMutation({
    mutationFn: async () => {
      if (!expandedId) return;
      const url = editingCorr ? `/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${editingCorr.id}` : `/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`;
      const method = editingCorr ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corrForm) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] });
      setShowAddCorr(false);
      setEditingCorr(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving correspondence", variant: "destructive" })
  });
  const deleteCorr = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] });
      setDeletingCorr(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting correspondence", variant: "destructive" })
  });
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const csf = (k) => (e) => setCorrForm((f) => ({ ...f, [k]: e.target.value }));
  const openAddCorr = () => {
    setCorrForm({ direction: "outbound", correspondenceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    setShowAddCorr(true);
  };
  const openEditCorr = (c) => {
    setCorrForm({ correspondenceDate: c.correspondenceDate, direction: c.direction, correspondenceType: c.correspondenceType, summary: c.summary, reference: c.reference ?? "", notes: c.notes ?? "" });
    setEditingCorr(c);
  };
  const cases = data?.cases ?? [];
  const corrItems = corrData?.items ?? [];
  const derogYears = Array.from(new Set(cases.map((c) => c.vintageYear ? String(c.vintageYear) : null).filter((x) => Boolean(x)))).sort().reverse();
  if (!derogYears.includes(String((/* @__PURE__ */ new Date()).getFullYear()))) derogYears.unshift(String((/* @__PURE__ */ new Date()).getFullYear()));
  const filteredCases = yearFilter === "all" ? cases : cases.filter((c) => String(c.vintageYear) === yearFilter);
  const derogCsvCols = [
    { key: "inputName", label: "Input Name" },
    { key: "inputType", label: "Type" },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "certifier", label: "Certifier" },
    { key: "certifierRef", label: "Certifier Ref" },
    { key: "status", label: "Status" },
    { key: "applicationDate", label: "Application Date", fmt: (r) => fmtDate(r.applicationDate) },
    { key: "decisionDate", label: "Decision Date", fmt: (r) => fmtDate(r.decisionDate) },
    { key: "expiryDate", label: "Expiry Date", fmt: (r) => fmtDate(r.expiryDate) },
    { key: "regulatoryBasis", label: "Regulatory Basis" },
    { key: "approvalConditions", label: "Approval Conditions" },
    { key: "justification", label: "Justification" },
    { key: "notes", label: "Notes" }
  ];
  function expiryBadge(expiry) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = /* @__PURE__ */ new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 864e5);
    if (daysLeft < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium", children: "Expired" });
    if (daysLeft <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium", children: [
      "Expires in ",
      daysLeft,
      "d"
    ] });
    if (daysLeft <= 90) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium", children: [
      "Expires in ",
      daysLeft,
      "d"
    ] });
    return null;
  }
  const derogStatusChart = Object.entries(
    cases.reduce((acc, c) => {
      const s = String(c.status ?? "unknown");
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Manage UK Organic Regs 2020 Sch. 1 / Annex II input derogation cases — availability searches, certifier correspondence, and decisions." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            derogYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportCSV(filteredCases, "input-derogations.csv", derogCsvCols), disabled: !filteredCases.length, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "New Case"
        ] })
      ] })
    ] }),
    derogStatusChart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Derogation Cases by Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(100, derogStatusChart.length * 32), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: derogStatusChart, layout: "vertical", margin: { top: 4, right: 16, bottom: 4, left: 64 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "status", tick: { fontSize: 9 }, width: 64 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", name: "Cases", fill: "#f59e0b", radius: [0, 2, 2, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Derogation requirement:" }),
        " Where an approved organic input is not available in sufficient quantity, farmers may apply to their certifying body for a time-limited derogation to use a non-organic equivalent. An availability search must be completed and documented before application."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-800 text-xs border-t border-amber-200 pt-1.5", children: [
        "This tab is for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "vineyard input derogation cases only" }),
        ". For livestock and dairy feed ingredient derogations (e.g. non-organic protein sources), use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Livestock → Feed Derogations" }),
        ". For restricted products that don't require a formal case, log them directly in the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Organic Inputs" }),
        " tab with status set to Restricted."
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : filteredCases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-gray-500", children: cases.length === 0 ? "No derogation cases yet." : "No cases match the selected vintage year." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredCases.map((c) => {
      const isOpen = expandedId === c.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: c.inputName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded", children: c.inputType }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DerogationStatusChip, { status: c.status }),
              expiryBadge(c.expiryDate)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Certifier:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(c.certifier) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Cert. Ref:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(c.certifierRef) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Applied:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(c.applicationDate) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Decision:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(c.decisionDate) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Expiry:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(c.expiryDate) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Vintage:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtNum(c.vintageYear) })
              ] })
            ] }),
            c.regulatoryBasis && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Regulatory basis:" }),
              " ",
              c.regulatoryBasis
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0 items-center", children: [
            (c.status === "pending" || !c.status) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1", onClick: (e) => {
              e.stopPropagation();
              setRecordDecisionFor(c);
            }, children: [
              "Record Decision ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
            ] }),
            c.status === "refused" && !c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-300", children: "Action Required" }),
            c.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task", onClick: (e) => {
              e.stopPropagation();
              setRaiseTaskFor({ title: `Organic Viticulture Derogation Expiring — ${c.inputName}`, description: `The derogation approval for '${c.inputName}' is due to expire. Renew or confirm with your certifying body.`, dueDate: c.expiryDate ?? void 0 });
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-amber-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500 hover:text-red-700", onClick: () => setDeleting(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setExpandedId(isOpen ? null : c.id), children: isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) })
          ] })
        ] }) }),
        isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t bg-gray-50 p-4 space-y-4", children: [
          c.availabilitySearchRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: "Availability Search Ref:" }),
            " ",
            c.availabilitySearchRef,
            " ",
            c.availabilitySearchDate ? `(${fmtDate(c.availabilitySearchDate)})` : ""
          ] }),
          c.justification && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: "Justification:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: c.justification })
          ] }),
          c.approvalConditions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: "Approval Conditions:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: c.approvalConditions })
          ] }),
          c.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Rejection reason: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700", children: c.rejectionReason }),
            c.rejectionRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-gray-500", children: [
              "(Ref: ",
              c.rejectionRef,
              ")"
            ] })
          ] }),
          c.status === "refused" && !c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-orange-300 bg-orange-50 p-2 text-xs text-orange-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Action Required:" }),
            " Record a corrective action in response to this refusal."
          ] }),
          c.correctiveAction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Corrective action: " }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: c.correctiveAction })
          ] }),
          c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: c.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700", children: "Correspondence Log" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: openAddCorr, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
                "Add"
              ] })
            ] }),
            corrItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic", children: "No correspondence recorded." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: corrItems.map((ci) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded p-3 flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800", children: fmtDate(ci.correspondenceDate) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700", children: ci.direction }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: ci.correspondenceType })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: ci.summary }),
                ci.reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
                  "Ref: ",
                  ci.reference
                ] }),
                ci.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: ci.notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEditCorr(ci), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500 hover:text-red-700", onClick: () => setDeletingCorr(ci), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }, ci.id)) })
          ] })
        ] })
      ] }, c.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdd || !!editing, onOpenChange: () => {
      setShowAdd(false);
      setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Derogation Case" : "New Derogation Case" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.inputName ?? "", onChange: sf("inputName"), placeholder: "e.g. Copper Hydroxide WP" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Input Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.inputType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, inputType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INPUT_TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Regulatory Basis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: regulatoryOther ? "Other" : form.regulatoryBasis ?? "",
              onValueChange: (v) => {
                if (v === "Other") {
                  setRegulatoryOther(true);
                  setForm((f) => ({ ...f, regulatoryBasis: "" }));
                } else {
                  setRegulatoryOther(false);
                  setForm((f) => ({ ...f, regulatoryBasis: v }));
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select regulatory basis…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["UK Organic Regs 2020, Sch. 1 Part A", "UK Organic Regs 2020, Sch. 1 Part B", "UK Organic Regs 2020, Annex II", "Certifier derogation guidance", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ]
            }
          ),
          regulatoryOther && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", placeholder: "Describe regulatory basis…", value: form.regulatoryBasis ?? "", onChange: (e) => setForm((f) => ({ ...f, regulatoryBasis: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifier ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certifier: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifying body…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: certifyingBodies.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierRef ?? "", onChange: sf("certifierRef") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.availabilitySearchDate ?? "", onChange: sf("availabilitySearchDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Availability Search Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.availabilitySearchRef ?? "", onChange: sf("availabilitySearchRef") })
          ] })
        ] }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate ?? "", onChange: sf("applicationDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Decision Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.decisionDate ?? "", onChange: sf("decisionDate") })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.applicationDate ?? "", onChange: sf("applicationDate") })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "pending", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEROGATION_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate ?? "", onChange: sf("expiryDate") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vintage Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.vintageYear ?? "", onChange: sf("vintageYear"), placeholder: "e.g. 2025" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Justification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.justification ?? "", onChange: sf("justification"), placeholder: "Why the organic alternative was unavailable", rows: 3 })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Approval Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.approvalConditions ?? "", onChange: sf("approvalConditions"), rows: 2 })
        ] }),
        editing && form.status === "refused" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.rejectionReason ?? "", onChange: sf("rejectionReason"), rows: 2, placeholder: "Certifier's stated reason for refusing the derogation" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.rejectionRef ?? "", onChange: sf("rejectionRef"), placeholder: "Certifier ref for rejection notice" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action Taken" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.correctiveAction ?? "", onChange: sf("correctiveAction"), rows: 2, placeholder: "What the farm did in response to the refusal" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: sf("notes"), rows: 2 })
        ] })
      ] }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-input-derogation", recordId: editing.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAdd(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: !form.inputName || !form.inputType || saveMutation.isPending, children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAddCorr || !!editingCorr, onOpenChange: () => {
      setShowAddCorr(false);
      setEditingCorr(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingCorr ? "Edit Correspondence" : "Add Correspondence" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: corrForm.correspondenceDate ?? "", onChange: csf("correspondenceDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: corrForm.direction ?? "outbound", onValueChange: (v) => setCorrForm((f) => ({ ...f, direction: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DIRECTION_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: corrForm.correspondenceType ?? "", onValueChange: (v) => setCorrForm((f) => ({ ...f, correspondenceType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CORRESPONDENCE_TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Summary *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: corrForm.summary ?? "", onChange: csf("summary"), rows: 2, placeholder: "Brief summary of the correspondence" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: corrForm.reference ?? "", onChange: csf("reference"), placeholder: "Letter/email reference" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: corrForm.notes ?? "", onChange: csf("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAddCorr(false);
          setEditingCorr(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveCorr.mutate(), disabled: !corrForm.correspondenceDate || !corrForm.correspondenceType || !corrForm.summary || saveCorr.isPending, children: [
          saveCorr.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: () => setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Derogation Case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Remove the derogation case for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.inputName }),
          "? All correspondence will also be deleted. This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMutation.mutate(deleting.id), disabled: deleteMutation.isPending, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deletingCorr, onOpenChange: () => setDeletingCorr(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Correspondence" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Remove this correspondence entry? This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletingCorr(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteCorr.mutate(deletingCorr.id), disabled: deleteCorr.isPending, children: "Delete" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        defaultTitle: raiseTaskFor.title,
        defaultDescription: raiseTaskFor.description,
        defaultDueDate: raiseTaskFor.dueDate,
        taskType: "compliance_fix",
        module: "Organic Viticulture",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    ),
    recordDecisionFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RecordDecisionDialog,
      {
        farmId,
        derogCase: recordDecisionFor,
        onClose: () => setRecordDecisionFor(null)
      }
    )
  ] });
}
function CertificatesTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const certifyingBodies = useLookupStrings("organic_certifying_bodies", ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDAA)", "Quality Welsh Food Certification (QWFC)", "Other"]);
  const { data: certRegData } = useQuery({
    queryKey: ["org-certification", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-certification`).then((r) => r.json()),
    staleTime: 3e5
  });
  const primaryCertifier = certRegData?.records?.[0] ?? null;
  const { data, isLoading } = useQuery({
    queryKey: ["org-vit-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/certificates`).then((r) => r.json())
  });
  const openAdd = () => {
    setForm({ status: "active", certifyingBody: primaryCertifier?.certifier ?? "" });
    setShowAdd(true);
  };
  const openEdit = (r) => {
    setForm({
      certifyingBody: r.certifyingBody ?? "",
      certificateNumber: r.certificateNumber ?? "",
      certificateType: r.certificateType ?? "",
      issueDate: r.issueDate ?? "",
      expiryDate: r.expiryDate ?? "",
      scope: r.scope ?? "",
      status: r.status ?? "active",
      notes: r.notes ?? ""
    });
    setEditing(r);
  };
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing ? `/api/farms/${farmId}/organic-viticulture/certificates/${editing.id}` : `/api/farms/${farmId}/organic-viticulture/certificates`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] });
      setShowAdd(false);
      setEditing(null);
      toast({ title: "Saved" });
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" })
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/farms/${farmId}/organic-viticulture/certificates/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] });
      setDeleting(null);
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" })
  });
  const sf = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const records = data?.records ?? [];
  function expiryBadge(expiry) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = /* @__PURE__ */ new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 864e5);
    if (daysLeft < 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium", children: "Expired" });
    if (daysLeft <= 30) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium", children: [
      "Expires in ",
      daysLeft,
      "d"
    ] });
    if (daysLeft <= 90) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium", children: [
      "Expires in ",
      daysLeft,
      "d"
    ] });
    return null;
  }
  const certCsvCols = [
    { key: "certifyingBody", label: "Certifying Body" },
    { key: "certificateNumber", label: "Certificate Number" },
    { key: "certificateType", label: "Type" },
    { key: "status", label: "Status" },
    { key: "issueDate", label: "Issue Date", fmt: (r) => fmtDate(r.issueDate) },
    { key: "expiryDate", label: "Expiry Date", fmt: (r) => fmtDate(r.expiryDate) },
    { key: "scope", label: "Scope" },
    { key: "notes", label: "Notes" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Store organic viticulture and wine certificates issued by your certifying body." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => exportCSV(records, "certificates.csv", certCsvCols), disabled: !records.length, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4 mr-1" }),
          "Export CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Certificate"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-gray-400" }) }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-8 text-center text-gray-500", children: "No certificates stored yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: r.certifyingBody }),
          r.certificateType && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded", children: r.certificateType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CertStatusChip, { status: r.status }),
          expiryBadge(r.expiryDate)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Certificate No:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmt(r.certificateNumber) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Issued:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(r.issueDate) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Expires:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fmtDate(r.expiryDate) })
          ] })
        ] }),
        r.scope && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: "Scope:" }),
          " ",
          r.scope
        ] }),
        r.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: r.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
        r.expiryDate && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Raise task", onClick: () => setRaiseTaskFor({ title: `Organic Viticulture Certificate Expiring — ${r.certificateType || r.certifyingBody}`, description: `The organic viticulture certificate${r.certifyingBody ? ` from ${r.certifyingBody}` : ""}${r.certificateType ? ` (${r.certificateType})` : ""} is due to expire. Arrange renewal with your certifying body.`, dueDate: r.expiryDate ?? void 0 }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-4 w-4 text-amber-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "text-red-500 hover:text-red-700", onClick: () => setDeleting(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }) }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAdd || !!editing, onOpenChange: () => {
      setShowAdd(false);
      setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Certificate" : "Add Certificate" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying Body *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifyingBody ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certifyingBody: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifying body…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: certifyingBodies.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificateNumber ?? "", onChange: sf("certificateNumber") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certificateType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, certificateType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issue Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.issueDate ?? "", onChange: sf("issueDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.expiryDate ?? "", onChange: sf("expiryDate") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CERT_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.scope ?? "", onChange: sf("scope"), rows: 2, placeholder: "What does this certificate cover?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: sf("notes"), rows: 2 })
        ] })
      ] }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-certificate", recordId: editing.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setShowAdd(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => saveMutation.mutate(), disabled: !form.certifyingBody || saveMutation.isPending, children: [
          saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleting, onOpenChange: () => setDeleting(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Certificate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Remove the certificate from ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleting?.certifyingBody }),
          "? This cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleting(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteMutation.mutate(deleting.id), disabled: deleteMutation.isPending, children: "Delete" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        defaultTitle: raiseTaskFor.title,
        defaultDescription: raiseTaskFor.description,
        defaultDueDate: raiseTaskFor.dueDate,
        taskType: "compliance_fix",
        module: "Organic Viticulture",
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null)
      }
    )
  ] });
}
function OrganicViticulturePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState("block-conversion");
  const { data: vineyardBlocks = [] } = useQuery({
    queryKey: ["vineyard-blocks", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}/vineyard-blocks`, { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64 text-gray-500", children: "No farm selected." }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grape, { className: "h-5 w-5 text-purple-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Organic Viticulture" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "Full organic compliance for your vineyard — block conversion register, approved inputs log, copper register, input derogation cases, organic wine production additives, and certificate storage. UK Organic Regulations 2020 and UK-retained EU Reg 203/2012." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabBar, { children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === t.id, onClick: () => setTab(t.id), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "w-3.5 h-3.5 mr-1" }),
      t.label
    ] }, t.id)) }),
    tab.startsWith("winery-") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BatchTrailQuickSearch, { farmId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
      tab === "block-conversion" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlockConversionTab, { farmId }),
      tab === "input-log" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputLogTab, { farmId, blocks: vineyardBlocks }),
      tab === "copper-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(CopperRegisterTab, { farmId, blocks: vineyardBlocks }),
      tab === "input-derogations" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputDerogationsTab, { farmId }),
      tab === "wine-production" && /* @__PURE__ */ jsxRuntimeExports.jsx(WineProductionTab, { farmId }),
      tab === "winery-stock" && /* @__PURE__ */ jsxRuntimeExports.jsx(WineryStockTab, { farmId }),
      tab === "winery-reception" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestReceptionTab, { farmId, blocks: vineyardBlocks }),
      tab === "winery-pressing" && /* @__PURE__ */ jsxRuntimeExports.jsx(PressingRecordsTab, { farmId }),
      tab === "winery-fermentation" && /* @__PURE__ */ jsxRuntimeExports.jsx(FermentationRecordsTab, { farmId }),
      tab === "winery-vessels" && /* @__PURE__ */ jsxRuntimeExports.jsx(VesselRegisterTab, { farmId }),
      tab === "winery-cellar-ops" && /* @__PURE__ */ jsxRuntimeExports.jsx(CellarOpsTab, { farmId }),
      tab === "winery-bottling" && /* @__PURE__ */ jsxRuntimeExports.jsx(BottlingRecordsTab, { farmId }),
      tab === "winery-so2" && /* @__PURE__ */ jsxRuntimeExports.jsx(So2TestingTab, { farmId }),
      tab === "winery-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(EquipmentRegisterTab, { farmId }),
      tab === "certificates" && /* @__PURE__ */ jsxRuntimeExports.jsx(CertificatesTab, { farmId }),
      tab === "vit-overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { farmId }),
      tab === "vine-register" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineRegisterTab, { farmId, blocks: vineyardBlocks }),
      tab === "blocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlocksTab, { farmId }),
      tab === "block-map" && /* @__PURE__ */ jsxRuntimeExports.jsx(VineyardBlockMapTab, { farmId, blocks: vineyardBlocks }),
      tab === "phenology" && /* @__PURE__ */ jsxRuntimeExports.jsx(PhenologyTab, { farmId, blocks: vineyardBlocks }),
      tab === "operations" && /* @__PURE__ */ jsxRuntimeExports.jsx(OperationsTab, { farmId, blocks: vineyardBlocks }),
      tab === "vit-harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId, blocks: vineyardBlocks }),
      tab === "scouting" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScoutingTab, { farmId, blocks: vineyardBlocks }),
      tab === "gi-compliance" && /* @__PURE__ */ jsxRuntimeExports.jsx(GiComplianceTab, { farmId, blocks: vineyardBlocks }),
      tab === "licensing" && /* @__PURE__ */ jsxRuntimeExports.jsx(LicensingTab, { farmId }),
      tab === "excise" && /* @__PURE__ */ jsxRuntimeExports.jsx(ExciseDutyTab, { farmId }),
      tab === "tours" && /* @__PURE__ */ jsxRuntimeExports.jsx(TastingsToursTab, { farmId }),
      tab === "age-check" && /* @__PURE__ */ jsxRuntimeExports.jsx(AgeVerificationTab, { farmId }),
      tab === "spray-diary" && /* @__PURE__ */ jsxRuntimeExports.jsx(SprayDiaryTab, { farmId, blocks: vineyardBlocks }),
      tab === "soil-analysis" && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilAnalysisTab, { farmId, blocks: vineyardBlocks }),
      tab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsx(ViticulturalAnalyticsTab, { farmId }),
      tab === "vintage-report" && /* @__PURE__ */ jsxRuntimeExports.jsx(VintageSeasonReportTab, { farmId }),
      tab === "enterprise-report" && /* @__PURE__ */ jsxRuntimeExports.jsx(ViticulturalEnterpriseReport, { farmId })
    ] })
  ] }) });
}
export {
  OrganicViticulturePage as default
};
