import { b as useAppStore, j as jsxRuntimeExports, R as Redirect, c as useQueryClient, a as useToast, r as reactExports, m as useQuery, O as useMutation, d as Button, S as Plus, e as LoaderCircle, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, J as DialogFooter, H as DialogDescription, L as Label, I as Input, C as Checkbox, n as Card, o as CardContent } from "./index-DVLmDWC2.js";
import { u as usePersistedTab } from "./use-persisted-tab-B8-Filjx.js";
import { A as AppLayout } from "./AppLayout-_QuEIfFO.js";
import { T as TabBar, a as TabButton } from "./tab-button-DN3Mr3Ae.js";
import { T as Textarea } from "./textarea-NLh4AyYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Bqg47AAh.js";
import { B as Badge } from "./badge-Cc7yjmv1.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DAgiMgVc.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CIT2hYHK.js";
import { BcsTab, BulkTankTab, CaeTab, AssuranceTab } from "./GoatDairyPage-DGUuxroU.js";
import { S as SccEquipmentSection, D as DairySuppliesTab } from "./DairyPage-DCtF8-Qx.js";
import { A as AbrProcurementSection } from "./DairyEnterpriseReport-D40yMt2Q.js";
import { R as RecordAttachments } from "./RecordAttachments-B84TRvTX.js";
import { E as Eye } from "./eye-DnxS1C5V.js";
import { P as Pencil } from "./pencil-5ot7GL7H.js";
import { T as Trash2 } from "./trash-2-DPG_8K1C.js";
import { T as TriangleAlert } from "./triangle-alert-z_k2VG2T.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-Dr0Az8pD.js";
import { C as ComposedChart } from "./ComposedChart-CEb9Dwtv.js";
import { C as CartesianGrid } from "./CartesianGrid-q7IX4Tko.js";
import { L as Line } from "./Line-RCiPjOTx.js";
import { P as Printer } from "./printer-BsFhbDWe.js";
import { D as Droplets } from "./shield-alert-Ci1t6zBm.js";
import "./use-safe-clerk-eMz4j3jP.js";
import "./database-mBO4uPoX.js";
import "./shield-check-D8GuLxav.js";
import "./tractor-DhwZUwdx.js";
import "./index-Cak4S45l.js";
import "./index-hPG4LFWT.js";
import "./chevron-up-SvSvOet6.js";
import "./index-BV4SOASX.js";
import "./DocAttach-CAux9OtL.js";
import "./use-upload-X1FxZDEI.js";
import "./upload-Bizb3aXD.js";
import "./LineChart-DiobS4EP.js";
import "./circle-check-BcYiKVWa.js";
import "./BarChart-C7fxPdgE.js";
import "./PieChart-DZpLE3Z9.js";
import "./paperclip-B8ZzcLeY.js";
import "./image-CccmHbVD.js";
import "./download-C149Fli_.js";
import "./RaiseTaskDialog-DR5Je2Yj.js";
import "./index-B0ZKFPzx.js";
import "./use-farm-members-CG4rXDuZ.js";
import "./staff-select-BSeLZBCo.js";
import "./print-report-B_FwCCVJ.js";
import "./vmdMedicines-mq70NSvP.js";
import "./shopping-cart-D5Ph1_11.js";
import "./circle-x-CtVuFjx7.js";
import "./file-down-BiwqfEHC.js";
import "./trending-down-Bl5ir-ls.js";
import "./chevron-left-BOVGsooX.js";
import "./sparkles-ByDdJ12j.js";
import "./chart-no-axes-column-BYGsrJWu.js";
import "./receipt-BTFQ6lkx.js";
import "./thermometer-BoH83r_T.js";
import "./chevrons-up-down-BFponSpW.js";
import "./badge-check-CKHSkqto.js";
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
function GoatSccBadge({ v }) {
  if (!v) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "—" });
  const ok = v < 500;
  const warn = v >= 500 && v < 1e3;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? "bg-green-100 text-green-800" : warn ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`, children: [
    v.toLocaleString(),
    " k/mL ",
    v >= 1e3 ? "⚠ Exceeds limit" : ""
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
const FEED_TYPES = ["Concentrate", "Grass Silage", "Hay", "Haylage", "Grazed Grass", "Straw", "Root Crops / Beet", "Minerals & Supplements", "Browse / Hedgerow", "Other"];
const PRODUCT_CATEGORIES = ["Antibiotic", "NSAID", "Anthelmintic", "Antiparasitic", "Vaccine", "Homeopathic", "Other"];
const ROUTES_OF_ADMINISTRATION = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intravenous (IV)", "Oral", "Intramammary", "Topical", "Other"];
const GOAT_DAIRY_TAB_IDS = ["conversion", "collections", "feed", "treatments", "mastitis", "kidding", "bcs", "tank", "cae", "assurance", "abr-kit", "scc-equipment", "supplies"];
function OrganicGoatDairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "organic-goat-dairy", farmId, validIds: GOAT_DAIRY_TAB_IDS, defaultTab: "conversion" });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/select" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Organic Goat Dairy", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-50 text-green-700 border border-green-200 rounded-full", children: "🌿 Organic" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Organic Goat Dairy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Organic certification for dairy goats — flock conversion register, organic milk collection log with non-organic reason tracking, feed & nutrition (≥95% organic DM target), and vet treatment register with doubled withdrawal periods (SA/OF&G/Biodynamic certified flocks). CAE monitoring continues via the standard Goat Dairy module." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "conversion", onClick: () => setTab("conversion"), children: "Flock Conversion" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "collections", onClick: () => setTab("collections"), children: "Milk Collections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "feed", onClick: () => setTab("feed"), children: "Feed & Nutrition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "treatments", onClick: () => setTab("treatments"), children: "Vet Treatments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "mastitis", onClick: () => setTab("mastitis"), children: "Mastitis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "kidding", onClick: () => setTab("kidding"), children: "Kidding Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "bcs", onClick: () => setTab("bcs"), children: "Body Condition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "tank", onClick: () => setTab("tank"), children: "Bulk Tank" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "cae", onClick: () => setTab("cae"), children: "CAE Monitoring" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assurance", onClick: () => setTab("assurance"), children: "Assurance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "abr-kit", onClick: () => setTab("abr-kit"), children: "ABR Kit Stock" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "scc-equipment", onClick: () => setTab("scc-equipment"), children: "SCC Equipment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "supplies", onClick: () => setTab("supplies"), children: "Supplies" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "conversion" && /* @__PURE__ */ jsxRuntimeExports.jsx(FlockConversionTab, { farmId }),
      tab === "collections" && /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicCollectionsTab, { farmId }),
      tab === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedNutritionTab, { farmId }),
      tab === "treatments" && /* @__PURE__ */ jsxRuntimeExports.jsx(TreatmentRegisterTab, { farmId }),
      tab === "mastitis" && /* @__PURE__ */ jsxRuntimeExports.jsx(MastitisTab, { farmId }),
      tab === "kidding" && /* @__PURE__ */ jsxRuntimeExports.jsx(KiddingTab, { farmId }),
      tab === "bcs" && /* @__PURE__ */ jsxRuntimeExports.jsx(BcsTab, { farmId }),
      tab === "tank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkTankTab, { farmId }),
      tab === "cae" && /* @__PURE__ */ jsxRuntimeExports.jsx(CaeTab, { farmId }),
      tab === "assurance" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssuranceTab, {}),
      tab === "abr-kit" && /* @__PURE__ */ jsxRuntimeExports.jsx(AbrProcurementSection, { farmId }),
      tab === "scc-equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(SccEquipmentSection, { farmId, species: "goat" }),
      tab === "supplies" && /* @__PURE__ */ jsxRuntimeExports.jsx(DairySuppliesTab, { farmId, dairyType: "organic-goat" })
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
    queryKey: ["org-goat-flock-conv", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-flock-conv", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Flock added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-goat-dairy/flock-conversion/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-flock-conv", farmId] });
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Does" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.numberOfDoes ?? "—" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Number of Does" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtRaw(viewRec.numberOfDoes) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Flock Conversion" : "Add Flock Conversion Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Track your flock's organic conversion status and certification details." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flock Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.flockName ?? "", onChange: f("flockName"), placeholder: "e.g. Home Flock — Alpine Does" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Breed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.breed ?? "", onChange: f("breed"), placeholder: "e.g. British Alpine, Saanen" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of Does" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.numberOfDoes ?? "", onChange: (e) => setForm((p) => ({ ...p, numberOfDoes: e.target.value ? Number(e.target.value) : null })) })
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
    queryKey: ["org-goat-collections", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/collections`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const { data: membersData } = useQuery({
    queryKey: ["farm-members-goat-dairy", farmId],
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
      return fetch(api(`farms/${farmId}/organic-goat-dairy/collections${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, abrKitStockId: abrKitStockId || void 0 })
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-collections", farmId] });
      qc.invalidateQueries({ queryKey: ["dairy-abr-stock", farmId] });
      setOpen(false);
      setAbrKitStockId("");
      toast({ title: editing ? "Record updated" : "Collection added" });
    },
    onError: (e) => toast({ title: e.message || "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-goat-dairy/collections/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-collections", farmId] });
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
    w.document.write(`<html><head><title>Organic Goat Milk Collections</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left}th{background:#f5f5f5}h2{font-size:14px}</style></head><body><h2>Organic Goat Milk Collection Log${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Volume (L)</th><th>Collector</th><th>ABR</th><th>Temp (°C)</th><th>SCC (k/mL)</th><th>Fat%</th><th>Protein%</th><th>Organic</th><th>Net Value</th></tr></thead><tbody>${filteredRecords.map((r) => `<tr><td>${r.collectionDate}</td><td>${parseFloat(r.volumeLitres || "0").toLocaleString()}</td><td>${r.collectorName || "—"}</td><td>${r.antibioticResidueTestResult || "—"}</td><td>${r.milkTemperatureCelsius || "—"}</td><td>${r.sccCount || "—"}</td><td>${r.fatPercentage || "—"}</td><td>${r.proteinPercentage || "—"}</td><td>${r.isOrganicCollection ? "Organic" : "Non-organic"}</td><td>${r.netValuePence != null ? "£" + (r.netValuePence / 100).toFixed(2) : "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${avgScc == null ? "text-gray-400" : avgScc > 1e3 ? "text-red-700" : avgScc > 500 ? "text-amber-700" : "text-green-700"}`, children: avgScc != null ? avgScc.toLocaleString() : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Limit: 1,000k" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: "Organic goat regulatory SCC limit: 1,000k cells/mL" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoatSccBadge, { v: r.sccCount }) }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoatSccBadge, { v: viewRec.sccCount }) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-goat-dairy-collection", recordId: viewRec.id })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl max-h-[90vh] overflow-y-auto", children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "goat-dairy-staff-list", children: staffNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n }, n)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "goat-dairy-staff-list", placeholder: "Name of tester", value: form.tempTestedBy ?? "", onChange: f("tempTestedBy") })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { list: "goat-dairy-staff-list", placeholder: "Name of tester", value: form.abrTestedBy ?? "", onChange: f("abrTestedBy") })
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "UK limit: 1,000k" })
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
    queryKey: ["org-goat-feed", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/feed`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const nonOrganicCount = records.filter((r) => !r.isOrganicApproved).length;
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/feed${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-feed", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Record added" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-goat-dairy/feed/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-feed", farmId] });
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "organic-goat-dairy-feed", recordId: viewRec.id }) })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.feedProductName ?? "", onChange: f("feedProductName"), placeholder: "e.g. Organic Milking Goat Blend" })
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
  const { data, isLoading } = useQuery({ queryKey: ["goat-dairy-mastitis", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-dairy/mastitis-records`)).then((r) => r.json()) });
  const records = data?.records ?? [];
  const uncertifiedCount = records.filter((r) => r.treatmentProduct && !r.certifierNotified).length;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Half" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Dbl Milk W/D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Certifier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.incidentDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.doeLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.halfAffected || "—" }),
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.pathogenIdentified || "", onChange: (e) => set("pathogenIdentified", e.target.value), placeholder: "e.g. Staph. aureus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Lab Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.labRef || "", onChange: (e) => set("labRef", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "SCC at Onset (k/mL)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.sccAtOnset || "", onChange: (e) => set("sccAtOnset", e.target.value ? parseInt(e.target.value) : null) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "UK limit: 1,000k" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.certifierNotified, onCheckedChange: (v) => set("certifierNotified", !!v), id: "masti-cert-goat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "masti-cert-goat", className: "cursor-pointer font-normal", children: "Certifier has been notified of this antibiotic treatment" })
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
function OrgEaseScoreBadge({ v }) {
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
  const blank = { kiddingDate: today(), birthOutcome: "live-single", kidCount: 1, assistanceRequired: false, vetAttended: false, eidApplied: false, colostrumFromOrganicDoe: true, organicStatusConfirmed: false };
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
  const kiddingYears = reactExports.useMemo(() => Array.from(new Set(records.map((r) => String(r.kiddingDate || "").slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a)), [records]);
  const [kiddingYearFilter, setKiddingYearFilter] = reactExports.useState("all");
  const filteredKidding = reactExports.useMemo(() => kiddingYearFilter === "all" ? records : records.filter((r) => String(r.kiddingDate || "").startsWith(kiddingYearFilter)), [records, kiddingYearFilter]);
  const liveCount = filteredKidding.reduce((s, r) => s + (r.birthOutcome?.includes("live") ? r.kidCount || 1 : 0), 0);
  const pendingEid = filteredKidding.filter((r) => !r.eidApplied && r.birthOutcome?.includes("live")).length;
  const colostrumRisk = filteredKidding.filter((r) => r.birthOutcome?.includes("live") && r.colostrumGivenWithin2Hours === false).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic welfare:" }),
      " Colostrum must be given within 2 hours of birth. Colostrum should come from the organic doe where possible. Record organic status confirmation for each kidding."
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
    colostrumRisk > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        colostrumRisk,
        " birth",
        colostrumRisk !== 1 ? "s" : "",
        " where colostrum was NOT given within 2 hours — organic welfare concern."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Kidding Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: kiddingYearFilter, onValueChange: setKiddingYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-32 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            kiddingYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
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
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin text-gray-400" }) }) : filteredKidding.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-gray-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No kidding records yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Doe LIS Tag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kids" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ease" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Col ≤2h" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "EID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filteredKidding.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: fmt(r.kiddingDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.doeLisTag || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "capitalize", children: r.birthOutcome?.replace(/-/g, " ") || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
          r.kidCount ?? 1,
          " × ",
          r.kidSex || "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrgEaseScoreBadge, { v: r.easeScore }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.colostrumGivenWithin2Hours === true ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800", children: "Yes ✓" }) : r.colostrumGivenWithin2Hours === false ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700", children: "No ⚠" }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.eidApplied ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-medium text-xs", children: "✓" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 text-xs", children: "Pending" }) }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrgEaseScoreBadge, { v: viewRec.easeScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum ≤2h" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.colostrumGivenWithin2Hours === true ? "Yes ✓" : viewRec.colostrumGivenWithin2Hours === false ? "No ⚠" : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Colostrum from Organic Doe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.colostrumFromOrganicDoe === true ? "Yes" : viewRec.colostrumFromOrganicDoe === false ? "No — note reason" : "—" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Organic Status Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.organicStatusConfirmed ? "Yes" : "Pending" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe Milking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium capitalize", children: viewRec.doeMilkingStatus || "—" })
        ] }),
        viewRec.doeComplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Doe Complications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRec.doeComplications })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "rounded", checked: !!form.eidApplied, onChange: (e) => set("eidApplied", e.target.checked), id: "gd-eid-org" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "gd-eid-org", className: "text-sm cursor-pointer", children: "EID tag applied" }),
          form.eidApplied && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "ml-2 w-40", value: String(form.eidAppliedDate || "").slice(0, 10), onChange: (e) => set("eidAppliedDate", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-700 uppercase tracking-wide mb-2", children: "⚠ Organic Welfare — Colostrum" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum Given ≤2h *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumGivenWithin2Hours == null ? "__none__" : form.colostrumGivenWithin2Hours ? "yes" : "no", onValueChange: (v) => set("colostrumGivenWithin2Hours", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes ✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No ⚠" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Colostrum from Organic Doe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.colostrumFromOrganicDoe == null ? "__none__" : form.colostrumFromOrganicDoe ? "yes" : "no", onValueChange: (v) => set("colostrumFromOrganicDoe", v === "__none__" ? null : v === "yes"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "yes", children: "Yes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no", children: "No — note reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not recorded" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-3 rounded-md border px-3 py-2 bg-green-50 border-green-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.organicStatusConfirmed, onCheckedChange: (v) => set("organicStatusConfirmed", !!v), id: "org-status-kid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "org-status-kid", className: "cursor-pointer font-normal text-green-800", children: "Organic status of this birth confirmed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t col-span-2 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2", children: "Doe" }) }),
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
    queryKey: ["org-goat-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments`)).then((r) => r.json())
  });
  const records = data?.records ?? [];
  const uncertifiedCount = records.filter((r) => !r.certifierNotified).length;
  function autoDoubled(stdDays) {
    if (!stdDays) return null;
    return stdDays * 2;
  }
  const save = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments${editing ? `/${editing.id}` : ""}`), {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-treatments", farmId] });
      setOpen(false);
      toast({ title: editing ? "Record updated" : "Treatment recorded" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const remove = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/organic-goat-dairy/treatments/${id}`), { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-goat-treatments", farmId] });
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
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
export {
  OrganicGoatDairyPage as default
};
