import { b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, O as useMutation, d as Button, S as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, L as Label, I as Input, C as Checkbox, X as DialogMutationError, H as DialogDescription, n as Card, o as CardContent } from "./index-KLu_TQ10.js";
import { u as usePersistedTab } from "./use-persisted-tab-BxLbzbGa.js";
import { A as AppLayout } from "./AppLayout-D21DRPY6.js";
import { T as TabBar, a as TabButton } from "./tab-button-Dfm3OYIe.js";
import { T as Textarea } from "./textarea-BLGqUfjc.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-ouVdH1Sb.js";
import { B as Badge } from "./badge-gWTwiHfY.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-G09Zxuak.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-iwxBqjl9.js";
import { SheepLambingTab, BcsTab, BulkTankTab, MvTab, AssuranceTab } from "./SheepDairyPage-CyqJIuT9.js";
import { A as AbrKitStockSection, S as SccEquipmentSection, D as DairySuppliesTab } from "./DairyPage-6o9xvQTA.js";
import { A as AbrProcurementSection, D as DairyEnterpriseReport } from "./DairyEnterpriseReport-CxoYyhpn.js";
import { R as RecordAttachments } from "./RecordAttachments-D3IJO0Xu.js";
import { E as Eye } from "./eye-Ba6iQNNb.js";
import { P as Pencil } from "./pencil-CZakssM9.js";
import { T as Trash2 } from "./trash-2-XXnx0MUs.js";
import { T as TriangleAlert } from "./triangle-alert-BmJ4t-Ba.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-DgfxJk10.js";
import { C as ComposedChart } from "./ComposedChart-DTLU1KJU.js";
import { C as CartesianGrid } from "./CartesianGrid-BDSPGzv2.js";
import { L as Line } from "./Line-7ESucan9.js";
import { P as Printer } from "./printer-DzS7FeQP.js";
import { D as Droplets } from "./shield-alert-JQPVw0n8.js";
import "./use-safe-clerk-CODGOC5J.js";
import "./database-CQh2S7oj.js";
import "./shield-check-Bp6mI7p6.js";
import "./tractor-vfC8laG_.js";
import "./index-O-Wr7DrD.js";
import "./index-CWOEPewG.js";
import "./chevron-up-DSDa2Tey.js";
import "./index-BfUl1NiU.js";
import "./LineChart-Bv_0W9IE.js";
import "./circle-check-CBKmBVLs.js";
import "./BarChart-B5-GSUqm.js";
import "./PieChart-BGd9p4SG.js";
import "./use-upload-BqPtt175.js";
import "./paperclip-4hVCSt9C.js";
import "./upload-Dmj4cbkX.js";
import "./image-BimyuT_L.js";
import "./download-Onfvrgt5.js";
import "./DocAttach-DElo7d8q.js";
import "./api-Dhdsf4oM.js";
import "./RaiseTaskDialog-Bm-jQh6Y.js";
import "./index-D4MxM3GN.js";
import "./use-farm-members-WAP1XS2g.js";
import "./staff-select-5W-0ypY5.js";
import "./print-report-B_FwCCVJ.js";
import "./vmdMedicines-mq70NSvP.js";
import "./shopping-cart-DHHmrehl.js";
import "./circle-x-Dl75eWaa.js";
import "./file-down-CIc7y0rn.js";
import "./trending-down-cN4pc4ja.js";
import "./chevron-left-DJYadpfY.js";
import "./sparkles-S6digo48.js";
import "./chart-no-axes-column-DKfM6tPs.js";
import "./receipt-CtnBLTWr.js";
import "./thermometer-JOYZ3wII.js";
import "./chevrons-up-down-Cu3YAAdY.js";
import "./badge-check-B_pF5wXS.js";
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
function fmtRaw(v) {
  return v == null || v === "" ? "—" : String(v);
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function formatPence(p) {
  if (p == null) return "—";
  return `£${(p / 100).toFixed(2)}`;
}
function SheepSccBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const ok = v < 750;
  const warn = v >= 750 && v < 1500;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL ",
    v >= 1500 ? "⚠ Exceeds limit" : ""
  ] });
}
function conversionStatusBadge(status) {
  const map = {
    "in-conversion": "bg-yellow-100 text-yellow-800",
    certified: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: map[status] ?? "bg-gray-100 text-gray-700", children: status.replace(/-/g, " ") });
}
const CERTIFIERS = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association (BDOCA)", "Other"];
const FEED_TYPES = ["Concentrate", "Grass Silage", "Hay", "Haylage", "Grazed Grass", "Straw", "Root Crops / Beet", "Minerals & Supplements", "Other"];
const PRODUCT_CATEGORIES = ["Antibiotic", "NSAID", "Anthelmintic", "Antiparasitic", "Vaccine", "Homeopathic", "Other"];
const ROUTES_OF_ADMINISTRATION = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intravenous (IV)", "Oral", "Intramammary", "Topical", "Other"];
const ORGANIC_SHEEP_DAIRY_TAB_IDS = ["tupping", "conversion", "collections", "feed", "treatments", "mastitis", "kidding", "bcs", "tank", "mv", "assurance", "abr-kit", "scc-equipment", "enterprise", "supplies"];
function OrganicSheepDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "organic-sheep-dairy", farmId, validIds: ORGANIC_SHEEP_DAIRY_TAB_IDS, defaultTab: "tupping" });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Organic Sheep Dairy", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-50 text-green-700 border border-green-200 rounded-full", children: "🌿 Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Organic Sheep Dairy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Organic certification for dairy sheep — flock conversion register, organic milk collection log with non-organic reason tracking, feed & nutrition (≥95% organic DM target), and vet treatment register with doubled withdrawal periods (SA/OF&G/Biodynamic certified flocks)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tupping", onClick: () => setTab("tupping"), children: "Tupping" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "conversion", onClick: () => setTab("conversion"), children: "Flock Conversion" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "collections", onClick: () => setTab("collections"), children: "Milk Collections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "feed", onClick: () => setTab("feed"), children: "Feed & Nutrition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "treatments", onClick: () => setTab("treatments"), children: "Vet Treatments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "kidding", onClick: () => setTab("kidding"), children: "Lambing Records" }),
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
      tab === "tupping" && /* @__PURE__ */ jsxRuntimeExports.jsx(TuppingTab, { farmId }),
      tab === "conversion" && /* @__PURE__ */ jsxRuntimeExports.jsx(FlockConversionTab, { farmId }),
      tab === "collections" && /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicCollectionsTab, { farmId }),
      tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedNutritionTab, { farmId }),
      tab === "treatments" && /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentRegisterTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "kidding" && /* @__PURE__ */ jsxRuntimeExports.jsx(SheepLambingTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "mv" && /* @__PURE__ */ jsxRuntimeExports.jsx(MvTab, { farmId }),
      tab === "assurance" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssuranceTab, {}),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrKitStockSection, { farmId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId })
      ] }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "sheep" }),
      tab === "enterprise" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairyEnterpriseReport, { farmId, endpoint: api(`farms/${farmId}/sheep-dairy-enterprise-report`), queryPrefix: "organic-sheep-dairy-enterprise", speciesNote: "Milk income from organic sheep dairy collection records. Feed cost and other variable costs not yet included — add via Financial for a complete P&L." }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "organic-sheep" })
    ] })
  ] }) });
}
function FlockConversionTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-flock-conv", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-flock-conv", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Flock added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-sheep-dairy/flock-conversion/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-flock-conv", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ status: "in-conversion", parallelProduction: false, conversionStartDate: today() });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(r);
    setOpen(true);
  }
  const certifiedCount = records.filter((r) => r.status === "certified").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    certifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
      "🌿 ",
      certifiedCount,
      " flock",
      certifiedCount !== 1 ? "s" : "",
      " certified organic"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Add Flock"
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Flock Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Breed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ewes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Conv. Start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Exp. Milk Cert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No flock conversion records yet. Add your first flock to start tracking organic certification." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.flockName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.breed ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.numberOfEwes ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.conversionStartDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.expectedMilkCertDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: conversionStatusBadge(r.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.certifier ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Flock Conversion — ",
        viewRec.flockName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Flock Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.flockName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.breed) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Ewes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.numberOfEwes) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: conversionStatusBadge(viewRec.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Conversion Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.conversionStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.expectedMilkCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actual Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.actualMilkCertDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.certifier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certification Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.certificationRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Parallel Production" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.parallelProduction ? "Yes — flock also produces conventional milk" : "No" })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Flock Conversion" : "Add Flock Conversion Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track your flock's organic conversion status and certification details." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.flockName ?? "", onChange: f("flockName"), placeholder: "e.g. Home Flock — East Block" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.breed ?? "", onChange: f("breed"), placeholder: "e.g. East Friesian × Lacaune" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Ewes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfEwes ?? "", onChange: (e) => setForm((p) => ({ ...p, numberOfEwes: e.target.value ? Number(e.target.value) : null })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conversion Start Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.conversionStartDate ?? "").slice(0, 10), onChange: f("conversionStartDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expectedMilkCertDate ?? "").slice(0, 10), onChange: f("expectedMilkCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actual Milk Cert Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.actualMilkCertDate ?? "").slice(0, 10), onChange: f("actualMilkCertDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "in-conversion", onValueChange: (v) => setForm((p) => ({ ...p, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-conversion", children: "In Conversion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "certified", children: "Certified" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "withdrawn", children: "Withdrawn" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.certifier ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, certifier: v === "__none__" ? null : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certifier…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
              CERTIFIERS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certificationRef ?? "", onChange: f("certificationRef"), placeholder: "e.g. SA/2024/XXXXX" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.parallelProduction ?? false, onCheckedChange: (v) => setForm((p) => ({ ...p, parallelProduction: !!v })), id: "parallel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parallel", className: "cursor-pointer font-normal", children: "Parallel production — this flock also produces non-organic milk" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: !form.flockName || !form.conversionStartDate || save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function AbrBadge({ result }) {
  if (!result || result === "not-tested") return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" });
  const map = {
    negative: "bg-green-100 text-green-800",
    positive: "bg-red-100 text-red-800",
    borderline: "bg-amber-100 text-amber-800",
    invalid: "bg-gray-100 text-gray-600"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${map[result] ?? "bg-gray-100 text-gray-600"}`, children: result });
}
function LabResultsBadge({ status }) {
  if (!status) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 text-xs", children: "—" });
  const map = {
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-xs ${map[status] ?? "bg-gray-100 text-gray-600"}`, children: status });
}
function OrganicCollectionsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [formTab, setFormTab] = reactExports.useState("collection");
  const blank = { collectionDate: today(), isOrganicCollection: true };
  const [form, setForm] = reactExports.useState(blank);
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const [yearFilter, setYearFilter] = reactExports.useState("all");
  const [abrKitStockId, setAbrKitStockId] = reactExports.useState("");
  const abrStockQ = useQuery({
    queryKey: ["dairy-abr-stock", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/dairy/abr-test-kit-stock`)).then((r) => r.json())
  });
  const abrStock = abrStockQ.data?.stock ?? [];
  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const { data: membersData } = useQuery({
    queryKey: ["farm-members-sheep-dairy", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/members`)).then((r) => r.json()),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1e3
  });
  const staffNames = (membersData?.members ?? []).map((m) => `${m.firstName} ${m.lastName}`.trim()).filter(Boolean);
  const years = reactExports.useMemo(() => [...new Set(records.map((r) => r.collectionDate?.slice(0, 4)).filter(Boolean))].sort().reverse(), [records]);
  const filteredRecords = reactExports.useMemo(() => yearFilter === "all" ? records : records.filter((r) => r.collectionDate?.startsWith(yearFilter)), [records, yearFilter]);
  const organicCount = filteredRecords.filter((r) => r.isOrganicCollection).length;
  const totalVol = filteredRecords.reduce((s, r) => s + (parseFloat(r.volumeLitres || "0") || 0), 0);
  const sccReadings = filteredRecords.map((r) => r.sccCount).filter((v) => v != null);
  const avgScc = sccReadings.length ? Math.round(sccReadings.reduce((a, b) => a + b, 0) / sccReadings.length) : null;
  const abrPositive = filteredRecords.filter((r) => r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline").length;
  const save = useMutation({
    mutationFn: () => {
      if (!form.isOrganicCollection && !form.nonOrganicReason?.trim()) {
        throw new Error("Reason required for non-organic collection");
      }
      return fetch(api(`farms/${farmId}/organic-sheep-dairy/collections${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || void 0 })
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Collection added" });
    },
    onError: (e) => toast({ title: e.message || "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-sheep-dairy/collections/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-collections", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm(blank);
    setAbrKitStockId("");
    setFormTab("collection");
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(r);
    setAbrKitStockId("");
    setFormTab("collection");
    setOpen(true);
  }
  function doPrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Organic Sheep Milk Collections</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#f5f5f5}h2{font-size:14px}</style></head><body><h2>Organic Sheep Milk Collection Log${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Volume (L)</th><th>Collector</th><th>ABR</th><th>Temp (°C)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>Organic</th><th>Net Value</th></tr></thead><tbody>${filteredRecords.map((r) => `<tr><td>${r.collectionDate}</td><td>${parseFloat(r.volumeLitres || "0").toLocaleString()}</td><td>${r.collectorName || "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkTemperatureCelsius || "—"}</td><td>${r.sccCount || "—"}</td><td>${r.fatPercentage || "—"}</td><td>${r.proteinPercentage || "—"}</td><td>${r.isOrganicCollection ? "Organic" : "Non-organic"}</td><td>${r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    abrPositive > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          abrPositive,
          " collection",
          abrPositive !== 1 ? "s" : ""
        ] }),
        " with positive or borderline ABR result — investigate before selling milk."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Volume (filtered)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-800", children: [
          totalVol.toLocaleString("en-GB", { maximumFractionDigits: 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "L" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Organic Collections" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-700", children: [
          organicCount,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal ml-1", children: [
            "/ ",
            filteredRecords.length
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Avg SCC (k/mL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1500 ? "text-red-700" : avgScc > 750 ? "text-amber-700" : "text-green-700"}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Limit: 1,500k" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "ABR Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${abrPositive > 0 ? "text-red-700" : "text-gray-400"}`, children: abrPositive })
      ] }) })
    ] }),
    (() => {
      const monthMap = {};
      [...filteredRecords].sort((a, b) => String(a.collectionDate).localeCompare(String(b.collectionDate))).forEach((r) => {
        const key = String(r.collectionDate || "").slice(0, 7);
        if (key.length !== 7) return;
        const label = (/* @__PURE__ */ new Date(key + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
        if (!monthMap[key]) monthMap[key] = { label, volL: 0, scc: null };
        monthMap[key].volL += parseFloat(r.volumeLitres || "0") || 0;
        if (r.sccCount != null) monthMap[key].scc = r.sccCount;
      });
      const chartData = Object.keys(monthMap).sort().map((k) => monthMap[k]);
      if (chartData.length <= 1) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Volume & SCC Trend — Monthly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Organic sheep regulatory SCC limit: 1,500k cells/mL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ComposedChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "left", tick: { fontSize: 11 }, width: 55, tickFormatter: (v) => `${v}L` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "right", orientation: "right", tick: { fontSize: 11 }, width: 65, tickFormatter: (v) => `${v}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [name === "SCC (k/mL)" ? `${v}k` : `${Number(v).toFixed(0)}L`, name] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { yAxisId: "left", dataKey: "volL", name: "Volume (L)", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 40 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "scc", name: "SCC (k/mL)", stroke: "#ef4444", strokeWidth: 2, dot: { r: 3 }, connectNulls: true })
        ] }) }) })
      ] });
    })(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: doPrint, disabled: filteredRecords.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        "Add Collection"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Volume (L)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "SCC (k/mL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "ABR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Lab" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fat %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Protein %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Net Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        filteredRecords.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 10, className: "text-center text-muted-foreground py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-7 h-7 mx-auto mb-2 opacity-40" }),
          "No milk collection records ",
          yearFilter !== "all" ? `for ${yearFilter}` : "yet",
          "."
        ] }) }),
        filteredRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.collectionDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.volumeLitres ? parseFloat(r.volumeLitres).toLocaleString() : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheepSccBadge, { v: r.sccCount }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AbrBadge, { result: r.antibioticResidueTestResult }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(LabResultsBadge, { status: r.buyerLabResultsStatus }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.fatPercentage ? `${r.fatPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.proteinPercentage ? `${r.proteinPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.isOrganicCollection ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-100", children: r.isOrganicCollection ? "Organic" : "Non-organic" }),
            !r.isOrganicCollection && r.nonOrganicReason && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-700 truncate max-w-[100px]", title: r.nonOrganicReason, children: r.nonOrganicReason })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatPence(r.netValuePence) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Milk Collection — ",
        fmt(viewRec.collectionDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collection Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.collectionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Volume (litres)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.volumeLitres) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Collector" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.collectorName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Vehicle Reg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.vehicleRegistration) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Temperature" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.milkTemperatureCelsius ? `${viewRec.milkTemperatureCelsius} °C` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AbrBadge, { result: viewRec.antibioticResidueTestResult }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "SCC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheepSccBadge, { v: viewRec.sccCount }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "TBC (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.tbcCount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Fat %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.fatPercentage ? `${viewRec.fatPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Protein %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.proteinPercentage ? `${viewRec.proteinPercentage}%` : "—" })
        ] }),
        viewRec.lactosePercentage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lactose %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            viewRec.lactosePercentage,
            "%"
          ] })
        ] }),
        viewRec.abrTestedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "ABR Tested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.abrTestedBy })
        ] }),
        viewRec.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Retest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-amber-700", children: [
            "Follow-up retest ",
            viewRec.retestOfId ? `of record #${viewRec.retestOfId}` : ""
          ] })
        ] }),
        viewRec.buyerLabResultsStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Buyer Lab Results — ",
            viewRec.buyerLabResultsStatus
          ] }) }),
          viewRec.buyerLabResultsDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Results Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.buyerLabResultsDate) })
          ] }),
          viewRec.buyerLabRef && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Lab Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.buyerLabRef })
          ] }),
          viewRec.buyerSccCount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer SCC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewRec.buyerSccCount.toLocaleString(),
              " k/mL"
            ] })
          ] }),
          viewRec.buyerFatPercentage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Buyer Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              viewRec.buyerFatPercentage,
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Certified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.isOrganicCollection ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "Yes — sold as organic" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-700", children: "No — sold as conventional" }) })
        ] }),
        !viewRec.isOrganicCollection && viewRec.nonOrganicReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Non-organic Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-amber-800", children: viewRec.nonOrganicReason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Premium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatPence(viewRec.organicPremiumPence) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: formatPence(viewRec.netValuePence) })
        ] }),
        viewRec.witnessedBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Witnessed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.witnessedBy })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Attachments — documents & buyer lab report" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-sheep-dairy-collection", recordId: viewRec.id })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Collection" : "Add Milk Collection" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Record each milk collection with quality metrics and organic certification status." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: formTab, onValueChange: setFormTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "collection", children: "Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "quality", children: "Quality & ABR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "buyer", children: "Buyer Lab" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "collection", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.collectionDate ?? "").slice(0, 10), onChange: f("collectionDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Volume (litres) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.volumeLitres ?? "", onChange: f("volumeLitres") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collector Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectorName ?? "", onChange: f("collectorName") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vehicle Registration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.vehicleRegistration ?? "", onChange: f("vehicleRegistration") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Processor Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.processorRef ?? "", onChange: f("processorRef") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Collection Docket Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.collectionSlipRef ?? "", onChange: f("collectionSlipRef") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic Premium (pence)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.organicPremiumPence ?? "", onChange: (e) => set("organicPremiumPence", e.target.value ? Number(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Value (pence)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.netValuePence ?? "", onChange: (e) => set("netValuePence", e.target.value ? Number(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Witnessed By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.witnessedBy ?? "", onChange: f("witnessedBy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isOrganicCollection ?? true, onCheckedChange: (v) => setForm((p) => ({ ...p, isOrganicCollection: !!v, nonOrganicReason: !!v ? null : p.nonOrganicReason })), id: "organic-col" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "organic-col", className: "cursor-pointer font-normal", children: "This collection is certified as Organic" })
          ] }),
          !form.isOrganicCollection && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-amber-700", children: "Reason — non-organic collection *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nonOrganicReason ?? "", onChange: f("nonOrganicReason"), placeholder: "e.g. Antibiotic withdrawal period, conversion milk…", className: "border-amber-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "Required. Notify your certifier if this occurs regularly." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 2 })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "quality", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.milkTemperatureCelsius ?? "", onChange: f("milkTemperatureCelsius"), placeholder: "e.g. 4.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Target: ≤6°C at collection" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temp Tested By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "sheep-dairy-staff-list", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "sheep-dairy-staff-list", placeholder: "Name of tester", value: form.tempTestedBy ?? "", onChange: f("tempTestedBy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.antibioticResidueTestResult ?? "__none__", onValueChange: (v) => set("antibioticResidueTestResult", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select result…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not tested —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "negative", children: "Negative" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "positive", children: "Positive ⚠" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "borderline", children: "Borderline — repeat required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invalid", children: "Invalid — repeat required" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "not-tested", children: "Not tested" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Tested By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "sheep-dairy-staff-list", placeholder: "Name of tester", value: form.abrTestedBy ?? "", onChange: f("abrTestedBy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Kit Lot" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abrTestKitLot ?? "", onChange: f("abrTestKitLot"), placeholder: "Lot number" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "ABR Test Kit Batch" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.abrTestKitBatch ?? "", onChange: f("abrTestKitBatch"), placeholder: "Batch / expiry" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isRetest ?? false, onCheckedChange: (v) => set("isRetest", !!v), id: "is-retest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is-retest", className: "cursor-pointer font-normal", children: "This is a follow-up retest of a previous non-negative result" })
          ] }),
          form.isRetest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retest of (original record)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.retestOfId ? String(form.retestOfId) : "__none__", onValueChange: (v) => set("retestOfId", v === "__none__" ? null : Number(v)), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select original record…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None selected —" }),
                records.filter((r) => r.id !== editing?.id && (r.antibioticResidueTestResult === "positive" || r.antibioticResidueTestResult === "borderline" || r.antibioticResidueTestResult === "invalid")).slice(0, 40).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                  fmt(r.collectionDate),
                  " — ABR ",
                  r.antibioticResidueTestResult
                ] }, r.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccCount ?? "", onChange: (e) => set("sccCount", e.target.value ? Number(e.target.value) : null) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "UK limit: 1,500k" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "TBC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.tbcCount ?? "", onChange: (e) => set("tbcCount", e.target.value ? Number(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.fatPercentage ?? "", onChange: f("fatPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.proteinPercentage ?? "", onChange: f("proteinPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lactose %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.lactosePercentage ?? "", onChange: f("lactosePercentage") })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "buyer", className: "space-y-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 rounded-md border border-blue-100 bg-blue-50 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-800", children: "Buyer lab results are the processor's independent measurements. Enter them when you receive the results report." }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lab Results Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.buyerLabResultsStatus ?? "__none__", onValueChange: (v) => set("buyerLabResultsStatus", v === "__none__" ? null : v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not received —" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pass", children: "Pass" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fail", children: "Fail" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Pending" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Results Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.buyerLabResultsDate ?? "").slice(0, 10), onChange: f("buyerLabResultsDate") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.buyerLabRef ?? "", onChange: f("buyerLabRef"), placeholder: "Buyer's lab report reference" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer SCC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerSccCount ?? "", onChange: (e) => set("buyerSccCount", e.target.value ? Number(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer TBC (k/mL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.buyerTbcCount ?? "", onChange: (e) => set("buyerTbcCount", e.target.value ? Number(e.target.value) : null) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Fat %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerFatPercentage ?? "", onChange: f("buyerFatPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerProteinPercentage ?? "", onChange: f("buyerProteinPercentage") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Buyer Lactose %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.buyerLactosePercentage ?? "", onChange: f("buyerLactosePercentage") })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: [
          save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
function FeedNutritionTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRec, setViewRec] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const { data, isLoading } = useQuery({
    queryKey: ["org-sheep-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const nonOrganicCount = records.filter((r) => !r.isOrganicApproved).length;
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-sheep-dairy/feed/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-feed", farmId] });
      toast({ title: "Record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function openNew() {
    setEditing(null);
    setForm({ isOrganicApproved: true, recordDate: today() });
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm(r);
    setOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    nonOrganicCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        nonOrganicCount,
        " feed record",
        nonOrganicCount !== 1 ? "s" : "",
        " marked as non-organic approved. Monitor total organic DM — target ≥95%."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Add Feed Record"
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Feed Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Qty (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "DM (kg)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Organic %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No feed records yet." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.recordDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.feedProductName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.feedType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.quantityKg ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.dryMatterKg ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.organicPercentage ? `${r.organicPercentage}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.isOrganicApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", children: r.isOrganicApproved ? "Yes" : "No" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => setViewRec(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    viewRec && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRec(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Feed Record — ",
        viewRec.feedProductName
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.recordDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.feedType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feed Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.feedProductName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.supplier) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.supplierApprovalNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Dry Matter (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.dryMatterKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.organicPercentage ? `${viewRec.organicPercentage}%` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.isOrganicApproved ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.poReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.grnReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.certifierApprovalRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Derogation Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.derogationReference) })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-sheep-dairy-feed", recordId: viewRec.id }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRec);
          setViewRec(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRec(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          editing ? "Edit" : "Add",
          " Feed Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Log feed given to the dairy flock. All feed must be ≥95% certified organic dry matter." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.recordDate ?? "").slice(0, 10), onChange: f("recordDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.feedType ?? "__none__", onValueChange: (v) => setForm((p) => ({ ...p, feedType: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEED_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feed Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.feedProductName ?? "", onChange: f("feedProductName"), placeholder: "e.g. Organic Ewe Concentrate" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplier ?? "", onChange: f("supplier") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supplier Approval No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.supplierApprovalNumber ?? "", onChange: f("supplierApprovalNumber") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.quantityKg ?? "", onChange: f("quantityKg") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dry Matter (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.dryMatterKg ?? "", onChange: f("dryMatterKg") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Organic % of DM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", max: "100", value: form.organicPercentage ?? "", onChange: f("organicPercentage") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Target ≥95%" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.isOrganicApproved ?? true, onCheckedChange: (v) => setForm((p) => ({ ...p, isOrganicApproved: !!v })), id: "feed-approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "feed-approved", className: "cursor-pointer font-normal", children: "Certifier-approved organic feed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.poReference ?? "", onChange: f("poReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "GRN Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.grnReference ?? "", onChange: f("grnReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifier Approval Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.certifierApprovalRef ?? "", onChange: f("certifierApprovalRef") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Derogation Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.derogationReference ?? "", onChange: f("derogationReference") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: !form.feedType || !form.feedProductName || save.isPending, children: [
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
  const blank = { incidentDate: today(), labSampleTaken: false, chronicCase: false, culledDueToMastitis: false, certifierNotified: false };
  const [form, setForm] = reactExports.useState(blank);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const { data, isLoading } = useQuery({ queryKey: ["sheep-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-dairy/mastitis-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const uncertifiedCount = records.filter((r) => r.treatmentProduct && !r.certifierNotified).length;
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
  const mastiYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.incidentDate || "").slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [records]);
  const [mastiYear, setMastiYear] = reactExports.useState("all");
  const filtered = reactExports.useMemo(() => mastiYear === "all" ? records : records.filter((r) => String(r.incidentDate || "").startsWith(mastiYear)), [records, mastiYear]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic rule:" }),
      " All withdrawal periods for mastitis treatments must be DOUBLED. Record both standard and doubled milk withdrawal days. Notify your certifier of any antibiotic use."
    ] }),
    uncertifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        uncertifiedCount,
        " treated case",
        uncertifiedCount !== 1 ? "s" : "",
        " where certifier has not been notified."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Mastitis Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mastiYear, onValueChange: setMastiYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            mastiYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm(blank);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mastitis records yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ewe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Quarter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dbl Milk W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.incidentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.eweLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.quarterAffected || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.treatmentProduct || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.doubledMilkWithdrawalDays != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [
          r.doubledMilkWithdrawalDays,
          "d"
        ] }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : r.treatmentProduct ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500", children: r.certifierNotified ? "Notified" : r.treatmentProduct ? "Pending" : "N/A" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          r.outcome || "Ongoing",
          r.chronicCase ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-amber-600", children: "Chronic" }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.treatmentProduct || "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.treatmentDurationDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.standardMilkWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-blue-800", children: viewRec.doubledMilkWithdrawalDays ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk Withheld Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.milkWithdrawnUntil) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.certifierNotified ? "Yes" : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Outcome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.outcome || "Ongoing" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Attending Vet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.attendingVet || "—" })
        ] }),
        viewRec.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.notes })
        ] })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.treatmentProduct || "", onChange: (e) => set("treatmentProduct", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Duration (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.treatmentDurationDays || "", onChange: (e) => set("treatmentDurationDays", e.target.value ? parseInt(e.target.value) : null) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "⚠ Organic — Doubled Withdrawal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMilkWithdrawalDays || "", onChange: (e) => {
            const v = e.target.value ? parseInt(e.target.value) : null;
            set("standardMilkWithdrawalDays", v);
            set("doubledMilkWithdrawalDays", v ? v * 2 : null);
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-700", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledMilkWithdrawalDays || "", onChange: (e) => set("doubledMilkWithdrawalDays", e.target.value ? parseInt(e.target.value) : null), className: "border-blue-300" })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex flex-wrap gap-4", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.certifierNotified, onCheckedChange: (v) => set("certifierNotified", !!v), id: "masti-cert-sheep" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "masti-cert-sheep", className: "cursor-pointer font-normal", children: "Certifier has been notified of this antibiotic treatment" })
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
    queryKey: ["org-sheep-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const uncertifiedCount = records.filter((r) => !r.certifierNotified).length;
  function autoDoubled(stdDays) {
    if (!stdDays) return null;
    return stdDays * 2;
  }
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Treatment recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-sheep-dairy/treatments/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sheep-treatments", farmId] });
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic rule:" }),
      " Statutory withdrawal periods must be DOUBLED for all veterinary treatments on organic animals. Record both the standard and doubled periods below."
    ] }),
    uncertifiedCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        uncertifiedCount,
        " treatment",
        uncertifiedCount !== 1 ? "s" : "",
        " where certifier has not been notified."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
      "Add Treatment"
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Animal LIS Tags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dbl Milk W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Milk W/D End" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cert Notified" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        records.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-8", children: "No treatment records yet." }) }),
        records.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.treatmentDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs max-w-[120px] truncate", children: r.animalLisTags || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.productName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.doubledMilkWithdrawalDays != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [
            r.doubledMilkWithdrawalDays,
            "d"
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: fmt(r.milkWithdrawalEndDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: r.certifierNotified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800", children: r.certifierNotified ? "Yes" : "Pending" }) }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2", children: "⚠ Organic — Doubled Withdrawal Periods" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.standardMilkWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-blue-800 font-bold", children: fmtRaw(viewRec.doubledMilkWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Standard Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.standardMeatWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doubled Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-blue-800 font-bold", children: fmtRaw(viewRec.doubledMeatWithdrawalDays) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Milk W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.milkWithdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meat W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRec.meatWithdrawalEndDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifier Notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.certifierNotified ? "Yes" : "No — pending notification" })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Treatment" : "Record Vet Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "All withdrawal periods must be DOUBLED for organic animals under UK Organic Regulations." })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-blue-700 uppercase tracking-wide", children: "⚠ Doubled Withdrawal Periods" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMilkWithdrawalDays ?? "", onChange: (e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            setForm((p) => ({ ...p, standardMilkWithdrawalDays: v, doubledMilkWithdrawalDays: autoDoubled(v) }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-700", children: "Doubled Milk W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledMilkWithdrawalDays ?? "", onChange: (e) => setForm((p) => ({ ...p, doubledMilkWithdrawalDays: e.target.value ? Number(e.target.value) : null })), className: "border-blue-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.standardMeatWithdrawalDays ?? "", onChange: (e) => {
            const v = e.target.value ? Number(e.target.value) : null;
            setForm((p) => ({ ...p, standardMeatWithdrawalDays: v, doubledMeatWithdrawalDays: autoDoubled(v) }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-blue-700", children: "Doubled Meat W/D (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.doubledMeatWithdrawalDays ?? "", onChange: (e) => setForm((p) => ({ ...p, doubledMeatWithdrawalDays: e.target.value ? Number(e.target.value) : null })), className: "border-blue-300" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Milk W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.milkWithdrawalEndDate ?? "").slice(0, 10), onChange: f("milkWithdrawalEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meat W/D End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.meatWithdrawalEndDate ?? "").slice(0, 10), onChange: f("meatWithdrawalEndDate") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.certifierNotified ?? false, onCheckedChange: (v) => setForm((p) => ({ ...p, certifierNotified: !!v })), id: "cert-notified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cert-notified", className: "cursor-pointer font-normal", children: "Certifier has been notified of this treatment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: f("notes"), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
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
      const tupping = await res.json();
      const cidrUsed2 = body.progesteroneUsed === "true" || body.progesteroneUsed === true;
      if (cidrUsed2 && body.cidrProductName) {
        const adminDate = body.cidrAdminDate || body.tuppingStartDate;
        const wdDays = parseInt(String(body.cidrWithdrawalDays ?? "1")) || 1;
        const doubledWd = parseInt(String(body.cidrDoubledWd ?? String(wdDays * 2))) || wdDays * 2;
        const wdEnd = adminDate ? new Date(new Date(String(adminDate)).getTime() + doubledWd * 864e5).toISOString().slice(0, 10) : null;
        await fetch(api(`farms/${farmId}/medicine-records`), {
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
            doubledWithdrawalDays: doubledWd,
            withdrawalEndDate: wdEnd,
            organicWithdrawalEndDate: wdEnd,
            isOrganicTreatment: true,
            certifierNotified: body.certifierNotified === "true",
            reason: body.cidrTherapeuticReason ? `Therapeutic: ${String(body.cidrTherapeuticReason)}` : "Progesterone/CIDR — organic therapeutic use",
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""} | Rx ref: ${body.cidrPrescriptionRef || "—"} | Practice: ${body.cidrVetPractice || "—"} | ORGANIC: doubled withdrawal applied`,
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
      if (cidrUsed2 && body.createVetVisit === "true" && body.cidrPrescribingVet) {
        await fetch(api(`farms/${farmId}/vet-visits`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            visitDate: body.cidrAdminDate || body.tuppingStartDate,
            vetName: body.cidrPrescribingVet,
            vetPractice: body.cidrVetPractice || null,
            reasonForVisit: "POM-V prescription — Progesterone/CIDR (organic therapeutic use)",
            treatmentsCarriedOut: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || "?"} ewes. Therapeutic: ${body.cidrTherapeuticReason || "not specified"}`,
            prescriptionsIssued: body.cidrPrescriptionRef || null,
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Organic — doubled withdrawal applied`
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
      }
      if (cidrUsed2 && body.cidrCostGbp && parseFloat(String(body.cidrCostGbp)) > 0) {
        await fetch(api(`farms/${farmId}/financial-transactions`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            transactionType: "expense",
            category: "Veterinary & Medicine",
            description: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || ""} ewes [ORGANIC] (tupping ${body.tuppingStartDate})`,
            amountPence: Math.round(parseFloat(String(body.cidrCostGbp)) * 100),
            transactionDate: body.cidrAdminDate || body.tuppingStartDate,
            reference: body.cidrPrescriptionRef || null,
            vendorCustomer: body.cidrVetPractice || null,
            notes: "Auto-created from organic tupping record (CIDR/Progesterone cost)"
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
  const cidrUsed = form.progesteroneUsed === "true";
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.progesteroneUsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700 border border-red-200 text-xs font-medium", children: "CIDR / Prog. ⚠" }) : null }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewing.progesteroneUsed ? "Yes — organic compliance fields recorded" : "No" })
        ] }),
        viewing.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtV(viewing.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewing(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-amber-50 border-amber-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.progesteroneUsed === "true", onCheckedChange: (v) => sf("progesteroneUsed", v ? "true" : "false"), id: "prog-organic" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "prog-organic", className: "cursor-pointer font-normal text-amber-800", children: [
            "Progesterone / CIDR used — ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "organic compliance required" })
          ] })
        ] }),
        cidrUsed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-700 uppercase tracking-wide", children: "⚠ Organic CIDR/Progesterone — POM-V & Compliance Fields" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Therapeutic Reason (required for organic use)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrTherapeuticReason ?? "", onChange: (e) => sf("cidrTherapeuticReason", e.target.value), placeholder: "e.g. Synchronise lambing to reduce exposure period" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CIDR Product Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrProductName ?? "", onChange: (e) => sf("cidrProductName", e.target.value), placeholder: "e.g. CIDR Sheep" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrBatchNumber ?? "", onChange: (e) => sf("cidrBatchNumber", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dose per Ewe" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrDosePerEwe ?? "1 device per ewe", onChange: (e) => sf("cidrDosePerEwe", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Route" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrRoute ?? "Intravaginal", onChange: (e) => sf("cidrRoute", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Admin Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.cidrAdminDate ?? "", onChange: (e) => sf("cidrAdminDate", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Administered By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrAdministeredBy ?? "", onChange: (e) => sf("cidrAdministeredBy", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescribing Vet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrPrescribingVet ?? "", onChange: (e) => sf("cidrPrescribingVet", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vet Practice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrVetPractice ?? "", onChange: (e) => sf("cidrVetPractice", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prescription Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cidrPrescriptionRef ?? "", onChange: (e) => sf("cidrPrescriptionRef", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Standard W/D (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.cidrWithdrawalDays ?? "", onChange: (e) => sf("cidrWithdrawalDays", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-red-700", children: "Doubled W/D (days)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.cidrDoubledWd ?? (form.cidrWithdrawalDays ? String(parseInt(form.cidrWithdrawalDays) * 2) : ""), onChange: (e) => sf("cidrDoubledWd", e.target.value), className: "border-red-300" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CIDR Cost (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.cidrCostGbp ?? "", onChange: (e) => sf("cidrCostGbp", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.certifierNotified === "true", onCheckedChange: (v) => sf("certifierNotified", v ? "true" : "false"), id: "cert-notified-tup" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cert-notified-tup", className: "cursor-pointer font-normal", children: "Certifier has been notified of this POM-V treatment" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.createVetVisit === "true", onCheckedChange: (v) => sf("createVetVisit", v ? "true" : "false"), id: "create-vet-visit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "create-vet-visit", className: "cursor-pointer font-normal", children: "Also create a vet visit record for this prescription" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => sf("notes", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
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
export {
  OrganicSheepDairyPage as default
};
